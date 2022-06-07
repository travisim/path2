//------------------------------------------------------------pathfinder

// grid, graph, directed_graph, RRP

class GridPathFinder{

	static get action_buffer(){return 5}

	static unpack_action(action){
		let command = (action >> 2) & ((1 << myUI.planner.static_bit_len) - 1);
		if(action & 1)  // dest exists
			var dest = (action >> 2 + myUI.planner.static_bit_len) & ((1 << myUI.planner.static_bit_len) - 1);
		if(action & (1<<1)){  // coord exists
			var coord = (action >> 2 + myUI.planner.static_bit_len * 2) & ((1 << myUI.planner.coord_bit_len) - 1);
			var y = Math.floor(coord/myUI.planner.map_width);
			var x = coord - y * myUI.planner.map_width;
    }
		return [command, dest, y, x];
	}

	constructor(num_neighbours = 8, diagonal_allow = true, first_neighbour = "N", search_direction = "anticlockwise"){
		this.num_neighbours = num_neighbours;
		this.diagonal_allow = diagonal_allow;
		this.first_neighbour = first_neighbour;
		this.search_direction = search_direction;

		if(this.num_neighbours==8){
			var delta = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
			var deltaNWSE = ["N", "NW", "W", "SW", "S", "SE", "E", "NE"];
		}
		else{ // if(this.num_neighbours==4)
			var delta = [[-1, 0], [0, -1], [1, 0], [0, 1]];
			var deltaNWSE = ["N", "W", "S", "E"];
		}
		if (this.search_direction=="clockwise"){
			delta.reverse();
			deltaNWSE.reverse();
		}
		
		this.first_index = deltaNWSE.indexOf(this.first_neighbour);
		this.deltaNWSE = deltaNWSE.slice(this.first_index).concat(deltaNWSE.slice(0, this.first_index));
		this.delta = delta.slice(this.first_index).concat(delta.slice(0, this.first_index));

    this.searched = false;
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
    this.draw_arrows = this.map_height <= +4 || this.map_width <= 128;
    this.states = {};

    // generate empty 2d array

    this.info_matrix = zero2D(this.map_height, this.map_width,65537);
    this.queue_matrix = zero2D(this.map_height, this.map_width); // initialise a matrix of 0s (zeroes), height x width
    this.visited = new NBitMatrix(this.map_height, this.map_width, 7);
    this.searched = false;
    this._create_cell_index();

    this.step_index = -1;
    this.prev_count = -1;
    this.state_counter = 0;
    if(this.draw_arrows) this.arrow_step = -1;
    // step_index is used to count the number of times a step is created
    // at every ~100 steps, a state is saved
    // this balances between processer and memory usage
		this.prev_node_YX = undefined;
	}

	_clear_steps(){
		this.steps_forward = [];
		this.steps_inverse = [];
	}

	_create_step(){
		this.step_cache = [];
	}

	_create_action(){
		/* use bitmasking to compress every action into a series of Uint8 numbers */
		/* bits are read from right ot left */
		// rightmost bit shows if action contains destination
		// 2nd rightmost shows if action contains coordinates
		// next this.static_bit_len bits contains the command
		// next this.static_bit_len bits contains the destination, if applicable
		// next coord_bit_len bits contains the coordinates
		this.action_cache = 0;
		this.action_cache += arguments[0] << 2; // command 
		if(arguments[1]!==undefined){
			this.action_cache += 1; // dest_exists
			this.action_cache += arguments[1] << (2 + this.static_bit_len); // dest
		}
		if (arguments[2]!==undefined){
			this.action_cache += 1<<1; // coords exists?
			let y = arguments[2][0];
			let x = arguments[2][1];
			this.action_cache += (y * this.map_width + x) << (2 + this.static_bit_len * 2);
		}
		this.step_cache.push(this.action_cache);
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
		step 0 is index 0
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
		if (this.step_index - this.prev_count >= 100) {
			this.prev_count = this.step_index;
			++this.state_counter;
			if (this.state_counter % 100 == 0) console.log(`reached state ${this.state_counter}, step ${this.step_index}`);
			// add state

			let uint32_len = 50099230;
			if(!this.states.visited_data) this.states.visited_data = [new Uint32Array(uint32_len)];
			if(!this.states.visited_index) this.states.visited_index = 0;
			if(this.states.visited_index + this.visited.arr_length >= uint32_len){
				this.states.visited_data.push(new Uint32Array(uint32_len));
				this.states.visited_index = 0;
			}
			let i = this.states.visited_data.length - 1;
			let visited_tuple = [i, this.states.visited_index, this.states.visited_index + this.visited.arr_length];
			this.states[this.step_index] = { node_YX: this.current_node.self_YX, F_cost: this.current_node.f_value, G_cost: null, H_cost: null, queue: nodes_to_array(this.queue, "self_YX"), neighbours: nodes_to_array(this.neighbours, "self_YX"), visited_tuple: visited_tuple, path: this.path, arrow_step: this.arrow_step };

			this.visited.copy_data_to(this.states.visited_data[i], this.states.visited_index)

			this.states.visited_index+=this.visited.arr_length;
		}
	}

	get_visited(tuple){
		return this.states.visited_data[tuple[0]].slice(tuple[1], tuple[2]);
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