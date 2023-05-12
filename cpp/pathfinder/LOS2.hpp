#include <vector>
#include <utility>
#include <cmath>
#include <iostream>
#include "helper.hpp"

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
  src.first == map_width ? src_dynamic.first = src.first - 1 : src_dynamic.first = src.first;
  src.second == map_width ? src_dynamic.second = src.second - 1 : src_dynamic.second = src.second;
  std::pair<int, int> tgt_dynamic;
  tgt.first == map_width ? tgt_dynamic.first = tgt.first - 1 : tgt_dynamic.first = tgt.first;
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

