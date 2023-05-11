#include <set>
#include <unordered_set>
#include <vector>
#include <chrono>
#include <cstdlib>
#include <array>
#include <iostream>

using lineInt_t = std::array<int, 4>;

struct hashFunctionEdges
{
  size_t operator()(const lineInt_t &x) const
  {
    return x[0] ^ x[1] ^ x[2] ^ x[3];
  }
};

std::array<size_t, 3> test(){
  int sz = 1e6;
  int q = 1e6;
  int seed = 100;

  int minVal = 0, maxVal = 1024;

  std::vector<lineInt_t> items;
  for(int i = 0; i < sz; ++i){
    lineInt_t line;
    for(int j = 0; j < 4; ++j) line[j] = rand() * maxVal;
    items.push_back(line);
  }

  std::vector<lineInt_t> queries;
  for(int i = 0; i < q; ++i){
    lineInt_t line;
    for(int j = 0; j < 4; ++j) line[j] = rand() * maxVal;
    queries.push_back(line);
  }

  using namespace std::chrono;

  std::unordered_set<lineInt_t, hashFunctionEdges> ctn;
  //std::vector<lineInt_t> ctn;

  size_t startms = duration_cast<milliseconds>(system_clock::now().time_since_epoch()).count();

  for(int i = 0; i < sz; ++i){
    ctn.insert(items[i]);
    //ctn.push_back(items[i]);
  }

  size_t midms = duration_cast<milliseconds>(system_clock::now().time_since_epoch()).count();
  
  size_t hits = 0;
  // for(int i = 0; i < q; ++i){
  //   for(int j = 0; j < ctn.size(); ++j){
  //     if(queries[i][0] == ctn[j][0] && queries[i][1] == ctn[j][1] && queries[i][2] == ctn[j][2] && queries[i][3] == ctn[j][3]){
  //       hits++;
  //       continue;
  //     }
  //   }
  //   // if(ctn.find(queries[i]) == ctn.end()) continue;
  //   // hits++;
  // }

  size_t endms = duration_cast<milliseconds>(system_clock::now().time_since_epoch()).count();

  // std::cout<<"Add time: "<<midms - startms<<std::endl;
  // std::cout<<"Search time: "<<endms - midms<<std::endl;
  // std::cout<<"Total hits: "<<hits<<std::endl;
  return {midms - startms, endms - midms, hits};
}

int main(){
  int cnts = 30;
  size_t addTotal = 0, searchTotal = 0, hitTotal = 0;
  for(int i = 0; i < cnts; ++i){
    std::array<size_t, 3> res = test();
    std::cout<<"Finished test "<<i+1<<std::endl;

    addTotal += res[0];
    searchTotal += res[1];
    hitTotal += res[2];
  }

  std::cout<<"Add time: "<<addTotal / cnts<<std::endl;
  std::cout<<"Search time: "<<searchTotal / cnts<<std::endl;
  std::cout<<"Total hits: "<<hitTotal / cnts<<std::endl;

  return 0;
}