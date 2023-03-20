#include <iostream>
#include <cmath>     // M_SQRT2
#include <algorithm> // max, min
#include <vector>    // steps, any general iterable
#include <map>       // ostream operator<< overloading
#include <set>       // storing of node children
#include <iterator>
#include <list>
#include <memory> // unique_ptr

#include "helper.hpp"
#include "enums.hpp"
#include "node.hpp"

#ifndef PATHFINDER_HPP
#define PATHFINDER_HPP

#define _USE_MATH_DEFINES
namespace pathfinder
{

  extern int created, destroyed;

#ifndef STEP_STRUCT_METHOD
  struct Action
  {
    std::vector<int> data;
    std::vector<std::string> infoTableRowData;
    Action(std::vector<int> data, std::vector<std::string> infoTableRowData) : data(data), infoTableRowData(infoTableRowData) {}
  };
#endif

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

    std::pair<int, int> start, goal, currentNodeXY;
    path_t path;

    int arrowCnt;
    int stepIndex;
    int lastStepIndex;

    std::vector<std::vector<int>> cellMap;

    Node *currentNode = nullptr;
    Node *rootNode = nullptr;

    // additional stuff that is not in js
    std::vector<std::vector<std::string>> ITRowDataCache;
    std::vector<std::vector<int>> arrowCoords;

#ifdef STEP_STRUCT_METHOD
    // STEP STRUCT METHOD
    std::vector<std::unique_ptr<Step>> steps;
    std::unique_ptr<Step> currentStep;
    int stepItr = 0;
#endif

    // STEP DATA METHOD
    std::vector<int> actionCache;
    std::vector<int> stepCache;
    std::vector<int> stepData;
    std::vector<int> stepIndexMap;
    std::vector<int> combinedIndexMap;

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

    static std::unique_ptr<Action> packAction(const Command &command, int dest = -1, std::pair<int, int> nodeCoord = {-1, -1}, int colorIndex = -1, int arrowIndex = -1, int pseudoCodeRow = -1, int infoTableRowIndex = -1, std::vector<std::string> infoTableRowData = std::vector<std::string>(0), double cellVal = -1, std::pair<int, int> endCoord = {-1, -1})
    {

#ifdef STEP_STRUCT_METHOD
      return std::make_unique<Action>(
          command,
          (Dest)dest,
          nodeCoord,
          colorIndex,
          arrowIndex,
          pseudoCodeRow,
          infoTableRowIndex,
          infoTableRowData,
          cellVal,
          endCoord);
#else
      std::vector<int> actionCache = {1};
      int bitOffset = 10;
      int idx = 0;
      const int STATICBITLEN = 5;
      const int COLORBITLEN = 1;

      // command is assumed to exist
      idx = managePacking(STATICBITLEN, bitOffset, actionCache);
      actionCache[idx] += (command << (bitOffset - STATICBITLEN));
      if (dest != -1)
      {
        idx = managePacking(STATICBITLEN, bitOffset, actionCache);
        actionCache[0] |= (1 << 1);
        actionCache[idx] += (dest << (bitOffset - STATICBITLEN));
      }
      if (colorIndex != -1)
      {
        idx = managePacking(COLORBITLEN, bitOffset, actionCache);
        actionCache[0] |= (1 << 2);
        actionCache[idx] += (colorIndex << (bitOffset - COLORBITLEN));
      }
      if (nodeCoord.first != -1 && nodeCoord.second != -1)
      {
        ++idx;
        actionCache[0] |= (1 << 3);
        actionCache.push_back(nodeCoord.first << 1);
        ++idx;
        actionCache.push_back(nodeCoord.second << 1);
        // will add floating point implementation eventually
        // see endCoord for more details
      }
      if (arrowIndex != -1)
      {
        ++idx;
        actionCache[0] |= (1 << 4);
        actionCache.push_back(arrowIndex << 1);
      }
      if (pseudoCodeRow != -1)
      {
        ++idx;
        actionCache[0] |= (1 << 5);
        actionCache.push_back(pseudoCodeRow << 1);
      }
      if (infoTableRowIndex != -1)
      {
        ++idx;
        actionCache[0] |= (1 << 6);
        actionCache.push_back(infoTableRowIndex << 1);
      }
      if (infoTableRowData.size() > 0)
      {
        ++idx;
        actionCache[0] |= (1 << 7);
        actionCache.push_back(-1); // signalling to increment infotableRowData
        // ITRowDataCache.push_back(infoTableRowData);
      }
      if (cellVal != -1)
      {
        ++idx;
        actionCache[0] |= (1 << 8);
        actionCache.push_back(cellVal << 1);
      }
      if (endCoord.first != -1 && endCoord.second != -1)
      {
        ++idx;
        actionCache[0] |= (1 << 9);
        actionCache.push_back(endCoord.first << 1);
        ++idx;
        actionCache.push_back(endCoord.second << 1);
        // will add floating point implementation eventually
        // overload the createAction method? idk
      }

      return make_unique<Action>(actionCache, infoTableRowData);
#endif
    }

    ~GridPathFinder()
    {
      std::cout << "deleting GridPathFinder\n";
#ifdef STEP_STRUCT_METHOD
      steps.clear();
#endif
    }

    void initSearch(grid_t &grid, std::pair<int, int> start, std::pair<int, int> goal, neighbors_t &neighborsIndex, bool vertexEnabled, bool bigMap, bool diagonalAllow)
    {
      gridHeight = grid.size();
      gridWidth = grid[0].size();
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

      // clearSteps
      arrowCnt = 0;
      stepIndex = -1;
      lastStepIndex = 0;
      stepCache.clear();
      stepData.clear();
      stepIndexMap.clear();
      combinedIndexMap.clear();
      ITRowDataCache.clear();
      arrowCoords.clear();
      drawArrows = gridHeight <= 65 && gridWidth <= 65;

#ifdef STEP_STRUCT_METHOD
      steps.clear();
      currentStep = std::make_unique<Step>();
#endif

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

    bool nodeIsNeighbor(std::pair<int, int> &nextXY, NWSE nextNWSE, std::vector<std::array<int, 2>> &cardinalCoords)
    {
      if (vertexEnabled)
      {
        std::pair<int, int> c1, c2;
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

    int manageAction(int numBits)
    {
      bitOffset += numBits;
      if (bitOffset > 31)
      {
        actionCache.push_back(0);
        bitOffset = 1 + numBits;
      }
      return actionCache.size() - 1;
    }

    void createAction(Command command, int dest = -1, std::pair<int, int> nodeCoord = {-1, -1}, int colorIndex = -1, int arrowIndex = -1, int pseudoCodeRow = -1, int infoTableRowIndex = -1, std::vector<std::string> infoTableRowData = std::vector<std::string>(0), double cellVal = -1, std::pair<int, int> endCoord = {-1, -1})
    {
      std::unique_ptr<Action> myAction = GridPathFinder::packAction(command, dest, nodeCoord, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal, endCoord);

#ifdef STEP_STRUCT_METHOD
      // STEP STRUCT METHOD
      currentStep->fwdActions.push_back(std::move(myAction));
#else
      // STEP DATA METHOD
      stepData.insert(stepData.end(), myAction->data.begin(), myAction->data.end());
      if (infoTableRowData.size() > 0)
        ITRowDataCache.push_back(myAction->infoTableRowData);
      delete myAction;
#endif
    }

    void saveStep(bool combined)
    {
      if (combined)
      {
#ifdef STEP_STRUCT_METHOD
        currentStep->combined = true;
#else
        int n = stepIndexMap.size() - combinedIndexMap.size();
        while (n > 0)
        {
          combinedIndexMap.push_back(n--);
        }
#endif
      }
#ifdef STEP_STRUCT_METHOD
      steps.push_back(std::move(currentStep));
      currentStep = std::make_unique<Step>();
#else
      stepIndexMap.push_back(lastStepIndex);
      lastStepIndex = stepData.size();
#endif
      ++stepIndex;
    }

    void handleArrow(std::pair<int, int> nextXY, Node *&newNode, Node *&openNode, Node *&closedNode)
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

    void assignCellIndex(std::pair<int, int> xy)
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
#ifdef STEP_STRUCT_METHOD
      std::cout << "Num steps: " << steps.size() << std::endl;
#else
      std::cout << "StepData: " << stepData.size() << ", StepIndexMap: " << stepIndexMap.size() << ", CombinedIndexMap: " << combinedIndexMap.size() << std::endl;
#endif
      delete rootNode;
      return true;
    }

    void generateReverseSteps(bool genState, int stateFreq = 0);
    bool nextGenSteps(int givenBatchSize);
    std::unordered_map<Dest, std::pair<double, double>> getBounds();
    Step getFwdStep();
    Step getRevStep();
    State getState();
  };
}
#endif