#include "pathfinder.cpp"
#include <set>
#include <vector>

auto comp = [](Node* n1, Node* n2){
  return n1->fCost > n2->fCost;
};


int main(){
  std::set<Node*, decltype(comp)> s;

  Node a(0, 0, NULL, 0, 13.5, 0, 0);
  Node b(0, 0, NULL, 0, 29, 0, 0);
  Node c(0, 0, NULL, 0, 20, 0, 0);
  Node d(0, 0, NULL, 0, 45, 0, 0);

  s.insert(&a);
  s.insert(&b);
  s.insert(&c);
  s.insert(&d);
  std::cout<<(*s.lower_bound(&a))->fCost<<std::endl;
  std::cout<<std::distance(s.lower_bound(&a), s.begin())<<std::endl;
  while(!s.empty()){
    std::cout<<(*s.begin())->fCost<<std::endl;
    s.erase(s.begin());
  }
}