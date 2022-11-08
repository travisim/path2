class A_star_big_maps extends GridPathFinder{

	static get display_name(){
		return "A star (optimized)";
  }
  infoMapPlannerMode(){
    return "A_star";
  }
  
  static get distance_metrics(){
    return ["Octile", "Euclidean", "Manhattan", "Chebyshev"];
  }

  get configs(){
		let configs = super.configs;
		configs.push({uid: "distance_metric", displayName: "Distance Metric:", options: ["Octile", "Manhattan", "Euclidean", "Chebyshev"], description: `The metrics used for calculating distances.<br>Octile is commonly used for grids which allow movement in 8 directions. It sums the maximum number of diagonal movements, with the residual cardinal movements.<br>Manhattan is used for grids which allow movement in 4 cardinal directions. It sums the absolute number of rows and columns (all cardinal) between two cells.<br>Euclidean takes the L2-norm between two cells, which is the real-world distance between two points. This is commonly used for any angle paths.<br>Chebyshev is the maximum cardinal distance between the two points. It is taken as max(y2-y1, x2-x1) where x2>=x1 and y2>=y1.
`},
      {uid: "g_weight", displayName: "G-Weight:", options: "number", defaultVal: 1, description: `Coefficient of G-cost when calculating the F-cost. Setting G to 0 and H to positive changes this to the greedy best first search algorithm.`},
      {uid: "h_weight", displayName: "H-Weight:", options: "number", defaultVal: 1, description: `Coefficient of H-cost when calculating the F-cost. Setting H to 0 and G to positive changes this to Dijkstra's algorithm.`},
      {uid: "h_optimized", displayName: "H-optimized:", options: ["On", "Off"], description: `For algorithms like A* and Jump Point Search, F-cost = G-cost + H-cost. This has priority over the time-ordering option.<br> If Optimise is selected, when retrieving the cheapest vertex from the open list, the vertex with the lowest H-cost among the lowest F-cost vertices will be chosen. This has the effect of doing a Depth-First-Search on equal F-cost paths, which can be faster.<br> Select Vanilla to use their original implementations`},  
      {uid: "time_ordering", displayName: "Time Ordering:", options: ["LIFO", "FIFO"], description: `When sorting a vertex into the open-list or unvisited-list and it has identical cost* to earlier entries, select: <br>FIFO to place the new vertex behind the earlier ones, so it comes out after them<br> LIFO to place the new vertex in front of the earlier ones, so it comes out before them.<br>* cost refers to F-cost & H-cost, if F-H-Cost Optimisation is set to "Optimise", otherwise it is the F-cost for A*, G-cost for Dijkstra and H-cost for GreedyBestFirst)`});
		return configs;
  }

  constructor(num_neighbors = 8, diagonal_allow = true, first_neighbour = "N", search_direction = "anticlockwise") {
    super(num_neighbors, diagonal_allow, first_neighbour, search_direction);
  }

  setConfig(uid, value){
		super.setConfig(uid, value);
    switch(uid){
      case "distance_metric":
				this.distance_metric = value;
        break;
      case "g_weight":
				this.gWeight = value;
        break;
      case "h_weight":
				this.hWeight = value;
        break;
      case "h_optimized":
				this.hOptimized = value=="On";
        break;
      case "time_ordering":
				this.timeOrder = value;
        break;
    }
  }

  set_distance_metric(metric){
    this.distance_metric = metric;
  }
  
  calc_cost(successor){
    function manhattan(c1, c2){
      return Math.abs(c1[0]-c2[0]) + Math.abs(c1[1]-c2[1]);
    }

    function euclidean(c1, c2){
      return Math.hypot(c1[0]-c2[0], c1[1]-c2[1]);
    }
    
    function chebyshev(c1, c2){
      return Math.max(Math.abs(c1[0]-c2[0]), Math.abs(c1[1]-c2[1]));
    }

    function octile(c1, c2){
      var dx = Math.abs(c1[0]-c2[0]);
      var dy =  Math.abs(c1[1]-c2[1]);
      return Math.min(dx, dy)*Math.SQRT2 + Math.abs(dy-dx);
    }

    if(this.distance_metric == "Manhattan"){
      var g_cost = this.current_node.g_cost + manhattan(this.current_node.self_XY, successor);
      var h_cost = manhattan(successor, this.goal);
    }
    else if(this.distance_metric == "Euclidean"){
      var g_cost = this.current_node.g_cost + euclidean(this.current_node.self_XY, successor);
      var h_cost = euclidean(successor, this.goal);
    }
    else if(this.distance_metric == "Chebyshev"){
      var g_cost = this.current_node.g_cost + chebyshev(this.current_node.self_XY, successor);
      var h_cost = chebyshev(successor, this.goal);
    }
    else if(this.distance_metric == "Octile"){
      var g_cost = this.current_node.g_cost + octile(this.current_node.self_XY, successor);
      var h_cost = octile(successor, this.goal);
    }

    var f_cost = this.gWeight*g_cost + this.hWeight*h_cost;//++ from bfs.js
    return [f_cost, g_cost, h_cost];
  }

  search(start, goal) {
    // this method finds the path using the prescribed map, start & goal coordinates
    this._init_search(start, goal);
		this.closed_list =  new Empty2D(this.map_height, this.map_width);
		this.open_list =  new Empty2D(this.map_height, this.map_width);
    // "Producing Code" (May take some time)

    console.log("starting");

    this.current_node = new Node(0, 0, 0, null, this.start, undefined, 0);
    [this.current_node.f_cost, this.current_node.g_cost, this.current_node.h_cost] = this.calc_cost(this.current_node.self_XY);
    this.queue.push(this.current_node);  // begin with the start; add starting node to rear of []
    //this._create_action({command: STATIC.InsertRowAtIndex, dest: STATIC.ITQueue, infoTableRowIndex: 1, infoTableRowData: [start[0]+','+start[1], '-', parseFloat(this.current_node.f_cost.toPrecision(5)), parseFloat(this.current_node.g_cost.toPrecision(5)), parseFloat(this.current_node.h_cost.toPrecision(5))]});
    //this._create_action({command: STATIC.DP, dest: STATIC.QU, nodeCoord: start});
    //this._save_step(true);

    this.open_list.set(this.current_node.self_XY, this.current_node);
    //---------------------checks if visited 2d array has been visited
    let planner = this;

    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search(planner, planner.batch_size)), planner.batch_interval);
    });
  }

  _run_next_search(planner, num) {
    while (num--) {
      // while there are still nodes left to visit
      if (this.queue.length == 0) return this._terminate_search();
           //++ from bfs.js
      this.queue.sort(function (a, b){
        if(Math.abs(a.f_cost-b.f_cost)<0.000001){
					if(myUI.planner.hOptimized)
          	return a.h_cost-b.h_cost;
        }
        return a.f_cost-b.f_cost;
      });   
      //++ from bfs.js

      this.current_node = this.queue.shift(); // remove the first node in queue
      this.current_node_XY = this.current_node.self_XY; // first node in queue XY
      this.open_list[this.current_node_XY] = undefined;

      if(this.step_index % 100==0) console.log(`F: ${this.current_node.f_cost.toPrecision(5)}, H: ${this.current_node.h_cost.toPrecision(5)}`);
      
      /* first check if visited */
      if (this.visited.get_data(this.current_node_XY)>0){
        //this.visited.increment(this.current_node_XY);
        //this.visited_incs.push(this.current_node_XY);
        continue;  // if the current node has been visited, skip to next one in queue
      }/* */
      this.visited.increment(this.current_node_XY); // marks current node XY as visited
      
      //this._create_action({command: STATIC.EraseRowAtIndex, dest: STATIC.ITQueue, infoTableRowIndex: 1});
      //this._create_action({command: STATIC.DSP, dest: STATIC.DT, nodeCoord: this.current_node_XY});
      //this._create_action({command: STATIC.EC, dest: STATIC.CR});
      //this._create_action({command: STATIC.EC, dest: STATIC.NB});
      //this._create_action({command: STATIC.DP, dest: STATIC.CR, nodeCoord: this.current_node_XY});
      this._create_action({command: STATIC.INC_P, dest: STATIC.VI, nodeCoord: this.current_node_XY});
      //this._create_action({command: STATIC.EP, dest: STATIC.QU, nodeCoord: this.current_node_XY});
      //this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: STATIC.PC, pseudoCodeRow: 12});
      this.visited_incs.forEach(coord=>this._create_action({command: STATIC.INC_P, dest: STATIC.VI, nodeCoord: coord}));
      this._save_step(true);

      /* FOUND GOAL */
      if(this._found_goal(this.current_node)) return this._terminate_search(); // found the goal & exits the loop

      this.visited_incs = []; // reset visited_incs after adding them

      // NOTE, a node is only visited if all its neighbors have been added to the queue
      this.neighbors = [];
      var surrounding_map_deltaNWSE = [];
      for (let i = 0; i < this.num_neighbors; ++i) {
        var next_XY_temp = [this.current_node_XY[0] + this.delta[i][0], this.current_node_XY[1] + this.delta[i][1]];
        if (next_XY_temp[0] < 0 || next_XY_temp[0] >= this.map_height || next_XY_temp[1] < 0 || next_XY_temp[1] >= this.map_width) continue;
        if(this.map.get_data(next_XY_temp) == 1) surrounding_map_deltaNWSE.push(this.deltaNWSE[i]);
      }
			// removed //this.deltaNWSE_STATICS_Temp = [];//temporarily stores the deltaNWSE_STATICS_Temp to allow display of neighbors if stepping backwards from a current node to previous node
      /* iterates through the 4 or 8 neighbors and adds the valid (passable & within boundaries of map) ones to the queue & neighbour array */
      for (let i = 0; i < this.num_neighbors; ++i) {
        var next_XY = [this.current_node_XY[0] + this.delta[i][0], this.current_node_XY[1] + this.delta[i][1]];  // calculate the coordinates for the new neighbour
        if (next_XY[0] < 0 || next_XY[0] >= this.map_height || next_XY[1] < 0 || next_XY[1] >= this.map_width) continue;  // if the neighbour not within map borders, don't add it to queue
        
        if (this.map.get_data(next_XY) == 1) {  // if neighbour is passable
          if (this.diagonal_allow == false && this.num_neighbors == 8) { // if neighbour is not blocked
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

          /* second check if visited */
          if (this.visited.get_data(next_XY)>0) {
            this.visited_incs.push(next_XY);
            this.visited.increment(next_XY);
            continue;  // if the neighbour has been visited or is already in queue, don't add it to queue
          }

          // start to a node, taking into account obstacles
          let [f_cost, g_cost, h_cost] = this.calc_cost(next_XY);
          
          
          let new_node = new Node(f_cost, g_cost, h_cost, this.current_node, next_XY, undefined, this.step_index);
					let open_node = this.open_list.get(next_XY);
					if(open_node !== undefined) if(open_node.f_cost<=f_cost) continue;
					let closed_node = this.closed_list.get(next_XY);
					if(closed_node !== undefined) if(closed_node.f_cost<=f_cost) continue; // do not add to queue if closed list already has a lower cost node
          this.neighbors.unshift(new_node);

          this._create_action({command: STATIC.SP, dest: STATIC.FCanvas, nodeCoord: next_XY, cellVal: f_cost});
          this._create_action({command: STATIC.SP, dest: STATIC.GCanvas, nodeCoord: next_XY, cellVal: g_cost});
          this._create_action({command: STATIC.SP, dest: STATIC.HCanvas, nodeCoord: next_XY, cellVal: h_cost});

          /* NEW */
          
          //this._create_action({command: STATIC.EC, dest: STATIC.DT});
          //this._create_action({command: STATIC.DSP, dest: STATIC.DT, nodeCoord: next_XY});
          //this._create_action({command: STATIC.DP, dest: STATIC.NB, nodeCoord: next_XY});
          //this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: STATIC.PC, pseudoCodeRow: 32});

					// since A* is a greedy algorithm, it requires visiting of nodes again even if it has already been added to the queue
					// see https://www.geeksforgeeks.org/a-search-algorithm/
					if (this.draw_arrows) {
						// ARROW
            if(open_node!==undefined){ // need to remove the previous arrow drawn and switch it to the new_node
              //this._create_action(STATIC.EA, open_node.arrow_index);
              //this._create_action({command: STATIC.EA, arrowIndex: open_node.arrow_index});
              this.arrow_state[open_node.arrow_index] = 0;
            }
            if(closed_node!==undefined){ // need to remove the previous arrow drawn and switch it to the new_node
              //this._create_action(STATIC.EA, closed_node.arrow_index);
              //this._create_action({command: STATIC.EA, arrowIndex: closed_node.arrow_index});
              this.arrow_state[closed_node.arrow_index] = 0;
            }
            //new_node.arrow_index = myUI.create_arrow(next_XY, this.current_node_XY); // node is reference typed so properties can be modified after adding to queue or open list
            this.arrow_state[new_node.arrow_index] = 1;
						//this._create_action(STATIC.DA, new_node.arrow_index);
           // this._create_action({command: STATIC.DA, arrowIndex: new_node.arrow_index, colorIndex: 0});
						// END OF ARROW
					}
          //this._create_action(STATIC.DP, STATIC.QU, next_XY);
          //this._create_action({command: STATIC.DP, dest: STATIC.QU, nodeCoord: next_XY});
          let numLess = 0;
          for(const node of this.queue){
            if(node.f_cost < new_node.f_cost) numLess++;
          }
          //this._create_action({command: STATIC.InsertRowAtIndex, dest: STATIC.ITQueue, infoTableRowIndex: numLess+1, infoTableRowData: [next_XY[0]+','+next_XY[1], this.current_node_XY[0]+','+this.current_node_XY[1], parseFloat(new_node.f_cost.toPrecision(5)), parseFloat(new_node.g_cost.toPrecision(5)), parseFloat(new_node.h_cost.toPrecision(5))]});
          // add to queue 
					if(this.timeOrder=="FIFO") this.queue.push(new_node); // FIFO
          else this.queue.unshift(new_node); // LIFO
					this.open_list.set(next_XY, new_node);  // add to open list
          this._save_step(false);

          if(this._found_goal(new_node)) return this._terminate_search();
        }
      }

			this.closed_list.set(this.current_node_XY, this.current_node);

      this._assign_cell_index(this.current_node_XY);

      this._manage_state();
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search(planner, planner.batch_size)), planner.batch_interval);
    });
  }
}
