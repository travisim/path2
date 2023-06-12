#define PURE_CPP

#include <iostream>
#include "../pathfinder/PRMGraph.hpp"
#include "../parseMap.hpp"
#include <string>

#include "../nadeau.hpp"

pathfinder::PRMGraph<pathfinder::BaseAction<coordDoublegcc _t>> planner;

int main(int argc, char* argv[]){

  if(argc <= 2){
    std::cout<<"Please provide map!"; return 0;
  }
  grid_t grid = parseMap(argv[1]);
  std::cout<<"opening file now!\n";
  int n = argc < 4 ? 1 : std::stoi(argv[3]);
  std::array<int, 4> coords = parseScen(argv[2], n);
  neighbors_t neighborsIndex = {0, 1, 2, 3, 4, 5, 6, 7};

  std::cout<<"starting"<<std::endl;
  uint64_t start = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
  bool finished = planner.search(grid, coords[0], coords[1], coords[2], coords[3], false, false, true, true, pathfinder::Octile, pathfinder::FIFO, 1, 1, false);

  while(!finished){
    finished = planner.runNextSearch();
  }
  std::cout<<getCurrentRSS()<<std::endl;;
  uint64_t endSearch = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
  std::cout<<"Search time: "<<endSearch - start<<"ms"<<std::endl;

  finished = planner.generateReverseSteps(true, 20000);
  while(!finished){
    finished = planner.nextGenSteps(10000);
  }
  std::cout<<getCurrentRSS()<<std::endl;;

  uint64_t now = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();
  std::cout<<"Optimization time: "<<now - endSearch<<"ms"<<std::endl;

  int curstep = -1;
  int c = 0;
  while(1)
  {
    std::cin>>c;

    switch(c) {
    case 0:
      if(curstep == -1) std::cout<<"--NIL--\n";
      else{
        std::cout<<planner.getStep(curstep--);
      }
      break;
    case 1:
      if(curstep == planner.maxStep()) std::cout<<"--NIL--\n";
      else{
        std::cout<<planner.getStep(++curstep);
      }
      break;
    default:
      std::cout << std::endl << "null" << std::endl;  // not arrow
      break;
    }

  }

  return 0;
}