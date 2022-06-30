'use strict';

class BFS extends GridPathFinder {

  static get display_name() {
    return "Breadth-First Search (BFS)";
  }

  constructor(num_neighbours = 8, diagonal_allow = true, first_neighbour = "N", search_direction = "anticlockwise") {
    super(num_neighbours, diagonal_allow, first_neighbour, search_direction);
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
      if (this.current_node_YX)
        this.prev_node_YX = this.current_node_YX;
      this.current_node = this.queue.shift(); // remove the first node in queue
      this.current_node_YX = this.current_node.self_YX; // first node in queue YX

      this._create_step();
      this._create_action(STATIC.SIMPLE);
      this._create_action(STATIC.EC, STATIC.CR);
      this._create_action(STATIC.EC, STATIC.NB);
      this._create_action(STATIC.DP, STATIC.CR, this.current_node_YX);
      this._create_action(STATIC.DI, STATIC.ICR, this.current_node_YX);
      //this._create_action(STATIC.DP, STATIC.VI, this.current_node_YX);
      this._create_action(STATIC.INC_P, STATIC.VI, this.current_node_YX);
      this._create_action(STATIC.EP, STATIC.QU, this.current_node_YX);
      this.visited_incs.forEach(coord=>this._create_action(STATIC.INC_P, STATIC.VI, coord));
      this._save_step("fwd");

      this._create_step();
      this._create_action(STATIC.SIMPLE);
      this._create_action(STATIC.EC, STATIC.CR);
      this._create_action(STATIC.EP, STATIC.VI, this.current_node_YX);
      //this._create_action(STATIC.DEC_P, STATIC.VI, this.current_node_YX);
      this._create_action(STATIC.DP, STATIC.QU, this.current_node_YX);
      if (this.prev_node_YX) {
        this._create_action(STATIC.DP, STATIC.CR, this.prev_node_YX);
        this._create_action(STATIC.DI,STATIC.ICR, this.prev_node_YX);
        this.neighbours_YX.forEach(coord => {
          this._create_action(STATIC.DP, STATIC.NB, coord);
        });
      }
      this.visited_incs.forEach(coord=>this._create_action(STATIC.DEC_P, STATIC.VI, coord));
      this._save_step("bck");

      this.visited_incs = []; // reset visited_incs after adding them

      /* first check if visited */
      if (this.visited.get_data(this.current_node_YX)) this.visited.increment(this.current_node_YX);
      if (this.visited.get_data(this.current_node_YX)) continue; // if the current node has been visited, skip to next one in queue
      this.visited.set_data(this.current_node_YX, 1); // marks current node YX as visited
      /* FOUND GOAL */
      if(this._found_goal(this.current_node)) return this._terminate_search(); // found the goal & exits the loop

      // NOTE, a node is only visited if all its neighbours have been added to the queue
      this.neighbours_YX = [];  // reset the neighbours for each new node

      var surrounding_map_deltaNWSE = [];
      for (let i = 0; i < this.num_neighbours; ++i) {
        var next_YX_temp = [this.current_node_YX[0] + this.delta[i][0], this.current_node_YX[1] + this.delta[i][1]];
        if (next_YX_temp[0] < 0 || next_YX_temp[0] >= this.map_height || next_YX_temp[1] < 0 || next_YX_temp[1] >= this.map_width) continue;
        if (this.map[next_YX_temp[0]][next_YX_temp[1]] == 1) {
          surrounding_map_deltaNWSE.push(this.deltaNWSE[i]);
        }
      }

      /* iterates through the 4 or 8 neighbours and adds the valid (passable & within boundaries of map) ones to the queue & neighbour array */
      for (let i = 0; i < this.num_neighbours; ++i) {
        var next_YX = [this.current_node_YX[0] + this.delta[i][0], this.current_node_YX[1] + this.delta[i][1]];  // calculate the coordinates for the new neighbour
        if (next_YX[0] < 0 || next_YX[0] >= this.map_height || next_YX[1] < 0 || next_YX[1] >= this.map_width) continue;  // if the neighbour not within map borders, don't add it to queue
        /* second check if visited */
        
        if (this.visited.get_data(next_YX)>0) {
          this.visited_incs.push(next_YX);
          this.visited.increment(next_YX);
        }
        if (this.visited.get_data(next_YX) || this.queue_matrix[next_YX[0]][next_YX[1]] > 0) continue; // if the neighbour has been visited or is already in queue, don't add it to queue
        if (this.map[next_YX[0]][next_YX[1]] == 1) {  // if neighbour is passable & not visited
          if (this.diagonal_allow == true && this.num_neighbours == 8) {
            if (this.deltaNWSE[i] == "NW") {
              if (!(surrounding_map_deltaNWSE.includes("N") || surrounding_map_deltaNWSE.includes("W"))) {
                continue;
              }
            }
            else if (this.deltaNWSE[i] == "SW") {
              if (!(surrounding_map_deltaNWSE.includes("S") || surrounding_map_deltaNWSE.includes("W"))) {
                continue;
              }
            }
            else if (this.deltaNWSE[i] == "SE") {
              if (!(surrounding_map_deltaNWSE.includes("S") || surrounding_map_deltaNWSE.includes("E"))) {
                continue;
              }
            }
            else if (this.deltaNWSE[i] == "NE") {
              if (!(surrounding_map_deltaNWSE.includes("N") || surrounding_map_deltaNWSE.includes("E"))) {
                continue;
              }
            }
          }
          this.info_matrix[next_YX[0]][next_YX[1]]={parent: this.current_node_YX};

          this.neighbours_YX.push(next_YX);  // add to neighbours, only need YX as don't need to search parents

          /* NEW */
          this._create_step();
          this._create_action(STATIC.DP, STATIC.NB, next_YX);
          this._create_action(STATIC.DI, this.deltaNWSE_STATICS[i], next_YX, null,null,this.current_node_YX);
  
          if (!this.queue_matrix[next_YX[0]][next_YX[1]]) { // prevent from adding to queue again
            this.queue.push(new Node(null, null, null, this.current_node, next_YX));  // add to queue
            this._create_action(STATIC.DP, STATIC.QU, next_YX);
            if (this.draw_arrows) {
              // ARROW
              ++this.arrow_step;
              myUI.create_arrow(next_YX, this.current_node_YX);
						  //myUI.draw_arrow(next_YX,  this.current_node_YX, true, 0, false);  // draw arrows backwards; point to parent
              this._create_action(STATIC.DA);
              // END OF ARROW
            }
          }
          this._save_step("fwd");

          this._create_step();
          this._create_action(STATIC.EP, STATIC.NB, next_YX);
          this._create_action(STATIC.EI, this.deltaNWSE_STATICS[i], next_YX, null,null,this.current_node_YX);
          if (!this.queue_matrix[next_YX[0]][next_YX[1]]) {
            this.queue_matrix[next_YX[0]][next_YX[1]] = 1;  // add to matrix marker
            this._create_action(STATIC.EP, STATIC.QU, next_YX);
            if (this.draw_arrows) this._create_action(STATIC.EA);
          }
          this._save_step("bck");
        }
      }

      this._assign_cell_index(this.current_node_YX);

      this._manage_state();
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search(planner, planner.batch_size)), planner.batch_interval);
    });
  }
}