#include <emscripten/bind.h>
#include <iostream>
#define STBI_ASSERT(x)

#include "bindings/register_ds.hpp"
#include "bindings/bind_data.hpp"
#include "bindings/bind_pathfinder.hpp"
#include "bindings/bind_A_star.hpp"
#include "bindings/bind_Theta_star.hpp"
#include "bindings/bind_Visibility_graph.hpp"


int main() { return 0; }


EMSCRIPTEN_BINDINGS(myModule) {

  bindAction(BindType::int_coord);
  bindStep(BindType::int_coord);
  bindState(BindType::int_coord);
  bindPathfinder(BindType::int_coord);
  bindGridPathfinder(BindType::int_coord);
  bindAStar();
  bindThetaStar();
  bindVisibilityGraph();

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

  // bind stores
  emscripten::class_<StoredVertex<coordInt_t>>("StoredVertexInt")
    .constructor<>()
    .property("nodeCoord", &StoredVertex<coordInt_t>::nodeCoord)
    .property("colorIndex", &StoredVertex<coordInt_t>::colorIndex)
    .property("anyVal", &StoredVertex<coordInt_t>::anyVal)
    ;
  
  emscripten::class_<StoredEdge<coordInt_t>>("StoredEdgeInt")
    .constructor<>()
    .property("nodeCoord", &StoredEdge<coordInt_t>::nodeCoord)
    .property("endCoord", &StoredEdge<coordInt_t>::endCoord)
    .property("colorIndex", &StoredEdge<coordInt_t>::colorIndex)
    .property("anyVal", &StoredEdge<coordInt_t>::anyVal)
    ;

  
  emscripten::class_<StoredVertex<coordDouble_t>>("StoredVertexDouble")
    .constructor<>()
    .property("nodeCoord", &StoredVertex<coordDouble_t>::nodeCoord)
    .property("colorIndex", &StoredVertex<coordDouble_t>::colorIndex)
    .property("anyVal", &StoredVertex<coordDouble_t>::anyVal)
    ;
  
  emscripten::class_<StoredEdge<coordDouble_t>>("StoredEdgeDouble")
    .constructor<>()
    .property("nodeCoord", &StoredEdge<coordDouble_t>::nodeCoord)
    .property("endCoord", &StoredEdge<coordDouble_t>::endCoord)
    .property("colorIndex", &StoredEdge<coordDouble_t>::colorIndex)
    .property("anyVal", &StoredEdge<coordDouble_t>::anyVal)
    ;

  emscripten::register_vector<StoredVertex<coordInt_t>>("vectorStoredVertexInt");
  emscripten::register_vector<StoredEdge<coordInt_t>>("vectorStoredEdgeInt");
  emscripten::register_vector<StoredVertex<coordDouble_t>>("vectorStoredVertexDouble");
  emscripten::register_vector<StoredEdge<coordDouble_t>>("vectorStoredEdgeDouble");
  
  emscripten_extensions::register_unordered_map<int, std::vector<StoredVertex<coordInt_t>>>("vertexStoreInt");
  emscripten_extensions::register_unordered_map<int, std::vector<StoredEdge<coordInt_t>>>("edgeStoreInt");
  emscripten_extensions::register_unordered_map<int, std::vector<StoredVertex<coordDouble_t>>>("vertexStoreDouble");
  emscripten_extensions::register_unordered_map<int, std::vector<StoredEdge<coordDouble_t>>>("edgeStoreDouble");
}
