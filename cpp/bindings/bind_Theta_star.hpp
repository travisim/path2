#include <emscripten/bind.h>
#include "../pathfinder/Theta_star.hpp"

#ifndef BIND_THETASTAR_HPP
#define BIND_THETASTAR_HPP

void bindThetaStar(){

  /* -------------START OF ACTION------------- */
  
  using namespace pathfinder;

  emscripten::class_<Theta_star<Action<coordInt_t>>, emscripten::base<A_star<Action<coordInt_t>>>>("ThetaStarPlanner")
    .constructor<>()
    .function("wrapperSearch", &Theta_star<Action<coordInt_t>>::wrapperSearch)
    .function("search", &Theta_star<Action<coordInt_t>>::search)
    .function("runNextSearch", &Theta_star<Action<coordInt_t>>::runNextSearch)
    .function("insertNode", &Theta_star<Action<coordInt_t>>::insertNode)
    .function("eraseNode", &Theta_star<Action<coordInt_t>>::eraseNode)
    .function("pqSize", &Theta_star<Action<coordInt_t>>::pqSize)
    .function("createNodes", &Theta_star<Action<coordInt_t>>::createNodes)
    ;
  
  /* -------------END OF ACTION------------- */

  /* -------------START OF BASEACTION------------- */
  
  emscripten::class_<Theta_star<BaseAction<coordInt_t>>, emscripten::base<A_star<BaseAction<coordInt_t>>>>("BaseThetaStarPlanner")
    .constructor<>()
    .function("wrapperSearch", &Theta_star<BaseAction<coordInt_t>>::wrapperSearch)
    .function("search", &Theta_star<BaseAction<coordInt_t>>::search)
    .function("runNextSearch", &Theta_star<BaseAction<coordInt_t>>::runNextSearch)
    .function("insertNode", &Theta_star<BaseAction<coordInt_t>>::insertNode)
    .function("eraseNode", &Theta_star<BaseAction<coordInt_t>>::eraseNode)
    .function("pqSize", &Theta_star<BaseAction<coordInt_t>>::pqSize)
    .function("createNodes", &Theta_star<BaseAction<coordInt_t>>::createNodes)
    ;
  /* -------------END OF BASEACTION------------- */
}

#endif