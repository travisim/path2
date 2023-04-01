#include <iostream>
#include "../pathfinder/A_star.hpp"
#include <string>

int main(){
  pathfinder::A_star planner;

  grid_t grid = {
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    {1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1},
    {1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1},
    {1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1},
    {1,1,0,1,1,0,0,0,0,0,0,0,0,0,1,1},
    {1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1},
    {1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1},
    {1,1,0,1,1,0,1,1,0,0,0,0,0,0,1,1},
    {1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1},
    {1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1},
    {1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1},
    {1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1},
    {1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
    {1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1},
  };
  neighbors_t neighborsIndex = {0, 7, 6, 5, 4, 3, 2, 1};

  bool finished = planner.search(grid, 0, 0, 13, 13, neighborsIndex, false, false, false, pathfinder::Octile, pathfinder::FIFO);

  while(!finished){
    finished = planner.runNextSearch();
  }
  path_t path = planner.path;
  for(int i = 0; i < 10; ++i){
    std::cout<<planner.stepData[i]<<' ';
  }
  std::cout<<"Created: "<<pathfinder::created<<" Destroyed: "<<pathfinder::destroyed<<std::endl;

  for(long unsigned int i = 0; i < path.size(); ++i){
    std::cout<<path[i].first<<','<<path[i].second<<std::endl;
  }
  std::cout<<planner.stepData.size()<<' '<<planner.stepIndexMap.size()<<' '<<planner.combinedIndexMap.size()<<std::endl;

  return 0;
}