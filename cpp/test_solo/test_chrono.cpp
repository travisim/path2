#include <chrono>
#include <iostream>
#include <vector>

using namespace std::chrono;

int main(){
  std::vector<uint64_t> v;
  for(int i = 0; i < 10; ++i){
    v.push_back(duration_cast<nanoseconds>(system_clock::now().time_since_epoch()).count());
  }
  for(auto it : v){
    std::cout<<it<<std::endl;
  }
}