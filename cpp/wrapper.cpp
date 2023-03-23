#include <emscripten/bind.h>
#include <iostream>
#define STBI_ASSERT(x)

#include "pathfinder/A_star.hpp"
#include "conversion.cpp"

pathfinder::A_star planner;
path_t path;

int main() { return 0; }

bool AStarSearch(
  emscripten::val gridArr,  // grid
  int startX, int startY, int goalX, int goalY,  // start and end coordinates
  emscripten::val neighborsIndexArr,
  bool vertexEnabled, bool diagonalAllow, bool bigMap,
  int chosenCostInt, int orderInt // implicit type conversion (?)
){
  pathfinder::costType chosenCost = (pathfinder::costType)chosenCostInt;
  pathfinder::timeOrder order = (pathfinder::timeOrder)orderInt;
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

int maxStep(){
  return planner.maxStep();
}

bool genSteps(bool genState, int stateFreq){
  return planner.generateReverseSteps(genState, stateFreq);
}

bool nextGenSteps(int batchSize){
  return planner.nextGenSteps(batchSize);
}

pathfinder::Step getStep(int stepNo){
  return planner.getStep(stepNo);
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
  emscripten::function("maxStep", &maxStep);
  emscripten::function("genSteps", &genSteps);
  emscripten::function("nextGenSteps", &nextGenSteps);
  emscripten::function("getStep", &getStep);

  emscripten::function("printPath", &printPath);
  emscripten::register_vector<int>("vectorInt");
  emscripten::register_vector<std::vector<int>>("vectorVectorInt");
  emscripten::register_vector<std::string>("vectorVectorString");
  emscripten::register_vector<std::vector<std::string>>("vectorString");
  
  emscripten::class_<pathfinder::Action>("Action")
    .constructor<>()
    .property("command", &pathfinder::Action::command)
    .property("dest", &pathfinder::Action::dest)
    .property("nodeCoord", &pathfinder::Action::nodeCoord)
    .property("colorIndex", &pathfinder::Action::colorIndex)
    .property("arrowIndex", &pathfinder::Action::arrowIndex)
    .property("pseudoCodeRow", &pathfinder::Action::pseudoCodeRow)
    .property("infoTableRowIndex", &pathfinder::Action::infoTableRowIndex)
    .property("infoTableRowData", &pathfinder::Action::infoTableRowData)
    .property("cellVal", &pathfinder::Action::cellVal)
    .property("endCoord", &pathfinder::Action::endCoord)
    ;
  emscripten::class_<coord_t>("coord_t")
    .constructor<>()
    .property("x", &coord_t::first)
    .property("y", &coord_t::second)
    ;
  emscripten::register_vector<pathfinder::Action>("vectorAction");

  emscripten::class_<pathfinder::Step>("Step")
    .constructor<>()
    .property("fwdActions", &pathfinder::Step::fwdActions)
    .property("revActions", &pathfinder::Step::revActions)
    .property("combined", &pathfinder::Step::combined)
    ;
}
