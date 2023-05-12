#include <iostream>
#include <vector>
#include <cmath>

#include "helper.hpp"

#ifndef LOS_HPP
#define LOS_HPP

std::vector<std::pair<double, double>> CustomLOSGenerator(std::pair<double, double> src, std::pair<double, double> tgt, bool cons = false, int correctLength = -1) {
  using coordDouble_t = std::pair<double, double>;
  
  auto pairDiff = [&](coordDouble_t a, coordDouble_t b){
    return coordDouble_t{a.first - b.first, a.second - b.second};
  };

  auto pairAbs = [&](coordDouble_t a){
    return coordDouble_t{std::abs(a.first), std::abs(a.second)};
  };

  auto pairFloor = [&](coordDouble_t a){
    return std::pair<int, int>{floor(a.first), floor(a.second)};
  };

   /* Helper Functions */

  auto conv = [&](bool absDx_Gt_absDy, const coordDouble_t& B) {
    return absDx_Gt_absDy ? coordDouble_t{B.first, B.second} : coordDouble_t{B.second, B.first};
  };
  
  auto convInt = [&](bool absDx_Gt_absDy, const std::pair<int, int>& B) {
    return absDx_Gt_absDy ? std::pair<int, int>{B.first, B.second} : std::pair<int, int>{B.second, B.first};
  };

  auto isEqual = [&](const coordDouble_t& A, const coordDouble_t& B) {
    return A.first == B.first && A.second == B.second;
  };

  auto isInt = [&](const coordDouble_t& A) {
    return trunc(A.first) == A.first && trunc(A.second) == A.second;
  };

  auto coord2String = [&](const coordDouble_t& coord) {
    return "[" + std::to_string(coord.first) + ", " + std::to_string(coord.second) + "]";
  };

  auto coords2String = [&](const std::vector<coordDouble_t>& coords) {
    std::string s;
    for (const auto& coord : coords) {
      s += coord2String(coord) + " ";
    }
    return s;
  };

  auto signum = [&](double x){ return (x > 0) - (x < 0); };

  const double THRES = 1e-3;

  /* addition to given algo */
  if(src.first + src.second < tgt.first + tgt.second) swap(src, tgt);  // swap the arrays
  else if(src.first + src.second == tgt.first + tgt.second){
    if(isInt(tgt) && !isInt(src)) swap(src, tgt);
  }
  /* end of addition */

  auto diffX = pairDiff(tgt, src);
  auto absX = pairAbs(diffX);

  auto cflag = absX.first > absX.second;

  auto diffZ = conv(cflag, diffX);
  auto absZ = pairAbs(diffZ);
  std::pair<int, int> dZ; dZ.first = signum(diffZ.first); dZ.second = signum(diffZ.second);

  auto srcZ = conv(cflag, src);
  auto tgtZ = conv(cflag, tgt);
  auto tgtFloorZ = pairFloor(tgtZ);
  auto floorZ = pairFloor(srcZ);
  auto prevS = srcZ.second;

  std::pair<int, int> psiZ; psiZ.first = dZ.first > 0 ? dZ.first : 0;  psiZ.second = dZ.second > 0 ? dZ.second : 0; 
  double cmp = ((double)floorZ.first + (double)psiZ.first - srcZ.first) * absZ.second / diffZ.first - dZ.second * psiZ.second;
  if(cons) std::cout << "diffZ.second: " << diffZ.second << ", absZ.first" << absZ.first << std::endl;
  double changeS = diffZ.second / absZ.first;

  /* addition to given algo */
  double gradient = (tgt.second - src.second) / (tgt.first - src.first);
  if(cons) std::cout << "Gradient: " << gradient << std::endl;
  /* end of addition */

  std::vector<coordDouble_t> path;
  /* addition to given algo */
  if(src.first > 0 && src.second > 0){
    auto srcFloor = pairFloor(src);
    if(src.first > srcFloor.first && src.second > srcFloor.second) path.push_back(srcFloor);
  }
  /* end of additon */

  if(cons) std::cout << "src, tgt: " << coord2String(src) << ", " << coord2String(tgt) <<std::endl;
  if(cons) std::cout << "initial path: " << coords2String(path) << std::endl;
  int step = 0;
  while(!isEqual(floorZ, tgtFloorZ)){
    if(cons) std::cout << "floorZ: " << coord2String(floorZ) << ", tgtFloorZ: " << coord2String(tgtFloorZ) << std::endl;
    step++;
    if(step > 20 || (correctLength != -1 && path.size() > correctLength)){
      std::cout << "ERROR: numsteps " << step << std::endl;
      return path;
    }

    double S = changeS * step + srcZ.second;
    if(cons) std::cout << "S: " << S << ", changeS: " << changeS << ", step: " << step << ", srcZ.second: " << srcZ.second << std::endl;
    auto floorS = floor(S);
    if(cons) std::cout << "floorS: " << floorS << std::endl;
    if(floorS != floorZ.second){
      // short incremented
      double cmpS = dZ.second * (floorZ.second - prevS);
      
      if(cons) std::cout << "cmpS: " << cmpS << ", cmp: " << cmp << std::endl;
      if(cmpS - THRES > cmp){
        // pass thru large first
        floorZ.first += dZ.first;
        path.push_back(convInt(cflag, floorZ));
        if(cons) std::cout << "small1: " << coord2String(convInt(cflag, floorZ)) << std::endl;
        if(isEqual(floorZ, tgtFloorZ)){
          break;  // reached destination
        }
        floorZ.second += dZ.second;
        if(cons) std::cout << "small2: " << coord2String(convInt(cflag, floorZ)) << std::endl;
      }
      else if(cmpS + THRES < cmp){
        // pass thru small first
        floorZ.second += dZ.second;
        path.push_back(convInt(cflag, floorZ));
        if(cons) std::cout << "long1: " << coord2String(convInt(cflag, floorZ)) << std::endl;
        if(isEqual(floorZ, tgtFloorZ)){
          break;
        }
        floorZ.first += dZ.first;
        if(cons) std::cout << "long2: " << coord2String(convInt(cflag, floorZ)) << std::endl;
      }
      else{
        // pass thru both at same time
        /* addition to given algo */
        // check if moving x reaches tgt
        auto floorZ1 = floorZ;
        floorZ1.first += dZ.first;
        if(isEqual(floorZ1, tgtFloorZ)){
          if(cons) std::cout << "eqx: out" << std::endl;
          break;
        }
        // then check y
        auto floorZ2 = floorZ;
        floorZ2.second += dZ.second;
        if(isEqual(floorZ2, tgtFloorZ)){
          if(cons) std::cout << "eqy: out" << std::endl;
          break;
        }
        /* end of addition */
        floorZ.first += dZ.first;
        floorZ.second += dZ.second;
        if(cons) std::cout << "eq: " << coord2String(convInt(cflag, floorZ)) << std::endl;
      }
    }
    else{
      // no change in short
      floorZ.first += dZ.first;
      if(cons) std::cout << "nc: " << coord2String(convInt(cflag, floorZ)) << std::endl;
    }
    if(cons) std::cout << "current path: " << coords2String(path) << std::endl;
    /* addition to given algo */
    if(isEqual(tgtFloorZ, floorZ) && cmp == -1)
      break;
    if(gradient == -1 && isInt(src)){
      prevS = S;
      continue;
    }
    /* end of addition */
    path.push_back(convInt(cflag, floorZ));
    prevS = S;
    if(cons) std::cout << "current path: " << coords2String(path) << std::endl;
  }

  if(cons) std::cout << "Final path: " << coords2String(path) << std::endl;\
  return path;
}

// LOS Checker

struct CustomLOSResult {
  bool boolean;
  std::pair<int, int> lastPassableCoordBeforeUnpassable;
};

CustomLOSResult CustomLOSChecker(std::pair<double, double> src, std::pair<double, double> tgt, grid_t grid, bool diagonaAllow) {
  if (grid.empty() || grid[0].empty())
    return {false, {0, 0}};

  int map_height = grid.size();
  int map_width = grid[0].size();

  if (src.first == tgt.first && src.second == tgt.second) {
    if (src.first == std::floor(src.first) && src.second == std::floor(src.second)) {
      return {true, {0, 0}};
    } else if (grid[static_cast<int>(std::floor(src.first))][static_cast<int>(std::floor(src.second))]) {
      return {false, {0, 0}};
    } else {
      return {true, {0, 0}};
    }
  }

  std::pair<int, int> src_dynamic;
  src.first == map_height ? src_dynamic.first = src.first - 1 : src_dynamic.first = src.first;
  src.second == map_width ? src_dynamic.second = src.second - 1 : src_dynamic.second = src.second;
  std::pair<int, int> tgt_dynamic;
  tgt.first == map_height ? tgt_dynamic.first = tgt.first - 1 : tgt_dynamic.first = tgt.first;
  tgt.second == map_width ? tgt_dynamic.second = tgt.second - 1 : tgt_dynamic.second = tgt.second;

  if ((src.first == tgt.first && std::floor(src.first) == src.first) ||
    (src.second == tgt.second && std::floor(src.second) == src.second)) {
    // Cardinal crossing (horizontal/vertical)
    int x1 = static_cast<int>(src.first), x0 = static_cast<int>(src.first) - 1;
    if (src.first == tgt.first) {
      if (src.first - 1 < 0) {
        // At top edge of canvas
        if (src.second > tgt.second) {
          for (int y = src_dynamic.second; y > tgt_dynamic.second - 1; --y) {
            if (grid[static_cast<int>(src.first)][y]) {
              return {false, {static_cast<int>(src.first), y + 1}};
            }
          }
          return {true, {0, 0}};
        }
        if (src.second < tgt.second) {
          for (int y = src_dynamic.second; y < tgt_dynamic.second; ++y) {
            if (grid[static_cast<int>(src.first)][y]) {
              return {false, {static_cast<int>(src.first), y}};
            }
          }
          return {true, {0, 0}};
        }
      } else if (src.first == map_height) {
        // At bottom edge of canvas
        if (src.second > tgt.second) {
          for (int y = src_dynamic.second; y > tgt_dynamic.second - 1; --y) {
            if (grid[static_cast<int>(src.first) - 1][y]) {
              return {false, {static_cast<int>(src.first), y + 1}};
            }
          }
          return {true, {0, 0}};
        }
        if (src.second < tgt.second) {
          for (int y = src_dynamic.second; y < tgt_dynamic.second; ++y) {
            if (grid[static_cast<int>(src.first) - 1][y]) {
              return {false, {static_cast<int>(src.first), y}};
            }
          }
          return {true, {0, 0}};
        }
      } else {
        // LOS is not at the edge of the canvas
        if (src.second > tgt.second) {
          for (int y = src_dynamic.second; y > tgt_dynamic.second - 1; --y) {
            if (grid[static_cast<int>(src.first) - 1][y] &&
              (grid[static_cast<int>(src.first)][y] == 0 || grid[static_cast<int>(src.first)][y])) {
              return {false, {static_cast<int>(src.first), y + 1}};
            }
          }
          return {true, {0, 0}};
        }
        if (src.second < tgt.second) {
          for (int y = src_dynamic.second; y < tgt_dynamic.second; ++y) {
            if (grid[static_cast<int>(src.first) - 1][y] &&
              (grid[static_cast<int>(src.first)][y] == 0 || grid[static_cast<int>(src.first)][y])) {
              return {false, {static_cast<int>(src.first), y}};
            }
          }
          return {true, {0, 0}};
        }
      }
    }

    int y1 = static_cast<int>(src.second), y0 = static_cast<int>(src.second) - 1;
    if (src.second == tgt.second) {
      if (src.second - 1 < 0) {
        // Travelling along edge of map
        if (src.first > tgt.first) {
          for (int x = src_dynamic.first; x > tgt_dynamic.first - 1; --x) {
            if (grid[x][static_cast<int>(src.second)]) {
              return {false, {x + 1, static_cast<int>(src.second)}};
            }
          }
          return {true, {0, 0}};
        }
        if (src.first < tgt.first) {
          for (int x = src_dynamic.first; x < tgt_dynamic.first; ++x) {
            if (grid[x][static_cast<int>(src.second)]) {
              return {false, {x, static_cast<int>(src.second)}};
            }
          }
          return {true, {0, 0}};
        }
      } else if (src.second == map_width) {
        if (src.first > tgt.first) {
          for (int x = src_dynamic.first; x > tgt_dynamic.first - 1; --x) {
            if (grid[x][static_cast<int>(src.second) - 1]) {
              return {false, {x + 1, static_cast<int>(src.second)}};
            }
          }
          return {true, {0, 0}};
        }
        if (src.first < tgt.first) {
          for (int x = src_dynamic.first; x < tgt_dynamic.first; ++x) {
            if (grid[x][static_cast<int>(src.second) - 1]) {
              return {false, {x, static_cast<int>(src.second)}};
            }
          }
          return {true, {0, 0}};
        }
      } else {
        if (src.first > tgt.first) {
          for (int x = src_dynamic.first; x > tgt_dynamic.first - 1; --x) {
            if (grid[x][static_cast<int>(src.second) - 1] &&
              (grid[x][static_cast<int>(src.second)] == 0 || grid[x][static_cast<int>(src.second)])) {
              return {false, {x + 1, static_cast<int>(src.second)}};
            }
          }
          return {true, {0, 0}};
        }
        if (src.first < tgt.first) {
          for (int x = src_dynamic.first; x < tgt_dynamic.first; ++x) {
            if (grid[x][static_cast<int>(src.second) - 1] &&
              (grid[x][static_cast<int>(src.second)] == 0 || grid[x][static_cast<int>(src.second)])) {
              return {false, {x, static_cast<int>(src.second)}};
            }
          }
          return {true, {0, 0}};
        }
      }
    }
  } else {
    // Non-cardinal crossing
    auto path = CustomLOSGenerator(src, tgt, false);
    int prevX = -1, prevY = -1;
    for (auto& coord : path) {
      int x = coord.first;
      int y = coord.second;

      if (!diagonaAllow && prevX != -1 && prevY != -1 && x != prevX &&
        y != prevY) {
        // Diagonal crossing
        if (grid[x][prevY] && grid[prevX][y]) {
          // Diagonal is blocked
          return {false, {0, 0}};
        }
      }

      if (grid[x][y]) {
        return {false, {0, 0}};
      }
      prevX = x;
      prevY = y;
    }
    return {true, {0, 0}};
  }
}

#endif