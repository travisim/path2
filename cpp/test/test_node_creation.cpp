#define PURE_CPP

#include <iostream>
#include "../pathfinder/A_star.hpp"
#include "../parseMap.hpp"
#include <string>

#include "../nadeau.hpp"

pathfinder::A_star<pathfinder::BaseAction> planner;

int main(int argc, char* argv[]){

  int num = 1e7;
  int c = 0;
  while(1)
  {
    std::cin>>c;

    switch(c) {
    case 0:
      std::cout<<"Current node count = "<<pathfinder::Node::count<<". Current bytes = "<<getCurrentRSS()<<std::endl;
      break;
    case 1:
      std::cout<<"Creating "<<num<<" nodes!\n";
      planner.createNodes(num);
      std::cout<<"Done\n";
      break;
    default:
      std::cout << std::endl << "null" << std::endl;  // not arrow
      break;
    }

  }

  return 0;
}