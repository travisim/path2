#define _USE_MATH_DEFINES

// #include <emscripten.h>
#include <iostream>
#include <utility>
#include <cmath>     // M_SQRT2
#include <algorithm> // max, min
#include <iomanip>   // std::setprecision
#include <vector>    // any general iterable
#include <deque>     // priority_queue
#include <queue>

#include "pathfinder.hpp"
#include "step.hpp"

#include "node.hpp"
#include "rbt.hpp"

#ifndef ASTAR_HPP
#define ASTAR_HPP

namespace pathfinder{

class PriorityQueue
{
public:
  PriorityQueue(timeOrder order = FIFO, double THRESH = 1e-8, bool hOptimized = false) : order(order), THRESH(THRESH), hOptimized(hOptimized), data(THRESH, hOptimized, order) {}
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
  void clear() { data.clear(); }

private:
  RedBlackTree data;
  timeOrder order;
  double THRESH;
  bool hOptimized;
};

class A_star : public GridPathFinder
{
private:
  PriorityQueue pq;
  costType chosenCost;
  timeOrder order;
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
    const int curG = currentNode->gCost;

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
    else if (chosenCost == Octile)
    {
      gCost = curG + octile(curX, curY, nextX, nextY);
      hCost = octile(nextX, nextY, goalX, goalY);
    }
    return {gCost + hCost, gCost, hCost};
  }
public:
  Empty2D<Node*> openList, closedList;
  A_star() {}

  bool search(grid_t &grid, int startX, int startY, int goalX, int goalY, neighbors_t &neighborsIndex, bool vertexEnabled, bool diagonalAllow, bool bigMap, costType chosenCost, timeOrder order)
  {
    initSearch(grid, {startX, startY}, {goalX, goalY}, neighborsIndex, vertexEnabled, diagonalAllow, bigMap);
    this->chosenCost = chosenCost;
    this->order = order;
    pq = PriorityQueue(order, 1e-8, false);
    closedList = Empty2D<Node*>(gridHeight, gridWidth);
    openList = Empty2D<Node*>(gridHeight, gridWidth);
    openList.clear();
    closedList.clear();

    // std::cout << "Starting: " << start.first << ' ' << start.second << "->" << goal.first << ' ' << goal.second << std::endl;

    currentNodeXY = {startX, startY};
    currentNode = new Node(startX, startY, nullptr, -1, 0, 0, 0);
    rootNode = currentNode;

    // assign f, (g) and h cost to the starting node
    std::array<double, 3> trip = calcCost({startX, startY});
    currentNode->fCost = trip[0], currentNode->hCost = trip[2]; // gCost is 0

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

    // there exists a Node object which can only be referenced by the ptr in pq;
    // return runNextSearch();
    return false;
  }

  bool runNextSearch(int givenBatchSize = -1)
  {
    if (givenBatchSize == -1)
      givenBatchSize = batchSize;
    int num = givenBatchSize;
    while (num--)
    {
      if (pq.empty())
        return terminateSearch(false);

      currentNode = pq.top();
      pq.pop();
      currentNodeXY = {currentNode->coordX, currentNode->coordY};
      openList.set(currentNodeXY, nullptr);
      if (stepIndex % 10000 == 0)
        std::cout << "F: " << std::setprecision(5) << currentNode->fCost << ", H: " << std::setprecision(5) << currentNode->hCost << std::endl;

      if (closedList.get(currentNodeXY) != nullptr && closedList.get(currentNodeXY)->fCost <= currentNode->fCost)
        continue;

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
        createAction(EraseCanvas, CanvasNeigbors);
        createAction(DrawSinglePixel, CanvasExpanded, currentNodeXY);
        createAction(ErasePixel, CanvasQueue, currentNodeXY);
        createAction(HighlightPseudoCodeRowPri, Pseudocode, {-1, -1}, -1, -1, 12);
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
          // std::cout<<"obs"<<std::endl;
          continue;
        }

        std::array<double, 3> trip = calcCost(nextXY);
        const double fCost = trip[0], gCost = trip[1], hCost = trip[2];

        // std::cout<<fCost<<std::endl;

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

        Node* nextNode = new Node(nextXY.first, nextXY.second, currentNode, -1, fCost, gCost, hCost);
        currentNode->addChild(nextNode);

        createAction(SetPixel, CanvasFCost, nextXY, -1, -1, -1, 0, {}, fCost);
        createAction(SetPixel, CanvasGCost, nextXY, -1, -1, -1, 0, {}, gCost);
        createAction(SetPixel, CanvasHCost, nextXY, -1, -1, -1, 0, {}, hCost);

        int posInQueue = pq.push(nextNode);  //  2nd ownership

        if (!bigMap)
        {
          createAction(DrawPixel, CanvasNeigbors, nextXY);
          createAction(HighlightPseudoCodeRowSec, Pseudocode, {-1, -1}, -1, -1, 32);
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
    // return runNextSearch();
    return false;
  }
};

}

#endif