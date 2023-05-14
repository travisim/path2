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
#include <queue>

#include "grid_pathfinder.hpp"
#include "step.hpp"
#include "conversion.hpp"

#include "node.hpp"
#include "rbt_pq.hpp"

#ifndef ASTAR_HPP
#define ASTAR_HPP

namespace pathfinder{

template <typename Action_t>
class A_star : public GridPathfinder<Action_t>
{
protected:
  using Coord_t = typename Action_t::CoordType;
  // properties
  using GridPathfinder<Action_t>::currentNode;
  using GridPathfinder<Action_t>::currentNodeXY;
  using GridPathfinder<Action_t>::rootNodes;
  using GridPathfinder<Action_t>::maxNodeDepth;
  using GridPathfinder<Action_t>::goal;
  using GridPathfinder<Action_t>::gridHeight;
  using GridPathfinder<Action_t>::gridWidth;
  using GridPathfinder<Action_t>::delta;
  using GridPathfinder<Action_t>::deltaNWSE;
  using GridPathfinder<Action_t>::deltaNWSEStr;
  using GridPathfinder<Action_t>::start;
  using GridPathfinder<Action_t>::batchSize;
  using GridPathfinder<Action_t>::stepIndex;
  using GridPathfinder<Action_t>::bigMap;
  using GridPathfinder<Action_t>::diagonalAllow;
  using GridPathfinder<Action_t>::neighborsIndex;

  // methods
  using GridPathfinder<Action_t>::saveStep;
  using GridPathfinder<Action_t>::terminateSearch;
  using GridPathfinder<Action_t>::initSearch;
  using GridPathfinder<Action_t>::createAction;
  using GridPathfinder<Action_t>::handleArrow;
  using GridPathfinder<Action_t>::assignCellIndex;
  using GridPathfinder<Action_t>::foundGoal;
  using GridPathfinder<Action_t>::nodeIsNeighbor;

  using GridPathfinder<Action_t>::manhattan;
  using GridPathfinder<Action_t>::euclidean;
  using GridPathfinder<Action_t>::chebyshev;
  using GridPathfinder<Action_t>::octile;

  // required in Theta*
  using GridPathfinder<Action_t>::grid;
  using GridPathfinder<Action_t>::vertexEnabled;
  Node<Coord_t> *parentNode;

  PriorityQueue<Coord_t> pq;
  costType chosenCost;
  timeOrder order;
  int gCoeff;
  int hCoeff;

  virtual std::array<double, 3> calcCost(Coord_t nextXY)
  {
    parentNode = currentNode;
    
    // inherited in Theta_star
    const int curX = parentNode->selfXY.first, curY = parentNode->selfXY.second;
    const int nextX = nextXY.first, nextY = nextXY.second;
    const int goalX = goal.first, goalY = goal.second;
    const double curG = parentNode->gCost;

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
    //return new Node<Coord_t>(nextXY, currentNode, -1, gCoeff * gCost + hCoeff * hCost, gCost, hCost);
  }

  Empty2D<Node<Coord_t>*, Coord_t> openList, closedList;
public:
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
    initSearch(grid, {startX, startY}, {goalX, goalY}, diagonalAllow, bigMap, neighborsIndex, vertexEnabled);
    this->chosenCost = chosenCost;
    this->order = order;
    this->gCoeff = gCoeff;
    this->hCoeff = hCoeff;
    pq = PriorityQueue<Coord_t>(order, hOptimized);
    closedList = Empty2D<Node<Coord_t>*, Coord_t>(gridHeight, gridWidth);
    openList = Empty2D<Node<Coord_t>*, Coord_t>(gridHeight, gridWidth);
    openList.clear();
    closedList.clear();

    // std::cout << "Starting: " << start.first << ' ' << start.second << "->" << goal.first << ' ' << goal.second << std::endl;

    currentNodeXY = {startX, startY};
    currentNode = new Node<Coord_t>({startX, startY}, nullptr, -1, 0, 0, 0);
    rootNodes.push_back(currentNode);

    std::array<double, 3> trip = calcCost({startX, startY});
    // currentNode = calcCost({startX, startY});
    // rootNodes.push_back(currentNode);
    currentNode->fCost = trip[0];
    currentNode->hCost = trip[2]; // gCost is 0

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
      currentNodeXY = currentNode->selfXY;
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
          createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, -(i + 1), {deltaNWSEStr[deltaNWSE[i]], "?", "?", "?", "?", "?"});
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

      std::vector<Coord_t> cardinalCoords(4);
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
        Coord_t nextXY;
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
        // Node<Coord_t>* nextNode = calcCost(nextXY);
        // const double fCost = nextNode->fCost, gCost = nextNode->gCost, hCost = nextNode->hCost;

        Node<Coord_t>* openNode = openList.get(nextXY);
        if (openNode != NULL && openNode->fCost <= fCost)
        {
          if (!bigMap)
          {
            createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {deltaNWSEStr[deltaNWSE[i]], std::to_string(nextXY.first) + "," + std::to_string(nextXY.second), std::to_string(roundSF(fCost, 5)), std::to_string(roundSF(gCost, 5)), std::to_string(roundSF(hCost, 5)), "Not a child"});
            saveStep(false);
          }
          // delete nextNode;
          continue;
        }
        //std::cout<<"node has lower fCost\n";

        Node<Coord_t>* closedNode = closedList.get(nextXY);
        if (closedNode != NULL && closedNode->fCost <= fCost)
        {
          if (!bigMap)
          {
            if (currentNode->parent && currentNode->parent->selfXY.first == nextXY.first && currentNode->parent->selfXY.second == nextXY.second)
              createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {deltaNWSEStr[deltaNWSE[i]], std::to_string(nextXY.first) + "," + std::to_string(nextXY.second), std::to_string(roundSF(fCost, 5)), std::to_string(roundSF(gCost, 5)), std::to_string(roundSF(hCost, 5)), "Parent"});
            else
              createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {deltaNWSEStr[deltaNWSE[i]], std::to_string(nextXY.first) + "," + std::to_string(nextXY.second), std::to_string(roundSF(fCost, 5)), std::to_string(roundSF(gCost, 5)), std::to_string(roundSF(hCost, 5)), "Not a child"});
          }
          createAction(IncrementPixel, CanvasVisited, nextXY);
          saveStep(false);
          // delete nextNode;
          continue;
        }

        Node<Coord_t>* nextNode = new Node<Coord_t>(nextXY, parentNode, -1, fCost, gCost, hCost);
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
          handleArrow(nextNode, openNode, closedNode);

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
    return false;
  }

  void insertNode(){
    int k = 2;
    std::cout<<"Inserting "<<k<<" nodes\n";
    while(k--){
      Node<Coord_t>* n = new Node<Coord_t>({-1, -1}, nullptr, -1, -1, -1, -1);
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
    // 1e7 nodes in 3239ms in wasm
    Node<Coord_t>* prev = nullptr;
    while(num--){
      Node<Coord_t>* node = new Node<Coord_t>({0, 0}, prev, 0, 0, 0, 0);
      prev = node;
    }
  }
};

}

#endif