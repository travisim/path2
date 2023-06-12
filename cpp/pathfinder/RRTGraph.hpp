#include <assert.h>
#include <vector>
#include <chrono>
#include "pathfinder.hpp"
#include "step.hpp"
#include "rbt_pq.hpp"
#include "LOS.hpp"
#include <emscripten.h>
#include <emscripten/bind.h>
#include "conversion.hpp"




#ifndef RRTGRAPH_HPP
#define RRTGRAPH_HPP

namespace pathfinder{



template <typename Action_t>
class RRTGraph : public Pathfinder<Action_t>{
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
  std::vector<std::array<Coord_t, 2>> mapEdges;//std::pair<Coord_t, Coord_t>> mapEdges;
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

  bool wrapperGNM(emscripten::val gridArr, bool diagonalAllow,int startX, int startY){ // now takes in start and y
    grid = js2DtoVect2D(gridArr);
    gridHeight = grid.size();
    gridWidth = grid.size() ? grid[0].size() : 0;
    this->diagonalAllow = diagonalAllow;

    std::cout<<"STARTING MAP GENERATION, GRID SIZE = "<<grid.size()<<"×"<<grid[0].size()<<std::endl;

    return generateNewMap({startX, startY});
  }

  void addMapNode(emscripten::val coordJS, emscripten::val neighborsJS){
    Coord_t coord = {coordJS[0].as<double>(), coordJS[1].as<double>()};
    auto neighbors = jsInttoVectInt(neighborsJS);

    mapNodes.push_back(MapNode(coord, neighbors));
  }

  void addMapEdge(emscripten::val edgeJS){
    Coord_t start = {edgeJS[0].as<double>(), edgeJS[1].as<double>()};
    Coord_t end = {edgeJS[2].as<double>(), edgeJS[3].as<double>()};

    mapEdges.push_back({start, end});
  }
  // -----------------------------------------------------------------
Coord_t randomDoubleCoordGenerator(const int &gridHeight,const int &gridWidth ){ //requires initialisation of seed
    //std::cout<<RAND_MAX<<std::endl;
    //std::cout<<rand()<<std::endl;
    double rx = static_cast< double >(rand()) / static_cast< double >(RAND_MAX) * gridHeight  ;// rx in the range 0 to grid height;
    double ry = static_cast< double >(rand())  / static_cast< double >(RAND_MAX) * gridWidth ; // ry in the range 0 to grid height;
    
    Coord_t randomCoord_XY (rx, ry);
    return randomCoord_XY;
}
double distanceBetween2Points(const Coord_t a,const Coord_t b){
    // Calculating distance
    return sqrt(pow(a.first - b.first, 2) + pow(a.second - b.second , 2));
}

int getNearestNodeIndexInTreeToRandomCoord(const std::vector<MapNode<Coord_t>>& MapNodes,const Coord_t& randomCoord_XY){
    //std::cout<< randomCoord_XY.first<<" "<<randomCoord_XY.second<<"\n";
    int size  = static_cast<int>(MapNodes.size());
    
    int NearestNodeIndex = 0;
    double NearestNodeDistance = 9999999;
    for (int i = 0 ; i < size; ++i) {
        double newdistanceDistanceBetween2Points = distanceBetween2Points(randomCoord_XY,MapNodes[i].valueXY);
        if ( newdistanceDistanceBetween2Points < NearestNodeDistance) {
            NearestNodeDistance = newdistanceDistanceBetween2Points;
            NearestNodeIndex = i;
        }
    }
    
    return NearestNodeIndex;
}



Coord_t getCoordinatesofPointsXAwayFromSource(const Coord_t& src, const Coord_t& dest, double& distance) {
    
    // Calculate the distance between srcCoord and destCoord
    double distanceBetween2Points = std::sqrt(std::pow(dest.first - src.first, 2) + std::pow(dest.second - src.second, 2));

    if(distanceBetween2Points<distance){
        return dest;
    }
    // Calculate the ratio of the distance to be covered
    double ratio = distance / distanceBetween2Points;

    // Calculate the coordinates of the intermediate point
    Coord_t intermediateCoord(src.first + ratio * (dest.first - src.first),src.second + ratio * (dest.second - src.second));


    return intermediateCoord;
}
std::vector<int> getNodesNearbyIndex( std::vector<MapNode<Coord_t>>& mapNodes,  Coord_t& nextCoordToAdd_XY, std::string& neighbourSelectionMethod, double& connectionDistance,int& numberOfTopClosestNeighbours){
    
    std::vector<int> indexes;

    // Iterate over each struct in the vector
    for (int i = 0; i < mapNodes.size(); i++) {
        const MapNode<Coord_t>& MapNode = mapNodes[i];

        // Calculate the Euclidean distance between the source coordinate and the struct's coordinate
        double distance = std::sqrt(std::pow(MapNode.valueXY.first - nextCoordToAdd_XY.first, 2) + std::pow(MapNode.valueXY.second - nextCoordToAdd_XY.second, 2));

        // Check if the distance is within the specified radius
        if (distance <= connectionDistance) {
            indexes.push_back(i); // Add the index to the result vector
        }
    }

    return indexes;

}

std::pair<double, double> offsetCoord(Coord_t coord,const double OFFSET){
    return std::pair<double, double>(coord.first + OFFSET, coord.second + OFFSET);
}


int determineParentWithLowestCost(const std::vector<int>& nodesNearby_Indexes,const Coord_t& nextCoordToAdd_XY,const int& nearestNode_Index,const std::vector<MapNode<Coord_t>>& mapNodes,const grid_t grid, const bool& diagonalAllow, const double OFFSET){
   // int selectedParent_Index = determineParentWithLowestCost(nodesNearby_Indexes,nextCoordToAdd_XY,nearestNode_Index,mapNodes,grid, diagonalAllow,&offsetCoord);
    int selectedParent_index = nearestNode_Index;
    
    
    
    for (int i = 0; i < nodesNearby_Indexes.size(); ++i) {
      //console.log(nodesNearby_Index,i,"i",selectedParent_index,mapNodes)
      if(mapNodes[nodesNearby_Indexes[i]].gCost + distanceBetween2Points(mapNodes[nodesNearby_Indexes[i]].valueXY,nextCoordToAdd_XY)<mapNodes[selectedParent_index].gCost+distanceBetween2Points(mapNodes[selectedParent_index].valueXY,nextCoordToAdd_XY) &&  CustomLOSChecker(offsetCoord(mapNodes[selectedParent_index].valueXY,OFFSET) , offsetCoord(nextCoordToAdd_XY,OFFSET),grid, diagonalAllow).boolean){
        selectedParent_index = nodesNearby_Indexes[i];

      }
    }
    return selectedParent_index;
}






void insertNodeToTree(const int Parent_Index,const Coord_t nextCoordToAdd_XY, const std::vector<int>&  neighbours_IndexArray, std::vector<MapNode<Coord_t>>& mapNodes,const grid_t grid, const bool& diagonalAllow, const double OFFSET){
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


void  rewireTree( std::vector<MapNode<Coord_t>>& mapNodes,int& currentNode_Index, const std::vector<int>& nodesNearby_Indexes,const grid_t grid, const bool& diagonalAllow, const double OFFSET){// rewires neighbouring nodes within radius of current node to current node as parent if it results in a lower g cost
    for (int i = 0; i < nodesNearby_Indexes.size(); ++i) {
      int nodeNearby_index  = nodesNearby_Indexes[i];

      if(nodeNearby_index == mapNodes[currentNode_Index].parent) continue;
        double newConnection_gCost = distanceBetween2Points(mapNodes[currentNode_Index].valueXY, mapNodes[nodeNearby_index].valueXY) + mapNodes[currentNode_Index].gCost;
      
        bool LOS =CustomLOSChecker(offsetCoord(mapNodes[currentNode_Index].valueXY,OFFSET) , offsetCoord(mapNodes[nodeNearby_index].valueXY,OFFSET),grid, diagonalAllow).boolean;
        
      if (mapNodes[nodeNearby_index].gCost > newConnection_gCost && LOS) { // yes rewire
        //console.log("before rewire",currentNode_Index,mapNodes[currentNode_Index].neighbours,mapNodes[currentNode_Index].parent,nodeNearby_index, mapNodes[nodeNearby_index].neighbours,mapNodes[nodeNearby_index].parent)
        mapNodes[nodeNearby_index].neighbours.push_back(currentNode_Index);// forms edge between nearby node and current
        mapNodes[currentNode_Index].neighbours.push_back(nodeNearby_index);
       // console.log("before 1rewire",currentNode_Index,mapNodes[currentNode_Index].neighbours,mapNodes[currentNode_Index].parent,nodeNearby_index, mapNodes[nodeNearby_index].neighbours,mapNodes[nodeNearby_index].parent)

        int formerParentOfNearbyNode_index; // to fixscopingissueforsecond loop
        for (int j = 0; j < mapNodes[nodeNearby_index].neighbours.size(); ++j) { // remove edge between nearby node and parent of nearby node
          if(mapNodes[nodeNearby_index].neighbours[j] == mapNodes[nodeNearby_index].parent){
               formerParentOfNearbyNode_index = mapNodes[nodeNearby_index].neighbours[j];
            mapNodes[nodeNearby_index].neighbours.erase(mapNodes[nodeNearby_index].neighbours.begin() + j); // removes parent as a neighbour
            continue;
          }
        }
        mapNodes[nodeNearby_index].parent = currentNode_Index;
       

       // console.log("after rewire",currentNode_Index,mapNodes[currentNode_Index].neighbours,mapNodes[currentNode_Index].parent,nodeNearby_index, mapNodes[nodeNearby_index].neighbours,mapNodes[nodeNearby_index].parent)
       // console.log("after rewire p1 ",mapNodes[formerParentOfNearbyNode_index].neighbours,mapNodes[formerParentOfNearbyNode_index])
        //console.log("rewire", mapNodes[formerParentOfNearbyNode_index].valueXY, mapNodes[nodeNearby_index].valueXY, "nodeNearby_index", nodeNearby_index, "formerParentOfNearbyNode_index", formerParentOfNearbyNode_index)
        for (int j = 0; j < mapNodes[formerParentOfNearbyNode_index].neighbours.size(); ++j) {
          if(mapNodes[formerParentOfNearbyNode_index].neighbours[j] == nodeNearby_index){
            mapNodes[formerParentOfNearbyNode_index].neighbours.erase(mapNodes[formerParentOfNearbyNode_index].neighbours.begin()+j); // removes nearby node as a neighbour of (nearby node parent)
          }
        }
        // console.log("after rewire p ",mapNodes[formerParentOfNearbyNode_index].neighbours,mapNodes[formerParentOfNearbyNode_index])
//          this._create_action({command: STATIC.EraseEdge, dest: this.dests.networkGraph, nodeCoord: mapNodes[formerParentOfNearbyNode_index].valueXY, endCoord: mapNodes[nodeNearby_index].valueXY });
//          this._create_action({command: STATIC.DrawEdge, dest: this.dests.networkGraph, nodeCoord: mapNodes[currentNode_Index].valueXY, endCoord: mapNodes[nodeNearby_index].valueXY, colorIndex:1});
//          this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 10});
//          this._save_step(true);
//
       // myUI.edgeCanvas.eraseLine(mapNodes[formerParentOfNearbyNode_index].valueXY, mapNodes[nodeNearby_index].valueXY, this.dests.networkGraph);
        //myUI.edgeCanvas.drawLine(mapNodes[currentNode_Index].valueXY,mapNodes[nodeNearby_index].valueXY);
      }
    }
      
}

// helper
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


// -----------------------------------------------------------------

  bool generateNewMap(Coord_t start){
    mapNodes.clear();

    int x1 =  start.first; // start coord
    int y1 =  start.second;
    // int gridHeight;
    // int gridWidth;
    int sampleSize = 30;
    // grid_t grid;
    mapNodes.clear();

    unsigned int seed = 123;
    double  pointXawayFromSource = 4;
    bool vertexEnabled = true;
    srand(seed);
    Coord_t randomCoord_XY = randomDoubleCoordGenerator(gridHeight, gridWidth);
   // std::cout <<"firstcoord selected:"<< randomCoord_XY.first << ", " << randomCoord_XY.second << std::endl;
 
    mapNodes.push_back(Coord_t(x1,y1));  // start and end not connected
    mapNodes[0].gCost = 0;
    mapNodes[0].parent = 999999;
    const double OFFSET = vertexEnabled ? 0 : 0.5;
    auto offsetCoord = [&](Coord_t coord){ return std::pair<double, double>{coord.first + OFFSET, coord.second + OFFSET}; };
    bool diagonalAllow = true;
    std::string neighbourSelectionMethod = "Closest Neighbours By Radius";
    double connectionDistance=4;
    int numberOfTopClosestNeighbours=3;

  
   if(showNetworkGraph) createAction(DrawPixel, CanvasNetworkGraph, randomCoord_XY);
   if(showNetworkGraph) saveStep(true);



    
  
   


    // if(showNetworkGraph) createAction(DrawPixel, CanvasNetworkGraph, coord);

    // if(showNetworkGraph) saveStep(true);

  
    // if(showNetworkGraph) createAction(DrawEdge, CanvasNetworkGraph, n1.valueXY, -1, -1, -1, 0, {}, -1, n2.valueXY);
   
    // if(showNetworkGraph) saveStep(true);
 
    
    
   // mapNodes[0].parent = null;
    for (int i = 0; i < sampleSize; ++i) {
       
        randomCoord_XY = randomDoubleCoordGenerator(gridHeight, gridWidth);
       // std::cout <<"randomcoord "<<randomCoord_XY.first<<","<<randomCoord_XY.second<<std::endl;;
        if(showNetworkGraph) createAction(DrawPixel, CanvasNetworkGraph, randomCoord_XY);
        if(showNetworkGraph) saveStep(true);
        int nearestNode_Index = getNearestNodeIndexInTreeToRandomCoord(mapNodes, randomCoord_XY);
        Coord_t nextCoordToAdd_XY = getCoordinatesofPointsXAwayFromSource(randomCoord_XY,mapNodes[nearestNode_Index].valueXY,pointXawayFromSource);
       // std::cout <<"1 "<<randomCoord_XY.first<<","<<randomCoord_XY.second<<" "<<nextCoordToAdd_XY.first<<","<<nextCoordToAdd_XY.second<<std::endl;
     
       // std::cout <<randomCoord_XY.first<<","<<randomCoord_XY.second<<" "<<nextCoordToAdd_XY.first<<","<<nextCoordToAdd_XY.second<<std::endl;
        if(CustomLOSChecker(offsetCoord(randomCoord_XY), offsetCoord(nextCoordToAdd_XY), grid, diagonalAllow).boolean){ // last argument is diagonalAllow
            std::vector<int>  nodesNearby_Indexes = getNodesNearbyIndex(mapNodes, nextCoordToAdd_XY, neighbourSelectionMethod, connectionDistance,numberOfTopClosestNeighbours);
            int selectedParent_Index = determineParentWithLowestCost(nodesNearby_Indexes,nextCoordToAdd_XY,nearestNode_Index,mapNodes,grid, diagonalAllow,OFFSET);
        
            insertNodeToTree(selectedParent_Index, nextCoordToAdd_XY, std::vector<int>(1,selectedParent_Index),  mapNodes, grid, diagonalAllow, OFFSET);
            int index = static_cast<int>(mapNodes.size()-1);
            rewireTree(mapNodes,index, nodesNearby_Indexes, grid, diagonalAllow, OFFSET);
     
        }
    }
    std::cout<<"Done with finding ; number of Nodes = "<<mapNodes.size()<<std::endl;
    return false;
   
  };
  

  bool nextGNM(){
    const double OFFSET = vertexEnabled ? 0 : 0.5;
    auto offsetCoord = [&](Coord_t coord){ return coordDouble_t{(double)coord.first + OFFSET, (double)coord.second + OFFSET}; };
    int chg = floor((sqrt(8*loopLength + 4*loopStart*loopStart - 4*loopStart + 1) - 2 * loopStart + 1) / 2);
    std::cout<<"loopStart: "<<loopStart<<", loopLenFloor: "<<loopStart*chg + chg*chg/2 - chg/2<<std::endl;
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
    Coord_t arr[2] = {start, goal};
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

  void drawRRTGraph(){
    if(!showNetworkGraph) return;

    for(const auto node : mapNodes)
      createAction(DrawPixel, CanvasNetworkGraph, node.valueXY);
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

  bool foundGoal(Node<Coord_t> *node){
    // every planner now has to define their own implementation of foundGoal because of enum-binding
    // found the goal & exits the loop
    if (node->selfXY.first != goal.first || node->selfXY.second != goal.second)
      return false;

    //  retraces the entire parent tree until start is found
    Node<Coord_t> *current = node;
    while (current != nullptr)
    {
      createAction(DrawPixel, CanvasPath, current->selfXY);
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

    if(toGenerateMap){
      bool finished = generateNewMap({startX, startY});
      while(!finished) finished = nextGNM();
    }
    addStartGoalNodes({startX, startY}, {goalX, goalY});
    drawRRTGraph();
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
      createAction(DrawPixel, CanvasQueue, currentNode->selfXY);
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
            saveStep(false);
          }
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
          createAction(DrawPixel, CanvasQueue, nextXY);
          createAction(DrawPixel, CanvasNeighbors, nextXY);

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