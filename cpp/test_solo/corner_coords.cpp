#include "../pathfinder/helper.hpp"

struct Preset {
  std::vector<std::vector<int>> data;
  std::vector<coordInt_t> coords;
  friend std::ostream &operator<<(std::ostream &os, const Preset &p){
    os<<p.data.size()<<' '<<p.data[0].size()<<' '<<p.data[0][0]<<std::endl;
    os<<p.coords.size()<<std::endl;
    return os;
  }
};

std::vector<coordInt_t> cornerCoords(grid_t& gridObj, int kernelSize, int startX, int startY, bool vertex = true) {
  constexpr int N = -1;
  std::cout<<"STARTING CORNERCOORDS\n";
  auto checkAgainstPresets = [&](const std::vector<Preset>& presets) {
    std::cout<<"CHECKING PRESETS\n";
    for (const auto& preset : presets) {
      std::cout<<preset;
      std::cout<<"Preset data: "<<preset.data[0][0]<<std::endl;
      for (int i = 0; i < kernelSize; ++i) {
        std::cout<<"ENTERED FIRST LOOP\n";
        for (int j = 0; j < kernelSize; ++j) {
          std::cout<<"ENTERED SECOND LOOP\n";
          if (preset.data[i][j] == N) continue; // skip for null
          if (preset.data[i][j] != gridObj[i + startX][j + startY]) {
            goto presetLoop;
          }
        }
      }
      return preset.coords;
      presetLoop:;
    }
    return std::vector<coordInt_t>(); // empty vector to represent null
  };

  if (kernelSize == 2) {
    std::cout<<"KERNEL SIZE: 2\n";
    if (vertex) {
      std::cout<<"VERTEX\n";
      int cnt = 0;
      for (int i = startX; i < startX + kernelSize; ++i) {
        for (int j = startY; j < startY + kernelSize; ++j) {
          if (gridObj[i][j]) cnt++;
        }
      }
      if (cnt == 3) return {{startX + 1, startY + 1}};
    } else {
      std::cout<<"CELL\n";
      std::vector<Preset> presets = {
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

  return std::vector<coordInt_t>(); // empty vector to represent null
}

int main(){

  grid_t grid = {{0,1},{1,1}};
  for(auto p : cornerCoords(grid, 2, 0, 0, false)) std::cout<<p.first<<' '<<p.second<<std::endl;

  return 0;
}