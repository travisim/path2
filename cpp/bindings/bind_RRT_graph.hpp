#include <emscripten/bind.h>
#include "../pathfinder/RRTGraph.hpp"

#ifndef BIND_RRT_HPP
#define BIND_RRT_HPP

void bindRRTGraph(){

  /* -------------START OF ACTION------------- */
  
  using namespace pathfinder;

  emscripten::class_<RRTGraph<Action<coordDouble_t>>, emscripten::base<Pathfinder<Action<coordDouble_t>>>>("RRTPlanner")
    .constructor<>()
    .function("getNumMapNodes", &RRTGraph<Action<coordDouble_t>>::getNumMapNodes)
    .function("wrapperSearch", &RRTGraph<Action<coordDouble_t>>::wrapperSearch)
    .function("wrapperGNM", &RRTGraph<Action<coordDouble_t>>::wrapperGNM)
    // .function("nextGNM", &RRTGraph<Action<coordDouble_t>>::nextGNM)
    .function("runNextSearch", &RRTGraph<Action<coordDouble_t>>::runNextSearch)
    .function("addMapNode", &RRTGraph<Action<coordDouble_t>>::addMapNode)
    .function("addMapEdge", &RRTGraph<Action<coordDouble_t>>::addMapEdge)
    .function("getMapNodes", &RRTGraph<Action<coordDouble_t>>::getMapNodes)
    .function("getMapEdges", &RRTGraph<Action<coordDouble_t>>::getMapEdges)
    .function("clearMapNodes", &RRTGraph<Action<coordDouble_t>>::clearMapNodes)
    ;
  
  /* -------------END OF ACTION------------- */

  /* -------------START OF BASEACTION------------- */
  
  emscripten::class_<RRTGraph<BaseAction<coordDouble_t>>, emscripten::base<Pathfinder<BaseAction<coordDouble_t>>>>("BaseRRTPlanner")
    .constructor<>()
    .function("getNumMapNodes", &RRTGraph<BaseAction<coordDouble_t>>::getNumMapNodes)
    .function("wrapperSearch", &RRTGraph<BaseAction<coordDouble_t>>::wrapperSearch)
    .function("wrapperGNM", &RRTGraph<BaseAction<coordDouble_t>>::wrapperGNM)
    // .function("nextGNM", &RRTGraph<BaseAction<coordDouble_t>>::nextGNM)
    .function("runNextSearch", &RRTGraph<BaseAction<coordDouble_t>>::runNextSearch)
    .function("addMapNode", &RRTGraph<BaseAction<coordDouble_t>>::addMapNode)
    .function("addMapEdge", &RRTGraph<BaseAction<coordDouble_t>>::addMapEdge)
    .function("getMapNodes", &RRTGraph<BaseAction<coordDouble_t>>::getMapNodes)
    .function("getMapEdges", &RRTGraph<BaseAction<coordDouble_t>>::getMapEdges)
    .function("clearMapNodes", &RRTGraph<BaseAction<coordDouble_t>>::clearMapNodes)
    ;
  /* -------------END OF BASEACTION------------- */
}

#endif