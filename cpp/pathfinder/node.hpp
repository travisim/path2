#include <set>
#include <chrono>

#ifndef NODE_HPP
#define NODE_HPP
#define DEBUG

namespace pathfinder
{

  class Node
  {
  public:
#ifdef DEBUG
    inline static int count = 0; // c++17
#endif
    uint16_t coordX;
    uint16_t coordY;
    Node *parent;
    std::vector<Node *> children;
    uint32_t arrowIndex;
    // double fCost;
    double gCost;
    double hCost;
    uint64_t timeCreatedus;
    Node(uint16_t x, uint16_t y, Node *p, int a, double f, double g, double h)
        : coordX(x), coordY(y), parent(p), arrowIndex(a), gCost(g), hCost(h)
    {
#ifdef DEBUG
      Node::count++;
#endif
      using namespace std::chrono;
      timeCreatedus = duration_cast<microseconds>(system_clock::now().time_since_epoch()).count();
    }
    inline double fCost () const { return gCost + hCost; }
    inline void addChild(Node *child) { children.push_back(child); }
    ~Node()
    {
      //std::cout << "deleting " << coordX << ' ' << coordY << ' ' << fCost << std::endl;
      for (auto child : children)
        delete child;
      children.clear();
#ifdef DEBUG
      Node::count--;
#endif
    }
    friend std::ostream &operator<<(std::ostream &os, const Node &n);
  };

  std::ostream &operator<<(std::ostream &os, const Node &n){
    os<<n.coordX<<' '<<n.coordY<<' '<<n.fCost()<<std::endl;
    return os;
  }
}
#endif