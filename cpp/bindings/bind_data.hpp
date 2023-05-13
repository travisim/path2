#include <emscripten/bind.h>
#include "../pathfinder/enums.hpp"
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
    emscripten::register_vector<pathfinder::Action<coordDouble_t>>("vectorActionInt");
    emscripten::class_<pathfinder::Step<pathfinder::Action<coordDouble_t>>>("StepInt")
      .constructor<>()
      .property("fwdActions", &pathfinder::Step<pathfinder::Action<coordDouble_t>>::fwdActions)
      .property("revActions", &pathfinder::Step<pathfinder::Action<coordDouble_t>>::revActions)
      .property("combined", &pathfinder::Step<pathfinder::Action<coordDouble_t>>::combined)
      ;

    emscripten::register_vector<pathfinder::BaseAction<coordDouble_t>>("vectorBaseActionInt");
    emscripten::class_<pathfinder::Step<pathfinder::BaseAction<coordDouble_t>>>("BaseStepInt")
      .constructor<>()
      .property("fwdActions", &pathfinder::Step<pathfinder::BaseAction<coordDouble_t>>::fwdActions)
      .property("revActions", &pathfinder::Step<pathfinder::BaseAction<coordDouble_t>>::revActions)
      .property("combined", &pathfinder::Step<pathfinder::BaseAction<coordDouble_t>>::combined)
      ;
  }
}

void bindState(BindType myType){
  
  if(myType == BindType::int_coord){
    emscripten::class_<pathfinder::State<coordInt_t>>("State")
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

    emscripten::class_<pathfinder::FreeVertex<coordInt_t>>("FreeVertexInt")
      .constructor<>()
      .property("xy", &pathfinder::FreeVertex<coordInt_t>::xy)
      .property("colorIndex", &pathfinder::FreeVertex<coordInt_t>::colorIndex)
      .property("radius", &pathfinder::FreeVertex<coordInt_t>::radius)
      ;

    emscripten_extensions::register_unordered_map<int, std::vector<pathfinder::FreeVertex<coordInt_t>>>("verticesInt");
    emscripten::register_vector<pathfinder::FreeVertex<coordInt_t>>("vectorVertexInt");

    emscripten::class_<pathfinder::FreeEdge<coordInt_t>>("FreeEdgeInt")
      .constructor<>()
      .property("startXY", &pathfinder::FreeEdge<coordInt_t>::startXY)
      .property("endXY", &pathfinder::FreeEdge<coordInt_t>::endXY)
      .property("colorIndex", &pathfinder::FreeEdge<coordInt_t>::colorIndex)
      .property("lineWidth", &pathfinder::FreeEdge<coordInt_t>::lineWidth)
      ;

    emscripten_extensions::register_unordered_map<int, std::vector<pathfinder::FreeEdge<coordInt_t>>>("edgesInt");
    emscripten::register_vector<pathfinder::FreeEdge<coordInt_t>>("vectorEdgeInt");
  }
  else if(myType == BindType::double_coord){
    // TO DO
  }

  /* STATE PROPERTIES BINDINGS */
  emscripten_extensions::register_unordered_map<int, rowf_t>("canvases");
  emscripten_extensions::register_unordered_map<int, InfoTableState>("infotables");
  emscripten::class_<InfoTableState>("InfoTableState")
    .constructor<>()
    .property("rowSize", &InfoTableState::rowSize)
    .property("highlightedRow", &InfoTableState::highlightedRow)
    .property("rows", &InfoTableState::rows); //vectorVectorString

  emscripten_extensions::register_unordered_map<int, uint8_t>("arrowColor");
  /* END OF STATE PROPERTIES BINDINGS */
}

#endif