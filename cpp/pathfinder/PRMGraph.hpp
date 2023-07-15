#include <assert.h>
#include <vector>
#include <chrono>
#include "pathfinder.hpp"
#include "step.hpp"
#include "kdtree.hpp"
#include "LOS.hpp"
#include <emscripten.h>
#include <emscripten/bind.h>






#ifndef PURE_CPP
#include <emscripten.h>
#include <emscripten/bind.h>
#endif

#ifndef PRMRAPH_HPP
#define PRMRAPH_HPP

namespace pathfinder{



template <typename Action_t>
class PRMGraph : public Pathfinder<Action_t>{
  using Coord_t = typename Action_t::CoordType;
  using Pathfinder<Action_t>::vertexEnabled;
  using Pathfinder<Action_t>::currentNode;
  using Pathfinder<Action_t>::currentNodeXY;
  using Pathfinder<Action_t>::rootNodes;
  using Pathfinder<Action_t>::batchSize;
  using Pathfinder<Action_t>::goal;
  using Pathfinder<Action_t>::gridHeight;
  using Pathfinder<Action_t>::gridWidth;
  using Pathfinder<Action_t>::grid;
  using Pathfinder<Action_t>::bigMap;
  using Pathfinder<Action_t>::stepIndex;
  using Pathfinder<Action_t>::maxNodeDepth;
  using Pathfinder<Action_t>::diagonalAllow;
  using Pathfinder<Action_t>::path;

  using Pathfinder<Action_t>::createAction;
  using Pathfinder<Action_t>::saveStep;
  using Pathfinder<Action_t>::initSearch;
  using Pathfinder<Action_t>::terminateSearch;

  using Pathfinder<Action_t>::manhattan;
  using Pathfinder<Action_t>::euclidean;
  using Pathfinder<Action_t>::chebyshev;
  using Pathfinder<Action_t>::octile;

  std::vector<MapNode<Coord_t>> mapNodes;
  std::vector<std::array<Coord_t, 2>> mapEdges;
  bool showNetworkGraph;  // config var
  bool toGenerateMap = true;  // config var
  std::unordered_map<Coord_t, MapNode<Coord_t>*, CoordHash<Coord_t>> matchMapNode;

  Empty2D<Node<Coord_t>*, Coord_t> openList, closedList;
  PriorityQueue<Coord_t> pq;
  costType chosenCost;
  timeOrder order;
  int gCoeff;
  int hCoeff;

  int loopLength;
  int loopCnt;
  int loopStart;
  int cnt;

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

  enum Dest{
    PseudoCode,
    CanvasFocused,
    CanvasExpanded,
    CanvasPath,
    CanvasNeighbors,
    CanvasQueue,
    CanvasVisited,
    CanvasNetworkGraph,
    ITNeighbors,
    ITQueue,
  };

public:

  inline int getNumMapNodes(){ return mapNodes.size(); }

#ifndef PURE_CPP
  bool wrapperGNM(emscripten::val gridArr, bool diagonalAllow){
    grid = js2DtoVect2D(gridArr);
    gridHeight = grid.size();
    gridWidth = grid.size() ? grid[0].size() : 0;
    this->diagonalAllow = diagonalAllow;

    std::cout<<"STARTING MAP GENERATION, GRID SIZE = "<<grid.size()<<"×"<<grid[0].size()<<std::endl;

    return generateNewMap();
  }

  void addMapNode(emscripten::val coordJS, emscripten::val neighborsJS){
    Coord_t coord = {coordJS[0].as<double>(), coordJS[1].as<double>()};
    auto neighbors = jsInttoVectInt(neighborsJS);

    mapNodes.push_back(MapNode(coord, neighbors));
    // std::cout << "Added: " << mapNodes.back().valueXY.first << " " << mapNodes.back().valueXY.second << std::endl;
  }

  void addMapEdge(emscripten::val edgeJS){
    Coord_t start = {edgeJS[0].as<double>(), edgeJS[1].as<double>()};
    Coord_t end = {edgeJS[2].as<double>(), edgeJS[3].as<double>()};

    mapEdges.push_back({start, end});
  }

  inline std::vector<MapNode<Coord_t>> getMapNodes(){ return mapNodes; }
  inline std::vector<std::array<Coord_t, 2>> getMapEdges(){ return mapEdges; }
#endif

// -----------------------------------------------------------------


// helper
Coord_t randomDoubleCoordGenerator(const int &gridHeight,const int &gridWidth ){ //requires initialisation of seed
    //std::cout<<RAND_MAX<<std::endl;
    //std::cout<<rand()<<std::endl;
    double rx = static_cast< double >(rand()) / static_cast< double >(RAND_MAX) * gridHeight  ;// rx in the range 0 to grid height;
    double ry = static_cast< double >(rand())  / static_cast< double >(RAND_MAX) * gridWidth ; // ry in the range 0 to grid height;
    
    Coord_t randomCoord_XY (rx, ry);
    return randomCoord_XY;
}

// helper
double distanceBetween2Points(const Coord_t a,const Coord_t b){
    // Calculating distance
    return sqrt(pow(a.first - b.first, 2) + pow(a.second - b.second , 2));
}

// helper
//del getNearestNodeIndexInTreeToRandomCoord


// helper
//del getCoordinatesofPointsXAwayFromSource

// helper
//del getNodesNearbyIndex

std::pair<double, double> offsetCoord(Coord_t coord,const double OFFSET){
    return std::pair<double, double>(coord.first + OFFSET, coord.second + OFFSET);
}

// helper
//del determineParentWithLowestCost



// helper
void insertNodeToTree(const int Parent_Index,const Coord_t nextCoordToAdd_XY, const std::vector<int>&  neighbours_IndexArray, std::vector<MapNode<Coord_t>>& mapNodes,const std::vector<std::vector<uint8_t>> grid, const bool& diagonalAllow, const double OFFSET){
    if (CustomLOSChecker(offsetCoord(mapNodes[Parent_Index].valueXY,OFFSET) , offsetCoord(nextCoordToAdd_XY,OFFSET),grid, diagonalAllow).boolean){
        double gCost = mapNodes[Parent_Index].gCost+distanceBetween2Points(nextCoordToAdd_XY,mapNodes[Parent_Index].valueXY);
        //add neighbours for parents
        int newNode_index = static_cast<int>(mapNodes.size()); // position of this matters
        mapNodes.push_back(nextCoordToAdd_XY); // create new node
        mapNodes[Parent_Index].addNeighbor(newNode_index);
        //mapNodes[newNode_index].addNeighbor(Parent_Index); //
        mapNodes[newNode_index].gCost = gCost;
        mapNodes[newNode_index].parent = Parent_Index;
        mapNodes[newNode_index].neighbours = neighbours_IndexArray;
        
        //mapNodes.push_back(new MapNode(Parent_Index,nextCoordToAdd_XY,neighbours_IndexArray,additionalCoord_XY,additionalEdge_XYXY,gCost));
    }
}
// helper
void print_nodes(const Kdtree::KdNodeVector &nodes) {
    size_t i,j;
    for (i = 0; i < nodes.size(); ++i) {
        if (i > 0)
            std::cout << " ";
        std::cout << "(";
        for (j = 0; j < nodes[i].point.size(); j++) {
            if (j > 0)
                std::cout << ",";
            std::cout << nodes[i].point[j];
        }
        std::cout << ")";
    }
    std::cout << std::endl;
}






//code for generating grid-----------------------------------------------------------------------






void pushNewEdgeToEdgeAccumalator(const std::pair<double, double> &coord1, const std::pair<double, double> &coord2, std::vector<std::vector<std::pair<double, double>>> &edgeAccumalator){
    bool flag = true;
    for (int i = 0; i<edgeAccumalator.size(); ++i){
      if ((edgeAccumalator[i][0] == coord1 && edgeAccumalator[i][1] == coord2) || (edgeAccumalator[i][0] == coord2 && edgeAccumalator[i][1] == coord1)){
          bool flag = false;
          //std::cout<<"dup detected";
      }
     
        
    }
    if(flag == true){
        std::vector<std::pair<double, double>> temp;
        temp.push_back(coord1);
        temp.push_back(coord2);
        edgeAccumalator.push_back(temp);
    }

   
}


  bool generateNewMap(){
    cnt = 0;
    mapNodes.clear();
//   int x1 = start.first; // start coord
//     int y1 = start.second;
//     int x2 = goal.first; // end coord
//     int y2 = goal.second;
    // int gridHeight;
    // int gridWidth;
    int sampleSize = 30;
    // grid_t grid;

    unsigned int seed = 1234;
    double  pointXawayFromSource = 4;
    bool vertexEnabled = true;
    const double OFFSET = vertexEnabled ? 0 : 0.5;
    bool diagonalAllow = true;
    std::string neighbourSelectionMethod = "Closest Neighbours By Radius";
    double connectionDistance=4;
    int numberOfTopClosestNeighbours=3;

    



    
    // if(showNetworkGraph) createAction(DrawVertex, CanvasNetworkGraph, start);
    // mapNodes.push_back(MapNode(goal));
    // if(showNetworkGraph) createAction(DrawVertex, CanvasNetworkGraph, goal);
    


    // if(showNetworkGraph) createAction(DrawVertex, CanvasNetworkGraph, coord);

    // if(showNetworkGraph) saveStep(true);

  
    // if(showNetworkGraph) createAction(DrawEdge, CanvasNetworkGraph, n1.valueXY, -1, -1, -1, 0, {}, -1, n2.valueXY);
   
    // if(showNetworkGraph) saveStep(true);

   std::vector<std::vector<std::pair<double, double>>> edgeAccumalator;
    
    srand(seed);
    Coord_t randomCoord_XY = randomDoubleCoordGenerator(gridHeight, gridWidth);
    // std::cout <<"firstcoord selected:"<< randomCoord_XY.first << ", " << randomCoord_XY.second << std::endl;
   

    mapNodes.push_back(randomCoord_XY); // start and end not connected
    mapNodes[0].gCost = 0;
    mapNodes[0].parent = 999999;
    if (showNetworkGraph)createAction(DrawVertex, CanvasNetworkGraph, randomCoord_XY);
    if (showNetworkGraph)saveStep(true);
    
    auto offsetCoord = [&](Coord_t coord){ return std::pair<double, double>{coord.first + OFFSET, coord.second + OFFSET}; };
    
    
    
    
    std::vector<Coord_t> ArrayOfRandomPoints;
    // mapNodes[0].parent = null;
    for (int i = 0; i < sampleSize; ++i) {
        randomCoord_XY = randomDoubleCoordGenerator(gridHeight, gridWidth);
        if(CustomLOSChecker(offsetCoord(randomCoord_XY), offsetCoord(randomCoord_XY), grid, diagonalAllow).boolean){ // filters out random points that are on obsacles verified to work
            ArrayOfRandomPoints.push_back(randomCoord_XY);
            if (showNetworkGraph)createAction(DrawVertex, CanvasNetworkGraph, randomCoord_XY);
            if (showNetworkGraph)saveStep(true);
        }
        
        
    }
    
    Kdtree::KdNodeVector nodes; // init kd nodes
    for (int i = 0; i < ArrayOfRandomPoints.size(); ++i) {//load valid random points to kd nodes and mapnodes
        std::vector<double> point(2);
        point[0] = ArrayOfRandomPoints[i].first;
        point[1] = ArrayOfRandomPoints[i].second;
        nodes.push_back(Kdtree::KdNode(point));
        mapNodes.push_back(ArrayOfRandomPoints[i]);
    }
    Kdtree::KdTree tree(&nodes); //load valid random points to kd tree
    int  k_nearest_neighbors_int = 4;
    
    for (int i = 0; i < ArrayOfRandomPoints.size(); ++i) {
        std::vector<double> test_point(2);
        test_point[0] = ArrayOfRandomPoints[i].first;
        test_point[1] = ArrayOfRandomPoints[i].second;
        Kdtree::KdNodeVector result;
        tree.k_nearest_neighbors(test_point, k_nearest_neighbors_int, &result); //calculate k nearest neighbours
        //convert array or coord to array of indexes in ArrayOfRandomPoints
        std::vector<int>  neighbours_IndexArray;
        for (int j = 0; j < ArrayOfRandomPoints.size(); ++j) {
            for (int k = 0; k < result.size(); ++k) {
                if (ArrayOfRandomPoints[j].first == result[k].point[0] && ArrayOfRandomPoints[j].second == result[k].point[1]){
                    if(CustomLOSChecker(offsetCoord(mapNodes[i].valueXY) , offsetCoord(Coord_t(result[k].point[0],result[k].point[1])),grid, diagonalAllow).boolean){//if LOS to neighbours
                        neighbours_IndexArray.push_back(j);
                        std::pair<double, double> coord1(mapNodes[i].valueXY.first,mapNodes[i].valueXY.second);
                        std::pair<double, double> coord2(result[k].point[0],result[k].point[1]);
                        pushNewEdgeToEdgeAccumalator(coord1, coord2, edgeAccumalator);
                    }
                }
            }
        }
        mapNodes[i].neighbours = neighbours_IndexArray; // load k nearest neighbours index to mapnode;

    }
     for(int i = 0; i < edgeAccumalator.size(); ++i){
        if (showNetworkGraph)createAction(DrawEdge, CanvasNetworkGraph, edgeAccumalator[i][0], -1, -1, -1, 0, {}, -1, edgeAccumalator[i][1]);
        if (showNetworkGraph)saveStep(true);
    }
  
   
    std::cout<<"sample size "<<sampleSize<<"\n";
    std::cout<<"random coord array size "<<tree.allnodes.size()<<"\n";

    std::cout<<"Done with finding nodes; number of nodes = "<<mapNodes.size()<<std::endl;

    loopStart = 0;
    loopLength = 10000;
    return false;
  }

  bool nextGNM(){
    const double OFFSET = vertexEnabled ? 0 : 0.5;
    auto offsetCoord = [&](Coord_t coord){ return coordDouble_t{(double)coord.first + OFFSET, (double)coord.second + OFFSET}; };
    int chg = floor((sqrt(8*loopLength + 4*loopStart*loopStart - 4*loopStart + 1) - 2 * loopStart + 1) / 2);
    // std::cout<<"loopStart: "<<loopStart<<", loopLenFloor: "<<loopStart*chg + chg*chg/2 - chg/2<<std::endl;
    if(loopCnt++ % 10 == 0){
      float pct = (float)(loopStart) * (float)(loopStart - 1) * 100.0 / ((float)mapNodes.size() * (float)(mapNodes.size() - 1));
      std::cout << "Progress: " << std::fixed << std::setprecision(2) << pct << "%" << std::endl;
    }
    for(int i = loopStart; i < loopStart + chg; ++i){
      if(i == mapNodes.size()){
        std::cout<<"Generated map! Node count: "<<mapNodes.size()<<", Edge count: "<<mapEdges.size()<<std::endl;
        std::cout<<cnt<<" calls to CustomLOSChecker(C++) made!\n";
        return true;
      }
      for(int j = 0; j < i; ++j){
        auto &n1 = mapNodes[i], &n2 = mapNodes[j];
        cnt++;
        if(CustomLOSChecker(offsetCoord(n1.valueXY), offsetCoord(n2.valueXY), grid, diagonalAllow).boolean){
          // std::cout<<n1.valueXY.first<<' '<<n1.valueXY.second<<' '<<n2.valueXY.first<<' '<<n2.valueXY.second<<": HAVE LOS\n";
          // auto xy1 = offsetCoord(n1.valueXY);
          // auto xy2 = offsetCoord(n2.valueXY);
          // std::cout<<xy1.first<<' '<<xy1.second<<' '<<xy2.first<<' '<<xy2.second<<": HAVE LOS\n";
          mapNodes[i].addNeighbor(j);
          mapNodes[j].addNeighbor(i);
          mapEdges.push_back({n1.valueXY, n2.valueXY});
        }
      }
    }
    loopStart += chg;
    return false;
  }

  void addStartGoalNodes(Coord_t start, Coord_t goal){
    const auto OFFSET = vertexEnabled ? 0 : 0.5;
    auto offsetCoord = [&](Coord_t coord){ return coordDouble_t{(double)coord.first + OFFSET, (double)coord.second + OFFSET}; };
    for(auto coord : {start, goal}){
      // check if coordinate is already a mapnode
      auto nodeToAdd = MapNode(coord);
      for(const auto node : mapNodes) if(isCoordEqual<Coord_t>(coord, node.valueXY)) goto nextIteration;
      for(int i = 0; i < mapNodes.size(); ++i){
        auto &node = mapNodes[i];
        if(CustomLOSChecker(offsetCoord(coord), offsetCoord(node.valueXY), grid, diagonalAllow).boolean){
          mapNodes[i].addNeighbor(mapNodes.size());
          nodeToAdd.addNeighbor(i);
          mapEdges.push_back({coord, node.valueXY});
        }
      }
      mapNodes.push_back(nodeToAdd);
      nextIteration:;
    }
  }

  void drawPRMGraph(){
    if(!showNetworkGraph) return;

    for(const auto node : mapNodes)
      createAction(DrawVertex, CanvasNetworkGraph, node.valueXY);
    saveStep(true);

    for(const auto edge : mapEdges)
      createAction(DrawEdge, CanvasNetworkGraph, edge[0], -1, -1, -1, 0, {}, -1, edge[1]);
  }

  #ifndef PURE_CPP
  bool wrapperSearch(
    emscripten::val gridArr,  // grid
    int startX, int startY, int goalX, int goalY,  // start and end coordinates
    bool vertexEnabled, bool diagonalAllow, bool bigMap, bool hOptimized,
    int chosenCostInt, int orderInt, // implicit type conversion (?)
    int gCoeff, int hCoeff,
    bool showNetworkGraph
  ){
    costType chosenCost = (costType)chosenCostInt;
    timeOrder order = (timeOrder)orderInt;
    grid_t grid = js2DtoVect2D(gridArr);

    toGenerateMap = false;
    
    return search(grid, startX, startY, goalX, goalY, vertexEnabled, diagonalAllow, bigMap, hOptimized, chosenCost, order, gCoeff, hCoeff, showNetworkGraph);
  }

  #endif
//   js search
// wrapper search
// cpp search

  void clearMapNodes(){
    mapNodes.clear();
    mapEdges.clear();
  }

  bool foundGoal(Node<Coord_t> *node){
    // every planner now has to define their own implementation of foundGoal because of enum-binding
    // found the goal & exits the loop
    if (node->selfXY.first != goal.first || node->selfXY.second != goal.second)
      return false;

    //  retraces the entire parent tree until start is found
    Node<Coord_t> *current = node;
    while (current != nullptr)
    {
      createAction(DrawVertex, CanvasPath, current->selfXY);
      if(current->parent)
        createAction(DrawEdge, CanvasPath, current->selfXY, -1, -1, -1, -1, {}, -1, current->parent->selfXY);
      
      path.push_back(current->selfXY);
      if (current->arrowIndex != -1)
        createAction(DrawArrow, -1, {-1, -1}, 1, current->arrowIndex);
      current = current->parent;
    }
    saveStep(true);
    saveStep(true);
    return true;
  }

  bool search(grid_t &grid, int startX, int startY, int goalX, int goalY, bool vertexEnabled, bool diagonalAllow, bool bigMap, bool hOptimized, costType chosenCost, timeOrder order, int gCoeff = 1, int hCoeff = 1, bool showNetworkGraph = false){
    std::cout << "Start:" << startX << ',' << startY << " Goal: " << goalX << ',' << goalY << std::endl;
    std::cout << vertexEnabled << ' ' << diagonalAllow << ' ' << bigMap << ' ' << hOptimized <<std::endl;
    std::cout << chosenCost << ' ' << order << std::endl;
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

    if(toGenerateMap){
      bool finished = generateNewMap();
      while(!finished) finished = nextGNM();
    }
    addStartGoalNodes({startX, startY}, {goalX, goalY});
    drawPRMGraph();
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
      createAction(InsertRowAtIndex, ITQueue, {-1, -1}, -1, -1, -1, 1, {std::to_string(startX) + ", " + std::to_string(startY), "-", std::to_string(currentNode->fCost).substr(0, 6), std::to_string(currentNode->gCost).substr(0, 6), std::to_string(currentNode->hCost).substr(0, 6)});
      createAction(DrawVertex, CanvasQueue, currentNode->selfXY);
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

      createAction(IncrementPixel, CanvasVisited, currentNodeXY);
      if(!bigMap){
        createAction(EraseAllRows, ITNeighbors);
        for(int i = 0; i < currentNeighbors.size(); ++i){
          const auto XY = mapNodes[currentNeighbors[i]].valueXY;
          createAction(InsertRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, -(i + 1), {coord2String(XY, 5), "?", "?", "?", "?"});
        }
        createAction(EraseRowAtIndex, ITQueue, {-1, -1}, -1, -1, -1, 1);
        createAction(DrawSinglePixel, CanvasFocused, currentNodeXY);
        createAction(EraseCanvas, CanvasNeighbors);
        createAction(DrawSinglePixel, CanvasExpanded, currentNodeXY);
        createAction(ErasePixel, CanvasQueue, currentNodeXY);
        createAction(EraseAllEdge, CanvasFocused);
      }
      saveStep(true);

      // assign cell index?

      if(foundGoal(currentNode)) return terminateSearch(); 

      for(int i = 0; i <currentNeighbors.size(); ++i){
        const auto idx = currentNeighbors[i];
        auto nextXY = mapNodes[idx].valueXY;

        std::array<double, 3> trip = calcCost(nextXY);
        double fCost = trip[0], gCost = trip[1], hCost = trip[2];

        if(!showNetworkGraph){
          createAction(DrawEdge, CanvasNetworkGraph, nextXY, -1, -1, -1, 0, {}, -1, currentNodeXY);
        }
        if(!bigMap){
          createAction(EraseAllEdge, CanvasFocused);
          createAction(DrawEdge, CanvasFocused, nextXY, -1, -1, -1, 0, {}, -1, currentNodeXY);
        }
        
        auto openNode = openList.get(nextXY);
        
        if(openNode != nullptr && openNode->fCost <= fCost){
          if(!bigMap){
            createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {coord2String(nextXY, 5), std::to_string(fCost).substr(0, 6), std::to_string(gCost).substr(0, 6), std::to_string(hCost).substr(0, 6), "Not a child"});
            createAction(DrawSinglePixel, CanvasFocused, nextXY);
            // saveStep(false);
          }
          saveStep(false);
          continue;
        }

        auto closedNode = closedList.get(nextXY);

        if(closedNode != nullptr && closedNode->fCost <= fCost){
          if(!bigMap){
            if(currentNode->parent && isCoordEqual(currentNode->parent->selfXY, nextXY))
              createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {coord2String(nextXY, 5), std::to_string(fCost).substr(0, 6), std::to_string(gCost).substr(0, 6), std::to_string(hCost).substr(0, 6), "Parent"});
            else
              createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {coord2String(nextXY, 5), std::to_string(fCost).substr(0, 6), std::to_string(gCost).substr(0, 6), std::to_string(hCost).substr(0, 6), "Not a child"});
            createAction(DrawSinglePixel, CanvasFocused, nextXY);
          }

          /*createAction(IncrementPixel, CanvasVisited, nextXY);*///add on
          saveStep(false);
          continue;
        }

        // createAction(SetPixel, CanvasFCost, nextXY, -1, -1, -1, 0, {}, fCost);
        // createAction(SetPixel, CanvasGCost, nextXY, -1, -1, -1, 0, {}, gCost);
        // createAction(SetPixel, CanvasHCost, nextXY, -1, -1, -1, 0, {}, hCost);

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
          createAction(HighlightPseudoCodeRowPri, PseudoCode, {-1, -1}, -1, -1, 32);
          createAction(DrawVertex, CanvasQueue, nextXY);
          createAction(DrawVertex, CanvasNeighbors, nextXY);

          createAction(InsertRowAtIndex, ITQueue, {-1, -1}, -1, -1, -1, posInQueue, {coord2String(nextXY, 5), coord2String(currentNodeXY, 5), std::to_string(fCost).substr(0, 6), std::to_string(gCost).substr(0, 6), std::to_string(hCost).substr(0, 6)});

          if(openNode == nullptr && closedNode == nullptr)
            createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {coord2String(nextXY, 5), std::to_string(fCost).substr(0, 6), std::to_string(gCost).substr(0, 6), std::to_string(hCost).substr(0, 6), "New encounter"});
          else if(openNode)
            createAction(UpdateRowAtIndex, ITNeighbors, {-1, -1}, -1, -1, -1, i + 1, {coord2String(nextXY, 5), std::to_string(fCost).substr(0, 6), std::to_string(gCost).substr(0, 6), std::to_string(hCost).substr(0, 6), "Replace parent"});

          createAction(DrawSinglePixel, CanvasFocused, nextXY);
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