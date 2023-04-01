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
  std::vector<uint8_t> neighborsIndex = js1DtoVect1D(neighborsIndexArr);
  
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

int getNumStates(){
  return planner.states.size();
}

std::vector<int> getStepData(){ return planner.stepData; }
std::vector<int> getStepIndexMap(){ return planner.stepIndexMap; }
std::vector<int> getCombinedIndexMap(){ return planner.combinedIndexMap; }
std::vector<std::vector<int>> getCellMap(){ return planner.cellMap; }
std::vector<std::vector<std::string>> getITRowDataCache(){ return planner.ITRowDataCache; }
std::vector<double> getCellVals(){ return planner.cellVals; }
std::vector<std::vector<int>> getArrowCoords(){ return planner.arrowCoords; }

std::unordered_map<int, bound_t> getBounds(){
  return planner.sim.bounds;
}

int maxStep(){
  return planner.maxStep();
}

bool genSteps(bool genState, int stateFreq){
  #ifdef STEP_STRUCT_METHOD
  return planner.generateReverseSteps(genState, stateFreq);
  #else
  return true;
  #endif
}

bool nextGenSteps(int batchSize){
  #ifdef STEP_STRUCT_METHOD
  return planner.nextGenSteps(batchSize);
  #else
  return true;
  #endif
}

pathfinder::Step getStep(int stepNo){
  #ifdef STEP_STRUCT_METHOD
  return planner.getStep(stepNo);
  #else
  return pathfinder::Step{};
  #endif
}

pathfinder::State getState(int stepNo){
  #ifdef STEP_STRUCT_METHOD
  return planner.getState(stepNo);
  #else
  return pathfinder::State{false};
  #endif
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

namespace custom{
  template<typename K, typename V, typename H = std::hash<K>>
  emscripten::class_<std::unordered_map<K, V, H>> register_unordered_map(const char* name) {
    typedef std::unordered_map<K,V,H> MapType;

    size_t (MapType::*size)() const = &MapType::size;
    return emscripten::class_<MapType>(name)
      .template constructor<>()
      .function("size", size)
      .function("get", emscripten::internal::MapAccess<MapType>::get)
      .function("set", emscripten::internal::MapAccess<MapType>::set)
      .function("keys", emscripten::internal::MapAccess<MapType>::keys)
      ;
  }

  template<typename T, int n>
  emscripten::class_<std::array<T, n>> register_array(const char* name) {
    typedef std::array<T, n> ArrType;
    return emscripten::class_<std::array<T, n>>(name)
      .template constructor<>()
      .function("get", &emscripten::internal::VectorAccess<ArrType>::get)
      .function("set", &emscripten::internal::VectorAccess<ArrType>::set)
      ;
  }
}

EMSCRIPTEN_BINDINGS(myModule) {
  
  emscripten::function("AStarSearch", &AStarSearch);
  emscripten::function("AStarRunNextSearch", &AStarRunNextSearch);
  emscripten::function("getStepIndex", &getStepIndex);
  emscripten::function("getNumStates", &getNumStates);
  emscripten::function("getStepData", &getStepData);
  emscripten::function("getStepIndexMap", &getStepIndexMap);
  emscripten::function("getCombinedIndexMap", &getCombinedIndexMap);
  emscripten::function("getCellMap", &getCellMap);
  emscripten::function("getITRowDataCache", &getITRowDataCache);
  emscripten::function("getCellVals", &getCellVals);
  emscripten::function("getArrowCoords", &getArrowCoords);
  emscripten::function("maxStep", &maxStep);
  emscripten::function("genSteps", &genSteps);
  emscripten::function("nextGenSteps", &nextGenSteps);
  emscripten::function("getStep", &getStep);
  emscripten::function("getState", &getState);
  emscripten::function("getBounds", &getBounds);

  emscripten::function("printPath", &printPath);
  emscripten::register_vector<int>("vectorInt");
  emscripten::register_vector<std::vector<int>>("vectorVectorInt");
  emscripten::register_vector<std::string>("vectorString");
  emscripten::register_vector<std::vector<std::string>>("vectorVectorString");
  emscripten::register_vector<double>("vectorDouble");
  
#ifdef STEP_STRUCT_METHOD
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
#endif
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

  emscripten::class_<pathfinder::State>("State")
    .constructor<>()
    .property("valid", &pathfinder::State::valid)
    .property("canvases", &pathfinder::State::canvases)
    .property("infotables", &pathfinder::State::infotables)
    .property("vertices", &pathfinder::State::vertices)
    .property("edges", &pathfinder::State::edges)
    .property("arrowColor", &pathfinder::State::arrowColor)
    .property("pseudoCodeRowPri", &pathfinder::State::pseudoCodeRowPri)
    .property("pseudoCodeRowSec", &pathfinder::State::pseudoCodeRowSec)
    ;
  
  // state properties bindings
#ifdef CANVAS_GRID
  custom::register_unordered_map<int, gridf_t>("canvases");
  emscripten::register_vector<double>("vectorDouble");
  emscripten::register_vector<rowf_t>("vectorVectorDouble");
#else
  custom::register_unordered_map<int, state_canvas_t>("canvases");
  custom::register_unordered_map<coord_t, double, CoordIntHash>("canvas");
#endif

  custom::register_unordered_map<int, InfoTableState>("infotables");
  emscripten::class_<InfoTableState>("InfoTableState")
    .constructor<>()
    .property("rowSize", &InfoTableState::rowSize)
    .property("highlightedRow", &InfoTableState::highlightedRow)
    .property("rows", &InfoTableState::rows); //vectorVectorString

  custom::register_unordered_map<int, std::vector<coord_t>>("vertices");
  emscripten::register_vector<coord_t>("vectorCoord");

  custom::register_unordered_map<int, std::vector<line_t>>("edges");
  emscripten::register_vector<line_t>("vectorEdge");
  custom::register_array<int, 4>("line_t");

  custom::register_unordered_map<int, int>("rows");
  // end of state property bindings

  // bounds
  custom::register_unordered_map<int, bound_t>("bounds");
  emscripten::class_<bound_t>("bound_t")
    .constructor<>()
    .property("min", &bound_t::first)
    .property("max", &bound_t::second)
    ;
}
