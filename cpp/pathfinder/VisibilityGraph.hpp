#include <vector>
#include "pathfinder.hpp"
#include "rbt_pq.hpp"
#include "LOS.hpp"

#ifndef VGRAPH_HPP
#define VGRAPH_HPP

namespace pathfinder{

struct Preset {
  std::vector<std::vector<int8_t>> data;
  std::vector<coordInt_t> coords;
};

std::vector<coordInt_t> cornerCoords(grid_t& gridObj, int kernelSize, int startX, int startY, bool vertex = true) {
  constexpr int8_t N = -1;

  auto checkAgainstPresets = [&](const std::vector<Preset>& presets) {
    std::vector<coordInt_t> ret;
    for (const auto& preset : presets) {
      for (int i = 0; i < kernelSize; ++i) {
        for (int j = 0; j < kernelSize; ++j) {
          if (preset.data[i][j] == N) continue; // skip for null
          if (preset.data[i][j] != gridObj[i + startX][j + startY]) {
            goto presetLoop;
          }
        }
      }
      for(auto coord : preset.coords) ret.push_back({coord.first + startX, coord.second + startY});
      return ret;
      presetLoop:;
    }
    return std::vector<coordInt_t>(); // empty vector to represent null
  };

  if (kernelSize == 2) {
    if (vertex) {
      int cnt = 0;
      for (int i = startX; i < startX + kernelSize; ++i) {
        for (int j = startY; j < startY + kernelSize; ++j) {
          if (gridObj[i][j]) cnt++;
        }
      }
      if (cnt == 3) return {{startX + 1, startY + 1}};
    } else {
      std::vector<Preset> presets = {
        {
          {{1, 1},
           {1, 0}},
          {{0, 0}}
        },
        {
          {{1, 1},
           {0, 1}},
          {{0, 1}}
        },
        {
          {{0, 1},
           {1, 1}},
          {{1, 1}}
        },
        {
          {{1, 0},
           {1, 1}},
          {{1, 0}}
        }
      };

      return checkAgainstPresets(presets);
    }
  }

  return std::vector<coordInt_t>(); // empty vector to represent null
}

template <typename Action_t>
class VisibilityGraph : public Pathfinder<Action_t>{
  using Coord_t = typename Action_t::CoordType;
  using Pathfinder<Action_t>::vertexEnabled;
  using Pathfinder<Action_t>::currentNode;
  using Pathfinder<Action_t>::currentNodeXY;
  using Pathfinder<Action_t>::rootNodes;
  using Pathfinder<Action_t>::batchSize;
  using Pathfinder<Action_t>::goal;
  using Pathfinder<Action_t>::dests;
  using Pathfinder<Action_t>::gridHeight;
  using Pathfinder<Action_t>::gridWidth;
  using Pathfinder<Action_t>::grid;
  using Pathfinder<Action_t>::bigMap;
  using Pathfinder<Action_t>::stepIndex;
  using Pathfinder<Action_t>::maxNodeDepth;
  using Pathfinder<Action_t>::diagonalAllow;

  using Pathfinder<Action_t>::createAction;
  using Pathfinder<Action_t>::saveStep;
  using Pathfinder<Action_t>::initSearch;
  using Pathfinder<Action_t>::terminateSearch;
  using Pathfinder<Action_t>::foundGoal;

  using Pathfinder<Action_t>::manhattan;
  using Pathfinder<Action_t>::euclidean;
  using Pathfinder<Action_t>::chebyshev;
  using Pathfinder<Action_t>::octile;

  std::vector<MapNode<Coord_t>> mapNodes;
  bool showNetworkGraph;  // config var
  std::unordered_map<Coord_t, MapNode<Coord_t>*, CoordHash<Coord_t>> matchMapNode;

  Empty2D<Node<Coord_t>*, Coord_t> openList, closedList;
  PriorityQueue<Coord_t> pq;
  costType chosenCost;
  timeOrder order;
  int gCoeff;
  int hCoeff;

  bool showFreeVertex(){ return true; }

  std::array<double, 3> calcCost(Coord_t nextXY)
  {    
    const int curX = currentNode->selfXY.first, curY = currentNode->selfXY.second;
    const int nextX = nextXY.first, nextY = nextXY.second;
    const int goalX = goal.first, goalY = goal.second;
    const double curG = currentNode->gCost;

    double gCost, hCost;
    if (chosenCost == Manhattan)
    {
      gCost = curG + manhattan(curX, curY, nextX, nextY);
      hCost = manhattan(nextX, nextY, goalX, goalY);
    }
    else if (chosenCost == Euclidean)
    {
      gCost = curG + euclidean(curX, curY, nextX, nextY);
      hCost = euclidean(nextX, nextY, goalX, goalY);
    }
    else if (chosenCost == Chebyshev)
    {
      gCost = curG + chebyshev(curX, curY, nextX, nextY);
      hCost = chebyshev(nextX, nextY, goalX, goalY);
    }
    else// if (chosenCost == Octile)
    {
      assert(chosenCost == Octile);
      gCost = curG + octile(curX, curY, nextX, nextY);
      hCost = octile(nextX, nextY, goalX, goalY);
    }
    return {gCoeff * gCost + hCoeff * hCost, gCost, hCost};
  }
public:

  inline int getNumMapNodes(){ return mapNodes.size(); }

  void generateNewMap(Coord_t start, Coord_t goal){
    mapNodes.clear();
    mapNodes.push_back(MapNode(start));
    if(showNetworkGraph) createAction(DrawPixel, dests["networkGraph"], start);
    mapNodes.push_back(MapNode(goal));
    if(showNetworkGraph) createAction(DrawPixel, dests["networkGraph"], goal);
    const int KERNEL_SIZE = 2;

    for(int i = 0; i < gridHeight - KERNEL_SIZE + 1; ++i){
      for(int j = 0; j < gridWidth - KERNEL_SIZE + 1; ++j){
        auto coords = cornerCoords(grid, KERNEL_SIZE, i, j, vertexEnabled);
        if(coords.size() == 0) continue;
        for(const auto coord : coords){
          mapNodes.push_back(MapNode(coord));
          if(showNetworkGraph) createAction(DrawPixel, dests["networkGraph"], coord);
        }
      }
    }
    if(showNetworkGraph) saveStep(true);

    for(int i = 0; i < mapNodes.size(); ++i){
      for(int j = 0; j < i; ++j){
        auto n1 = mapNodes[i], n2 = mapNodes[j];
        const double OFFSET = vertexEnabled ? 0 : 0.5;
        auto offsetCoord = [&](Coord_t coord){ return Coord_t{coord.first + OFFSET, coord.second + OFFSET}; };
        if(CustomLOSChecker(offsetCoord(n1.valueXY), offsetCoord(n2.valueXY), grid, diagonalAllow).boolean){
          if(showNetworkGraph) createAction(DrawEdge, dests["networkGraph"], n1.valueXY, -1, -1, -1, 0, {}, -1, n2.valueXY);
          mapNodes[i].addNeighbor(j);
          mapNodes[j].addNeighbor(i);
        }
      }
    }
    if(showNetworkGraph) saveStep(true);
  };

  #ifndef PURE_CPP
  bool wrapperSearch(
    emscripten::val gridArr,  // grid
    int startX, int startY, int goalX, int goalY,  // start and end coordinates
    bool vertexEnabled, bool diagonalAllow, bool bigMap, bool hOptimized,
    int chosenCostInt, int orderInt, // implicit type conversion (?)
    int gCoeff, int hCoeff,
    bool showNetworkGraph,
    emscripten::val jsDestsToId // Array of strings in JS
  ){
    costType chosenCost = (costType)chosenCostInt;
    timeOrder order = (timeOrder)orderInt;
    grid_t grid = js2DtoVect2D(gridArr);

    // related: https://stackoverflow.com/questions/16141178/is-it-possible-to-map-string-to-int-faster-than-using-hashmap
    int len = jsDestsToId["length"].as<uint32_t>();
    if(len != 0){
      dests.clear();
      for(int i = 0; i < len; ++i){
        std::string s = jsDestsToId[i].as<std::string>();
        dests[s] = i;
      }
    }
    
    return search(grid, startX, startY, goalX, goalY, vertexEnabled, diagonalAllow, bigMap, hOptimized, chosenCost, order, gCoeff, hCoeff, showNetworkGraph);
  }

  #endif


  bool search(grid_t &grid, int startX, int startY, int goalX, int goalY, bool vertexEnabled, bool diagonalAllow, bool bigMap, bool hOptimized, costType chosenCost, timeOrder order, int gCoeff = 1, int hCoeff = 1, bool showNetworkGraph = false){
    std::cout<<startX<<' '<<startY<<' '<<goalX<<' '<<goalY<<std::endl;
    std::cout<<vertexEnabled<<' '<<diagonalAllow<<' '<<bigMap<<' '<<hOptimized<<std::endl;
    std::cout<<chosenCost<<' '<<order<<std::endl;
    initSearch(grid, {startX, startY}, {goalX, goalY}, diagonalAllow, bigMap);

    this->vertexEnabled = vertexEnabled;
    this->showNetworkGraph = showNetworkGraph;

    this->chosenCost = chosenCost;
    this->order = order;
    this->gCoeff = gCoeff;
    this->hCoeff = hCoeff;

    pq = PriorityQueue<Coord_t>(order, hOptimized);
    closedList = Empty2D<Node<Coord_t>*, Coord_t>(gridHeight, gridWidth);
    openList = Empty2D<Node<Coord_t>*, Coord_t>(gridHeight, gridWidth);
    openList.clear();
    closedList.clear();

    generateNewMap({startX, startY}, {goalX, goalY});
    // instead of adding neighbors to struct Node, link the coordinates to the original mapNode
    for(auto& mapNode : mapNodes) matchMapNode[mapNode.valueXY] = &mapNode;

    currentNode = new Node<Coord_t>({startX, startY}, nullptr, -1, 0, 0, 0);
    rootNodes.push_back(currentNode);
    
    std::array<double, 3> trip = calcCost({startX, startY});
    currentNode->fCost = trip[0];
    currentNode->hCost = trip[2]; // gCost is 0

    // pushes the starting node onto the queue
    pq.push(currentNode);
    if(!bigMap)
    {
      // for every node that is pushed onto the queue, it should be added to the queue infotable
      createAction(InsertRowAtIndex, dests["ITQueue"], {-1, -1}, -1, -1, -1, 1, {std::to_string(startX) + ", " + std::to_string(startY), "-", std::to_string(currentNode->fCost).substr(0, 6), std::to_string(currentNode->gCost).substr(0, 6), std::to_string(currentNode->hCost).substr(0, 6)});
      createAction(DrawPixel, dests["queue"], currentNode->selfXY);
      saveStep(true);
    }

    openList.set(currentNode->selfXY, currentNode);

    currentNode = nullptr;

    return false;
  }

  bool runNextSearch(int givenBatchSize = -1){
    if(givenBatchSize == -1)
      givenBatchSize = batchSize;
    int num = givenBatchSize;
    while (num--){
      if(pq.empty())
        return terminateSearch(false);
      currentNode = pq.top(); pq.pop();
      currentNodeXY = currentNode->selfXY;
      openList.set(currentNodeXY, nullptr);
      if (stepIndex % 10000 == 0)
        std::cout << "F: " << std::setprecision(5) << currentNode->fCost << ", H: " << std::setprecision(5) << currentNode->hCost << std::endl;

      if(closedList.get(currentNodeXY) != nullptr && closedList.get(currentNodeXY)->fCost <= currentNode->fCost)
        continue;

      closedList.set(currentNodeXY, currentNode);
      auto currentNeighbors = matchMapNode[currentNodeXY]->getNeighbors();

      createAction(IncrementPixel, dests["visited"], currentNodeXY);
      if(!bigMap){
        createAction(EraseAllRows, dests["ITNeighbors"]);
        for(int i = 0; i < currentNeighbors.size(); ++i){
          const auto XY = mapNodes[currentNeighbors[i]].valueXY;
          createAction(InsertRowAtIndex, dests["ITNeighbors"], {-1, -1}, -1, -1, -1, -(i + 1), {coord2String(XY, 5), "?", "?", "?", "?"});
        }
        createAction(EraseRowAtIndex, dests["ITQueue"], {-1, -1}, -1, -1, -1, 1);
        createAction(DrawSinglePixel, dests["focused"], currentNodeXY);
        createAction(EraseCanvas, dests["neighbors"]);
        createAction(DrawSinglePixel, dests["expanded"], currentNodeXY);
        createAction(ErasePixel, dests["queue"], currentNodeXY);
        createAction(EraseAllEdge, dests["focused"]);
      }
      saveStep(true);

      // assign cell index?

      if(foundGoal(currentNode)) return terminateSearch(); 

      for(int i = 0; i <currentNeighbors.size(); ++i){
        const auto idx = currentNeighbors[i];
        auto nextXY = mapNodes[idx].valueXY;

        std::array<double, 3> trip = calcCost(nextXY);
        double fCost = trip[0], gCost = trip[1], hCost = trip[2];

        if(!showNetworkGraph) createAction(DrawEdge, dests["networkGraph"], nextXY, -1, -1, -1, 0, {}, -1, currentNodeXY);
        if(!bigMap){
          createAction(EraseAllEdge, dests["focused"]);
          createAction(DrawEdge, dests["focused"], nextXY, -1, -1, -1, 0, {}, -1, currentNodeXY);
        }
        
        auto openNode = openList.get(nextXY);
        
        if(openNode != nullptr && openNode->fCost <= fCost){
          if(!bigMap){
            createAction(UpdateRowAtIndex, dests["ITNeighbors"], {-1, -1}, -1, -1, -1, i + 1, {coord2String(nextXY, 5), std::to_string(fCost).substr(0, 6), std::to_string(gCost).substr(0, 6), std::to_string(hCost).substr(0, 6), "Not a child"});
            createAction(DrawSinglePixel, dests["focused"], nextXY);
            saveStep(false);
          }
          continue;
        }

        auto closedNode = closedList.get(nextXY);

        if(closedNode != nullptr && closedNode->fCost <= fCost){
          if(!bigMap){
            if(currentNode->parent && isCoordEqual(currentNode->parent->selfXY, nextXY))
              createAction(UpdateRowAtIndex, dests["ITNeighbors"], {-1, -1}, -1, -1, -1, i + 1, {coord2String(nextXY, 5), std::to_string(fCost).substr(0, 6), std::to_string(gCost).substr(0, 6), std::to_string(hCost).substr(0, 6), "Parent"});
            else
              createAction(UpdateRowAtIndex, dests["ITNeighbors"], {-1, -1}, -1, -1, -1, i + 1, {coord2String(nextXY, 5), std::to_string(fCost).substr(0, 6), std::to_string(gCost).substr(0, 6), std::to_string(hCost).substr(0, 6), "Not a child"});
            createAction(DrawSinglePixel, dests["focused"], nextXY);
          }

          /*createAction(IncrementPixel, dests["visited"], nextXY);*///add on
          saveStep(false);
          continue;
        }

        // createAction(SetPixel, dests["fCost"], nextXY, -1, -1, -1, 0, {}, fCost);
        // createAction(SetPixel, dests["gCost"], nextXY, -1, -1, -1, 0, {}, gCost);
        // createAction(SetPixel, dests["hCost"], nextXY, -1, -1, -1, 0, {}, hCost);

        auto nextNode = new Node<Coord_t>(nextXY, currentNode, -1, fCost, gCost, hCost);
        if(currentNode->depth < maxNodeDepth){
          currentNode->addChild(nextNode);
        }
        else{
          rootNodes.push_back(nextNode);
        }

        int posInQueue = pq.push(nextNode);
        openList.set(nextXY, nextNode);

        if(!bigMap){
          createAction(HighlightPseudoCodeRowPri, dests["pseudocode"], {-1, -1}, -1, -1, 32);
          createAction(DrawPixel, dests["queue"], nextXY);
          createAction(DrawPixel, dests["neighbors"], nextXY);

          createAction(InsertRowAtIndex, dests["ITQueue"], {-1, -1}, -1, -1, -1, posInQueue, {coord2String(nextXY, 5), coord2String(currentNodeXY, 5), std::to_string(fCost).substr(0, 6), std::to_string(gCost).substr(0, 6), std::to_string(hCost).substr(0, 6)});

          if(openNode == nullptr && closedNode == nullptr)
            createAction(UpdateRowAtIndex, dests["ITNeighbors"], {-1, -1}, -1, -1, -1, i + 1, {coord2String(nextXY, 5), std::to_string(fCost).substr(0, 6), std::to_string(gCost).substr(0, 6), std::to_string(hCost).substr(0, 6), "New encounter"});
          else if(openNode)
            createAction(UpdateRowAtIndex, dests["ITNeighbors"], {-1, -1}, -1, -1, -1, i + 1, {coord2String(nextXY, 5), std::to_string(fCost).substr(0, 6), std::to_string(gCost).substr(0, 6), std::to_string(hCost).substr(0, 6), "Replace parent"});

          createAction(DrawSinglePixel, dests["focused"], nextXY);
        }
        saveStep(false);

        if(foundGoal(nextNode)) return terminateSearch(true);
      }
    }
    return false;
  }

};

}

#endif