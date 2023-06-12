class wasm_Visibility_graph extends wasm_Pathfinder{

  static get wasm(){
    return true;
  }

  static get display_name(){
		return "Visibility Graph (wasm)";
  }

  static get showFreeVertex(){ return true; }
  
  static get indexOfCollapsiblesToExpand() {
    return [0, 1, 2, 3];
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
      {uid: "generate_visbility_graph", displayName: "Generate Visibility Graph", options: "button", description: `Generates the visibility graph without searching.`},
      {uid: "download_visbility_data", displayName: "Download Visibility Data", options: "button", description: `Download the generated visibility data`},
      {uid: "mapType", displayName: "Map Type:", options: ["Grid Cell", "Grid Vertex"], description: `Grid Cell is the default cell-based expansion. Grid Vertex uses the vertices of the grid. There is no diagonal blocking in grid vertex`},
      {uid: "distance_metric", displayName: "Distance Metric:", options: ["Euclidean"], description: `The metrics used for calculating distances.<br>Euclidean takes the L2-norm between two cells, which is the real-world distance between two points. This is commonly used for any angle paths.`},
      {uid: "g_weight", displayName: "G-Weight:", options: "number", defaultVal: 1, description: `Coefficient of G-cost when calculating the F-cost. Setting G to 0 and H to positive changes this to the greedy best first search algorithm.`},
      {uid: "h_weight", displayName: "H-Weight:", options: "number", defaultVal: 1, description: `Coefficient of H-cost when calculating the F-cost. Setting H to 0 and G to positive changes this to Dijkstra's algorithm.`},
      {uid: "h_optimized", displayName: "H-optimized:", options: ["On", "Off"], description: `For algorithms like A* and Jump Point Search, F-cost = G-cost + H-cost. This has priority over the time-ordering option.<br> If Optimise is selected, when retrieving the cheapest vertex from the open list, the vertex with the lowest H-cost among the lowest F-cost vertices will be chosen. This has the effect of doing a Depth-First-Search on equal F-cost paths, which can be faster.<br> Select Vanilla to use their original implementations`},  
      {uid: "time_ordering", displayName: "Time Ordering:", options: ["FIFO", "LIFO"], description: `When sorting a vertex into the open-list or unvisited-list and it has identical cost* to earlier entries, select: <br>FIFO to place the new vertex behind the earlier ones, so it comes out after them<br> LIFO to place the new vertex in front of the earlier ones, so it comes out before them.<br>* cost refers to F-cost & H-cost, if F-H-Cost Optimisation is set to "Optimise", otherwise it is the F-cost for A*, G-cost for Dijkstra and H-cost for GreedyBestFirst)`},  
      {uid: "show_network_graph", displayName: "Show network graph:", options: ["Off", "On"], description: `Every corner and corner-pair will be shown in the first two steps if set to "On".`},
      {uid: "set_max_lines", displayName: "Maximum number of lines:", options: "number", defaultVal: 100, description: `Maximum number of lines (of each type) to be shown on the screen at any time.`},
    );
		return configs;
  }

  constructor() {
    super();
    this.vertexEnabled = true;
  }

  setConfig(uid, value){
    switch(uid){
      case "generate_visbility_graph":
        this.generateNewMap(); break;
      case "download_visbility_data":
        this.downloadMapNodes(); break;
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
      case "set_max_lines":
        myUI.edgeCanvas.setMaxLines(Number(value)); break;
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
				id:"networkGraph", drawType:"cell", drawOrder: 17, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["grey"], toggle: "multi", checked: true, bigMap: true, minVal: 1, maxVal: 1, infoMapBorder: true, infoMapValue: null, lineWidth: 1,
			}
    ])
    if(this.bigMap){
      canvases = canvases.filter(conf => conf.bigMap);
    }
    return canvases;
  }

  downloadMapNodes(){
    console.assert(this.wasmPlanner, "No wasm planner created!");
    this.wasmPlanner.download()
    let text = `type,mapnode`;
    for(let node of this.mapNodes){
      text += `\n${node.value_XY},${node.getNeighbors()}`;
    }
    text += `\ntype,mapedge`
    for(let edge of this.mapEdges){
      text += `\n${edge}`;
    }
    download("saved.mapnode", text);
  }

  generateNewMap(){
    this.loadWasmPlanner();
    let finished = this.wasmPlanner.wrapperGNM(this.map.copy_2d(), this.diagonal_allow);
    let thisPlanner = this;
    
    function NextGNM(){
      let finished = thisPlanner.wasmPlanner.nextGNM();
      if(finished){
        console.log(`Time taken: ${Date.now() - myUI.startTime}`);
      }
      if(!finished) return new Promise((resolve, _) => {
        setTimeout(() => resolve(NextGNM()), 0);
      });
    }

    if(!finished)  return new Promise((resolve, _) => {
      setTimeout(() => resolve(NextGNM()), 0);
    });
  }

  max_step(){
    return myUI.planner.wasmPlanner.maxStep();
  }

  loadWasmPlanner(){
    if(!this.wasmPlanner)
      this.wasmPlanner = this.bigMap ? new Module["BaseVGPlanner"]() : new Module["VGPlanner"]();
  }

  async search(start, goal){
    let toGenerateMap = this.map_arr != myUI.map_arr;
    if(this.wasmPlanner) toGenerateMap &= this.wasmPlanner.getNumMapNodes() == 0;
    this.add_map(myUI.map_arr);
    this.initBatchInfo();
    let chosenCost = ["Euclidean",
      "Manhattan",
      "Chebyshev",
      "Octile"].findIndex(cost=>{
        return cost == this.distance_metric;
      });
    let order = ["FIFO", "LIFO"].findIndex(cost=>{
        return cost == this.timeOrder;
      });
    this.loadWasmPlanner();
    
    if(toGenerateMap) await this.generateNewMap();

    let finished = this.wasmPlanner.wrapperSearch(this.map.copy_2d(),
    ...start, ...goal,
    this.vertexEnabled, this.diagonal_allow, this.bigMap, this.hOptimized,
    chosenCost, order, this.gWeight, this.hWeight, this.showNetworkGraph);

    if(finished) return this._finish_searching();

    let planner = this;
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search()), planner.batch_interval);
    });
  }

  
}