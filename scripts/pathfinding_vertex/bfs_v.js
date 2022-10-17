'use strict';

class BFS_Vertex extends GridPathFinder {

  static get display_name() {
    return "Breadth-First Search (BFS) (Vertex)";
  }

  constructor(num_neighbors = 8, diagonal_allow = true, first_neighbour = "N", search_direction = "anticlockwise") {
    super(num_neighbors, diagonal_allow, first_neighbour, search_direction);
    this.vertexEnabled = true;
  }

  infoMapPlannerMode(){
    return "BFS_vertex"
  }

  search(start, goal) {
    // this method finds the path using the prescribed map, start & goal coordinates
    this._init_search(start, goal);

    console.log("starting");
    let start_node = new Node(null, null, null, null, start);
    //var found = false;  // once the program exits the while-loop, this is the variable which determines if the endpoint has been found
    /* ^ deprecated, used a this.path variable to assign */
    this.queue.push(start_node);  // begin with the start; add starting node to rear of []
    //---------------------checks if visited 2d array has been visited

    let planner = this;

    // "Producing Code" (May take some time)
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search(planner, planner.batch_size)), planner.batch_interval);
    });
  }

  _run_next_search(planner, num) {
    while (num--) {
      // while there are still nodes left to visit
      if (this.queue.length == 0) return this._terminate_search();
      if (this.current_node_XY)
        this.prev_node_XY = this.current_node_XY;
      this.current_node = this.queue.shift(); // remove the first node in queue
      this.current_node_XY = this.current_node.self_XY; // first node in queue XY

      /* first check if visited */
      if (this.visited.get_data(this.current_node_XY)>0){
        this.visited.increment(this.current_node_XY);
        this.visited_incs.push(this.current_node_XY);
        continue;  // if the current node has been visited, skip to next one in queue
      }/* */
      this.visited.increment(this.current_node_XY); // marks current node XY as visited

      /* NEW */
      
      this._create_action({command: STATIC.EC, dest: STATIC.CR});
      this._create_action({command: STATIC.EC, dest: STATIC.NB});
      this._create_action({command: STATIC.DP, dest: STATIC.CR, nodeCoord: this.current_node_XY});
      this._create_action({command: STATIC.DI, dest: STATIC.ICR, nodeCoord: this.current_node_XY});
      this._create_action({command: STATIC.INC_P, dest: STATIC.VI, nodeCoord: this.current_node_XY});
      this._create_action({command: STATIC.EP, dest: STATIC.QU, nodeCoord: this.current_node_XY});
      this.visited_incs.forEach(coord=>this._create_action({command: STATIC.INC_P, dest: STATIC.VI, nodeCoord: coord}));
      this._save_step("fwd");

      this.visited_incs = []; // reset visited_incs after adding them
      
      /* FOUND GOAL */
      if(this._found_goal(this.current_node)) return this._terminate_search(); // found the goal & exits the loop

      // NOTE, a node is only visited if all its neighbors have been added to the queue
      this.neighbors_XY = [];  // reset the neighbors for each new node

      var surrounding_map_deltaNWSE = [];
      for (let i = 0; i < this.num_neighbors; ++i) {
        var next_XY_temp = [this.current_node_XY[0] + this.delta[i][0], this.current_node_XY[1] + this.delta[i][1]];
        if (next_XY_temp[0] < 0 || next_XY_temp[0] >= this.map_height || next_XY_temp[1] < 0 || next_XY_temp[1] >= this.map_width) continue;
        if(this.map.get_data(next_XY_temp) == 1) surrounding_map_deltaNWSE.push(this.deltaNWSE[i]);
      }

      /* iterates through the 4 or 8 neighbors and adds the valid (passable & within boundaries of map) ones to the queue & neighbour array */
      for (let i = 0; i < this.num_neighbors; ++i) {
        var next_XY = [this.current_node_XY[0] + this.delta[i][0], this.current_node_XY[1] + this.delta[i][1]];  // calculate the coordinates for the new neighbour
        if (next_XY[0] < 0 || next_XY[0] >= this.map_height || next_XY[1] < 0 || next_XY[1] >= this.map_width) continue;  // if the neighbour not within map borders, don't add it to queue

        // THIS PART CHECKS IF A NEIGHBOUR IS PASSABLE OR NOT
        /*
          1) Assumes that borders of the map are traversable
        */

        if(next_XY[0]!=this.current_node_XY[0] && next_XY[1]!=this.current_node_XY[1]){
          // diagonal crossing
          // consider [Math.min(next_XY[0], this.current_node_XY[0]), Math.min(next_XY[1], this.current_node_XY[1])];
          let coord = [Math.min(next_XY[0], this.current_node_XY[0]), Math.min(next_XY[1], this.current_node_XY[1])];
          if(this.map.get_data(coord)==0) continue; // not passable
        }
        else{
          // cardinal crossing
          if(next_XY[0]!=this.current_node_XY[0]){
            // consider [Math.min(next_XY[0], this.current_node_XY[0]), next_XY[1]]
            // consider [Math.min(next_XY[0], this.current_node_XY[0]), next_XY[1]-1]
            var c1 =  [Math.min(next_XY[0], this.current_node_XY[0]), next_XY[1]];
            var c2 = [Math.min(next_XY[0], this.current_node_XY[0]), next_XY[1]-1];
          }
          else{
            // consider [next_XY[0], Math.min(next_XY[1], this.current_node_XY[1])]
            // consider [next_XY[0]-1, Math.min(next_XY[1], this.current_node_XY[1])] 
            var c1 = [next_XY[0], Math.min(next_XY[1], this.current_node_XY[1])];
            var c2 = [next_XY[0]-1, Math.min(next_XY[1], this.current_node_XY[1])];
          }
          if(this.map.get_data(c1)==0 && this.map.get_data(c2)==0) continue; // not passable
        }
        
        // neighbour is passable

        /* second check if visited */
        if (this.visited.get_data(next_XY)>0) {
          this.visited_incs.push(next_XY);
          this.visited.increment(next_XY);
        }
        if (this.visited.get_data(next_XY) || this.queue_matrix[next_XY[0]][next_XY[1]]) continue; // if the neighbour has been visited or is already in queue, don't add it to queue

        //this.info_matrix[next_XY[0]][next_XY[1]]={parent: this.current_node_XY};

        this.neighbors_XY.push(next_XY);  // add to neighbors, only need XY as don't need to search parents

        this._create_action({command: STATIC.DP, dest: STATIC.NB, nodeCoord: next_XY});

        let nextNode = new Node(null, null, null, this.current_node, next_XY);

        if (!this.queue_matrix[next_XY[0]][next_XY[1]]) { // prevent from adding to queue again
          this.queue.push(nextNode);  // add to queue
          //this._create_action(STATIC.DP, STATIC.QU, next_XY);
          this._create_action({command: STATIC.DP, dest: STATIC.QU, nodeCoord: next_XY});
          if (this.draw_arrows) {
            // ARROW
            var arrow_index = myUI.create_arrow(next_XY, this.current_node_XY, true);
            this.arrow_state[arrow_index] = 1;
            nextNode.arrow_index = arrow_index;
            //myUI.draw_arrow(next_XY,  this.current_node_XY, true, 0, false);  // draw arrows backwards; point to parent
            //this._create_action(STATIC.DA, arrow_index);
            this._create_action({command: STATIC.DA, arrowIndex: arrow_index});
            // END OF ARROW
          }
          this.queue_matrix[next_XY[0]][next_XY[1]] = 1;
        }
        this._save_step(false);

        /* FOUND GOAL */
        if(this._found_goal(nextNode)) return this._terminate_search(); // found the goal & exits the loop
      }

      this._assign_cell_index(this.current_node_XY);

      this._manage_state();
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search(planner, planner.batch_size)), planner.batch_interval);
    });
  }
}