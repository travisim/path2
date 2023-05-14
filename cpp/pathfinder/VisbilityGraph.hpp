#include <vector>
#include "pathfinder.hpp"
#include "rbt_pq.hpp"

#ifndef VGRAPH_HPP
#define VGRAPH_HPP

namespace pathfinder{

struct Preset {
  std::vector<std::vector<int8_t>> data;
  std::vector<coordInt_t> coords;
};

std::vector<coordInt_t> cornerCoords(grid_t& gridObj, int kernelSize, int startX, int startY, bool vertex = true) {
  constexpr int8_t N = -1;

  auto checkAgainstPresets = [&](const std::vector<Preset>& presets) {
    for (const auto& preset : presets) {
      presetLoop:;
      for (int i = 0; i < kernelSize; ++i) {
        for (int j = 0; j < kernelSize; ++j) {
          if (preset.data[i][j] == N) continue; // skip for null
          if (preset.data[i][j] != gridObj[i + startX][j + startY]) {
            goto presetLoop;
          }
        }
      }
      return preset.coords;
    }
    return std::vector<coordInt_t>(); // empty vector to represent null
  };

  if (kernelSize == 2) {
    if (vertex) {
      int cnt = 0;
      for (int i = startX; i < startX + kernelSize; ++i) {
        for (int j = startY; j < startY + kernelSize; ++j) {
          if (gridObj[i][j]) cnt++;
        }
      }
      if (cnt == 3) return {{startX + 1, startY + 1}};
    } else {
      std::vector<Preset> presets = {
        // squares & L-shapes (centered)
        {
          {{1, 1},
           {1, 0}},
          {{0, 0}}
        },
        {
          {{1, 1},
           {0, 1}},
          {{0, 1}}
        },
        {
          {{0, 1},
           {1, 1}},
          {{1, 1}}
        },
        {
          {{1, 0},
           {1, 1}},
          {{1, 0}}
        }
      };

      return checkAgainstPresets(presets);
    }
  }

  return std::vector<coordInt_t>(); // empty vector to represent null
}

template <typename Action_t>
class VisibilityGraph : public Pathfinder<Action_t>{
  using Coord_t = typename Action_t::CoordType;
  std::vector<MapNode<Coord_t>> mapNodes;
  bool showNetworkGraph;

  std::array<double, 3> calcCost(Coord_t nextXY)
  {    
    const int curX = currentNode->selfXY.first, curY = currentNode->selfXY.second;
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
    //return new Node<Coord_t>(nextXY, currentNode, -1, gCoeff * gCost + hCoeff * hCost, gCost, hCost);
  }

  void generateNewMap(Coord_t start, Coord_t goal){
    mapNodes.clear();
    
  }

};

}

#endif