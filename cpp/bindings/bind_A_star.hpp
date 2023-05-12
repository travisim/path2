#include <emscripten/bind.h>
#include "../pathfinder/A_star.hpp"

#ifndef BIND_ASTAR_HPP
#define BIND_ASTAR_HPP

void bindAStar(){

  /* -------------START OF ACTION------------- */
  
  using namespace pathfinder;

  emscripten::class_<A_star<Action<coordInt_t>>, emscripten::base<GridPathfinder<Action<coordInt_t>>>>("AStarPlanner")
    .constructor<>()
    .function("wrapperSearch", &A_star<Action<coordInt_t>>::wrapperSearch)
    .function("search", &A_star<Action<coordInt_t>>::search)
    .function("runNextSearch", &A_star<Action<coordInt_t>>::runNextSearch)
    .function("insertNode", &A_star<Action<coordInt_t>>::insertNode)
    .function("eraseNode", &A_star<Action<coordInt_t>>::eraseNode)
    .function("pqSize", &A_star<Action<coordInt_t>>::pqSize)
    .function("createNodes", &A_star<Action<coordInt_t>>::createNodes)
    ;
  
  /* -------------END OF ACTION------------- */

  /* -------------START OF BASEACTION------------- */
  
  emscripten::class_<A_star<BaseAction<coordInt_t>>, emscripten::base<GridPathfinder<BaseAction<coordInt_t>>>>("BaseAStarPlanner")
    .constructor<>()
    .function("wrapperSearch", &A_star<BaseAction<coordInt_t>>::wrapperSearch)
    .function("search", &A_star<BaseAction<coordInt_t>>::search)
    .function("runNextSearch", &A_star<BaseAction<coordInt_t>>::runNextSearch)
    .function("insertNode", &A_star<BaseAction<coordInt_t>>::insertNode)
    .function("eraseNode", &A_star<BaseAction<coordInt_t>>::eraseNode)
    .function("pqSize", &A_star<BaseAction<coordInt_t>>::pqSize)
    .function("createNodes", &A_star<BaseAction<coordInt_t>>::createNodes)
    ;
  /* -------------END OF BASEACTION------------- */
}

#endif