#include <iostream>

int main(){
  for(int i = 0; i < 10; ++i){
    std::cout<<(double)rand()/(double)RAND_MAX * 100<<std::endl;
  }
}