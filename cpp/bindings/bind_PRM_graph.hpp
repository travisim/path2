#include <emscripten/bind.h>
#include "../pathfinder/PRMGraph.hpp"

#ifndef BIND_PRMGRAPH_HPP
#define BIND_PRMGRAPH_HPP

void bindPRMGraph(){

  /* -------------START OF ACTION------------- */

using namespace pathfinder;

emscripten::class_<PRMGraph<Action<coordInt_t>>, emscripten::base<Pathfinder<Action<coordInt_t>>>>("VGPlanner")
    .constructor<>()
    .function("getNumMapNodes", &PRMGraph<Action<coordInt_t>>::getNumMapNodes)
    .function("wrapperSearch", &PRMGraph<Action<coordInt_t>>::wrapperSearch)
    .function("generateNewMap", &PRMGraph<Action<coordInt_t>>::generateNewMap)
    .function("runNextSearch", &PRMGraph<Action<coordInt_t>>::runNextSearch)
    ;

  /* -------------END OF ACTION------------- */

  /* -------------START OF BASEACTION------------- */

emscripten::class_<PRMGraph<BaseAction<coordInt_t>>, emscripten::base<Pathfinder<BaseAction<coordInt_t>>>>("BaseVGPlanner")
    .constructor<>()
    .function("wrapperSearch", &PRMGraph<BaseAction<coordInt_t>>::wrapperSearch)
    .function("generateNewMap", &PRMGraph<BaseAction<coordInt_t>>::generateNewMap)
    .function("runNextSearch", &PRMGraph<BaseAction<coordInt_t>>::runNextSearch)
    ;
  /* -------------END OF BASEACTION------------- */
}

#endif