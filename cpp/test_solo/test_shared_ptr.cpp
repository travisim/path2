#include <iostream>
#include <memory>
#include <vector>

struct Node {
  int data;
};

void f1(std::vector<Node*>& v, Node* &node_ptr) {
  // Do something with node_ptr
  node_ptr->data = 42;
  v.push_back(node_ptr);
  std::cout<<node_ptr.use_count()<<std::endl;
}

void f2(std::vector<Node*>& v, Node* &node_ptr) {
  if(node_ptr == v[0]) std::cout<<"YES\n";
  else std::cout<<"NO\n";
}

int main() {
  std::vector<Node*> v;
  Node* node_ptr = new Node();
  node_ptr->data = 10;

  f1(v, node_ptr);
  f2(v, node_ptr);

  std::cout << node_ptr->data << std::endl; // Output: 42

  return 0;
}