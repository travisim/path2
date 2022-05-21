//------------------------------------------------------------pathfinder

// grid, graph, directed_graph, RRP

class GridPathFinder{
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
		this.coord_bit_len = Math.ceil(Math.log2(this.map_height * this.map_width));
		this.static_bit_len = Math.ceil(Math.log2(STATIC.max_val+1));
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
		if(myUI.db_step){
			this.step_cache.unshift(this.step_counter);
			if(step_direction=="fwd") myUI.storage.add("step_fwd", [this.step_cache]);
			else myUI.storage.add("step_bck", [this.step_cache]);
		}
		else{
			if(step_direction=="fwd") this.steps_forward.push(this.step_cache);
      else this.steps_inverse.push(this.step_cache);
		}
		if(step_direction=="bck") ++this.step_counter;
	}

	get_step(num, step_direction="fwd"){
		let stepPromise;
		if(myUI.db_step){
			stepPromise = step_direction=="fwd" ? myUI.storage.get("step_fwd", num) : myUI.storage.get("step_bck", num+1);
		}
		else{
			let step = step_direction=="fwd" ? this.steps_forward[num] :this.steps_inverse[num+1];
			stepPromise = new Promise((resolve, reject)=>{
				resolve(step);
			})
		}
		return stepPromise;
	}

	final_state() {
    if (!this.start) return alert("haven't computed!");
    return { path: this.path, queue: this.queue, visited: this.visited.copy_data(), arrow_step: this.arrow_step};
  }

  max_step(){
    return this.step_counter-2 ; // because of dummy step at the end and final step is n-1
  }

  all_states() {
    if (this.searched) return myUI.db_on ? this.states_nums : this.states;
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

class BitMatrix{

	// THIS IS A CUSTOM CLASS THAT USES THE UINT8 ARRAYS TO MORE EFFICIENTLY STORE

	static compress_bit_matrix(bit_matrix){
		let num = Math.ceil(bit_matrix[0].length/8);
		let last_denary = bit_matrix[0].length % 8;
		let res = new Uint8Array(2+num*bit_matrix.length);
		res[0] = num;
		res[1] = last_denary;
		let j = 2;
		bit_matrix.forEach(row=>{
			let index = 0;
			while(index<row.length){
				let args = row.slice(index, index+8); // take 8 bits or remaining bits because already calculated
				var digit = parseInt(args.join(""), 2);
				index += 8;
				res[j] = digit;
				++j;
			}
		});
		return res;
	}

	static expand_2_matrix(arr){
		const num = arr[0];
		const last_denary = arr[1];
		const num_rows = (arr.length-2)/num;
		const num_cols = (num-1)*8+last_denary;
		
		let res = zero2D(num_rows, num_cols);
		for(let i=0;i<num_rows;++i){
			let j = 0;
			let row = arr.slice(i*num+2, (i+1)*num+2);
			for(let k=0;k<row.length;++k){
				let bin_str = row[k].toString(2);
				let num_zeros = k==row.length-1 ? last_denary-bin_str.length : 8-bin_str.length;
				bin_str = "0".repeat(num_zeros) + bin_str;
				bin_str.split('').forEach(bit=>{
					res[i][j] = parseInt(bit);
					++j;
				});
			}
		}
		return res;
	}

	constructor(num_rows, num_cols){
		let num = Math.ceil(num_cols/8);
		let last_denary = num_cols % 8 == 0 ? 8 : num_cols % 8;
		this.data = new Uint8Array(2+num*num_rows);
		this.data[0] = num;
		this.data[1] = last_denary;
		this.num_rows = num_rows;
		this.num_cols = num_cols;
		this.num = num;
		this.last_denary = last_denary;
	}


	set_data(yx, new_data){
		let index = 2 + yx[0]*this.num + (yx[1]>>3); // same as Math.floor(yx[1]/8);
		if(index==0){
			console.log("bruh");
			console.log(yx);
		}
		let bin_length = (index-1) % this.num == 0 ? this.last_denary : 8;
		let rem = yx[1]%8;
		let data_shifted = new_data << (bin_length - rem - 1);
		let mask = 0b11111111 ^ (1 << (bin_length - rem - 1));
		this.data[index] = (this.data[index] & mask) + data_shifted;

	}

	get_data(yx){
		let index = 2 + yx[0]*this.num + (yx[1]>>3); // same as Math.floor(yx[1]/8);
		let bin_length = (index-1) % this.num == 0 ? this.last_denary : 8;
		let rem = yx[1]%8;
		let mask = 1 << (bin_length - rem - 1);
		return this.data[index] & mask ? 1 : 0;
	}

	copy_data(){
		return new Uint8Array(this.data);
	}

	copy_2d(){
		return BitMatrix.expand_2_matrix(this.data);
	}
}

class Matrix{
	constructor(num_rows, num_cols){
		this.data = zero2D(num_rows, num_cols);
	}

	get_data(yx){
		return this.data[yx[0]][yx[1]];
	}

	set_data(yx, data){
		this.data[yx[0]][yx[1]] = data;
	}

	copy_data(){
		return deep_copy_matrix(this.data);
	}
}