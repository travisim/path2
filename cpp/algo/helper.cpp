#include "helper.hpp"

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