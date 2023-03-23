#ifndef HELPER_HPP
#define HELPER_HPP
#define USE_MATH_DEFINES

#include <vector>
#include <iostream>
#include <utility>
#include <map>
#include <chrono>
#include <cstdint>

using coord_t = std::pair<int, int>;
using row_t = std::vector<uint8_t>;
using grid_t = std::vector<row_t>;
using neighbors_t = std::vector<uint8_t>;
using path_t = std::vector<coord_t>;

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

bool isArrayEqual(const std::array<int, 4> &e1, const std::array<int, 4> &e2){
  return e1[0] == e2[0] && e1[1] == e2[1] && e1[2] == e2[2] && e1[3] == e2[3];
}

grid_t makeGrid(int height, int width, int defVal = 0){
  return grid_t(height, row_t(width, defVal));
}

grid_t deepCopyGrid(const grid_t &grid){
  grid_t ret = makeGrid(grid.size(), grid[0].size());
  for(int i = 0; i < grid.size(); ++i){
    for(int j = 0; j < grid[0].size(); ++j){
      ret[i][j] = grid[i][j];
    }
  }
  return ret;
}

#endif