#include "pathfinder.cpp"
#include <queue>
#include <vector>

auto comp = [](Node* n1, Node* n2){
  return n1->fCost > n2->fCost;
};


int main(){
  std::priority_queue<Node*, std::vector<Node*>, decltype(comp)> pq;

  Node* a = new Node(0, 0, NULL, 0, 13.5, 0, 0);
  Node* b = new Node(0, 0, NULL, 0, 29, 0, 0);
  Node* c = new Node(0, 0, NULL, 0, 20, 0, 0);
  Node* d = new Node(0, 0, NULL, 0, 45, 0, 0);

  pq.push(a);
  pq.push(b);
  pq.push(c);
  pq.push(d);
  while(!pq.empty()){
    std::cout<<pq.top()->fCost<<std::endl;
    pq.pop();
  }
}