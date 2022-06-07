'use strict'; 

class A_star extends GridPathFinder{

	static get display_name(){
		return "A star";
	}

  constructor(num_neighbours = 8, diagonal_allow = true, first_neighbour = "N", search_direction = "anticlockwise") {
    super(num_neighbours, diagonal_allow, first_neighbour, search_direction);
  }

  search(start, goal) {
    // this method finds the path using the prescribed map, start & goal coordinates
    this._init_search(start, goal);

    console.log("starting");
    let start_node = new Node(0, 0, 0, null, this.start);
    //var found = false;  // once the program exits the while-loop, this is the variable which determines if the endpoint has been found
    /* ^ deprecated, used a this.path variable to assign */
    this.queue.push(start_node);  // begin with the start; add starting node to rear of []
    //---------------------checks if visited 2d array has been visited

    let planner = this;
    this.batch_size = 500;
    this.batch_interval = 0;

    return new Promise((resolve, reject)=>{
      setTimeout(()=>resolve(planner._run_next_search(planner, planner.batch_size)), planner.batch_interval);
    });
   }

  _run_next_search(planner, num){
    while(num--){
      let step_fwd;
      let step_bck;
      // while there are still nodes left to visit
      if(this.queue.length==0) return this._terminate_search();
                  //++ from bfs.js
      this.queue.sort(function (a, b){return a.f_cost - b.f_cost});   
               //++ from bfs.js
      
      if (this.current_node_YX)
        this.prev_node_YX = this.current_node_YX;
      this.current_node = this.queue.shift(); // remove the first node in queue
      this.current_node_YX = this.current_node.self_YX; // first node in queue YX

      this._create_step();
      this._create_action(STATIC.SIMPLE);
      this._create_action(STATIC.EC, STATIC.CR);
      this._create_action(STATIC.EC, STATIC.NB);
      this._create_action(STATIC.DP, STATIC.CR, this.current_node_YX);
      this._create_action(STATIC.DP, STATIC.VI, this.current_node_YX);
      this._create_action(STATIC.EP, STATIC.QU, this.current_node_YX);
      this._save_step("fwd");

      this._create_step();
      this._create_action(STATIC.SIMPLE);
      this._create_action(STATIC.EC, STATIC.CR);
      this._create_action(STATIC.EP, STATIC.VI, this.current_node_YX);
      this._create_action(STATIC.DP, STATIC.QU, this.current_node_YX);
      if (this.prev_node_YX) {
        this._create_action(STATIC.DP, STATIC.CR, this.prev_node_YX);
        this.neighbours.forEach(neighbour => {
          this._create_action(STATIC.DP, STATIC.NB, neighbour.self_YX);
        });
      }
      this._save_step("bck");

      /* first check if visited */
      if (this.visited.get_data(this.current_node_YX)) this.visited.increment(this.current_node_YX);
      if (this.visited.get_data(this.current_node_YX)) return //continue; // if the current node has been visited, skip to next one in queue]
      this.visited.set_data(this.current_node_YX, 1); // marks current node YX as visited
      /* FOUND GOAL */
      if (this.current_node_YX[0] == this.goal[0] && this.current_node_YX[1] == this.goal[1]) {  // found the goal & exits the loop
        var path = [];
        var curr = this.current_node;
        // retraces the entire parent tree until start is found
        while (curr != null) {
          //console.log(curr.self_YX); 
          path.unshift(curr.self_YX);
          curr = curr.parent;
        }

        //creates array starting from start to goal
        console.log("found");
        this.path = path;

        /* NEW */

        this._create_step();
        this._create_action(STATIC.SIMPLE);
        this._create_action(STATIC.EC, STATIC.CR);
        this.path.forEach(yx=>this._create_action(STATIC.DP, STATIC.PA, yx));
        this._save_step("fwd");

        this._create_step();
        this._create_action(STATIC.SIMPLE);
        this._create_action(STATIC.EC, STATIC.PA);
        this._create_action(STATIC.DP, STATIC.CR, this.current_node_YX);
        this._save_step("bck");

        this._create_step();
        this._create_action(STATIC.SIMPLE);
        this._save_step("fwd");

        this._create_step();
        this._create_action(STATIC.SIMPLE);
        this._save_step("bck");
        return this._terminate_search()
      }
      // NOTE, a node is only visited if all its neighbours have been added to the queue
      this.neighbours = [];  // reset the neighbours for each new node
      //console.log("next");

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
        if (this.visited.get_data(next_YX)>0) this.visited.increment(next_YX);
        if (this.visited.get_data(next_YX)) continue; // if the neighbour has been visited, don't add it to queue
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

         // start to a node, taking into account obstacles
          var g_cost = this.current_node.g_cost + ((this.current_node.self_YX[0]-next_YX[0])**2+(this.current_node.self_YX[1]-next_YX[1])**2)**0.5//euclidean //++ from bfs.js
        //var g_cost = this.current_node.g_value + (math.abs(this.current_node.node_YX[0]-next_YX[0])+math.abs(this.current_node.node_YX[1]-next_YX[1]))//manhatten //++ from bfs.js

          var h_cost = ((this.goal[0]-next_YX[0])**2+(this.goal[1]-next_YX[1])**2)**0.5
        //var h_cost = (math.abs(this.goal[0]-next_YX[0])+math.abs(this.goal[1]-next_YX[1]))

          var f_cost = g_cost + h_cost //++ from bfs.js
          
					
          
          var next_node = new Node(f_cost, g_cost, h_cost, this.current_node, next_YX);  // create a new node with said neighbour's details
          this.neighbours.push(next_node);  // add to neighbours

          /* NEW */
          this._create_step();
          this._create_action(STATIC.DP, STATIC.NB, next_YX);
          if (!this.queue_matrix[next_YX[0]][next_YX[1]]){ // prevent from adding to queue again
            this.queue.push(next_node);  // add to queue
            this._create_action(STATIC.DP, STATIC.QU, next_YX);
            if(this.draw_arrows){
              // ARROW
              ++this.arrow_step;
              myUI.create_arrow(this.current_node_YX , next_YX);
              this._create_action(STATIC.DA);
              // END OF ARROW
            }
          }
          this._save_step("fwd");

          this._create_step();
          this._create_action(STATIC.EP, STATIC.NB, next_YX);
          if (!this.queue_matrix[next_YX[0]][next_YX[1]]){
            this.queue_matrix[next_YX[0]][next_YX[1]] = 1;  // add to matrix marker
            this._create_action(STATIC.EP, STATIC.QU, next_YX);
            if(this.draw_arrows) this._create_action(STATIC.EA);
          }
          this._save_step("bck");
        }
      }

      this._assign_cell_index(this.current_node_YX);

      this._manage_state();
    }
    return new Promise((resolve, reject)=>{
      setTimeout(()=>resolve(planner._run_next_search(planner, planner.batch_size)),  planner.batch_interval);
    });
  }

  _terminate_search(){
    clearTimeout(this.search_timer);
    if (this.path == null) console.log("path does not exist");
    this.searched = true;
    return this.path;
  }
}