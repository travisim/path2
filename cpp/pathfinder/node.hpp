#include <set>
#include <chrono>

#ifndef NODE_HPP
#define NODE_HPP
#define DEBUG

namespace pathfinder
{

template<typename Coord_t>
class Node
{
public:
#ifdef DEBUG
  inline static int count = 0; // c++17
#endif
  Coord_t selfXY;
  Node *parent;
  std::vector<Node<Coord_t> *> children;
  uint32_t arrowIndex;
  double fCost;
  double gCost;
  double hCost;
  uint16_t depth = 0;
  uint64_t timeCreatedus;
  Node(Coord_t xy, Node *p, int a, double f, double g, double h)  // TOCHECK if passing ref is better : xy
      : selfXY(xy), parent(p), arrowIndex(a), fCost(f), gCost(g), hCost(h)
  {
#ifdef DEBUG
    Node::count++;
#endif
    using namespace std::chrono;
    timeCreatedus = duration_cast<microseconds>(system_clock::now().time_since_epoch()).count();
  }
  
  inline void addChild(Node *child) { child->depth = depth + 1; children.push_back(child); }
  ~Node<Coord_t>()
  {
    //std::cout << "deleting " << selfXY.first << ' ' << selfXY.second << ' ' << fCost << std::endl;
    for (auto child : children)
      delete child;
#ifdef DEBUG
    Node::count--;
#endif
  }
  friend std::ostream &operator<<(std::ostream &os, const Node &n){
    os<<n.selfXY.first<<' '<<n.selfXY.second<<' '<<n.fCost<<std::endl;
    return os;
  }
};

template <typename Coord_t>
struct MapNode{
  Coord_t valueXY;
  std::vector<int> neighbours;
  int parent; // index of parent node
  double gCost;
  MapNode(Coord_t xy) : valueXY(xy){}
  inline int numberOfNeighbours(){ return neighbours.size(); }
  inline int hasNeighbours(){ return numberOfNeighbours() > 0; }
  inline void addNeighbor(int x){ neighbours.push_back(x); }
  inline std::vector<int> getNeighbors(){ return neighbours; }
};


}
#endif