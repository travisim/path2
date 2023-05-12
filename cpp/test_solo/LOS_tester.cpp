#include <iostream>
#include <vector>
#include <algorithm>
#include "../pathfinder/LOS.hpp"

bool equal(const std::pair<double, double>& A, const std::pair<double, double>& B) {
    return A.first == B.first && A.second == B.second;
  };

std::string coord2String(const std::pair<double, double>& coord) {
    return "[" + std::to_string(coord.first) + ", " + std::to_string(coord.second) + "]";
  };

bool compareCoords(const std::vector<std::pair<double, double>>& coords1, const std::vector<std::pair<double, double>>& coords2) {
    if (coords1.size() != coords2.size()) {
        return false;
    }
    
    bool fwd = true;
    for (size_t i = 0; i < coords1.size(); ++i) {
        if (!equal(coords1[i], coords2[i])) {
            fwd = false;
        }
    }
    
    std::vector<std::pair<double, double>> reversedCoords2 = coords2;
    std::reverse(reversedCoords2.begin(), reversedCoords2.end());
    
    bool rev = true;
    for (size_t i = 0; i < coords1.size(); ++i) {
        if (!equal(coords1[i], reversedCoords2[i])) {
            if (!fwd) {
                std::cout << "(" << coords1[i].first << ", " << coords1[i].second << "), ";
                std::cout << "(" << reversedCoords2[i].first << ", " << reversedCoords2[i].second << ")" << std::endl;
            }
            rev = false;
        }
    }
    
    if (!fwd && !rev) {
        std::cout << "Coords1: ";
        for (const auto& coord : coords1) {
            std::cout << "(" << coord.first << ", " << coord.second << "), ";
        }
        std::cout << std::endl;
        
        std::cout << "Coords2: ";
        for (const auto& coord : coords2) {
            std::cout << "(" << coord.first << ", " << coord.second << "), ";
        }
        std::cout << std::endl;
    }
    
    return fwd || rev;
}

int main() {
    std::cout << "starting\n";
    std::vector<std::vector<std::vector<std::pair<double, double>>>> tests = {
       {{{0, 0}, {2, 2}}, {{0, 0}, {1, 1}},},
       {{{0, 0}, {4, 4}}, {{0, 0}, {1, 1}, {2, 2}, {3, 3}},},
       {{{1, 4}, {4, 1}}, {{1, 3}, {2, 2}, {3, 1}},},
       {{{1.5, 4.5}, {4.5, 1.5}}, {{1, 4}, {2, 3}, {3, 2}, {4, 1}},},
       {{{1, 3}, {5, 6}}, {{1, 3}, {2, 3}, {2, 4}, {3, 4}, {3, 5}, {4, 5}},},
       {{{2, 6}, {4, 3}}, {{2, 5}, {2, 4}, {3, 4}, {3, 3}},},
       {{{3, 5}, {6, 3}}, {{3, 4}, {4, 4}, {4, 3}, {5, 3}},},
       {{{3, 8}, {6, 5}}, {{3, 7}, {4, 6}, {5, 5}},},
       {{{10, 3}, {12, 1}}, {{10, 2}, {11, 1}},},
       {{{12, 1}, {10, 3}}, {{10, 2}, {11, 1}},},
       {{{10, 3}, {12.5, 0.5}}, {{10, 2}, {11, 1}, {12, 0}},},
       {{{12.5, 0.5}, {10, 3}}, {{10, 2}, {11, 1}, {12, 0}},},
       {{{9.5, 3.5}, {12, 1}}, {{9, 3}, {10, 2}, {11, 1}},},
       {{{12, 1}, {9.5, 3.5}}, {{9, 3}, {10, 2}, {11, 1}},},
       {{{2.5, 2.2}, {4.8, 4.2}}, {{2, 2}, {3, 2}, {3, 3}, {4, 3}, {4, 4}},},
       {{{1, 8}, {4.5, 6.5}}, {{1, 7}, {2, 7}, {3, 7}, {3, 6}, {4, 6}}},
    };

    for (int t = 0; t < tests.size();) {
        const auto test = tests[t++];
        // std::cout << "Test no. " << t << std::endl;
        if (!compareCoords(test[1], CustomLOSGenerator(test[0][0], test[0][1], test[1].size()))) {
            std::cout << "Test " << t << " failed:\n";
            std::cout << "Question: ";
            std::cout << "(" << coord2String(test[0][0]) << ", " << coord2String(test[0][1]) << "), ";
            std::cout << std::endl;
            std::cout << "Given answer: ";
            for (const auto& coord : test[1]) {
                std::cout << coord2String(coord)<<' ';
            }
            std::cout << std::endl;
            std::cout << "\nComputed answer: ";
            for (const auto& coord : CustomLOSGenerator(test[0][0], test[0][1])) {
                std::cout << coord2String(coord)<<' ';
            }
            std::cout << std::endl;
            std::cout << std::endl;
        }
        else{
            std::cout << "Test " << t << " passed\n";
        }
    }

    return 0;
}
