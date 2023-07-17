# em++ -O0 --profiling-funcs cpp/wrapper.cpp cpp/pathfinder/kdtree.cpp -o build/wasmPlanners.js -Wall -s EXPORT_ALL=1 -s WASM=1 -s STANDALONE_WASM -s TOTAL_MEMORY=4000MB -lembind


#if you wanna trto debug on chrome using wasm
em++ -O0 -g --profiling-funcs cpp/wrapper.cpp /Users/k/Downloads/cody/path/cpp/pathfinder/kdtree.cpp -o build/wasmPlanners.js -Wall -s EXPORT_ALL=1 -s WASM=1 -s STANDALONE_WASM -s TOTAL_MEMORY=4000MB -lembind -fdebug-compilation-dir=".."