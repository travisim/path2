//
//  main.cpp
//  CPWorkSpace
//
//  Created by Rajveer Singh on 23/09/21.
//

#include <iostream>
#include <algorithm>
#include <set>
#include <unordered_set>
#include <vector>
#include <string>
#include <time.h>
#include <chrono>
#include <array>
#include <random>
#include <ctime>
#include <numeric>
#include <iomanip>
#include <queue>
#include <map>
#include <unordered_map>
#include <numeric>
#include <cstring>

#include "node.hpp"
#include "enums.hpp"

#ifndef RBT_HPP
#define RBT_HPP

namespace pathfinder
{

  // MARK:- PRACTICE
  typedef long long ll;

  enum colour
  {
    red,
    black
  };

  struct RBTNode
  {

    Node* data;
    ll size;
    bool colour;
    RBTNode *parent, *left, *right;
    ~RBTNode()
    {
      if (left)
        delete left;
      if (right)
        delete right;
    }
  };

  class RedBlackTree
  {

    RBTNode *root, *tNil;
    bool hOptimized = true;
    double THRESH = 1e-8;
    timeOrder order;

    bool less(const Node* n1, const Node* n2) const
    {
      // lower fCost will be first
      if (std::abs(n1->fCost - n2->fCost) >= THRESH)
        return n1->fCost < n2->fCost;

      // lower hCost will be first
      if (hOptimized && std::abs(n1->hCost - n2->hCost) >= THRESH)
        return n1->hCost < n2->hCost;

      // lower timeCreated will be first (inserted earlier)
      if (order == FIFO)
        return n1->timeCreatedns < n2->timeCreatedns;
      else
        return n1->timeCreatedns > n2->timeCreatedns;
    }

    RBTNode *findRBTNode(RBTNode *z)
    {

      RBTNode *x = this->root;

      while (x != tNil)
      {

        if (x->data == z->data)
        {

          return x;
        }
        else if (less(z->data, x->data))
        {

          x = x->left;
        }
        else
        {

          x = x->right;
        }
      }

      return tNil;
    }

    RBTNode *findMin(RBTNode *z)
    {

      while (z->left != tNil)
      {

        z = z->left;
      }

      return z;
    }

    void leftRotate(RBTNode *x)
    {

      if (x->right == tNil)
      {

        return;
      }

      RBTNode *y = x->right;
      x->right = y->left;

      if (y->left != tNil)
      {

        y->left->parent = x;
      }

      y->parent = x->parent;

      if (x->parent == tNil)
      {

        this->root = y;
      }
      else if (x == x->parent->left)
      {

        x->parent->left = y;
      }
      else
      {

        x->parent->right = y;
      }

      y->left = x;
      x->parent = y;
      y->size = x->size;
      x->size = x->left->size + x->right->size + 1;
    }

    void rightRotate(RBTNode *y)
    {

      if (y->left == tNil)
      {

        return;
      }

      RBTNode *x = y->left;
      y->left = x->right;

      if (x->right != tNil)
      {

        x->right->parent = y;
      }

      x->parent = y->parent;

      if (y->parent == tNil)
      {

        this->root = x;
      }
      else if (y == y->parent->right)
      {

        y->parent->right = x;
      }
      else
      {

        y->parent->left = x;
      }

      x->right = y;
      y->parent = x;
      x->size = y->size;
      y->size = y->left->size + y->right->size + 1;
    }

    void insertFixUp(RBTNode *z)
    {

      while (z->parent->colour == red)
      {

        if (z->parent == z->parent->parent->left)
        {

          RBTNode *y = z->parent->parent->right;

          if (y->colour == red)
          {

            z->parent->colour = black;
            y->colour = black;

            if (z->parent->parent != this->root)
            {

              z->parent->parent->colour = red;
            }
            z = z->parent->parent;
          }
          else
          {

            if (z == z->parent->right)
            {

              z = z->parent;
              leftRotate(z);
            }

            z->parent->colour = black;
            z->parent->parent->colour = red;
            rightRotate(z->parent->parent);
          }
        }
        else
        {

          RBTNode *y = z->parent->parent->left;

          if (y->colour == red)
          {

            z->parent->colour = black;
            y->colour = black;

            if (z->parent->parent != this->root)
            {

              z->parent->parent->colour = red;
            }
            z = z->parent->parent;
          }
          else
          {

            if (z == z->parent->left)
            {

              z = z->parent;
              rightRotate(z);
            }

            z->parent->colour = black;
            z->parent->parent->colour = red;
            leftRotate(z->parent->parent);
          }
        }
      }
    }

    void insertRBTNode(RBTNode *z)
    {

      if (this->root == tNil)
      {

        z->colour = black;
        this->root = z;
        this->root->size = 1;
        return;
      }

      RBTNode *y = tNil, *x = this->root;

      while (x != tNil)
      {

        y = x;
        x->size++;

        if (less(z->data, x->data))
        {

          x = x->left;
        }
        else
        {

          x = x->right;
        }
      }

      z->parent = y;

      if (less(z->data, y->data))
      {

        y->left = z;
      }
      else
      {

        y->right = z;
      }

      insertFixUp(z);
    }

    void transplant(RBTNode *u, RBTNode *v)
    {

      if (u->parent == tNil)
      {

        this->root = v;
      }
      else if (u == u->parent->left)
      {

        u->parent->left = v;
      }
      else
      {

        u->parent->right = v;
      }
      v->parent = u->parent;
    }

    void deleteFixUp(RBTNode *x)
    {

      while (x != this->root && x->colour == black)
      {

        if (x == x->parent->left)
        {

          RBTNode *w = x->parent->right;

          if (w->colour == red)
          {

            w->colour = black;
            x->parent->colour = red;
            leftRotate(x->parent);

            w = x->parent->right;
          }

          if (w->left->colour == black && w->right->colour == black)
          {

            w->colour = red;
            x = x->parent;
          }
          else
          {

            if (w->right->colour == black)
            {

              w->left->colour = black;
              w->colour = red;
              rightRotate(w);

              w = x->parent->right;
            }

            w->colour = x->parent->colour;
            x->parent->colour = red;
            w->right->colour = black;
            leftRotate(x->parent);
            x = this->root;
          }
        }
        else
        {

          RBTNode *w = x->parent->left;

          if (w->colour == red)
          {

            w->colour = black;
            x->parent->colour = red;
            rightRotate(x->parent);

            w = x->parent->left;
          }

          if (w->right->colour == black && w->left->colour == black)
          {

            w->colour = red;
            x = x->parent;
          }
          else
          {

            if (w->left->colour == black)
            {

              w->right->colour = black;
              w->colour = red;
              leftRotate(w);

              w = x->parent->left;
            }

            w->colour = x->parent->colour;
            x->parent->colour = red;
            w->left->colour = black;
            rightRotate(x->parent);
            x = this->root;
          }
        }
      }
      x->colour = black;
    }

    void deleteRBTNode(RBTNode *z)
    {

      RBTNode *y = z, *x;
      bool originalColour = y->colour;

      if (z->left == tNil)
      {

        x = z->right;
        transplant(z, z->right);
      }
      else if (z->right == tNil)
      {

        x = z->left;
        transplant(z, z->left);
      }
      else
      {

        y = findMin(z->right);
        originalColour = y->colour;

        x = y->right;

        if (y->parent == z)
        {

          x->parent = y;
        }
        else
        {

          transplant(y, y->right);
          y->right = z->right;
          y->right->parent = y;

          RBTNode *s = x->parent;

          while (s != tNil && s != y)
          {

            s->size--;
            s = s->parent;
          }
        }

        transplant(z, y);

        y->left = z->left;
        y->left->parent = y;
        y->colour = z->colour;

        y->size = y->left->size + y->right->size + 1;
      }

      if (originalColour == black)
      {

        deleteFixUp(x);
      }
    }

    void inOrderHelper(RBTNode *RBTNode)
    {

      if (RBTNode == tNil)
      {

        return;
      }

      inOrderHelper(RBTNode->left);

      std::cout << *(RBTNode->data) << " ";

      inOrderHelper(RBTNode->right);
    }

  public:
    RedBlackTree(double THRESH = 1e-8, bool hOptimized = true, timeOrder order = FIFO) : THRESH(THRESH), hOptimized(hOptimized), order(order)
    {

      tNil = new RBTNode();
      tNil->colour = black;
      tNil->size = 0;

      tNil->left = tNil;
      tNil->right = tNil;
      tNil->parent = tNil;

      this->root = tNil;
    }

    RBTNode *getRoot()
    {

      return this->root;
    }

    RBTNode *minimum(RBTNode *node)
    {
      while (node->left != tNil)
      {
        node = node->left;
      }
      return node;
    }

    Node* minimumVal()
    {
      return minimum(getRoot())->data;
    }

    RBTNode *find(Node* node)
    {

      RBTNode *z = new RBTNode();

      z->data = node;

      return findRBTNode(z);
    }

    void insert(Node* node)
    {

      RBTNode *z = new RBTNode();
      z->data = node;
      z->colour = red;
      z->size = 1;

      z->left = tNil;
      z->right = tNil;
      z->parent = tNil;

      insertRBTNode(z);
    }

    void erase(Node* node)
    {

      RBTNode *z = find(node);

      if (z == tNil)
      {

        return;
      }

      RBTNode *s = z->parent;

      while (s != tNil)
      {

        s->size--;
        s = s->parent;
      }

      deleteRBTNode(z);
    }

    Node* osSelect(RBTNode *x, ll i)
    {

      ll r = x->left->size + 1;

      if (i == r)
      {

        return x->data;
      }
      else if (i < r)
      {

        return osSelect(x->left, i);
      }
      else
      {

        return osSelect(x->right, i - r);
      }
    }

    ll osRank(RBTNode *x)
    {

      ll r = x->left->size + 1;

      RBTNode *y = x;

      while (y != this->root)
      {

        if (y == y->parent->right)
        {

          r += y->parent->left->size + 1;
        }
        y = y->parent;
      }

      return r;
    }

    void clear()
    {
      delete this->root;
      this->root = tNil;
    }

    bool empty()
    {
      return this->root == tNil;
    }

    void inOrder()
    {

      inOrderHelper(this->root);
    }
  };

}

#endif