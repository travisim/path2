#include "A_star.hpp"
#include "LOS.hpp"

#ifndef THETASTAR_HPP
#define THETASTAR_HPP

namespace pathfinder{
  template <typename Action_t>
  class Theta_star : public A_star<Action_t>{
  private:
    using Coord_t = typename Action_t::CoordType;
    using A_star<Action_t>::currentNode;
    using A_star<Action_t>::goal;
    using A_star<Action_t>::chosenCost;
    using A_star<Action_t>::grid;
    using A_star<Action_t>::vertexEnabled;
    using A_star<Action_t>::diagonalAllow;
    using A_star<Action_t>::parentNode;
    using A_star<Action_t>::gCoeff;
    using A_star<Action_t>::hCoeff;

    using A_star<Action_t>::manhattan;
    using A_star<Action_t>::euclidean;
    using A_star<Action_t>::chebyshev;
    using A_star<Action_t>::octile;

    inline bool showFreeVertex(){ return true; }
    
    std::array<double, 3> calcCost(Coord_t nextXY)
    {
      parentNode = currentNode;
      /* addition to A* */
      if(currentNode->parent){
        const double OFFSET = vertexEnabled ? 0.0 : 0.5;
        coordDouble_t src = {(double)currentNode->parent->selfXY.first + OFFSET, (double)currentNode->parent->selfXY.second + OFFSET};
        coordDouble_t tgt = {(double)nextXY.first + OFFSET, (double)nextXY.second + OFFSET};
        auto res = CustomLOSChecker(src, tgt, grid, diagonalAllow).boolean;
        // std::cout<<src.first<<','<<src.second<<' '<<tgt.first<<','<<tgt.second<<": ";
        // if(res) std::cout<<"have LOS\n";
        // else std::cout<<"no LOS\n";
        if(res)
          parentNode = currentNode->parent;
      }
      /* end of addition to A* */

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

  };

  
}

#endif