#include <emscripten/bind.h>
#include <iostream>
#define STBI_ASSERT(x)

#include "pathfinder/A_star.hpp"
#include "conversion.cpp"

pathfinder::A_star planner;
path_t path;

int main() { return 0; }

//std::vector<std::pair<int, int>> 
bool AStarSearch(
  emscripten::val gridArr,  // grid
  int startX, int startY, int goalX, int goalY,  // start and end coordinates
  emscripten::val neighborsIndexArr,
  bool vertexEnabled, bool diagonalAllow, bool bigMap,
  int chosenCostInt, int orderInt // implicit type conversion (?)
){
  costType chosenCost = (costType)chosenCostInt;
  timeOrder order = (timeOrder)orderInt;
  grid_t grid = js2DtoVect2D(gridArr);
  for(auto v : grid){
    vectDigitPrint(v);
  }
  std::vector<uint8_t> neighborsIndex = js1DtoVect1D(neighborsIndexArr);
  vectDigitPrint(neighborsIndex);
  
  bool finished = planner.search(grid, startX, startY, goalX, goalY, neighborsIndex, vertexEnabled, diagonalAllow, bigMap, chosenCost, order);
  //bool finished = planner.search(grid, 125, 10, 127, 198, neighborsIndex, false, false, false, Octile, FIFO);
  return finished;
}

bool AStarRunNextSearch(int batchSize = -1){
  return planner.runNextSearch(batchSize);
}

int getStepIndex(){
  return planner.stepIndex;
}

std::vector<int> getStepData(){ return planner.stepData; }
std::vector<int> getStepIndexMap(){ return planner.stepIndexMap; }
std::vector<int> getCombinedIndexMap(){ return planner.combinedIndexMap; }
std::vector<std::vector<int>> getCellMap(){ return planner.cellMap; }
std::vector<std::vector<std::string>> getITRowDataCache(){ return planner.ITRowDataCache; }
std::vector<std::vector<int>> getArrowCoords(){ return planner.arrowCoords; }
std::vector<int> createDumbArray(int len){
  std::vector<int> v;
  for(int i = 0; i < len; ++i){
    v.push_back(std::rand() * INT_MAX);
  }
  return v;
}

// LEGACY DUE TO INSTANTIATESTREAMING
void printPath(){
  int sz = planner.path.size() * (sizeof(int) * 2 + 2);
  unsigned char *s = (unsigned char*)malloc(sz);
  int i = 0;
  for(auto p : path){
    for(char c : std::to_string(p.first)) s[i++] = c;
    s[i++] = ' ';
    for(char c : std::to_string(p.second)) s[i++] = c;
    s[i++] = '\n';
  }
  s[i] = 0;
  std::cout<<s;
  free(s);
}

// LEGACY DUE TO INSTANTIATESTREAMING
void *wasmmalloc(size_t n){
  return malloc(n);
}

// LEGACY DUE TO INSTANTIATESTREAMING
void wasmfree(void *ptr){
  free(ptr);
}

EMSCRIPTEN_BINDINGS(myModule) {
  
  emscripten::function("AStarSearch", &AStarSearch);
  emscripten::function("AStarRunNextSearch", &AStarRunNextSearch);
  emscripten::function("getStepIndex", &getStepIndex);
  emscripten::function("getStepData", &getStepData);
  emscripten::function("getStepIndexMap", &getStepIndexMap);
  emscripten::function("getCombinedIndexMap", &getCombinedIndexMap);
  emscripten::function("getCellMap", &getCellMap);
  emscripten::function("getITRowDataCache", &getITRowDataCache);
  emscripten::function("getArrowCoords", &getArrowCoords);
  emscripten::function("createDumbArray", &createDumbArray);

  emscripten::function("printPath", &printPath);
  emscripten::register_vector<int>("vectorInt");
  emscripten::register_vector<std::vector<int>>("vectorVectorInt");
  emscripten::register_vector<std::string>("vectorVectorString");
  emscripten::register_vector<std::vector<std::string>>("vectorString");
}
