#include <limits>
#include <algorithm>
#include <cmath>
#include <stdexcept>
#include "pathfinder.hpp"

#ifndef STEP_HPP
#define STEP_HPP

namespace pathfinder
{
  template <typename Action_t>
  bool GridPathFinder<Action_t>::generateReverseSteps(bool genStates, int stateFreq)
  {
    sim.clear();
    this->genStates = genStates;
    this->stateFreq = stateFreq;
    stepCnt = 0;
    std::cout<<"Generating steps in wasm!\n";
    return false;
  }

  template <typename Action_t>
  bool GridPathFinder<Action_t>::nextGenSteps(int givenBatchSize)
  {
    if (givenBatchSize == -1)
      givenBatchSize = batchSize; // use fwd step generation size
    while (givenBatchSize--)
    {
      if (stepCnt >= steps.size()){
        std::cout<<"Finished generating steps in wasm!\n";
        std::cout<<"Number of revActions: "<<revActionCnt<<std::endl;
        std::cout<<"Number of states: "<<states.size()<<std::endl;
        return true;
      }
      // for(int i = 0; i < steps[stepCnt]->fwdActions.size(); ++i){
      // Action fwd = *steps[stepCnt]->fwdActions[i].get();// get the underlying pointer and deference it
      for (auto &fwd : steps[stepCnt]->fwdActions)
      {
        // unpack all the properties
        Command command = (Command)fwd.command;
        Dest dest = (Dest)fwd.dest;
        int x = fwd.nodeCoord.first;
        int y = fwd.nodeCoord.second;
        int colorIndex; if constexpr(std::is_same<Action_t, Action>::value) colorIndex = fwd.colorIndex;
        int arrowIndex; if constexpr(std::is_same<Action_t, Action>::value) arrowIndex = fwd.arrowIndex;
        int pseudoCodeRow; if constexpr(std::is_same<Action_t, Action>::value) pseudoCodeRow = fwd.pseudoCodeRow;
        int infoTableRowIndex; if constexpr(std::is_same<Action_t, Action>::value) infoTableRowIndex = fwd.infoTableRowIndex;
        std::vector<std::string> infoTableRowData; if constexpr(std::is_same<Action_t, Action>::value) infoTableRowData = fwd.infoTableRowData;
        double cellVal = fwd.cellVal;
        int endX; if constexpr(std::is_same<Action_t, Action>::value) endX = fwd.endCoord.first;
        int endY; if constexpr(std::is_same<Action_t, Action>::value) endY = fwd.endCoord.second;
        
        double defaultVal;
        if(dest == CanvasFCost || dest == CanvasGCost || dest == CanvasHCost){
          defaultVal = std::numeric_limits<double>::infinity();
        }
        else{
          defaultVal = 0;
        }
        int xy = x * gridWidth + y;

        if (cellVal != -1)
        { // && myUI.canvases[myUI.planner.destsToId[dest]].valType=="float"
          if (sim.bounds.find(dest) == sim.bounds.end())
          {
            sim.bounds[dest] = {std::numeric_limits<double>::max(), std::numeric_limits<double>::min()};
          }
          std::pair<double, double> cur = sim.bounds[dest];
          cur.first = std::min(cur.first, cellVal);
          cur.second = std::max(cur.second, cellVal);
          sim.bounds[dest] = cur;
        }

        // adds canvas to activeTable if not exists
        if (!coordIsEqual({x, y}, {-1, -1}) || command == EraseCanvas)
        {
          if (sim.activeCanvas.find(dest) == sim.activeCanvas.end())
            sim.activeCanvas[dest] = makeFlatGridf(gridHeight, gridWidth, defaultVal);
        }
        // adds table to activeTable if not exists
        else if (infoTableRowIndex != -1)
        {
          if (sim.activeTable.find(dest) == sim.activeTable.end())
          {
            if (infoTableRowData.size() == 0)
            {
              throw std::invalid_argument("infoTableRowData must have length > 0");
            }
            sim.activeTable[dest] = std::make_unique<InfoTable>(infoTableRowData.size());
          }
        }

        if (command == DrawSinglePixel)
        {
          if (cellVal == -1)
            cellVal = 1;
          // case 1: redraw the previous pixel
          if (sim.singlePixelCanvas.find(dest) != sim.singlePixelCanvas.end())
            steps[stepCnt]->revActions.push_back(packAction(DrawSinglePixel, dest, sim.singlePixelCanvas[dest], -1, -1, -1, -1, {}, 1));
          // case 2: canvas has not been drawn before
          else
            steps[stepCnt]->revActions.push_back(packAction(EraseCanvas, dest));
          // update the canvas with the updated coordinate
          sim.singlePixelCanvas[dest] = {x, y};
// erase canvas and draw the pixel
          sim.activeCanvas[dest] = makeFlatGridf(gridHeight, gridWidth, defaultVal);
          sim.activeCanvas[dest][xy] = cellVal;
        }
        else if (command == SetPixel)
        {
          // reverse
          steps[stepCnt]->revActions.push_back(packAction(SetPixel, dest, {x, y}, -1, -1, -1, -1, {}, sim.activeCanvas[dest][xy]));
          // update
          sim.activeCanvas[dest][xy] = cellVal;
        }
        else if (command == DrawPixel)
        {
          if (cellVal == -1)
            cellVal = 1;
            // reverse
          if (sim.activeCanvas[dest][xy] == defaultVal)
            steps[stepCnt]->revActions.push_back(packAction(ErasePixel, dest, {x, y}));
            // update
          sim.activeCanvas[dest][xy] = cellVal;
        }
        else if (command == ErasePixel)
        {
// reverse
          steps[stepCnt]->revActions.push_back(packAction(DrawPixel, dest, {x, y}, -1, -1, -1, -1, {}, sim.activeCanvas[dest][xy]));
          sim.activeCanvas[dest][xy] = defaultVal;
        }
        else if (command == EraseCanvas)
        {
          for(int i = 0; i < sim.activeCanvas[dest].size(); ++i){
            if(sim.activeCanvas[dest][i] == defaultVal) continue;
            int x = i / gridWidth;
            int y = i - (x * gridWidth);
            steps[stepCnt]->revActions.push_back(packAction(SetPixel, dest, {x, y}, -1, -1, -1, -1, {}, sim.activeCanvas[dest][i]));
          }
          sim.activeCanvas[dest] = makeFlatGridf(gridHeight, gridWidth, defaultVal);
        }
        else if (command == IncrementPixel)
        {
          steps[stepCnt]->revActions.push_back(packAction(DecrementPixel, dest, {x, y}));
          sim.activeCanvas[dest][xy]++;
        }
        else if (command == DecrementPixel)
        {
          steps[stepCnt]->revActions.push_back(packAction(IncrementPixel, dest, {x, y}));
          sim.activeCanvas[dest][xy]--;
        }
        else if (command == DrawArrow)
        {
          if (sim.arrowColor.find(arrowIndex) == sim.arrowColor.end())
          {
            steps[stepCnt]->revActions.push_back(packAction(EraseArrow, -1, {-1, -1}, -1, arrowIndex));
          }
          else
          {
            steps[stepCnt]->revActions.push_back(packAction(DrawArrow, -1, {-1, -1}, sim.arrowColor[arrowIndex], arrowIndex));
          }
          if (colorIndex == -1)
            colorIndex = 0;
          sim.arrowColor[arrowIndex] = colorIndex;
        }
        else if (command == EraseArrow)
        {
          steps[stepCnt]->revActions.push_back(packAction(DrawArrow, -1, {-1, -1}, sim.arrowColor[arrowIndex], arrowIndex));
          sim.arrowColor.erase(arrowIndex);
        }
        else if (command == InsertRowAtIndex)
        {
          int prevHighlight = sim.activeTable[dest]->insertRowAtIndex(infoTableRowIndex, infoTableRowData);
          if (prevHighlight != -1)
          {
            steps[stepCnt]->revActions.push_back(packAction(SetHighlightAtIndex, dest, {-1, -1}, -1, -1, -1, prevHighlight));
          }
          steps[stepCnt]->revActions.push_back(packAction(EraseRowAtIndex, dest, {-1, -1}, -1, -1, -1, infoTableRowIndex));
        }
        else if (command == EraseRowAtIndex)
        {
          std::vector<std::string> data = sim.activeTable[dest]->eraseRowAtIndex(infoTableRowIndex);

          int prevHighlight = stoi(data.back());
          data.pop_back();

          bool toHighlight = prevHighlight == infoTableRowIndex;

          if (!toHighlight)
            infoTableRowIndex *= -1;
          steps[stepCnt]->revActions.push_back(packAction(InsertRowAtIndex, dest, {-1, -1}, -1, -1, -1, infoTableRowIndex, data));
        }
        else if (command == EraseAllRows)
        {
          while (!sim.activeTable[dest]->empty())
          {
            infoTableRowIndex = 1;
            std::vector<std::string> data = sim.activeTable[dest]->eraseRowAtIndex(infoTableRowIndex);

            int prevHighlight = stoi(data.back());
            data.pop_back();

            bool toHighlight = prevHighlight == infoTableRowIndex;

            if (!toHighlight)
              infoTableRowIndex *= -1;
            steps[stepCnt]->revActions.push_back(packAction(InsertRowAtIndex, dest, {-1, -1}, -1, -1, -1, infoTableRowIndex, data));
          }
        }
        else if (command == UpdateRowAtIndex)
        {
          std::vector<std::string> data = sim.activeTable[dest]->updateRowAtIndex(infoTableRowIndex, infoTableRowData);
          int prevHighlight = stoi(data.back());
          data.pop_back();

          if (prevHighlight != -1)
          {
            steps[stepCnt]->revActions.push_back(packAction(SetHighlightAtIndex, dest, {-1, -1}, -1, -1, -1, prevHighlight));
          }
          steps[stepCnt]->revActions.push_back(packAction(UpdateRowAtIndex, dest, {-1, -1}, -1, -1, -1, infoTableRowIndex, data));
        }
        else if (command == HighlightPseudoCodeRowPri)
        {
          steps[stepCnt]->revActions.push_back(packAction(HighlightPseudoCodeRowPri, Pseudocode, {-1, -1}, -1, -1, sim.pseudoCodeRowPri));
          sim.pseudoCodeRowPri = pseudoCodeRow;
        }
        else if (command == DrawVertex)
        {
          steps[stepCnt]->revActions.push_back(packAction(EraseVertex, dest, {x, y}));
          sim.vertices[dest].insert({x, y});
        }
        else if (command == EraseVertex)
        {
          steps[stepCnt]->revActions.push_back(packAction(DrawVertex, dest, {x, y}));
          sim.vertices[dest].erase({x, y});
        }
        else if (command == EraseAllVertex)
        {
          for (auto &vert : sim.vertices[dest])
          {
            steps[stepCnt]->revActions.push_back(packAction(DrawVertex, dest, vert));
          }
          sim.vertices[dest].clear();
        }
        else if (command == DrawSingleVertex)
        {
          for (auto &vert : sim.vertices[dest])
          {
            steps[stepCnt]->revActions.push_back(packAction(DrawVertex, dest, vert));
          }
          steps[stepCnt]->revActions.push_back(packAction(EraseVertex, dest, {x, y}));
          sim.vertices[dest].clear();
          sim.vertices[dest].insert({x, y});
        }
        else if (command == DrawEdge)
        {
          steps[stepCnt]->revActions.push_back(packAction(EraseEdge, dest, {x, y}, -1, -1, -1, -1, {}, -1, {endX, endY}));
          sim.edges[dest].insert({x, y, endX, endY});
        }
        else if (command == EraseEdge)
        {
          steps[stepCnt]->revActions.push_back(packAction(DrawEdge, dest, {x, y}, -1, -1, -1, -1, {}, -1, {endX, endY}));
          auto it = sim.edges[dest].find({x, y, endX, endY});
          if (it != sim.edges[dest].end())
            sim.edges[dest].erase(it);
          it = sim.edges[dest].find({endX, endY, x, y});
          if (it != sim.edges[dest].end())
            sim.edges[dest].erase(it);
        }
        else if (command == EraseAllEdge)
        {
          for (auto &e : sim.edges[dest])
          {
            steps[stepCnt]->revActions.push_back(packAction(DrawEdge, dest, {e[0], e[1]}, -1, -1, -1, -1, {}, -1, {e[2], e[3]}));
          }
          sim.edges[dest].clear();
        }
      }
      
      revActionCnt += steps[stepCnt++]->revActions.size();
      if(!genStates){
        if (stepCnt % stateFreq == 0 && stepCnt / stateFreq == 100){
          std::cout << "State 100" << std::endl;
          std::cout << "CURRENT RSS at state 100: "<<getCurrentRSS() <<std::endl;
        }
        if(stepCnt % 1000000 == 0) std::cout << "Step " << stepCnt << std::endl;
        continue;
      }
      if (stepCnt % stateFreq == 0)
      {
        int stateNum = stepCnt / stateFreq;
        if (stateNum % 100 == 0){
          
          std::cout << "State " << stateNum << std::endl;
          std::cout << "CURRENT RSS at state "<<stateNum<<": "<<getCurrentRSS() <<std::endl;

        }
        std::unique_ptr<State> nextState = std::make_unique<State>();

        // canvas
        for (const auto &p : sim.activeCanvas)
        {
          #ifdef CANVAS_COMPRESSED
            const double NotANumber = std::nan("0");
            double defaultVal;
            if(p.first == CanvasFCost || p.first == CanvasGCost || p.first == CanvasHCost){
              defaultVal = std::numeric_limits<double>::infinity();
            }
            else{
              defaultVal = 0;
            }
            for(int i = 0; i < p.second.size(); ++i){
              if(p.second[i] == defaultVal){
                if(nextState->canvases[p.first].size() > 0 && !std::isnan(nextState->canvases[p.first].back())){
                  nextState->canvases[p.first].push_back(NotANumber);
                }
              }
              else{
                if(nextState->canvases[p.first].size() == 0 || std::isnan(nextState->canvases[p.first].back())){
                  nextState->canvases[p.first].push_back(i);
                }
                nextState->canvases[p.first].push_back(p.second[i]);
              }
            }
          #else
            nextState->canvases[p.first] = p.second;
          #endif
        }

        // arrow
        // this copies the unodered_map<int, uint8_t> src: https://www.geeksforgeeks.org/unordered_map-operator-in-c-stl-2/
        nextState->arrowColor = sim.arrowColor;

        
        // infotables
        for (auto &p : sim.activeTable)
        {
          p.second->getCurrentState(nextState->infotables[p.first]);
        }

        nextState->pseudoCodeRowPri = sim.pseudoCodeRowPri;
        nextState->pseudoCodeRowSec = sim.pseudoCodeRowSec;
        
        for (const auto &p : sim.vertices)
        {
          const Dest &d = p.first;
          for (const auto &v : p.second)
          {
            nextState->vertices[d].push_back(v);
          }
        }

        for (const auto &p : sim.edges)
        {
          Dest d = p.first;
          for (const auto &e : p.second)
          {
            nextState->edges[d].push_back(e);
          }
        }

        states.push_back(std::move(nextState));
      }
    }
    return false;
  }

  template <typename Action_t>
  Step<Action_t> GridPathFinder<Action_t>::getStep(int stepNo)
  {
    return Step(*steps[stepNo].get());
  }

  template <typename Action_t>
  State GridPathFinder<Action_t>::getState(int stepNo)
  {
    int stateNo = (stepNo + 1) / stateFreq;
    std::cout<<"Getting state "<<stateNo<<" from wasm!\n";
    if (stepNo < stateFreq){
      std::cout<<0<<std::endl;
      return State{false};
    }
    State s = *states[stateNo - 1].get();
    return s;
  }
}

#endif