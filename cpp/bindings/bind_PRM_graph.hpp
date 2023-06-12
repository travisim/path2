#include <emscripten/bind.h>
#include "../pathfinder/PRMGraph.hpp"

#ifndef BIND_PRM_HPP
#define BIND_PRM_HPP

void bindPRMGraph(){

  /* -------------START OF ACTION------------- */
  
  using namespace pathfinder;

  emscripten::class_<PRMGraph<Action<coordInt_t>>, emscripten::base<Pathfinder<Action<coordInt_t>>>>("PRMPlanner")
    .constructor<>()
    .function("getNumMapNodes", &PRMGraph<Action<coordInt_t>>::getNumMapNodes)
    .function("wrapperSearch", &PRMGraph<Action<coordInt_t>>::wrapperSearch)
    .function("wrapperGNM", &PRMGraph<Action<coordInt_t>>::wrapperGNM)
    .function("nextGNM", &PRMGraph<Action<coordInt_t>>::nextGNM)
    .function("runNextSearch", &PRMGraph<Action<coordInt_t>>::runNextSearch)
    .function("addMapNode", &PRMGraph<Action<coordInt_t>>::addMapNode)
    .function("addMapEdge", &PRMGraph<Action<coordInt_t>>::addMapEdge)
    .function("getMapNodes", &PRMGraph<Action<coordInt_t>>::getMapNodes)
    .function("getMapEdges", &PRMGraph<Action<coordInt_t>>::getMapEdges)
    .function("clearMapNodes", &PRMGraph<Action<coordInt_t>>::clearMapNodes)
    ;
  
  /* -------------END OF ACTION------------- */

  /* -------------START OF BASEACTION------------- */
  
  emscripten::class_<PRMGraph<BaseAction<coordInt_t>>, emscripten::base<Pathfinder<BaseAction<coordInt_t>>>>("BasePRMPlanner")
    .constructor<>()
    .function("getNumMapNodes", &PRMGraph<BaseAction<coordInt_t>>::getNumMapNodes)
    .function("wrapperSearch", &PRMGraph<BaseAction<coordInt_t>>::wrapperSearch)
    .function("wrapperGNM", &PRMGraph<BaseAction<coordInt_t>>::wrapperGNM)
    .function("nextGNM", &PRMGraph<BaseAction<coordInt_t>>::nextGNM)
    .function("runNextSearch", &PRMGraph<BaseAction<coordInt_t>>::runNextSearch)
    .function("addMapNode", &PRMGraph<BaseAction<coordInt_t>>::addMapNode)
    .function("addMapEdge", &PRMGraph<BaseAction<coordInt_t>>::addMapEdge)
    .function("getMapNodes", &PRMGraph<BaseAction<coordInt_t>>::getMapNodes)
    .function("getMapEdges", &PRMGraph<BaseAction<coordInt_t>>::getMapEdges)
    .function("clearMapNodes", &PRMGraph<BaseAction<coordInt_t>>::clearMapNodes)
    ;
  /* -------------END OF BASEACTION------------- */
}

#endif