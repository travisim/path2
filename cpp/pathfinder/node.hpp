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
    int coordX;
    int coordY;
    Node *parent;
    std::set<Node *> children;
    int arrowIndex;
    double fCost;
    double gCost;
    double hCost;
    uint64_t timeCreatedns;
    Node(int x, int y, Node *p, int a, double f, double g, double h)
        : coordX(x), coordY(y), parent(p), arrowIndex(a), fCost(f), gCost(g), hCost(h)
    {
#ifdef DEBUG
      Node::count++;
#endif
      using namespace std::chrono;
      timeCreatedns = duration_cast<nanoseconds>(system_clock::now().time_since_epoch()).count();
    }
    inline void addChild(Node *child) { children.insert(child); }
    inline void deleteChild(Node *child) { children.erase(child); }
    const int &getX() const {
      return coordX;
    }
    ~Node()
    {
      // std::cout << "deleting " << coordX << ' ' << coordY << ' ' << fCost << std::endl;
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
    os<<n.coordX<<' '<<n.coordY<<' '<<n.fCost<<std::endl;
    return os;
  }
}
#endif