#include <unordered_map>
#include <utility>
#include <iostream>

struct PairHash {
    std::size_t operator()(const std::pair<double, double>& p) const {
        return std::hash<double>()(p.first) ^ std::hash<double>()(p.second);
    }
};

int main() {
    std::unordered_map<std::pair<double, double>, int, PairHash> myMap;

    // insert elements into the map
    myMap[std::make_pair(1.0, 2.0)] = 42;
    myMap[std::make_pair(3.14, 2.71)] = 84;

    // access elements in the map
    int val = myMap[std::make_pair(1.0, 6/3)];
    std::cout<<val;
    // modifying
    myMap[std::make_pair(1.0, 6/3)]++;
    val = myMap[std::make_pair(1.0, 6/3)];
    std::cout<<val<<std::endl;

    std::unordered_map<std::pair<double, double>, int, PairHash> myMap2 = myMap;

    myMap[std::make_pair(1.0, 6/3)]++;

    val = myMap[std::make_pair(1.0, 6/3)];
    std::cout<<val<<std::endl;

    val = myMap2[std::make_pair(1.0, 6/3)];
    std::cout<<val<<std::endl;

    return 0;
}
