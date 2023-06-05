#include <iostream>
#include <vector>
#include <cmath>

#include "helper.hpp"

#ifndef LOS_HPP
#define LOS_HPP

namespace pathfinder{

using pairDouble = std::pair<double, double>;

// int signum(double x){ return (x > 0) - (x < 0); };

// pairDouble pairDiff(const pairDouble& a, const pairDouble& b){
//   return pairDouble{a.first - b.first, a.second - b.second};
// };

// pairDouble pairAbs(const pairDouble& a){
//   return pairDouble{std::abs(a.first), std::abs(a.second)};
// };

// std::pair<int, int> pairFloor(const pairDouble& a){
//   return std::pair<int, int>{floor(a.first), floor(a.second)};
// };

// pairDouble conv(bool absDx_Gt_absDy, const pairDouble& B) {
//   return absDx_Gt_absDy ? pairDouble{B.first, B.second} : pairDouble{B.second, B.first};
// };

// std::pair<int, int> convInt(bool absDx_Gt_absDy, const std::pair<int, int>& B) {
//   return absDx_Gt_absDy ? std::pair<int, int>{B.first, B.second} : std::pair<int, int>{B.second, B.first};
// };

// inline bool isEqual(const pairDouble& A, const pairDouble& B) {
//   return A.first == B.first && A.second == B.second;
// };

// bool isInt(const pairDouble& A) {
//   return trunc(A.first) == A.first && trunc(A.second) == A.second;
// };

std::vector<pairDouble> CustomLOSGenerator(pairDouble src, pairDouble tgt, bool cons = false, int correctLength = -1) {
  
  auto signum = [&](double x){ return (x > 0) - (x < 0); };

  auto pairDiff = [&](const pairDouble& a, const pairDouble& b){
    return pairDouble{a.first - b.first, a.second - b.second};
  };

  auto pairAbs = [&](const pairDouble& a){
    return pairDouble{std::abs(a.first), std::abs(a.second)};
  };

  auto pairFloor = [&](const pairDouble& a){
    return std::pair<int, int>{floor(a.first), floor(a.second)};
  };

   /* Helper Functions */

  auto conv = [&](bool absDx_Gt_absDy, const pairDouble& B) {
    return absDx_Gt_absDy ? pairDouble{B.first, B.second} : pairDouble{B.second, B.first};
  };
  
  auto convInt = [&](bool absDx_Gt_absDy, const std::pair<int, int>& B) {
    return absDx_Gt_absDy ? std::pair<int, int>{B.first, B.second} : std::pair<int, int>{B.second, B.first};
  };

  auto isEqual = [&](const pairDouble& A, const pairDouble& B) {
    return A.first == B.first && A.second == B.second;
  };

  auto isInt = [&](const pairDouble& A) {
    return trunc(A.first) == A.first && trunc(A.second) == A.second;
  };

  #ifdef LOS_DEBUG
  auto coord2String = [&](const pairDouble& coord) {
    return "[" + std::to_string(coord.first) + ", " + std::to_string(coord.second) + "]";
  };

  auto coords2String = [&](const std::vector<pairDouble>& coords) {
    std::string s;
    for (const auto& coord : coords) {
      s += coord2String(coord) + " ";
    }
    return s;
  };
  #endif

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
  
  #ifdef LOS_DEBUG
  std::cout << "diffZ.second: " << diffZ.second << ", absZ.first" << absZ.first << std::endl;
  #endif

  double changeS = diffZ.second / absZ.first;

  /* addition to given algo */
  double gradient = (tgt.second - src.second) / (tgt.first - src.first);
  #ifdef LOS_DEBUG
  std::cout << "Gradient: " << gradient << std::endl;
  #endif
  /* end of addition */

  std::vector<pairDouble> path;
  /* addition to given algo */
  if(src.first > 0 && src.second > 0){
    auto srcFloor = pairFloor(src);
    if(src.first > srcFloor.first && src.second > srcFloor.second) path.push_back(srcFloor);
  }
  /* end of additon */

  #ifdef LOS_DEBUG
  std::cout << "src, tgt: " << coord2String(src) << ", " << coord2String(tgt) <<std::endl;
  std::cout << "initial path: " << coords2String(path) << std::endl;
  #endif
  
  int step = 0;
  while(!isEqual(floorZ, tgtFloorZ)){
    #ifdef LOS_DEBUG
    std::cout << "floorZ: " << coord2String(floorZ) << ", tgtFloorZ: " << coord2String(tgtFloorZ) << std::endl;
    #endif
    step++;
    // if((correctLength != -1 && path.size() > correctLength)){
    //   std::cout << "ERROR: numsteps " << step << std::endl;
    //   return path;
    // }

    double S = changeS * step + srcZ.second;
    auto floorS = floor(S);
    #ifdef LOS_DEBUG
    std::cout << "S: " << S << ", changeS: " << changeS << ", step: " << step << ", srcZ.second: " << srcZ.second << std::endl;
    std::cout << "floorS: " << floorS << std::endl;
    #endif
    if(floorS != floorZ.second){
      // short incremented
      double cmpS = dZ.second * (floorZ.second - prevS);
      
      #ifdef LOS_DEBUG
      std::cout << "cmpS: " << cmpS << ", cmp: " << cmp << std::endl;
      #endif
      if(cmpS - THRES > cmp){
        // pass thru large first
        floorZ.first += dZ.first;
        path.push_back(convInt(cflag, floorZ));
        #ifdef LOS_DEBUG
        std::cout << "small1: " << coord2String(convInt(cflag, floorZ)) << std::endl;
        #endif

        if(isEqual(floorZ, tgtFloorZ)){
          break;  // reached destination
        }
        floorZ.second += dZ.second;
        #ifdef LOS_DEBUG
        std::cout << "small2: " << coord2String(convInt(cflag, floorZ)) << std::endl;
        #endif
      }
      else if(cmpS + THRES < cmp){
        // pass thru small first
        floorZ.second += dZ.second;
        path.push_back(convInt(cflag, floorZ));
        #ifdef LOS_DEBUG
        std::cout << "long1: " << coord2String(convInt(cflag, floorZ)) << std::endl;
        #endif
        if(isEqual(floorZ, tgtFloorZ)){
          break;
        }
        floorZ.first += dZ.first;
        #ifdef LOS_DEBUG
        std::cout << "long2: " << coord2String(convInt(cflag, floorZ)) << std::endl;
        #endif
      }
      else{
        // pass thru both at same time
        /* addition to given algo */
        // check if moving x reaches tgt
        auto floorZ1 = floorZ;
        floorZ1.first += dZ.first;
        if(isEqual(floorZ1, tgtFloorZ)){
          #ifdef LOS_DEBUG
          std::cout << "eqx: out" << std::endl;
          #endif
          break;
        }
        // then check y
        auto floorZ2 = floorZ;
        floorZ2.second += dZ.second;
        if(isEqual(floorZ2, tgtFloorZ)){
          #ifdef LOS_DEBUG
          std::cout << "eqy: out" << std::endl;
          #endif
          break;
        }
        /* end of addition */
        floorZ.first += dZ.first;
        floorZ.second += dZ.second;
        #ifdef LOS_DEBUG
        std::cout << "eq: " << coord2String(convInt(cflag, floorZ)) << std::endl;
        #endif
      }
    }
    else{
      // no change in short
      floorZ.first += dZ.first;
      #ifdef LOS_DEBUG
      std::cout << "nc: " << coord2String(convInt(cflag, floorZ)) << std::endl;
      #endif
    }
    #ifdef LOS_DEBUG
    std::cout << "current path: " << coords2String(path) << std::endl;
    #endif
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
    #ifdef LOS_DEBUG
    std::cout << "current path: " << coords2String(path) << std::endl;
    #endif
  }
  #ifdef LOS_DEBUG
  std::cout << "Final path: " << coords2String(path) << std::endl;
  #endif

  return path;
}

// LOS Checker(combined with generator)

bool CustomLOSDiagonalChecker(grid_t& grid, bool diagonalAllow, pairDouble src, pairDouble tgt, bool cons = false, int correctLength = -1) {
  
  auto isBlocked = [&](const pairDouble& a){ return grid[a.first][a.second] == 0; };

  auto signum = [&](double x){ return (x > 0) - (x < 0); };

  auto pairDiff = [&](const pairDouble& a, const pairDouble& b){
    return pairDouble{a.first - b.first, a.second - b.second};
  };

  auto pairAbs = [&](const pairDouble& a){
    return pairDouble{std::abs(a.first), std::abs(a.second)};
  };

  auto pairFloor = [&](const pairDouble& a){
    return std::pair<int, int>{floor(a.first), floor(a.second)};
  };

   /* Helper Functions */

  auto conv = [&](bool absDx_Gt_absDy, const pairDouble& B) {
    return absDx_Gt_absDy ? pairDouble{B.first, B.second} : pairDouble{B.second, B.first};
  };
  
  auto convInt = [&](bool absDx_Gt_absDy, const std::pair<int, int>& B) {
    return absDx_Gt_absDy ? std::pair<int, int>{B.first, B.second} : std::pair<int, int>{B.second, B.first};
  };

  auto convIntRef = [&](bool absDx_Gt_absDy, const std::pair<int, int>& B, std::pair<int, int>& R) {
    if(absDx_Gt_absDy){
      R.first = B.first; R.second = B.second;
    }
    else{
      R.first = B.second; R.second = B.first;
    }
  };

  auto isEqual = [&](const pairDouble& A, const pairDouble& B) {
    return A.first == B.first && A.second == B.second;
  };

  auto isInt = [&](const pairDouble& A) {
    return trunc(A.first) == A.first && trunc(A.second) == A.second;
  };

  #ifdef LOS_DEBUG
  auto coord2String = [&](const pairDouble& coord) {
    return "[" + std::to_string(coord.first) + ", " + std::to_string(coord.second) + "]";
  };

  auto coords2String = [&](const std::vector<pairDouble>& coords) {
    std::string s;
    for (const auto& coord : coords) {
      s += coord2String(coord) + " ";
    }
    return s;
  };
  #endif

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
  
  #ifdef LOS_DEBUG
  std::cout << "diffZ.second: " << diffZ.second << ", absZ.first" << absZ.first << std::endl;
  #endif

  double changeS = diffZ.second / absZ.first;

  /* addition to given algo */
  double gradient = (tgt.second - src.second) / (tgt.first - src.first);
  #ifdef LOS_DEBUG
  std::cout << "Gradient: " << gradient << std::endl;
  #endif
  /* end of addition */

  /* addition to given algo */
  std::pair<int, int> prevFloorZ = {-1, -1};
  std::pair<int, int> chkFloorZ = {-1, -1};
  bool hasPrevFloorZ = false;

  if(src.first > 0 && src.second > 0){
    auto srcFloor = pairFloor(src);
    if(src.first > srcFloor.first && src.second > srcFloor.second){
      if(isBlocked(srcFloor)) // blocked
        return false;
      prevFloorZ = srcFloor;
      hasPrevFloorZ = true;
    }
  }
  /* end of additon */

  #ifdef LOS_DEBUG
  std::cout << "src, tgt: " << coord2String(src) << ", " << coord2String(tgt) <<std::endl;
  std::cout << "initial path: " << coords2String(path) << std::endl;
  #endif

  
  int step = 0;
  while(!isEqual(floorZ, tgtFloorZ)){
    #ifdef LOS_DEBUG
    std::cout << "floorZ: " << coord2String(floorZ) << ", tgtFloorZ: " << coord2String(tgtFloorZ) << std::endl;
    #endif
    step++;
    // if((correctLength != -1 && path.size() > correctLength)){
    //   std::cout << "ERROR: numsteps " << step << std::endl;
    //   return path;
    // }

    double S = changeS * step + srcZ.second;
    auto floorS = floor(S);
    #ifdef LOS_DEBUG
    std::cout << "S: " << S << ", changeS: " << changeS << ", step: " << step << ", srcZ.second: " << srcZ.second << std::endl;
    std::cout << "floorS: " << floorS << std::endl;
    #endif
    if(floorS != floorZ.second){
      // short incremented
      double cmpS = dZ.second * (floorZ.second - prevS);
      
      #ifdef LOS_DEBUG
      std::cout << "cmpS: " << cmpS << ", cmp: " << cmp << std::endl;
      #endif
      if(cmpS - THRES > cmp){
        // pass thru large first
        floorZ.first += dZ.first;
        convIntRef(cflag, floorZ, chkFloorZ);
        if(isBlocked(chkFloorZ)) return false;
        if(!diagonalAllow && hasPrevFloorZ){
          if(isBlocked({prevFloorZ.first, chkFloorZ.second}) && isBlocked({chkFloorZ.first, prevFloorZ.second})) return false;
        }
        prevFloorZ.first = chkFloorZ.first; prevFloorZ.second = chkFloorZ.second;
        #ifdef LOS_DEBUG
        std::cout << "small1: " << coord2String(convInt(cflag, floorZ)) << std::endl;
        #endif

        if(isEqual(floorZ, tgtFloorZ)){
          break;  // reached destination
        }
        floorZ.second += dZ.second;
        #ifdef LOS_DEBUG
        std::cout << "small2: " << coord2String(convInt(cflag, floorZ)) << std::endl;
        #endif
      }
      else if(cmpS + THRES < cmp){
        // pass thru small first
        floorZ.second += dZ.second;
        convIntRef(cflag, floorZ, chkFloorZ);
        if(isBlocked(chkFloorZ)) return false;
        if(!diagonalAllow && hasPrevFloorZ){
          if(isBlocked({prevFloorZ.first, chkFloorZ.second}) && isBlocked({chkFloorZ.first, prevFloorZ.second})) return false;
        }
        prevFloorZ.first = chkFloorZ.first; prevFloorZ.second = chkFloorZ.second;
        #ifdef LOS_DEBUG
        std::cout << "long1: " << coord2String(convInt(cflag, floorZ)) << std::endl;
        #endif
        if(isEqual(floorZ, tgtFloorZ)){
          break;
        }
        floorZ.first += dZ.first;
        #ifdef LOS_DEBUG
        std::cout << "long2: " << coord2String(convInt(cflag, floorZ)) << std::endl;
        #endif
      }
      else{
        // pass thru both at same time
        /* addition to given algo */
        // check if moving x reaches tgt
        auto floorZ1 = floorZ;
        floorZ1.first += dZ.first;
        if(isEqual(floorZ1, tgtFloorZ)){
          #ifdef LOS_DEBUG
          std::cout << "eqx: out" << std::endl;
          #endif
          break;
        }
        // then check y
        auto floorZ2 = floorZ;
        floorZ2.second += dZ.second;
        if(isEqual(floorZ2, tgtFloorZ)){
          #ifdef LOS_DEBUG
          std::cout << "eqy: out" << std::endl;
          #endif
          break;
        }
        /* end of addition */
        floorZ.first += dZ.first;
        floorZ.second += dZ.second;
        #ifdef LOS_DEBUG
        std::cout << "eq: " << coord2String(convInt(cflag, floorZ)) << std::endl;
        #endif
      }
    }
    else{
      // no change in short
      floorZ.first += dZ.first;
      #ifdef LOS_DEBUG
      std::cout << "nc: " << coord2String(convInt(cflag, floorZ)) << std::endl;
      #endif
    }
    #ifdef LOS_DEBUG
    std::cout << "current path: " << coords2String(path) << std::endl;
    #endif
    /* addition to given algo */
    if(isEqual(tgtFloorZ, floorZ) && cmp == -1)
      break;
    if(gradient == -1 && isInt(src)){
      prevS = S;
      continue;
    }
    /* end of addition */
    convIntRef(cflag, floorZ, chkFloorZ);
    if(isBlocked(chkFloorZ)) return false;
    if(!diagonalAllow && hasPrevFloorZ){
      if(isBlocked({prevFloorZ.first, chkFloorZ.second}) && isBlocked({chkFloorZ.first, prevFloorZ.second})) return false;
    }
    prevFloorZ.first = chkFloorZ.first; prevFloorZ.second = chkFloorZ.second;
    prevS = S;
    #ifdef LOS_DEBUG
    std::cout << "current path: " << coords2String(path) << std::endl;
    #endif
  }
  #ifdef LOS_DEBUG
  std::cout << "Final path: " << coords2String(path) << std::endl;
  #endif

  return true;
}

// LOS Checker

struct CustomLOSResult {
  bool boolean;
  std::pair<int, int> lastPassableCoordBeforeUnpassable;
};

CustomLOSResult CustomLOSChecker(std::pair<double, double> src, std::pair<double, double> tgt, grid_t& grid, bool diagonalAllow) {
  // c++ implementation checks for opposite values of grid[][] because it uses 1: passable and 0: blocked
  // JS implementation uses bg.canvas_cache which takes 1: blocked and 0: passable
  if (grid.empty() || grid[0].empty())
    return {false, {0, 0}};

  int map_height = grid.size();
  int map_width = grid[0].size();

  if (src.first == tgt.first && src.second == tgt.second) {
    if (src.first == std::floor(src.first) && src.second == std::floor(src.second)) {
      return {true, {0, 0}};
    } else if (grid[static_cast<int>(std::floor(src.first))][static_cast<int>(std::floor(src.second))] == 0) {
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
    int srcXInt = static_cast<int>(src.first);
    int srcYInt = static_cast<int>(src.second);

    if (src.first == tgt.first) {
      if (src.first - 1 < 0) {
        // At top edge of canvas
        if (src.second > tgt.second) {
          for (int y = src_dynamic.second; y > tgt_dynamic.second - 1; --y) {
            if (grid[srcXInt][y] == 0) {
              return {false, {srcXInt, y + 1}};
            }
          }
          return {true, {0, 0}};
        }
        if (src.second < tgt.second) {
          for (int y = src_dynamic.second; y < tgt_dynamic.second; ++y) {
            if (grid[srcXInt][y] == 0) {
              return {false, {srcXInt, y}};
            }
          }
          return {true, {0, 0}};
        }
      } else if (src.first == map_height) {
        // At bottom edge of canvas
        if (src.second > tgt.second) {
          for (int y = src_dynamic.second; y > tgt_dynamic.second - 1; --y) {
            if (grid[srcXInt - 1][y] == 0) {
              return {false, {srcXInt, y + 1}};
            }
          }
          return {true, {0, 0}};
        }
        if (src.second < tgt.second) {
          for (int y = src_dynamic.second; y < tgt_dynamic.second; ++y) {
            if (grid[srcXInt - 1][y] == 0) {
              return {false, {srcXInt, y}};
            }
          }
          return {true, {0, 0}};
        }
      } else {
        // LOS is not at the edge of the canvas
        if (src.second > tgt.second) {
          for (int y = src_dynamic.second; y > tgt_dynamic.second - 1; --y) {
            if (grid[srcXInt - 1][y] == 0 &&
              (y >= grid[0].size() || y < 0 || grid[srcXInt][y] == 0)) {
              return {false, {srcXInt, y + 1}};
            }
          }
          return {true, {0, 0}};
        }
        if (src.second < tgt.second) {
          for (int y = src_dynamic.second; y < tgt_dynamic.second; ++y) {
            if (grid[srcXInt - 1][y] == 0 &&
              (y >= grid[0].size() || y < 0 || grid[srcXInt][y] == 0)) {
              return {false, {srcXInt, y}};
            }
          }
          return {true, {0, 0}};
        }
      }
    }

    if (src.second == tgt.second) {
      if (src.second - 1 < 0) {
        // Travelling along edge of map
        if (src.first > tgt.first) {
          for (int x = src_dynamic.first; x > tgt_dynamic.first - 1; --x) {
            if (grid[x][srcYInt] == 0) {
              return {false, {x + 1, srcYInt}};
            }
          }
          return {true, {0, 0}};
        }
        if (src.first < tgt.first) {
          for (int x = src_dynamic.first; x < tgt_dynamic.first; ++x) {
            if (grid[x][srcYInt] == 0) {
              return {false, {x, srcYInt}};
            }
          }
          return {true, {0, 0}};
        }
      } else if (src.second == map_width) {
        if (src.first > tgt.first) {
          for (int x = src_dynamic.first; x > tgt_dynamic.first - 1; --x) {
            if (grid[x][srcYInt - 1] == 0) {
              return {false, {x + 1, srcYInt}};
            }
          }
          return {true, {0, 0}};
        }
        if (src.first < tgt.first) {
          for (int x = src_dynamic.first; x < tgt_dynamic.first; ++x) {
            if (grid[x][srcYInt - 1] == 0) {
              return {false, {x, srcYInt}};
            }
          }
          return {true, {0, 0}};
        }
      } else {
        if (src.first > tgt.first) {
          for (int x = src_dynamic.first; x > tgt_dynamic.first - 1; --x) {
            if (grid[x][srcYInt - 1] == 0 &&
              (src.second >=grid[x].size() || src.second < 0 || grid[x][srcYInt] == 0)) {
              return {false, {x + 1, srcYInt}};
            }
          }
          return {true, {0, 0}};
        }
        if (src.first < tgt.first) {
          for (int x = src_dynamic.first; x < tgt_dynamic.first; ++x) {
            if (grid[x][srcYInt - 1] &&
              (src.second >=grid[x].size() || src.second < 0 || grid[x][srcYInt] == 0)) {
              return {false, {x, srcYInt}};
            }
          }
          return {true, {0, 0}};
        }
      }
    }
  } else {
    // Non-cardinal crossing
    bool res = CustomLOSDiagonalChecker(grid, diagonalAllow, src, tgt);
    return {res, {0, 0}};
    // auto path = CustomLOSGenerator(src, tgt);
    // int prevX = -1, prevY = -1;
    // for (auto& coord : path) {
    //   int x = coord.first;
    //   int y = coord.second;

    //   if (!diagonalAllow && prevX != -1 && prevY != -1 && x != prevX &&
    //     y != prevY) {
    //     // Diagonal crossing
    //     if (grid[x][prevY] == 0 && grid[prevX][y] == 0) {
    //       // Diagonal is blocked
    //       return {false, {0, 0}};
    //     }
    //   }

    //   if (grid[x][y] == 0) {
    //     return {false, {0, 0}};
    //   }
    //   prevX = x;
    //   prevY = y;
    // }
    // return {true, {0, 0}};
  }
  return {false, {0, 0}};
}

}

#endif