#include <vector>
#include <iostream>
#include <utility>
#include <map>
#include <cmath>     // M_SQRT2
#include <chrono>
#include <unordered_map>

#ifndef HELPER_HPP
#define HELPER_HPP
#define USE_MATH_DEFINES

#define STEP_STRUCT_METHOD
//#define VECTOR_METHOD
#define BIT_SHIFT_COORD
#define CANVAS_GRID
#define CANVAS_COMPRESSED

bool runOnce = true;

using coord_t = std::pair<int, int>;
using line_t = std::array<int, 4>;
using row_t = std::vector<uint8_t>;
using grid_t = std::vector<row_t>;
using rowf_t = std::vector<double>;
using gridf_t = std::vector<rowf_t>;
using neighbors_t = std::vector<uint8_t>;
using path_t = std::vector<coord_t>;
using bound_t = std::pair<double, double>;

const double THRESH = 1e-8;

struct CoordDoubleHash {
  std::size_t operator()(const std::pair<double, double>& p) const {
    return std::hash<double>()(p.first) ^ std::hash<double>()(p.second);
  }
};
struct CoordIntHash {
  std::size_t operator()(const coord_t& p) const {
    size_t a = std::hash<int>()(p.first);
    size_t b = std::hash<int>()(p.second);
    return a >= b ? a * a + a + b : a + b * b;
  }
};

// combine everything into uint32_t (10bits per coord dim, 12 btis for Dest)
#ifdef BIT_SHIFT_COORD
// change coord_t to number: (uint64_t)(x) << 32 | (uint64_t)(y) -> uint64_t
using state_canvas_t = std::unordered_map<uint32_t, double>;
#else
using state_canvas_t = std::unordered_map<coord_t, double, CoordIntHash>;
#endif


template <class T>
class Empty2D{
  std::vector<std::vector<T>> data;
  std::map<coord_t, T> dataHashMap;
  bool allowFloat;
public:
  Empty2D(){
    data = std::vector<std::vector<T>>(0, std::vector<T>(0, NULL));
  }
    
  Empty2D(int height, int width, bool allowFloat = false) : allowFloat(allowFloat){
    if(!allowFloat)
      data = std::vector<std::vector<T>>(height, std::vector<T>(width, NULL));
  }

  void set(coord_t &xy, T item){
    if(allowFloat) dataHashMap[{xy.first, xy.second}] = item;
    else data[xy.first][xy.second] = item;
  }

  T get(coord_t &xy){
    if(allowFloat) return dataHashMap[{xy.first, xy.second}];
    return data[xy.first][xy.second];
  }

  void clear(){
    if(allowFloat){
      for(auto it : dataHashMap) delete it.second;
      dataHashMap.clear();
    }
    else{
      for(int i = 0; i < data.size(); ++i){
        for(int j = 0; j < data[i].size(); ++j){
          delete data[i][j];
          data[i][j] = NULL;
        }
      }
    }
  }
};

double roundDP(double n, int dp){
  const double mul = pow(10, dp);
  return floor(n * mul + 0.5) / mul;
}

double roundSF(double n, int sf){
  const int dp = sf - floor(log10(n + 1));
  return roundDP(n, dp);
}

bool coordIsEqual(const coord_t &c1, const coord_t &c2){
  return c1.first == c2.first && c1.second == c2.second;
}

bool isArrayEqual(const line_t &e1, const line_t &e2){
  return e1[0] == e2[0] && e1[1] == e2[1] && e1[2] == e2[2] && e1[3] == e2[3];
}

grid_t makeGrid(int height, int width, int defVal = 0){
  return grid_t(height, row_t(width, defVal));
}

gridf_t makeGridf(int height, int width, double defVal = 0){
  return gridf_t(height, rowf_t(width, defVal));
}

rowf_t makeFlatGridf(int height, int width, double defVal = 0){
  return rowf_t(height * width, defVal);
}

uint32_t coord2uint32(coord_t c){ return ((uint32_t)(c.first) << 16) | (uint32_t)(c.second); }
uint32_t coord2uint32(uint32_t x, uint32_t y){ return ((x) << 16) | (y); }

coord_t uint322coord(uint32_t c){
  return {c>>16, c & ((1 << 16) - 1)};
}

#endif