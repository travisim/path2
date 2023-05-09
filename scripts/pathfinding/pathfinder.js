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
			var cellVal = action[idx]/2;
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
		if(action[0]&(1<<10)){
			++idx;
			var thickness = action[idx]; 
		}
		if(action[0]&(1<<11)){
			++idx;
			var value = action[idx]; 
		}
		if(action[0]&(1<<12)){
			++idx;
			var id = action[idx]; 
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
			cellVal          : ${cellVal}
			endCoord         : ${endX + ", " + endY}
			thickness        : ${thickness}
			value            : ${value}
			id               : ${id}
			`);
		}
		return [command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal, endX, endY,thickness,value,id];/**/
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
		thickness,
		value,
		id
		
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
		if(cellVal!==undefined){
			obj.idx++;
			obj.actionCache[0] |= 1<<8;
			obj.actionCache.push(cellVal*2);
		}
		if(endCoord!==undefined){
			obj.idx++;
			obj.actionCache[0] |= 1<<9;
			obj.actionCache.push(endCoord[0] * 2); // for floating point coordinates
			obj.actionCache.push(endCoord[1] * 2); // for floating point coordinates not working for now
		}
		if (thickness !== undefined) {
			obj.idx++;
			obj.actionCache[0] |= 1 << 10;
			obj.actionCache.push(thickness);
		}
		if (value !== undefined) {
			obj.idx++;
			obj.actionCache[0] |= 1 << 11;
			obj.actionCache.push(value);
		}
		if (id !== undefined) {
			obj.idx++;
			obj.actionCache[0] |= 1 << 12;
			obj.actionCache.push(id);
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
      {uid: "big_map", displayName: "Big Map Optimization:", options: ["Disabled","Enabled",], description: `Enabled will reduce the amount of canvases drawn and steps stored, as certain canvases are meaningless when the map gets too big (queue, neighbors etc.)`},
    ];
	}

	setConfig(uid, value){
		console.log("SETTING CONFIG:", uid, value);
    switch(uid){
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
		this.bg_height = this.map_height;
		this.bg_width = this.map_width;
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
		this.startTime = myUI.startTime;
    this.start = start; //in array form [x,y]  [0,0] is top left  [512,512] is bottom right
    this.goal = goal;
    this.path = null;
    this._clear_steps();
    this.draw_arrows = this.map_height <= 65 && this.map_width <= 65;
		this.current_node = undefined;
		this.queue = [];
    this.batch_interval = 0;
    this.batch_size = Math.max(Math.floor(this.map_height * this.map_width / 20), 10000);
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
		endCoord,
		colour,
		thickness,
		value,
		id
		
	} = {}){
		this.actionCache = this.constructor.packAction({command: command, dest: dest, nodeCoord: nodeCoord, colorIndex: colorIndex, arrowIndex: arrowIndex, pseudoCodeRow: pseudoCodeRow, infoTableRowIndex: infoTableRowIndex, infoTableRowData: infoTableRowData, cellVal: cellVal, endCoord: endCoord, colour: colour,thickness: thickness,value:value,id:id});
		if(this.step_index == 0) console.log(STATIC_COMMANDS[command], this.dests[dest]);
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
		var prevNode = null;
		const originalNode = node;
		myUI.node = originalNode;
		console.log("RETRACING PATH");
		while (node != null) {
			this.path.unshift(node.self_XY);
			/* OLD *//*
			this._create_action(STATIC.DrawPixel, this.dests.path, node.self_XY);
			this._create_action(STATIC.DrawArrow, node.arrow_index, 1);
			/* NEW */
			if(this.constructor.showFreeVertex){
				const OFFSET = this.vertexEnabled ? 0 : 0.5;
				let nodeCoord = node.self_XY.map(x=>x + OFFSET);
				if(this.constructor.gridPrecision == "float")
					this._create_action({command: STATIC.DrawVertex, dest: this.dests.path, nodeCoord: nodeCoord});
				else
					this._create_action({command: STATIC.DrawPixel, dest: this.dests.path, nodeCoord: node.self_XY});
				if(prevNode){
					let endCoord = prevNode.self_XY.map(x=>x + OFFSET);
					this._create_action({command: STATIC.DrawEdge, dest: this.dests.path, nodeCoord: nodeCoord, endCoord: endCoord, thickness: 0.15});
				}
			}
			else this._create_action({command: STATIC.DrawPixel, dest: this.dests.path, nodeCoord: node.self_XY});
			if(! (node.arrow_index === null))
				this._create_action({command: STATIC.DrawArrow, arrowIndex: node.arrow_index, colorIndex: 1});
			
			prevNode = node;
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
	
		this._save_step(true);
    if (this.path == null) console.log("path does not exist");
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
