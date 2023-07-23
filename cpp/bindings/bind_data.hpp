#include <emscripten/bind.h>
#include "../pathfinder/enums.hpp"
#include "../pathfinder/node.hpp"
#include "register_ds.hpp"


#ifndef BIND_DATA_HPP
#define BIND_DATA_HPP

enum class BindType{
  int_coord,
  double_coord,
};

void bindAction(BindType myType){
  
  if(myType == BindType::int_coord){
    emscripten::class_<pathfinder::Action<coordInt_t>>("ActionInt")
      .constructor<>()
      .property("command", &pathfinder::Action<coordInt_t>::command)
      .property("dest", &pathfinder::Action<coordInt_t>::dest)
      .property("nodeCoord", &pathfinder::Action<coordInt_t>::nodeCoord)
      .property("colorIndex", &pathfinder::Action<coordInt_t>::colorIndex)
      .property("arrowIndex", &pathfinder::Action<coordInt_t>::arrowIndex)
      .property("pseudoCodeRow", &pathfinder::Action<coordInt_t>::pseudoCodeRow)
      .property("infoTableRowIndex", &pathfinder::Action<coordInt_t>::infoTableRowIndex)
      .property("infoTableRowData", &pathfinder::Action<coordInt_t>::infoTableRowData)
      .property("anyVal", &pathfinder::Action<coordInt_t>::anyVal)
      .property("endCoord", &pathfinder::Action<coordInt_t>::endCoord)
      ;

    emscripten::class_<pathfinder::BaseAction<coordInt_t>>("BaseActionInt")
      .constructor<>()
      .property("command", &pathfinder::BaseAction<coordInt_t>::command)
      .property("dest", &pathfinder::BaseAction<coordInt_t>::dest)
      .property("nodeCoord", &pathfinder::BaseAction<coordInt_t>::nodeCoord)
      .property("arrowIndex", &pathfinder::BaseAction<coordInt_t>::arrowIndex)
      .property("anyVal", &pathfinder::BaseAction<coordInt_t>::anyVal)
      ;
  }
  else if(myType == BindType::double_coord){
    emscripten::class_<pathfinder::Action<coordDouble_t>>("ActionDouble")
      .constructor<>()
      .property("command", &pathfinder::Action<coordDouble_t>::command)
      .property("dest", &pathfinder::Action<coordDouble_t>::dest)
      .property("nodeCoord", &pathfinder::Action<coordDouble_t>::nodeCoord)
      .property("colorIndex", &pathfinder::Action<coordDouble_t>::colorIndex)
      .property("arrowIndex", &pathfinder::Action<coordDouble_t>::arrowIndex)
      .property("pseudoCodeRow", &pathfinder::Action<coordDouble_t>::pseudoCodeRow)
      .property("infoTableRowIndex", &pathfinder::Action<coordDouble_t>::infoTableRowIndex)
      .property("infoTableRowData", &pathfinder::Action<coordDouble_t>::infoTableRowData)
      .property("anyVal", &pathfinder::Action<coordDouble_t>::anyVal)
      .property("endCoord", &pathfinder::Action<coordDouble_t>::endCoord)
      ;

    emscripten::class_<pathfinder::BaseAction<coordDouble_t>>("BaseActionDouble")
      .constructor<>()
      .property("command", &pathfinder::BaseAction<coordDouble_t>::command)
      .property("dest", &pathfinder::BaseAction<coordDouble_t>::dest)
      .property("nodeCoord", &pathfinder::BaseAction<coordDouble_t>::nodeCoord)
      .property("arrowIndex", &pathfinder::BaseAction<coordDouble_t>::arrowIndex)
      .property("anyVal", &pathfinder::BaseAction<coordDouble_t>::anyVal)
      ;
  }
}

void bindStep(BindType myType){
  
  if(myType == BindType::int_coord){
    emscripten::register_vector<pathfinder::Action<coordInt_t>>("vectorActionInt");
    emscripten::class_<pathfinder::Step<pathfinder::Action<coordInt_t>>>("StepInt")
      .constructor<>()
      .property("fwdActions", &pathfinder::Step<pathfinder::Action<coordInt_t>>::fwdActions)
      .property("revActions", &pathfinder::Step<pathfinder::Action<coordInt_t>>::revActions)
      .property("combined", &pathfinder::Step<pathfinder::Action<coordInt_t>>::combined)
      ;

    emscripten::register_vector<pathfinder::BaseAction<coordInt_t>>("vectorBaseActionInt");
    emscripten::class_<pathfinder::Step<pathfinder::BaseAction<coordInt_t>>>("BaseStepInt")
      .constructor<>()
      .property("fwdActions", &pathfinder::Step<pathfinder::BaseAction<coordInt_t>>::fwdActions)
      .property("revActions", &pathfinder::Step<pathfinder::BaseAction<coordInt_t>>::revActions)
      .property("combined", &pathfinder::Step<pathfinder::BaseAction<coordInt_t>>::combined)
      ;
  }
  else if(myType == BindType::double_coord){
    emscripten::register_vector<pathfinder::Action<coordDouble_t>>("vectorActionDouble");
    emscripten::class_<pathfinder::Step<pathfinder::Action<coordDouble_t>>>("StepDouble")
      .constructor<>()
      .property("fwdActions", &pathfinder::Step<pathfinder::Action<coordDouble_t>>::fwdActions)
      .property("revActions", &pathfinder::Step<pathfinder::Action<coordDouble_t>>::revActions)
      .property("combined", &pathfinder::Step<pathfinder::Action<coordDouble_t>>::combined)
      ;

    emscripten::register_vector<pathfinder::BaseAction<coordDouble_t>>("vectorBaseActionDouble");
    emscripten::class_<pathfinder::Step<pathfinder::BaseAction<coordDouble_t>>>("BaseStepDouble")
      .constructor<>()
      .property("fwdActions", &pathfinder::Step<pathfinder::BaseAction<coordDouble_t>>::fwdActions)
      .property("revActions", &pathfinder::Step<pathfinder::BaseAction<coordDouble_t>>::revActions)
      .property("combined", &pathfinder::Step<pathfinder::BaseAction<coordDouble_t>>::combined)
      ;
  }
}

void bindState(BindType myType){
  
  if(myType == BindType::int_coord){
    emscripten::class_<pathfinder::State<coordInt_t>>("StateInt")
      .constructor<>()
      .property("valid", &pathfinder::State<coordInt_t>::valid)
      .property("canvases", &pathfinder::State<coordInt_t>::canvases)
      .property("infotables", &pathfinder::State<coordInt_t>::infotables)
      .property("vertices", &pathfinder::State<coordInt_t>::vertices)
      .property("edges", &pathfinder::State<coordInt_t>::edges)
      .property("arrowColor", &pathfinder::State<coordInt_t>::arrowColor)
      .property("pseudoCodeRowPri", &pathfinder::State<coordInt_t>::pseudoCodeRowPri)
      .property("pseudoCodeRowSec", &pathfinder::State<coordInt_t>::pseudoCodeRowSec)
      ;
  }
  else if(myType == BindType::double_coord){
    emscripten::class_<pathfinder::State<coordDouble_t>>("StateDouble")
      .constructor<>()
      .property("valid", &pathfinder::State<coordDouble_t>::valid)
      .property("canvases", &pathfinder::State<coordDouble_t>::canvases)
      .property("infotables", &pathfinder::State<coordDouble_t>::infotables)
      .property("vertices", &pathfinder::State<coordDouble_t>::vertices)
      .property("edges", &pathfinder::State<coordDouble_t>::edges)
      .property("arrowColor", &pathfinder::State<coordDouble_t>::arrowColor)
      .property("pseudoCodeRowPri", &pathfinder::State<coordDouble_t>::pseudoCodeRowPri)
      .property("pseudoCodeRowSec", &pathfinder::State<coordDouble_t>::pseudoCodeRowSec)
      ;
  }
}

void bindStateProperties(){
  /* STATE PROPERTIES BINDINGS */
  emscripten_extensions::register_unordered_map<int, rowf_t>("canvases");
  emscripten_extensions::register_unordered_map<int, InfoTableState>("infotables");
  emscripten::class_<InfoTableState>("InfoTableState")
    .constructor<>()
    .property("rowSize", &InfoTableState::rowSize)
    .property("highlightedRow", &InfoTableState::highlightedRow)
    .property("rows", &InfoTableState::rows); //vectorVectorString

  emscripten_extensions::register_unordered_map<int, uint8_t>("arrowColor");
  emscripten_extensions::register_unordered_map<int, std::vector<int>>("uMapVectorInt");
  /* END OF STATE PROPERTIES BINDINGS */
}

void bindFreeStores(BindType myType){
  // bind stores
  if(myType == BindType::int_coord){
    emscripten::class_<StoredVertex<coordInt_t>>("StoredVertexInt")
      .constructor<>()
      .property("nodeCoord", &StoredVertex<coordInt_t>::nodeCoord)
      .property("colorIndex", &StoredVertex<coordInt_t>::colorIndex)
      .property("radius", &StoredVertex<coordInt_t>::radius)
      .property("dest", &StoredVertex<coordInt_t>::dest)
      ;
    
    emscripten::class_<StoredEdge<coordInt_t>>("StoredEdgeInt")
      .constructor<>()
      .property("nodeCoord", &StoredEdge<coordInt_t>::nodeCoord)
      .property("endCoord", &StoredEdge<coordInt_t>::endCoord)
      .property("colorIndex", &StoredEdge<coordInt_t>::colorIndex)
      .property("lineWidth", &StoredEdge<coordInt_t>::opacity)
      ;
    
    emscripten::register_vector<StoredVertex<coordInt_t>>("vectorStoredVertexInt");
    emscripten::register_vector<StoredEdge<coordInt_t>>("vectorStoredEdgeInt");
    
    // emscripten::register_vector<StoredVertex<coordDouble_t>>("vertexStoreNewInt");  // TO CHECK

    emscripten_extensions::register_unordered_map<int, std::vector<StoredVertex<coordInt_t>>>("vertexStoreInt");
    emscripten_extensions::register_unordered_map<int, std::vector<StoredEdge<coordInt_t>>>("edgeStoreInt");
  }
  else if(myType == BindType::double_coord){
    emscripten::class_<StoredVertex<coordDouble_t>>("StoredVertexDouble")
      .constructor<>()
      .property("nodeCoord", &StoredVertex<coordDouble_t>::nodeCoord)
      .property("colorIndex", &StoredVertex<coordDouble_t>::colorIndex)
      .property("radius", &StoredVertex<coordDouble_t>::radius)
      .property("dest", &StoredVertex<coordDouble_t>::dest)
      ;
    
    emscripten::class_<StoredEdge<coordDouble_t>>("StoredEdgeDouble")
      .constructor<>()
      .property("nodeCoord", &StoredEdge<coordDouble_t>::nodeCoord)
      .property("endCoord", &StoredEdge<coordDouble_t>::endCoord)
      .property("colorIndex", &StoredEdge<coordDouble_t>::colorIndex)
      .property("lineWidth", &StoredEdge<coordDouble_t>::opacity)
      ;

    emscripten::register_vector<StoredVertex<coordDouble_t>>("vectorStoredVertexDouble");
    emscripten::register_vector<StoredEdge<coordDouble_t>>("vectorStoredEdgeDouble");
   
    // emscripten::register_vector<StoredVertex<coordDouble_t>>("vertexStoreNewDouble"); // TO CHECK
    emscripten_extensions::register_unordered_map<int, std::vector<StoredVertex<coordDouble_t>>>("vertexStoreDouble");
    emscripten_extensions::register_unordered_map<int, std::vector<StoredEdge<coordDouble_t>>>("edgeStoreDouble"); 
  }
}

void bindMapNode(BindType myType, bool bindVector = false){
  if(myType == BindType::int_coord){
    emscripten::class_<pathfinder::MapNode<coordInt_t>>("MapNodeInt")
      .constructor<coordInt_t>()
      .property("valueXY", &pathfinder::MapNode<coordInt_t>::valueXY)
      .property("parent", &pathfinder::MapNode<coordInt_t>::parent)
      .property("gCost", &pathfinder::MapNode<coordInt_t>::gCost)
      .function("getNeighbors", &pathfinder::MapNode<coordInt_t>::getNeighbors)
      ;
    if(bindVector)
      emscripten::register_vector<pathfinder::MapNode<coordInt_t>>("vectorMapNodeInt");
  }
  else if(myType == BindType::double_coord){
    emscripten::class_<pathfinder::MapNode<coordDouble_t>>("MapNodeDouble")
      .constructor<coordDouble_t>()
      .property("valueXY", &pathfinder::MapNode<coordDouble_t>::valueXY)
      .property("parent", &pathfinder::MapNode<coordDouble_t>::parent)
      .property("gCost", &pathfinder::MapNode<coordDouble_t>::gCost)
      .function("getNeighbors", &pathfinder::MapNode<coordDouble_t>::getNeighbors)
      ;
    if(bindVector)
      emscripten::register_vector<pathfinder::MapNode<coordDouble_t>>("vectorMapNodeDouble");
  }
}

void bindMapEdge(BindType myType, bool bindVector = false){
  if(myType == BindType::int_coord){
    emscripten_extensions::register_array<coordInt_t, 2>("MapEdgeInt");
    if(bindVector)
      emscripten::register_vector<std::array<coordInt_t, 2>>("vectorMapEdgeInt");
  }
  else if(myType == BindType::double_coord){
    emscripten_extensions::register_array<coordDouble_t, 2>("MapEdgeDouble");
    if(bindVector)
      emscripten::register_vector<std::array<coordDouble_t, 2>>("vectorMapEdgeDouble");
  }
}

#endif