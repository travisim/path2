#ifndef HELPER_HPP
#define HELPER_HPP
#define USE_MATH_DEFINES

#include <vector>
#include <iostream>
#include <utility>
#include <map>
#include <chrono>
#include <cstdint>

using row_t = std::vector<uint8_t>;
using grid_t = std::vector<row_t>;
using neighbors_t = std::vector<uint8_t>;
using path_t = std::vector<std::pair<int, int>>;

template <class T>
class Empty2D{
  std::vector<std::vector<T>> data;
  std::map<std::pair<int, int>, T> dataHashMap;
  bool allowFloat;
public:
  Empty2D(){
    data = std::vector<std::vector<T>>(0, std::vector<T>(0, NULL));
  }
    
  Empty2D(int height, int width, bool allowFloat = false) : allowFloat(allowFloat){
    if(!allowFloat)
      data = std::vector<std::vector<T>>(height, std::vector<T>(width, NULL));
  }

  void set(std::pair<int, int> &xy, T item){
    if(allowFloat) dataHashMap[{xy.first, xy.second}] = item;
    else data[xy.first][xy.second] = item;
  }

  T get(std::pair<int, int> &xy){
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

bool coordIsEqual(const std::pair<int, int> &c1, const std::pair<int, int> &c2){
  return c1.first == c2.first && c1.second == c2.second;
}

grid_t makeGrid(int height, int width){
  return grid_t(height, row_t(width, 0));
}

#endif