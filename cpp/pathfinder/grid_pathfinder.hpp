#define _USE_MATH_DEFINES

#include <iostream>
#include <assert.h>
#include <utility>
#include <cmath>     // M_SQRT2
#include <algorithm> // max, min
#include <iomanip>   // std::setprecision
#include <vector>    // any general iterable
#include <queue>

#include "pathfinder.hpp"
#include "step.hpp"
#include "conversion.hpp"

#include "node.hpp"
#include "rbt.hpp"

#ifndef GRID_PATHFINDER_HPP
#define GRID_PATHFINDER_HPP

namespace pathfinder{

  template <typename Action_t>
  class GridPathfinder : public Pathfinder<Action_t>
  {
  public:
    using Coord_t = typename Action_t::CoordType;
    std::vector<NWSE> deltaNWSE;
    std::vector<std::string> deltaNWSEStr;
    std::vector<std::vector<int>> delta;

    neighbors_t neighborsIndex;
    bool vertexEnabled;

    std::vector<std::vector<int>> cellMap;

    using Pathfinder<Action_t>::grid;
    using Pathfinder<Action_t>::start;
    using Pathfinder<Action_t>::goal;
    using Pathfinder<Action_t>::diagonalAllow;
    using Pathfinder<Action_t>::gridWidth;
    using Pathfinder<Action_t>::gridHeight;
    using Pathfinder<Action_t>::stepIndex;
    using Pathfinder<Action_t>::currentNodeXY;
    using Pathfinder<Action_t>::currentNode;

    using Pathfinder<Action_t>::isPassable;

    using Pathfinder<Action_t>::initSearch;

    void initSearch(grid_t &grid, Coord_t start, Coord_t goal, bool diagonalAllow, bool bigMap, neighbors_t &neighborsIndex, bool vertexEnabled){ 
      initSearch(grid, start, goal, diagonalAllow, bigMap);  // super equivalent in c++      
      this->neighborsIndex = neighborsIndex;
      this->vertexEnabled = vertexEnabled;

      if (neighborsIndex.size() == 8)
      {
        deltaNWSE = {N, NW, W, SW, S, SE, E, NE};
        delta = {{1, 0}, {1, 1}, {0, 1}, {-1, 1}, {-1, 0}, {-1, -1}, {0, -1}, {1, -1}};
        deltaNWSEStr.resize(8);
        deltaNWSEStr[N] = "N";
        deltaNWSEStr[W] = "W";
        deltaNWSEStr[S] = "S";
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
      
      // generate empty 2d array
      cellMap = std::vector<std::vector<int>>(gridHeight, std::vector<int>(gridWidth, -1));
    }

    void assignCellIndex(Coord_t xy, int givenStepIndex = -1)
    {
      if(givenStepIndex == -1) givenStepIndex = stepIndex;
      // index is the step index for the first expansion of that cell
      int x = xy.first;
      int y = xy.second;
      cellMap[x][y] = givenStepIndex;
    }

    bool foundGoal(Node<Coord_t> *node){
      // polymorphed
      int savedStepIndex = stepIndex;
      bool res = Pathfinder<Action_t>::foundGoal(node);
      if(res)
        assignCellIndex(currentNodeXY, savedStepIndex);
      return res;
    }

    bool isValidCellCoord(Coord_t coord){
      return coord.first >= 0 && coord.second >= 0 && coord.first < gridHeight && coord.second < gridWidth;
    }

    bool isDiagonalBlockedVertex(Coord_t nextXY, Coord_t currentXY, Coord_t parentXY){
      if(parentXY.first == -1 && parentXY.second == -1) return false; // not blocked
      Coord_t blocked1 = currentXY, blocked2 = {currentXY.first - 1, currentXY.second - 1};
      if(isValidCellCoord(blocked1) && isValidCellCoord(blocked1) && !isPassable(blocked1) && !isPassable(blocked2)){
        // lambda!!
        auto sideOf = [&](Coord_t XY) { return XY.first >= currentXY.first && XY.second <= currentXY.second; };
        if(sideOf(nextXY) != sideOf(parentXY)) return true; // different sides, blocked
      }
      blocked1 = {currentXY.first - 1, currentXY.second}; blocked2 = {currentXY.first, currentXY.second - 1};
      if (isValidCellCoord(blocked1) && isValidCellCoord(blocked2) && !isPassable(blocked1) && !isPassable(blocked2)) {
        auto sideOf = [&](Coord_t XY){ return XY.first + XY.second > currentXY.first + currentXY.second; };
        if (sideOf(nextXY) != sideOf(parentXY)) {
          return true; // different sides, blocked
        }
      }
      return false;
    }

    bool nodeIsNeighbor(Coord_t &nextXY, NWSE nextNWSE, std::vector<std::array<int, 2>> &cardinalCoords)
    {
      if (vertexEnabled)
      {
        Coord_t parentXY = {-1,-1};
        if(currentNode->parent) parentXY = currentNode->parent->selfXY;
        if (nextXY.first != this->currentNodeXY.first && nextXY.second != this->currentNodeXY.second)
        {
          // diagonal crossing
          Coord_t coord = {std::min(nextXY.first, this->currentNodeXY.first), std::min(nextXY.second, this->currentNodeXY.second)};
          if (!isPassable(coord)) return false; // not passable
        }
        else
        {
          Coord_t c1, c2;
          // cardinal crossing
          if (nextXY.first != this->currentNodeXY.first)
          {
            c1 = {std::min(nextXY.first, this->currentNodeXY.first), nextXY.second};
            c2 = {std::min(nextXY.first, this->currentNodeXY.first), nextXY.second - 1};

            if(nextXY.second == 0 && !isPassable(c1)) return false; // edges of map
            else if(nextXY.second == gridWidth && !isPassable(c2)) return false;
          }
          else
          {
            c1 = {nextXY.first, std::min(nextXY.second, this->currentNodeXY.second)};
            c2 = {nextXY.first - 1, std::min(nextXY.second, this->currentNodeXY.second)};

            if(nextXY.first == 0 && !isPassable(c1)) return false; // edges of map
            else if(nextXY.first == gridHeight && !isPassable(c2)) return false;
          }
          if (!isPassable(c1) && !isPassable(c2)) return false; // not passable
        }
        // vertex is visible in either case. last check is for diagonal blocking
        if(!diagonalAllow) if(isDiagonalBlockedVertex(nextXY, currentNodeXY, parentXY)) return false;
      }
      else
      {
        if (!isPassable(nextXY)) return false;
        if (!diagonalAllow && neighborsIndex.size() == 8)
        { // if diagonal blocking is enabled
          // N: 0, W: 1, S: 2, E: 3
          if (nextNWSE == NW)
          {
            if (!isPassable(cardinalCoords[N]) && !isPassable(cardinalCoords[W]))
              return false;
          }
          else if (nextNWSE == SW)
          {
            if (!isPassable(cardinalCoords[S]) && !isPassable(cardinalCoords[W]))
              return false;
          }
          else if (nextNWSE == SE)
          {
            if (!isPassable(cardinalCoords[S]) && !isPassable(cardinalCoords[E]))
              return false;
          }
          else if (nextNWSE == NE)
          {
            if (!isPassable(cardinalCoords[N]) && !isPassable(cardinalCoords[E]))
              return false;
          }
        }
      }
      return true;
    }
  };
}

#endif