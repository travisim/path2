//------------------------------------------------------------pathfinder

// grid, graph, directed_graph, RRP
class Pathfinder{

	static get wasm(){
    return false;
  }

	static get action_buffer(){return 5}

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
		let bitOffset = 13;
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
			/*
			let coord = action[idx]>>1;
			var x = Math.floor(coord/myUI.planner.map_width);
			var y = coord - x * myUI.planner.map_width;
			*/
			var x = action[idx] / 2; // for floating point coordinates
			var y = action[++idx] / 2;
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
			var anyVal = action[idx]/2;
		}
		if(action[0]&(1<<9)){
			++idx;
			/*
			let coord = action[idx]>>1;
			var endX = Math.floor(coord/myUI.planner.map_width);
			var endY = coord - endX * myUI.planner.map_width;
			*/
			var endX = action[idx] / 2; // for floating point coordinates
			var endY = action[++idx] / 2;
		}
	
    
		if(readable){
			console.log(`
			Command          : ${STATIC_COMMANDS[command]}
			Dest             : ${myUI.planner.destsToId[dest]}
			x,y              : ${x + ", " + y}
			colorIndex       : ${colorIndex}
			arrowIndex       : ${arrowIndex}
			pseudoCodeRow    : ${pseudoCodeRow}
			infoTableRowIndex: ${infoTableRowIndex}
			infoTableRowData : ${infoTableRowData}
			anyVal          : ${anyVal}
			endCoord         : ${endX + ", " + endY}
			`);
		}
		return [command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, anyVal, endX, endY];/**/
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
		anyVal,
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
		console.assert(typeof command == "number", `command should be integer; it is ${command}, type: ${typeof command}`);
		if(typeof command != "number") debugger;
		obj.actionCache[obj.idx] += bit_shift(command, obj.bitOffset - myUI.planner.static_bit_len);
		if(dest!==undefined){
			this._managePacking(myUI.planner.static_bit_len, obj);
			obj.actionCache[0] |= 1<<1; 
			obj.actionCache[obj.idx] += bit_shift(dest, obj.bitOffset - myUI.planner.static_bit_len);
		}
		if(colorIndex!==undefined){
			this._managePacking(myUI.planner.color_bit_len, obj);
			obj.actionCache[0] |= 1<<2;
			obj.actionCache[obj.idx] += bit_shift(colorIndex, obj.bitOffset - myUI.planner.color_bit_len);
		}
		if(nodeCoord!==undefined){
			obj.idx++;
			obj.actionCache[0] |= 1<<3;
			obj.actionCache.push(nodeCoord[0] * 2); // for floating point coordinates
			obj.actionCache.push(nodeCoord[1] * 2); // for floating point coordinates
		}
		if(arrowIndex!==undefined){
			obj.idx++;
			obj.actionCache[0] |= 1<<4;
			obj.actionCache.push(arrowIndex*2);
		}
    if(pseudoCodeRow!==undefined){
			obj.idx++;
			obj.actionCache[0] |= 1<<5;
			obj.actionCache.push(pseudoCodeRow*2);
		}
    if(infoTableRowIndex!==undefined){
			obj.idx++;
			obj.actionCache[0] |= 1<<6;
			obj.actionCache.push(infoTableRowIndex*2);
		}
		if(infoTableRowData!==undefined){
			obj.idx++;
			obj.actionCache[0] |= 1<<7;
			obj.actionCache.push(infoTableRowData);
		}
		if(anyVal!==undefined){
			obj.idx++;
			obj.actionCache[0] |= 1<<8;
			obj.actionCache.push(anyVal*2);
		}
		if(endCoord!==undefined){
			obj.idx++;
			obj.actionCache[0] |= 1<<9;
			obj.actionCache.push(endCoord[0] * 2); // for floating point coordinates
			obj.actionCache.push(endCoord[1] * 2); // for floating point coordinates not working for now
		}

		return obj.actionCache;
	}

	get canvases(){
		return [
			
			{
				id:"focused", drawType:"dotted", drawOrder: 1, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["#8F00FF"], toggle: "multi", checked: true, bigMap: false, minVal: 1, maxVal: 1, infoMapBorder: false, infoMapValue: null,
			},
			{
				id:"expanded", drawType:"cell", drawOrder: 2, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["#34d1ea"], toggle: "multi", checked: true, bigMap: false, minVal: 1, maxVal: 1, infoMapBorder: false, infoMapValue: null,
			},
			{
				id:"path", drawType:"cell", drawOrder: 5, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["#34d1ea"], toggle: "multi", checked: true, bigMap: true, minVal: 1, maxVal: 1, infoMapBorder: false, infoMapValue: null,
			},
			{
				id:"neighbors", drawType:"cell", drawOrder: 6, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["rgb(0,130,105)"], toggle: "multi", checked: true, bigMap: false, minVal: 1, maxVal: 1, infoMapBorder: true, infoMapValue: null,
			},
			{
				id:"queue", drawType:"cell", drawOrder: 7, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["rgb(116, 250, 76)"], toggle: "multi", checked: true, bigMap: false, minVal: 1, maxVal: 1, infoMapBorder: true, infoMapValue: null,
			},
			{
				id:"visited", drawType:"cell", drawOrder: 8, fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["hsl(5,74%,85%)", "hsl(5,74%,75%)", "hsl(5,74%,65%)", "hsl(5,74%,55%)", "hsl(5,74%,45%)", "hsl(5,74%,35%)", "hsl(5,74%,25%)", "hsl(5,74%,15%)"], toggle: "multi", checked: true, bigMap: true, minVal: 1, maxVal: 8, infoMapBorder: true, infoMapValue: null,
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
			[`show_arrow-div`, true, "Arrows", "", "multi"]
		];
	}

	constructor(){
    this.generateDests();
	}
	
	generateDests(){
		let idx = 0;

		this.dests = {};
		this.destsToId = [];

		this.dests.pseudoCode = idx++;
		this.destsToId.push("pseudocode");
		
		if(this.canvases) for(const canvas of this.canvases){
			this.dests[canvas.id] = idx++;
			this.destsToId.push(canvas.id);
		}
		if(this.constructor.infoTables) for(const infoTable of this.constructor.infoTables){
			this.dests[infoTable.id] = idx++;
			this.destsToId.push(infoTable.id);
		}
		
		STATIC.max_val = Math.max(STATIC.max_val, idx-1);

		return idx;
	}

	static get configs(){
    return [
			{uid: "diagonal_block", displayName: "Diagonal Blocking:", options: ["Blocked", "Unblocked"], description: `Block connection to an ordinal neighbor (e.g. NW) if there are obstacles in its applicable cardinal directions (e.g. N, W). <br>Unblock to ignore this constraint`},
      {uid: "big_map", displayName: "Big Map Optimization:", options: ["Disabled","Enabled",], description: `Enabled will reduce the amount of canvases drawn and steps stored, as certain canvases are meaningless when the map gets too big (queue, neighbors etc.)`},
    ];
	}

	setConfig(uid, value){
		console.log("SETTING CONFIG:", uid, value);
    switch(uid){
      case "diagonal_block":
				this.diagonal_allow = value=="Unblocked";
        break;
			case "big_map":
				let prev = this.bigMap;
				this.bigMap = value=="Enabled";
				if(prev!==undefined && prev != this.bigMap) myUI.loadPlanner(false);
				break;
			default:
				console.error("INVALID CONFIG SET");
    }
  }

	infoMapPlannerMode(){
		return "default";
	}

	add_map(map){
		this.map_height = map.length;
		this.map_width = map[0].length;
		this.grid_height = this.map_height;
		this.grid_width = this.map_width;
		if(this.vertexEnabled){
			++this.map_height;
			++this.map_width;
		}
		this.map = BitMatrix.compress_bit_matrix(map); // 2d array; each 1d array is a row
		this.map_arr = map;
		this.coord_bit_len = Math.ceil(Math.log2(this.map_height * this.map_width - 1));
		this.static_bit_len = Math.ceil(Math.log2(STATIC.max_val+1));
		this.color_bit_len = Math.ceil(Math.log2(myUI.arrow.colors.length));
	}

	isPassable(coord){ return this.map.get_data(coord); }

	initBatchInfo(){
    this.batch_interval = 0;
    this.batch_size = Math.min(Math.floor(this.map_height * this.map_width), 10000);
		if(this.constructor.display_name.startsWith("Visibility Graph")) this.batch_size = 1000;
	}

	_init_search(start, goal){
		this.add_map(myUI.map_arr);
		this.startTime = myUI.startTime;
    this.start = start; //in array form [x,y]  [0,0] is top left  [512,512] is bottom right
    this.goal = goal;
    this.path = null;
    this._clear_steps();
    this.draw_arrows = this.map_height <= 65 && this.map_width <= 65;
		this.current_node = undefined;
		this.queue = [];
		this.initBatchInfo();
		this.edges = {};
		this.vertices = {};
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
		anyVal,
		endCoord
	} = {}){

		if(command == STATIC.DrawEdge){
			if(!this.edges.hasOwnProperty(dest)) this.edges[dest] = [];
			arrowIndex = myUI.edgeCanvas.drawLine(nodeCoord, endCoord, this.destsToId[dest], false, colorIndex, anyVal);
			this.edges[dest].push([...nodeCoord, ...endCoord, colorIndex, anyVal, arrowIndex]);
			nodeCoord = undefined; endCoord = undefined; colorIndex = undefined; anyVal = undefined;

			if(this.edges[dest].length > myUI.edgeCanvas.maxLines){
				// limit maximum of lines shown on screen by erasing the oldest-drawn line
				let oldest = this.edges[dest].shift();
				this.actionCache = this.constructor.packAction({command: STATIC.EraseEdge, dest: dest, arrowIndex: oldest[6],});
				Array.prototype.push.apply(this.step_cache, this.actionCache);
			}
		}
		else if(command == STATIC.EraseEdge){
			let idx = this.edges[dest].findIndex(edge=>edge[0] == nodeCoord[0] && edge[1] == nodeCoord[1] && edge[2] == endCoord[0] && edge[3] == endCoord[3] && edge[4] == colorIndex);
			if(idx == -1) idx = this.edges[dest].findIndex(edge=>edge[0] == endCoord[0] && edge[1] == endCoord[1] && edge[2] == nodeCoord[0] && edge[3] == nodeCoord[3] && edge[4] == colorIndex);
			if(idx != -1) arrowIndex = this.edges[dest][idx][6];
			nodeCoord = undefined; endCoord = undefined; colorIndex = undefined; anyVal = undefined;
		}
		else if(command == STATIC.EraseAllEdge){
			this.edges[dest] = [];
		}
		else if(command == STATIC.DrawVertex){
			if(!this.vertices.hasOwnProperty(dest)) this.vertices[dest] = [];
			arrowIndex = myUI.nodeCanvas.drawCircle(nodeCoord, this.destsToId[dest], false, colorIndex, anyVal);
			console.log(arrowIndex);
			this.vertices[dest].push([...nodeCoord, colorIndex, anyVal, arrowIndex]);
			nodeCoord = undefined; colorIndex = undefined; anyVal = undefined;

			// check of max number of nodes?
		}
		else if(command == STATIC.EraseVertex){
			let idx = this.vertices[dest].findIndex(vert=>vert[0] == nodeCoord[0] && vert[1] == nodeCoord[1] && vert[2] == colorIndex);
			if(idx != -1) arrowIndex = this.vertices[dest][idx][4];
			nodeCoord = undefined; colorIndex = undefined; anyVal = undefined;
		}
		else if(command == STATIC.EraseAllVertex){
			this.vertices[dest] = [];
		}
		else if(command == STATIC.DrawSingleVertex){
			this.vertices[dest] = [];
			arrowIndex = myUI.nodeCanvas.drawCircle(nodeCoord, this.destsToId[dest], false, colorIndex, anyVal);
			this.vertices[dest].push([...nodeCoord, colorIndex, anyVal, arrowIndex]);
			nodeCoord = undefined; colorIndex = undefined; anyVal = undefined;
		}


		this.actionCache = this.constructor.packAction({command: command, dest: dest, nodeCoord: nodeCoord, colorIndex: colorIndex, arrowIndex: arrowIndex, pseudoCodeRow: pseudoCodeRow, infoTableRowIndex: infoTableRowIndex, infoTableRowData: infoTableRowData, anyVal: anyVal, endCoord: endCoord});
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
      //this._create_action(STATIC.EraseArrow, open_node.arrow_index);
      this._create_action({command: STATIC.EraseArrow, arrowIndex: open_node.arrow_index});
    }
    if(closed_node!==undefined){ // need to remove the previous arrow drawn and switch it to the new_node
      //this._create_action(STATIC.EraseArrow, closed_node.arrow_index);
      this._create_action({command: STATIC.EraseArrow, arrowIndex: closed_node.arrow_index});
    }
    new_node.arrow_index = myUI.create_arrow(next_XY, new_node.parent.self_XY); // node is reference typed so properties can be modified after adding to queue or open list
    this._create_action({command: STATIC.DrawArrow, arrowIndex: new_node.arrow_index, colorIndex: 0});
    // END OF ARROW
	}

	_found_goal(node){
		// found the goal & exits the loop
		if (node.self_XY[0] != this.goal[0] || node.self_XY[1] != this.goal[1]) return false;
		
		if(this._assign_cell_index) if(this.roundNodes===undefined || this.roundNodes) this._assign_cell_index(this.current_node_XY);
		this.path = [];
		// retraces the entire parent tree until start is found
		const originalNode = node;
		myUI.node = originalNode;
		console.log("RETRACING PATH");
		while (node != null) {
			this.path.unshift(node.self_XY);
			if(this.constructor.showFreeVertex){
				if(this.constructor.gridPrecision == "float")
					this._create_action({command: STATIC.DrawVertex, dest: this.dests.path, nodeCoord: node.self_XY});
				else
					this._create_action({command: STATIC.DrawPixel, dest: this.dests.path, nodeCoord: node.self_XY});

				if(node.parent)
					this._create_action({command: STATIC.DrawEdge, dest: this.dests.path, nodeCoord: node.self_XY, endCoord: node.parent.self_XY, anyVal: 3});
				
			}
			else this._create_action({command: STATIC.DrawPixel, dest: this.dests.path, nodeCoord: node.self_XY});
			if(! (node.arrow_index === null))
				this._create_action({command: STATIC.DrawArrow, arrowIndex: node.arrow_index, colorIndex: 1});
			
			node = node.parent;
		}
		console.log("found");
		console.log(this.path);
		this.pathLength = this.calculatePathLength(this.path)
		this.endNumberOfNodes = this.path.length
		console.log(this.pathLength);

		this._save_step(true);

		return true;
	}

	_terminate_search(){
		myUI.nodeCanvas.finishDrawing();
		myUI.edgeCanvas.finishDrawing();
		if(this.step_index) this._save_step(true);
    return 0;
  }

	max_step(){
	return this.step_index-1 ; // because of dummy step at the end and final step is n-1
	}
	
	calculatePathLength(path) {
		var pathLength = 0
		if (path.length > 1) {
			for (i = 0; i < path.length-1; i++){
				pathLength += distanceBetween2Points(path[i], path[i + 1])
			}
		}
		return pathLength.toPrecision(5)
	}
}

	class Node{
		constructor(f_cost, g_cost, h_cost, parent, self_XY, arrow_index = null, neighbours = []){
		this.f_cost = f_cost;
		this.g_cost = g_cost;
		this.h_cost = h_cost;
		this.parent = parent;
		this.self_XY = self_XY;
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
