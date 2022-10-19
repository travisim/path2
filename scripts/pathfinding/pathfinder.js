//------------------------------------------------------------pathfinder

// grid, graph, directed_graph, RRP

class GridPathFinder{

	static get action_buffer(){return 5}

	static get distance_metrics(){
    return [];
  }

	get configs(){
    return [
      {uid: "diagonal_block", displayName: "Diagonal Blocking:", options: ["Blocked", "Unblocked"]},
      {uid: "num_neighbors", displayName: "Neighbors:", options: ["Octal (8-directions)", "Cardinal (4-directions)"]},
      {uid: "first_neighbor", displayName: "Starting Node:", options: ["N", "NW", "W", "SW", "S", "SE", "E", "NE"]},//["+x", "+x+y", "+y", "-x+y", "-x", "-x-y", "-y", "+x-y"]},
      {uid: "search_direction", displayName: "Search Direction:", options: ["Anticlockwise", "Clockwise"]}
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
				this.init_first_neighbour(value);
        break;
      case "search_direction":
        value = value.toLowerCase();
        this.init_search_direction(value);
        break;
    }
  }

	static _manageUnpacking(numBits, offset, idx){
		offset += numBits;
		if(offset>=32){
			idx++;
			offset=1+numBits;
		}
		return [numBits, offset, idx];
	}

	static unpackAction(action){
		/* NEW */
		let bitOffset = 12;
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
			let coord = action[idx]>>1;
			var parentX = Math.floor(coord/myUI.planner.map_width);
			var parentY = coord - parentX * myUI.planner.map_width;
		}
		if(action[0]&(1<<5)){
			++idx;
			var stepIndex = action[idx]>>1;
		}
		if(action[0]&(1<<6)){
			++idx;
			var arrowIndex = action[idx]>>1;
		}
		if(action[0]&(1<<7)){
			++idx;
			var gCost_str = action[idx]/2;
		}
		if(action[0]&(1<<8)){
			++idx;
			var hCost_str = action[idx]/2;
		}
		if(action[0]&(1<<9)){
			++idx;
			var pseudoCodeRow = action[idx]>>1;
		}
		if(action[0]&(1<<10)){
			++idx;
			var infoTableRowIndex = action[idx]>>1;
		}
    if(action[0]&(1<<11)){
			++idx;
			var cellVal = action[idx]/2;
		}
    
		return [command, dest, x, y, parentX, parentY, colorIndex, stepIndex, arrowIndex, gCost_str, hCost_str, pseudoCodeRow,infoTableRowIndex, cellVal];/**/
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
		parentCoord,
		stepIndex,
		colorIndex,
		arrowIndex,
		gCost,
		hCost,
    pseudoCodeRow,
    infoTableRowIndex,
		cellVal
	} = {}){
		/* NEW */
		/*
			this new system will process the arguments using certain keywords
		*/
		/* bits are read from right to left */
		/* 1111111111*/
		let obj = {};
		obj.actionCache = [1];
		obj.bitOffset = 12;
		obj.idx = 0;

		// command is assumed to exist
		this._managePacking(myUI.planner.static_bit_len, obj);
		obj.actionCache[obj.idx] += bit_shift(command, obj.bitOffset - myUI.planner.static_bit_len);
		//console.log("NEW ACTION")
		//console.log(obj.actionCache);
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
		if(parentCoord!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<4;
			obj.actionCache[obj.idx] = (parentCoord[0]*myUI.planner.map_width+parentCoord[1])*2;
		}
		if(stepIndex!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<5;
			obj.actionCache[obj.idx] = stepIndex*2;
		}
		if(arrowIndex!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<6;
			obj.actionCache[obj.idx] = arrowIndex*2;
		}
		if(gCost!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<7;
			obj.actionCache[obj.idx] = gCost*2;
		}
		if(hCost!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<8;
			obj.actionCache[obj.idx] = hCost*2;
		}
    if(pseudoCodeRow!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<9;
			obj.actionCache[obj.idx] = pseudoCodeRow*2;
		}
    if(infoTableRowIndex!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<10;
			obj.actionCache[obj.idx] = infoTableRowIndex*2;
		}
		if(cellVal!==undefined){
			obj.idx++;
			obj.actionCache[0] += 1<<11;
			obj.actionCache[obj.idx] = cellVal*2;
		}

		return obj.actionCache;
	}

	constructor(num_neighbors = 8, diagonal_allow = true, first_neighbour = "N", search_direction = "anticlockwise"){
		this.init_neighbors(num_neighbors, first_neighbour, search_direction);
		this.diagonal_allow = diagonal_allow;
	}

	infoMapPlannerMode(){
		return "default";
	}

	init_neighbors(num_neighbors, first_neighbour=this.first_neighbour, search_direction=this.search_direction){
		this.num_neighbors = num_neighbors;
		
		if(this.num_neighbors==8){
			this.delta = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]; //x,y
			this.deltaNWSE = ["N", "NW", "W", "SW", "S", "SE", "E", "NE"];// North is positive x 
		}
		else{ // if(this.num_neighbors==4)
			this.delta = [[1, 0], [0, 1], [-1, 0], [0, -1]];
			this.deltaNWSE = ["N", "W", "S", "E"];
		}
		this.search_direction = "anticlockwise";
		if(!this.deltaNWSE.includes(first_neighbour)){
			first_neighbour = this.deltaNWSE[0];
			myUI.buttons.first_neighbour_btn.btn.innerHTML = first_neighbour;
		}
		this.first_neighbour = first_neighbour;
		this.init_search_direction(search_direction);
	}

	init_search_direction(search_direction){
		if(this.search_direction!=search_direction){
			this.deltaNWSE.reverse();
			this.delta.reverse();
			this.search_direction = search_direction;
		}
		this.init_first_neighbour(this.first_neighbour);
	}

	init_first_neighbour(first_neighbour){
		this.first_neighbour = first_neighbour;
		this.first_index = this.deltaNWSE.indexOf(this.first_neighbour);
		this.deltaNWSE = this.deltaNWSE.slice(this.first_index).concat(this.deltaNWSE.slice(0, this.first_index));
		this.delta = this.delta.slice(this.first_index).concat(this.delta.slice(0, this.first_index));
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
    this.neighbors = [];
    this.path = null;
    this._clear_steps();
    this.requires_uint16 = this.map_height > 255 || this.map_width > 255;
    this.draw_arrows = this.map_height <= 65 && this.map_width <= 65;
    this.states = {};
		this.visited_incs = [];
		this.current_node = undefined;
    

    // generate empty 2d array
    this.queue_matrix = zero2D(this.map_height, this.map_width); // initialise a matrix of 0s (zeroes), height x width
    this.visited = new NBitMatrix(this.map_height, this.map_width, 7);
		this.arrow_state = new Uint8Array(this.map_height*this.map_width); // stores the visibility of arrows; 1 is shown, 0 is hidden
    this.searched = false;
    this._create_cell_index();

    this.step_index = -1;
    this.prev_count = -1;
    this.state_counter = 0;
		this.step_cache = [];
		myUI.reset_arrow(true);
    // step_index is used to count the number of times a step is created
    // at every ~100 steps, a state is saved
    // this balances between processer and memory usage
		this.prev_node_XY = undefined;
		
		if(this.map_height<=32) this.batch_size = 10;
		else if(this.map_height<=64) this.batch_size = 40;
		else this.batch_size = 1000;
    this.batch_interval = 0;
	}

	_clear_steps(){
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
		parentCoord,
		stepIndex,
		colorIndex,
		arrowIndex,
		gCost,
		hCost,
    pseudoCodeRow,
		infoTableRowIndex,
		cellVal
	} = {}){
		/* NEW */
		/*
			this new system will process the arguments using certain keywords
		*/
		/* bits are read from right to left */
		/* 1111111111*/
		this.actionCache = [1];
		this.bitOffset = 12;
		let idx = 0;

		// command is assumed to exist
		idx = this._manageAction(this.static_bit_len);
		this.actionCache[idx] += bit_shift(command, this.bitOffset - this.static_bit_len);
		//console.log("NEW ACTION")
		//console.log(this.actionCache);
		if(dest!==undefined){
			idx = this._manageAction(this.static_bit_len);
			this.actionCache[0] += 1<<1;
			this.actionCache[idx] += bit_shift(dest, this.bitOffset - this.static_bit_len);
		}/* switched coordinate to new system */
		if(colorIndex!==undefined){
			idx = this._manageAction(this.color_bit_len);
			this.actionCache[0] += 1<<2;
			this.actionCache[idx] += bit_shift(colorIndex, this.bitOffset - this.color_bit_len);
		}
		if(nodeCoord!==undefined){
			++idx;
			this.actionCache[0] += 1<<3;
			this.actionCache[idx] = (nodeCoord[0]*this.map_width+nodeCoord[1])*2;
		}
		if(parentCoord!==undefined){
			++idx;
			this.actionCache[0] += 1<<4;
			this.actionCache[idx] = (parentCoord[0]*this.map_width+parentCoord[1])*2;
		}
		if(stepIndex!==undefined){
			++idx;
			this.actionCache[0] += 1<<5;
			this.actionCache[idx] = stepIndex*2;
		}
		if(arrowIndex!==undefined){
			++idx;
			this.actionCache[0] += 1<<6;
			this.actionCache[idx] = arrowIndex*2;
		}
		if(gCost!==undefined){
			++idx;
			this.actionCache[0] += 1<<7;
			this.actionCache[idx] = gCost*2;
		}
		if(hCost!==undefined){
			++idx;
			this.actionCache[0] += 1<<8;
			this.actionCache[idx] = hCost*2;
		}
    if(pseudoCodeRow!==undefined){
			++idx;
			this.actionCache[0] += 1<<9;
			this.actionCache[idx] = pseudoCodeRow*2;
		}
		if(infoTableRowIndex!==undefined){
			++idx;
			this.actionCache[0] += 1<<10;
			this.actionCache[idx] = infoTableRowIndex*2;
		}
		if(cellVal!==undefined){
			++idx;
			this.actionCache[0] += 1<<11;
			this.actionCache[idx] = cellVal*2;
		}

		this.actionCache.forEach(val=>{
			this.step_cache.push(val);
		});
		//console.log(cellVal)
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
		this.step_cache.forEach(action=>this.steps_data.push(action));
		
		/* 
		step 0 is index 0 to index k-1
		step 1 is kth index where step 0 is k-items long
		step n is k0+k1+k2+...k(n-1) = k(0 to n-1)th index
		*/
		++this.step_index;
		this.step_cache = []; // clear steps to save another step
	}

	_create_cell_index(){
		this.cell_map = zero2D(this.map_height, this.map_width, Number.MAX_SAFE_INTEGER);
	}

	_assign_cell_index(xy){
		// index is the step index for the first expansion of that cell
		let [x,y] = xy;
		this.cell_map[x][y] = this.step_index;
	}

	_manage_state(){
		// [node XY, FGH cost, arrayof queue, 2d array of current visited points, valid neighbors array, visited array]
		if (this.step_index - this.prev_count >= 80) {  
			this.prev_count = this.step_index;
			++this.state_counter;
			if (this.state_counter % 100 == 0) console.log(`reached state ${this.state_counter}, step ${this.step_index}`);
			// add state

			let uint32_len = 50099230;
			if(!this.states.visited_data) this.states.visited_data = [new Uint32Array(uint32_len)];
			if(!this.states.visited_index) this.states.visited_index = 0;
			let curr_visited_section = this.states.visited_data.length - 1;
			if(this.states.visited_index + this.visited.arr_length > this.states.visited_data[curr_visited_section].length){
				if(this.states.visited_data.length<37) this.states.visited_data.push(new Uint32Array(uint32_len));
				else this.states.visited_data.push(new Array(12567562));
				this.states.visited_index = 0;
				++curr_visited_section;
			}
			let nxt_index = this.visited.copy_data_to(this.states.visited_data[curr_visited_section], this.states.visited_index, true);
			let visited_tuple = new Uint32Array([curr_visited_section, this.states.visited_index, nxt_index]);//this.states.visited_index + this.visited.arr_length]);
			//this.states.visited_index+=this.visited.arr_length;
			this.states.visited_index = nxt_index;
//console.log("state","this.step_index",this.step_index,this.neighbors);
			this.states[this.step_index] = { node_XY: this.current_node.self_XY, G_cost:this.current_node.g_cost, H_cost: this.current_node.h_cost, queue:deepCopyNodeArray(this.queue), neighbors:deepCopyNodeArray(this.neighbors),/* neighbors: deep_copy_matrix(this.neighbors_XY), */visited_tuple: visited_tuple, path: this.path, arrow_state: new Uint8Array(this.arrow_state)};


		}
	}

	_found_goal(node){
		// found the goal & exits the loop
		if (node.self_XY[0] != this.goal[0] || node.self_XY[1] != this.goal[1]) return false;
		
		this.path = [];
		// retraces the entire parent tree until start is found
		const originalNode = node;
		myUI.node = originalNode;
		while (node != null) {
			this.path.unshift(node.self_XY);
			/* OLD *//*
			this._create_action(STATIC.DP, STATIC.PA, node.self_XY);
			this._create_action(STATIC.DA, node.arrow_index, 1);
			/* NEW */
			this._create_action({command: STATIC.DP, dest: STATIC.PA, nodeCoord: node.self_XY});
			if(!isNaN(node.arrow_index))
				this._create_action({command: STATIC.DA, arrowIndex: node.arrow_index, colorIndex: 1});
			node = node.parent;
		}
		console.log("found");
		/* NEW */
		this._create_action({command: STATIC.EC, dest: STATIC.CR});
		this._save_step(true);

		this._create_action({command: STATIC.SIMPLE});
		this._save_step(true);

		return true;
	}

	_terminate_search(){
    clearTimeout(this.search_timer);
    if (this.path == null) console.log("path does not exist");
    this.searched = true;
    return this.path;
  }

	get_visited(tuple){
		return this.states.visited_data[tuple[0]].slice(tuple[1], tuple[2]);
	}

	get_queue(tuple){
		if(!tuple) return;
		return this.states.queue_data[tuple[0]].slice(tuple[1], tuple[2]);
	}

	search_state(step_num){
		while(!this.states.hasOwnProperty(step_num) && step_num>-1)
    	--step_num;
		return step_num;
	}

	get_state(step_num){
		return this.states[step_num];
	}

	final_state() {
    if (!this.start) return alert("haven't computed!");
    return { path: this.path, queue: this.queue, visited: this.visited.copy_data()};
  }

  max_step(){
    return this.step_index-1 ; // because of dummy step at the end and final step is n-1
  }

  all_states() {
    if (this.searched) return this.states;
    return null;
  }
  
}

class Node{
	constructor(f_cost, g_cost, h_cost, parent, self_XY, arrow_index,id){
	  	this.f_cost = f_cost;
      this.g_cost = g_cost;
      this.h_cost = h_cost;
		  this.parent = parent;
		  this.self_XY = self_XY[0]>255 || self_XY[1]>255 ? new Uint16Array(self_XY) : new Uint8Array(self_XY);
			this.arrow_index = arrow_index;  // refers to the index (or arrow array) at which the arrow points from the node to the parent
			// arrow index is used to construct the steps/states when computing the path
      this.id = id;
  }

	clone(){
		let node = new this.constructor(this.f_cost, this.g_cost, this.h_cost, null, this.self_XY, this.arrow_index);
		node.parent = {self_XY: this.parent.self_XY};
		return node;
	}
}

//tree data structure
// from https://www.30secondsofcode.org/articles/s/js-data-structures-tree
class TreeNode {
  constructor(key, value = key, parent = null) {
    this.key = key;
    this.value = value;
    this.parent = parent;
    this.children = [];
  }

  get isLeaf() {
    return this.children.length === 0;
  }

  get hasChildren() {
    return !this.isLeaf;
  }
}

class Tree {
  constructor(key, value = key) {
    this.root = new TreeNode(key, value);
  }

  *preOrderTraversal(node = this.root) {
    yield node;
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.preOrderTraversal(child);
      }
    }
  }

  *postOrderTraversal(node = this.root) {
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.postOrderTraversal(child);
      }
    }
    yield node;
  }

  insert(parentNodeKey, key, value = key) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === parentNodeKey) {
        node.children.push(new TreeNode(key, value, node));
        return true;
      }
    }
    return false;
  }

  remove(key) { // chope the branch child onwards
    for (let node of this.preOrderTraversal()) {
      const filtered = node.children.filter(c => c.key !== key);
      if (filtered.length !== node.children.length) {
        node.children = filtered;
        return true;
      }
    }
    return false;
  }

  find(key) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === key) return node;
    }
    return undefined;
  }
} 
