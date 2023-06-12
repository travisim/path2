#include <emscripten/bind.h>
#include <iostream>
#define STBI_ASSERT(x)

#include "bindings/register_ds.hpp"
#include "bindings/bind_data.hpp"
#include "bindings/bind_pathfinder.hpp"
#include "bindings/bind_A_star.hpp"
#include "bindings/bind_Theta_star.hpp"
#include "bindings/bind_Visibility_graph.hpp"
#include "bindings/bind_RRT_graph.hpp"

int main() { return 0; }


EMSCRIPTEN_BINDINGS(myModule) {

  bindAction(BindType::int_coord);
  bindStep(BindType::int_coord);
  bindState(BindType::int_coord);
  bindFreeStores(BindType::int_coord);
  bindPathfinder(BindType::int_coord);
  bindGridPathfinder(BindType::int_coord);
  bindAStar();
  bindThetaStar();
  bindVisibilityGraph();
  bindRRTGraph();

  // misc
  emscripten::class_<coordInt_t>("coordInt_t")
    .constructor<>()
    .property("x", &coordInt_t::first)
    .property("y", &coordInt_t::second)
    ;

  /* conflicts with bound_t */
  // emscripten::class_<coordDouble_t>("coordDouble_t")
  //   .constructor<>()
  //   .property("x", &coordDouble_t::first)
  //   .property("y", &coordDouble_t::second)
  //   ;

  // bounds
  emscripten_extensions::register_unordered_map<int, bound_t>("bounds");
  emscripten::class_<bound_t>("bound_t")
    .constructor<>()
    .property("min", &bound_t::first)
    .property("max", &bound_t::second)
    ;
    
  emscripten::register_vector<int>("vectorInt");
  emscripten::register_vector<std::vector<int>>("vectorVectorInt");
  emscripten::register_vector<std::string>("vectorString");
  emscripten::register_vector<std::vector<std::string>>("vectorVectorString");
  emscripten::register_vector<double>("vectorDouble");

}
