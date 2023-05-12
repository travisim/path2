#include <emscripten/bind.h>
#include "../pathfinder/pathfinder.hpp"
#include "../pathfinder/grid_pathfinder.hpp"
#include "../bindings/bind_data.hpp"

#ifndef BIND_PATHFINDER_HPP
#define BIND_PATHFINDER_HPP

/* INTEGER BINDINGS */
void bindPathfinder(BindType myType){
  using namespace pathfinder;
  if(myType == BindType::int_coord){
    emscripten::class_<Pathfinder<Action<coordInt_t>>>("PathfinderInt")
      .constructor()
      .property("stepIndex", &Pathfinder<Action<coordInt_t>>::stepIndex)
      .property("arrowCoords", &Pathfinder<Action<coordInt_t>>::arrowCoords)
      .function("maxStep", &Pathfinder<Action<coordInt_t>>::maxStep)
    
      .function("generateReverseSteps", &Pathfinder<Action<coordInt_t>>::generateReverseSteps)
      .function("nextGenSteps", &Pathfinder<Action<coordInt_t>>::nextGenSteps)
      .function("getBounds", &Pathfinder<Action<coordInt_t>>::getBounds) // step generation
      .function("getStep", &Pathfinder<Action<coordInt_t>>::getStep)
      .function("getState", &Pathfinder<Action<coordInt_t>>::getState)
      .function("getNumStates", &Pathfinder<Action<coordInt_t>>::getNumStates)
      ;

    emscripten::class_<Pathfinder<BaseAction<coordInt_t>>>("BasePathfinderInt")
      .constructor()
      .property("stepIndex", &Pathfinder<BaseAction<coordInt_t>>::stepIndex)
      .property("arrowCoords", &Pathfinder<BaseAction<coordInt_t>>::arrowCoords)
      .function("maxStep", &Pathfinder<BaseAction<coordInt_t>>::maxStep)
    
      .function("generateReverseSteps", &Pathfinder<BaseAction<coordInt_t>>::generateReverseSteps)
      .function("nextGenSteps", &Pathfinder<BaseAction<coordInt_t>>::nextGenSteps)
      .function("getBounds", &Pathfinder<BaseAction<coordInt_t>>::getBounds) // step generation
      .function("getStep", &Pathfinder<BaseAction<coordInt_t>>::getStep)
      .function("getState", &Pathfinder<BaseAction<coordInt_t>>::getState)
      .function("getNumStates", &Pathfinder<BaseAction<coordInt_t>>::getNumStates)
      ;
  }
  else if(myType == BindType::double_coord){
    emscripten::class_<Pathfinder<Action<coordDouble_t>>>("PathfinderDouble")
      .constructor()
      .property("stepIndex", &Pathfinder<Action<coordDouble_t>>::stepIndex)
      .property("arrowCoords", &Pathfinder<Action<coordDouble_t>>::arrowCoords)
      .function("maxStep", &Pathfinder<Action<coordDouble_t>>::maxStep)
    
      .function("generateReverseSteps", &Pathfinder<Action<coordDouble_t>>::generateReverseSteps)
      .function("nextGenSteps", &Pathfinder<Action<coordDouble_t>>::nextGenSteps)
      .function("getBounds", &Pathfinder<Action<coordDouble_t>>::getBounds) // step generation
      .function("getStep", &Pathfinder<Action<coordDouble_t>>::getStep)
      .function("getState", &Pathfinder<Action<coordDouble_t>>::getState)
      .function("getNumStates", &Pathfinder<Action<coordDouble_t>>::getNumStates)
      ;

    emscripten::class_<Pathfinder<BaseAction<coordDouble_t>>>("BasePathfinderDouble")
      .constructor()
      .property("stepIndex", &Pathfinder<BaseAction<coordDouble_t>>::stepIndex)
      .property("arrowCoords", &Pathfinder<BaseAction<coordDouble_t>>::arrowCoords)
      .function("maxStep", &Pathfinder<BaseAction<coordDouble_t>>::maxStep)
    
      .function("generateReverseSteps", &Pathfinder<BaseAction<coordDouble_t>>::generateReverseSteps)
      .function("nextGenSteps", &Pathfinder<BaseAction<coordDouble_t>>::nextGenSteps)
      .function("getBounds", &Pathfinder<BaseAction<coordDouble_t>>::getBounds) // step generation
      .function("getStep", &Pathfinder<BaseAction<coordDouble_t>>::getStep)
      .function("getState", &Pathfinder<BaseAction<coordDouble_t>>::getState)
      .function("getNumStates", &Pathfinder<BaseAction<coordDouble_t>>::getNumStates)
      ;
  }
}

void bindGridPathfinder(BindType myType){
  using namespace pathfinder;

  if(myType == BindType::int_coord){
    emscripten::class_<GridPathfinder<Action<coordInt_t>>, emscripten::base<Pathfinder<Action<coordInt_t>>>>("GridPathfinderInt")
      .constructor<>()
      .property("cellMap", &GridPathfinder<Action<coordInt_t>>::cellMap)
      ;

    emscripten::class_<GridPathfinder<BaseAction<coordInt_t>>, emscripten::base<Pathfinder<BaseAction<coordInt_t>>>>("BaseGridPathfinderInt")
      .constructor<>()
      .property("cellMap", &GridPathfinder<BaseAction<coordInt_t>>::cellMap)
      ;
  }
  else if(myType == BindType::double_coord){
    emscripten::class_<GridPathfinder<Action<coordDouble_t>>, emscripten::base<Pathfinder<Action<coordDouble_t>>>>("GridPathfinderDouble")
      .constructor<>()
      .property("cellMap", &GridPathfinder<Action<coordDouble_t>>::cellMap)
      ;

    emscripten::class_<GridPathfinder<BaseAction<coordDouble_t>>, emscripten::base<Pathfinder<BaseAction<coordDouble_t>>>>("BaseGridPathfinderDouble")
      .constructor<>()
      .property("cellMap", &GridPathfinder<BaseAction<coordDouble_t>>::cellMap)
      ;
  }
}

/* END OF INTEGER BINDINGS */

#endif