class BFS extends GridPathfinder{
  // Unifinished

	static get display_name(){ return "Breadth-First-Search"; }

  infoMapPlannerMode(){ return "BFS"; }

  static get indexOfCollapsiblesToExpand(){ return [0, 1, 2, 3]; }

  static get pseudoCode() {
    return {
      code: 'def astar(map, start_vertex, goal_vertex): \nlist = OpenList() \npath = [ ] \n#Initialise h-cost for all \nfor vertex in map.vertices(): \n    vertex.set_h_cost(goal_vertex)  \n    vertex.g_cost = ∞  \n    vertex.visited = False \n  # Assign 0 g-cost to start_vertex  \n start_vertex.g_cost = 0 \n list.add(start_vertex) \n while list.not_empty(): \n  current_vertex = list.remove() \n  # Skip if visited: a cheaper path  \n  # was already found \n    if current_vertex.visited: \n      continue \n   # Trace back and return the path if at the goal \n   if current_vertex is goal_vertex : \n     while current_vertex is not None: \n      path.push(current_vertex) \n      current_vertex = current_vertex.parent \n     return path # exit the function \n  # Add all free, neighboring vertices which \n   # are cheaper, into the list  \n  for vertex in get_free_neighbors(map, current_vertex):  \n      # f or h-costs are not checked bcos obstacles \n     # affects the optimal path cost from the g-cost \n     tentative_g = calc_g_cost(vertex, current_vertex)  \n     if tentative_g < vertex.g_cost: \n       vertex.g_cost = tentative_g  \n      vertex.parent = current_vertex  \n      list.add(vertex) \nreturn path',
      reference: ""
    }
  }

  static get hoverData(){
    return [
      {id: "hoverCellVisited", displayName: "Times Visited", type: "canvasCache", canvasId: "visited"},
    ];
  }

  get canvases(){
    let canvases = super.canvases.concat([
    ])
    if(this.bigMap){
      canvases = canvases.filter(conf => conf.bigMap);
    }
    return canvases;
  }

  static get configs(){
		let configs = GridPathfinder.configs;
		return configs;
  }

  constructor(num_neighbors = 8, diagonal_allow = true, first_neighbor = "N", search_direction = "anticlockwise") {
    super(num_neighbors, diagonal_allow, first_neighbor, search_direction);
  }

  setConfig(uid, value){
    switch(uid){
      default:
        super.setConfig(uid, value);
    }
  }

  search(start, goal) {
    // this method finds the path using the prescribed map, start & goal coordinates
    this._init_search(start, goal);
		this.closed_list =  new Empty2D(this.map_height, this.map_width);
		this.open_list =  new Empty2D(this.map_height, this.map_width);

    console.log("starting");
    
    // starting node
    this.current_node = new Node(0, 0, 0, null, this.start, undefined, 0);
    
    this.queue.push(this.current_node);  // begin with the start; add starting node to rear of []
    if(!this.bigMap){

      // initialize the starting sequences
      this.deltaNWSE.slice().reverse().forEach(item=>
        this._create_action({command: STATIC.InsertRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: -1, infoTableRowData: [item, "?", "?"]})
      );

      // for every node that is pushed onto the queue, it should be added to the queue infotable
      this._create_action({command: STATIC.InsertRowAtIndex, dest: this.dests.ITQueue, infoTableRowIndex: 1, infoTableRowData: [start.join(", "), '-']});
      this._create_action({command: STATIC.DrawPixel, dest: this.dests.queue, nodeCoord: start});
      this._save_step(true);
    }

    this.open_list.set(this.current_node.self_XY, this.current_node);
    //---------------------checks if visited 2d array has been visited
    let planner = this;

    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search(planner, planner.batch_size)), planner.batch_interval);
    });
  }

  _run_next_search(planner, num) {
    function A_star_cmp(a, b){
      if(Math.abs(a.f_cost-b.f_cost)<0.000001){
        if(myUI.planner.hOptimized)
          return a.h_cost-b.h_cost;
      }
      return a.f_cost > b.f_cost;
    }
    while (num--) {
      // while there are still nodes left to visit
      if (this.queue.length == 0) return this._terminate_search();

      if(this.bigMap) this.queue.sort(A_star_cmp);
      
      this.current_node = this.queue.shift(); // remove the first node in queue
      this.current_node_XY = this.current_node.self_XY; // first node in queue XY
      this.open_list.set(this.current_node_XY, undefined); // remove from open list

      if(this.step_index % 10000==0) console.log(`F: ${this.current_node.f_cost.toPrecision(5)}, H: ${this.current_node.h_cost.toPrecision(5)}`);
      
      /* first check if visited */
      if (this.closed_list.get(this.current_node_XY) && this.closed_list.get(this.current_node_XY).f_cost <= this.current_node.f_cost){
        continue;  // if the current node has been visited, skip to next one in queue
      }/* */
      
			this.closed_list.set(this.current_node_XY, this.current_node);

      this._create_action({command: STATIC.IncrementPixel, dest: this.dests.visited, nodeCoord: this.current_node_XY});
      
      if(!this.bigMap){
        for(const i of this.neighborsIndex){
          this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: -(i+1), infoTableRowData: [this.deltaNWSE[i], "?", "?", "?", "?", "?"]})
        }
        this._create_action({command: STATIC.EraseRowAtIndex, dest: this.dests.ITQueue, infoTableRowIndex: 1});
        //this._create_action({command: STATIC.EraseCanvas, dest: this.dests.focused, nodeCoord: this.current_node_XY});
        this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.focused, nodeCoord: this.current_node_XY});
        this._create_action({command: STATIC.EraseCanvas, dest: this.dests.neighbors});
        this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.expanded, nodeCoord: this.current_node_XY});
        this._create_action({command: STATIC.ErasePixel, dest: this.dests.queue, nodeCoord: this.current_node_XY});
        this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 12});
      }
      this._save_step(true);

      this._assign_cell_index(this.current_node_XY);

      /* FOUND GOAL */
      if(this._found_goal(this.current_node)) return this._terminate_search(); // found the goal & exits the loop

      let cardinalCoords = this.getCardinalCoords();

      /* iterates through the 4 or 8 neighbors and adds the valid (passable & within boundaries of map) ones to the queue & neighbour array */
      for(const i of this.neighborsIndex){
        var next_XY = [this.current_node_XY[0] + this.delta[i][0], this.current_node_XY[1] + this.delta[i][1]];  // calculate the coordinates for the new neighbour
        if (next_XY[0] < 0 || next_XY[0] >= this.map_height || next_XY[1] < 0 || next_XY[1] >= this.map_width){
          if(!this.bigMap) this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], next_XY.join(", "), 'inf', 'inf', 'inf', "Out of Bounds"]});
          continue;  // if the neighbour not within map borders, don't add it to queue
        }

        if(!this.bigMap){
          this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.focused, nodeCoord: next_XY});
        }
        
        if(!this._nodeIsNeighbor(next_XY, this.deltaNWSE[i], cardinalCoords)){
          if(!this.bigMap){
            // records the neighbor as a obstacle
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], next_XY.join(", "), 'inf', 'inf', 'inf', "Obstacle"]});
            this._save_step(false);
          }
          continue;
        }

        let new_node = this.calc_cost(next_XY);
        let f_cost = new_node.f_cost;
        let g_cost = new_node.g_cost;
        let h_cost = new_node.h_cost;
        
        let open_node = this.open_list.get(next_XY);
        if(open_node !== undefined && open_node.f_cost<=f_cost){
          if(!this.bigMap){
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], next_XY.join(", "), f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Not a child"]});
            this._save_step(false);
          }
          continue; // do not add to queue if open list already has a lower cost node
        }
        let closed_node = this.closed_list.get(next_XY);
        if(closed_node !== undefined && closed_node.f_cost<=f_cost){
          if(!this.bigMap){
            if(this.current_node.parent.self_XY[0] == next_XY[0] && this.current_node.parent.self_XY[1] == next_XY[1])
              this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], next_XY.join(", "), f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Parent"]});  //  a parent must be visited already
            else
              this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], next_XY.join(", "), f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Not a child"]});
          }

          // increment after visiting a node on the closed list
          this._create_action({command: STATIC.IncrementPixel, dest: this.dests.visited, nodeCoord: next_XY});
          this._save_step(false);
          continue; // do not add to queue if closed list already has a lower cost node
        }

        this._create_action({command: STATIC.SetPixelValue, dest: this.dests.fCost, nodeCoord: next_XY, anyVal: f_cost});
        this._create_action({command: STATIC.SetPixelValue, dest: this.dests.gCost, nodeCoord: next_XY, anyVal: g_cost});
        this._create_action({command: STATIC.SetPixelValue, dest: this.dests.hCost, nodeCoord: next_XY, anyVal: h_cost});

        // add to queue 
        if(this.timeOrder=="FIFO") this.queue.push(new_node); // FIFO
        else this.queue.unshift(new_node); // LIFO
        this.open_list.set(next_XY, new_node);  // add to open list
        
        // since A* is a greedy algorithm, it requires visiting of nodes again even if it has already been added to the queue
        // see https://www.geeksforgeeks.org/a-search-algorithm/
        
        if(!this.bigMap){
          
          this._create_action({command: STATIC.DrawPixel, dest: this.dests.neighbors, nodeCoord: next_XY});
          this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 32});
          this._handleArrow(next_XY, new_node, open_node, closed_node);

          this._create_action({command: STATIC.DrawPixel, dest: this.dests.queue, nodeCoord: next_XY});

          this.queue.sort(A_star_cmp);

          // counts the number of nodes that have a lower F-Cost than the new node
          // to find the position to add it to the queue
          let numLess = 0;
          while(this.queue[numLess] != new_node) numLess++;
          
          this._create_action({command: STATIC.InsertRowAtIndex, dest: this.dests.ITQueue, infoTableRowIndex: numLess+1, infoTableRowData: [next_XY[0]+','+next_XY[1], this.current_node_XY[0]+','+this.current_node_XY[1], parseFloat(f_cost.toPrecision(5)), parseFloat(g_cost.toPrecision(5)), parseFloat(h_cost.toPrecision(5))]});
          
          if(open_node===undefined && closed_node===undefined) 
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], next_XY.join(", "), parseFloat(f_cost.toPrecision(5)), parseFloat(g_cost.toPrecision(5)), parseFloat(h_cost.toPrecision(5)), "New encounter"]});
          else// if(open_node || closed_node)
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], next_XY.join(", "), parseFloat(f_cost.toPrecision(5)), parseFloat(g_cost.toPrecision(5)), parseFloat(h_cost.toPrecision(5)), "Replace parent"]});

        }
        this._save_step(false);

        if(this._found_goal(new_node)) return this._terminate_search();
      }
      // continue to next node in queue
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search(planner, planner.batch_size)), planner.batch_interval);
    });
  }
}
