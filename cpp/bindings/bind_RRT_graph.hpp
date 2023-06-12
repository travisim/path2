#include <emscripten/bind.h>
#include "../pathfinder/RRTGraph.hpp"

#ifndef BIND_RRTGRAPH_HPP
#define BIND_RRTGRAPH_HPP

void bindRRTGraph(){

  /* -------------START OF ACTION------------- */
  
  using namespace pathfinder;

  emscripten::class_<RRTGraph<Action<coordInt_t>>, emscripten::base<Pathfinder<Action<coordInt_t>>>>("RRTPlanner")
    .constructor<>()
    .function("getNumMapNodes", &RRTGraph<Action<coordInt_t>>::getNumMapNodes)
    .function("wrapperSearch", &RRTGraph<Action<coordInt_t>>::wrapperSearch)
    .function("wrapperGNM", &RRTGraph<Action<coordInt_t>>::wrapperGNM)
    .function("nextGNM", &RRTGraph<Action<coordInt_t>>::nextGNM)
    .function("runNextSearch", &RRTGraph<Action<coordInt_t>>::runNextSearch)
    .function("addMapNode", &VisibilityGraph<Action<coordInt_t>>::addMapNode)
    .function("addMapEdge", &VisibilityGraph<Action<coordInt_t>>::addMapEdge)
    ;
  
  /* -------------END OF ACTION------------- */

  /* -------------START OF BASEACTION------------- */
  
  emscripten::class_<RRTGraph<BaseAction<coordInt_t>>, emscripten::base<Pathfinder<BaseAction<coordInt_t>>>>("BaseRRTPlanner")
    .constructor<>()
    .function("getNumMapNodes", &VisibilityGraph<BaseAction<coordInt_t>>::getNumMapNodes)
    .function("wrapperSearch", &RRTGraph<BaseAction<coordInt_t>>::wrapperSearch)
    .function("wrapperGNM", &RRTGraph<BaseAction<coordInt_t>>::wrapperGNM)
    .function("nextGNM", &RRTGraph<BaseAction<coordInt_t>>::nextGNM)
    .function("runNextSearch", &RRTGraph<BaseAction<coordInt_t>>::runNextSearch)
    .function("addMapNode", &VisibilityGraph<BaseAction<coordInt_t>>::addMapNode)
    .function("addMapEdge", &VisibilityGraph<BaseAction<coordInt_t>>::addMapEdge)
    ;
  /* -------------END OF BASEACTION------------- */
}

#endif