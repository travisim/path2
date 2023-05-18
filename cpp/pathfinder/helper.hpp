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

#define CANVAS_COMPRESSED

using coordInt_t = std::pair<int, int>;
using coordDouble_t = std::pair<double, double>;
using lineInt_t = std::array<int, 4>;
using lineDouble_t = std::array<double, 4>;

using row_t = std::vector<uint8_t>;
using grid_t = std::vector<row_t>;
using rowf_t = std::vector<double>;
using gridf_t = std::vector<rowf_t>;
using neighbors_t = std::vector<uint8_t>;
using bound_t = std::pair<double, double>;

const double THRESH = 1e-8;

int32_t coord2int32(coordInt_t c){ return ((int32_t)(c.first) << 16) | (int32_t)(c.second); }

// struct CoordDoubleHash {
//   std::size_t operator()(const std::pair<double, double>& p) const {
//     return std::hash<double>()(p.first) ^ std::hash<double>()(p.second);
//   }
// };
// struct CoordIntHash {
//   std::size_t operator()(const coordInt_t& p) const {
//     size_t a = std::hash<int>()(p.first);
//     size_t b = std::hash<int>()(p.second);
//     return a >= b ? a * a + a + b : a + b * b;
//   }
// };

template <typename Coord_t>
struct CoordHash{
  std::size_t operator()(const Coord_t c) const { 
    if constexpr(std::is_same<Coord_t, coordInt_t>::value){
      return std::hash<int>()(coord2int32(c));
    }
    else{
      static_assert(std::is_same<Coord_t, coordDouble_t>::value, "INVALID COORD TYPE PROVIDED");
      return std::hash<double>()(c.first) ^ std::hash<double>()(c.second);
    }
  }
};

inline std::string coord2String(coordInt_t coord, int precision = -1){ return std::to_string(coord.first) + ", " + std::to_string(coord.second); }

inline std::string coord2String(coordDouble_t coord, int precision = -1){ 
  if(precision == -1) precision = 6;
  return std::to_string(coord.first).substr(0, precision + 1) + ", " + std::to_string(coord.second).substr(0, precision + 1); 
}

template<typename Coord_t>
bool isCoordEqual(const Coord_t& a, const Coord_t& b){ return a.first == b.first && a.second == b.second; }

// Hash function
struct LineIntHash
{
  size_t operator()(const lineInt_t &x) const
  {
    return x[0] ^ x[1] ^ x[2] ^ x[3];
  }
};

struct LineDoubleHash
{
  size_t operator()(const lineDouble_t &x) const
  {
    return std::hash<double>()(x[0]) ^ std::hash<double>()(x[1]) ^ std::hash<double>()(x[2]) ^ std::hash<double>()(x[3]);
  }
};

template <class T, typename Coord_t>
class Empty2D{
  std::vector<std::vector<T>> data;
  std::unordered_map<Coord_t, T, CoordHash<Coord_t>> dataHashMap;
  bool allowFloat;
public:
  Empty2D(){
    data = std::vector<std::vector<T>>(0, std::vector<T>(0, NULL));
  }
    
  Empty2D(int height, int width){
    data = std::vector<std::vector<T>>(height, std::vector<T>(width, NULL));
  }

  void set(Coord_t &xy, T item){
    if constexpr(std::is_same<Coord_t, coordDouble_t>::value) dataHashMap[xy] = item;
    else{
      static_assert(std::is_same<Coord_t, coordInt_t>::value, "INVALID COORD TYPE PROVIDED");
      data[xy.first][xy.second] = item;
    }
  }

  T get(Coord_t &xy){
    if constexpr(std::is_same<Coord_t, coordDouble_t>::value){
      // if(is_unique_ptr<std::remove_cv_t<T>>::value) return std::move(dataHashMap[xy]);
      return dataHashMap[xy];
    }
    else{
      static_assert(std::is_same<Coord_t, coordInt_t>::value, "INVALID COORD TYPE PROVIDED");
      // if(is_unique_ptr<std::remove_cv_t<T>>::value) return std::move(data[xy.first][xy.second]);
      return data[xy.first][xy.second];
    }
  }

  void clear(){
    if constexpr(std::is_same<Coord_t, coordDouble_t>::value){
      dataHashMap.clear();
    }
    else{
      for(int i = 0; i < data.size(); ++i){
        for(int j = 0; j < data[i].size(); ++j){
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

bool isArrayEqual(const lineInt_t &e1, const lineInt_t &e2){
  return e1[0] == e2[0] && e1[1] == e2[1] && e1[2] == e2[2] && e1[3] == e2[3];
}

grid_t makeGrid(int height, int width, int defVal = 0){
  return grid_t(height, row_t(width, defVal));
}

gridf_t makeGridf(int height, int width, double defVal = 0){
  return gridf_t(height, rowf_t(width, defVal));
}


// Coord_t uint322coord(uint32_t c){
//   return {c>>16, c & ((1 << 16) - 1)};
// }

#endif