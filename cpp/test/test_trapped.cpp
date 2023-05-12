#define PURE_CPP

#include <iostream>
#include "../pathfinder/A_star.hpp"
#include "../parseMap.hpp"
#include <string>

#include "../nadeau.hpp"

pathfinder::A_star planner;

int main(){

  grid_t grid = parseMap("trapped_256.map");
  neighbors_t neighborsIndex = {0, 1, 2, 3, 4, 5, 6, 7};

  std::cout<<"starting"<<std::endl;
  uint64_t start = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
  bool finished = planner.search(grid, 2, 2, 0, 0, neighborsIndex, false, false, true, true, pathfinder::Octile, pathfinder::FIFO);

  while(!finished){
    finished = planner.runNextSearch();
  }
  std::cout<<getCurrentRSS()<<std::endl;

  uint64_t endSearch = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
  std::cout<<"Search time: "<<endSearch - start<<"ms"<<std::endl;

  finished = planner.generateReverseSteps(true, 2000);
  while(!finished){
    finished = planner.nextGenSteps(10000);
  }
  std::cout<<getCurrentRSS()<<std::endl;

  uint64_t now = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
  std::cout<<"Optimization time: "<<now - endSearch<<"ms"<<std::endl;
  

  return 0;
}