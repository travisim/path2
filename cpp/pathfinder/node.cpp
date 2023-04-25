#include <iostream>
#include "node.hpp"

namespace pathfinder{
  std::ostream &operator<<(std::ostream &os, const Node &n)
  {
    os << n.coordX << ' ' << n.coordY << ' ' << n.fCost() << std::endl;
    return os;
  }
}