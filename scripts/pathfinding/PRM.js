class PRM extends GridPathFinder{

	static get display_name(){
		return "PRM";
  }
  infoMapPlannerMode(){
    return "PRM";
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

  get configs(){
		let configs = [];
		configs.push(
      {uid: "generate_new_map", displayName: "Generate new map", options: "button", description: `generates a new PRM map`},
      {uid: "seed", displayName: "Seed:", options: "text", defaultVal: "pi", description: `Sets seed for randomness of random points`},
      {uid: "sample_size", displayName: "Sample Size:", options: "number", defaultVal: 10, description: `Sets number of random points`},
      {uid: "neighbour_selection_method", displayName: "Neighbour Selection Method", options: ["Top Closest Neighbours", "Closest Neighbours By Radius"],defaultVal:"Closest Neighbours By Radius", description: `Sets neighbours selection method`},
      {uid: "number_of_closest_neighbours", displayName: "Number of Closest Neighbours", options: "number",defaultVal:4, description: `Sets number of closest neighbours to select`},
      {uid: "closest_neighbours_by_radius", displayName: "Closest Neighbours By Radius", options: "number",defaultVal:15, description: `Sets radius of closest neighbours to select`},
      {uid: "distance_metric", displayName: "Distance Metric:", options: ["Octile", "Manhattan", "Euclidean", "Chebyshev"], defaultVal:"Manhattan", description: `The metrics used for calculating distances.<br>Octile is commonly used for grids which allow movement in 8 directions. It sums the maximum number of diagonal movements, with the residual cardinal movements.<br>Manhattan is used for grids which allow movement in 4 cardinal directions. It sums the absolute number of rows and columns (all cardinal) between two cells.<br>Euclidean takes the L2-norm between two cells, which is the real-world distance between two points. This is commonly used for any angle paths.<br>Chebyshev is the maximum cardinal distance between the two points. It is taken as max(y2-y1, x2-x1) where x2>=x1 and y2>=y1.`},
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
      case "generate_new_map":
         this.seed = generateString(5);
         document.getElementById("seed_pcfg").setAttribute("value", myUI.planner.seed)
				this.generateNewMap(myUI.map_start, myUI.map_goal);
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
    }
  }

  set_distance_metric(metric){
    this.distance_metric = metric;
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
   
      
   
    //clears SVG canvas
    if(document.getElementById("node_edge")){
      document.getElementById("node_edge").innerHTML = "";
    }

  
    var seed = cyrb128(this.seed);
    var rand = mulberry32(seed[0]);
     //connectionDistance  
    this.randomCoordsNodes = []
    this.randomCoordsNodes.push(new PRMNode(0,0,0,null,start,[]))
    
    for (let i = 0; i < this.sampleSize; ++i) {
      var randomCoord_XY = [Math.round(rand()*(myUI.map_arr.length/*this.map_height*/)), Math.round(rand()*(myUI.map_arr[0].length/*this.map_width*/))] //need seed
      /*
      if (myUI.planner.map.get_data(randomCoord_XY) == 0) {  // if neighbour is not passable
        --i;
        continue;
      }
      */
      
      if(this.randomCoordsNodes.length != 0){
        for (let j = 0; j < this.randomCoordsNodes.length; ++j) {
          if(this.randomCoordsNodes[j].value_XY[0] == randomCoord_XY[0] && this.randomCoordsNodes[j].value_XY[1] == randomCoord_XY[1]){//dont add random coord that is already added into list of random coord
            --i;
            continue;
          }
        }
      }
      
      this.randomCoordsNodes.push(new PRMNode(0,0,0,null,randomCoord_XY,[]));
    }
   
    this.randomCoordsNodes.push(new PRMNode(0,0,0,null,goal,[]))
    console.log("random coods node",this.randomCoordsNodes);
    //myUI.canvases["path"].draw_canvas(randomCoords, `1d`, false, false);
    
    this.randomCoordsNodes.forEach(node=>{
        myUI.SVGCanvas.drawCircle(node.value_XY,20,"grey")
      });
    
    
    
    //var otherRandomCoordsDistance = empty2D(randomCoordsNodes.length,randomCoordsNodes.length-1); // this contains the distance between a Coord and all other coord in a 2d array with the index of otherRandomCoordDistance corresponding to coord in  randomCoord
    var XYOfSelectedRandomCoordNeighbours = [];
    
    var edgeAccumalator = [];
     for (let i = 0; i < this.randomCoordsNodes.length; ++i) {
       var distancesBetweenACoordAndAllOthers=[]; // index corresponds to index of randomCorrdNodes, 
       // var otherRandomCoordsNodes = structuredClone(randomCoordsNodes);
       // otherRandomCoordsNodes.splice(i, 1); // from here is otherRandomCoordsNodes really correctly labeleld
        //if(i=0)console.log(otherRandomCoordsNodes[0],"otherRandomCoordsNodes");
        let otherRandomCoords = deep_copy_matrix(nodes_to_array(this.randomCoordsNodes,"value_XY")); // randomCoord passed by reference here
        //document.getElementById("1").innerHTML =randomCoords;
        otherRandomCoords.splice(i, 1); // from here is otherRandomCoords really correctly labeleld
       // document.getElementById("2").innerHTML ="modified array:" + otherRandomCoords+" original array:"+randomCoords+" index removed:"+i;
      
        //otherRandomCoordsDistance.push([]); 
        
        for (let j = 0; j < otherRandomCoords.length; ++j) {
         
          distancesBetweenACoordAndAllOthers.push( Math.sqrt((this.randomCoordsNodes[i].value_XY[0] - otherRandomCoords[j][0])**2 + (this.randomCoordsNodes[i].value_XY[1]  - otherRandomCoords[j][1])**2)); // could store as befopre sqrt form
         // document.getElementById("3").innerHTML ="distance of first index coor to other coord ^2: "+otherRandomCoordsDistance[0];
        }

       
        /*if( neighbourSelectionMethod == "Top Closest Neighbours" ){
          var indexOfSelectedOtherRandomCoords = Object.entries(distancesBetweenACoordAndAllOthers) // returns array with index of the 5 lowest values in array
                          .sort(([,a],[,b]) => a - b)
                          .map(([index]) => +index)
                          .slice(0, numberOfTopClosestNeighbours)
          console.log("Top Closest Neighbours")
                          
        }
        else if (neighbourSelectionMethod == "Closest Neighbours By Radius" ){
         
          var indexOfSelectedOtherRandomCoords = Object.entries(distancesBetweenACoordAndAllOthers) // returns array with index of the 5 lowest values in array
                          .sort(([,a],[,b]) => a - b)
                          .map(([index]) => +index);
                          
          for (let j = 0; j < otherRandomCoords.length; ++j) {
            if(distancesBetweenACoordAndAllOthers[indexOfSelectedOtherRandomCoords[j]]>connectionDistance ){
            indexOfSelectedOtherRandomCoords = indexOfSelectedOtherRandomCoords.slice(0, j);
            break;
          }
          console.log("Closest Neighbours By Radius")
        }*/

          var indexOfSelectedOtherRandomCoords = Object.entries(distancesBetweenACoordAndAllOthers) // returns array with index of the 5 lowest values in array
                          .sort(([,a],[,b]) => a - b)
                          .map(([index]) => +index);
                          
          for (let j = 0; j < otherRandomCoords.length; ++j) {
            if(distancesBetweenACoordAndAllOthers[indexOfSelectedOtherRandomCoords[j]]>=this.connectionDistance  || j >= this.numberOfTopClosestNeighbours){
            indexOfSelectedOtherRandomCoords = indexOfSelectedOtherRandomCoords.slice(0, j);
            break;
          }
          console.log("Closest Neighbours By Radius")

      
           
       
      }
       

    
      
      for (let j = 0; j < indexOfSelectedOtherRandomCoords.length; ++j) {
    
        var LOS = BresenhamLOSChecker(this.randomCoordsNodes[i].value_XY, otherRandomCoords[indexOfSelectedOtherRandomCoords[j]]);
        if(LOS){//if there is lOS then add neighbours(out of 5) to neighbours of node
          this.randomCoordsNodes[i].neighbours.push(otherRandomCoords[indexOfSelectedOtherRandomCoords[j]]);
          var continueLoop = false;
          var temp = [this.randomCoordsNodes[i].value_XY,otherRandomCoords[indexOfSelectedOtherRandomCoords[j]]];
          //next few lines prevents the addition of edges that were already added but with a origin from another node
          var tempSwapped = [otherRandomCoords[indexOfSelectedOtherRandomCoords[j]],this.randomCoordsNodes[i].value_XY];
          for (let k = 0; k < edgeAccumalator.length; ++k){
            if (isArraysEqual(edgeAccumalator[k].flat(),tempSwapped.flat())){
              var continueLoop = true;
              console.log("skipped")
            } 
          }
          if(continueLoop)continue;
         
          edgeAccumalator.push(temp)//from,to
        } 
    
      }
    //const distances = [1, 4, 8, 3, 3, 5, 9, 0, 4, 2];
      
    
    }
    
    for (let i = 0; i < edgeAccumalator.length; ++i) {
      myUI.SVGCanvas.drawLine(edgeAccumalator[i][0],edgeAccumalator[i][1]);
    }

//    var nextelement = myUI.planner.randomCoordsNodes.shift();
 //   console.log("randomCoordsNodes",nextelement);

/*
    this._init_search(start, goal);
    this.current_node = randomCoordsNodes[-2];
    [this.current_node.f_cost, this.current_node.g_cost, this.current_node.h_cost] = this.calc_cost(this.current_node.self_XY);
    this.queue.push(this.current_node);



    this.current_node = this.queue.shift(); // remove the first node in queue
    this.current_node_XY = this.current_node.self_XY; // first node in queue XY
    //this.queue.push(this.current_node);  

*/


    
    
    /*
    for (let i = 0; i < edgeAccumalator.length; ++i){
  
      if(isArraysEqual(edgeAccumalator[i][0],current_XY)){
      
      }
      else if(isArraysEqual(edgeAccumalator[i][1],current_XY)){
      
      }
      
        
    }
      */
    
  

    

  }

  search(start, goal) {
    if(!this.randomCoordsNodes) this.generateNewMap(start, goal);
      console.log(this.randomCoordsNodes[0].f_cost,"fcost");
    console.log(this.randomCoordsNodes[0].neighbours,"neighborus");
    // this method finds the path using the prescribed map, start & goal coordinates
    this._init_search(start, goal);
		this.closed_list =  new Empty2D(this.map_height, this.map_width);
		this.open_list =  new Empty2D(this.map_height, this.map_width);

    console.log("starting");
   
    // starting node
    var nextNode = this.randomCoordsNodes.shift();
    this.current_node =  new Node(0, 0, 0, null, nextNode.value_XY, undefined, 0,nextNode.neighbours);
       // constructor(f_cost, g_cost, h_cost, parent = null, value_XY,neighbours = null) {
     // 	constructor(f_cost, g_cost, h_cost, parent, self_XY, arrow_index,id){
      
     // new Node(0, 0, 0, null, this.start, undefined, 0);

    // assigns the F, G, H cost to the node
    [this.current_node.f_cost, this.current_node.g_cost, this.current_node.h_cost] = this.calc_cost(this.current_node.self_XY);

    // pushes the starting node onto the queue
    this.queue.push(this.current_node);  // begin with the start; add starting node to rear of []
    
    if(!this.bigMap){

      // initialize the starting sequences
     this.current_node.neighbours.slice().forEach(item=>
        this._create_action({command: STATIC.InsertRowAtIndex, dest: STATIC.ITNeighbors, infoTableRowIndex: 1, infoTableRowData: [item, "?", "?", "?", "?", "?"]})
      );

      // for every node that is pushed onto the queue, it should be added to the queue infotable
      this._create_action({command: STATIC.InsertRowAtIndex, dest: STATIC.ITQueue, infoTableRowIndex: 1, infoTableRowData: [start[0]+','+start[1], '-', parseFloat(this.current_node.f_cost.toPrecision(5)), parseFloat(this.current_node.g_cost.toPrecision(5)), parseFloat(this.current_node.h_cost.toPrecision(5))]});
      this._create_action({command: STATIC.DrawVertex, dest: STATIC.QU, nodeCoord: start});
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
      this.open_list[this.current_node_XY] = undefined;

      if(this.step_index % 100==0) console.log(`F: ${this.current_node.f_cost.toPrecision(5)}, H: ${this.current_node.h_cost.toPrecision(5)}`);
      
      /* first check if visited */
      if (this.closed_list.get(this.current_node_XY) && this.closed_list.get(this.current_node_XY).f_cost <= this.current_node.f_cost){
        continue;  // if the current node has been visited, skip to next one in queue
      }/* */
      
			this.closed_list.set(this.current_node_XY, this.current_node);
      this.open_list.set(this.current_node_XY, undefined); // remove from open list
/*
      //this.visited.increment(this.current_node_XY); // marks current node XY as visited
      this._create_action({command: STATIC.INC_P, dest: STATIC.VI, nodeCoord: this.current_node_XY});
      
      if(!this.bigMap){
        for (let i = 0; i < this.current_node.neighbours.length; ++i){
          this._create_action({command: STATIC.UpdateRowAtIndex, dest: STATIC.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.current_node.neighbours[i], "?", "?", "?", "?", "?"]})
        }
        this._create_action({command: STATIC.EraseRowAtIndex, dest: STATIC.ITQueue, infoTableRowIndex: 1});
        //this._create_action({command: STATIC.EC, dest: STATIC.DT, nodeCoord: this.current_node_XY});
        this._create_action({command: STATIC.DSP, dest: STATIC.DT, nodeCoord: this.current_node_XY});
        this._create_action({command: STATIC.EC, dest: STATIC.NB});// erase all neighbours
        this._create_action({command: STATIC.DSP, dest: STATIC.CR, nodeCoord: this.current_node_XY}); //draw current
        this._create_action({command: STATIC.EP, dest: STATIC.QU, nodeCoord: this.current_node_XY}); // erase vertex in queue
        this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: STATIC.PC, pseudoCodeRow: 12});
      }*/ //add
      this._save_step(true);

      this._assign_cell_index(this.current_node_XY);

      /* FOUND GOAL */
      if(this._found_goal(this.current_node)) return this._terminate_search(); // found the goal & exits the loop

      

      /* iterates through the 4 or 8 neighbors and adds the valid (passable & within boundaries of map) ones to the queue & neighbour array */
       for (let i = 0; i < this.current_node.neighbours.length; ++i){
        var next_XY = this.current_node.neighbours[i]; // calculate the coordinates for the new neighbour
        
         
/*
        if(!this.bigMap){
          this._create_action({command: STATIC.DSP, dest: STATIC.DT, nodeCoord: next_XY});
        }
        */
    

        let [f_cost, g_cost, h_cost] = this.calc_cost(next_XY);
        var nextNode = this.randomCoordsNodes.shift();
        let new_node = new Node(f_cost, g_cost, h_cost, nextNode.value_XY, next_XY, undefined, this.step_index, nextNode.neighbours);
        let open_node = this.open_list.get(next_XY);
        if(open_node !== undefined && open_node.f_cost<=f_cost){
          if(!this.bigMap){
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: STATIC.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], `${next_XY[0]}, ${next_XY[1]}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Not a child"]});
            this._save_step(false);
          }
          continue; // do not add to queue if open list already has a lower cost node
        }
        let closed_node = this.closed_list.get(next_XY);
        if(closed_node !== undefined && closed_node.f_cost<=f_cost){
          if(!this.bigMap){
            if(this.current_node.parent.self_XY[0] == next_XY[0] && this.current_node.parent.self_XY[1] == next_XY[1])
              this._create_action({command: STATIC.UpdateRowAtIndex, dest: STATIC.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], `${next_XY[0]}, ${next_XY[1]}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Parent"]});  //  a parent must be visited already
            else
              this._create_action({command: STATIC.UpdateRowAtIndex, dest: STATIC.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], `${next_XY[0]}, ${next_XY[1]}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Not a child"]});
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
          /*this._create_action({command: STATIC.DP, dest: STATIC.NB, nodeCoord: next_XY});*/ //add on
          this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: STATIC.PC, pseudoCodeRow: 32});
      

         this._create_action({command: STATIC.DrawVertex, dest: STATIC.QU, nodeCoord: next_XY});

          // counts the number of nodes that have a lower F-Cost than the new node
          // to find the position to add it to the queue
          let numLess = this.queue.filter(node => node.f_cost < new_node.f_cost).length;
          
          this._create_action({command: STATIC.InsertRowAtIndex, dest: STATIC.ITQueue, infoTableRowIndex: numLess+1, infoTableRowData: [next_XY[0]+','+next_XY[1], this.current_node_XY[0]+','+this.current_node_XY[1], parseFloat(new_node.f_cost.toPrecision(5)), parseFloat(new_node.g_cost.toPrecision(5)), parseFloat(new_node.h_cost.toPrecision(5))]});
          
          if(open_node===undefined && closed_node===undefined) 
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: STATIC.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], `${next_XY[0]}, ${next_XY[1]}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "New encounter"]});
          else if(open_node)
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: STATIC.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [this.deltaNWSE[i], `${next_XY[0]}, ${next_XY[1]}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Replace parent"]});
        }
        this._save_step(false);

        // add to queue 
        if(this.timeOrder=="FIFO") this.queue.push(new_node); // FIFO
        else this.queue.unshift(new_node); // LIFO
        this.open_list.set(next_XY, new_node);  // add to open list

        if(this._found_goal(new_node)) return this._terminate_search();
      }
      // continue to next node in queue
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search(planner, planner.batch_size)), planner.batch_interval);
    });
  }
}
