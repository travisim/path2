//------------------------------------------------------------pathfinder

// grid, graph, directed_graph, RRP

class GridPathFinder{

	static get action_buffer(){return 5}

	static unpack_action(action){
		let command = (action >> 3) & ones(myUI.planner.static_bit_len);
		if(action & 1)  // dest exists
			var dest = bit_shift(action, -(3 + myUI.planner.static_bit_len)) & ones(myUI.planner.static_bit_len);
		if(action & (1<<1)){  // coord exists
			var coord = bit_shift(action, -(3 + myUI.planner.static_bit_len * 2)) & ones(myUI.planner.coord_bit_len);
			var y = Math.floor(coord/myUI.planner.map_width);
			var x = coord - y * myUI.planner.map_width;
    }
		let parent_exists = action & (1<<2);
		if(parent_exists){ //  g, h & parent exists
			var parent_coord = bit_shift(action, -(3 + myUI.planner.static_bit_len * 2 + myUI.planner.coord_bit_len)) & ones(myUI.planner.coord_bit_len);
			var parent_y = Math.floor(parent_coord/myUI.planner.map_width);
			var parent_x = parent_coord - parent_y * myUI.planner.map_width;
		}
		return [command, dest, y, x, parent_y, parent_x, parent_exists];
	}

	constructor(num_neighbours = 8, diagonal_allow = true, first_neighbour = "N", search_direction = "anticlockwise"){
		this.init_neighbours(num_neighbours, first_neighbour, search_direction);
		this.diagonal_allow = diagonal_allow;
	}

	init_neighbours(num_neighbours, first_neighbour=this.first_neighbour, search_direction=this.search_direction){
		this.num_neighbours = num_neighbours;
		
		if(this.num_neighbours==8){
			this.delta = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
			this.deltaNWSE = ["N", "NW", "W", "SW", "S", "SE", "E", "NE"];
      this.deltaNWSE_STATICS = [5,6,7,8,9,10,11,12];
		}
		else{ // if(this.num_neighbours==4)
			this.delta = [[-1, 0], [0, -1], [1, 0], [0, 1]];
			this.deltaNWSE = ["N", "W", "S", "E"];
      this.deltaNWSE_STATICS = [5,7,9,11];
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
			this.deltaNWSE_STATICS.reverse();
		}
		this.search_direction = search_direction;
		this.init_first_neighbour(this.first_neighbour);
	}

	init_first_neighbour(first_neighbour){
		this.first_neighbour = first_neighbour;
		this.first_index = this.deltaNWSE.indexOf(this.first_neighbour);
		this.deltaNWSE = this.deltaNWSE.slice(this.first_index).concat(this.deltaNWSE.slice(0, this.first_index));
		this.delta = this.delta.slice(this.first_index).concat(this.delta.slice(0, this.first_index));
    this.deltaNWSE_STATICS = this.deltaNWSE_STATICS.slice(this.first_index).concat(this.deltaNWSE_STATICS.slice(0, this.first_index));
	}

	add_map(map){
		this.map = map; // 2d array; each 1d array is a row
		this.map_height = map.length;
		this.map_width = map[0].length;
		this.coord_bit_len = Math.ceil(Math.log2((this.map_height-1) * (this.map_width-1)));
		this.static_bit_len = Math.ceil(Math.log2(STATIC.max_val+1));
	}

	_init_search(start, goal){
    this.start = start; //in array form [y,x]  [0,0] is top left  [512,512] is bottom right
    this.goal = goal;
    this.queue = [];  // BFS uses a FIFO queue to order the sequence in which nodes are visited
    this.neighbours = [];  // current cell's neighbours; only contains passable cells
    this.path = null;
    this._clear_steps();
    this.requires_uint16 = this.map_height > 255 || this.map_width > 255;
    this.draw_arrows = this.map_height <= 64 && this.map_width <= 64;
    this.states = {};
		this.visited_incs = [];

    // generate empty 2d array

    this.info_matrix = zero2D(this.map_height, this.map_width,65537);
    this.queue_matrix = zero2D(this.map_height, this.map_width); // initialise a matrix of 0s (zeroes), height x width
    this.visited = new NBitMatrix(this.map_height, this.map_width, 7);
    this.searched = false;
    this._create_cell_index();

    this.step_index = -1;
    this.prev_count = -1;
    this.state_counter = 0;
    if(this.draw_arrows){
			this.arrow_step = -1;
			myUI.reset_arrow();
		}
    // step_index is used to count the number of times a step is created
    // at every ~100 steps, a state is saved
    // this balances between processer and memory usage
		this.prev_node_YX = undefined;
		
		if(this.map_height<=32) this.batch_size = 10;
		else if(this.map_height<=64) this.batch_size = 40;
		else this.batch_size = 1000;
    this.batch_interval = 0;
	}

	_clear_steps(){
		this.steps_forward = [];
		this.steps_inverse = [];
	}

	_create_step(){
		this.step_cache = [];
	}
  // this._create_action(STATIC.EP, STATIC.QU, this.current_node_YX);
	_create_action(){
		/* use bitmasking to compress every action into a series of Uint8 numbers */
		/* bits are read from right ot left */
		// rightmost bit shows if action contains destination
		// 2nd rightmost shows if action contains coordinates
		// 3rd rightmost bit shows if action contains g & h cost
		// next this.static_bit_len bits contains the command
		// next this.static_bit_len bits contains the destination, if applicable
		// next coord_bit_len bits contains the coordinates
		// next coord_bit_len bits contains the parent coordinates
		// next two integers contain g & h cost, if applicable
		this.action_cache = 0;
		this.action_cache += arguments[0] << 3; // command 
		if(arguments[1]!==undefined){
			this.action_cache += 1; // dest_exists
			this.action_cache += bit_shift(arguments[1], 3 + this.static_bit_len); // dest
		}
		if (arguments[2]!==undefined){
			this.action_cache += 1<<1; // coords exists?
			let y = arguments[2][0];
			let x = arguments[2][1];
			this.action_cache += bit_shift(y * this.map_width + x, 3 + this.static_bit_len * 2);
		}
		if (arguments[3]!==undefined){
			this.action_cache += 1<<2; // parent, g & h exists?
			let y = arguments[5][0];
			let x = arguments[5][1];
			this.action_cache += bit_shift(y * this.map_width + x, 3 + this.static_bit_len * 2 + this.coord_bit_len);
		}
		this.step_cache.push(this.action_cache);
		if (arguments[3]!==undefined){
			this.step_cache.push(arguments[3]);
			this.step_cache.push(arguments[4]);
		}

	}

	_save_step(step_direction="fwd"){
		if(!this.step_index_map) this.step_index_map = {fwd: [], bck: []};
		if(step_direction=="fwd"){
			this.step_index_map.fwd.push(this.steps_forward.length);
			this.step_cache.forEach(action=>this.steps_forward.push(action));
		}
		else{
			this.step_index_map.bck.push(this.steps_inverse.length);
			this.step_cache.forEach(action=>this.steps_inverse.push(action));
		}
		/* 
		step 0 is index 0 to index k-1
		step 1 is kth index where step 0 is k-items long
		step n is k0+k1+k2+...k(n-1) = k(0 to n-1)th index
		*/
		if(step_direction=="bck") ++this.step_index;
	}

	_create_cell_index(){
		this.cell_map = zero2D(this.map_height, this.map_width, Number.MAX_SAFE_INTEGER);
	}

	_assign_cell_index(yx){
		// index is the step index for the first expansion of that cell
		let [y,x] = yx;
		this.cell_map[y][x] = this.step_index;
	}

	get_step(num, step_direction="fwd"){
		let index, nx_index;
		if(step_direction=="fwd"){
			index = this.step_index_map.fwd[num];
			nx_index = this.step_index_map.fwd[num+1];
		}
		else{
			index = this.step_index_map.bck[num+1];
			nx_index = this.step_index_map.bck[num+2];
		}
		let step = step_direction=="fwd" ? this.steps_forward.slice(index, nx_index) :this.steps_inverse.slice(index, nx_index);
		let stepPromise = new Promise((resolve, reject)=>{
			resolve(step);
		})
		return stepPromise;
	}

	_manage_state(){
		// [node YX, FGH cost, arrayof queue, 2d array of current visited points, valid neighbours array, visited array]
		if (this.step_index - this.prev_count >= 115) {  
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

			this.states[this.step_index] = { node_YX: this.current_node.self_YX, F_cost: this.current_node.f_value, G_cost: null, H_cost: null, queue: nodes_to_array(this.queue, "self_YX"), neighbours: nodes_to_array(this.neighbours, "self_YX"), visited_tuple: visited_tuple, path: this.path, arrow_step: this.arrow_step};
			if(this.draw_arrows) this.states[this.step_index].arrow_img = myUI.arrow.ctx.getImageData(...myUI.arrow.full_canvas);

		}
	}

	_found_goal(){
		// found the goal & exits the loop
		if (this.current_node_YX[0] != this.goal[0] || this.current_node_YX[1] != this.goal[1]) return false;
		this.path = [];
		var curr = this.current_node;
		// retraces the entire parent tree until start is found
		while (this.current_node != null) {
			this.path.unshift(this.current_node.self_YX);
			this.current_node = this.current_node.parent;
		}
		console.log("found");

		this._create_step();
		this._create_action(STATIC.SIMPLE);
		this._create_action(STATIC.EC, STATIC.CR);
		this.path.forEach(yx => this._create_action(STATIC.DP, STATIC.PA, yx));
		this._save_step("fwd");

		this._create_step();
		this._create_action(STATIC.SIMPLE);
		this._create_action(STATIC.EC, STATIC.PA);
		this._create_action(STATIC.DP, STATIC.CR, this.current_node_YX);
		this._save_step("bck");

		this._create_step();
		this._create_action(STATIC.SIMPLE);
		this._save_step("fwd");

		this._create_step();
		this._create_action(STATIC.SIMPLE);
		this._save_step("bck");
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
    return { path: this.path, queue: this.queue, visited: this.visited.copy_data(), arrow_step: this.arrow_step,info_matrix:this.info_matrix};
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
	constructor(f_cost, g_cost, h_cost, parent, self_YX){
	  	this.f_cost = f_cost;
      this.g_cost = g_cost;
      this.h_cost = h_cost;
		  this.parent = parent;
		  this.self_YX = self_YX[0]>255 || self_YX[1]>255 ? new Uint16Array(self_YX) : new Uint8Array(self_YX);
	}
}