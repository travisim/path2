#include <iostream>
#include <memory>

struct Node {
    int data;
    Node* next;
};

void traverseList(const Node*& head) {
    const Node* current = head.get(); // get a pointer to the head node
    while (current) {
        std::cout << current->data << " ";
        current = current->next.get(); // get a pointer to the next node
    }
}

int main() {
    Node* head = new Node();
    head->data = 1;
    head->next = new Node();
    head->next->data = 2;
    head->next->next = new Node();
    head->next->next->data = 3;

    traverseList(head);

    return 0;
}
