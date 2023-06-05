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
  bool Pathfinder<Action_t>::generateReverseSteps(bool genStates, int stateFreq)
  {
    sim.clear();
    this->genStates = genStates;
    this->stateFreq = stateFreq;
    stepCnt = 0;
    std::cout<<"Generating steps in wasm!\n";
    return false;
  }

  template <typename Action_t>
  bool Pathfinder<Action_t>::nextGenSteps(int givenBatchSize)
  {
    // using Coord_t = typename Action_t::CoordType;
    if (givenBatchSize == -1)
      givenBatchSize = batchSize; // use fwd step generation size
    const int CANVAS_WIDTH = (vertexEnabled ? gridWidth + 1 : gridWidth);
    const int CANVAS_DATA_SIZE = (vertexEnabled ? gridHeight + 1 : gridHeight) * CANVAS_WIDTH;
    // std::cout << "NEXT GEN STEPS\n";
    while (givenBatchSize--)
    {
      if (stepCnt >= steps.size()){
        std::cout<<"Finished generating steps in wasm!\n";
        std::cout<<"Number of revActions: "<<revActionCnt<<std::endl;
        std::cout<<"Number of states: "<<states.size()<<std::endl;
        return true;
      }
      for (auto &fwd : steps[stepCnt]->fwdActions)
      {
        // unpack all the properties
        Command command = (Command)fwd.command;
        int dest = fwd.dest;
        int x = fwd.nodeCoord.first;
        int y = fwd.nodeCoord.second;
        int colorIndex = -1; if constexpr(std::is_same<Action_t, Action<Coord_t>>::value) colorIndex = fwd.colorIndex;
        int arrowIndex = /* -1; if constexpr(std::is_same<Action_t, Action<Coord_t>>::value) arrowIndex =  */fwd.arrowIndex;
        int pseudoCodeRow = -1; if constexpr(std::is_same<Action_t, Action<Coord_t>>::value) pseudoCodeRow = fwd.pseudoCodeRow;
        int infoTableRowIndex = -1; if constexpr(std::is_same<Action_t, Action<Coord_t>>::value) infoTableRowIndex = fwd.infoTableRowIndex;
        std::vector<std::string> infoTableRowData; if constexpr(std::is_same<Action_t, Action<Coord_t>>::value) infoTableRowData = fwd.infoTableRowData;
        double anyVal = fwd.anyVal;
        int endX = -1; if constexpr(std::is_same<Action_t, Action<Coord_t>>::value) endX = fwd.endCoord.first;
        int endY = -1; if constexpr(std::is_same<Action_t, Action<Coord_t>>::value) endY = fwd.endCoord.second;

        // std::cout << command << std::endl;
        
        // std::cout << "UNPACKED ACTION\n";
        double defaultVal = getDestDefaultVal(dest);
        
        // if((dests.find("fCost") != dests.end() && dest == dests["fCost"])
        //  || (dests.find("gCost") != dests.end() && dest == dests["gCost"])
        //  || (dests.find("hCost") != dests.end() && dest == dests["hCost"])){
        //   defaultVal = std::numeric_limits<double>::infinity();
        // }
        // else{
        //   defaultVal = 0;
        // }
        int xy = x * CANVAS_WIDTH + y;

        // std::cout << "PASSED DEFAULTVAL\n";

        if (anyVal != -1)
        {
          if (sim.bounds.find(dest) == sim.bounds.end())
          {
            sim.bounds[dest] = {std::numeric_limits<double>::max(), std::numeric_limits<double>::min()};
          }
          sim.bounds[dest].first = std::min(sim.bounds[dest].first, anyVal);
          sim.bounds[dest].second = std::max(sim.bounds[dest].second, anyVal);
        }
        // std::cout << "PASSED BOUNDS\n";

        // adds canvas to activeTable if not exists
        if ((x != -1 && y != -1) || command == EraseCanvas)
        {
          if (sim.activeCanvas.find(dest) == sim.activeCanvas.end())
            sim.activeCanvas[dest] = rowf_t(CANVAS_DATA_SIZE, defaultVal);
        }
        // std::cout << "PASSED ERASECANVAS\n";

        // adds table to activeTable if not exists
        if (infoTableRowIndex != 0 && command == InsertRowAtIndex)
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

        // std::cout << "INIT PREREQS\n";

        if (command == DrawSinglePixel)
        {
          if (anyVal == -1)
            anyVal = 1;
          // case 1: redraw the previous pixel
          if (sim.singlePixelCanvas.find(dest) != sim.singlePixelCanvas.end())
            steps[stepCnt]->revActions.push_back(packAction(DrawSinglePixel, dest, sim.singlePixelCanvas[dest], -1, -1, -1, -1, {}, 1));
          // case 2: canvas has not been drawn before
          else
            steps[stepCnt]->revActions.push_back(packAction(EraseCanvas, dest));
          // update the canvas with the updated coordinate
          sim.singlePixelCanvas[dest] = {x, y};
// erase canvas and draw the pixel
          sim.activeCanvas[dest] = rowf_t(CANVAS_DATA_SIZE, defaultVal);
          sim.activeCanvas[dest][xy] = anyVal;
        }
        else if (command == SetPixel)
        {
          // reverse
          steps[stepCnt]->revActions.push_back(packAction(SetPixel, dest, {x, y}, -1, -1, -1, -1, {}, sim.activeCanvas[dest][xy]));
          // update
          sim.activeCanvas[dest][xy] = anyVal;
        }
        else if (command == DrawPixel)
        {
          if (anyVal == -1)
            anyVal = 1;
            // reverse
          if (sim.activeCanvas[dest][xy] == defaultVal)
            steps[stepCnt]->revActions.push_back(packAction(ErasePixel, dest, {x, y}));
            // update
          sim.activeCanvas[dest][xy] = anyVal;
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
          sim.activeCanvas[dest] = rowf_t(CANVAS_DATA_SIZE, defaultVal);
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
          // std::cout << command << ' ' << infoTableRowIndex << ' ';
          //for(auto s : infoTableRowData) std::cout << s << ' ';
          // std::cout << std::endl;
          int prevHighlight = sim.activeTable[dest]->insertRowAtIndex(infoTableRowIndex, infoTableRowData);
          // std::cout << "INSERTED INTO INFOTABLE\n";
          if (prevHighlight != -1)
          {
            steps[stepCnt]->revActions.push_back(packAction(SetHighlightAtIndex, dest, {-1, -1}, -1, -1, -1, prevHighlight));
          }
          // std::cout << "PACKED REVERSE HIGHLIGHT (IF ANY)\n";
          steps[stepCnt]->revActions.push_back(packAction(EraseRowAtIndex, dest, {-1, -1}, -1, -1, -1, infoTableRowIndex));
          // std::cout << "PACKED REVERSE ERASE\n";
        }
        else if (command == EraseRowAtIndex)
        {
          if(sim.activeTable.find(dest) == sim.activeTable.end()) continue;
          std::vector<std::string> data = sim.activeTable[dest]->eraseRowAtIndex(infoTableRowIndex);

          int toHighlight = stoi(data.back());
          data.pop_back();

          if (!toHighlight)
            infoTableRowIndex *= -1;
          steps[stepCnt]->revActions.push_back(packAction(InsertRowAtIndex, dest, {-1, -1}, -1, -1, -1, infoTableRowIndex, data));
        }
        else if (command == EraseAllRows)
        {
          if(sim.activeTable.find(dest) == sim.activeTable.end()) continue;
          while (!sim.activeTable[dest]->empty())
          {
            infoTableRowIndex = 1;
            std::vector<std::string> data = sim.activeTable[dest]->eraseRowAtIndex(infoTableRowIndex);
            // std::cout << "ERASED ROW\n";

            int toHighlight = stoi(data.back());
            data.pop_back();

            if (!toHighlight)
              infoTableRowIndex *= -1;
            steps[stepCnt]->revActions.push_back(packAction(InsertRowAtIndex, dest, {-1, -1}, -1, -1, -1, infoTableRowIndex, data));

            // std::cout << "PACKED REV ACTION\n";
          }
        }
        else if (command == UpdateRowAtIndex)
        {
          if(sim.activeTable.find(dest) == sim.activeTable.end()){
            std::cout << "ERR: Called update on infotable without inserting\n";
            continue;
          }
          std::vector<std::string> data = sim.activeTable[dest]->updateRowAtIndex(infoTableRowIndex, infoTableRowData);

          int prevHighlight = stoi(data.back());
          data.pop_back();

          if (prevHighlight != -1)
          {
            steps[stepCnt]->revActions.push_back(packAction(SetHighlightAtIndex, dest, {-1, -1}, -1, -1, -1, prevHighlight));
          }

          infoTableRowIndex = infoTableRowIndex > 0 ? infoTableRowIndex * -1 : infoTableRowIndex;
          steps[stepCnt]->revActions.push_back(packAction(UpdateRowAtIndex, dest, {-1, -1}, -1, -1, -1, infoTableRowIndex, data));
        }
        else if (command == HighlightPseudoCodeRowPri)
        {
          steps[stepCnt]->revActions.push_back(packAction(HighlightPseudoCodeRowPri, dest, {-1, -1}, -1, -1, sim.pseudoCodeRowPri));
          sim.pseudoCodeRowPri = pseudoCodeRow;
        }
        else if (command == DrawVertex)
        {
          steps[stepCnt]->revActions.push_back(packAction(EraseVertex, dest, {-1, -1}, -1, arrowIndex));
          sim.vertices[dest].insert(arrowIndex);
        }
        else if (command == EraseVertex)
        {
          steps[stepCnt]->revActions.push_back(packAction(DrawVertex, dest, {-1, -1}, -1, arrowIndex));
          sim.vertices[dest].erase(arrowIndex);
        }
        else if (command == EraseAllVertex)
        {
          for (auto &vert : sim.vertices[dest])
          {
            steps[stepCnt]->revActions.push_back(packAction(DrawVertex, dest, {-1, -1}, -1, vert));
          }
          sim.vertices[dest].clear();
        }
        else if (command == DrawSingleVertex)
        {
          for (auto &vert : sim.vertices[dest])
          {
            steps[stepCnt]->revActions.push_back(packAction(DrawVertex, dest, {-1, -1}, -1, vert));
          }
          steps[stepCnt]->revActions.push_back(packAction(EraseVertex, dest, {-1, -1}, -1, arrowIndex));
          sim.vertices[dest].clear();
          sim.vertices[dest].insert(arrowIndex);
        }
        else if (command == DrawEdge)
        {
          steps[stepCnt]->revActions.push_back(packAction(EraseEdge, dest, {-1, -1}, -1, arrowIndex));
          sim.edges[dest].insert(arrowIndex);
        }
        else if (command == EraseEdge)
        {
          steps[stepCnt]->revActions.push_back(packAction(DrawEdge, dest, {-1, -1}, -1, arrowIndex));
          sim.edges[dest].erase(arrowIndex);
        }
        else if (command == EraseAllEdge)
        {
          for (auto &eIndex : sim.edges[dest])
          {
            steps[stepCnt]->revActions.push_back(packAction(DrawEdge, dest, {-1, -1}, -1, eIndex));
          }
          sim.edges[dest].clear();
        }
      }
      // std::cout << "DONE W ACTION\n";
      
      revActionCnt += steps[stepCnt++]->revActions.size();
      if(!genStates){
        if (stepCnt % stateFreq == 0 && stepCnt / stateFreq == 100){
          std::cout << "State 100" << std::endl;
          #ifdef PURE_CPP
          std::cout << "CURRENT RSS at state 100: "<<getCurrentRSS() <<std::endl;
          #endif
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
        std::unique_ptr<State<Coord_t>> nextState = std::make_unique<State<Coord_t>>();

        // canvas
        for (const auto &p : sim.activeCanvas)
        {
          #ifdef CANVAS_COMPRESSED
            const double NotANumber = std::nan("0");
            double defaultVal = getDestDefaultVal(p.first);
            // if((dests.find("fCost") != dests.end() && p.first == dests["fCost"])
            // || (dests.find("gCost") != dests.end() && p.first == dests["gCost"])
            // || (dests.find("hCost") != dests.end() && p.first == dests["hCost"])){
            //   defaultVal = std::numeric_limits<double>::infinity();
            // }
            // else{
            //   defaultVal = 0;
            // }
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
          const int &d = p.first;  // Dest
          for (const auto &v : p.second)
          {
            nextState->vertices[d].push_back(v);
          }
        }

        for (const auto &p : sim.edges)
        {
          int d = p.first;
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
}

#endif