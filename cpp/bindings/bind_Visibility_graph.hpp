#include <emscripten/bind.h>
#include "../pathfinder/VisibilityGraph.hpp"

#ifndef BIND_VISBILITYGRAPH_HPP
#define BIND_VISBILITYGRAPH_HPP

void bindVisibilityGraph(){

  /* -------------START OF ACTION------------- */
  
  using namespace pathfinder;

  emscripten::class_<VisibilityGraph<Action<coordInt_t>>, emscripten::base<Pathfinder<Action<coordInt_t>>>>("VGPlanner")
    .constructor<>()
    .function("getNumMapNodes", &VisibilityGraph<Action<coordInt_t>>::getNumMapNodes)
    .function("wrapperSearch", &VisibilityGraph<Action<coordInt_t>>::wrapperSearch)
    .function("wrapperGNM", &VisibilityGraph<Action<coordInt_t>>::wrapperGNM)
    .function("nextGNM", &VisibilityGraph<Action<coordInt_t>>::nextGNM)
    .function("runNextSearch", &VisibilityGraph<Action<coordInt_t>>::runNextSearch)
    ;
  
  /* -------------END OF ACTION------------- */

  /* -------------START OF BASEACTION------------- */
  
  emscripten::class_<VisibilityGraph<BaseAction<coordInt_t>>, emscripten::base<Pathfinder<BaseAction<coordInt_t>>>>("BaseVGPlanner")
    .constructor<>()
    .function("wrapperSearch", &VisibilityGraph<BaseAction<coordInt_t>>::wrapperSearch)
    .function("wrapperGNM", &VisibilityGraph<BaseAction<coordInt_t>>::wrapperGNM)
    .function("nextGNM", &VisibilityGraph<BaseAction<coordInt_t>>::nextGNM)
    .function("runNextSearch", &VisibilityGraph<BaseAction<coordInt_t>>::runNextSearch)
    ;
  /* -------------END OF BASEACTION------------- */
}

#endif