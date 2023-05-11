#include <iostream>
#include <vector>
#include <utility>
#include <array>
#include "../nadeau.hpp"

struct Coord{
  int16_t x;
  int16_t y;
  Coord(int16_t x, int16_t y) : x(x), y(y){}
};

int main(){

  int num = 1e6;
  int currRSS = getCurrentRSS();

  std::vector<Coord> vCoord;
  for(int i = 0; i < num; ++i){
    vCoord.push_back(Coord(1,2));
  }
  std::cout<<"COORDS: "<<getCurrentRSS() - currRSS<<std::endl;
  currRSS = getCurrentRSS();

  std::vector<std::pair<int16_t, int16_t>> vPair;
  for(int i = 0; i < num; ++i){
    vPair.push_back({1,2});
  }
  std::cout<<"Pair: "<<getCurrentRSS() - currRSS<<std::endl;
  currRSS = getCurrentRSS();

  std::vector<std::array<int16_t, 2>> vArray;
  for(int i = 0; i < num; ++i){
    vArray.push_back({1,2});
  }
  std::cout<<"Array: "<<getCurrentRSS() - currRSS<<std::endl;
  currRSS = getCurrentRSS();
}