em++ -O0 --profiling-funcs cpp/wrapper.cpp -o build/A_star.js -Wall -s EXPORT_ALL=1 -s WASM=1 -s STANDALONE_WASM -s TOTAL_MEMORY=4000MB -lembind