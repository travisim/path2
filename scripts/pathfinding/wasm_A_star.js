class wasm_A_star extends GridPathfinder{

  static get wasm(){
    return true;
  }

	static get display_name(){
		return "A* (wasm)";
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

  static get configs(){
		let configs = GridPathfinder.configs;
		configs.push(
      {uid: "distance_metric", displayName: "Distance Metric:", options: ["Octile", "Manhattan", "Euclidean", "Chebyshev"], description: `The metrics used for calculating distances.<br>Octile is commonly used for grids which allow movement in 8 directions. It sums the maximum number of diagonal movements, with the residual cardinal movements.<br>Manhattan is used for grids which allow movement in 4 cardinal directions. It sums the absolute number of rows and columns (all cardinal) between two cells.<br>Euclidean takes the L2-norm between two cells, which is the real-world distance between two points. This is commonly used for any angle paths.<br>Chebyshev is the maximum cardinal distance between the two points. It is taken as max(y2-y1, x2-x1) where x2>=x1 and y2>=y1.`},
      {uid: "g_weight", displayName: "G-Weight:", options: "number", defaultVal: 1, description: `Coefficient of G-cost when calculating the F-cost. Setting G to 0 and H to positive changes this to the greedy best first search algorithm.`},
      {uid: "h_weight", displayName: "H-Weight:", options: "number", defaultVal: 1, description: `Coefficient of H-cost when calculating the F-cost. Setting H to 0 and G to positive changes this to Dijkstra's algorithm.`},
      {uid: "h_optimized", displayName: "H-optimized:", options: ["On", "Off"], description: `For algorithms like A* and Jump Point Search, F-cost = G-cost + H-cost. This has priority over the time-ordering option.<br> If Optimise is selected, when retrieving the cheapest vertex from the open list, the vertex with the lowest H-cost among the lowest F-cost vertices will be chosen. This has the effect of doing a Depth-First-Search on equal F-cost paths, which can be faster.<br> Select Vanilla to use their original implementations`},  
      {uid: "time_ordering", displayName: "Time Ordering:", options: ["FIFO", "LIFO"], description: `When sorting a vertex into the open-list or unvisited-list and it has identical cost* to earlier entries, select: <br>FIFO to place the new vertex behind the earlier ones, so it comes out after them<br> LIFO to place the new vertex in front of the earlier ones, so it comes out before them.<br>* cost refers to F-cost & H-cost, if F-H-Cost Optimisation is set to "Optimise", otherwise it is the F-cost for A*, G-cost for Dijkstra and H-cost for GreedyBestFirst)`});
		return configs;
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

  max_step(){
    return myUI.planner.wasmPlanner.maxStep();
  }

  constructor(num_neighbors = 8, diagonal_allow = true, first_neighbor = "N", search_direction = "anticlockwise") {
    super(num_neighbors, diagonal_allow, first_neighbor, search_direction);
  }

  loadWasmPlanner(){
    return this.bigMap ? new Module["BaseAStarPlanner"]() : new Module["AStarPlanner"]();
  }

  search(start, goal) {
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

  _run_next_search(){
    let finished;
    try{
      finished = this.wasmPlanner.runNextSearch(this.batch_size);
      if(finished){
        return this._finish_searching();
      }
      
      let planner = this;
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(planner._run_next_search()), planner.batch_interval);
      });
    }
    catch(e){
      console.log("ERROR WASM A* FAILED");
      console.log(e);
      let t = Date.now() - myUI.startTime;
      console.log(t);
      let n = this.wasmPlanner.stepIndex;
      console.log("Number of steps before error: ",n);
      console.log(n/t);
      alert("Something went wrong during searching");
      return this._finish_searching();
    }
  }

  _finish_searching(){
    // this uses the struct implementation of steps & actions in c++ wasm
    console.log(Date.now() - myUI.startTime);
    
    console.log("getting cell map now");
    this.cell_map = new Empty2D(0, 0, 0, myUI.planner.wasmPlanner.cellMap);  // override using emscripten version

    console.log("getting arrow coords now");
    // since c++ cannot create arrows, we need to do it here
    // possible to export the javascript create_arrow function, will do so after the c++ A* is finalized
    let arrows = myUI.planner.wasmPlanner.arrowCoords;
    for(let i = 0; i < arrows.size(); ++i){
      let arrow_data = [...vector_values(arrows.get(i))];
      let start = arrow_data.slice(0, 2), end = arrow_data.slice(2);
      myUI.create_arrow(start, end);
    }
    return this._terminate_search();
  }

  getStep(stepNo){
    return myUI.planner.wasmPlanner.getStep(stepNo);
  }
}

function test(){
  myUI.planner.wasmPlanner.pqSize();

  myUI.planner.wasmPlanner.insertNode();
  myUI.planner.wasmPlanner.pqSize();
  myUI.planner.wasmPlanner.eraseNode();
  myUI.planner.wasmPlanner.pqSize();

  myUI.planner.wasmPlanner.insertNode();
  myUI.planner.wasmPlanner.insertNode();
  myUI.planner.wasmPlanner.pqSize();
  myUI.planner.wasmPlanner.eraseNode();
  myUI.planner.wasmPlanner.eraseNode();
  myUI.planner.wasmPlanner.pqSize();

  myUI.planner.wasmPlanner.insertNode();
  myUI.planner.wasmPlanner.insertNode();
  myUI.planner.wasmPlanner.insertNode();
  myUI.planner.wasmPlanner.pqSize();
  myUI.planner.wasmPlanner.eraseNode();
  myUI.planner.wasmPlanner.eraseNode();
  myUI.planner.wasmPlanner.pqSize();

  myUI.planner.wasmPlanner.insertNode();
  myUI.planner.wasmPlanner.insertNode();
  myUI.planner.wasmPlanner.pqSize();
  myUI.planner.wasmPlanner.eraseNode();
  myUI.planner.wasmPlanner.eraseNode();
  myUI.planner.wasmPlanner.eraseNode();
  myUI.planner.wasmPlanner.pqSize();

}