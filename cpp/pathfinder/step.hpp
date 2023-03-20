#include <limits>
#include <algorithm>
#include "pathfinder.hpp"

#ifndef STEP_HPP
#define STEP_HPP

namespace pathfinder{
  void GridPathFinder::generateReverseSteps(bool genStates, int stateFreq = -1){
    sim.clear();
    this->genStates = genStates;
    this->stateFreq = stateFreq;
    stepCnt = 0;
  }
  
  std::unordered_map<Dest, std::pair<double, double>> GridPathFinder::getBounds(){
    return sim.bounds;
  }

  bool GridPathFinder::nextGenSteps(int givenBatchSize = -1){
    if(givenBatchSize == -1) givenBatchSize = batchSize; // use fwd step generation size
    while(givenBatchSize--){
      if(stepCnt == steps.size()) return true;
      for(int i = 0; i < steps[stepCnt]->fwdActions.size(); ++i){
        const Action fwd = *steps[stepCnt]->fwdActions[i].get(); // get the underlying pointer and deference it
        std::unique_ptr<Action> rev = std::make_unique<Action>();
        if(fwd.cellVal != -1){  // && myUI.canvases[statics_to_obj[dest]].valType=="float"
          if(sim.bounds.find(fwd.dest) == sim.bounds.end()){
            sim.bounds[fwd.dest] = {std::numeric_limits<double>::max(), std::numeric_limits<double>::min()};
          }
          std::pair<double, double> cur = sim.bounds[fwd.dest];
          cur.first = std::min(cur.first, fwd.cellVal);
          cur.second = std::min(cur.second, fwd.cellVal);
          sim.bounds[fwd.dest] = cur;
        }

        if(coordIsEqual(fwd.nodeCoord, {-1, -1}) || fwd.command == EraseCanvas){
          if(sim.activeCanvas.find(fwd.dest) == sim.activeCanvas.end())
            sim.activeCanvas[fwd.dest] = makeGrid(gridHeight, gridWidth);
        }
      }
    }
  }
}

#endif