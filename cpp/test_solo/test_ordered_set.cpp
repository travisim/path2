#include "A_star.hpp"
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>

// Define our ordered_set type
using ordered_set = __gnu_pbds::tree<Node*, __gnu_pbds::null_type, PQCompare, __gnu_pbds::rb_tree_tag, __gnu_pbds::tree_order_statistics_node_update>;

double generate_f_cost(){
  double d = (double)rand()/(double)RAND_MAX * 100;
  std::cout<<d<<std::endl;
  return d;
}

int main(){

  // Create an instance of our ordered_set
  double THRESH = 1e-9;
  bool hOptimized = true;
  ordered_set mySet(PQCompare(THRESH, hOptimized));

  std::vector<Node*> ptrs;
  // Insert nodes into the set
  for(int i = 0; i < 10; ++i){
    Node *a = new Node(0, 0, nullptr, 0, generate_f_cost(), 0.0, 1.0);
    ptrs.push_back(a);
    mySet.insert(a);
  }

  srand(time(NULL));
  int i = floor((double)rand()/(double)RAND_MAX * (ptrs.size() - 1));

  // Find the order/position of n1 in the set
  size_t order = mySet.order_of_key(ptrs[i]);
  std::cout<<"\nPrinting fCost now"<<std::endl;
  for(auto it : mySet){
    std::cout<<it->fCost()<<std::endl;
  }
  std::cout<<"n1 has fCost value of "<<ptrs[i]->fCost()<<std::endl;

  std::cout << "n1 is at position " << order << " in the set" << std::endl;
  for(auto ptr : ptrs) free(ptr);
}
