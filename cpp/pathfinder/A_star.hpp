#define _USE_MATH_DEFINES

#ifndef PURE_CPP
#include <emscripten/bind.h>
#endif
#include <iostream>
#include <assert.h>
#include <utility>
#include <cmath>     // M_SQRT2
#include <algorithm> // max, min
#include <iomanip>   // std::setprecision
#include <vector>    // any general iterable
#include <deque>     // priority_queue
#include <queue>

#include "pathfinder.hpp"
#include "step.hpp"
#include "conversion.cpp"

#include "node.hpp"
#include "rbt.hpp"

#ifndef ASTAR_HPP
#define ASTAR_HPP

namespace pathfinder{

class PriorityQueue
{
public:
  PriorityQueue(timeOrder order = FIFO, bool hOptimized = false) : data(hOptimized, order) {}
  bool empty() { return data.empty(); }
  int push(Node* n)
  {
    data.insert(n);
    return data.osRank(data.find(n)); // 1-indexed
  }
  void pop()
  {
    data.erase(data.minimumVal());
  }
  Node* top()
  {
    return data.minimumVal();
  }
  int size(){
    return data.size();
  }
  void clear() { data.clear(); }

private:
  RedBlackTree data;
};

template <typename Action_t>
class A_star : public GridPathFinder<Action_t>
{
private:
  using GridPathFinder<Action_t>::currentNode;
  using GridPathFinder<Action_t>::currentNodeXY;
  using GridPathFinder<Action_t>::rootNodes;
  using GridPathFinder<Action_t>::maxNodeDepth;
  using GridPathFinder<Action_t>::goal;
  using GridPathFinder<Action_t>::gridHeight;
  using GridPathFinder<Action_t>::gridWidth;
  using GridPathFinder<Action_t>::delta;
  using GridPathFinder<Action_t>::deltaNWSE;
  using GridPathFinder<Action_t>::deltaNWSEStr;
  using GridPathFinder<Action_t>::start;
  using GridPathFinder<Action_t>::batchSize;
  using GridPathFinder<Action_t>::stepIndex;
  using GridPathFinder<Action_t>::bigMap;
  using GridPathFinder<Action_t>::diagonalAllow;
  using GridPathFinder<Action_t>::neighborsIndex;

  using GridPathFinder<Action_t>::saveStep;
  using GridPathFinder<Action_t>::terminateSearch;
  using GridPathFinder<Action_t>::initSearch;
  using GridPathFinder<Action_t>::createAction;
  using GridPathFinder<Action_t>::handleArrow;
  using GridPathFinder<Action_t>::assignCellIndex;
  using GridPathFinder<Action_t>::foundGoal;
  using GridPathFinder<Action_t>::nodeIsNeighbor;
  PriorityQueue pq;
  costType chosenCost;
  timeOrder order;
  int gCoeff;
  int hCoeff;
  double manhattan(int x1, int y1, int x2, int y2) { return abs(x1 - x2) + abs(y1 - y2); }

  double euclidean(int x1, int y1, int x2, int y2) { return hypot(x1 - x2, y1 - y2); }

  double chebyshev(int x1, int y1, int x2, int y2) { return std::max(abs(x1 - x2), abs(y1 - y2)); }

  double octile(int x1, int y1, int x2, int y2)
  {
    int dx = abs(x1 - x2);
    int dy = abs(y1 - y2);
    return std::min(dx, dy) * M_SQRT2 + abs(dx - dy);
  }

  std::array<double, 3> calcCost(coord_t nextXY)
  {
    const int curX = currentNode->coordX, curY = currentNode->coordY;
    const int nextX = nextXY.first, nextY = nextXY.second;
    const int goalX = goal.first, goalY = goal.second;
    const double curG = currentNode->gCost;

    double gCost, hCost;
    if (chosenCost == Manhattan)
    {
      gCost = curG + manhattan(curX, curY, nextX, nextY);
      hCost = manhattan(nextX, nextY, goalX, goalY);
    }
    else if (chosenCost == Euclidean)
    {
      gCost = curG + euclidean(curX, curY, nextX, nextY);
      hCost = euclidean(nextX, nextY, goalX, goalY);
    }
    else if (chosenCost == Chebyshev)
    {
      gCost = curG + chebyshev(curX, curY, nextX, nextY);
      hCost = chebyshev(nextX, nextY, goalX, goalY);
    }
    else// if (chosenCost == Octile)
    {
      assert(chosenCost == Octile);
      gCost = curG + octile(curX, curY, nextX, nextY);
      hCost = octile(nextX, nextY, goalX, goalY);
    }
    return {gCoeff * gCost + hCoeff * hCost, gCost, hCost};
  }
public:
  Empty2D<Node*> openList, closedList;
  A_star() {}

#ifndef PURE_CPP
  bool wrapperSearch(
    emscripten::val gridArr,  // grid
    int startX, int startY, int goalX, int goalY,  // start and end coordinates
    emscripten::val neighborsIndexArr,
    bool vertexEnabled, bool diagonalAllow, bool bigMap, bool hOptimized,
    int chosenCostInt, int orderInt, // implicit type conversion (?)
    int gCoeff = 1, int hCoeff = 1
  ){
    pathfinder::costType chosenCost = (pathfinder::costType)chosenCostInt;
    pathfinder::timeOrder order = (pathfinder::timeOrder)orderInt;
    grid_t grid = js2DtoVect2D(gridArr);
    std::vector<uint8_t> neighborsIndex = js1DtoVect1D(neighborsIndexArr);
    
    return search(grid, startX, startY, goalX, goalY, neighborsIndex, vertexEnabled, diagonalAllow, bigMap, hOptimized, chosenCost, order, gCoeff, hCoeff);
  }
  #endif

  bool search(grid_t &grid, int startX, int startY, int goalX, int goalY, neighbors_t &neighborsIndex, bool vertexEnabled, bool diagonalAllow, bool bigMap, bool hOptimized, costType chosenCost, timeOrder order, int gCoeff = 1, int hCoeff = 1)
  {
    std::cout<<startX<<' '<<startY<<' '<<goalX<<' '<<goalY<<std::endl;
    vectDigitPrint(neighborsIndex);
    std::cout<<vertexEnabled<<' '<<diagonalAllow<<' '<<bigMap<<' '<<hOptimized<<std::endl;
    std::cout<<chosenCost<<' '<<order<<std::endl;
    initSearch(grid, {startX, startY}, {goalX, goalY}, neighborsIndex, vertexEnabled, diagonalAllow, bigMap);
    this->chosenCost = chosenCost;
    this->order = order;
    this->gCoeff = gCoeff;
    this->hCoeff = hCoeff;
    pq = PriorityQueue(order, hOptimized);
    closedList = Empty2D<Node*>(gridHeight, gridWidth);
    openList = Empty2D<Node*>(gridHeight, gridWidth);
    openList.clear();
    closedList.clear();

    // std::cout << "Starting: " << start.first << ' ' << start.second << "->" << goal.first << ' ' << goal.second << std::endl;

    currentNodeXY = {startX, startY};
    currentNode = new Node(startX, startY, nullptr, -1, 0, 0, 0);
    rootNodes.push_back(currentNode);

    // assign f, (g) and h cost to the starting node
    std::array<double, 3> trip = calcCost({startX, startY});
    currentNode->fCost = trip[0];
    currentNode->hCost = trip[2]; // gCost is 0

    //pq.clear();

    // pushes the starting node onto the queue
    pq.push(currentNode);
    if (!bigMap)
    {
      // initialize the starting sequences
      for (auto itr = deltaNWSE.rbegin(); itr != deltaNWSE.rend(); ++itr)
      {
        createAction(InsertRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, 1, {deltaNWSEStr[*itr], "?", "?", "?", "?", "?"});
      }
      createAction(InsertRowAtIndex, ITQueue, {-1, -1}, -1, -1, -1, 1, {std::to_string(start.first) + "," + std::to_string(start.second), "-", std::to_string(currentNode->fCost).substr(0, 6), std::to_string(currentNode->gCost).substr(0, 6), std::to_string(currentNode->hCost).substr(0, 6)});
      createAction(DrawPixel, CanvasQueue, start);
      saveStep(true);
    }

    openList.set(currentNodeXY, currentNode);

    currentNode = nullptr;

    // return runNextSearch();
    return false;
  }

  bool runNextSearch(int givenBatchSize = -1)
  {
    //std::cout<<"starting runNextSearch! Step Index: "<<stepIndex<<std::endl;
    if (givenBatchSize == -1)
      givenBatchSize = batchSize;
    int num = givenBatchSize;
    while (num--)
    {
      //std::cout<<num<<' '<<stepIndex<<std::endl;
      if (pq.empty())
        return terminateSearch(false);
      //std::cout<<"Size before: "<<pq.size()<<' ';
      currentNode = pq.top();
      pq.pop();
      //std::cout<<"Size after: "<<pq.size()<<std::endl;
      currentNodeXY = {currentNode->coordX, currentNode->coordY};
      openList.set(currentNodeXY, nullptr);
      if (stepIndex % 10000 == 0)
        std::cout << "F: " << std::setprecision(5) << currentNode->fCost << ", H: " << std::setprecision(5) << currentNode->hCost << std::endl;
      
      //std::cout<<currentNode->fCost<<' '<<*closedList.get(currentNodeXY);

      if (closedList.get(currentNodeXY) != nullptr && closedList.get(currentNodeXY)->fCost <= currentNode->fCost)
        continue;
      //std::cout<<"visiting new node!\n";

      closedList.set(currentNodeXY, currentNode);

      createAction(IncrementPixel, CanvasVisited, currentNodeXY);
      if (!bigMap)
      {
        for (const int i : neighborsIndex)
        {
          createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {deltaNWSEStr[deltaNWSE[i]], "?", "?", "?", "?", "?"});
        }
        createAction(EraseRowAtIndex, ITQueue, {-1, -1}, -1, -1, -1, 1);
        createAction(DrawSinglePixel, CanvasFocused, currentNodeXY);
        createAction(EraseCanvas, CanvasNeighbors);
        createAction(DrawSinglePixel, CanvasExpanded, currentNodeXY);
        createAction(ErasePixel, CanvasQueue, currentNodeXY);
        //createAction(HighlightPseudoCodeRowPri, Pseudocode, {-1, -1}, -1, -1, 12);
      }
      saveStep(true);

      assignCellIndex(currentNodeXY);

      if (foundGoal(currentNode))
        return terminateSearch();

      std::vector<std::array<int, 2>> cardinalCoords(4);
      if (!diagonalAllow && neighborsIndex.size() == 8)
      {
        for (int i = 0; i < 8; ++i)
        {
          NWSE pick = nil;
          if (delta[i][1] == 0)
          {
            if (delta[i][0] == 1)
              pick = N;
            else if (delta[i][0] == -1)
              pick = S;
          }
          else if (delta[i][0] == 0)
          {
            if (delta[i][1] == 1)
              pick = W;
            else if (delta[i][1] == -1)
              pick = E;
          }
          if (pick != nil)
            cardinalCoords[pick] = {delta[i][0] + currentNodeXY.first, delta[i][1] + currentNodeXY.second};
        }
      }

      /* iterates through the 4 or 8 neighbors and adds the valid (passable & within boundaries of map) ones to the queue & neighbour array */

      for (const int i : neighborsIndex)
      {
        coord_t nextXY;
        nextXY.first = currentNodeXY.first + delta[i][0];
        nextXY.second = currentNodeXY.second + delta[i][1];
        // std::cout << "next: " << nextXY.first << ' ' << nextXY.second << ' ' << std::endl;
        if (nextXY.first < 0 || nextXY.first >= gridHeight || nextXY.second < 0 || nextXY.second >= gridWidth)
        {
          // std::cout << "pass" << std::endl;
          if (!bigMap)
            createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {deltaNWSEStr[deltaNWSE[i]], std::to_string(nextXY.first) + "," + std::to_string(nextXY.second), "inf", "inf", "inf", "Out of Bounds"});
          continue;
        }
        //std::cout<<"node is in bounds\n";
        if (!bigMap)
        {
          createAction(DrawSinglePixel, CanvasFocused, nextXY);
        }

        if (!nodeIsNeighbor(nextXY, deltaNWSE[i], cardinalCoords))
        {
          if (!bigMap)
          {
            createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {deltaNWSEStr[deltaNWSE[i]], std::to_string(nextXY.first) + "," + std::to_string(nextXY.second), "inf", "inf", "inf", "Obstacle"});
            saveStep(false);
          }
          continue;
        }
        //std::cout<<"node is not obs\n";

        std::array<double, 3> trip = calcCost(nextXY);
        const double fCost = trip[0], gCost = trip[1], hCost = trip[2];

        Node* openNode = openList.get(nextXY);
        if (openNode != NULL && openNode->fCost <= fCost)
        {
          if (!bigMap)
          {
            createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {deltaNWSEStr[deltaNWSE[i]], std::to_string(nextXY.first) + "," + std::to_string(nextXY.second), std::to_string(roundSF(fCost, 5)), std::to_string(roundSF(gCost, 5)), std::to_string(roundSF(hCost, 5)), "Not a child"});
            saveStep(false);
          }
          continue;
        }
        //std::cout<<"node has lower fCost\n";

        Node* closedNode = closedList.get(nextXY);
        if (closedNode != NULL && closedNode->fCost <= fCost)
        {
          if (!bigMap)
          {
            if (currentNode->parent && currentNode->parent->coordX == nextXY.first && currentNode->parent->coordY == nextXY.second)
              createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {deltaNWSEStr[deltaNWSE[i]], std::to_string(nextXY.first) + "," + std::to_string(nextXY.second), std::to_string(roundSF(fCost, 5)), std::to_string(roundSF(gCost, 5)), std::to_string(roundSF(hCost, 5)), "Parent"});
            else
              createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {deltaNWSEStr[deltaNWSE[i]], std::to_string(nextXY.first) + "," + std::to_string(nextXY.second), std::to_string(roundSF(fCost, 5)), std::to_string(roundSF(gCost, 5)), std::to_string(roundSF(hCost, 5)), "Not a child"});
          }
          createAction(IncrementPixel, CanvasVisited, nextXY);
          saveStep(false);
          continue;
        }

        //std::cout<<"node not visited before\n";

        Node* nextNode = new Node(nextXY.first, nextXY.second, currentNode, -1, fCost, gCost, hCost);
        if(currentNode->depth < maxNodeDepth){
          currentNode->addChild(nextNode);
        }
        else{
          rootNodes.push_back(nextNode);
        }

        createAction(SetPixel, CanvasFCost, nextXY, -1, -1, -1, 0, {}, fCost);
        createAction(SetPixel, CanvasGCost, nextXY, -1, -1, -1, 0, {}, gCost);
        createAction(SetPixel, CanvasHCost, nextXY, -1, -1, -1, 0, {}, hCost);

        int posInQueue = pq.push(nextNode);

        if (!bigMap)
        {
          createAction(DrawPixel, CanvasNeighbors, nextXY);
          //createAction(HighlightPseudoCodeRowSec, Pseudocode, {-1, -1}, -1, -1, 32);
          handleArrow(nextXY, nextNode, openNode, closedNode);

          createAction(DrawPixel, CanvasQueue, nextXY);

          createAction(InsertRowAtIndex, ITQueue, {-1, -1}, -1, -1, -1, posInQueue, {std::to_string(nextXY.first) + "," + std::to_string(nextXY.second), std::to_string(currentNodeXY.first) + "," + std::to_string(currentNodeXY.second), std::to_string(roundSF(fCost, 5)), std::to_string(roundSF(gCost, 5)), std::to_string(roundSF(hCost, 5))});

          if (openNode == nullptr && closedNode == nullptr)
            createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {deltaNWSEStr[deltaNWSE[i]], std::to_string(nextXY.first) + "," + std::to_string(nextXY.second), std::to_string(roundSF(fCost, 5)), std::to_string(roundSF(gCost, 5)), std::to_string(roundSF(hCost, 5)), "New encounter"});
          else if (openNode != nullptr)
            createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {deltaNWSEStr[deltaNWSE[i]], std::to_string(nextXY.first) + "," + std::to_string(nextXY.second), std::to_string(roundSF(fCost, 5)), std::to_string(roundSF(gCost, 5)), std::to_string(roundSF(hCost, 5)), "Replace parent"});
        }
        saveStep(false);

        openList.set(nextXY, nextNode);
      }
    }
    //std::cout<<"runNextSearch done! Step Index: "<<stepIndex<<std::endl;
    // return runNextSearch();
    return false;
  }

  void insertNode(){
    int k = 2;
    std::cout<<"Inserting "<<k<<" nodes\n";
    while(k--){
      Node* n = new Node(-1, -1, nullptr, -1, -1, -1, -1);
      rootNodes[0]->addChild(n);
      pq.push(n);
    }
  }

  void eraseNode(){
    int k = 2;
    std::cout<<"Erasing "<<k<<" nodes\n";
    while(k--)
      pq.pop();
  }

  int pqSize(){
    std::cout<<"Num nodes: "<<pq.size()<<std::endl;
    return pq.size();
  }

  void createNodes(int num){
    Node* prev = nullptr;
    while(num--){
      Node* node = new Node(0, 0, prev, 0, 0, 0, 0);
      prev = node;
    }
  }
};

}

#endif