# em++ -O0 --profiling-funcs cpp/wrapper.cpp cpp/pathfinder/kdtree.cpp -o build/wasmPlanners.js -Wall -s EXPORT_ALL=1 -s WASM=1 -s STANDALONE_WASM -s TOTAL_MEMORY=4000MB -lembind
em++ -O0 --profiling-funcs cpp/wrapper.cpp -o build/wasmPlanners.js -Wall -s EXPORT_ALL=1 -s WASM=1 -s STANDALONE_WASM -s TOTAL_MEMORY=4000MB -lembind -g 
# -g allows chrome wasm debugging