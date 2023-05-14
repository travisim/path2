class PRM extends Pathfinder{

	static get display_name(){
		return "PRM";
  }
  infoMapPlannerMode(){
    return "PRM";
  }

  static get showFreeVertex(){ return true; }
  static get gridPrecision(){ return "float"; }

  static get indexOfCollapsiblesToExpand() {", "
    return [1, 2, 3, 4];
  }
  static get pseudoCode() {
    return {
      code: "N ← ∅;\nE ← ∅; \nloop \n  c ← a randomly chosen free configuration;\n  Nc ← a set of candidate neighbours of c chosen from N; \n  N ← N U {C} ;\n  forall n ∈ Nc in order of increasing D(c,n) do \n    if (!same_connceted_component(c,n)) and LOS(c,n) then\n      N ← N U {[c,n]};\n      update R's connected components;\n add goal/start node to map",
      reference: "L. E. Kavraki, P. Svestka, J. . -C. Latombe and M. H. Overmars, \"Probabilistic roadmaps for path planning in high-dimensional configuration spaces,\" in IEEE Transactions on Robotics and Automation, vol. 12, no. 4, pp. 566-580, Aug. 1996, doi: 10.1109/70.508439."
    }
  }

   static get infoTables(){
    return [
      {id: "ITStatistics", displayName: "Statistics", headers: ["Indicator", "Value"], fixedContentOfFirstRowOfHeaders:["Number Of Nodes","Path Distance"]},      
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

  static get configs(){
		let configs = [];
		configs.push(
      {uid: "generate_new_map", displayName: "Generate new map", options: "button", description: `generates a new PRM map`},
      {uid: "seed", displayName: "Seed:", options: "text", defaultVal: "sinatra", description: `Sets seed for randomness of random points`},
      {uid: "sample_size", displayName: "Sample Size:", options: "number", defaultVal: 35, description: `Sets number of random points`},
      {uid: "neighbour_selection_method", displayName: "Neighbour Selection Method", options: ["Top Closest Neighbours", "Top Closest Visible Neighbours", "Closest Neighbours By Radius"],defaultVal:"Top Closest Neighbours", description: `Sets neighbours selection method`},
      {uid: "number_of_closest_neighbours", displayName: "Number of Closest Neighbours", options: "number",defaultVal:6, description: `Sets number of closest neighbours to select`},
      {uid: "closest_neighbours_by_radius", displayName: "Closest Neighbours By Radius", options: "number",defaultVal:15, description: `Sets radius of closest neighbours to select`},
      {uid: "goal_radius", displayName: "Goal Radius", options: "number",defaultVal:3, description: `Sets radius of goal`},
      {uid: "round_nodes", displayName: "Round Node Values", options: ["Allow Floats","Round to Nearest Integer"], description: `Round the nodes`},
      {uid: "distance_metric", displayName: "Distance Metric:", options: ["Euclidean"], defaultVal:"Euclidean", description: `The metrics used for calculating distances.<br>Euclidean takes the L2-norm between two cells, which is the real-world distance between two points. This is commonly used for any angle paths.`},
      {uid: "g_weight", displayName: "G-Weight:", options: "number", defaultVal: 1, description: `Coefficient of G-cost when calculating the F-cost. Setting G to 0 and H to positive changes this to the greedy best first search algorithm.`},
      {uid: "h_weight", displayName: "H-Weight:", options: "number", defaultVal: 1, description: `Coefficient of H-cost when calculating the F-cost. Setting H to 0 and G to positive changes this to Dijkstra's algorithm.`},
      {uid: "h_optimized", displayName: "H-optimized:", options: ["On", "Off"], description: `For algorithms like A* and Jump Point Search, F-cost = G-cost + H-cost. This has priority over the time-ordering option.<br> If Optimise is selected, when retrieving the cheapest vertex from the open list, the vertex with the lowest H-cost among the lowest F-cost vertices will be chosen. This has the effect of doing a Depth-First-Search on equal F-cost paths, which can be faster.<br> Select Vanilla to use their original implementations`},  
      {uid: "time_ordering", displayName: "Time Ordering:", options: ["FIFO", "LIFO"], description: `When sorting a vertex into the open-list or unvisited-list and it has identical cost* to earlier entries, select: <br>FIFO to place the new vertex behind the earlier ones, so it comes out after them<br> LIFO to place the new vertex in front of the earlier ones, so it comes out before them.<br>* cost refers to F-cost & H-cost, if F-H-Cost Optimisation is set to "Optimise", otherwise it is the F-cost for A*, G-cost for Dijkstra and H-cost for GreedyBestFirst)`});

    return configs;
  }

  constructor(num_neighbors = 8, diagonal_allow = true, first_neighbour = "N", search_direction = "anticlockwise") {
    super(num_neighbors, diagonal_allow, first_neighbour, search_direction);
    this.vertexEnabled = true;
    myUI.nodeCanvas.isDisplayRatioGrid(true)
    myUI.edgeCanvas.isDisplayRatioGrid(true)
  }

  setConfig(uid, value){
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
      case "generate_new_map":
        let startTime = Date.now();
        let save_seed = true;
        if(this.seed == ""){
          this.seed = generateString(5);
          save_seed = false;
          document.getElementById("seed_pcfg").value = this.seed;
        }
				this.generateNewMap(myUI.map_start, myUI.map_goal);
        if(!save_seed) this.seed = "";
        console.log(Date.now() - startTime);
        break;
      case "seed":
				this.seed = value;
        break;
      case "sample_size":
				this.sampleSize = value;
        break;
      case "neighbour_selection_method":
				this.neighbourSelectionMethod = value;
        break;
      case "number_of_closest_neighbours":
				this.numberOfTopClosestNeighbours = value;
        break;
      case "closest_neighbours_by_radius":
				this.connectionDistance = value;
        break;
      case "round_nodes":
        this.roundNodes = (value == `Round to Nearest Integer`);
        break;
      case "goal_radius":
        this.goalRadius = value; 
        break;
      default:
		    super.setConfig(uid, value);
    }
  }


  
  calc_cost(successor){

    function euclidean(c1, c2){
      return Math.hypot(c1[0]-c2[0], c1[1]-c2[1]);
    }
    
   if(this.distance_metric == "Euclidean"){
      var g_cost = this.current_node.g_cost + euclidean(this.current_node.self_XY, successor);
      var h_cost = euclidean(successor, this.goal);
    }

    var f_cost = this.gWeight*g_cost + this.hWeight*h_cost;//++ from bfs.js
    return [f_cost, g_cost, h_cost];
  }

  generateNewMap(start = [0,0], goal=[13,13]){
     //[0,0],[13,13],this.seed,this.samplesSize, this.neighbourSelectionMethod,this.numberOfTopClosestNeighbours,this.connectionDistance

    function isCoordEqual(a, b){ return a.every((x, i) => x === b[i]); }

    var seed = cyrb128(this.seed);
    var rand = mulberry32(seed[0]);
    this.mapNodes = [];

    this._create_action({ command: STATIC.DrawVertex, dest: this.dests.networkGraph, nodeCoord: start });
    this._create_action({ command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 4 });
    
    nextCoord: for (let i = 0; i < this.sampleSize; ++i) {
      
      var randomCoord_XY = [rand()*(myUI.map_arr.length/*this.map_height*/), rand()*(myUI.map_arr[0].length/*this.map_width*/)] //need seed
      
     // if (this.roundNodes) randomCoord_XY = randomCoord_XY.map(Math.round);
  
      if (CustomLOSChecker(randomCoord_XY, randomCoord_XY).boolean == false) {
        continue nextCoord;
      }

      let foundIndex = this.mapNodes.findIndex(mapNode => isCoordEqual(mapNode.value_XY, randomCoord_XY));
      if(foundIndex != -1) continue nextCoord; //dont add random coord that is already added into list of random coord
      
      this.mapNodes.push(new MapNode(null, randomCoord_XY, []));
      this._create_action({ command: STATIC.DrawVertex, dest: this.dests.networkGraph, nodeCoord: randomCoord_XY });
    }
    this._save_step(true);
    
    //var otherRandomCoordsDistance = empty2D(mapNodes.length,mapNodes.length-1); // this contains the distance between a Coord and all other coord in a 2d array with the index of otherRandomCoordDistance corresponding to coord in  randomCoord
    
    for (let i = 0; i < this.mapNodes.length; ++i) {
      let currentCoord = [...this.mapNodes[i].value_XY];
      var distancesBetweenACoordAndAllOthers=[]; // index corresponds to index of mapNodes, 
      let otherRandomCoords = deep_copy_matrix(nodes_to_array(this.mapNodes,"value_XY")); // randomCoord passed by reference here
      
      for (let j = 0; j < otherRandomCoords.length; ++j) {
        if(i == j) continue;
        distancesBetweenACoordAndAllOthers.push( [Math.hypot(currentCoord[0] - otherRandomCoords[j][0], currentCoord[1]  - otherRandomCoords[j][1]), j]);
      }
      distancesBetweenACoordAndAllOthers.sort((a,b)=>{
        return a[0] - b[0]; // sort by distance ascending
      });


      let indexOfSelectedOtherRandomCoords;

      if(this.neighbourSelectionMethod == "Top Closest Neighbours"){
        // checks LOS between the the top X closes neighbours 
        indexOfSelectedOtherRandomCoords = distancesBetweenACoordAndAllOthers
          .slice(0, this.numberOfTopClosestNeighbours)
          .map(p => p[1]);
      }
      else if(this.neighbourSelectionMethod == "Top Closest Visible Neighbours"){
        indexOfSelectedOtherRandomCoords = distancesBetweenACoordAndAllOthers
          .map(p => p[1]);
      }
      else if(this.neighbourSelectionMethod == "Closest Neighbours By Radius"){
        indexOfSelectedOtherRandomCoords = distancesBetweenACoordAndAllOthers
          .filter(p => p[0] < this.connectionDistance)
          .map(p => p[1]);
      }
      
      let cnt = 0;
      coordLoop: for (let j = 0; j < indexOfSelectedOtherRandomCoords.length; ++j) {
        let jdx = indexOfSelectedOtherRandomCoords[j];
        if(i == jdx) continue;
        
        var LOS = CustomLOSChecker(currentCoord, otherRandomCoords[jdx]).boolean;
        
        if(LOS){//if there is lOS then add neighbours(out of 5) to neighbours of node
          ++cnt;
          // every time we add an edge, it is bidirectional, so checking of of the neighbours is sufficient
          if(!this.mapNodes[i].neighbours.includes(jdx)){
            this.mapNodes[i].neighbours.push(jdx);
            this.mapNodes[jdx].neighbours.push(i);
            this._create_action({ command: STATIC.DrawEdge, dest: this.dests.networkGraph, nodeCoord: this.mapNodes[i].value_XY, endCoord: this.mapNodes[jdx].value_XY });
          }
        } 
        if(this.neighbourSelectionMethod == "Top Closest Visible Neighbours" && cnt >= this.numberOfTopClosestNeighbours) break coordLoop;
      }
    }
    
    this._create_action({ command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 9 });
  
    this._save_step(true);
    
    this.addStartGoalNode("goal",goal);
    this.addStartGoalNode("start", start);
        
    this._create_action({ command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 10 });
     this._save_step(true);
  }



  addStartGoalNode(isStartOrGoal = "start",coord_XY = [4,1]){
    if (CustomLOSChecker(coord_XY, coord_XY).boolean == false) return alert(`start/Goal is on an obstacle`);
    if (isStartOrGoal == "start" && this.prevStartCoord){
      prevCoord = this.prevStartCoord
      prevCoordConnectedto = this.prevCoordStartConnectedTo
    }
    else if (isStartOrGoal == "goal" && this.prevGoalCoord){
      prevCoord = this.prevGoalCoord
      prevCoordConnectedto = this.prevCoordGoalConnectedTo
    }
    else {
      var prevCoord;
    }

     if(prevCoord){
      myUI.edgeCanvas.eraseLine(prevCoord, prevCoordConnectedto);
      myUI.nodeCanvas.eraseCircle(prevCoord);
    } 

    if (isStartOrGoal == "start" && this.prevStartCoord){
      this.prevStartCoord = coord_XY;
    }
    else if (isStartOrGoal == "goal" && this.prevGoalCoord){
      this.prevGoalCoord = coord_XY;
    }

    var distancesBetweenACoordAndAllOthers=[]; // index corresponds to index of mapNodes, 
 
    for (let i = 0; i < this.mapNodes.length; ++i)
        distancesBetweenACoordAndAllOthers.push( [Math.hypot(coord_XY[0] - this.mapNodes[i].value_XY[0], coord_XY[1]  - this.mapNodes[i].value_XY[1]), i]);
    
    distancesBetweenACoordAndAllOthers.sort((a,b)=>{
      return a[0] - b[0]; // sort by first index/sort by distances shortest at start
    });


    let indexOfSelectedRandomCoords = distancesBetweenACoordAndAllOthers // same as code for   if(this.neighbourSelectionMethod == "Top Closest Visible Neighbours"")
      .map(p => p[1]);
  
    var selectedVertexIndex;
    let cnt = 0;
    coordLoop: for (let j = 0; j < indexOfSelectedRandomCoords.length; ++j) {
      let jdx = indexOfSelectedRandomCoords[j];
      if(i == jdx) continue; 

      //below currently takes the first vertex that passes LOS
      var LOS = CustomLOSChecker(coord_XY, this.mapNodes[jdx].value_XY).boolean;
      if(LOS){//if there is lOS then add neighbours(out of 5) to neighbours of node
        ++cnt;
        selectedVertexIndex = jdx
      } 
      if(cnt >= 1) break coordLoop; // hardcoded to take the closest node not least cost
    }
    const selected_XY = this.mapNodes[selectedVertexIndex].value_XY;
    var selectedIndexForStartEndVertex = this.mapNodes.length // determined before push to array below

    this.mapNodes.push(new MapNode(null,coord_XY,new Array()));

    this._create_action({ command: STATIC.DrawEdge, dest: this.dests.networkGraph, nodeCoord: coord_XY, endCoord: selected_XY });
    this._create_action({ command: STATIC.DrawVertex, dest: this.dests.networkGraph, nodeCoord: coord_XY });
   
    if(!this.mapNodes[selectedVertexIndex].neighbours.includes(selectedIndexForStartEndVertex)) this.mapNodes[selectedVertexIndex].neighbours.push(selectedIndexForStartEndVertex);
    if(!this.mapNodes[selectedIndexForStartEndVertex].neighbours.includes(selectedVertexIndex)) this.mapNodes[selectedIndexForStartEndVertex].neighbours.push(selectedVertexIndex);

    if (isStartOrGoal == "start"){
      console.log("Start:", this.mapNodes[selectedIndexForStartEndVertex]);
    }
    else{
      console.log("Goal:", this.mapNodes[selectedIndexForStartEndVertex]);
    }

    if (isStartOrGoal == "start" && this.prevStartCoord){
      this.prevStartCoordConnectedto = selected_XY;
    }
    else if (isStartOrGoal == "goal" && this.prevGoalCoord){
      this.prevGoalCoordConnectedto = selected_XY;
    }
  }

  search(start, goal) {
    // this method finds the path using the prescribed map, start & goal coordinates
    this._init_search(start, goal);
    
		this.closed_list =  new Empty2D(this.map_height, this.map_width, !this.roundNodes);
		this.open_list =  new Empty2D(this.map_height, this.map_width, !this.roundNodes);
    this.generateNewMap(start, goal);
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
      this._create_action({command: STATIC.DrawVertex, dest: this.dests.queue, nodeCoord: nextNode.value_XY});
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

      this._create_action({command: STATIC.DrawVertex, dest: this.dests.visited, nodeCoord: this.current_node_XY});
      
      if(!this.bigMap){
        this._create_action({command: STATIC.EraseAllRows, dest: this.dests.ITNeighbors});
        for (let i = 0; i < this.current_node.neighbours.length; ++i){
          const XY = this.mapNodes[this.current_node.neighbours[i]].value_XY;
          this._create_action({command: STATIC.InsertRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: -(i+1), infoTableRowData: [XY.toPrecision(5).join(", "), "?", "?", "?", "?"]})
        }
        this._create_action({command: STATIC.EraseRowAtIndex, dest: this.dests.ITQueue, infoTableRowIndex: 1});

        //this._create_action({command: STATIC.EraseCanvas, dest: this.dests.neighbors});// erase all neighbours
        this._create_action({command: STATIC.EraseAllVertex, dest: this.dests.neighbors});

        //this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.expanded, nodeCoord: this.current_node_XY}); //draw current
        this._create_action({command: STATIC.DrawSingleVertex, dest: this.dests.expanded, nodeCoord: this.current_node_XY});

        //this._create_action({command: STATIC.ErasePixel, dest: this.dests.queue, nodeCoord: this.current_node_XY}); // erase vertex in queue
        this._create_action({command: STATIC.EraseVertex, dest: this.dests.queue, nodeCoord: this.current_node_XY}); // erase vertex in queue

        //this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.focused, nodeCoord: this.current_node_XY});
        this._create_action({command: STATIC.DrawSingleVertex, dest: this.dests.focused, nodeCoord: this.current_node_XY});
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
        
        this._create_action({command: STATIC.EraseAllEdge, dest: this.dests.focused});
        this._create_action({command: STATIC.DrawEdge, dest: this.dests.focused, nodeCoord: next_XY, endCoord: this.current_node_XY});
        
        let next_node = new Node(f_cost, g_cost, h_cost, this.current_node, next_XY, null, this.mapNodes[idx].neighbours);
        let open_node = this.open_list.get(next_XY);
        if(open_node !== undefined && open_node.f_cost<=f_cost){
          if(!this.bigMap){
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [next_XY.toPrecision(5).join(", "), f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Not a child"]});
            this._create_action({command: STATIC.DrawSingleVertex, dest: this.dests.focused, nodeCoord: next_XY});
            this._save_step(false);
          }
          continue; // do not add to queue if open list already has a lower cost node
        }
        let closed_node = this.closed_list.get(next_XY);
        if(closed_node !== undefined && closed_node.f_cost<=f_cost){
          if(!this.bigMap){
            if(this.current_node.parent.self_XY[0] == next_XY[0] && this.current_node.parent.self_XY[1] == next_XY[1])
              this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [next_XY.toPrecision(5).join(", "), f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Parent"]});  //  a parent must be visited already
            else
              this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [next_XY.toPrecision(5).join(", "), f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Not a child"]});
            this._create_action({command: STATIC.DrawSingleVertex, dest: this.dests.focused, nodeCoord: next_XY});
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
      
          this._create_action({command: STATIC.DrawVertex, dest: this.dests.queue, nodeCoord: next_XY});
          this._create_action({command: STATIC.DrawVertex, dest: this.dests.neighbors, nodeCoord: next_XY}); //add on

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
            this._create_action({command: STATIC.DrawSingleVertex, dest: this.dests.focused, nodeCoord: next_XY});
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
