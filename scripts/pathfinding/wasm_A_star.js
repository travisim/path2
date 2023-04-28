class wasm_A_star extends GridPathFinder{

  static get wasm(){
    return true;
  }

	static get display_name(){
		return "A star (wasm)";
  }
  infoMapPlannerMode(){
    return "A_star";
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

  max_step(){
    return myUI.planner.cppPlanner.maxStep();
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
				this.gWeight = value; break;
      case "h_weight":
				this.hWeight = value; break;
      case "h_optimized":
				this.hOptimized = value=="On"; break;
      case "time_ordering":
				this.timeOrder = value; break;
    }
  }

  search(start, goal) {
    this.n = 1;
    //this._init_search(start, goal); // for batch size and batch interval
    this.batch_interval = 0;
    this.batch_size = this.bigMap ? 10000 : 200

    let chosenCost = ["Manhattan",
      "Euclidean",
      "Chebyshev",
      "Octile"].findIndex(cost=>{
        return cost == this.distance_metric;
      });
    let order = ["FIFO", "LIFO"].findIndex(cost=>{
        return cost == this.timeOrder;
      });
    if(this.cppPlanner) this.cppPlanner.delete();
    this.cppPlanner = this.bigMap ? new Module["BaseAStarPlanner"]() : new Module["AStarPlanner"]();
    let finished = this.cppPlanner.wrapperSearch(this.map.copy_2d(),
    ...start, ...goal,
    this.neighborsIndex,
    this.vertexEnabled, this.diagonal_allow, this.bigMap, this.hOptimized,
    chosenCost, order);

    if(finished) return this._finish_searching();

    let planner = this;
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search()), planner.batch_interval);
    });
  }

  _run_next_search(){
    let finished;
    try{
      finished = this.cppPlanner.runNextSearch(this.batch_size);
      if(finished){
        if(this.constructor.wasm) return this._finish_searching();
        return this._finish_searching_old();
      }
      
      let planner = this;
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(planner._run_next_search()), planner.batch_interval);
      });
    }
    catch(e){
      let t = Date.now() - myUI.startTime;
      let n = this.cppPlanner.stepIndex;
      console.log(t);
      console.log(e);
      console.log("Number of steps before error: ",n);
      console.log(n/t);
      alert("Something went wrong during searching");
      if(this.constructor.wasm) return this._finish_searching();
      return this._finish_searching_old();
    }
  }

  _finish_searching(){
    // this uses the struct implementation of steps & actions in c++ wasm
    console.log(Date.now() - myUI.startTime);
    
    console.log("getting cell map now");
    this.cell_map = new Empty2D(0, 0, 0, myUI.planner.cppPlanner.cellMap);  // override using emscripten version

    console.log("getting arrow coords now");
    // since c++ cannot create arrows, we need to do it here
    // possible to export the javascript create_arrow function, will do so after the c++ A* is finalized
    let arrows = myUI.planner.cppPlanner.arrowCoords;
    for(let i = 0; i < arrows.size(); ++i){
      let arrow_data = [...vector_values(arrows.get(i))];
      let start = arrow_data.slice(0, 2), end = arrow_data.slice(2);
      myUI.create_arrow(start, end);
    }
    return this._terminate_search();
  }

  getStep(stepNo){
    return myUI.planner.cppPlanner.getStep(stepNo);
  }

  _finish_searching_old(){
    console.log(Date.now() - myUI.startTime);

    // postProcess
    console.log("getting steps now");
    this.steps_data = [...vector_values(myUI.planner.cppPlanner.stepData)];
    console.log("getting index map now");
    this.step_index_map = [...vector_values(myUI.planner.cppPlanner.stepIndexMap)];
    console.log("getting combined map now");
    this.combined_index_map = [...vector_values(myUI.planner.cppPlanner.combinedIndexMap)];
    console.log("getting cell map now");
    this.cell_map = new Empty2D(0, 0, 0, myUI.planner.cppPlanner.cellMap);  // override using emscripten version
  
    console.log("getting IT Row Data Cache now");
    // since vector<int> doesn't allow for strings or vector<strings>, we need to add the IT Row Data back to the steps
    let rows = myUI.planner.cppPlanner.ITRowDataCache;
    let idx = 0;
    
    for(let i = 0; i < rows.size(); ++i){
      while(this.steps_data[idx] != -7 && idx < this.steps_data.length) idx++;
      this.steps_data[idx] = [...vector_values(rows.get(i))];
    }

    console.log("getting cellVal now");
    // since vector<int> doesn't allow for doubles or floats, we need to add the cellVals back to the steps
    let vals = myUI.planner.cppPlanner.cellVals;
    idx = 0;
    
    for(let i = 0; i < vals.size(); ++i){
      while(this.steps_data[idx] != -8 && idx < this.steps_data.length) idx++;
      this.steps_data[idx] = vals.get(i) * 2;
    }

    console.log("getting arrow coords now");
    // since c++ cannot create arrows, we need to do it here
    // possible to export the javascript create_arrow function, will do so after the c++ A* is finalized
    let arrows = myUI.planner.cppPlanner.arrowCoords;
    for(let i = 0; i < arrows.size(); ++i){
      let arrow_data = [...vector_values(arrows.get(i))];
      let start = arrow_data.slice(0, 2), end = arrow_data.slice(2);
      myUI.create_arrow(start, end);
    }
    return this._terminate_search();
  }
}

function test(){
  myUI.planner.cppPlanner.pqSize();

  myUI.planner.cppPlanner.insertNode();
  myUI.planner.cppPlanner.pqSize();
  myUI.planner.cppPlanner.eraseNode();
  myUI.planner.cppPlanner.pqSize();

  myUI.planner.cppPlanner.insertNode();
  myUI.planner.cppPlanner.insertNode();
  myUI.planner.cppPlanner.pqSize();
  myUI.planner.cppPlanner.eraseNode();
  myUI.planner.cppPlanner.eraseNode();
  myUI.planner.cppPlanner.pqSize();

  myUI.planner.cppPlanner.insertNode();
  myUI.planner.cppPlanner.insertNode();
  myUI.planner.cppPlanner.insertNode();
  myUI.planner.cppPlanner.pqSize();
  myUI.planner.cppPlanner.eraseNode();
  myUI.planner.cppPlanner.eraseNode();
  myUI.planner.cppPlanner.pqSize();

  myUI.planner.cppPlanner.insertNode();
  myUI.planner.cppPlanner.insertNode();
  myUI.planner.cppPlanner.pqSize();
  myUI.planner.cppPlanner.eraseNode();
  myUI.planner.cppPlanner.eraseNode();
  myUI.planner.cppPlanner.eraseNode();
  myUI.planner.cppPlanner.pqSize();

}