class A_star extends GridPathFinder{

	static get display_name(){
		return "A star";
  }
  infoMapPlannerMode(){
    return "A_star";
  }
  static get indexOfCollapsiblesToExpand() {
    return [0,1, 2, 3, 4];
  }

  static get pseudoCode() {
    return {
      code: 'def astar(map, start_vertex, goal_vertex): \nlist = OpenList() \npath = [ ] \n#Initialise h-cost for all \nfor vertex in map.vertices(): \n    vertex.set_h_cost(goal_vertex)  \n    vertex.g_cost = ∞  \n    vertex.visited = False \n  # Assign 0 g-cost to start_vertex  \n start_vertex.g_cost = 0 \n list.add(start_vertex) \n while list.not_empty(): \n  current_vertex = list.remove() \n  # Skip if visited: a cheaper path  \n  # was already found \n    if current_vertex.visited: \n      continue \n   # Trace back and return the path if at the goal \n   if current_vertex is goal_vertex : \n     while current_vertex is not None: \n      path.push(current_vertex) \n      current_vertex = current_vertex.parent \n     return path # exit the function \n  # Add all free, neighboring vertices which \n   # are cheaper, into the list  \n  for vertex in get_free_neighbors(map, current_vertex):  \n      # f or h-costs are not checked bcos obstacles \n     # affects the optimal path cost from the g-cost \n     tentative_g = calc_g_cost(vertex, current_vertex)  \n     if tentative_g < vertex.g_cost: \n       vertex.g_cost = tentative_g  \n      vertex.parent = current_vertex  \n      list.add(vertex) \nreturn path',
      reference: ""
    }
  }
  
  static get distance_metrics(){
    return ["Octile", "Euclidean", "Manhattan", "Chebyshev"];
  }

  static get hoverData(){
    return [
      {id: "hoverCellVisited", displayName: "Times Visited", type: "canvasCache", canvasId: "visited"},
      {id: "hoverFCost", displayName: "F Cost", type: "canvasCache", canvasId: "fCost"},
      {id: "hoverGCost", displayName: "G Cost", type: "canvasCache", canvasId: "gCost"},
      {id: "hoverHCost", displayName: "H Cost", type: "canvasCache", canvasId: "hCost"},
    ];
  }

  get canvases(){
    let canvases = super.canvases.concat([
    
    
			{
				id:"fCost", drawType:"cell", drawOrder: 9, fixedResVal: 1024, valType: "float", defaultVal: Number.POSITIVE_INFINITY, colors:["#0FFF50", "#013220"], toggle: "multi", checked: false, bigMap: true, minVal: null, maxVal: null, infoMapBorder: false, infoMapValue: "F",
			},
			{
				id:"gCost", drawType:"cell", drawOrder: 10, fixedResVal: 1024, valType: "float", defaultVal: Number.POSITIVE_INFINITY, colors:["#0FFF50", "#013220"], toggle: "multi", checked: false, bigMap: true, minVal: null, maxVal: null, infoMapBorder: false, infoMapValue: "G",
			},
			{
				id:"hCost", drawType:"cell", drawOrder: 11, fixedResVal: 1024, valType: "float", defaultVal: Number.POSITIVE_INFINITY, colors:["#0FFF50", "#013220"], toggle: "multi", checked: false, bigMap: true, minVal: null, maxVal: null, infoMapBorder: false, infoMapValue: "H",
			},
    ])
    if(this.bigMap){
      canvases = canvases.filter(conf => conf.bigMap);
    }
    return canvases;
  }

  get configs(){
		let configs = super.configs;
		configs.push(
      {uid: "distance_metric", displayName: "Distance Metric:", options: ["Octile", "Manhattan", "Euclidean", "Chebyshev"], description: `The metrics used for calculating distances.<br>Octile is commonly used for grids which allow movement in 8 directions. It sums the maximum number of diagonal movements, with the residual cardinal movements.<br>Manhattan is used for grids which allow movement in 4 cardinal directions. It sums the absolute number of rows and columns (all cardinal) between two cells.<br>Euclidean takes the L2-norm between two cells, which is the real-world distance between two points. This is commonly used for any angle paths.<br>Chebyshev is the maximum cardinal distance between the two points. It is taken as max(y2-y1, x2-x1) where x2>=x1 and y2>=y1.`},
      {uid: "g_weight", displayName: "G-Weight:", options: "number", defaultVal: 1, description: `Coefficient of G-cost when calculating the F-cost. Setting G to 0 and H to positive changes this to the greedy best first search algorithm.`},
      {uid: "h_weight", displayName: "H-Weight:", options: "number", defaultVal: 1, description: `Coefficient of H-cost when calculating the F-cost. Setting H to 0 and G to positive changes this to Dijkstra's algorithm.`},
      {uid: "h_optimized", displayName: "H-optimized:", options: ["On", "Off"], description: `For algorithms like A* and Jump Point Search, F-cost = G-cost + H-cost. This has priority over the time-ordering option.<br> If Optimise is selected, when retrieving the cheapest vertex from the open list, the vertex with the lowest H-cost among the lowest F-cost vertices will be chosen. This has the effect of doing a Depth-First-Search on equal F-cost paths, which can be faster.<br> Select Vanilla to use their original implementations`},  
      {uid: "time_ordering", displayName: "Time Ordering:", options: ["FIFO", "LIFO"], description: `When sorting a vertex into the open-list or unvisited-list and it has identical cost* to earlier entries, select: <br>FIFO to place the new vertex behind the earlier ones, so it comes out after them<br> LIFO to place the new vertex in front of the earlier ones, so it comes out before them.<br>* cost refers to F-cost & H-cost, if F-H-Cost Optimisation is set to "Optimise", otherwise it is the F-cost for A*, G-cost for Dijkstra and H-cost for GreedyBestFirst)`});
		return configs;
  }

  constructor(num_neighbors = 8, diagonal_allow = true, first_neighbor = "N", search_direction = "anticlockwise") {
    super(num_neighbors, diagonal_allow, first_neighbor, search_direction);
    this.generateDests(); // call this in the derived class, not the base class because it references derived class properties (canvases, infotables)
  
    
  }

  setConfig(uid, value){
		super.setConfig(uid, value);
    switch(uid){
      case "distance_metric":
				this.distance_metric = value; break;
      case "g_weight":
				this.gWeight = Number(value); break;
      case "h_weight":
				this.hWeight = Number(value); break;
      case "h_optimized":
				this.hOptimized = value=="On"; break;
      case "time_ordering":
				this.timeOrder = value; break;
    }
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

    let chosen_parent = this.current_node;
    if(this.pick_parent) chosen_parent = this.pick_parent(successor);
    
    if(this.distance_metric == "Manhattan"){
      var g_cost = chosen_parent.g_cost + manhattan(chosen_parent.self_XY, successor);
      var h_cost = manhattan(successor, this.goal);
    }
    else if(this.distance_metric == "Euclidean"){
      var g_cost = chosen_parent.g_cost + euclidean(chosen_parent.self_XY, successor);
      var h_cost = euclidean(successor, this.goal);
    }
    else if(this.distance_metric == "Chebyshev"){
      var g_cost = chosen_parent.g_cost + chebyshev(chosen_parent.self_XY, successor);
      var h_cost = chebyshev(successor, this.goal);
    }
    else{// if(this.distance_metric == "Octile"){
      console.assert(this.distance_metric == "Octile", "Invalid distance metric provided!");
      var g_cost = chosen_parent.g_cost + octile(chosen_parent.self_XY, successor);
      var h_cost = octile(successor, this.goal);
    }

    var f_cost = this.gWeight*g_cost + this.hWeight*h_cost;//++ from bfs.js
    return new Node(f_cost, g_cost, h_cost, chosen_parent, successor, undefined, this.step_index);
  }

  search(start, goal) {
    // this method finds the path using the prescribed map, start & goal coordinates
    this._init_search(start, goal);
		this.closed_list =  new Empty2D(this.map_height, this.map_width);
		this.open_list =  new Empty2D(this.map_height, this.map_width);

    console.log("starting");
    
    // starting node
    this.current_node = new Node(0, 0, 0, null, this.start, undefined, 0);

    // assigns the F, G, H cost to the node
    this.current_node = this.calc_cost(this.start);

    
    this.queue.push(this.current_node);  // begin with the start; add starting node to rear of []
    if(!this.bigMap){

      // initialize the starting sequences
      this.deltaNWSE.slice().reverse().forEach(item=>
        this._create_action({command: STATIC.InsertRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: 1, infoTableRowData: [item, "?", "?", "?", "?", "?"]})
      );

      // for every node that is pushed onto the queue, it should be added to the queue infotable
      this._create_action({command: STATIC.InsertRowAtIndex, dest: this.dests.ITQueue, infoTableRowIndex: 1, infoTableRowData: [start[0]+','+start[1], '-', parseFloat(this.current_node.f_cost.toPrecision(5)), parseFloat(this.current_node.g_cost.toPrecision(5)), parseFloat(this.current_node.h_cost.toPrecision(5))]});
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
    while (num--) {
      // while there are still nodes left to visit
      if (this.queue.length == 0){
        console.log(`${Date.now() - myUI.startTime}ms`);
        return this._terminate_search();
      }

      if(this.bigMap){
        this.queue.sort(function (a, b){
          if(Math.abs(a.f_cost-b.f_cost)<0.000001){
            if(myUI.planner.hOptimized)
              return a.h_cost-b.h_cost;
          }
          return a.f_cost > b.f_cost;
        });
      }
      
      this.current_node = this.queue.shift(); // remove the first node in queue
      this.current_node_XY = this.current_node.self_XY; // first node in queue XY
      this.open_list.set(this.current_node_XY, undefined); // remove from open list

      if(this.step_index % 10000==0) console.log(`F: ${this.current_node.f_cost.toPrecision(5)}, H: ${this.current_node.h_cost.toPrecision(5)}`);
      
      /* first check if visited */
      if (this.closed_list.get(this.current_node_XY) && this.closed_list.get(this.current_node_XY).f_cost <= this.current_node.f_cost){
        continue;  // if the current node has been visited, skip to next one in queue
      }/* */
      
			this.closed_list.set(this.current_node_XY, this.current_node);

      //this.visited.increment(this.current_node_XY); // marks current node XY as visited
      this._create_action({command: STATIC.IncrementPixel, dest: this.dests.visited, nodeCoord: this.current_node_XY});
      
      if(!this.bigMap){
        for(const i of this.neighborsIndex){
          this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], "?", "?", "?", "?", "?"]})
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

      let cardinalCoords = {};
      if(this.diagonal_allow == false && this.num_neighbors == 8)
        for(let i = 0; i < this.num_neighbors; ++i)
          if(this.delta[i].includes(0))
            cardinalCoords[this.deltaNWSE[i]] = [this.current_node_XY[0] + this.delta[i][0], this.current_node_XY[1] + this.delta[i][1]];

      /* iterates through the 4 or 8 neighbors and adds the valid (passable & within boundaries of map) ones to the queue & neighbour array */
      for(const i of this.neighborsIndex){
        var next_XY = [this.current_node_XY[0] + this.delta[i][0], this.current_node_XY[1] + this.delta[i][1]];  // calculate the coordinates for the new neighbour
        if (next_XY[0] < 0 || next_XY[0] >= this.map_height || next_XY[1] < 0 || next_XY[1] >= this.map_width){
          if(!this.bigMap) this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], `${next_XY[0]}, ${next_XY[1]}`, 'inf', 'inf', 'inf', "Out of Bounds"]});
          continue;  // if the neighbour not within map borders, don't add it to queue
        }

        if(!this.bigMap){
          this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.focused, nodeCoord: next_XY});
        }
        
        if(!this._nodeIsNeighbor(next_XY, this.deltaNWSE[i], cardinalCoords)){
          if(!this.bigMap){
            // records the neighbor as a obstacle
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], `${next_XY[0]}, ${next_XY[1]}`, 'inf', 'inf', 'inf', "Obstacle"]});
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
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], `${next_XY[0]}, ${next_XY[1]}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Not a child"]});
            this._save_step(false);
          }
          continue; // do not add to queue if open list already has a lower cost node
        }
        let closed_node = this.closed_list.get(next_XY);
        if(closed_node !== undefined && closed_node.f_cost<=f_cost){
          if(!this.bigMap){
            if(this.current_node.parent.self_XY[0] == next_XY[0] && this.current_node.parent.self_XY[1] == next_XY[1])
              this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], `${next_XY[0]}, ${next_XY[1]}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Parent"]});  //  a parent must be visited already
            else
              this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], `${next_XY[0]}, ${next_XY[1]}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Not a child"]});
          }

          // increment after visiting a node on the closed list
          this._create_action({command: STATIC.IncrementPixel, dest: this.dests.visited, nodeCoord: next_XY});
          this._save_step(false);
          continue; // do not add to queue if closed list already has a lower cost node
        }

        this._create_action({command: STATIC.SetPixelValue, dest: this.dests.fCost, nodeCoord: next_XY, cellVal: f_cost});
        this._create_action({command: STATIC.SetPixelValue, dest: this.dests.gCost, nodeCoord: next_XY, cellVal: g_cost});
        this._create_action({command: STATIC.SetPixelValue, dest: this.dests.hCost, nodeCoord: next_XY, cellVal: h_cost});

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

          this.queue.sort(function (a, b){
            if(Math.abs(a.f_cost-b.f_cost)<0.000001){
              if(myUI.planner.hOptimized)
                return a.h_cost-b.h_cost;
            }
            return a.f_cost > b.f_cost;
          });

          // counts the number of nodes that have a lower F-Cost than the new node
          // to find the position to add it to the queue
          let numLess = 0;
          while(this.queue[numLess] != new_node) numLess++;
          
          this._create_action({command: STATIC.InsertRowAtIndex, dest: this.dests.ITQueue, infoTableRowIndex: numLess+1, infoTableRowData: [next_XY[0]+','+next_XY[1], this.current_node_XY[0]+','+this.current_node_XY[1], parseFloat(f_cost.toPrecision(5)), parseFloat(g_cost.toPrecision(5)), parseFloat(h_cost.toPrecision(5))]});
          
          if(open_node===undefined && closed_node===undefined) 
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], `${next_XY[0]}, ${next_XY[1]}`, parseFloat(f_cost.toPrecision(5)), parseFloat(g_cost.toPrecision(5)), parseFloat(h_cost.toPrecision(5)), "New encounter"]});
          else// if(open_node || closed_node)
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], `${next_XY[0]}, ${next_XY[1]}`, parseFloat(f_cost.toPrecision(5)), parseFloat(g_cost.toPrecision(5)), parseFloat(h_cost.toPrecision(5)), "Replace parent"]});

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
