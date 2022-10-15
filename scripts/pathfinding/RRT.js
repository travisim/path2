// derived from https://cs.brown.edu/courses/cs148/documents/asgn3_planning/btcohen/index.html 
EPSILON = max length of an edge in the tree;
K = max number of nodes in the tree;

rrt(start,end){
	startNode = new Node at start;
	startTree = new RRTree(startNode);
	endNode = new Node at end;
	endTree = new RRTree(endNode);

	return makePath(startTree,endTree);	
}

makePath(t1,t2){
	qRandom = new Node at random location;
	qNear = nearest node to qRandom in t1;
	qNew = new Node EPSILON away from qNear
			in direction of qRandom;

	t1.add(qNew);
	if(there's a path from qNew to the closest node in t2){
		path = path from qNew to root of t1;
		path.append(path from qNew to root of t2);
		return path;
	}else if(size(t1) < K){
		return makePath(t2,t1);
	}else{
		return FAIL;
	}
}

relaxPath(path){
	newPath = new Path;
	currForward = first node in path;
	while(currForward <= end of path){
		newPath.append(currForward);
		currBackward = last node in path;
		while(currBackward != currForward && !relaxationFound){
			if(there is a clear path from currBackward to currForward)
				relaxationFound = true;
			else
				currBackward--;
		}
		if(relaxationFound)
			currForward = currBackward;
		else
			currForward++;
	}
	return newPath;
}

//tree data structure
// from https://www.30secondsofcode.org/articles/s/js-data-structures-tree
class TreeNode {
  constructor(key, value = key, parent = null) {
    this.key = key;
    this.value = value;
    this.parent = parent;
    this.children = [];
  }

  get isLeaf() {
    return this.children.length === 0;
  }

  get hasChildren() {
    return !this.isLeaf;
  }
}

class Tree {
  constructor(key, value = key) {
    this.root = new TreeNode(key, value);
  }

  *preOrderTraversal(node = this.root) {
    yield node;
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.preOrderTraversal(child);
      }
    }
  }

  *postOrderTraversal(node = this.root) {
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.postOrderTraversal(child);
      }
    }
    yield node;
  }

  insert(parentNodeKey, key, value = key) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === parentNodeKey) {
        node.children.push(new TreeNode(key, value, node));
        return true;
      }
    }
    return false;
  }

  remove(key) { // chope the branch child onwards
    for (let node of this.preOrderTraversal()) {
      const filtered = node.children.filter(c => c.key !== key);
      if (filtered.length !== node.children.length) {
        node.children = filtered;
        return true;
      }
    }
    return false;
  }

  find(key) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === key) return node;
    }
    return undefined;
  }
}