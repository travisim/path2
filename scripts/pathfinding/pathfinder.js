//------------------------------------------------------------pathfinder

// grid, graph, directed_graph, RRP

class GridPathFinder{

	static get action_buffer(){return 5}

	static get distance_metrics(){
    return [];
  }

	static _manageUnpacking(numBits, offset, idx){
		offset += numBits;
		if(offset>=32){
			idx++;
			offset=1+numBits;
		}
		return [numBits, offset, idx];
	}

	static unpackAction(action, readable = false){
		/* NEW */
		let bitOffset = 13	;
		let idx = 0;
		
		let mask;
		[mask, bitOffset, idx] = this._manageUnpacking(myUI.planner.static_bit_len, bitOffset, idx);
		let command = bit_shift(action[idx], -(bitOffset-mask)) & ones(mask);
		if(action[0]&(1<<1)){
			[mask, bitOffset, idx] = this._manageUnpacking(myUI.planner.static_bit_len, bitOffset, idx);
			var dest = bit_shift(action[idx], -(bitOffset-mask)) & ones(mask);
		}
		if(action[0]&(1<<2)){
			[mask, bitOffset, idx] = this._manageUnpacking(myUI.planner.color_bit_len, bitOffset, idx);
			var colorIndex = bit_shift(action[idx], -(bitOffset-mask)) & ones(mask);
		}
		if(action[0]&(1<<3)){
			++idx;
			let coord = action[idx]>>1;
			var x = Math.floor(coord/myUI.planner.map_width);
			var y = coord - x * myUI.planner.map_width;
		}
		if(action[0]&(1<<4)){
			++idx;
			var arrowIndex = action[idx]>>1;
		}
		if(action[0]&(1<<5)){
			++idx;
			var pseudoCodeRow = action[idx]>>1;
		}
		if(action[0]&(1<<6)){
			++idx;
			var infoTableRowIndex = action[idx]>>1;
		}
		if(action[0]&(1<<7)){
			++idx;
			var infoTableRowData = action[idx];
		}
    if(action[0]&(1<<8)){
			++idx;
			var cellVal = action[idx]/2;
		}
		if(action[0]&(1<<9)){
			++idx;
			let coord = action[idx]>>1;
			var endX = Math.floor(coord/myUI.planner.map_width);
			var endY = coord - endX * myUI.planner.map_width;
		}
    
		if(readable){
			return `
			Command          : ${STATIC_COMMANDS[command]}
			Dest             : ${statics_to_obj[dest]}
			x,y              : ${x + ", " + y}
			colorIndex       : ${colorIndex}
			pseudoCodeRow    : ${pseudoCodeRow}
			infoTableRowIndex: ${infoTableRowIndex}
			infoTableRowData : ${infoTableRowData}
			cellVal          : ${cellVal}
			endCoord         : ${endX + ", " + endY}
			`
		}
		return [command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal, endX, endY];/**/
	}

	static _managePacking(numBits, obj){
		obj.bitOffset += numBits;
		if(obj.bitOffset > 32){
			obj.actionCache.push(0);
			obj.bitOffset = 1+numBits;
		}
		obj.idx = obj.actionCache.length-1;
	}

	static packAction({
		command,
		dest,
		nodeCoord,
		colorIndex,
		arrowIndex,
    pseudoCodeRow,
    infoTableRowIndex,
		infoTableRowData,
		cellVal,
		endCoord,
	} = {}){
		/* NEW */
		/*
			this new system will process the arguments using certain keywords
		*/
		/* bits are read from right to left */
		/* 1111111111*/
		let obj = {};
		obj.actionCache = [1];
		obj.bitOffset = 13;
		obj.idx = 0;

		// command is assumed to exist
		this._managePacking(myUI.planner.static_bit_len, obj);
		obj.actionCache[obj.idx] += bit_shift(command, obj.bitOffset - myUI.planner.static_bit_len);
		if(dest!==undefined){
			this._managePacking(myUI.planner.static_bit_len, obj);
			obj.actionCache[0] += 1<<1; 
			obj.actionCache[obj.idx] += bit_shift(dest, obj.bitOffset - myUI.planner.static_bit_len);
  		
		}
		if(colorIndex!==undefined){
			this._managePacking(myUI.planner.color_bit_len, obj);
			obj.actionCache[0] += 1<<2;
			obj.actionCache[obj.idx] += bit_shift(colorIndex, obj.bitOffset - myUI.planner.color_bit_len);
		}
		if(nodeCoord!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<3;
			obj.actionCache[obj.idx] = (nodeCoord[0]*myUI.planner.map_width+nodeCoord[1])*2;
		}
		if(arrowIndex!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<4;
			obj.actionCache[obj.idx] = arrowIndex*2;
		}
    if(pseudoCodeRow!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<5;
			obj.actionCache[obj.idx] = pseudoCodeRow*2;
		}
    if(infoTableRowIndex!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<6;
			obj.actionCache[obj.idx] = infoTableRowIndex*2;
		}
		if(infoTableRowData!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<7;
			obj.actionCache[obj.idx] = infoTableRowData;
		}
		if(cellVal!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<8;
			obj.actionCache[obj.idx] = cellVal*2;
		}
		if(endCoord!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<9;
			obj.actionCache[obj.idx] = (endCoord[0]*myUI.planner.map_width+endCoord[1])*2;
		}

		return obj.actionCache;
	}

	get canvases(){
		return [
			{
				id:"focused", drawType:"dotted", drawOrder: 1, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["#8F00FF"], toggle: "multi", checked: true, minVal: 1, maxVal: 1, infoMapBorder: false, infoMapValue: null,
			},
			{
				id:"expanded", drawType:"cell", drawOrder: 2, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["#34d1ea"], toggle: "multi", checked: true, minVal: 1, maxVal: 1, infoMapBorder: false, infoMapValue: null,
			},
			{
				id:"path", drawType:"cell", drawOrder: 5, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["#34d1ea"], toggle: "multi", checked: true, minVal: 1, maxVal: 1, infoMapBorder: false, infoMapValue: null,
			},
			{
				id:"neighbors", drawType:"cell", drawOrder: 6, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["rgb(0,130,105)"], toggle: "multi", checked: true, minVal: 1, maxVal: 1, infoMapBorder: true, infoMapValue: null,
			},
			{
				id:"queue", drawType:"cell", drawOrder: 7, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["rgb(116, 250, 76)"], toggle: "multi", checked: true, minVal: 1, maxVal: 1, infoMapBorder: true, infoMapValue: null,
			},
			{
				id:"visited", drawType:"cell", drawOrder: 8, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["hsl(5,74%,85%)", "hsl(5,74%,75%)", "hsl(5,74%,65%)", "hsl(5,74%,55%)", "hsl(5,74%,45%)", "hsl(5,74%,35%)", "hsl(5,74%,25%)", "hsl(5,74%,15%)"], toggle: "multi", checked: true, minVal: 1, maxVal: 8, infoMapBorder: true, infoMapValue: null,
			},
			{
				id:"fCost", drawType:"cell", drawOrder: 9, fixedResVal: 1024, valType: "float", defaultVal: Number.POSITIVE_INFINITY, colors:["#0FFF50", "#013220"], toggle: "multi", checked: false, minVal: null, maxVal: null, infoMapBorder: false, infoMapValue: "F",
			},
			{
				id:"gCost", drawType:"cell", drawOrder: 10, fixedResVal: 1024, valType: "float", defaultVal: Number.POSITIVE_INFINITY, colors:["#0FFF50", "#013220"], toggle: "multi", checked: false, minVal: null, maxVal: null, infoMapBorder: false, infoMapValue: "G",
			},
			{
				id:"hCost", drawType:"cell", drawOrder: 11, fixedResVal: 1024, valType: "float", defaultVal: Number.POSITIVE_INFINITY, colors:["#0FFF50", "#013220"], toggle: "multi", checked: false, minVal: null, maxVal: null, infoMapBorder: false, infoMapValue: "H",
			},
		];
	}

	static get hoverData(){
    return [
      {id: "hoverCellVisited", displayName: "Times Visited", type: "canvasCache", canvasId: "visited"}
    ];
  }

	static get checkboxes(){
		return [
			[`show_arrow-div`, true, "Arrows", "layer", "multi"]
		];
	}

	constructor(num_neighbors = 8, diagonal_allow = true, first_neighbor = "N", search_direction = "anticlockwise"){
		this.init_neighbors(num_neighbors, first_neighbor, search_direction);
		this.diagonal_allow = diagonal_allow;
	}

	get configs(){
    return [
      {uid: "diagonal_block", displayName: "Diagonal Blocking:", options: ["Blocked", "Unblocked"], description: `Block connection to an ordinal neighbor (e.g. NW) if there are obstacles in its applicable cardinal directions (e.g. N, W). <br>Unblock to ignore this constraint`},
      {uid: "num_neighbors", displayName: "Neighbors:", options: ["Octal (8-directions)", "Cardinal (4-directions)"], description: `Octal when all 8 neighbors surrounding the each cell are searched.<br>Cardinal when 4 neighbors in N,W,S,E (cardinal) directions are searched.`},
      {uid: "first_neighbor", displayName: "Starting Node:", options: ["N", "NW", "W", "SW", "S", "SE", "E", "NE"], description: `The first direction to begin neighbour searching. Can be used for breaking ties. N is downwards (+i/+x/-row). W is rightwards (+j/+y/-column).`},//["+x", "+x+y", "+y", "-x+y", "-x", "-x-y", "-y", "+x-y"]},
      {uid: "search_direction", displayName: "Search Direction:", options: ["Anticlockwise", "Clockwise"], description: `The rotating direction to search neighbors. Can be used for breaking ties. Anticlockwise means the rotation from N to W. Clockwise for the opposite rotation.`},
			{uid: "mapType", displayName: "Map Type:", options: ["Grid Cell", "Grid Vertex"], description: `Grid Cell is the default cell-based expansion. Grid Vertex uses the vertices of the grid. There is no diagonal blocking in grid vertex`},
      {uid: "big_map", displayName: "Big Map Optimization:", options: ["Disabled", "Enabled"], description: `Enabled will reduce the amount of canvases drawn and steps stored, as certain canvases are meaningless when the map gets too big (queue, neighbors etc.)`},
    ];
	}

	setConfig(uid, value){
		console.log(uid, value);
    switch(uid){
      case "diagonal_block":
				this.diagonal_allow = value=="Unblocked";
        break;
      case "num_neighbors":
        let num = value=="Octal (8-directions)" ? 8 : 4;
        this.init_neighbors(num);
        myUI.InfoMap.NumneighborsMode(num);
        break;
      case "first_neighbor":
				this.init_first_neighbor(value);
        break;
      case "search_direction":
        value = value.toLowerCase();
        this.init_search_direction(value);
        break;
			case "mapType":
				if(value=="Grid Vertex"){
					this.vertexEnabled = true;
					myUI.toggleVertex(true);
				}
				else{
					this.vertexEnabled = false;
					myUI.toggleVertex(false);
				}
				myUI.displayScen();
				break;
			case "big_map":
				let bigMap = value=="Enabled";
				if(this.bigMap != bigMap){
					this.bigMap = bigMap;
					myUI.loadPlanner(false);
				}
    }
  }

	infoMapPlannerMode(){
		return "default";
	}

	get infoTables(){
		return [
			{id:"ITNeighbors", displayName: "Neighbors", headers:["Dir", "Position", "F-Cost", "G-Cost", "H-Cost", "State"]},
			{id:"ITQueue", displayName: "Queue", headers:["Vertex","Parent","F-Cost","G-Cost","H-Cost"]},
		];
	}

	init_neighbors(num_neighbors, first_neighbor=this.first_neighbor, search_direction=this.search_direction){
		this.num_neighbors = num_neighbors;
		
		if(this.num_neighbors==8){
			this.delta = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]; //x,y
			this.deltaNWSE = ["N", "NW", "W", "SW", "S", "SE", "E", "NE"];// North is positive x 
			this.neighborsIndex = [0, 1, 2, 3, 4, 5, 6, 7];
		}
		else{ // if(this.num_neighbors==4)
			this.delta = [[1, 0], [0, 1], [-1, 0], [0, -1]];
			this.deltaNWSE = ["N", "W", "S", "E"];
			this.neighborsIndex = [0, 1, 2, 3];
		}
		this.search_direction = "anticlockwise";
		this.first_neighbor = first_neighbor;
		this.init_search_direction(search_direction);
	}

	init_search_direction(search_direction){
		if(this.search_direction!=search_direction){
			this.neighborsIndex.reverse();
			this.search_direction = search_direction;
		}
		this.init_first_neighbor(this.first_neighbor);
	}

	init_first_neighbor(first_neighbor){
		this.first_neighbor = first_neighbor;
		let first_index = this.neighborsIndex.indexOf(this.deltaNWSE.indexOf(this.first_neighbor));
		this.neighborsIndex = this.neighborsIndex.slice(first_index).concat(this.neighborsIndex.slice(0, first_index));
		return;
	}

	add_map(map){
		this.map_height = map.length;
		this.map_width = map[0].length;
		if(this.vertexEnabled){
			++this.map_height;
			++this.map_width;
		}
		this.map = BitMatrix.compress_bit_matrix(map); // 2d array; each 1d array is a row
		this.coord_bit_len = Math.ceil(Math.log2(this.map_height * this.map_width - 1));
		this.static_bit_len = Math.ceil(Math.log2(STATIC.max_val+1));
		this.color_bit_len = Math.ceil(Math.log2(myUI.arrow.colors.length));
	}

	_init_search(start, goal){
    this.start = start; //in array form [x,y]  [0,0] is top left  [512,512] is bottom right
    this.goal = goal;
    this.queue = [];  // BFS uses a FIFO queue to order the sequence in which nodes are visited
    this.path = null;
    this._clear_steps();
    this.draw_arrows = this.map_height <= 65 && this.map_width <= 65;
		this.current_node = undefined;

    // generate empty 2d array
    this.visited = new NBitMatrix(this.map_height, this.map_width, 8);
    this.searched = false;
    this._create_cell_index();
		myUI.reset_arrow(true);
		
		if(this.map_height<=32) this.batch_size = 10;
		else if(this.map_height<=64) this.batch_size = 40;
		else this.batch_size = 1000;
    this.batch_interval = 0;
	}

	_nodeIsNeighbor(next_XY, next_NWSE, cardinalCoords){
		if(this.vertexEnabled){
			// no diagonal blocking considered
			if(next_XY[0]!=this.current_node_XY[0] && next_XY[1]!=this.current_node_XY[1]){
				// diagonal crossing
				// consider [Math.min(next_XY[0], this.current_node_XY[0]), Math.min(next_XY[1], this.current_node_XY[1])];
				let coord = [Math.min(next_XY[0], this.current_node_XY[0]), Math.min(next_XY[1], this.current_node_XY[1])];
				if(this.map.get_data(coord)==0) return false; // not passable
			}
			else{
				// cardinal crossing
				if(next_XY[0]!=this.current_node_XY[0]){
					// consider [Math.min(next_XY[0], this.current_node_XY[0]), next_XY[1]]
					// consider [Math.min(next_XY[0], this.current_node_XY[0]), next_XY[1]-1]
					var c1 =  [Math.min(next_XY[0], this.current_node_XY[0]), next_XY[1]];
					var c2 = [Math.min(next_XY[0], this.current_node_XY[0]), next_XY[1]-1];
				}
				else{
					// consider [next_XY[0], Math.min(next_XY[1], this.current_node_XY[1])]
					// consider [next_XY[0]-1, Math.min(next_XY[1], this.current_node_XY[1])] 
					var c1 = [next_XY[0], Math.min(next_XY[1], this.current_node_XY[1])];
					var c2 = [next_XY[0]-1, Math.min(next_XY[1], this.current_node_XY[1])];
				}
				if(this.map.get_data(c1)==0 && this.map.get_data(c2)==0) return false; // not passable
			}
		}
		else{
			if (this.map.get_data(next_XY) == 0) return false;  // if neighbour is not passable
			if (this.diagonal_allow == false && this.num_neighbors == 8) { // if diagonal blocking is enabled
				if (next_NWSE == "NW") {
					if(this.map.get_data(cardinalCoords["N"]) == 0 && this.map.get_data(cardinalCoords["W"]) == 0) return false;
				}
				else if (next_NWSE == "SW") {
					if(this.map.get_data(cardinalCoords["S"]) == 0 && this.map.get_data(cardinalCoords["W"]) == 0) return false;
				}
				else if (next_NWSE == "SE") {
					if(this.map.get_data(cardinalCoords["S"]) == 0 && this.map.get_data(cardinalCoords["E"]) == 0) return false;
				}
				else if (next_NWSE == "NE") {
					if(this.map.get_data(cardinalCoords["N"]) == 0 && this.map.get_data(cardinalCoords["E"]) == 0) return false;
				}
			}
		}
		return true;
	}

	_clear_steps(){
		this.step_index = -1;
		this.step_cache = [];
		this.steps_data = [];
		this.step_index_map = [];
		this.combined_index_map = [];
	}

	_manageAction(numBits){
		this.bitOffset += numBits;
		if(this.bitOffset > 32){
			this.actionCache.push(0);
			this.bitOffset = 1+numBits;
		}
		return this.actionCache.length - 1;
	}

  
	_create_action({
		command,
		dest,
		nodeCoord,
		colorIndex,
		arrowIndex,
    pseudoCodeRow,
		infoTableRowIndex,
		infoTableRowData,
		cellVal,
		endCoord
	} = {}){
		this.actionCache = this.constructor.packAction({command: command, dest: dest, nodeCoord: nodeCoord, colorIndex: colorIndex, arrowIndex: arrowIndex, pseudoCodeRow: pseudoCodeRow, infoTableRowIndex: infoTableRowIndex, infoTableRowData: infoTableRowData, cellVal: cellVal, endCoord: endCoord});
		Array.prototype.push.apply(this.step_cache, this.actionCache);
		return this.actionCache.length;
	}
	
	_save_step(combined=false){
		
		if(combined){
			let n = this.step_index_map.length - this.combined_index_map.length;
			while(n>0){
				this.combined_index_map.push(n);
				--n;
			}
		}
		this.step_index_map.push(this.steps_data.length);
		Array.prototype.push.apply(this.steps_data, this.step_cache);
		
		/* 
		step 0 is index 0 to index k-1
		step 1 is kth index where step 0 is k-items long
		step n is k0+k1+k2+...k(n-1) = k(0 to n-1)th index
		*/
		++this.step_index;
		this.step_cache = []; // clear steps to save another step
	}

  _handleArrow(next_XY, new_node, open_node, closed_node){
    if (!this.draw_arrows) return;
    // ARROW
    if(open_node!==undefined){ // need to remove the previous arrow drawn and switch it to the new_node
      //this._create_action(STATIC.EA, open_node.arrow_index);
      this._create_action({command: STATIC.EA, arrowIndex: open_node.arrow_index});
    }
    if(closed_node!==undefined){ // need to remove the previous arrow drawn and switch it to the new_node
      //this._create_action(STATIC.EA, closed_node.arrow_index);
      this._create_action({command: STATIC.EA, arrowIndex: closed_node.arrow_index});
    }
    new_node.arrow_index = myUI.create_arrow(next_XY, this.current_node_XY); // node is reference typed so properties can be modified after adding to queue or open list
    this._create_action({command: STATIC.DA, arrowIndex: new_node.arrow_index, colorIndex: 0});
    // END OF ARROW
  }

	_create_cell_index(){
		this.cell_map = zero2D(this.map_height, this.map_width, Number.MAX_SAFE_INTEGER, NaN, "int");
	}

	_assign_cell_index(xy){
		// index is the step index for the first expansion of that cell
		let [x,y] = xy;
		this.cell_map[x][y] = this.step_index;
	}

	_found_goal(node, draw_mode = "grid"){
		// found the goal & exits the loop
		if (node.self_XY[0] != this.goal[0] || node.self_XY[1] != this.goal[1]) return false;
		
		this._assign_cell_index(this.current_node_XY);
		this.path = [];
		// retraces the entire parent tree until start is found
		var prevNode = null;
		const originalNode = node;
		myUI.node = originalNode;
		console.log("RETRACING PATH");
		while (node != null) {
			this.path.unshift(node.self_XY);
			/* OLD *//*
			this._create_action(STATIC.DP, STATIC.PA, node.self_XY);
			this._create_action(STATIC.DA, node.arrow_index, 1);
			/* NEW */
			if(draw_mode == "free_vertex"){
				this._create_action({command: STATIC.DrawVertex, dest: STATIC.PA, nodeCoord: node.self_XY});
				if(prevNode){
					this._create_action({command: STATIC.DrawEdge, dest: STATIC.PA, nodeCoord: node.self_XY, endCoord: prevNode.self_XY});
				}
			}
			else this._create_action({command: STATIC.DP, dest: STATIC.PA, nodeCoord: node.self_XY});

			if(! node.arrow_index === null)
				this._create_action({command: STATIC.DA, arrowIndex: node.arrow_index, colorIndex: 1});
			
			prevNode = node;
			node = node.parent;
		}
		console.log("found");
		console.log(this.path);
		/* NEW */
		this._save_step(true);

		this._save_step(true);

		return true;
	}

	_terminate_search(){
    clearTimeout(this.search_timer);
    if (this.path == null) console.log("path does not exist");
    this.searched = true;
    return 0;
  }

  max_step(){
    return this.step_index-1 ; // because of dummy step at the end and final step is n-1
  }
  
}

class Node{
	constructor(f_cost, g_cost, h_cost, parent, self_XY, arrow_index = null, neighbours = []){
	  	this.f_cost = f_cost;
      this.g_cost = g_cost;
      this.h_cost = h_cost;
		  this.parent = parent;
		  this.self_XY = self_XY[0]>255 || self_XY[1]>255 ? new Uint16Array(self_XY) : new Uint8Array(self_XY);
			this.arrow_index = arrow_index;  // refers to the index (or arrow array) at which the arrow points from the node to the parent
			// arrow index is used to construct the steps/states when computing the path
      this.neighbours = neighbours;
  }

	clone(){
		let node = new this.constructor(this.f_cost, this.g_cost, this.h_cost, null, this.self_XY, this.arrow_index);
		node.parent = {self_XY: this.parent.self_XY};
		return node;
	}
}
