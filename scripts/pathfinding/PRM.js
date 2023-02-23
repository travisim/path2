class PRM extends GridPathFinder{

	static get display_name(){
		return "PRM";
  }
  infoMapPlannerMode(){
    return "PRM";
  }
  
  static get distance_metrics(){
    return ["Euclidean"];
  }

  static get hoverData(){
    return [
      {id: "hoverCellVisited", displayName: "Times Visited", type: "canvasCache", canvasId: "visited"},
      {id: "hoverFCost", displayName: "F Cost", type: "canvasCache", canvasId: "fCost"},
      {id: "hoverGCost", displayName: "G Cost", type: "canvasCache", canvasId: "gCost"},
      {id: "hoverHCost", displayName: "H Cost", type: "canvasCache", canvasId: "hCost"},
    ];
  }

  get configs(){
		let configs = [];
		configs.push(
      {uid: "generate_new_map", displayName: "Generate new map", options: "button", description: `generates a new PRM map`},
      {uid: "seed", displayName: "Seed:", options: "text", defaultVal: "", description: `Sets seed for randomness of random points`},
      {uid: "sample_size", displayName: "Sample Size:", options: "number", defaultVal: 35, description: `Sets number of random points`},
      {uid: "neighbour_selection_method", displayName: "Neighbour Selection Method", options: ["Top Closest Neighbours", "Top Closest Visible Neighbours", "Closest Neighbours By Radius"],defaultVal:"Top Closest Neighbours", description: `Sets neighbours selection method`},
      {uid: "number_of_closest_neighbours", displayName: "Number of Closest Neighbours", options: "number",defaultVal:6, description: `Sets number of closest neighbours to select`},
      {uid: "closest_neighbours_by_radius", displayName: "Closest Neighbours By Radius", options: "number",defaultVal:15, description: `Sets radius of closest neighbours to select`},
      {uid: "round_nodes", displayName: "Round Node Values", options: ["Round to Nearest Integer", "Allow Floats"], description: `Round the nodes`},
      {uid: "distance_metric", displayName: "Distance Metric:", options: ["Euclidean"], defaultVal:"Euclidean", description: `The metrics used for calculating distances.<br>Octile is commonly used for grids which allow movement in 8 directions. It sums the maximum number of diagonal movements, with the residual cardinal movements.<br>Manhattan is used for grids which allow movement in 4 cardinal directions. It sums the absolute number of rows and columns (all cardinal) between two cells.<br>Euclidean takes the L2-norm between two cells, which is the real-world distance between two points. This is commonly used for any angle paths.<br>Chebyshev is the maximum cardinal distance between the two points. It is taken as max(y2-y1, x2-x1) where x2>=x1 and y2>=y1.`},
      {uid: "g_weight", displayName: "G-Weight:", options: "number", defaultVal: 1, description: `Coefficient of G-cost when calculating the F-cost. Setting G to 0 and H to positive changes this to the greedy best first search algorithm.`},
      {uid: "h_weight", displayName: "H-Weight:", options: "number", defaultVal: 1, description: `Coefficient of H-cost when calculating the F-cost. Setting H to 0 and G to positive changes this to Dijkstra's algorithm.`},
      {uid: "h_optimized", displayName: "H-optimized:", options: ["On", "Off"], description: `For algorithms like A* and Jump Point Search, F-cost = G-cost + H-cost. This has priority over the time-ordering option.<br> If Optimise is selected, when retrieving the cheapest vertex from the open list, the vertex with the lowest H-cost among the lowest F-cost vertices will be chosen. This has the effect of doing a Depth-First-Search on equal F-cost paths, which can be faster.<br> Select Vanilla to use their original implementations`},  
      {uid: "time_ordering", displayName: "Time Ordering:", options: ["LIFO", "FIFO"], description: `When sorting a vertex into the open-list or unvisited-list and it has identical cost* to earlier entries, select: <br>FIFO to place the new vertex behind the earlier ones, so it comes out after them<br> LIFO to place the new vertex in front of the earlier ones, so it comes out before them.<br>* cost refers to F-cost & H-cost, if F-H-Cost Optimisation is set to "Optimise", otherwise it is the F-cost for A*, G-cost for Dijkstra and H-cost for GreedyBestFirst)`});

    return configs;
  }

  constructor(num_neighbors = 8, diagonal_allow = true, first_neighbour = "N", search_direction = "anticlockwise") {
    super(num_neighbors, diagonal_allow, first_neighbour, search_direction);
    this.vertexEnabled = true;
    myUI.nodeCanvas.isDisplayRatioGrid(true)
    myUI.edgeCanvas.isDisplayRatioGrid(true)
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
             /*
        document.getElementById("number_of_closest_neighbours_pcfg").parentElement.style.display = "table-cell";
        document.getElementById("closest_neighbours_by_radius_pcfg").parentElement.style.display = "table-cell";
   
        if(value == "Top Closest Neighbours"){
          document.getElementById("number_of_closest_neighbours_pcfg").style.display = "none";
        }
        else if(value == "Closest Neighbours By Radius"){
           document.getElementById("closest_neighbours_by_radius_pcfg").style.display = "none";
        }
        */
        break;
      case "number_of_closest_neighbours":
				this.numberOfTopClosestNeighbours = value;
        break;
      case "closest_neighbours_by_radius":
				this.connectionDistance = value;
        break;
      case "round_nodes":
        this.roundNodes = (value == `Round to Nearest Integer`);

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

  postProcess(){
    this.setConfig("mapType", "Grid Vertex");
  }

  generateNewMap(start = [0,0], goal=[13,13]){
     //[0,0],[13,13],this.seed,this.samplesSize, this.neighbourSelectionMethod,this.numberOfTopClosestNeighbours,this.connectionDistance
   
    this.exports = {coords:[],neighbors:[],edges:[]};
   
    //clears SVG canvas
    if(document.getElementById("node")){
      document.getElementById("node").innerHTML = "";
    }
    if(document.getElementById("edge")){
      document.getElementById("edge").innerHTML = "";
    }

    this.exports.config = {seed:this.seed, sample_size: this.sampleSize, neighbor_selection_method: this.neighbourSelectionMethod, num_closest: this.numberOfTopClosestNeighbours, round_nodes: this.roundNodes};
    var seed = cyrb128(this.seed);
    var rand = mulberry32(seed[0]);
    this.randomCoordsNodes = []
  
    
    nextCoord: for (let i = 0; i < this.sampleSize; ++i) {
      var randomCoord_XY = [rand()*(myUI.map_arr.length/*this.map_height*/), rand()*(myUI.map_arr[0].length/*this.map_width*/)] //need seed
      if(this.roundNodes) randomCoord_XY = randomCoord_XY.map(Math.round);
      
      if(this.randomCoordsNodes.length != 0){
        for (let j = 0; j < this.randomCoordsNodes.length; ++j) {
          if(this.randomCoordsNodes[j].value_XY[0] == randomCoord_XY[0] && this.randomCoordsNodes[j].value_XY[1] == randomCoord_XY[1]){//dont add random coord that is already added into list of random coord
            --i;
            continue nextCoord;
          }
        }
      }
      this.exports.coords.push(randomCoord_XY);
      this.randomCoordsNodes.push(new MapNode(null,randomCoord_XY,[]));
    }

    for(let i = 0; i < this.exports.coords.length; ++i){
      this.exports.neighbors.push(new Array());
    }
    
    this.randomCoordsNodes.forEach(node=>{
      myUI.nodeCanvas.drawCircle(node.value_XY);
    });
    
    
    //var otherRandomCoordsDistance = empty2D(randomCoordsNodes.length,randomCoordsNodes.length-1); // this contains the distance between a Coord and all other coord in a 2d array with the index of otherRandomCoordDistance corresponding to coord in  randomCoord
    
    var edgeAccumalator = [];
    for (let i = 0; i < this.randomCoordsNodes.length; ++i) {
      let currentCoord = [...this.randomCoordsNodes[i].value_XY];
      var distancesBetweenACoordAndAllOthers=[]; // index corresponds to index of randomCorrdNodes, 
      let otherRandomCoords = deep_copy_matrix(nodes_to_array(this.randomCoordsNodes,"value_XY")); // randomCoord passed by reference here
      
      for (let j = 0; j < otherRandomCoords.length; ++j) {
        if(i == j) continue;
        //distancesBetweenACoordAndAllOthers.push( Math.sqrt((this.randomCoordsNodes[i].value_XY[0] - otherRandomCoords[j][0])**2 + (this.randomCoordsNodes[i].value_XY[1]  - otherRandomCoords[j][1])**2)); // could store as before sqrt form
        // Math.sqrt -> Math.hypot
        distancesBetweenACoordAndAllOthers.push( [Math.hypot(currentCoord[0] - otherRandomCoords[j][0], currentCoord[1]  - otherRandomCoords[j][1]), j]); // could store as before sqrt form
      }
      distancesBetweenACoordAndAllOthers.sort((a,b)=>{
        return a[0] - b[0]; // sort by distance
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
        console.log(currentCoord, otherRandomCoords[jdx])
        var LOS = CustomLOSChecker(currentCoord, otherRandomCoords[jdx]).boolean;
        
        if(LOS){//if there is lOS then add neighbours(out of 5) to neighbours of node
          ++cnt;
          // bidirectional
          if(!this.randomCoordsNodes[i].neighbours.includes(jdx)) this.randomCoordsNodes[i].neighbours.push(jdx);
          if(!this.randomCoordsNodes[jdx].neighbours.includes(i)) this.randomCoordsNodes[jdx].neighbours.push(i);
          if(!this.exports.neighbors[i].includes(jdx)) this.exports.neighbors[i].push(jdx);
          if(!this.exports.neighbors[jdx].includes(i)) this.exports.neighbors[jdx].push(i);
          var temp = [currentCoord, otherRandomCoords[jdx]];
          //next few lines prevents the addition of edges that were already added but with a origin from another node
          var tempSwapped = [otherRandomCoords[jdx], currentCoord];
          
          for (let k = 0; k < edgeAccumalator.length; ++k){
            if (isArraysEqual(edgeAccumalator[k].flat(),tempSwapped.flat())){
              continue coordLoop;
            } 
          }
          edgeAccumalator.push(temp)//from,to
          this.exports.edges.push(temp);
        } 
        if(this.neighbourSelectionMethod == "Top Closest Visible Neighbours" && cnt >= this.numberOfTopClosestNeighbours) break coordLoop;
      }
    }
    
    for (let i = 0; i < edgeAccumalator.length; ++i) {
      myUI.edgeCanvas.drawLine(edgeAccumalator[i][0],edgeAccumalator[i][1]);
    }
    
    
    this.addStartGoalNode("goal",goal);
    this.addStartGoalNode("start",start);
    download("PRM Map.json", JSON.stringify(this.exports));
  }



  addStartGoalNode(isStartOrGoal = "start",coord_XY = [4,1]){

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

    
    myUI.nodeCanvas.drawCircle(coord_XY);

    var distancesBetweenACoordAndAllOthers=[]; // index corresponds to index of randomCoordNodes, 
 
    for (let i = 0; i < this.randomCoordsNodes.length; ++i) {
        distancesBetweenACoordAndAllOthers.push( [Math.hypot(coord_XY[0] - this.randomCoordsNodes[i].value_XY[0], coord_XY[1]  - this.randomCoordsNodes[i].value_XY[1]), i]); // could store as before sqrt form
    }
    
    distancesBetweenACoordAndAllOthers.sort((a,b)=>{
      return a[0] - b[0]; // sort by first index/sort by distances shortest at start
    });


    let indexOfSelectedRandomCoords;
    indexOfSelectedRandomCoords = distancesBetweenACoordAndAllOthers // same as code for   if(this.neighbourSelectionMethod == "Top Closest Visible Neighbours"")
      .map(p => p[1]);
  
    var selectedVertexIndex;
    let cnt = 0;
    coordLoop: for (let j = 0; j < indexOfSelectedRandomCoords.length; ++j) {
      let jdx = indexOfSelectedRandomCoords[j];
      if(i == jdx) continue; 
      //var LOS = BresenhamLOSChecker(this.randomCoordsNodes[i].value_XY, otherRandomCoords[jdx]);

      //below currently takes the first vertex that passes LOS
      var LOS = CustomLOSChecker(coord_XY, this.randomCoordsNodes[jdx].value_XY);
      if(LOS){//if there is lOS then add neighbours(out of 5) to neighbours of node
        ++cnt;
        // bidirectional
      
        selectedVertexIndex = jdx

        
      } 
      if(cnt >= 1) break coordLoop;
    }
    const selected_XY = this.randomCoordsNodes[selectedVertexIndex].value_XY;
    var selectedIndexForStartEndVertex = this.randomCoordsNodes.length // determined before push to array below

    this.exports.coords.push(coord_XY);
    this.exports.neighbors.push(new Array());
    this.randomCoordsNodes.push(new MapNode(null,coord_XY,new Array()));
    this.exports.edges.push([coord_XY,selected_XY]);
    myUI.edgeCanvas.drawLine(coord_XY,selected_XY);

    if(!this.randomCoordsNodes[selectedVertexIndex].neighbours.includes(selectedIndexForStartEndVertex)) this.randomCoordsNodes[selectedVertexIndex].neighbours.push(selectedIndexForStartEndVertex);
    if(!this.exports.neighbors[selectedVertexIndex].includes(selectedIndexForStartEndVertex)) this.exports.neighbors[selectedVertexIndex].push(selectedIndexForStartEndVertex);
    if(!this.randomCoordsNodes[selectedIndexForStartEndVertex].neighbours.includes(selectedVertexIndex)) this.randomCoordsNodes[selectedIndexForStartEndVertex].neighbours.push(selectedVertexIndex);
    if(!this.exports.neighbors[selectedIndexForStartEndVertex].includes(selectedVertexIndex)) this.exports.neighbors[selectedIndexForStartEndVertex].push(selectedVertexIndex);

    if (isStartOrGoal == "start"){
      console.log("Start:", this.randomCoordsNodes[selectedIndexForStartEndVertex]);
    }
    else{
      console.log("Goal:", this.randomCoordsNodes[selectedIndexForStartEndVertex]);
    }

    if (isStartOrGoal == "start" && this.prevStartCoord){
      this.prevStartCoordConnectedto = selected_XY;
    }
    else if (isStartOrGoal == "goal" && this.prevGoalCoord){
      this.prevGoalCoordConnectedto = selected_XY;
    }
  }
    
    
   
  

  search(start, goal) {
    if(!this.randomCoordsNodes) this.generateNewMap(start, goal);
    // this method finds the path using the prescribed map, start & goal coordinates
    this._init_search(start, goal);
		this.closed_list =  new Empty2D(this.map_height, this.map_width, !this.roundNodes);
		this.open_list =  new Empty2D(this.map_height, this.map_width, !this.roundNodes);

    console.log("starting");
   
    // starting node
    var nextNode = this.randomCoordsNodes.filter(node => node.value_XY[0] == start[0] && node.value_XY[1] == start[1])[0]; // PRM Node
    this.current_node =  new Node(0, 0, 0, null, nextNode.value_XY, null, nextNode.neighbours); // Regular Node
    
    // assigns the F, G, H cost to the node
    [this.current_node.f_cost, this.current_node.g_cost, this.current_node.h_cost] = this.calc_cost(this.current_node.self_XY);

    // pushes the starting node onto the queue
    this.queue.push(this.current_node);  // begin with the start; add starting node to rear of []
    console.log(this.current_node);
    debugger;
    
    if(!this.bigMap){
      // for every node that is pushed onto the queue, it should be added to the queue infotable
      this._create_action({command: STATIC.InsertRowAtIndex, dest: STATIC.ITQueue, infoTableRowIndex: 1, infoTableRowData: [nextNode.value_XY[0]+','+nextNode.value_XY[1], '-', parseFloat(this.current_node.f_cost.toPrecision(5)), parseFloat(this.current_node.g_cost.toPrecision(5)), parseFloat(this.current_node.h_cost.toPrecision(5))]});
      this._create_action({command: STATIC.DrawVertex, dest: STATIC.QU, nodeCoord: nextNode.value_XY});
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

      //this.visited.increment(this.current_node_XY); // marks current node XY as visited
      this._create_action({command: STATIC.DrawVertex, dest: STATIC.VI, nodeCoord: this.current_node_XY});
      
      if(!this.bigMap){
        this._create_action({command: STATIC.EraseAllRows, dest: STATIC.ITNeighbors});
        for (let i = 0; i < this.current_node.neighbours.length; ++i){
          const XY = this.randomCoordsNodes[this.current_node.neighbours[i]].value_XY;
          this._create_action({command: STATIC.InsertRowAtIndex, dest: STATIC.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: ["-" , `${XY[0].toPrecision(5)}, ${XY[1].toPrecision(5)}`, "?", "?", "?", "?"]})
        }
        this._create_action({command: STATIC.EraseRowAtIndex, dest: STATIC.ITQueue, infoTableRowIndex: 1});

        //this._create_action({command: STATIC.EC, dest: STATIC.NB});// erase all neighbours
        this._create_action({command: STATIC.EraseAllVertex, dest: STATIC.NB});

        //this._create_action({command: STATIC.DSP, dest: STATIC.CR, nodeCoord: this.current_node_XY}); //draw current
        this._create_action({command: STATIC.DrawSingleVertex, dest: STATIC.CR, nodeCoord: this.current_node_XY});

        //this._create_action({command: STATIC.EP, dest: STATIC.QU, nodeCoord: this.current_node_XY}); // erase vertex in queue
        this._create_action({command: STATIC.EraseVertex, dest: STATIC.QU, nodeCoord: this.current_node_XY}); // erase vertex in queue

        //this._create_action({command: STATIC.DSP, dest: STATIC.DT, nodeCoord: this.current_node_XY});
        this._create_action({command: STATIC.DrawSingleVertex, dest: STATIC.DT, nodeCoord: this.current_node_XY});
        this._create_action({command: STATIC.EraseAllEdge, dest: STATIC.DT});

        this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: STATIC.PC, pseudoCodeRow: 12});
      }//add
      this._save_step(true);

      //this._assign_cell_index(this.current_node_XY);

      /* FOUND GOAL */
      if(this._found_goal(this.current_node, "free_vertex")) return this._terminate_search(); // found the goal & exits the loop
      

      /* iterates through the 4 or 8 neighbors and adds the valid (passable & within boundaries of map) ones to the queue & neighbour array */
       for (let i = 0; i < this.current_node.neighbours.length; ++i){
        const idx = this.current_node.neighbours[i];
        var next_XY = this.randomCoordsNodes[idx].value_XY; // calculate the coordinates for the new neighbour
    

        let [f_cost, g_cost, h_cost] = this.calc_cost(next_XY);
        
        this._create_action({command: STATIC.EraseAllEdge, dest: STATIC.DT});
        this._create_action({command: STATIC.DrawEdge, dest: STATIC.DT, nodeCoord: next_XY, endCoord: this.current_node_XY});
        
        let next_node = new Node(f_cost, g_cost, h_cost, this.current_node, next_XY, null, this.randomCoordsNodes[idx].neighbours);
        let open_node = this.open_list.get(next_XY);
        if(open_node !== undefined && open_node.f_cost<=f_cost){
          if(!this.bigMap){
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: STATIC.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [`-`, `${next_XY[0].toPrecision(5)}, ${next_XY[1].toPrecision(5)}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Not a child"]});
            this._create_action({command: STATIC.DrawSingleVertex, dest: STATIC.DT, nodeCoord: next_XY});
            this._save_step(false);
          }
          continue; // do not add to queue if open list already has a lower cost node
        }
        let closed_node = this.closed_list.get(next_XY);
        if(closed_node !== undefined && closed_node.f_cost<=f_cost){
          if(!this.bigMap){
            if(this.current_node.parent.self_XY[0] == next_XY[0] && this.current_node.parent.self_XY[1] == next_XY[1])
              this._create_action({command: STATIC.UpdateRowAtIndex, dest: STATIC.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [`-`, `${next_XY[0].toPrecision(5)}, ${next_XY[1].toPrecision(5)}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Parent"]});  //  a parent must be visited already
            else
              this._create_action({command: STATIC.UpdateRowAtIndex, dest: STATIC.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [`-`, `${next_XY[0].toPrecision(5)}, ${next_XY[1].toPrecision(5)}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Not a child"]});
            this._create_action({command: STATIC.DrawSingleVertex, dest: STATIC.DT, nodeCoord: next_XY});
          }
          
          /* no longer required as closed list functions as visited */
          /* and INC_P keeps tracks of how many times a node is visited */
          //this.visited.increment(next_XY); 

          // increment after visiting a node on the closed list
          /*this._create_action({command: STATIC.INC_P, dest: STATIC.VI, nodeCoord: next_XY});*///add on
          this._save_step(false);
          continue; // do not add to queue if closed list already has a lower cost node
        }

        this._create_action({command: STATIC.SP, dest: STATIC.FCanvas, nodeCoord: next_XY, cellVal: f_cost});
        this._create_action({command: STATIC.SP, dest: STATIC.GCanvas, nodeCoord: next_XY, cellVal: g_cost});
        this._create_action({command: STATIC.SP, dest: STATIC.HCanvas, nodeCoord: next_XY, cellVal: h_cost});
        
        // since A* is a greedy algorithm, it requires visiting of nodes again even if it has already been added to the queue
        // see https://www.geeksforgeeks.org/a-search-algorithm/
        
        if(!this.bigMap){
          this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: STATIC.PC, pseudoCodeRow: 32});
      
          this._create_action({command: STATIC.DrawVertex, dest: STATIC.QU, nodeCoord: next_XY});
          this._create_action({command: STATIC.DrawVertex, dest: STATIC.NB, nodeCoord: next_XY}); //add on

          // counts the number of nodes that have a lower F-Cost than the new node
          // to find the position to add it to the queue
          let numLess = this.queue.filter(node => node.f_cost < next_node.f_cost).length;
          
          this._create_action({command: STATIC.InsertRowAtIndex, dest: STATIC.ITQueue, infoTableRowIndex: numLess+1, infoTableRowData: [next_XY[0]+','+next_XY[1], this.current_node_XY[0]+','+this.current_node_XY[1], parseFloat(next_node.f_cost.toPrecision(5)), parseFloat(next_node.g_cost.toPrecision(5)), parseFloat(next_node.h_cost.toPrecision(5))]});
          
          if(open_node===undefined && closed_node===undefined) 
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: STATIC.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [`-`, `${next_XY[0].toPrecision(5)}, ${next_XY[1].toPrecision(5)}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "New encounter"]});
          else if(open_node)
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: STATIC.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [`-`, `${next_XY[0].toPrecision(5)}, ${next_XY[1].toPrecision(5)}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Replace parent"]});
            this._create_action({command: STATIC.DrawSingleVertex, dest: STATIC.DT, nodeCoord: next_XY});
        }
        this._save_step(false);

        // add to queue 
        if(this.timeOrder=="FIFO") this.queue.push(next_node); // FIFO
        else this.queue.unshift(next_node); // LIFO
        this.open_list.set(next_XY, next_node);  // add to open list

        if(this._found_goal(next_node, "free_vertex")) return this._terminate_search();
      }


      // continue to next node in queue
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search(planner, planner.batch_size)), planner.batch_interval);
    });
  }
}
