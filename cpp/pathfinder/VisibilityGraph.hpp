#include "pathfinder.hpp"
#include <vector>
#include <cstdint>

#ifndef VGRAPH_HPP
#define VGRAPH_HPP

#define CoordIntVector std::vector<coordInt_t>

struct Preset {
    std::vector<std::vector<int8_t>> data;
    CoordIntVector coords;
};

CoordIntVector cornerCoords(grid_t& gridObj, int kernelSize, int startX, int startY, bool vertex = true) {
    constexpr int8_t N = -1;

    auto checkAgainstPresets = [&](const std::vector<Preset>& presets) {
        for (const auto& preset : presets) {
            presetLoop:;
            for (int i = 0; i < kernelSize; ++i) {
                for (int j = 0; j < kernelSize; ++j) {
                    if (preset.data[i][j] == N) continue; // skip for null
                    if (preset.data[i][j] != gridObj[i + startX][j + startY]) {
                        goto presetLoop;
                    }
                }
            }
            return preset.coords;
        }
        return CoordIntVector(); // empty vector to represent null
    };

    if (kernelSize == 2) {
        if (vertex) {
            int cnt = 0;
            for (int i = startX; i < startX + kernelSize; ++i) {
                for (int j = startY; j < startY + kernelSize; ++j) {
                    if (gridObj[i][j]) cnt++;
                }
            }
            if (cnt == 3) return {{startX + 1, startY + 1}};
        } else {
            std::vector<Preset> presets = {
                // squares & L-shapes (centered)
                {
                    {{1, 1},
                     {1, 0}},
                    {{0, 0}}
                },
                {
                    {{1, 1},
                     {0, 1}},
                    {{0, 1}}
                },
                {
                    {{0, 1},
                     {1, 1}},
                    {{1, 1}}
                },
                {
                    {{1, 0},
                     {1, 1}},
                    {{1, 0}}
                }
            };

            return checkAgainstPresets(presets);
        }
    }

    return CoordIntVector(); // empty vector to represent null
}

#undef CoordIntVector


namespace pathfinder{
  template <typename Action_t>
  class VisibilityGraph : public Pathfinder<Action_t>{
    
  }
}

#endif