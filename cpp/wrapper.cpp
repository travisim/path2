#include <emscripten/bind.h>
#include <iostream>
#define STBI_ASSERT(x)

#include "algo/A_star.cpp"
#include "conversion.cpp"

A_star planner;
path_t path;

int main() { return 0; }

//std::vector<std::pair<int, int>> 
void AStarSearch(
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
  path = planner.search(
    grid, 
    startX, startY, goalX, goalY,
    neighborsIndex,
    vertexEnabled, diagonalAllow, bigMap,
    chosenCost, order
  );
  return;
  //return path;
}

std::vector<int> getStepData(){ return planner.stepData; }
std::vector<int> getStepIndexMap(){ return planner.stepIndexMap; }
std::vector<int> getCombinedIndexMap(){ return planner.combinedIndexMap; }
std::vector<std::vector<int>> getCellMap(){ return planner.cellMap; }
std::vector<std::vector<std::string>> getITRowDataCache(){ return planner.ITRowDataCache; }
std::vector<std::vector<int>> getArrowCoords(){ return planner.arrowCoords; }

// LEGACY DUE TO INSTANTIATESTREAMING
void printPath(){
  int sz = path.size() * (sizeof(int) * 2 + 2);
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
  emscripten::function("getStepData", &getStepData);
  emscripten::function("getStepIndexMap", &getStepIndexMap);
  emscripten::function("getCombinedIndexMap", &getCombinedIndexMap);
  emscripten::function("getCellMap", &getCellMap);
  emscripten::function("getITRowDataCache", &getITRowDataCache);
  emscripten::function("getArrowCoords", &getArrowCoords);

  emscripten::function("printPath", &printPath);
  emscripten::register_vector<int>("vectorInt");
  emscripten::register_vector<std::vector<int>>("vectorVectorInt");
  emscripten::register_vector<std::string>("vectorVectorString");
  emscripten::register_vector<std::vector<std::string>>("vectorString");
}
