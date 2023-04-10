#include <emscripten/bind.h>
#include <iostream>
#define STBI_ASSERT(x)

#include "pathfinder/A_star.hpp"

pathfinder::A_star planner;
path_t path;

int main() { return 0; }

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

  emscripten::class_<pathfinder::GridPathFinder>("GridPathFinder")
    .constructor<>()
    .property("stepIndex", &pathfinder::GridPathFinder::stepIndex)
    .property("stepData", &pathfinder::GridPathFinder::stepData)
    .property("stepIndexMap", &pathfinder::GridPathFinder::stepIndexMap)
    .property("combinedIndexMap", &pathfinder::GridPathFinder::combinedIndexMap)
    .property("cellMap", &pathfinder::GridPathFinder::cellMap)
    .property("ITRowDataCache", &pathfinder::GridPathFinder::ITRowDataCache)
    .property("cellVals", &pathfinder::GridPathFinder::cellVals)
    .property("arrowCoords", &pathfinder::GridPathFinder::arrowCoords)
    .function("maxStep", &pathfinder::GridPathFinder::maxStep)
#ifdef STEP_STRUCT_METHOD
    .function("generateReverseSteps", &pathfinder::GridPathFinder::generateReverseSteps)
    .function("nextGenSteps", &pathfinder::GridPathFinder::nextGenSteps)
    .function("getBounds", &pathfinder::GridPathFinder::getBounds) // step generation
    .function("getStep", &pathfinder::GridPathFinder::getStep)
    .function("getState", &pathfinder::GridPathFinder::getState)
    .function("getNumStates", &pathfinder::GridPathFinder::getNumStates)
#endif
    ;


  emscripten::class_<pathfinder::A_star, emscripten::base<pathfinder::GridPathFinder>>("AStarPlanner")
    .constructor<>()
    .function("wrapperSearch", &pathfinder::A_star::wrapperSearch)
    .function("search", &pathfinder::A_star::search)
    .function("runNextSearch", &pathfinder::A_star::runNextSearch)
    .function("insertNode", &pathfinder::A_star::insertNode)
    .function("eraseNode", &pathfinder::A_star::eraseNode)
    .function("pqSize", &pathfinder::A_star::pqSize)
    ;

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
  #ifdef VECTOR_METHOD
  emscripten::register_vector<state_canvas_t>("canvases");
  #else
  custom::register_unordered_map<int, state_canvas_t>("canvases");
  #endif
  #ifdef BIT_SHIFT_COORD
  custom::register_unordered_map<uint32_t, double>("canvas");
  emscripten::register_vector<uint32_t>("coords");
  #else
  custom::register_unordered_map<coord_t, double, CoordIntHash>("canvas");
#endif
#endif

  #ifdef VECTOR_METHOD
  emscripten::register_vector<InfoTableState>("infotables");
  #else
  custom::register_unordered_map<int, InfoTableState>("infotables");
  #endif
  emscripten::class_<InfoTableState>("InfoTableState")
    .constructor<>()
    .property("rowSize", &InfoTableState::rowSize)
    .property("highlightedRow", &InfoTableState::highlightedRow)
    .property("rows", &InfoTableState::rows); //vectorVectorString

  #ifdef VECTOR_METHOD
  emscripten::register_vector<std::vector<coord_t>>("vertices");
  #else
  custom::register_unordered_map<int, std::vector<coord_t>>("vertices");
  #endif
  emscripten::register_vector<coord_t>("vectorCoord");

  #ifdef VECTOR_METHOD
  emscripten::register_vector<std::vector<line_t>>("edges");
  #else
  custom::register_unordered_map<int, std::vector<line_t>>("edges");
  #endif
  emscripten::register_vector<line_t>("vectorEdge");
  custom::register_array<int, 4>("line_t");

  custom::register_unordered_map<int, int>("rows");
  custom::register_unordered_map<int, uint8_t>("arrowColor");
  // end of state property bindings

  // bounds
  custom::register_unordered_map<int, bound_t>("bounds");
  emscripten::class_<bound_t>("bound_t")
    .constructor<>()
    .property("min", &bound_t::first)
    .property("max", &bound_t::second)
    ;
}
