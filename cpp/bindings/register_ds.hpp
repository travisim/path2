#include <emscripten/bind.h>

#ifndef REGISTER_DS_HPP
#define REGISTER_DS_HPP

namespace emscripten_extensions{

  // register for unordered_map
  template<typename K, typename V, typename H = std::hash<K>>
  emscripten::class_<std::unordered_map<K, V, H>> register_unordered_map(const char* name) {
    typedef std::unordered_map<K,V,H> MapType;

    size_t (MapType::*size)() const = &MapType::size;
    return emscripten::class_<MapType>(name)
      .template constructor<>()
      .function("size", size)
      .function("get", emscripten::internal::MapAccess<MapType>::get)
      .function("set", emscripten::internal::MapAccess<MapType>::set)
      .function("keys", emscripten::internal::MapAccess<MapType>::keys)
      ;
  }

  // register for array
  template<typename T, int n>
  emscripten::class_<std::array<T, n>> register_array(const char* name) {
    typedef std::array<T, n> ArrType;
    return emscripten::class_<std::array<T, n>>(name)
      .template constructor<>()
      .function("get", &emscripten::internal::VectorAccess<ArrType>::get)
      .function("set", &emscripten::internal::VectorAccess<ArrType>::set)
      ;
  }
}

#endif