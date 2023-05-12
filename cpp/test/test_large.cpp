#define PURE_CPP

#include <iostream>
#include "../pathfinder/A_star.hpp"
#include "large_map.cpp"
#include <string>

#include "../nadeau.hpp"

pathfinder::A_star planner;

int main(){

  grid_t grid = getMap256Bowl();
  neighbors_t neighborsIndex = {0, 1, 2, 3, 4, 5, 6, 7};

  std::cout<<"starting"<<std::endl;
  uint64_t start = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
  bool finished = planner.search(grid, 125, 10, 127, 198, neighborsIndex, false, false, true, true, pathfinder::Octile, pathfinder::FIFO);
  //bool finished = planner.search(grid, 125, 10, 130, 130, neighborsIndex, false, false, true, false, pathfinder::Octile, pathfinder::FIFO);

  while(!finished){
    finished = planner.runNextSearch();
  }
  std::cout<<getCurrentRSS()<<std::endl;
  uint64_t endSearch = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
  std::cout<<"Search time: "<<endSearch - start<<"ms"<<std::endl;

  finished = planner.generateReverseSteps(true, 500);
  while(!finished){
    finished = planner.nextGenSteps(10000);
  }
  std::cout<<getCurrentRSS()<<std::endl;


  uint64_t now = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
  std::cout<<"Optimization time: "<<now - endSearch<<"ms"<<std::endl;
  

  return 0;
}