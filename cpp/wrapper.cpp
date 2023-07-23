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
#include "bindings/bind_PRM_graph.hpp"

int main() { return 0; }


EMSCRIPTEN_BINDINGS(myModule) {

  // GENERIC INTEGER BINDS
  bindAction(BindType::int_coord);
  bindStep(BindType::int_coord);
  bindState(BindType::int_coord);
  bindFreeStores(BindType::int_coord);
  bindMapNode(BindType::int_coord, true);
  bindMapEdge(BindType::int_coord, true);
  bindPathfinder(BindType::int_coord);
  bindGridPathfinder(BindType::int_coord);  // a grid-based pathfinder only makes sense with integer coordinates

  // GENERIC DOUBLE BINDINGS
  bindAction(BindType::double_coord);
  bindStep(BindType::double_coord);
  bindState(BindType::double_coord);
  bindFreeStores(BindType::double_coord);
  bindMapNode(BindType::double_coord, true);
  bindMapEdge(BindType::double_coord, true);
  bindPathfinder(BindType::double_coord);

  // GENERIC BINDINGS
  bindStateProperties();  // required if you want to use the State class

  bindAStar();
  bindThetaStar();
  bindVisibilityGraph();
  bindRRTGraph();
  bindPRMGraph();

  // misc
  emscripten::class_<coordInt_t>("pairInt")  // used for integer coordinates
    .constructor<>()
    .property("x", &coordInt_t::first)
    .property("y", &coordInt_t::second)
    ;
  
  emscripten::class_<coordDouble_t>("pairDouble")  // used for double coordinates and bounds
    .constructor<>()
    .property("x", &coordDouble_t::first)
    .property("y", &coordDouble_t::second)
    .property("min", &coordDouble_t::first)  //  double alias for bounds
    .property("max", &coordDouble_t::second)
    ;

  // bounds
  emscripten_extensions::register_unordered_map<int, bound_t>("bounds");
    
  emscripten::register_vector<int>("vectorInt");
  emscripten::register_vector<std::vector<int>>("vectorVectorInt");
  emscripten::register_vector<std::string>("vectorString");
  emscripten::register_vector<std::vector<std::string>>("vectorVectorString");
  emscripten::register_vector<double>("vectorDouble");

}
