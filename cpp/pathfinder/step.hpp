#include <limits>
#include <algorithm>
#include <stdexcept>
#include "pathfinder.hpp"

#ifndef STEP_HPP
#define STEP_HPP
#ifdef STEP_STRUCT_METHOD

namespace pathfinder
{
  bool GridPathFinder::generateReverseSteps(bool genStates, int stateFreq)
  {
    sim.clear();
    this->genStates = genStates;
    this->stateFreq = stateFreq;
    stepCnt = 0;
    std::cout<<"Generating steps in wasm!\n";
    return false;
  }

  bool GridPathFinder::nextGenSteps(int givenBatchSize = -1)
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
        int colorIndex = fwd.colorIndex;
        int arrowIndex = fwd.arrowIndex;
        int pseudoCodeRow = fwd.pseudoCodeRow;
        int infoTableRowIndex = fwd.infoTableRowIndex;
        std::vector<std::string> infoTableRowData = fwd.infoTableRowData;
        double cellVal = fwd.cellVal;
        int endX = fwd.endCoord.first;
        int endY = fwd.endCoord.second;
        
        #ifdef CANVAS_GRID
        const int defaultVal = 0; // change this in the future, tag this to the dest
        #endif

        if (cellVal != -1)
        { // && myUI.canvases[statics_to_obj[dest]].valType=="float"
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
#ifdef CANVAS_GRID
            sim.activeCanvas[dest] = makeGridf(gridHeight, gridWidth);
#else
            sim.activeCanvas[dest] = state_canvas_t();
#endif
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
            steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(DrawSinglePixel, dest, sim.singlePixelCanvas[dest], -1, -1, -1, -1, {}, 1));
          // case 2: canvas has not been drawn before
          else
            steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(EraseCanvas, dest));
          // update the canvas with the updated coordinate
          sim.singlePixelCanvas[dest] = {x, y};
// erase canvas and draw the pixel
#ifdef CANVAS_GRID
          sim.activeCanvas[dest] = makeGridf(gridHeight, gridWidth);
          sim.activeCanvas[dest][x][y] = cellVal;
#else
          sim.activeCanvas[dest].clear();
          #ifdef BIT_SHIFT_COORD
          sim.activeCanvas[dest][coord2uint32(x, y)] = cellVal;
          #else
          sim.activeCanvas[dest][{x, y}] = cellVal;
          #endif
#endif
        }
        else if (command == SetPixel)
        {

#ifdef CANVAS_GRID
          // reverse
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(SetPixel, dest, {x, y}, -1, -1, -1, -1, {}, sim.activeCanvas[dest][x][y]));
          // update
          sim.activeCanvas[dest][x][y] = cellVal;
#else
          #ifdef BIT_SHIFT_COORD
          // reverse
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(SetPixel, dest, {x, y}, -1, -1, -1, -1, {}, sim.activeCanvas[dest][coord2uint32(x, y)]));
          // update
          sim.activeCanvas[dest][coord2uint32(x, y)] = cellVal;
          #else
          // reverse
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(SetPixel, dest, {x, y}, -1, -1, -1, -1, {}, sim.activeCanvas[dest][{x, y}]));
          // update
          sim.activeCanvas[dest][{x, y}] = cellVal;
          #endif
#endif
        }
        else if (command == DrawPixel)
        {
          if (cellVal == -1)
            cellVal = 1;
            // reverse
#ifdef CANVAS_GRID
          if (sim.activeCanvas[dest][x][y] == defaultVal)
#else
          #ifdef BIT_SHIFT_COORD
          if (sim.activeCanvas[dest].find(coord2uint32(x, y)) == sim.activeCanvas[dest].end())
          #else
          if (sim.activeCanvas[dest].find({x, y}) == sim.activeCanvas[dest].end())
          #endif
#endif
            steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(ErasePixel, dest, {x, y}));
            // update
#ifdef CANVAS_GRID
          sim.activeCanvas[dest][x][y] = cellVal;
#else
          #ifdef BIT_SHIFT_COORD
          sim.activeCanvas[dest][coord2uint32(x, y)] = cellVal;
          #else
          sim.activeCanvas[dest][{x, y}] = cellVal;
          #endif
#endif
        }
        else if (command == ErasePixel)
        {
// reverse
#ifdef CANVAS_GRID
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(DrawPixel, dest, {x, y}, -1, -1, -1, -1, {}, sim.activeCanvas[dest][x][y]));
          sim.activeCanvas[dest][x][y] = defaultVal;
#else
          #ifdef BIT_SHIFT_COORD
          uint32_t conv = coord2uint32(x, y);
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(DrawPixel, dest, {x, y}, -1, -1, -1, -1, {}, sim.activeCanvas[dest][conv]));
          sim.activeCanvas[dest].erase(conv);
          #else
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(DrawPixel, dest, {x, y}, -1, -1, -1, -1, {}, sim.activeCanvas[dest][{x, y}]));
          sim.activeCanvas[dest].erase({x, y});
          #endif
#endif
        }
        else if (command == EraseCanvas)
        {
#ifdef CANVAS_GRID
          const int h = sim.activeCanvas[dest].size();
          const int w = sim.activeCanvas[dest][0].size();
          for (int i = 0; i < h; ++i)
          {
            for (int j = 0; j < w; ++j)
            {
              if (sim.activeCanvas[dest][i][j] != defaultVal)
              {
                steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(SetPixel, dest, {i, j}, -1, -1, -1, -1, {}, sim.activeCanvas[dest][i][j]));
              }
            }
          }
          sim.activeCanvas[dest] = makeGridf(h, w);
#else
          for (auto it : sim.activeCanvas[dest])
          {
            #ifdef BIT_SHIFT_COORD
            steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(SetPixel, dest, uint322coord(it.first), -1, -1, -1, -1, {}, it.second));
            #else
            steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(SetPixel, dest, it.first, -1, -1, -1, -1, {}, it.second));
            #endif
          }
          sim.activeCanvas[dest].clear();
#endif
        }
        else if (command == IncrementPixel)
        {
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(DecrementPixel, dest, {x, y}));
#ifdef CANVAS_GRID
          sim.activeCanvas[dest][x][y]++;
#else
          #ifdef BIT_SHIFT_COORD
          sim.activeCanvas[dest][coord2uint32(x, y)]++;
          #else
          sim.activeCanvas[dest][{x, y}]++;
          #endif
#endif
        }
        else if (command == DecrementPixel)
        {
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(IncrementPixel, dest, {x, y}));
#ifdef CANVAS_GRID
          sim.activeCanvas[dest][x][y]--;
#else
          #ifdef BIT_SHIFT_COORD
          sim.activeCanvas[dest][coord2uint32(x, y)]--;
          #else
          sim.activeCanvas[dest][{x, y}]--;
          #endif
#endif
        }
        else if (command == DrawArrow)
        {
          if (sim.arrowColor.find(arrowIndex) == sim.arrowColor.end())
          {
            steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(EraseArrow, -1, {-1, -1}, -1, arrowIndex));
          }
          else
          {
            steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(DrawArrow, -1, {-1, -1}, sim.arrowColor[arrowIndex], arrowIndex));
          }
          if (colorIndex == -1)
            colorIndex = 0;
          sim.arrowColor[arrowIndex] = colorIndex;
        }
        else if (command == EraseArrow)
        {
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(DrawArrow, -1, {-1, -1}, sim.arrowColor[arrowIndex], arrowIndex));
          sim.arrowColor.erase(arrowIndex);
        }
        else if (command == InsertRowAtIndex)
        {
          int prevHighlight = sim.activeTable[dest]->insertRowAtIndex(infoTableRowIndex, infoTableRowData);
          if (prevHighlight != -1)
          {
            steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(SetHighlightAtIndex, dest, {-1, -1}, -1, -1, -1, prevHighlight));
          }
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(EraseRowAtIndex, dest, {-1, -1}, -1, -1, -1, infoTableRowIndex));
        }
        else if (command == EraseRowAtIndex)
        {
          std::vector<std::string> data = sim.activeTable[dest]->eraseRowAtIndex(infoTableRowIndex);

          int prevHighlight = stoi(data.back());
          data.pop_back();

          bool toHighlight = prevHighlight == infoTableRowIndex;

          if (!toHighlight)
            infoTableRowIndex *= -1;
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(InsertRowAtIndex, dest, {-1, -1}, -1, -1, -1, infoTableRowIndex, data));
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
            steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(InsertRowAtIndex, dest, {-1, -1}, -1, -1, -1, infoTableRowIndex, data));
          }
        }
        else if (command == UpdateRowAtIndex)
        {
          std::vector<std::string> data = sim.activeTable[dest]->updateRowAtIndex(infoTableRowIndex, infoTableRowData);
          int prevHighlight = stoi(data.back());
          data.pop_back();

          if (prevHighlight != -1)
          {
            steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(SetHighlightAtIndex, dest, {-1, -1}, -1, -1, -1, prevHighlight));
          }
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(UpdateRowAtIndex, dest, {-1, -1}, -1, -1, -1, infoTableRowIndex, data));
        }
        else if (command == HighlightPseudoCodeRowPri)
        {
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(HighlightPseudoCodeRowPri, Pseudocode, {-1, -1}, -1, -1, sim.pseudoCodeRowPri));
          sim.pseudoCodeRowPri = pseudoCodeRow;
        }
        else if (command == DrawVertex)
        {
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(EraseVertex, dest, {x, y}));
          sim.vertices[dest].insert({x, y});
        }
        else if (command == EraseVertex)
        {
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(DrawVertex, dest, {x, y}));
          sim.vertices[dest].erase({x, y});
        }
        else if (command == EraseAllVertex)
        {
          for (auto &vert : sim.vertices[dest])
          {
            steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(DrawVertex, dest, vert));
          }
          sim.vertices[dest].clear();
        }
        else if (command == DrawSingleVertex)
        {
          for (auto &vert : sim.vertices[dest])
          {
            steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(DrawVertex, dest, vert));
          }
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(EraseVertex, dest, {x, y}));
          sim.vertices[dest].clear();
          sim.vertices[dest].insert({x, y});
        }
        else if (command == DrawEdge)
        {
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(EraseEdge, dest, {x, y}, -1, -1, -1, -1, {}, -1, {endX, endY}));
          sim.edges[dest].insert({x, y, endX, endY});
        }
        else if (command == EraseEdge)
        {
          steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(DrawEdge, dest, {x, y}, -1, -1, -1, -1, {}, -1, {endX, endY}));
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
            steps[stepCnt]->revActions.push_back(GridPathFinder::packAction(DrawEdge, dest, {e[0], e[1]}, -1, -1, -1, -1, {}, -1, {e[2], e[3]}));
          }
          sim.edges[dest].clear();
        }
      }
      
      revActionCnt += steps[stepCnt++]->revActions.size();
      if(!genStates){
        if(stepCnt % 100000 == 0) std::cout << "Step " << stepCnt << std::endl;
        continue;
      }
      if (stepCnt % stateFreq == 0)
      {
        int stateNum = stepCnt / stateFreq;
        if (stateNum % 100 == 0)
          std::cout << "State " << stateNum << std::endl;
        std::unique_ptr<State> nextState = std::make_unique<State>();

        // canvas
        #ifdef VECTOR_METHOD
        int mx = 0;
        for (const auto &p : sim.activeCanvas)
          mx = std::max(mx, (int)p.first);
        nextState->canvases.resize(mx + 1);
        #endif
        for (const auto &p : sim.activeCanvas)
        {
          nextState->canvases[p.first] = p.second;
        }

        // arrow
        // this copies the unodered_map<int, uint8_t> src: https://www.geeksforgeeks.org/unordered_map-operator-in-c-stl-2/
        nextState->arrowColor = sim.arrowColor;

        
        // infotables
        #ifdef VECTOR_METHOD
        mx = 0;
        for (const auto &p : sim.activeTable)
           mx = std::max(mx, (int)p.first);
        nextState->infotables.resize(mx + 1);
        #endif
        for (auto &p : sim.activeTable)
        {
          p.second->getCurrentState(nextState->infotables[p.first]);
        }

        nextState->pseudoCodeRowPri = sim.pseudoCodeRowPri;
        nextState->pseudoCodeRowSec = sim.pseudoCodeRowSec;
        
        #ifdef VECTOR_METHOD
        mx = 0;
        for (const auto &p : sim.vertices)
          mx = std::max(mx, (int)p.first);
        nextState->vertices.resize(mx + 1);
        #endif
        for (const auto &p : sim.vertices)
        {
          const Dest &d = p.first;
          for (const auto &v : p.second)
          {
            nextState->vertices[d].push_back(v);
          }
        }

        #ifdef VECTOR_METHOD
        mx = 0;
        for (const auto &p : sim.edges)
          mx = std::max(mx, (int)p.first);
        nextState->edges.resize(mx + 1);
        #endif
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

  Step GridPathFinder::getStep(int stepNo)
  {
    return Step(*steps[stepNo].get());
  }

  State GridPathFinder::getState(int stepNo)
  {
    int stateNo = (stepNo + 1) / stateFreq;
    std::cout<<"Getting state "<<stateNo<<" from wasm!\n";
    std::cout<<"Size of state = ";
    if (stepNo < stateFreq){
      std::cout<<0<<std::endl;
      return State{false};
    }
    State s = *states[stateNo - 1].get();
    std::cout<<sizeof(s)<<std::endl;
    return s;
  }
}

#endif
#endif