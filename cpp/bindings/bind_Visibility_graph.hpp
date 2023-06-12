#include <emscripten/bind.h>
#include "../pathfinder/VisibilityGraph.hpp"

#ifndef BIND_VISIBILITYGRAPH_HPP
#define BIND_VISIBILITYGRAPH_HPP

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
    .function("addMapNode", &VisibilityGraph<Action<coordInt_t>>::addMapNode)
    .function("addMapEdge", &VisibilityGraph<Action<coordInt_t>>::addMapEdge)
    .function("getMapNodes", &VisibilityGraph<Action<coordInt_t>>::getMapNodes)
    .function("getMapEdges", &VisibilityGraph<Action<coordInt_t>>::getMapEdges)
    .function("clearMapNodes", &VisibilityGraph<Action<coordInt_t>>::clearMapNodes)
    ;
  
  /* -------------END OF ACTION------------- */

  /* -------------START OF BASEACTION------------- */
  
  emscripten::class_<VisibilityGraph<BaseAction<coordInt_t>>, emscripten::base<Pathfinder<BaseAction<coordInt_t>>>>("BaseVGPlanner")
    .constructor<>()
    .function("getNumMapNodes", &VisibilityGraph<BaseAction<coordInt_t>>::getNumMapNodes)
    .function("wrapperSearch", &VisibilityGraph<BaseAction<coordInt_t>>::wrapperSearch)
    .function("wrapperGNM", &VisibilityGraph<BaseAction<coordInt_t>>::wrapperGNM)
    .function("nextGNM", &VisibilityGraph<BaseAction<coordInt_t>>::nextGNM)
    .function("runNextSearch", &VisibilityGraph<BaseAction<coordInt_t>>::runNextSearch)
    .function("addMapNode", &VisibilityGraph<BaseAction<coordInt_t>>::addMapNode)
    .function("addMapEdge", &VisibilityGraph<BaseAction<coordInt_t>>::addMapEdge)
    .function("getMapNodes", &VisibilityGraph<BaseAction<coordInt_t>>::getMapNodes)
    .function("getMapEdges", &VisibilityGraph<BaseAction<coordInt_t>>::getMapEdges)
    .function("clearMapNodes", &VisibilityGraph<BaseAction<coordInt_t>>::clearMapNodes)
    ;
  /* -------------END OF BASEACTION------------- */
}

#endif