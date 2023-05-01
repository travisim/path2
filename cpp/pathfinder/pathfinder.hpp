#include "../nadeau.hpp"
#include "helper.hpp"
#include "enums.hpp"
#include "node.hpp"

#include <iostream>
#include <cmath>     // M_SQRT2
#include <algorithm> // max, min
#include <vector>    // steps, any general iterable
#include <map>       // ostream operator<< overloading
#include <set>       // storing of node children
#include <iterator>
#include <list>
#include <memory> // unique_ptr


#ifndef PATHFINDER_HPP
#define PATHFINDER_HPP

#define _USE_MATH_DEFINES
namespace pathfinder
{

  extern int created, destroyed;

  template <typename Action_t>
  class GridPathFinder
  {
  public:
    std::vector<NWSE> deltaNWSE;
    std::vector<std::string> deltaNWSEStr;
    std::vector<std::vector<int>> delta;

    bool drawArrows;
    bool vertexEnabled;
    bool diagonalAllow;
    bool bigMap;
    int bitOffset;
    const int staticBitLen = 5;
    const int colorBitLen = 1;
    grid_t grid;
    int gridHeight, gridWidth;
    int batchSize, batchInterval;

    neighbors_t neighborsIndex;

    coord_t start, goal, currentNodeXY;
    path_t path;

    int arrowCnt;
    int stepIndex;
    int lastStepIndex;
    int fwdActionCnt;

    std::vector<std::vector<int>> cellMap;

    Node *currentNode = nullptr;
    std::vector<Node*> rootNodes;
    int maxNodeDepth = 500;

    // additional stuff that is not in js
    std::vector<std::vector<std::string>> ITRowDataCache;
    std::vector<double> cellVals;
    std::vector<std::vector<int>> arrowCoords;

    // STEP STRUCT METHOD
    std::vector<std::unique_ptr<Step<Action_t>>> steps;
    std::unique_ptr<Step<Action_t>> currentStep;

    // FOR STATE GENERATION
    RuntimeSimulation sim;
    bool genStates;
    int stateFreq;
    int stepCnt;
    std::vector<std::unique_ptr<State>> states;

    // END OF STATE GENERATION

    static int managePacking(int numBits, int &bitOffset, std::vector<int> &actionCache)
    {
      bitOffset += numBits;
      if (bitOffset > 31)
      {
        actionCache.push_back(0);
        bitOffset = 1 + numBits;
      }
      return actionCache.size() - 1;
    }

    Action_t packAction(const Command &command, int dest = -1, coord_t nodeCoord = {-1, -1}, int colorIndex = -1, int arrowIndex = -1, int pseudoCodeRow = -1, int infoTableRowIndex = 0, std::vector<std::string> infoTableRowData = std::vector<std::string>(0), double cellVal = -1, coord_t endCoord = {-1, -1})
    {
      Action_t ret;
      ret.command = command;
      ret.dest = (Dest)dest;
      ret.nodeCoord = nodeCoord;
      ret.cellVal = cellVal;
      if constexpr(std::is_same<Action_t, Action>::value){
        ret.colorIndex = colorIndex;
        ret.arrowIndex = arrowIndex;
        ret.pseudoCodeRow = pseudoCodeRow;
        ret.infoTableRowIndex = infoTableRowIndex;
        ret.infoTableRowData = infoTableRowData;
        ret.endCoord = endCoord;
      }
      return ret;
    }

    ~GridPathFinder()
    {
      std::cout << "deleting GridPathFinder\n";
      steps.clear();
    }

    void initSearch(grid_t &grid, coord_t start, coord_t goal, neighbors_t &neighborsIndex, bool vertexEnabled, bool diagonalAllow, bool bigMap)
    {
      gridHeight = grid.size();
      gridWidth = grid[0].size();
      std::cout<<gridHeight<<' '<<gridWidth<<std::endl;
      this->grid = grid;
      this->start = start; // in array form [x,y]  [0,0] is top left  [512,512] is bottom right
      this->goal = goal;
      path.clear();

      if (neighborsIndex.size() == 8)
      {
        deltaNWSE = {N, NW, W, SW, S, SE, E, NE};
        delta = {{1, 0}, {1, 1}, {0, 1}, {-1, 1}, {-1, 0}, {-1, -1}, {0, -1}, {1, -1}};
        deltaNWSEStr.resize(8);
        deltaNWSEStr[N] = "N";
        deltaNWSEStr[W] = "W";
        deltaNWSEStr[S] = "E";
        deltaNWSEStr[E] = "E";
        deltaNWSEStr[NW] = "NW";
        deltaNWSEStr[SW] = "SW";
        deltaNWSEStr[SE] = "SE";
        deltaNWSEStr[NE] = "NE";
      }
      else
      {
        deltaNWSE = {N, W, S, E};
        delta = {{1, 0}, {0, 1}, {-1, 0}, {0, -1}};
        deltaNWSEStr.resize(4);
        deltaNWSEStr[N] = "N";
        deltaNWSEStr[W] = "W";
        deltaNWSEStr[S] = "E";
        deltaNWSEStr[E] = "E";
      }
      this->neighborsIndex = neighborsIndex;
      this->vertexEnabled = vertexEnabled;
      this->bigMap = bigMap;
      if(bigMap) std::cout<<"BIGMAP IS ON\n";
      else std::cout<<"BIGMAP IS OFF\n";

      // clearSteps
      arrowCnt = 0;
      stepIndex = -1;
      lastStepIndex = 0;
      cellVals.clear();
      arrowCoords.clear();
      drawArrows = gridHeight <= 65 && gridWidth <= 65;
      fwdActionCnt = 0;

      steps.clear();
      states.clear();
      currentStep = std::make_unique<Step<Action_t>>();
      revActionCnt = 0;

      // generate empty 2d array
      cellMap = std::vector<std::vector<int>>(gridHeight, std::vector<int>(gridWidth, -1));

      if (gridHeight <= 32)
        batchSize = 1000; // 10
      else if (gridHeight <= 64)
        batchSize = 1000; // 40
      else
        batchSize = 1000;
      batchInterval = 0;
    }

    bool nodeIsNeighbor(coord_t &nextXY, NWSE nextNWSE, std::vector<std::array<int, 2>> &cardinalCoords)
    {
      if (vertexEnabled)
      {
        coord_t c1, c2;
        // no diagonal blocking considered
        if (nextXY.first != this->currentNodeXY.first && nextXY.second != this->currentNodeXY.second)
        {
          // diagonal crossing
          // consider [std::min(nextXY.first, this->currentNodeXY.first), std::min(nextXY.second, this->currentNodeXY.second)];
          int coord[2] = {std::min(nextXY.first, this->currentNodeXY.first), std::min(nextXY.second, this->currentNodeXY.second)};
          if (grid[coord[0]][coord[1]] == 0)
            return false; // not passable
        }
        else
        {
          // cardinal crossing
          if (nextXY.first != this->currentNodeXY.first)
          {
            // consider [std::min(nextXY.first, this->currentNodeXY.first), nextXY.second]
            // consider [std::min(nextXY.first, this->currentNodeXY.first), nextXY.second-1]
            c1 = {std::min(nextXY.first, this->currentNodeXY.first), nextXY.second};
            c2 = {std::min(nextXY.first, this->currentNodeXY.first), nextXY.second - 1};
          }
          else
          {
            // consider [nextXY.first, std::min(nextXY.second, this->currentNodeXY.second)]
            // consider [nextXY.first-1, std::min(nextXY.second, this->currentNodeXY.second)]
            c1 = {nextXY.first, std::min(nextXY.second, this->currentNodeXY.second)};
            c2 = {nextXY.first - 1, std::min(nextXY.second, this->currentNodeXY.second)};
          }
          if (grid[c1.first][c1.second] == 0 && grid[c2.first][c2.second] == 0)
            return false; // not passable
        }
      }
      else
      {
        if (grid[nextXY.first][nextXY.second] == 0)
          return false; // if neighbour is not passable
        if (!diagonalAllow && neighborsIndex.size() == 8)
        { // if diagonal blocking is enabled
          // N: 0, W: 1, S: 2, E: 3
          if (nextNWSE == NW)
          {
            if (grid[cardinalCoords[N][0]][cardinalCoords[N][1]] == 0 && grid[cardinalCoords[W][0]][cardinalCoords[W][1]] == 0)
              return false;
          }
          else if (nextNWSE == SW)
          {
            if (grid[cardinalCoords[S][0]][cardinalCoords[S][1]] == 0 && grid[cardinalCoords[W][0]][cardinalCoords[W][1]] == 0)
              return false;
          }
          else if (nextNWSE == SE)
          {
            if (grid[cardinalCoords[S][0]][cardinalCoords[S][1]] == 0 && grid[cardinalCoords[E][0]][cardinalCoords[E][1]] == 0)
              return false;
          }
          else if (nextNWSE == NE)
          {
            if (grid[cardinalCoords[N][0]][cardinalCoords[N][1]] == 0 && grid[cardinalCoords[E][0]][cardinalCoords[E][1]] == 0)
              return false;
          }
        }
      }
      return true;
    }

    void createAction(Command command, int dest = -1, coord_t nodeCoord = {-1, -1}, int colorIndex = -1, int arrowIndex = -1, int pseudoCodeRow = -1, int infoTableRowIndex = -1, std::vector<std::string> infoTableRowData = std::vector<std::string>(0), double cellVal = -1, coord_t endCoord = {-1, -1})
    {
      
      fwdActionCnt++;
      Action_t myAction = packAction(command, dest, nodeCoord, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal, endCoord);
      // STEP STRUCT METHOD
      currentStep->fwdActions.push_back(myAction);
      
    }

    void saveStep(bool combined)
    {
      if (combined)
      {
        currentStep->combined = true;
      }
      steps.push_back(std::move(currentStep));
      currentStep = std::make_unique<Step<Action_t>>();
      ++stepIndex;
    }

    void handleArrow(coord_t nextXY, Node *&newNode, Node *&openNode, Node *&closedNode)
    {
      if (!drawArrows)
        return;
      // ARROW
      if (openNode != nullptr)
      { // need to remove the previous arrow drawn and switch it to the newNode
        createAction(EraseArrow, -1, {-1, -1}, -1, openNode->arrowIndex);
      }
      if (closedNode != nullptr)
      { // need to remove the previous arrow drawn and switch it to the newNode
        createAction(EraseArrow, -1, {-1, -1}, -1, closedNode->arrowIndex);
      }
      arrowCoords.push_back({nextXY.first, nextXY.second, currentNodeXY.first, currentNodeXY.second});
      // newNode->arrowIndex = myUI.create_arrow(nextXY, currentNodeXY); // node is reference typed so properties can be modified after adding to queue or open list
      newNode->arrowIndex = arrowCnt++;
      // std::cout<<"Arrow: "<<arrowCnt<<' '<<nextXY.first<<' '<<nextXY.second<<' '<<currentNodeXY.first<<' '<<currentNodeXY.second<<std::endl;
      createAction(DrawArrow, -1, {-1, -1}, 0, newNode->arrowIndex);
      // END OF ARROW
    }

    void assignCellIndex(coord_t xy)
    {
      // index is the step index for the first expansion of that cell
      int x = xy.first;
      int y = xy.second;
      cellMap[x][y] = stepIndex;
    }

    bool foundGoal(Node *node)
    {
      // found the goal & exits the loop
      if (node->coordX != goal.first || node->coordY != goal.second)
        return false;

      assignCellIndex(currentNodeXY);
      //  retraces the entire parent tree until start is found
      Node *current = node;
      while (current != nullptr)
      {
        /* NEW */
        createAction(DrawPixel, CanvasPath, {current->coordX, current->coordY});
        path.push_back({current->coordX, current->coordY});
        if (current->arrowIndex != -1)
          createAction(DrawArrow, -1, {-1, -1}, 1, current->arrowIndex);
        current = current->parent;
      }
      // std::cout << "found" << std::endl;
      saveStep(true);
      saveStep(true);
      return true;
    }

    bool terminateSearch(bool found = true)
    {
      if (!found)
      {
        // std::cout<<"Unable to find goal at "<<goal.first<<' '<<goal.second<<std::endl;
      }
      std::cout << "Num steps: " << steps.size() << std::endl;
      std::cout << "Num actions: " << fwdActionCnt << std::endl;
      #ifdef PURE_CPP
      std::cout<<getCurrentRSS()<<std::endl;
      #endif
      std::cout<<"Num nodes: "<<Node::count<<std::endl;
      std::cout<<"Num root nodes: "<<rootNodes.size()<<std::endl;
      for(const Node* ptr : rootNodes) delete ptr;
      std::cout<<"Deleted rootNodes!"<<std::endl;
      return true;
    }

    int maxStep(){
      return steps.size() - 2;
    }

    int revActionCnt;
    bool generateReverseSteps(bool genState, int stateFreq);
    bool nextGenSteps(int givenBatchSize);
    std::unordered_map<int, bound_t> getBounds(){
      return sim.bounds;
    }
    int getNumStates(){
      return states.size();
    }
    Step<Action_t> getStep(int stepNo);
    State getState(int stepNo);
  };
}
#endif