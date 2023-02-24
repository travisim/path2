#define _USE_MATH_DEFINES

// #include <emscripten.h>
#include <iostream>
#include <cmath>     // M_SQRT2
#include <algorithm> // max, min
#include <vector>  // steps, any general iterable
#include <map>  // ostream operator<< overloading
#include <set>  // storing of node children

#include "helper.cpp"

enum nwse
{
  N,
  W,
  S,
  E,
  NW,
  SW,
  SE,
  NE,
  nil,
};

enum Command
{
  DrawSinglePixel,
  SetPixel,
  EraseCanvas,                 // erase canvas
  DrawPixel,                   // draw pixel
  ErasePixel,                  // erase pixel
  IncrementPixel,              // increment pixel
  DecrementPixel,              // increment pixel
  DrawArrow,                   // draw arrow (arrow index) [colour index]
  EraseArrow,                  // erase arrow (arrow index)
  InsertRowAtIndex,            // dest, rowIndex
  EraseRowAtIndex,             // dest, rowIndex
  EraseAllRows,                // dest, rowIndex
  UpdateRowAtIndex,            // dest, rowIndex
  HighlightPseudoCodeRowPri,   // highlight Pseudo
  HighlightPseudoCodeRowSec,   // highlight Pseudo
  UnhighlightPseudoCodeRowSec, // unhighlight Pseudo
  SetHighlightAtIndex,
  DrawVertex,
  DrawSingleVertex,
  EraseVertex,
  EraseAllVertex,
  DrawEdge,
  EraseEdge,
  EraseAllEdge,
};

enum Dest
{
  Pseudocode,
  CanvasQueue,
  CanvasVisited,
  CanvasExpanded,
  CanvasNeigbors,
  CanvasPath,
  CanvasFocused,
  CanvasFCost,
  CanvasGCost,
  CanvasHCost,
  ITQueue,
  ITNeighbors,
  map
};

std::ostream &operator<<(std::ostream &out, const Command value)
{
  static std::map<Command, std::string> myStrings;
  if (myStrings.size() == 0)
  {
#define INSERT_ELEMENT(p) myStrings[p] = #p
    INSERT_ELEMENT(DrawSinglePixel),
        INSERT_ELEMENT(SetPixel),
        INSERT_ELEMENT(EraseCanvas),                 // erase canvas
        INSERT_ELEMENT(DrawPixel),                   // draw pixel
        INSERT_ELEMENT(ErasePixel),                  // erase pixel
        INSERT_ELEMENT(IncrementPixel),              // increment pixel
        INSERT_ELEMENT(DecrementPixel),              // increment pixel
        INSERT_ELEMENT(DrawArrow),                   // draw arrow (arrow index) [colour index]
        INSERT_ELEMENT(EraseArrow),                  // erase arrow (arrow index)
        INSERT_ELEMENT(InsertRowAtIndex),            // dest, rowIndex
        INSERT_ELEMENT(EraseRowAtIndex),             // dest, rowIndex
        INSERT_ELEMENT(UpdateRowAtIndex),            // dest, rowIndex
        INSERT_ELEMENT(HighlightPseudoCodeRowPri),   // highlight Pseudo
        INSERT_ELEMENT(HighlightPseudoCodeRowSec),   // highlight Pseudo
        INSERT_ELEMENT(UnhighlightPseudoCodeRowSec), // unhighlight Pseudo
        INSERT_ELEMENT(SetHighlightAtIndex),
        INSERT_ELEMENT(DrawVertex);
#undef INSERT_ELEMENT
  }
  return out << myStrings[value];
}

std::ostream &operator<<(std::ostream &out, const Dest value)
{
  static std::map<Dest, std::string> myStrings;
  if (myStrings.size() == 0)
  {
#define INSERT_ELEMENT(p) myStrings[p] = #p
    INSERT_ELEMENT(Pseudocode),
        INSERT_ELEMENT(CanvasQueue),
        INSERT_ELEMENT(CanvasVisited),
        INSERT_ELEMENT(CanvasExpanded),
        INSERT_ELEMENT(CanvasNeigbors),
        INSERT_ELEMENT(CanvasPath),
        INSERT_ELEMENT(CanvasFocused),
        INSERT_ELEMENT(CanvasFCost),
        INSERT_ELEMENT(CanvasGCost),
        INSERT_ELEMENT(CanvasHCost),
        INSERT_ELEMENT(ITQueue),
        INSERT_ELEMENT(ITNeighbors),
        INSERT_ELEMENT(map);
#undef INSERT_ELEMENT
  }
  return out << myStrings[value];
}

class Node
{
public:
  int coordX;
  int coordY;
  Node *parent;
  std::set<Node *> children;
  int arrowIndex;
  double fCost;
  double gCost;
  double hCost;
  Node() : coordX(0), coordY(0) {}
  Node(int x, int y) : coordX(x), coordY(y) {}
  Node(int x, int y, Node *p, int a, double f, double g, double h) : coordX(x), coordY(y), parent(p), arrowIndex(a), fCost(f), gCost(g), hCost(h) {}
  void addChild(Node *child)
  {
    children.insert(child);
  }
  void deleteChild(Node *child)
  {
    children.erase(child);
  }
  ~Node()
  {
    //std::cout << "deleting " << coordX << ' ' << coordY << ' ' << fCost << std::endl;
    for (auto child : children)
      delete child;
  }
  friend std::ostream &operator<<(std::ostream &os, const Node &n);
};

std::ostream &operator<<(std::ostream &os, const Node &n)
{
  os << n.coordX << ' ' << n.coordY << ' ' << n.fCost << std::endl;
  return os;
}

class GridPathFinder
{
public:
  std::vector<nwse> deltaNWSE;
  std::vector<std::string> deltaNWSEStr;
  std::vector<std::vector<int>> delta;

  bool drawArrows;
  bool vertexEnabled;
  bool diagonalAllow;
  bool bigMap;
  int bitOffset;
  const int staticBitLen = 5;
  const int colorBitLen = 1;
  grid_t grid;
  int gridHeight, gridWidth;
  int batchSize, batchInterval;

  neighbors_t neighborsIndex;

  std::pair<int, int> start, goal, currentNodeXY;
  path_t path;
  
  int arrowCnt;
  int stepIndex;
  std::vector<int> actionCache;
  std::vector<int> stepCache;
  std::vector<int> stepData;
  std::vector<int> stepIndexMap;
  std::vector<int> combinedIndexMap;

  std::vector<std::vector<int>> cellMap;

  Node *currentNode;
  Node *rootNode; // used to destruct all the nodes as each new node will be a descendant

  // additional stuff that is not in js
  std::vector<std::vector<std::string>> ITRowDataCache;
  std::vector<std::vector<int>> arrowCoords;
  bool finishedSearch = false;

  virtual ~GridPathFinder()
  {
    delete rootNode;
  }

  void initSearch(grid_t &grid, std::pair<int, int> start, std::pair<int, int> goal, neighbors_t &neighborsIndex, bool vertexEnabled, bool bigMap, bool diagonalAllow)
  {
    this->grid = grid;
    this->start = start; // in array form [x,y]  [0,0] is top left  [512,512] is bottom right
    this->goal = goal;
    path.clear();

    if (neighborsIndex.size() == 8)
    {
      deltaNWSE = {N, NW, W, SW, S, SE, E, NE};
      delta = {{1, 0}, {1, 1}, {0, 1}, {-1, 1}, {-1, 0}, {-1, -1}, {0, -1}, {1, -1}};
      deltaNWSEStr.resize(8);
      deltaNWSEStr[N] = "N";
      deltaNWSEStr[W] = "W";
      deltaNWSEStr[S] = "E";
      deltaNWSEStr[E] = "E";
      deltaNWSEStr[NW] = "NW";
      deltaNWSEStr[SW] = "SW";
      deltaNWSEStr[SE] = "SE";
      deltaNWSEStr[NE] = "NE";
    }
    else
    {
      deltaNWSE = {N, W, S, E};
      delta = {{1, 0}, {0, 1}, {-1, 0}, {0, -1}};
      deltaNWSEStr.resize(4);
      deltaNWSEStr[N] = "N";
      deltaNWSEStr[W] = "W";
      deltaNWSEStr[S] = "E";
      deltaNWSEStr[E] = "E";
    }
    this->neighborsIndex = neighborsIndex;
    this->vertexEnabled = vertexEnabled;

    // clearSteps
    arrowCnt = 0;
    stepIndex = -1;
    stepCache.clear();
    stepData.clear();
    stepIndexMap.clear();
    combinedIndexMap.clear();
    ITRowDataCache.clear();
    arrowCoords.clear();
    drawArrows = gridHeight <= 65 && gridWidth <= 65;
    currentNode = nullptr;

    // generate empty 2d array
    cellMap = std::vector<std::vector<int>>(gridHeight, std::vector<int>(gridWidth, 0));

    if (gridHeight <= 32)
      batchSize = 1000; //10
    else if (gridHeight <= 64)
      batchSize = 1000; //40
    else
      batchSize = 1000;
    batchInterval = 0;
  }

  bool nodeIsNeighbor(std::pair<int, int> &nextXY, nwse nextNWSE, std::vector<std::array<int, 2>> &cardinalCoords)
  {
    if (vertexEnabled)
    {
      std::pair<int, int> c1, c2;
      // no diagonal blocking considered
      if (nextXY.first != this->currentNodeXY.first && nextXY.second != this->currentNodeXY.second)
      {
        // diagonal crossing
        // consider [std::min(nextXY.first, this->currentNodeXY.first), std::min(nextXY.second, this->currentNodeXY.second)];
        int coord[2] = {std::min(nextXY.first, this->currentNodeXY.first), std::min(nextXY.second, this->currentNodeXY.second)};
        if (grid[coord[0]][coord[1]] == 0)
          return false; // not passable
      }
      else
      {
        // cardinal crossing
        if (nextXY.first != this->currentNodeXY.first)
        {
          // consider [std::min(nextXY.first, this->currentNodeXY.first), nextXY.second]
          // consider [std::min(nextXY.first, this->currentNodeXY.first), nextXY.second-1]
          c1 = {std::min(nextXY.first, this->currentNodeXY.first), nextXY.second};
          c2 = {std::min(nextXY.first, this->currentNodeXY.first), nextXY.second - 1};
        }
        else
        {
          // consider [nextXY.first, std::min(nextXY.second, this->currentNodeXY.second)]
          // consider [nextXY.first-1, std::min(nextXY.second, this->currentNodeXY.second)]
          c1 = {nextXY.first, std::min(nextXY.second, this->currentNodeXY.second)};
          c2 = {nextXY.first - 1, std::min(nextXY.second, this->currentNodeXY.second)};
        }
        if (grid[c1.first][c1.second] == 0 && grid[c2.first][c2.second] == 0)
          return false; // not passable
      }
    }
    else
    {
      if (grid[nextXY.first][nextXY.second] == 0)
        return false; // if neighbour is not passable
      if (!diagonalAllow && neighborsIndex.size() == 8)
      { // if diagonal blocking is enabled
        // N: 0, W: 1, S: 2, E: 3
        if (nextNWSE == NW)
        {
          if (grid[cardinalCoords[N][0]][cardinalCoords[N][1]] == 0 && grid[cardinalCoords[W][0]][cardinalCoords[W][1]] == 0)
            return false;
        }
        else if (nextNWSE == SW)
        {
          if (grid[cardinalCoords[S][0]][cardinalCoords[S][1]] == 0 && grid[cardinalCoords[W][0]][cardinalCoords[W][1]] == 0)
            return false;
        }
        else if (nextNWSE == SE)
        {
          if (grid[cardinalCoords[S][0]][cardinalCoords[S][1]] == 0 && grid[cardinalCoords[E][0]][cardinalCoords[E][1]] == 0)
            return false;
        }
        else if (nextNWSE == NE)
        {
          if (grid[cardinalCoords[N][0]][cardinalCoords[N][1]] == 0 && grid[cardinalCoords[E][0]][cardinalCoords[E][1]] == 0)
            return false;
        }
      }
    }
    return true;
  }

  int manageAction(int numBits)
  {
    bitOffset += numBits;
    if (bitOffset > 31)
    {
      actionCache.push_back(0);
      bitOffset = 1 + numBits;
    }
    return actionCache.size() - 1;
  }

  void createAction(Command command, int dest = -1, std::pair<int, int> nodeCoord = {-1, -1}, int colorIndex = -1, int arrowIndex = -1, int pseudoCodeRow = -1, int infoTableRowIndex = -1, std::vector<std::string> infoTableRowData = std::vector<std::string>(0), int cellVal = -1, std::pair<int, int> endCoord = {-1, -1})
  {
    //if(stepIndex < 10) std::cout<<command<<' ';
    actionCache = {1};
    bitOffset = 10;
    int idx = 0;

    // command is assumed to exist
    idx = manageAction(staticBitLen);
    actionCache[idx] += (command << (bitOffset - staticBitLen));
    if (dest != -1)
    {
      idx = manageAction(staticBitLen);
      actionCache[0] |= (1 << 1);
      actionCache[idx] += (dest << (bitOffset - staticBitLen));
    }
    if (colorIndex != -1)
    {
      idx = manageAction(colorBitLen);
      actionCache[0] |= (1 << 2);
      actionCache[idx] += (colorIndex << (bitOffset - colorBitLen));
    }
    if (nodeCoord.first != -1 && nodeCoord.second != -1)
    {
      ++idx;
      actionCache[0] |= (1 << 3);
      actionCache.push_back(nodeCoord.first << 1);
      ++idx;
      actionCache.push_back(nodeCoord.second << 1);
      // will add floating point implementation eventually
      // see endCoord for more details
    }
    if (arrowIndex != -1)
    {
      ++idx;
      actionCache[0] |= (1 << 4);
      actionCache.push_back(arrowIndex << 1);
    }
    if (pseudoCodeRow != -1)
    {
      ++idx;
      actionCache[0] |= (1 << 5);
      actionCache.push_back(pseudoCodeRow << 1);
    }
    if (infoTableRowIndex != -1)
    {
      ++idx;
      actionCache[0] |= (1 << 6);
      actionCache.push_back(infoTableRowIndex << 1);
    }
    if (infoTableRowData.size() > 0)
    { 
      //if(stepIndex < 10) std::cout<<infoTableRowData.size()<<std::endl;
      ++idx;
      actionCache[0] |= (1 << 7);
      actionCache.push_back(-1); // signalling to increment infotableRowData
      ITRowDataCache.push_back(infoTableRowData);
    }
    if (cellVal != -1)
    {
      ++idx;
      actionCache[0] |= (1 << 8);
      actionCache.push_back(cellVal << 1);
    }
    if (endCoord.first != -1 && endCoord.second != -1)
    {
      ++idx;
      actionCache[0] |= (1 << 9);
      actionCache.push_back((endCoord.first * gridWidth + endCoord.second) << 1);
      // will add floating point implementation eventually
      // overload the createAction method? idk
    }
    if(stepIndex < 10){
      //for(auto it : actionCache) std::cout<<it<<", ";
      //std::cout<<"\ndone saving action\n";
    }
    stepCache.insert(stepCache.end(), actionCache.begin(), actionCache.end());
    actionCache = {1};
  }

  void saveStep(bool combined)
  {
    if (combined)
    {
      int n = stepIndexMap.size() - combinedIndexMap.size();
      while (n > 0)
      {
        combinedIndexMap.push_back(n--);
      }
    }
    stepIndexMap.push_back(stepData.size());
    stepData.insert(stepData.end(), stepCache.begin(), stepCache.end());
    if(stepIndex < 10){
      //for(auto it : stepCache) std::cout<<it<<' ';
      //std::cout<<"\ndone saving step\n";
    }
    ++stepIndex;
    stepCache.clear(); // clear steps to save another step
  }

  void handleArrow(std::pair<int, int> nextXY, Node *newNode, Node *openNode, Node *closedNode)
  {
    if (!drawArrows)
      return;
    // ARROW
    if (openNode != nullptr)
    { // need to remove the previous arrow drawn and switch it to the newNode
      createAction(EraseArrow, -1, {-1, -1}, -1, openNode->arrowIndex);
    }
    if (closedNode != nullptr)
    { // need to remove the previous arrow drawn and switch it to the newNode
      createAction(EraseArrow, -1, {-1, -1}, -1, closedNode->arrowIndex);
    }
    arrowCoords.push_back({nextXY.first, nextXY.second, currentNodeXY.first, currentNodeXY.second});
    // newNode->arrowIndex = myUI.create_arrow(nextXY, currentNodeXY); // node is reference typed so properties can be modified after adding to queue or open list
    newNode->arrowIndex = arrowCnt++;
    std::cout<<"Arrow: "<<arrowCnt<<' '<<nextXY.first<<' '<<nextXY.second<<' '<<currentNodeXY.first<<' '<<currentNodeXY.second<<std::endl;
    createAction(DrawArrow, -1, {-1, -1}, 0, newNode->arrowIndex);
    // END OF ARROW
  }

  void assignCellIndex(std::pair<int, int> xy)
  {
    // index is the step index for the first expansion of that cell
    int x = xy.first;
    int y = xy.second;
    cellMap[x][y] = stepIndex;
  }

  bool foundGoal(Node *node)
  {
    // found the goal & exits the loop
    if (node->coordX != goal.first || node->coordY != goal.second)
      return false;

    assignCellIndex(currentNodeXY);
    //  retraces the entire parent tree until start is found
    while (node != nullptr)
    {
      /* NEW */
      createAction(DrawPixel, CanvasPath, {node->coordX, node->coordY});
      path.push_back({node->coordX, node->coordY});
      if (node->arrowIndex != -1)
        createAction(DrawArrow, -1, {-1, -1}, 1, node->arrowIndex);
      node = node->parent;
    }
    //std::cout << "found" << std::endl;
    saveStep(true);
    saveStep(true);
    return true;
  }

  path_t terminateSearch(bool found = true)
  {
    if(!found){
      //std::cout<<"Unable to find goal at "<<goal.first<<' '<<goal.second<<std::endl;
    }
    delete rootNode;
    finishedSearch = true;
    return path;
  }
};