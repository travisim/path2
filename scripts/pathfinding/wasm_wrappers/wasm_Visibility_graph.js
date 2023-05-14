class wasm_VisibilityGraph extends wasm_Pathfinder{

  static get display_name(){
		return "Visibility Graph (wasm)";
  }

  static get showFreeVertex(){ return true; }
  
  static get indexOfCollapsiblesToExpand() {
    return [1, 2, 3, 4];
  }
  static get pseudoCode() {
    return {
      
    }
  }

  static get infoTables(){
    return [    
			{id:"ITNeighbors", displayName: "Neighbors", headers:["Vertex", "F-Cost", "G-Cost", "H-Cost", "State"]},
      {id: "ITQueue", displayName: "Queue", headers: ["Vertex", "Parent", "F-Cost", "G-Cost", "H-Cost"] },
      
		];
	}
  
  static get hoverData(){
    return [
      {id: "hoverCellVisited", displayName: "Times Visited", type: "canvasCacheArray", canvasId: "visited"},
      {id: "hoverFCost", displayName: "F Cost", type: "canvasCacheArray", canvasId: "fCost"},
      {id: "hoverGCost", displayName: "G Cost", type: "canvasCacheArray", canvasId: "gCost"},
      {id: "hoverHCost", displayName: "H Cost", type: "canvasCacheArray", canvasId: "hCost"},
    ];
  }

  static get configs(){
		let configs = Pathfinder.configs;
		configs.push(
			{uid: "mapType", displayName: "Map Type:", options: ["Grid Cell", "Grid Vertex"], description: `Grid Cell is the default cell-based expansion. Grid Vertex uses the vertices of the grid. There is no diagonal blocking in grid vertex`},
      {uid: "distance_metric", displayName: "Distance Metric:", options: ["Euclidean"], description: `The metrics used for calculating distances.<br>Euclidean takes the L2-norm between two cells, which is the real-world distance between two points. This is commonly used for any angle paths.`},
      {uid: "g_weight", displayName: "G-Weight:", options: "number", defaultVal: 1, description: `Coefficient of G-cost when calculating the F-cost. Setting G to 0 and H to positive changes this to the greedy best first search algorithm.`},
      {uid: "h_weight", displayName: "H-Weight:", options: "number", defaultVal: 1, description: `Coefficient of H-cost when calculating the F-cost. Setting H to 0 and G to positive changes this to Dijkstra's algorithm.`},
      {uid: "h_optimized", displayName: "H-optimized:", options: ["On", "Off"], description: `For algorithms like A* and Jump Point Search, F-cost = G-cost + H-cost. This has priority over the time-ordering option.<br> If Optimise is selected, when retrieving the cheapest vertex from the open list, the vertex with the lowest H-cost among the lowest F-cost vertices will be chosen. This has the effect of doing a Depth-First-Search on equal F-cost paths, which can be faster.<br> Select Vanilla to use their original implementations`},  
      {uid: "time_ordering", displayName: "Time Ordering:", options: ["FIFO", "LIFO"], description: `When sorting a vertex into the open-list or unvisited-list and it has identical cost* to earlier entries, select: <br>FIFO to place the new vertex behind the earlier ones, so it comes out after them<br> LIFO to place the new vertex in front of the earlier ones, so it comes out before them.<br>* cost refers to F-cost & H-cost, if F-H-Cost Optimisation is set to "Optimise", otherwise it is the F-cost for A*, G-cost for Dijkstra and H-cost for GreedyBestFirst)`},  
      {uid: "show_network_graph", displayName: "Show network graph:", options: ["Off", "On"], description: `Every corner and corner-pair will be shown in the first two steps if set to "On".`});
		return configs;
  }

  constructor() {
    super();
    this.vertexEnabled = true;
  }

  setConfig(uid, value){
    switch(uid){
      case "mapType":
				if(value=="Grid Vertex"){
					this.vertexEnabled = true;
					myUI.toggleVertex(true);
				}
				else{
					this.vertexEnabled = false;
					myUI.toggleVertex(false);
				}
				break;
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
      case "show_network_graph":
        this.showNetworkGraph = value=="On"; break;
      default:
        super.setConfig(uid, value);
    }
  }

  get canvases(){
    let canvases = super.canvases.concat([
			// {
			// 	id:"fCost", drawType:"cell", drawOrder: 9, fixedResVal: 1024, valType: "float", defaultVal: Number.POSITIVE_INFINITY, colors:["#0FFF50", "#013220"], toggle: "multi", checked: false, bigMap: true, minVal: null, maxVal: null, infoMapBorder: false, infoMapValue: "F",
			// },
			// {
			// 	id:"gCost", drawType:"cell", drawOrder: 10, fixedResVal: 1024, valType: "float", defaultVal: Number.POSITIVE_INFINITY, colors:["#0FFF50", "#013220"], toggle: "multi", checked: false, bigMap: true, minVal: null, maxVal: null, infoMapBorder: false, infoMapValue: "G",
			// },
			// {
			// 	id:"hCost", drawType:"cell", drawOrder: 11, fixedResVal: 1024, valType: "float", defaultVal: Number.POSITIVE_INFINITY, colors:["#0FFF50", "#013220"], toggle: "multi", checked: false, bigMap: true, minVal: null, maxVal: null, infoMapBorder: false, infoMapValue: "H",
			// },
      {
				id:"networkGraph", drawType:"cell", drawOrder: 17, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["grey"], toggle: "multi", checked: true, bigMap: true, minVal: 1, maxVal: 1, infoMapBorder: true, infoMapValue: null,
			}
    ])
    if(this.bigMap){
      canvases = canvases.filter(conf => conf.bigMap);
    }
    return canvases;
  }

  max_step(){
    return myUI.planner.wasmPlanner.maxStep();
  }

  loadWasmPlanner(){
    return this.bigMap ? new Module["BaseVGPlanner"]() : new Module["VGPlanner"]();
  }

  search(start, goal){
    this._init_search(start, goal); // for batch size and batch interval
    let chosenCost = ["Euclidean",
      "Manhattan",
      "Chebyshev",
      "Octile"].findIndex(cost=>{
        return cost == this.distance_metric;
      });
    let order = ["FIFO", "LIFO"].findIndex(cost=>{
        return cost == this.timeOrder;
      });
    if(this.wasmPlanner) this.wasmPlanner.delete();
    this.wasmPlanner = this.loadWasmPlanner();
    // TOCHECK: MODIFY ONCE VG in C++ is done
    let finished = this.wasmPlanner.wrapperSearch(this.map.copy_2d(),
    ...start, ...goal,
    this.neighborsIndex,
    this.vertexEnabled, this.diagonal_allow, this.bigMap, this.hOptimized,
    chosenCost, order, this.gWeight, this.hWeight);

    if(finished) return this._finish_searching();

    let planner = this;
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search()), planner.batch_interval);
    });
  }

  generateNewMap(start, goal){
    // iterate through entire map
    // find vertices
    const N = null;

    function cornerCoords(gridObj, kernelSize, startX, startY, vertex = true){

      function checkAgainstPresets(presets){
        presetLoop: for(const preset of presets){
          for(let i = 0; i < kernelSize; ++i){
            for(let j = 0; j < kernelSize; ++j){
              if(preset.data[i][j] == N) continue; // skip for null
              if(preset.data[i][j] != gridObj.get_data([i + startX, j + startY])){
                continue presetLoop;
              }
            }
          }
          return preset.coords.map(coord => [coord[0] + startX, coord[1] + startY])
        }
        return null;
      }
      
      if(kernelSize == 2){
        // 2x2 data
        if(vertex) {
          let cnt = 0;
          for(let i = startX; i < startX + kernelSize; ++i){
            for(let j = startY; j < startY + kernelSize; ++j){
              if(gridObj.get_data([i,j])) cnt++;
            }
          }
          if(cnt == 3) return [[startX + 1, startY + 1]]; 
        }
        else{
          let presets = [
            {
              data: [ [1,1],
                      [1,0] ],
              coords: [[0,0]],
            },
            {
              data: [ [1,1],
                      [0,1] ],
              coords: [[0,1]],
            },
            {
              data: [ [0,1],
                      [1,1] ],
              coords: [[1,1]],
            },
            {
              data: [ [1,0],
                      [1,1] ],
              coords: [[1,0]],
            },
          ];
          return checkAgainstPresets(presets);
        }
      }
      else if(kernelSize == 3){
        // 3x3 data
        let presets = [
          // squares & L-shapes (centered)
          {
            data: [ [1,1,1],
                    [1,0,0],
                    [1,0,N] ],
            coords: [[1,1]],
          },
          {
            data: [ [1,1,1],
                    [0,0,1],
                    [N,0,1] ],
            coords: [[1,2]],
          },
          {
            data: [ [N,0,1],
                    [0,0,1],
                    [1,1,1] ],
            coords: [[2,2]],
          },
          {
            data: [ [1,0,N],
                    [1,0,0],
                    [1,1,1] ],
            coords: [[2,1]],
          },
          // Zig-zags & P-shapes
          {
            data: [ [1,1,1],
                    [1,0,0],
                    [0,0,N] ],
            coords: [[1,1]],
          },
          {
            data: [ [0,1,1],
                    [0,0,1],
                    [N,0,1] ],
            coords: [[1,2]],
          },
          {
            data: [ [N,0,0],
                    [0,0,1],
                    [1,1,1] ],
            coords: [[2,2]],
          },
          {
            data: [ [1,0,N],
                    [1,0,0],
                    [1,1,0] ],
            coords: [[2,1]],
          },

          // Reflected Zig-zags & P-shapes
          {
            data: [ [1,1,0],
                    [1,0,0],
                    [1,0,N] ],
            coords: [[1,1]],
          },
          {
            data: [ [1,1,1],
                    [0,0,1],
                    [N,0,0] ],
            coords: [[1,2]],
          },
          {
            data: [ [N,0,1],
                    [0,0,1],
                    [0,1,1] ],
            coords: [[2,2]],
          },
          {
            data: [ [0,0,N],
                    [1,0,0],
                    [1,1,1] ],
            coords: [[2,1]],
          },

          // L-shapes (off-center)
          {
            data: [ [1,1,1],
                    [1,0,1],
                    [1,0,0] ],
            coords: [[1,1]],
          },
          {
            data: [ [1,1,1],
                    [1,0,1],
                    [0,0,1] ],
            coords: [[1,2]],
          },
          {
            data: [ [1,1,1],
                    [0,0,1],
                    [0,1,1] ],
            coords: [[1,2]],
          },
          {
            data: [ [0,1,1],
                    [0,0,1],
                    [1,1,1] ],
            coords: [[2,2]],
          },
          {
            data: [ [0,0,1],
                    [1,0,1],
                    [1,1,1] ],
            coords: [[2,2]],
          },
          {
            data: [ [1,0,0],
                    [1,0,1],
                    [1,1,1] ],
            coords: [[2,1]],
          },
          {
            data: [ [1,1,0],
                    [1,0,0],
                    [1,1,1] ],
            coords: [[2,1]],
          },
          {
            data: [ [1,1,1],
                    [1,0,0],
                    [1,1,0] ],
            coords: [[1,1]],
          },

          //sticks
          {
            data: [ [1,1,1],
                    [1,0,1],
                    [1,0,1] ],
            coords: [[1,1],[1,2]],
          },
          {
            data: [ [1,1,1],
                    [0,0,1],
                    [1,1,1] ],
            coords: [[1,2],[2,2]],
          },
          {
            data: [ [1,0,1],
                    [1,0,1],
                    [1,1,1] ],
            coords: [[2,2],[2,1]],
          },
          {
            data: [ [1,1,1],
                    [1,0,0],
                    [1,1,1] ],
            coords: [[1,1],[2,1]],
          }
        ];
        return checkAgainstPresets(presets);
      }
      return null;
    }

    this.mapNodes = [];
    this.mapNodes.push(new MapNode(null, start, []));
    if(this.showNetworkGraph) this._create_action({command: STATIC.DrawPixel, dest: this.dests.networkGraph, nodeCoord: start});
    this.mapNodes.push(new MapNode(null, goal, []));
    if(this.showNetworkGraph) this._create_action({command: STATIC.DrawPixel, dest: this.dests.networkGraph, nodeCoord: goal});
    let kernelSize = 2;

    for(let i = 0; i < this.grid_height - kernelSize + 1; ++i){
      for(let j = 0; j < this.grid_width - kernelSize + 1; ++j){
        let coords = cornerCoords(this.map, kernelSize, i, j, this.vertexEnabled);
        if(coords == null) continue;
        for(const coord of coords){
          this.mapNodes.push(new MapNode(null, coord, []));
          if(this.showNetworkGraph) this._create_action({command: STATIC.DrawPixel, dest: this.dests.networkGraph, nodeCoord: coord});
        }
      }
    }
    if(this.showNetworkGraph) this._save_step(true);

    // iterate through coordinates & check for visbiliity between them

    for(let i = 0; i < this.mapNodes.length; ++i){
      for(let j = 0; j < i; ++j){
        let n1 = this.mapNodes[i], n2 = this.mapNodes[j];
        let OFFSET = this.vertexEnabled ? 0 : 0.5;
        if(CustomLOSChecker(n1.value_XY.map(x=>x+OFFSET), n2.value_XY.map(x=>x+OFFSET)).boolean){
          if(this.showNetworkGraph) this._create_action({command: STATIC.DrawEdge, dest: this.dests.networkGraph, nodeCoord: n1.value_XY, endCoord: n2.value_XY});
          this.mapNodes[i].neighbours.push(j);
          this.mapNodes[j].neighbours.push(i);
        }
      }
    }
    if(this.showNetworkGraph) this._save_step(true);
  }

  search(start, goal) {
    // this method finds the path using the prescribed map, start & goal coordinates
    this._init_search(start, goal);
    
		this.closed_list =  new Empty2D(this.map_height, this.map_width, !this.roundNodes);
		this.open_list =  new Empty2D(this.map_height, this.map_width, !this.roundNodes);
    this.generateNewMap(start, goal);
    // return new Promise((r,_)=>r());
    console.log("starting");
   
    // starting node
    var nextNode = this.mapNodes.filter(node => node.value_XY[0] == start[0] && node.value_XY[1] == start[1])[0]; // PRM Node
    this.current_node =  new Node(0, 0, 0, null, nextNode.value_XY, null, nextNode.neighbours); // Regular Node
    
    // assigns the F, G, H cost to the node
    [this.current_node.f_cost, this.current_node.g_cost, this.current_node.h_cost] = this.calc_cost(this.current_node.self_XY);

    // pushes the starting node onto the queue
    this.queue.push(this.current_node);  // begin with the start; add starting node to rear of []
    //;
    
    if(!this.bigMap){
      // for every node that is pushed onto the queue, it should be added to the queue infotable
      this._create_action({command: STATIC.InsertRowAtIndex, dest: this.dests.ITQueue, infoTableRowIndex: 1, infoTableRowData: [nextNode.value_XY.toPrecision(5).join(", "), '-', parseFloat(this.current_node.f_cost.toPrecision(5)), parseFloat(this.current_node.g_cost.toPrecision(5)), parseFloat(this.current_node.h_cost.toPrecision(5))]});
      this._create_action({command: STATIC.DrawPixel, dest: this.dests.queue, nodeCoord: nextNode.value_XY});
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
      this.open_list.set(this.current_node_XY, undefined);
      console.log(this.current_node_XY);

      //if(this.current_node_XY[0] == 8 && this.current_node_XY[1] == 2) debugger;

      if(this.step_index % 100==0) console.log(`F: ${this.current_node.f_cost.toPrecision(5)}, H: ${this.current_node.h_cost.toPrecision(5)}`);
      
      /* first check if visited */
      if (this.closed_list.get(this.current_node_XY) && this.closed_list.get(this.current_node_XY).f_cost <= this.current_node.f_cost){
        continue;  // if the current node has been visited, skip to next one in queue
      }/* */
      
			this.closed_list.set(this.current_node_XY, this.current_node);
      this.open_list.set(this.current_node_XY, undefined); // remove from open list

      this._create_action({command: STATIC.DrawPixel, dest: this.dests.visited, nodeCoord: this.current_node_XY});
      
      if(!this.bigMap){
        this._create_action({command: STATIC.EraseAllRows, dest: this.dests.ITNeighbors});
        for (let i = 0; i < this.current_node.neighbours.length; ++i){
          const XY = this.mapNodes[this.current_node.neighbours[i]].value_XY;
          this._create_action({command: STATIC.InsertRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [XY.toPrecision(5).join(", "), "?", "?", "?", "?"]})
        }
        this._create_action({command: STATIC.EraseRowAtIndex, dest: this.dests.ITQueue, infoTableRowIndex: 1});

        //this._create_action({command: STATIC.EraseCanvas, dest: this.dests.neighbors});// erase all neighbours
        this._create_action({command: STATIC.EraseCanvas, dest: this.dests.neighbors});

        //this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.expanded, nodeCoord: this.current_node_XY}); //draw current
        this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.expanded, nodeCoord: this.current_node_XY});

        //this._create_action({command: STATIC.ErasePixel, dest: this.dests.queue, nodeCoord: this.current_node_XY}); // erase vertex in queue
        this._create_action({command: STATIC.ErasePixel, dest: this.dests.queue, nodeCoord: this.current_node_XY}); // erase vertex in queue

        //this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.focused, nodeCoord: this.current_node_XY});
        this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.focused, nodeCoord: this.current_node_XY});
        this._create_action({command: STATIC.EraseAllEdge, dest: this.dests.focused});

        this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 12});
      }//add
      this._save_step(true);

      //this._assign_cell_index(this.current_node_XY);

      /* FOUND GOAL */
      if(this._found_goal(this.current_node)) return this._terminate_search(); // found the goal & exits the loop
      

      /* iterates through the neighbors and adds them to the queue & neighbour array */
       for (let i = 0; i < this.current_node.neighbours.length; ++i){
        const idx = this.current_node.neighbours[i];
        var next_XY = this.mapNodes[idx].value_XY; // calculate the coordinates for the new neighbour

        let [f_cost, g_cost, h_cost] = this.calc_cost(next_XY);
        
        if(!this.showNetworkGraph) this._create_action({command: STATIC.DrawEdge, dest: this.dests.networkGraph, nodeCoord: next_XY, endCoord: this.current_node_XY});
        if(!this.bigMap){
          this._create_action({command: STATIC.EraseAllEdge, dest: this.dests.focused});
          this._create_action({command: STATIC.DrawEdge, dest: this.dests.focused, nodeCoord: next_XY, endCoord: this.current_node_XY});
        }
        
        let next_node = new Node(f_cost, g_cost, h_cost, this.current_node, next_XY, null, this.mapNodes[idx].neighbours);
        let open_node = this.open_list.get(next_XY);
        if(open_node !== undefined && open_node.f_cost<=f_cost){
          if(!this.bigMap){
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [next_XY.toPrecision(5).join(", "), f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Not a child"]});
            this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.focused, nodeCoord: next_XY});
            this._save_step(false);
          }
          continue; // do not add to queue if open list already has a lower cost node
        }
        let closed_node = this.closed_list.get(next_XY);
        if(closed_node !== undefined && closed_node.f_cost<=f_cost){
          if(!this.bigMap){
            if(this.current_node.parent && this.current_node.parent.self_XY[0] == next_XY[0] && this.current_node.parent.self_XY[1] == next_XY[1])
              this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [next_XY.toPrecision(5).join(", "), f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Parent"]});  //  a parent must be visited already
            else
              this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [next_XY.toPrecision(5).join(", "), f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Not a child"]});
            this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.focused, nodeCoord: next_XY});
          }
          
          /*this._create_action({command: STATIC.IncrementPixel, dest: this.dests.visited, nodeCoord: next_XY});*///add on
          this._save_step(false);
          continue; // do not add to queue if closed list already has a lower cost node
        }

        //this._create_action({command: STATIC.SetPixelValue, dest: this.dests.fCost, nodeCoord: next_XY, anyVal: f_cost});
        //this._create_action({command: STATIC.SetPixelValue, dest: this.dests.gCost, nodeCoord: next_XY, anyVal: g_cost});
        //this._create_action({command: STATIC.SetPixelValue, dest: this.dests.hCost, nodeCoord: next_XY, anyVal: h_cost});
        
        // add to queue 
        if(this.timeOrder=="FIFO") this.queue.push(next_node); // FIFO
        else this.queue.unshift(next_node); // LIFO
        this.open_list.set(next_XY, next_node);  // add to open list
        
        // since A* is a greedy algorithm, it requires visiting of nodes again even if it has already been added to the queue
        // see https://www.geeksforgeeks.org/a-search-algorithm/
        
        if(!this.bigMap){
          this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 32});
      
          this._create_action({command: STATIC.DrawPixel, dest: this.dests.queue, nodeCoord: next_XY});
          this._create_action({command: STATIC.DrawPixel, dest: this.dests.neighbors, nodeCoord: next_XY}); //add on

          this.queue.sort(A_star_cmp);

          // counts the number of nodes that have a lower F-Cost than the new node
          // to find the position to add it to the queue
          let numLess = 0;
          while(this.queue[numLess] != next_node) numLess++;
          
          this._create_action({command: STATIC.InsertRowAtIndex, dest: this.dests.ITQueue, infoTableRowIndex: numLess+1, infoTableRowData: [next_XY.toPrecision(5).join(", "), this.current_node_XY.toPrecision(5).join(", "), parseFloat(next_node.f_cost.toPrecision(5)), parseFloat(next_node.g_cost.toPrecision(5)), parseFloat(next_node.h_cost.toPrecision(5))]});
          
          if(open_node===undefined && closed_node===undefined) 
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [next_XY.toPrecision(5).join(", "), f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "New encounter"]});
          else if(open_node)
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [next_XY.toPrecision(5).join(", "), f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Replace parent"]});
            this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.focused, nodeCoord: next_XY});
        }
        this._save_step(false);

        if(this._found_goal(next_node)) return this._terminate_search();
      }


      // continue to next node in queue
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search(planner, planner.batch_size)), planner.batch_interval);
    });
  }
}