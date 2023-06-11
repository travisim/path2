#define PURE_CPP

#include <iostream>
#include "../pathfinder/A_star.hpp"
#include "../pathfinder/Theta_star.hpp"
#include "../parseMap.hpp"
#include <string>

#include "../nadeau.hpp"

pathfinder::Theta_star<pathfinder::Action<coordInt_t>> planner;

int main(int argc, char* argv[]){

  if(argc <= 2){
    std::cout<<"Please provide map!\n"; return 0;
  }
  grid_t grid = parseMap(argv[1]);
  std::cout<<"opening file now!\n";
  int n = argc < 4 ? 1 : std::__cxx11::stoi(argv[3]);
  std::array<int, 4> coords = parseScen(argv[2], n);
  neighbors_t neighborsIndex = {0, 1, 2, 3, 4, 5, 6, 7};

  std::cout<<"starting"<<std::endl;
  auto start = std::chrono::high_resolution_clock::now();

  bool finished = planner.search(grid, coords[0], coords[1], coords[2], coords[3], neighborsIndex, false, false, false, true, pathfinder::Euclidean, pathfinder::FIFO);
  while(!finished){
    finished = planner.runNextSearch();
  }

  auto end = std::chrono::high_resolution_clock::now();
  std::cout<<getCurrentRSS()<<std::endl;;
  auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();
  std::cout<<"Search time: "<<duration<<"ms"<<std::endl;

  std::cout<<"Path: ";
  for(const auto p : planner.getPath()) std::cout<<p.first<<','<<p.second<<' ';
  std::cout<<std::endl;

  start = std::chrono::high_resolution_clock::now();
  finished = planner.generateReverseSteps(true, 20);

  while(!finished){
    finished = planner.nextGenSteps(10000);
  }

  end = std::chrono::high_resolution_clock::now();
  std::cout<<getCurrentRSS()<<std::endl;;
  duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();
  std::cout<<"Optimization time: "<<duration<<"ms"<<std::endl;

  int curstep = -1;
  int c = 0;
  while(1)
  {
    std::cin>>c;

    switch(c) {
    case 0:
      if(curstep == -1) std::cout<<"--NIL--\n";
      else{
        std::cout<<"Step num: "<<--curstep<<std::endl;
        std::cout<<planner.getStep(curstep);
      }
      break;
    case 1:
      if(curstep == planner.maxStep()) std::cout<<"--NIL--\n";
      else{
        std::cout<<"Step num: "<<++curstep<<std::endl;
        std::cout<<planner.getStep(curstep);
      }
      break;
    default:
      std::cout << std::endl << "null" << std::endl;  // not arrow
      break;
    }
  }

  return 0;
}
