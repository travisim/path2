#include "helper.hpp"
#ifndef PURE_CPP
#include <emscripten.h>
#include <emscripten/bind.h>

std::vector<uint8_t> js1DtoVect1D(const emscripten::val &js1D){
  unsigned int len = js1D["length"].as<unsigned int>();
  std::vector<uint8_t> vec(len);
  for(int i = 0; i < len; ++i){
    vec[i] = js1D[i].as<uint8_t>();
  }
  return vec;
}

grid_t js2DtoVect2D(const emscripten::val &js2D){
  unsigned int len = js2D["length"].as<unsigned int>();
  grid_t grid(len);
  for(int i = 0; i < len; ++i){
    grid[i] = js1DtoVect1D(js2D[i].as<emscripten::val>());
  }
  return grid;
}

#endif

void vectDigitPrint(std::vector<uint8_t> v){
  unsigned char* s = (unsigned char*)malloc(v.size() * 2 + 1);
  int i = 0;
  for(auto it : v){
    s[i++] = (char)(it + 48);
    s[i++] = ' ';
  }
  s[i] = '\0';
  std::cout<<s<<std::endl;
  free(s);
}