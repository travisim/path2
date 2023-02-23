#define USE_MATH_DEFINES

#include <vector>
#include <iostream>
#include <utility>
#include <map>

using grid_t = std::vector<std::vector<uint8_t>>;
using neighbors_t = std::vector<uint8_t>;
using path_t = std::vector<std::pair<int, int>>;