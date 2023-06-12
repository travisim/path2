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
    .function("generateNewMap", &RRTGraph<Action<coordInt_t>>::generateNewMap)
    .function("runNextSearch", &RRTGraph<Action<coordInt_t>>::runNextSearch)
    ;

  /* -------------END OF ACTION------------- */

  /* -------------START OF BASEACTION------------- */

emscripten::class_<RRTGraph<BaseAction<coordInt_t>>, emscripten::base<Pathfinder<BaseAction<coordInt_t>>>>("BaseRRTPlanner")
    .constructor<>()
    .function("wrapperSearch", &RRTGraph<BaseAction<coordInt_t>>::wrapperSearch)
    .function("generateNewMap", &RRTGraph<BaseAction<coordInt_t>>::generateNewMap)
    .function("runNextSearch", &RRTGraph<BaseAction<coordInt_t>>::runNextSearch)
    ;
  /* -------------END OF BASEACTION------------- */
}

#endif