#include <emscripten/bind.h>
#include <iostream>
#define STBI_ASSERT(x)

#include "pathfinder/A_star.hpp"

int main() { return 0; }

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

  /* -------------START OF ACTION------------- */
  emscripten::class_<pathfinder::GridPathFinder<pathfinder::Action>>("GridPathFinder")
    .constructor<>()
    .property("stepIndex", &pathfinder::GridPathFinder<pathfinder::Action>::stepIndex)
    .property("cellMap", &pathfinder::GridPathFinder<pathfinder::Action>::cellMap)
    .property("ITRowDataCache", &pathfinder::GridPathFinder<pathfinder::Action>::ITRowDataCache)
    .property("cellVals", &pathfinder::GridPathFinder<pathfinder::Action>::cellVals)
    .property("arrowCoords", &pathfinder::GridPathFinder<pathfinder::Action>::arrowCoords)
    .function("maxStep", &pathfinder::GridPathFinder<pathfinder::Action>::maxStep)
  
    .function("generateReverseSteps", &pathfinder::GridPathFinder<pathfinder::Action>::generateReverseSteps)
    .function("nextGenSteps", &pathfinder::GridPathFinder<pathfinder::Action>::nextGenSteps)
    .function("getBounds", &pathfinder::GridPathFinder<pathfinder::Action>::getBounds) // step generation
    .function("getStep", &pathfinder::GridPathFinder<pathfinder::Action>::getStep)
    .function("getState", &pathfinder::GridPathFinder<pathfinder::Action>::getState)
    .function("getNumStates", &pathfinder::GridPathFinder<pathfinder::Action>::getNumStates)
    ;
  
  emscripten::class_<pathfinder::A_star<pathfinder::Action>, emscripten::base<pathfinder::GridPathFinder<pathfinder::Action>>>("AStarPlanner")
    .constructor<>()
    .function("wrapperSearch", &pathfinder::A_star<pathfinder::Action>::wrapperSearch)
    .function("search", &pathfinder::A_star<pathfinder::Action>::search)
    .function("runNextSearch", &pathfinder::A_star<pathfinder::Action>::runNextSearch)
    .function("insertNode", &pathfinder::A_star<pathfinder::Action>::insertNode)
    .function("eraseNode", &pathfinder::A_star<pathfinder::Action>::eraseNode)
    .function("pqSize", &pathfinder::A_star<pathfinder::Action>::pqSize)
    .function("createNodes", &pathfinder::A_star<pathfinder::Action>::createNodes)
    ;
  /* -------------END OF ACTION------------- */

  /* -------------START OF BASEACTION------------- */
  emscripten::class_<pathfinder::GridPathFinder<pathfinder::BaseAction>>("BaseGridPathFinder")
    .constructor<>()
    .property("stepIndex", &pathfinder::GridPathFinder<pathfinder::BaseAction>::stepIndex)
    .property("cellMap", &pathfinder::GridPathFinder<pathfinder::BaseAction>::cellMap)
    .property("ITRowDataCache", &pathfinder::GridPathFinder<pathfinder::BaseAction>::ITRowDataCache)
    .property("cellVals", &pathfinder::GridPathFinder<pathfinder::BaseAction>::cellVals)
    .property("arrowCoords", &pathfinder::GridPathFinder<pathfinder::BaseAction>::arrowCoords)
    .function("maxStep", &pathfinder::GridPathFinder<pathfinder::BaseAction>::maxStep)

    .function("generateReverseSteps", &pathfinder::GridPathFinder<pathfinder::BaseAction>::generateReverseSteps)
    .function("nextGenSteps", &pathfinder::GridPathFinder<pathfinder::BaseAction>::nextGenSteps)
    .function("getBounds", &pathfinder::GridPathFinder<pathfinder::BaseAction>::getBounds) // step generation
    .function("getStep", &pathfinder::GridPathFinder<pathfinder::BaseAction>::getStep)
    .function("getState", &pathfinder::GridPathFinder<pathfinder::BaseAction>::getState)
    .function("getNumStates", &pathfinder::GridPathFinder<pathfinder::BaseAction>::getNumStates)

    ;
  
  emscripten::class_<pathfinder::A_star<pathfinder::BaseAction>, emscripten::base<pathfinder::GridPathFinder<pathfinder::BaseAction>>>("BaseAStarPlanner")
    .constructor<>()
    .function("wrapperSearch", &pathfinder::A_star<pathfinder::BaseAction>::wrapperSearch)
    .function("search", &pathfinder::A_star<pathfinder::BaseAction>::search)
    .function("runNextSearch", &pathfinder::A_star<pathfinder::BaseAction>::runNextSearch)
    .function("insertNode", &pathfinder::A_star<pathfinder::BaseAction>::insertNode)
    .function("eraseNode", &pathfinder::A_star<pathfinder::BaseAction>::eraseNode)
    .function("pqSize", &pathfinder::A_star<pathfinder::BaseAction>::pqSize)
    .function("createNodes", &pathfinder::A_star<pathfinder::BaseAction>::createNodes)
    ;
  /* -------------END OF BASEACTION------------- */
  

  emscripten::register_vector<int>("vectorInt");
  emscripten::register_vector<std::vector<int>>("vectorVectorInt");
  emscripten::register_vector<std::string>("vectorString");
  emscripten::register_vector<std::vector<std::string>>("vectorVectorString");
  emscripten::register_vector<double>("vectorDouble");
  

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

  emscripten::class_<pathfinder::BaseAction>("BaseAction")
    .constructor<>()
    .property("command", &pathfinder::BaseAction::command)
    .property("dest", &pathfinder::BaseAction::dest)
    .property("nodeCoord", &pathfinder::BaseAction::nodeCoord)
    .property("cellVal", &pathfinder::BaseAction::cellVal)
    ;

  emscripten::class_<coord_t>("coord_t")
    .constructor<>()
    .property("x", &coord_t::first)
    .property("y", &coord_t::second)
    ;

  emscripten::register_vector<pathfinder::Action>("vectorAction");
  emscripten::class_<pathfinder::Step<pathfinder::Action>>("Step")
    .constructor<>()
    .property("fwdActions", &pathfinder::Step<pathfinder::Action>::fwdActions)
    .property("revActions", &pathfinder::Step<pathfinder::Action>::revActions)
    .property("combined", &pathfinder::Step<pathfinder::Action>::combined)
    ;

  emscripten::register_vector<pathfinder::BaseAction>("vectorBaseAction");
  emscripten::class_<pathfinder::Step<pathfinder::BaseAction>>("BaseStep")
    .constructor<>()
    .property("fwdActions", &pathfinder::Step<pathfinder::BaseAction>::fwdActions)
    .property("revActions", &pathfinder::Step<pathfinder::BaseAction>::revActions)
    .property("combined", &pathfinder::Step<pathfinder::BaseAction>::combined)
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
  custom::register_unordered_map<int, rowf_t>("canvases");

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
