#include <iostream>
#include <functional>
#include <utility>
#include <unordered_set>
#include <vector>
#include <chrono>

#include <algorithm>
#include <random>
#include <numeric> // std::iota

double randDouble(){
  const long max_rand = 1000000L;
 
  double lower_bound = 0;
  double upper_bound = 100;

    // Using random function to
    // get random double value
  double random_double = lower_bound
                          + (upper_bound - lower_bound)
                                * (random() % max_rand)
                                / max_rand;

  return random_double;
}

int main() {

  int64_t ins = 0, read = 0, del = 0;

  int reps = 30;
  
  for(int t = 1; t <= reps; ++t){
    struct CoordDoubleHash{
      std::size_t operator () (std::pair<double, double> const &pair) const
      {
        std::size_t h1 = std::hash<double>()(pair.first);
        std::size_t h2 = std::hash<double>()(pair.second);
        return h1 ^ h2;
      } 
    };

    srandom(time(NULL));

    using coord_t = std::pair<double, double>;
    std::unordered_set<coord_t, CoordDoubleHash> s;

    int num = 1e5;

    std::vector<coord_t> data(num);
    for (int i = 0; i < num; ++i) {
      data[i] = {randDouble(), randDouble()};
    }
    std::vector<coord_t> q(num);
    for (int i = 0; i < num; ++i) {
      q[i] = {randDouble(), randDouble()};
    }
    std::vector<int> d(num);
    std::iota(d.begin(), d.end(), 0);

    auto rng = std::default_random_engine {};
    std::shuffle(std::begin(d), std::end(d), rng);

    // Insert operation time complexity test
    auto start = std::chrono::high_resolution_clock::now();
    
    // Inserting elements into the unordered_set
    // You can modify this loop to insert different number of elements
    for (int i = 0; i < num; ++i) {
      s.insert(data[i]);
    }
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();
    ins += duration;
    
    std::cout << "Insertion time: " << duration << " milliseconds" << std::endl;

    std::vector<bool> finds(num);
    
    // Read operation time complexity test
    start = std::chrono::high_resolution_clock::now();
    
    for(int i = 0; i < num; ++i){
      bool b = s.find(q[i]) != s.end();
      finds[i] = b;
    }
    
    end = std::chrono::high_resolution_clock::now();
    duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();
    read += duration;
    
    std::cout << "Read time: " << duration << " milliseconds" << std::endl;
    
    // Delete operation time complexity test
    start = std::chrono::high_resolution_clock::now();
    
    // Deleting elements from the unordered_set
    // You can modify this loop to delete different number of elements
    for (int i = 0; i < num; ++i) {
      s.erase(data[d[i]]);
    }
    
    end = std::chrono::high_resolution_clock::now();
    duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();
    del += duration;
    
    std::cout << "Deletion time: " << duration << " milliseconds" << std::endl;

    std::cout << "Finished test " << t << std::endl;

  }

  std::cout<<"Average insertion: "<<ins / reps<<" read: "<<read / reps<<" deletion: "<<del / reps<<std::endl;

  return 0;
}
