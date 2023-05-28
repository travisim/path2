#include "../nadeau.hpp"
#include "helper.hpp"
#include "enums.hpp"
#include "node.hpp"

#include <iostream>
#include <cmath>     // M_SQRT2
#include <algorithm> // max, min
#include <vector>    // steps, any general iterable
#include <deque>    // steps, any general iterable
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
  class Pathfinder
  {
  public:
    using Coord_t = typename Action_t::CoordType;

    bool drawArrows;
    bool vertexEnabled = false;  // used in step generation to determine canvas size, despite only being relevant in grid_pathfinder
    bool diagonalAllow;
    bool bigMap;
    int bitOffset;
    const int staticBitLen = 5;
    const int colorBitLen = 1;
    grid_t grid;
    int gridHeight, gridWidth;
    int batchSize, batchInterval;

    std::unordered_map<std::string, int> dests;
    std::unordered_map<int, std::deque<VertexSim<Coord_t>>> vertices;
    std::unordered_map<int, std::deque<EdgeSim<Coord_t>>> edges;
    std::unordered_map<int, std::vector<StoredVertex<Coord_t>>> vertexStore;
    std::unordered_map<int, std::vector<StoredEdge<Coord_t>>> edgeStore;
    int maxLines = 500;

    Coord_t start, goal, currentNodeXY;
    std::vector<Coord_t> path;

    int arrowCnt;
    int stepIndex;
    int lastStepIndex;
    int fwdActionCnt;

    Node<Coord_t>* currentNode = nullptr;
    std::vector<Node<Coord_t>*> rootNodes;
    int maxNodeDepth = 500;

    // additional stuff that is not in js
    std::vector<std::vector<int>> arrowCoords;

    std::vector<std::unique_ptr<Step<Action_t>>> steps;
    std::unique_ptr<Step<Action_t>> currentStep;

    // FOR STATE GENERATION
    RuntimeSimulation<Coord_t> sim;
    bool genStates;
    int stateFreq;
    int stepCnt;
    std::vector<std::unique_ptr<State<Coord_t>>> states;

    // END OF STATE GENERATION

    // distance metrics defined here because they are universal
    static double manhattan(int x1, int y1, int x2, int y2) { return abs(x1 - x2) + abs(y1 - y2); }

    static double euclidean(int x1, int y1, int x2, int y2) { return hypot(x1 - x2, y1 - y2); }

    static double chebyshev(int x1, int y1, int x2, int y2) { return std::max(abs(x1 - x2), abs(y1 - y2)); }

    static double octile(int x1, int y1, int x2, int y2)
    {
      int dx = abs(x1 - x2);
      int dy = abs(y1 - y2);
      return std::min(dx, dy) * M_SQRT2 + abs(dx - dy);
    }

    Action_t packAction(const Command &command, int dest = -1, Coord_t nodeCoord = {-1, -1}, int colorIndex = -1, int arrowIndex = -1, int pseudoCodeRow = -1, int infoTableRowIndex = 0, std::vector<std::string> infoTableRowData = std::vector<std::string>(0), double anyVal = -1, Coord_t endCoord = {-1, -1})
    {
      Action_t ret;
      ret.command = command;
      ret.dest = (Dest)dest;
      ret.nodeCoord = nodeCoord;
      ret.anyVal = anyVal;
      ret.endCoord = endCoord;
      if constexpr(std::is_same<Action_t, Action<Coord_t>>::value){
        ret.colorIndex = colorIndex;
        ret.arrowIndex = arrowIndex;
        ret.pseudoCodeRow = pseudoCodeRow;
        ret.infoTableRowIndex = infoTableRowIndex;
        ret.infoTableRowData = infoTableRowData;
      }
      return ret;
    }

    // generateDests?

    ~Pathfinder()
    {
      std::cout << "deleting Pathfinder\n";
    }

    virtual inline bool showFreeVertex(){ return false; }
    virtual inline bool gridPrecisionFloat(){ return false; }


    virtual void initSearch(grid_t &grid, Coord_t start, Coord_t goal, bool diagonalAllow, bool bigMap)
    {
      this->grid = grid;
      this->start = start;
      this->goal = goal;
      this->diagonalAllow = diagonalAllow;
      this->bigMap = bigMap;
      gridHeight = grid.size();
      gridWidth = grid[0].size();
      std::cout<<gridHeight<<' '<<gridWidth<<std::endl;
      path.clear();

      if(bigMap) std::cout<<"BIGMAP IS ON\n";
      else std::cout<<"BIGMAP IS OFF\n";

      // clearSteps
      arrowCnt = 0;
      stepIndex = -1;
      lastStepIndex = 0;
      arrowCoords.clear();
      drawArrows = gridHeight <= 65 && gridWidth <= 65;
      fwdActionCnt = 0;

      steps.clear();
      states.clear();
      currentStep = std::make_unique<Step<Action_t>>();
      revActionCnt = 0;

      batchSize = std::max(gridHeight * gridWidth / 20, 10000);
      batchInterval = 0;
    }

    void createAction(Command command, int dest = -1, Coord_t nodeCoord = {-1, -1}, int8_t colorIndex = -1, int arrowIndex = -1, int pseudoCodeRow = -1, int infoTableRowIndex = 0, std::vector<std::string> infoTableRowData = std::vector<std::string>(0), double anyVal = -1, Coord_t endCoord = {-1, -1})
    {
      if(command == DrawEdge){
        if(edges.find(dest) == edges.end()) edges[dest] = {};
        arrowIndex = edgeStore[dest].size();  // simulates myUI.edgeCanvas
        if(colorIndex == -1) colorIndex = 0;
        if(anyVal == -1) anyVal = 1;
        edges[dest].push_back({nodeCoord, endCoord, colorIndex, anyVal, arrowIndex});
        edgeStore[dest].push_back({nodeCoord, endCoord, colorIndex, anyVal});
        nodeCoord = {-1, -1}; endCoord = {-1, -1}; colorIndex = -1; anyVal = -1;

        if(edges[dest].size() > maxLines){
          fwdActionCnt++;
          auto oldest = edges[dest].front(); edges[dest].pop_front();
          Action_t myAction = packAction(command, dest, {-1, -1}, -1, oldest.arrowIndex);
          currentStep->fwdActions.push_back(myAction);
        }
      }
      else if(command == EraseEdge){
        for(auto &e : edges[dest]){
          bool a = isCoordEqual<Coord_t>(e.nodeCoord, nodeCoord) && isCoordEqual<Coord_t>(e.endCoord, endCoord) && e.colorIndex == colorIndex;
          bool b = isCoordEqual<Coord_t>(e.nodeCoord, endCoord) && isCoordEqual<Coord_t>(e.endCoord, nodeCoord) && e.colorIndex == colorIndex;
          if(a || b){
            arrowIndex = e.arrowIndex;
            break;
          }
        }
        nodeCoord = {-1, -1}; endCoord = {-1, -1}; colorIndex = -1; anyVal = -1;
      }
      else if(command == EraseAllEdge){
        edges[dest].clear();
      }
      else if(command == DrawVertex){
        if(vertices.find(dest) == vertices.end()) vertices[dest] = {};
        arrowIndex = vertexStore[dest].size();  // simulates myUI.nodeCanvas
        if(colorIndex == -1) colorIndex = 0;
        if(anyVal == -1) anyVal = 1;
        vertices[dest].push_back({nodeCoord, colorIndex, anyVal, arrowIndex});
        vertexStore[dest].push_back({nodeCoord, colorIndex, anyVal});
        nodeCoord = {-1, -1}; colorIndex = -1; anyVal = -1;
      }
      else if(command == EraseVertex){
        for(auto &v : vertices[dest]){
          if(isCoordEqual<Coord_t>(v.nodeCoord, nodeCoord) && v.colorIndex == colorIndex){
            arrowIndex = v.arrowIndex;
            break;
          }
        }
        nodeCoord = {-1, -1}; colorIndex = -1; anyVal = -1;
      }
      else if(command == EraseAllVertex){
        vertices[dest].clear();
      }
      else if(command == DrawSingleVertex){
        vertices[dest].clear();
        int arrowindex = vertexStore[dest].size();  // simulates myUI.nodeCanvas
        vertices[dest].push_back({nodeCoord, colorIndex, anyVal, arrowIndex});
        vertexStore[dest].push_back({nodeCoord, colorIndex, anyVal});
        nodeCoord = {-1, -1}; colorIndex = -1; anyVal = -1;
      }
      
      fwdActionCnt++;
      Action_t myAction = packAction(command, dest, nodeCoord, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, anyVal, endCoord);
      if constexpr(std::is_same<Action_t, BaseAction<Coord_t>>::value){
        //if(endCoord.first != -1 && endCoord.second != -1) std::cout<<"ENDCOORD: "<<coord2String(endCoord)<<std::endl;
      }
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

    inline bool isPassable(Coord_t coord){ return grid[coord.first][coord.second]; }

    void handleArrow(Node<Coord_t> *&newNode, Node<Coord_t> *&openNode, Node<Coord_t> *&closedNode)
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
      arrowCoords.push_back({newNode->selfXY.first, newNode->selfXY.second, newNode->parent->selfXY.first, newNode->parent->selfXY.second});
      // node is reference typed so properties can be modified after adding to queue or open list
      newNode->arrowIndex = arrowCnt++;
      // std::cout<<"Arrow: "<<arrowCnt<<' '<<nextXY.first<<' '<<nextXY.second<<' '<<currentNodeXY.first<<' '<<currentNodeXY.second<<std::endl;
      createAction(DrawArrow, -1, {-1, -1}, 0, newNode->arrowIndex);
      // END OF ARROW
    }

    virtual bool foundGoal(Node<Coord_t> *node)
    {
      // found the goal & exits the loop
      if (node->selfXY.first != goal.first || node->selfXY.second != goal.second)
        return false;

      //  retraces the entire parent tree until start is found
      Node<Coord_t> *current = node;
      while (current != nullptr)
      {
        if(showFreeVertex()){
          if(gridPrecisionFloat()) createAction(DrawVertex, dests["path"], current->selfXY);
          else createAction(DrawPixel, dests["path"], current->selfXY);
          
          if(current->parent)
            createAction(DrawEdge, dests["path"], current->selfXY, -1, -1, -1, -1, {}, 3, current->parent->selfXY);
        }
        else createAction(DrawPixel, dests["path"], current->selfXY);
        path.push_back(current->selfXY);
        if (current->arrowIndex != -1)
          createAction(DrawArrow, -1, {-1, -1}, 1, current->arrowIndex);
        current = current->parent;
      }
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
      std::cout<<"EDGESTORE KEY SIZE: "<<edgeStore.size()<<std::endl;
      std::cout << "Num steps: " << steps.size() << std::endl;
      std::cout << "Num actions: " << fwdActionCnt << std::endl;
      #ifdef PURE_CPP
      std::cout<<getCurrentRSS()<<std::endl;
      #endif
      std::cout<<"Num nodes: "<<Node<Coord_t>::count<<std::endl;
      std::cout<<"Num root nodes: "<<rootNodes.size()<<std::endl;
      for(const Node<Coord_t>* ptr : rootNodes) delete ptr;
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
    
    Step<Action_t> getStep(int stepNo)
    {
      return Step(*steps[stepNo].get());
    }

    State<Coord_t> getState(int stepNo)
    {
      int stateNo = (stepNo + 1) / stateFreq;
      std::cout<<"Getting state "<<stateNo<<" from wasm!\n";
      if (stepNo < stateFreq){
        std::cout<<0<<std::endl;
        return State<Coord_t>{false};
      }
      State<Coord_t> s = *states[stateNo - 1].get();
      return s;
    }
  };
}
#endif