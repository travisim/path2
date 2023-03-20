#include "A_star.hpp"
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>

// Define our ordered_set type
using ordered_multiset = __gnu_pbds::tree<Node*, __gnu_pbds::null_type, PQCompare, __gnu_pbds::rb_tree_tag,
    __gnu_pbds::tree_order_statistics_node_update>;

std::vector<int> v = {3,3,5,5,6,6,6,2,2,10};

double generate_f_cost(int i){
  std::cout<<v[i]<<' '<<10 - i<<std::endl;
  return v[i];
  double d = (double)rand()/(double)RAND_MAX * 100;
  std::cout<<d<<std::endl;
  return d;
}

int main(){

  // Create an instance of our ordered_set
  double THRESH = 1e-9;
  bool hOptimized = true;
  ordered_multiset mySet(PQCompare(THRESH, false, FIFO));

  std::vector<Node*> ptrs;
  // Insert nodes into the set
  for(int i = 0; i < 10; ++i){
    Node *a = new Node(0, 0, nullptr, 0, generate_f_cost(i), 0.0, 10-i);
    ptrs.push_back(a);
    mySet.insert(a);
  }
  
  Node *a = new Node(0, 0, nullptr, 0, generate_f_cost(0), 0.0, 10);
  ptrs.push_back(a);
  mySet.insert(a);

  srand(time(NULL));
  int i = 0;//floor((double)rand()/(double)RAND_MAX * (ptrs.size() - 1));

  // Find the order/position of n1 in the set
  std::cout<<"\nPrinting fCost & hCost now"<<std::endl;
  for(auto it : mySet){
    std::cout<<it->fCost<<' '<<it->hCost<<' '<<it->timeCreatedns<<std::endl;
  }
  
  size_t order = mySet.order_of_key(ptrs[i]);
  std::cout<<"index: "<<i<<", fCost: "<<ptrs[i]->fCost<<", hCost: "<<ptrs[i]->hCost<<", timeCreatedns: "<<ptrs[i]->timeCreatedns<<std::endl;

  std::cout << "n1 is at position " << order << " in the set" << std::endl;

  mySet.erase(mySet.begin());

  

  // Find the order/position of n1 in the set
  std::cout<<"\nPrinting fCost & hCost now"<<std::endl;
  for(auto it : mySet){
    std::cout<<it->fCost<<' '<<it->hCost<<' '<<it->timeCreatedns<<std::endl;
  }
  
  order = mySet.order_of_key(ptrs[i]);
  std::cout<<"index: "<<i<<", fCost: "<<ptrs[i]->fCost<<", hCost: "<<ptrs[i]->hCost<<", timeCreatedns: "<<ptrs[i]->timeCreatedns<<std::endl;

  std::cout << "n1 is at position " << order << " in the set" << std::endl;

  for(auto ptr : ptrs) free(ptr);
}
