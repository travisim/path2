class RRT_star extends GridPathFinder{

	static get display_name(){
		return "RRT*";
  }
  infoMapPlannerMode(){
    return "RRT_star";
  }

  static drawMode = "Free Vertex";

  static get addGoalRadius() {
    return 1;
  }

  static get indexOfCollapsiblesToExpand() {
    return [ 1, 2, 3, 4];
  }
  static get pseudoCode() {
    return {
      code: "T ← InitializeTree();\nT ← InsertNode(∅, Zinit , T ); \nfor i = 1 to i = N do \n  Zrand ← Sample(i);\n  Znearest ←Nearest(T,Zrand); \n  (Xnew,Unew,Tnew) ← Steer(Znearest,Zrand);\n  if ObstacleFree(Xnew) then \n    Znear ←Near(T, Znew,|V|);\n    Zmin ← ChooseParent(Znear, Znearest, Znew, Xnew);\n    T ←InsertNode(Zmin, Znew, T);\n    T ←ReWire(T, Znear, Zmin, Znew); \nreturn T;",
      reference:"S. Karaman, M. R. Walter, A. Perez, E. Frazzoli and S. Teller, \"Anytime Motion Planning using the RRT*,\" 2011 IEEE International Conference on Robotics and Automation, Shanghai, China, 2011, pp. 1478-1483, doi: 10.1109/ICRA.2011.5980479."
    }
  }
  
  
  static get infoTables(){
    return [
      {id:"ITStatistics", displayName: "Statistics", headers: ["Indicator ", "Value"], fixedContentOfFirstRowOfHeaders:["Number Of Nodes","Path Distance"]},      
			{id:"ITNeighbors", displayName: "Neighbors", headers:["Vertex", "F-Cost", "G-Cost", "H-Cost", "State"]},
      {id: "ITQueue", displayName: "Queue", headers: ["Vertex", "Parent", "F-Cost", "G-Cost", "H-Cost"] },
      
		];
	}
  static get distance_metrics(){
    return ["Euclidean"];
  }

  static get hoverData(){
    return [
      //{id: "hoverCellVisited", displayName: "Times Visited", type: "canvasCacheArray", canvasId: "visited"},
      // {id: "hoverFCost", displayName: "F Cost", type: "canvasCacheArray", canvasId: "fCost"},
      // {id: "hoverGCost", displayName: "G Cost", type: "canvasCacheArray", canvasId: "gCost"},
      // {id: "hoverHCost", displayName: "H Cost", type: "canvasCacheArray", canvasId: "hCost"},
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
				id:"networkGraph", drawType:"svg", drawOrder: 19, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["grey", "red"], toggle: "multi", checked: true, bigMap: true, minVal: 1, maxVal: 1, infoMapBorder: true, infoMapValue: null,
			},
			{
				id:"intermediaryMapExpansion", drawType:"svgDotted", drawOrder: 12, fixedResVal: 1024, valType: "integer", defaultVal: Number.POSITIVE_INFINITY, colors:["#0FFF50", "rgb(0, 204, 255)"], toggle: "multi", checked: false, bigMap: true, minVal: null, maxVal: null, infoMapBorder: false, infoMapValue: null,
			},
    ])
    if(this.bigMap){
      canvases = canvases.filter(conf => conf.bigMap);
    }
    return canvases;
  }
  static get configs(){
		let configs = [];
		configs.push(
      {uid: "generate_new_map", displayName: "Generate new map", options: "button", description: `generates a new RRT* map`},
      {uid: "seed", displayName: "Seed:", options: "text", defaultVal: "", description: `Sets seed for randomness of random points`},
      {uid: "sample_size", displayName: "Sample Size:", options: "number", defaultVal: 130, description: `Sets number of random points`},
      {uid: "neighbour_selection_method", displayName: "neighbours selection method", options: ["Closest Neighbours By Radius"],defaultVal:"Closest Neighbours By Radius", description: `Sets neighbours selection method`},
      {uid: "number_of_closest_neighbours", displayName: "Number of Closest Neighbours", options: "number",defaultVal:3, description: `Sets number of closest neighbours to select`},
      {uid: "closest_neighbours_by_radius", displayName: "Closest Neighbours By Radius", options: "number",defaultVal:3, description: `Sets radius of closest neighbours to select`},
      {uid: "max_distance_between_nodes", displayName: "Max Distance Between Nodes", options: "number",defaultVal:5, description: `Sets maximum distance between 2 nodes`},
      {uid: "goal_radius", displayName: "Goal Radius", options: "number", defaultVal: 3, description: `Sets radius of goal` },
      {uid: "round_nodes", displayName: "Round Node Values", options: ["Allow Floats","Round to Nearest Integer", ], description: `Round the nodes`},
      {uid: "distance_metric", displayName: "Distance Metric:", options: ["Euclidean"], defaultVal:"Euclidean", description: `The metrics used for calculating distances.<br>Octile is commonly used for grids which allow movement in 8 directions. It sums the maximum number of diagonal movements, with the residual cardinal movements.<br>Manhattan is used for grids which allow movement in 4 cardinal directions. It sums the absolute number of rows and columns (all cardinal) between two cells.<br>Euclidean takes the L2-norm between two cells, which is the real-world distance between two points. This is commonly used for any angle paths.<br>Chebyshev is the maximum cardinal distance between the two points. It is taken as max(y2-y1, x2-x1) where x2>=x1 and y2>=y1.`},
      {uid: "g_weight", displayName: "G-Weight:", options: "number", defaultVal: 1, description: `Coefficient of G-cost when calculating the F-cost. Setting G to 0 and H to positive changes this to the greedy best first search algorithm.`},
      {uid: "h_weight", displayName: "H-Weight:", options: "number", defaultVal: 1, description: `Coefficient of H-cost when calculating the F-cost. Setting H to 0 and G to positive changes this to Dijkstra's algorithm.`},
      {uid: "h_optimized", displayName: "H-optimized:", options: ["On", "Off"], description: `For algorithms like A* and Jump Point Search, F-cost = G-cost + H-cost. This has priority over the time-ordering option.<br> If Optimise is selected, when retrieving the cheapest vertex from the open list, the vertex with the lowest H-cost among the lowest F-cost vertices will be chosen. This has the effect of doing a Depth-First-Search on equal F-cost paths, which can be faster.<br> Select Vanilla to use their original implementations`},  
      {uid: "time_ordering", displayName: "Time Ordering:", options: ["FIFO", "LIFO"], description: `When sorting a vertex into the open-list or unvisited-list and it has identical cost* to earlier entries, select: <br>FIFO to place the new vertex behind the earlier ones, so it comes out after them<br> LIFO to place the new vertex in front of the earlier ones, so it comes out before them.<br>* cost refers to F-cost & H-cost, if F-H-Cost Optimisation is set to "Optimise", otherwise it is the F-cost for A*, G-cost for Dijkstra and H-cost for GreedyBestFirst)`});

    return configs;
  }

  constructor(num_neighbors = 8, diagonal_allow = true, first_neighbour = "N", search_direction = "anticlockwise") {
    super(num_neighbors, diagonal_allow, first_neighbour, search_direction);
    this.generateDests(); // call this in the derived class, not the base class because it references derived class properties (canvases, infotables)
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
l        }
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
        break;
      case "goal_radius":
        this.goalRadius = value;
      case "max_distance_between_nodes":
        this.pointsXawayFromSource = value;

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
    this.setConfig("mapType", "Grid Vertex Float");
  }

  generateNewMap(start = [0, 0], goal = [13, 13]) {
    
    this.prevGoalCoord = [];
    this.prevGoalCoordConnectedto = [];
     //[0,0],[13,13],this.seed,this.samplesSize, this.neighbourSelectionMethod,this.numberOfTopClosestNeighbours,this.connectionDistance
    this.exports = {coords:[],neighbours:[],edges:[]};
    //clears SVG canvas
    
    myUI.nodeCanvas.reset()
    myUI.edgeCanvas.reset()

    this.exports.config = {seed:this.seed, sample_size: this.sampleSize, neighbor_selection_method: this.neighbourSelectionMethod, num_closest: this.numberOfTopClosestNeighbours, round_nodes: this.roundNodes};
    var seed = cyrb128(this.seed);
    this.rand = mulberry32(seed[0]);
    this.choosenCoordsNodes = [];
    var edgeAccumalator = [];
    this.choosenCoordsNodes.push(new MapNode(null,start,[],null,null,0));//last 2 parameters are  additionalCoord, additionalEdge) 
    
   // myUI.nodeCanvas.drawCircle(start);
   
    // this._create_action({ command: STATIC.DrawEdge, dest: this.dests.intermediaryMapExpansion, nodeCoord: [2,2], endCoord: [8,8] });
    this._create_action({ command: STATIC.CreateStaticRow, dest: this.dests.ITStatistics, id: "NumberOfNodes", value: "Number Of Nodes" });
    this._create_action({ command: STATIC.CreateStaticRow, dest: this.dests.ITStatistics, id: "PathDistance", value: "Path Distance" });
    this._create_action({ command: STATIC.EditStaticRow, dest: this.dests.ITStatistics, id: "NumberOfNodes", value: "0" });
    this._create_action({ command: STATIC.EditStaticRow, dest: this.dests.ITStatistics, id: "PathDistance", value: "∞" });
    
    this._create_action({ command: STATIC.DrawVertex, dest: this.dests.networkGraph, nodeCoord: start });
    this._create_action({ command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 1 });
  
    this._save_step(true);
    
   
    //var testrandom = [[10,3],[4,20],[15,2]]
    
    for (let i = 0; i < this.sampleSize; ++i) {
        var randomCoord_XY = [this.rand()*myUI.map_height, this.rand()*myUI.map_width]; //need seed
       // var randomCoord_XY = testrandom[i];
        this._create_action({command: STATIC.HighlightPseudoCodeRowSec, dest: this.dests.pseudocode, pseudoCodeRow: 2});
        this._create_action({ command: STATIC.DrawVertex, dest: this.dests.intermediaryMapExpansion, nodeCoord: randomCoord_XY, colorIndex: 1});
        this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 3});
        this._save_step(false);
        
        var nearestNode_Index = getNearestNodeIndexInTreeToRandomCoord(this.choosenCoordsNodes, randomCoord_XY);
        
        this._create_action({ command: STATIC.DrawSingleVertex, dest: this.dests.expanded, nodeCoord: this.choosenCoordsNodes[nearestNode_Index].value_XY});
        this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 4});
        this._create_action({ command: STATIC.DrawEdge, dest: this.dests.intermediaryMapExpansion, nodeCoord: this.choosenCoordsNodes[nearestNode_Index].value_XY, endCoord: randomCoord_XY });
        this._save_step(false);
        //myUI.edgeCanvas.drawLine(this.choosenCoordsNodes[nearestNode_Index].value_XY, randomCoord_XY, dest);
        var nextCoordToAdd_XY = getCoordinatesofPointsXAwayFromSource(this.choosenCoordsNodes[nearestNode_Index].value_XY,randomCoord_XY,this.pointsXawayFromSource);
        this._create_action({ command: STATIC.DrawVertex, dest: this.dests.intermediaryMapExpansion, nodeCoord: nextCoordToAdd_XY });
        this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 5});
        this._save_step(false)
      
        if (CustomLOSChecker(this.choosenCoordsNodes[nearestNode_Index].value_XY, nextCoordToAdd_XY).boolean){ // checks if new randomm coord is on a non-obstacle coord and if path from parent to node has LOS
          //myUI.edgeCanvas.drawLine(this.choosenCoordsNodes[nearestNode_Index].value_XY,nextCoordToAdd_XY);
          //myUI.nodeCanvas.drawCircle(nextCoordToAdd_XY);
         
          //if(this.choosenCoordsNodes.length == 1) myUI.edgeCanvas.drawLine(start,nextCoordToAdd_XY);;
          //myUI.edgeCanvas.drawLine(nextCoordToAdd_XY,randomCoord_XY,true);
         // myUI.nodeCanvas.drawCircle(randomCoord_XY);

          var nodesNearby_Index = getNodesNearby(this.choosenCoordsNodes, nextCoordToAdd_XY, this.neighbourSelectionMethod, this.connectionDistance,this.numberOfTopClosestNeighbours); 
          nodesNearby_Index.forEach(element => {
            this._create_action({ command: STATIC.DrawVertex, dest: this.dests.neighbors, nodeCoord: this.choosenCoordsNodes[element].value_XY }); 
          });
          this._create_action({ command: STATIC.DrawVertex, dest: this.dests.networkGraph, nodeCoord: nextCoordToAdd_XY });
          this._create_action({ command: STATIC.EditStaticRow, dest: this.dests.ITStatistics, id: "NumberOfNodes",value:"++"});
          this._create_action({command: STATIC.DrawVertex, dest: this.dests.intermediaryMapExpansion, nodeCoord: nextCoordToAdd_XY,radius: this.connectionDistance.toString()});
          this._create_action({command: STATIC.HighlightPseudoCodeRowSec, dest: this.dests.pseudocode, pseudoCodeRow: 6});
          this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 7});
          this._save_step(false);

          var selectedParent_Index = determineParentWithLowestCost(nodesNearby_Index,nextCoordToAdd_XY,nearestNode_Index,this.choosenCoordsNodes);
         // myUI.edgeCanvas.drawLine(this.choosenCoordsNodes[selectedParent_Index].value_XY, nextCoordToAdd_XY);

          this._create_action({command: STATIC.DrawSingleVertex, dest: this.dests.expanded, nodeCoord: this.choosenCoordsNodes[selectedParent_Index].value_XY, colour:"pink"});
          this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 8});
          this._save_step(false);
          this._create_action({ command: STATIC.DrawEdge, dest: this.dests.networkGraph, nodeCoord: this.choosenCoordsNodes[selectedParent_Index].value_XY, endCoord: nextCoordToAdd_XY });
          this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 9});
          this._save_step(false);
          this.insertNodeToTree(selectedParent_Index, nextCoordToAdd_XY, [selectedParent_Index], randomCoord_XY, [nextCoordToAdd_XY, randomCoord_XY]);
          this.rewireTree(this.choosenCoordsNodes.length - 1, nodesNearby_Index)
          
          this._create_action({ command: STATIC.UnhighlightAllPseudoCodeRowSec, dest: this.dests.pseudocode });
          this._create_action({command: STATIC.HighlightPseudoCodeRowSec, dest: this.dests.pseudocode, pseudoCodeRow: 2});
          
          this._create_action({ command: STATIC.EraseAllVertex, dest: this.dests.neighbors });
          this._create_action({ command: STATIC.EraseAllVertex, dest: this.dests.intermediaryMapExpansion });
          this._create_action({command: STATIC.EraseAllEdge, dest: this.dests.intermediaryMapExpansion});
          this._save_step(true);
          //parent, value_XY,neighbours, additionalCoord, additionalEdge, g_cost) parent left as null here as it is not used in search()
          //g cost calculated within in insertNodeToTree()
      } 
        else { // if no LOS
          
          this._create_action({ command: STATIC.EraseAllVertex, dest: this.dests.neighbors });
          this._create_action({ command: STATIC.EraseAllVertex, dest: this.dests.intermediaryMapExpansion });
          this._create_action({command: STATIC.EraseAllEdge, dest: this.dests.intermediaryMapExpansion});
          this._save_step(true);
      }
    }
    for(let i = 0; i < this.choosenCoordsNodes.length; ++i){
      this.exports.coords.push(this.choosenCoordsNodes[i].value_XY);
      this.exports.neighbours.push(this.choosenCoordsNodes[i].neighbours);
    }
    for(let i = 0; i < edgeAccumalator.length; ++i){
      this.exports.edges.push([edgeAccumalator[i][0],edgeAccumalator[i][1]]);
    }
    
    this.addGoalNode(myUI.map_goal);
    //download("RRT_star Map.json", JSON.stringify(this.exports));
    this._create_action({ command: STATIC.UnhighlightAllPseudoCodeRowSec, dest: this.dests.pseudocode });
    this._create_action({ command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 9 });
    
    this._save_step(true);
  }

  growMapByNodes(numberOfNodes=1) {
    //this.sampleSize+=numberOfNodes

    //var testrandom = [[10,3],[4,20],[15,2]]
    
    for (let i = 0; i < numberOfNodes; ++i) {
        var randomCoord_XY = [this.rand()*myUI.map_height, this.rand()*myUI.map_width]; //recycles seed used in generate map
       // var randomCoord_XY = testrandom[i];
       
        // -------------FROM generateNewMap-------------
        this._create_action({command: STATIC.HighlightPseudoCodeRowSec, dest: this.dests.pseudocode, pseudoCodeRow: 2});
        this._create_action({ command: STATIC.DrawVertex, dest: this.dests.intermediaryMapExpansion, nodeCoord: randomCoord_XY, colorIndex: 1});
        this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 3});
        this._save_step(false);
        // -------------UNTIL HERE-------------
        
        var nearestNode_Index = getNearestNodeIndexInTreeToRandomCoord(this.choosenCoordsNodes, randomCoord_XY)

        // -------------FROM generateNewMap-------------
        this._create_action({ command: STATIC.DrawSingleVertex, dest: this.dests.expanded, nodeCoord: this.choosenCoordsNodes[nearestNode_Index].value_XY});
        this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 4});
        this._create_action({ command: STATIC.DrawEdge, dest: this.dests.intermediaryMapExpansion, nodeCoord: this.choosenCoordsNodes[nearestNode_Index].value_XY, endCoord: randomCoord_XY });
        this._save_step(false);
        // -------------UNTIL HERE-------------
        
        var nextCoordToAdd_XY = getCoordinatesofPointsXAwayFromSource(this.choosenCoordsNodes[nearestNode_Index].value_XY,randomCoord_XY,this.pointsXawayFromSource);

        // -------------FROM generateNewMap-------------
        this._create_action({ command: STATIC.DrawVertex, dest: this.dests.intermediaryMapExpansion, nodeCoord: nextCoordToAdd_XY });
        this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 5});
        this._save_step(false)
        // -------------UNTIL HERE-------------
      
        if (CustomLOSChecker(this.choosenCoordsNodes[nearestNode_Index].value_XY, nextCoordToAdd_XY).boolean){ // checks if new randomm coord is on a non-obstacle coord and if path from parent to node has LOS
         
         
          if (document.getElementById("randomCoordLine")){ myUI.edgeCanvas.EraseSvgById("randomCoordLine") }
           if( document.getElementById("randomCoord") ){myUI. nodeCanvas.EraseSvgById("randomCoord")}
        
          // -------------OMITTED IN FAVOUR OF generateNewMap methods-------------
          // myUI.edgeCanvas.drawLine(this.choosenCoordsNodes[nearestNode_Index].value_XY, nextCoordToAdd_XY);
          // myUI.nodeCanvas.drawCircle(nextCoordToAdd_XY);
          // //if(this.choosenCoordsNodes.length == 1) myUI.edgeCanvas.drawLine(start,nextCoordToAdd_XY);;
          // myUI.edgeCanvas.drawLine(nextCoordToAdd_XY,randomCoord_XY,this.dests.networkGraph,"randomCoordLine",true);
          // myUI.nodeCanvas.drawCircle(randomCoord_XY,this.dests.networkGraph,"randomCoord","purple");
          // -------------UNTIL HERE-------------

          var nodesNearby_Index = getNodesNearby(this.choosenCoordsNodes, nextCoordToAdd_XY,this.neighbourSelectionMethod,this.connectionDistance); 

          // -------------FROM generateNewMap-------------
          nodesNearby_Index.forEach(element => {
            this._create_action({ command: STATIC.DrawVertex, dest: this.dests.neighbors, nodeCoord: this.choosenCoordsNodes[element].value_XY }); 
          });
          this._create_action({ command: STATIC.DrawVertex, dest: this.dests.networkGraph, nodeCoord: nextCoordToAdd_XY });
          this._create_action({ command: STATIC.EditStaticRow, dest: this.dests.ITStatistics, id: "NumberOfNodes",value:"++"});
          this._create_action({command: STATIC.DrawVertex, dest: this.dests.intermediaryMapExpansion, nodeCoord: nextCoordToAdd_XY,radius: this.connectionDistance.toString()});
          this._create_action({command: STATIC.HighlightPseudoCodeRowSec, dest: this.dests.pseudocode, pseudoCodeRow: 6});
          this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 7});
          this._save_step(false);
          // -------------UNTIL HERE-------------

          var selectedParent_Index = determineParentWithLowestCost(nodesNearby_Index,nextCoordToAdd_XY,nearestNode_Index,this.choosenCoordsNodes);
          //myUI.edgeCanvas.drawLine(this.choosenCoordsNodes[selectedParent_Index].value_XY,nextCoordToAdd_XY);

          // -------------FROM generateNewMap-------------
          this._create_action({command: STATIC.DrawSingleVertex, dest: this.dests.expanded, nodeCoord: this.choosenCoordsNodes[selectedParent_Index].value_XY, colour:"pink"});
          this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 8});
          this._save_step(false);
          this._create_action({ command: STATIC.DrawEdge, dest: this.dests.networkGraph, nodeCoord: this.choosenCoordsNodes[selectedParent_Index].value_XY, endCoord: nextCoordToAdd_XY });
          this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 9});
          this._save_step(false);
          this.insertNodeToTree(selectedParent_Index, nextCoordToAdd_XY, [selectedParent_Index], randomCoord_XY, [nextCoordToAdd_XY, randomCoord_XY]);
          this.rewireTree(this.choosenCoordsNodes.length - 1, nodesNearby_Index)
          
          this._create_action({ command: STATIC.UnhighlightAllPseudoCodeRowSec, dest: this.dests.pseudocode });
          this._create_action({command: STATIC.HighlightPseudoCodeRowSec, dest: this.dests.pseudocode, pseudoCodeRow: 2});
          // -------------UNTIL HERE-------------

          // -------------OMITTED IN FAVOUR OF generateNewMap methods-------------
          // this.insertNodeToTree(selectedParent_Index,nextCoordToAdd_XY,[selectedParent_Index],randomCoord_XY,[nextCoordToAdd_XY,randomCoord_XY]);
          // this.rewireTree(this.choosenCoordsNodes.length-1, nodesNearby_Index)
          // -------------UNTIL HERE-------------

          //parent, value_XY,neighbours, additionalCoord, additionalEdge, g_cost) parent left as null here as it is not used in search()
          //g cost calculated within in insertNodeToTree()
        }
        else{
          console.log("Didn't add node!");
        }
          // -------------FROM generateNewMap-------------
        this._create_action({ command: STATIC.EraseAllVertex, dest: this.dests.neighbors });
        this._create_action({ command: STATIC.EraseAllVertex, dest: this.dests.intermediaryMapExpansion });
        this._create_action({command: STATIC.EraseAllEdge, dest: this.dests.intermediaryMapExpansion});
        this._save_step(true);
          // -------------UNTIL HERE-------------
    }
    
    this.addGoalNode(myUI.map_goal, false);

    this._create_action({ command: STATIC.UnhighlightAllPseudoCodeRowSec, dest: this.dests.pseudocode });
    this._create_action({ command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 9 });
    
    this._save_step(true);
    this._save_step(true);
    
    myUI.updateStepControls();
  }


  insertNodeToTree(parent_Index,current_XY,neighbours_IndexArray,additionalCoord_XY, additionalEdge_XYXY){ //parent, value_XY,neighbours, additionalCoord, additionalEdge, g_cost)
    if (CustomLOSChecker(this.choosenCoordsNodes[parent_Index].value_XY, current_XY).boolean){
      var g_cost = this.choosenCoordsNodes[parent_Index].g_cost+distanceBetween2Points(current_XY,this.choosenCoordsNodes[parent_Index].value_XY);
      //add neighbours for parents
      
      this.choosenCoordsNodes[parent_Index].neighbours.push(this.choosenCoordsNodes.length);
      this.choosenCoordsNodes.push(new MapNode(parent_Index,current_XY,neighbours_IndexArray,additionalCoord_XY,additionalEdge_XYXY,g_cost));
    }
    

  }

  rewireTree(currentNode_index, nodesNearby_Index){ // rewires neighbouring nodes within radius of current node to current node as parent if it results in a lower g cost
    
    for (let i = 0; i < nodesNearby_Index.length; ++i) {
      var nodeNearby_index  = nodesNearby_Index[i];

      if(nodeNearby_index == this.choosenCoordsNodes[currentNode_index].parent) continue;
      var newConnection_g_cost = distanceBetween2Points(this.choosenCoordsNodes[currentNode_index].value_XY, this.choosenCoordsNodes[nodeNearby_index].value_XY) + this.choosenCoordsNodes[currentNode_index].g_cost
      
      var LOS = CustomLOSChecker(this.choosenCoordsNodes[currentNode_index].value_XY, this.choosenCoordsNodes[nodeNearby_index].value_XY).boolean;
      if (this.choosenCoordsNodes[nodeNearby_index].g_cost > newConnection_g_cost && LOS) { // yes rewire
        //console.log("before rewire",currentNode_index,this.choosenCoordsNodes[currentNode_index].neighbours,this.choosenCoordsNodes[currentNode_index].parent,nodeNearby_index, this.choosenCoordsNodes[nodeNearby_index].neighbours,this.choosenCoordsNodes[nodeNearby_index].parent)
        this.choosenCoordsNodes[nodeNearby_index].neighbours.push(currentNode_index);// forms edge between nearby node and current
        this.choosenCoordsNodes[currentNode_index].neighbours.push(nodeNearby_index);
       // console.log("before 1rewire",currentNode_index,this.choosenCoordsNodes[currentNode_index].neighbours,this.choosenCoordsNodes[currentNode_index].parent,nodeNearby_index, this.choosenCoordsNodes[nodeNearby_index].neighbours,this.choosenCoordsNodes[nodeNearby_index].parent)


        for (let j = 0; j < this.choosenCoordsNodes[nodeNearby_index].neighbours.length; ++j) { // remove edge between nearby node and parent of nearby node
          if(this.choosenCoordsNodes[nodeNearby_index].neighbours[j] == this.choosenCoordsNodes[nodeNearby_index].parent){
            var formerParentOfNearbyNode_index = this.choosenCoordsNodes[nodeNearby_index].neighbours[j];
             this.choosenCoordsNodes[nodeNearby_index].neighbours.splice(j, 1); // removes parent as a neighbour 
            continue;
          }
        }
        this.choosenCoordsNodes[nodeNearby_index].parent = currentNode_index;
       

       // console.log("after rewire",currentNode_index,this.choosenCoordsNodes[currentNode_index].neighbours,this.choosenCoordsNodes[currentNode_index].parent,nodeNearby_index, this.choosenCoordsNodes[nodeNearby_index].neighbours,this.choosenCoordsNodes[nodeNearby_index].parent)
       // console.log("after rewire p1 ",this.choosenCoordsNodes[formerParentOfNearbyNode_index].neighbours,this.choosenCoordsNodes[formerParentOfNearbyNode_index])
        //console.log("rewire", this.choosenCoordsNodes[formerParentOfNearbyNode_index].value_XY, this.choosenCoordsNodes[nodeNearby_index].value_XY, "nodeNearby_index", nodeNearby_index, "formerParentOfNearbyNode_index", formerParentOfNearbyNode_index)
        for (let j = 0; j < this.choosenCoordsNodes[formerParentOfNearbyNode_index].neighbours.length; ++j) {
          if(this.choosenCoordsNodes[formerParentOfNearbyNode_index].neighbours[j] == nodeNearby_index){
            this.choosenCoordsNodes[formerParentOfNearbyNode_index].neighbours.splice(j, 1); // removes nearby node as a neighbour of (nearby node parent)
          }
        }
        // console.log("after rewire p ",this.choosenCoordsNodes[formerParentOfNearbyNode_index].neighbours,this.choosenCoordsNodes[formerParentOfNearbyNode_index])
          this._create_action({command: STATIC.EraseEdge, dest: this.dests.networkGraph, nodeCoord: this.choosenCoordsNodes[formerParentOfNearbyNode_index].value_XY, endCoord: this.choosenCoordsNodes[nodeNearby_index].value_XY });
          this._create_action({command: STATIC.DrawEdge, dest: this.dests.networkGraph, nodeCoord: this.choosenCoordsNodes[currentNode_index].value_XY, endCoord: this.choosenCoordsNodes[nodeNearby_index].value_XY, colorIndex:1 });
          this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 10});
          this._save_step(true);
        
       // myUI.edgeCanvas.eraseLine(this.choosenCoordsNodes[formerParentOfNearbyNode_index].value_XY, this.choosenCoordsNodes[nodeNearby_index].value_XY, this.dests.networkGraph);
        //myUI.edgeCanvas.drawLine(this.choosenCoordsNodes[currentNode_index].value_XY,this.choosenCoordsNodes[nodeNearby_index].value_XY);
      }
    }
  }
  

  addGoalNode( coord_XY = [4, 1], addToExports = true) {
    if (CustomLOSChecker(coord_XY, coord_XY).boolean == false) return alert(`Goal is on an obstacle`);

    
    if (this.prevGoalCoordConnectedto.length == 2) {
     myUI.edgeCanvas.eraseLine(this.prevGoalCoordConnectedto,this.prevGoalCoord);
    }

  
    var radiusInPixels = Math.max(myUI.canvases.bg.canvas.clientWidth,myUI.canvases.bg.canvas.clientHeight)/Math.max(myUI.map_width, myUI.map_height)*this.goalRadius
    myUI.map_goal_radius.resize(2 * radiusInPixels);
    myUI.map_goal_radius.move(coord_XY);


    var nodesNearby_Index = getNodesNearby(this.choosenCoordsNodes, coord_XY, "Closest Neighbours By Radius", this.goalRadius); 
    if (nodesNearby_Index == false) {
     
      //myUI.InfoTables["ITStatistics"].createStaticRowWithACellEditableById("NumberOfNodes","infinite");
      this._create_action({ command: STATIC.EditStaticRow, dest: this.dests.ITStatistics, id: "PathDistance",value:"∞"});
      return;
    } 
    var selectedVertexIndex = this.getNeighbourIndexThatResultsInShortestPath(coord_XY, nodesNearby_Index).index;
    var selectedVertexCost = this.getNeighbourIndexThatResultsInShortestPath(coord_XY, nodesNearby_Index).cost;
    //myUI.InfoTables["ITStatistics"].createStaticRowWithACellEditableById("NumberOfNodes", selectedVertexCost);
    this._create_action({ command: STATIC.EditStaticRow, dest: this.dests.ITStatistics, id: "NumberOfNodes", value: "++" });
    this._create_action({ command: STATIC.EditStaticRow, dest: this.dests.ITStatistics, id: "PathDistance",value:selectedVertexCost.toPrecision(5)});

  
    const selected_XY = this.choosenCoordsNodes[selectedVertexIndex].value_XY;
    var selectedIndexForStartEndVertex = this.choosenCoordsNodes.length // determined before push to array below

    if(addToExports) this.exports.coords.push(coord_XY);
    if(addToExports) this.exports.neighbours.push(new Array());
    this.choosenCoordsNodes.push(new MapNode(null,coord_XY,new Array()));
    if(addToExports) this.exports.edges.push([coord_XY, selected_XY]);
    this._create_action({ command: STATIC.DrawEdge, dest: this.dests.networkGraph, nodeCoord: coord_XY, endCoord: selected_XY });
    //myUI.edgeCanvas.drawLine(coord_XY,selected_XY);

    if(!this.choosenCoordsNodes[selectedVertexIndex].neighbours.includes(selectedIndexForStartEndVertex)) this.choosenCoordsNodes[selectedVertexIndex].neighbours.push(selectedIndexForStartEndVertex);
    if(addToExports) if(!this.exports.neighbours[selectedVertexIndex].includes(selectedIndexForStartEndVertex)) this.exports.neighbours[selectedVertexIndex].push(selectedIndexForStartEndVertex);
    if(!this.choosenCoordsNodes[selectedIndexForStartEndVertex].neighbours.includes(selectedVertexIndex)) this.choosenCoordsNodes[selectedIndexForStartEndVertex].neighbours.push(selectedVertexIndex);
    if(addToExports) if(!this.exports.neighbours[selectedIndexForStartEndVertex].includes(selectedVertexIndex)) this.exports.neighbours[selectedIndexForStartEndVertex].push(selectedVertexIndex);
   
    this.choosenCoordsNodes[selectedIndexForStartEndVertex].parent = selectedVertexIndex;
    console.log("Goal:", this.choosenCoordsNodes[selectedIndexForStartEndVertex]);
    this.goalIndex = selectedIndexForStartEndVertex;

    this.prevGoalCoordConnectedto = selected_XY;
    this.prevGoalCoord = coord_XY;
    
  }
    
  getNeighbourIndexThatResultsInShortestPath(coord_XY, nodesNearby_Index){ // rewires neighbouring nodes within radius of current node to current node as parent if it results in a lower g cost

    var lowestConnection_g_cost = 9999999//a huge cost
    var lowestConnection_g_cost_index;
    for (let i = 0; i < nodesNearby_Index.length; ++i) {
      var nodeNearby_index  = nodesNearby_Index[i];
      var newConnection_g_cost = distanceBetween2Points(coord_XY,this.choosenCoordsNodes[nodeNearby_index].value_XY) + this.choosenCoordsNodes[nodeNearby_index].g_cost
      var LOS = CustomLOSChecker(coord_XY, this.choosenCoordsNodes[nodeNearby_index].value_XY).boolean;
      if (lowestConnection_g_cost > newConnection_g_cost && LOS) { // yes connect to 
        lowestConnection_g_cost = newConnection_g_cost;
        lowestConnection_g_cost_index = nodeNearby_index;
      }
    }
    return {
      index: lowestConnection_g_cost_index,
      cost: lowestConnection_g_cost,
    }
  }



  search(start, goal) {
    // this method finds the path using the prescribed map, start & goal coordinates
    this._init_search(start, goal);
    
		this.closed_list =  new Empty2D(this.map_height, this.map_width, !this.roundNodes);
		this.open_list =  new Empty2D(this.map_height, this.map_width, !this.roundNodes);
    console.log("starting");
    this.generateNewMap(start, goal);

    let planner = this;

    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._terminate_search()), planner.batch_interval);
    });
   
    // starting node
    var nextNode = this.choosenCoordsNodes.filter(node => node.value_XY[0] == start[0] && node.value_XY[1] == start[1])[0]; // PRM Node
    this.current_node =  new Node(0, 0, 0, null, nextNode.value_XY, null, nextNode.neighbours); // Regular Node
    
    // assigns the F, G, H cost to the node
    [this.current_node.f_cost, this.current_node.g_cost, this.current_node.h_cost] = this.calc_cost(this.current_node.self_XY);

    // pushes the starting node onto the queue
    this.queue.push(this.current_node);  // begin with the start; add starting node to rear of []
    console.log(this.current_node);
   
    
    if(!this.bigMap){
      // for every node that is pushed onto the queue, it should be added to the queue infotable
      this._create_action({command: STATIC.InsertRowAtIndex, dest: this.dests.ITQueue, infoTableRowIndex: 1, infoTableRowData: [nextNode.value_XY[0].toPrecision(5)+','+nextNode.value_XY[1].toPrecision(5), '-', parseFloat(this.current_node.f_cost.toPrecision(5)), parseFloat(this.current_node.g_cost.toPrecision(5)), parseFloat(this.current_node.h_cost.toPrecision(5))]});
      this._create_action({command: STATIC.DrawVertex, dest: this.dests.queue, nodeCoord: nextNode.value_XY});
      this._save_step(true);
    }
    this.open_list.set(this.current_node.self_XY, this.current_node); 
    //---------------------checks if visited 2d array has been visited

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
      this._create_action({command: STATIC.DrawVertex, dest: this.dests.visited, nodeCoord: this.current_node_XY});
      
      if(!this.bigMap){
        this._create_action({command: STATIC.EraseAllRows, dest: this.dests.ITNeighbors});
        for (let i = 0; i < this.current_node.neighbours.length; ++i){
          const XY = this.choosenCoordsNodes[this.current_node.neighbours[i]].value_XY;
          this._create_action({command: STATIC.InsertRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [ `${XY[0].toPrecision(5)}, ${XY[1].toPrecision(5)}`, "?", "?", "?", "?"]})
        }
        this._create_action({command: STATIC.EraseRowAtIndex, dest: this.dests.ITQueue, infoTableRowIndex: 1});

        //this._create_action({command: STATIC.EraseCanvas, dest: this.dests.neighbors});// erase all neighbours
        this._create_action({command: STATIC.EraseAllVertex, dest: this.dests.neighbors});

        //this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.expanded, nodeCoord: this.current_node_XY}); //draw current
        this._create_action({command: STATIC.DrawSingleVertex, dest: this.dests.expanded, nodeCoord: this.current_node_XY});

        //this._create_action({command: STATIC.ErasePixel, dest: this.dests.queue, nodeCoord: this.current_node_XY}); // erase vertex in queue
        this._create_action({command: STATIC.EraseVertex, dest: this.dests.queue, nodeCoord: this.current_node_XY}); // erase vertex in queue

        //this._create_action({command: STATIC.DrawSinglePixel, dest: this.dests.focused, nodeCoord: this.current_node_XY});
        this._create_action({command: STATIC.DrawSingleVertex, dest: this.dests.focused, nodeCoord: this.current_node_XY, pseudoCodeRow:0.2});
        this._create_action({command: STATIC.EraseAllEdge, dest: this.dests.focused});

        this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 12});
      }//add
      this._save_step(true);

      //this._assign_cell_index(this.current_node_XY);

      /* FOUND GOAL */
      if(this._found_goal(this.current_node)) return this._terminate_search(); // found the goal & exits the loop
      

      /* iterates through the 4 or 8 neighbors and adds the valid (passable & within boundaries of map) ones to the queue & neighbour array */
       for (let i = 0; i < this.current_node.neighbours.length; ++i){
        const idx = this.current_node.neighbours[i];
        var next_XY = this.choosenCoordsNodes[idx].value_XY; // calculate the coordinates for the new neighbour
    

        let [f_cost, g_cost, h_cost] = this.calc_cost(next_XY);
        
        this._create_action({command: STATIC.EraseAllEdge, dest: this.dests.focused});
        this._create_action({command: STATIC.DrawEdge, dest: this.dests.focused, nodeCoord: next_XY, endCoord: this.current_node_XY,pseudoCodeRow:0.2});
        
        let next_node = new Node(f_cost, g_cost, h_cost, this.current_node, next_XY, null, this.choosenCoordsNodes[idx].neighbours);
        let open_node = this.open_list.get(next_XY);
        if(open_node !== undefined && open_node.f_cost<=f_cost){
          if(!this.bigMap){
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [ `${next_XY[0].toPrecision(5)}, ${next_XY[1].toPrecision(5)}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Not a child"]});
            this._create_action({command: STATIC.DrawSingleVertex, dest: this.dests.focused, nodeCoord: next_XY,pseudoCodeRow:0.2});
            this._save_step(false);
          }
          continue; // do not add to queue if open list already has a lower cost node
        }
        let closed_node = this.closed_list.get(next_XY);
        if(closed_node !== undefined && closed_node.f_cost<=f_cost){
          if(!this.bigMap){
            if(this.current_node.parent.self_XY[0] == next_XY[0] && this.current_node.parent.self_XY[1] == next_XY[1])
              this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [ `${next_XY[0].toPrecision(5)}, ${next_XY[1].toPrecision(5)}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Parent"]});  //  a parent must be visited already
            else
              this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [ `${next_XY[0].toPrecision(5)}, ${next_XY[1].toPrecision(5)}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Not a child"]});
            this._create_action({command: STATIC.DrawSingleVertex, dest: this.dests.focused, nodeCoord: next_XY,pseudoCodeRow:0.2});
          }
          
          /* no longer required as closed list functions as visited */
          /* and INC_P keeps tracks of how many times a node is visited */
          //this.visited.increment(next_XY); 

          // increment after visiting a node on the closed list
          /*this._create_action({command: STATIC.IncrementPixel, dest: this.dests.visited, nodeCoord: next_XY});*///add on
          this._save_step(false);
          continue; // do not add to queue if closed list already has a lower cost node
        }
//commented away next 3 lines for RRT_star
        //this._create_action({command: STATIC.SetPixelValue, dest: this.dests.fCost, nodeCoord: next_XY, cellVal: f_cost});
       // this._create_action({command: STATIC.SetPixelValue, dest: this.dests.gCost, nodeCoord: next_XY, cellVal: g_cost});
        //this._create_action({command: STATIC.SetPixelValue, dest: this.dests.hCost, nodeCoord: next_XY, cellVal: h_cost});
        
        // since A* is a greedy algorithm, it requires visiting of nodes again even if it has already been added to the queue
        // see https://www.geeksforgeeks.org/a-search-algorithm/
        
        if(!this.bigMap){
          this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: this.dests.pseudocode, pseudoCodeRow: 32});
      
          this._create_action({command: STATIC.DrawVertex, dest: this.dests.queue, nodeCoord: next_XY});
          this._create_action({command: STATIC.DrawVertex, dest: this.dests.neighbors, nodeCoord: next_XY}); //add on

          // counts the number of nodes that have a lower F-Cost than the new node
          // to find the position to add it to the queue
          let numLess = this.queue.filter(node => node.f_cost < next_node.f_cost).length;
          
          this._create_action({command: STATIC.InsertRowAtIndex, dest: this.dests.ITQueue, infoTableRowIndex: numLess+1, infoTableRowData: [next_XY[0].toPrecision(5)+','+next_XY[1].toPrecision(5), this.current_node_XY[0].toPrecision(5)+','+this.current_node_XY[1].toPrecision(5), parseFloat(next_node.f_cost.toPrecision(5)), parseFloat(next_node.g_cost.toPrecision(5)), parseFloat(next_node.h_cost.toPrecision(5))]});
          
          if(open_node===undefined && closed_node===undefined) 
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [ `${next_XY[0].toPrecision(5)}, ${next_XY[1].toPrecision(5)}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "New encounter"]});
          else if(open_node)
            this._create_action({command: STATIC.UpdateRowAtIndex, dest: this.dests.ITNeighbors, infoTableRowIndex: i+1, infoTableRowData: [ `${next_XY[0].toPrecision(5)}, ${next_XY[1].toPrecision(5)}`, f_cost.toPrecision(5), g_cost.toPrecision(5), h_cost.toPrecision(5), "Replace parent"]});
            this._create_action({command: STATIC.DrawSingleVertex, dest: this.dests.focused, nodeCoord: next_XY,pseudoCodeRow:0.2});
        }
        this._save_step(false);

        // add to queue 
        if(this.timeOrder=="FIFO") this.queue.push(next_node); // FIFO
        else this.queue.unshift(next_node); // LIFO
        this.open_list.set(next_XY, next_node);  // add to open list

         if (this._found_goal(next_node)) {
           
          
           return this._terminate_search();
           
        } 
      }


      // continue to next node in queue
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search(planner, planner.batch_size)), planner.batch_interval);
    });
  }

  recurseCurrentPath() {
    myUI.run_action(STATIC.EraseAllVertex, this.dests.path);
    myUI.run_action(STATIC.EraseAllEdge, this.dests.path);
    let node = this.choosenCoordsNodes[this.goalIndex];
    if (node != undefined) { 
      console.log(node);
      while (node.parent != null) {
        console.log("Drawing Vertex");
        myUI.run_action(STATIC.DrawVertex, this.dests.path, node.value_XY[0], node.value_XY[1], 0);
        var p = this.choosenCoordsNodes[node.parent];
        console.log("Drawing Edge");
        myUI.run_action(STATIC.DrawEdge, this.dests.path, node.value_XY[0], node.value_XY[1], 0, undefined, undefined, undefined, undefined, undefined, p.value_XY[0], p.value_XY[1]);
        node = p;
      }
    }
  }

}
