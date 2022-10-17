function removeChildren(elem, childTag="", omitIds=[]){
  childTag = childTag.toLowerCase();
  let idx = 0;
  while(elem.children.length>idx){
    const child = elem.children[idx];
    if(omitIds.includes(child.id)) idx++;
    else if(childTag!="" && child.tagName.toLowerCase()==childTag) idx++;
    else elem.removeChild(child);
		console.log(idx, child.tagName);
  }
}

//takes in a array of objects and returns a array of 1 property of the object
function nodes_to_array(obj_array,property_in_obj){
  var array = new Array(obj_array.length); 
  //  only needs maximum val of 1024*1024 => 20 bits
  // default js uses 64 bits
  let max_val = 0;
  for(let i=0;i<obj_array.length;++i){
    var res = obj_array[i][property_in_obj];
    if(property_in_obj=="self_XY"){
      res = res[0] * myUI.planner.map_width + res[1]; // row-major form
      max_val = Math.max(max_val, res);
    }
    array[i] = res;
  }
  if(max_val == 0) return array;
  else if(max_val < (1<<16)) return new Uint16Array(array);
  else return new Uint32Array(array);
}

function deep_copy_matrix(matrix, flip_bit=false){
  let res = [];
  //console.log(matrix);
  for(let i=0;i<matrix.length;++i){
    let row = new Array(matrix[0].length);
    for(let j=0;j<matrix[0].length;++j) row[j] = flip_bit ? matrix[i][j] ^ 1 : matrix[i][j];
    res.push(row);
  }
  return res;
}

function deepCopyNodeArray(nodeArray){
	let res = [];
	for(const node of nodeArray){
		res.push(node.clone());
	}
	return res;
}

function zero2D(rows, cols, max_val=255, defaultVal=0) {
  var array = new Array(rows);
  while(rows--){
    if(max_val<(1<<8)){
      var row = new Uint8Array(cols).fill(defaultVal);
    }
    else if(max_val<(1<<16)){
      var row = new Uint16Array(cols).fill(defaultVal);
    }
    else if(max_val<(1<<32)){
      var row = new Uint32Array(cols).fill(defaultVal);
    }
    else{
      var row = new Array(cols).fill(defaultVal);
    }
    array[rows] = row;
  }
  return array;
}

class Empty2D{
	constructor(rows, cols){
		this.data = [];
		while(rows--) this.data.push(new Array(cols));
	}

	set(xy, item){
		this.data[xy[0]][xy[1]] = item;
	}

	get(xy){
		return this.data[xy[0]][xy[1]];
	}

	clear(){
		for(let i=0;i<this.data.length;++i){
			for(let j=0;j<this.data[i].length;++j){
				try{this.data[i][j].remove();}
				catch(e){}
				this.data[i][j] = undefined;
			}
		}
	}
}

function empty2D(rows, cols){
	var array = [];
	while(rows--) array.push(new Array(cols));
	return array;
}

function ones(bit_len){
	if(bit_len<32) return ((1<<bit_len)-1)>>>0;
	return Math.pow(2, bit_len)-1;
}

function bit_shift(data, num_bits){
	return Math.floor(Math.pow(2, num_bits)*data);
}

function bit_and(a, b){
	let res = 0, i=0;
	while (a!=0 && b!=0){
		if((a&1) && (b&1)) res += bit_shift(1, i);
		a = bit_shift(a, -1);
		b = bit_shift(b, -1);
		++i;
	}
	return res;
}

class BitMatrix{

	// THIS IS A CUSTOM CLASS THAT USES THE UINT8 ARRAYS TO MORE EFFICIENTLY STORE 2D BIT ARRAYS

	static chunk_len = 32;

	static get data_arr(){
		if(this.chunk_len==8) return Uint8Array;
		if(this.chunk_len==16) return Uint16Array;
		if(this.chunk_len==32) return Uint32Array;
	}

	static max_size = 1024;

	static get max_size_bit(){
		return Math.ceil(Math.log2(this.max_size));
	}

	static compress_bit_matrix(bit_matrix){
		// "this" refers to constructor
    let num_rows = bit_matrix.length;
    let num_cols = bit_matrix[0].length;
	  let res = new this(num_rows, num_cols);
    for(let i=0;i<num_rows;++i){
      for(let j=0;j<num_cols;++j){
				res.set_data([i,j], bit_matrix[i][j]);
      }
    }
		return res;
	}

	static expand_2_matrix(arr){
		// "this" refers to constructor
		let num_rows = (arr[0] & ((1<<this.max_size_bit)-1))+1;
		let num_cols = ((arr[0]>>this.max_size_bit) & ((1<<this.max_size_bit)-1))+1;
		let res = zero2D(num_rows, num_cols);
		let tmp = new this(num_rows, num_cols);
		tmp.data = arr;
		for(let i=0;i<num_rows;++i){
      for(let j=0;j<num_cols;++j){
				res[i][j] = tmp.get_data([i,j]);
			}
		}
		return res;
	}

	constructor(num_rows, num_cols){

    let max_y = num_rows-1;
    let max_x = num_cols-1;
		console.log(this.constructor.data_arr);
    this.data = new this.constructor.data_arr(Math.ceil((this.constructor.max_size_bit*2 + num_cols*num_rows)/this.constructor.chunk_len)); // total number of bits (div) number of bits for max_safe_int
		this.data[0] = max_y;
		this.data[0] += max_x<<this.constructor.max_size_bit;
		this.num_rows = num_rows;
		this.num_cols = num_cols;
	}

	get arr_length(){
		return this.data.length;
	}

	set_data(xy, new_data){
    let index = this.constructor.max_size_bit*2 + xy[0] * this.num_cols + xy[1];
    let arr_index = Math.floor(index/this.constructor.chunk_len);
		// alternatives are for chunk_lens > 30 as js bit shifting doesn't work for n>30;

    //let pos = 1 << (index % this.constructor.chunk_len);
		// alteratively can do // 
		let pos = Math.pow(2, (index % this.constructor.chunk_len));
    new_data = new_data ? pos : 0;
		
    //let mask = ((1<<this.constructor.chunk_len)-1) ^ pos;
		// alteratively can do // let mask = parseInt(`1`.repeat(this.constructor.chunk_len), 2) ^ pos;
		// or // 
		let mask = (Math.pow(2, this.constructor.chunk_len+1)-1) ^ pos;
    this.data[arr_index] = (this.data[arr_index] & mask) + new_data;
	}

	get_data(xy){
		let index = this.constructor.max_size_bit*2 + xy[0] * this.num_cols + xy[1];
		if(index>this.data.length*this.constructor.chunk_len) return 0; // for truncated bitmatrices
    let arr_index = Math.floor(index/this.constructor.chunk_len);
		let rem = (index % this.constructor.chunk_len);
		//let pos = 1 << rem;
		// alteratively can do // 
		let pos = Math.pow(2, rem);
    return (this.data[arr_index] & pos)>>>rem;
	}

	copy_data(){
		/* DEPRECATED, DO NOT USE */
		/*
			problem with using typed arrays: will cause buffer allocation to exceed maximum allowed
			problem with using regular arrays: too much memory required
			solution: store bitmatrices in a flat 1d array with a indexmap to find the next bitmatrix
		*/
		let new_arr = [];
		this.data.forEach(el=>new_arr.push(el));
		return new_arr;
	}

	copy_data_to(ctn, start_index=-1, truncate=false){
		let last_index = this.data.length-1;
		if(truncate) while(this.data[last_index]==0) --last_index;
		++last_index;
		if(start_index==-1) for(let i=0;i<last_index;++i) ctn.push(this.data[i]);
		else for(let i=0;i<last_index;++i){
			ctn[start_index] = this.data[i];
			++start_index;
		}
		return start_index==-1 ? ctn.length : start_index;
	}

	copy_2d(){
		return this.constructor.expand_2_matrix(this.data);
	}
}

class BitArray{

	static set_range(array, start_bit, val, bit_len){
		let tmp_chunk_len = 0;
		if(array.constructor==Uint8Array) tmp_chunk_len = 8;
		else if(array.constructor==Uint16Array) tmp_chunk_len = 16;
		else if(array.constructor==Uint32Array) tmp_chunk_len = 32;
		const chunk_len = tmp_chunk_len;
		const chunk_ones = ones(chunk_len);

		// val>0
		let length = bit_len==undefined ? Math.ceil(Math.log2(val+1)) : bit_len;
		let arr_index = Math.floor(start_bit / chunk_len)
		let pos = start_bit % chunk_len;;
		let mask = chunk_ones ^ (ones(length) << pos);
		//console.log("mask", (mask>>>0).toString(2));
		//let mask = 0b11111111 ^ (((1<<length)-1)<<pos);
		let first_data_length = length+pos > chunk_len ? chunk_len - pos : length;
		array[arr_index] = (array[arr_index] & mask)+ (val << pos);
		//console.log(val, pos, mask.toString(2), first_data_length);
    if(length==first_data_length) return
		length -= first_data_length;
		val >>= first_data_length;
		++arr_index;
		while(length>=chunk_len){
			array[arr_index] = val & chunk_ones;
			length -= chunk_len;
			val = val >>> chunk_len;
			++arr_index;
		}
		if(length){
			let mask = chunk_ones ^ ones(length);
			array[arr_index] = (array[arr_index] & mask) + val;
		}
		//console.log(array);
	}

	static get_range(array, start_bit, length){
		let tmp_chunk_len = 0;
		if(array.constructor==Uint8Array) tmp_chunk_len = 8;
		else if(array.constructor==Uint16Array) tmp_chunk_len = 16;
		else if(array.constructor==Uint32Array) tmp_chunk_len = 32;
		const chunk_len = tmp_chunk_len;
		const chunk_ones = ones(chunk_len);

		let val = 0;
		let completed_length = 0;
		let arr_index = Math.floor(start_bit / chunk_len);
		let pos = start_bit % chunk_len;
		let mask = ones(length) << pos; // (((1<<length)-1)<<pos);
		let data = (array[arr_index] & mask) >>> pos;
		let first_data_length = length+pos > chunk_len ? chunk_len-pos : length;
		val += data;
    if(length==first_data_length) return val;
		length -= first_data_length;
		completed_length += first_data_length;
		++arr_index;
		while(length>=chunk_len){
			val += array[arr_index] << completed_length;
			length -= chunk_len;
			completed_length += chunk_len;
			++arr_index;
		}
		if(length){
			let mask = ones(length);
			val += (array[arr_index] & mask) << completed_length;
		}
		return val;
	}
}


class NBitMatrix{

	// THIS IS A CUSTOM CLASS THAT USES THE UINT8 ARRAYS TO MORE EFFICIENTLY STORE 2D UINT ARRAYS
	// EACH CELL/COORDINATE IN THE ORIGINAL 2D ARRAY CAN BE SPECIFIED TO CONTAIN N-BITS

	static chunk_len = 32;
	// each "chunk" is a string of bits in the data array
	// e.g. Uint32 Arrays have 32 bits in each index

	static get data_arr(){
		if(this.chunk_len==8) return Uint8Array;
		if(this.chunk_len==16) return Uint16Array;
		if(this.chunk_len==32) return Uint32Array;
	}

	static max_length = 1024;
	// this is the max allowed length  for the 2D array
	// 1024x1024

	static max_cell_val = 255;
	// each [i][j] in the matrix can take values for 0-255

	static get max_length_bits(){
		return Math.ceil(Math.log2(this.max_length));
	}

	static get max_cell_bits(){
		return Math.ceil(Math.log2(this.max_cell_val));
	}

	static get bit_offset(){
		return this.max_length_bits*2 + this.max_cell_bits;
	}

	static compress_matrix(matrix, cell_val){
		if(cell_val==undefined){
			// auto finds maximum cell value
			cell_val = 0;
			matrix.forEach(row=>row.forEach(item=>cell_val = Math.max(cell_val, item)));
		}
		let tmp = new NBitMatrix(matrix.length, matrix[0].length, cell_val);
		for(let i=0;i<matrix.length;++i){
			for(let j=0;j<matrix[0].length;++j){
				tmp.set_data([i,j], matrix[i][j]);
			}
		}
		return tmp;
	}

	static expand_2_matrix(arr){
		const num_rows = BitArray.get_range(arr, 0, this.max_length_bits)+1;
		const num_cols = BitArray.get_range(arr, this.max_length_bits, this.max_length_bits)+1;
		const cell_val = BitArray.get_range(arr, this.max_length_bits * 2, this.max_cell_bits);
		let tmp = new NBitMatrix(num_rows, num_cols, cell_val);
		let res = zero2D(num_rows, num_cols, cell_val);
		tmp.data = arr;
		for(let i=0;i<num_rows;++i){
			for(let j=0;j<num_cols;++j){
				res[i][j] = tmp.get_data([i,j]);
			}
		}
		return res;
	}
	
	constructor(num_rows, num_cols, cell_val=1){
		this.num_rows = num_rows;
		this.num_cols = num_cols;
		this.cell_val = cell_val;
		this.cell_val_bits = Math.ceil(Math.log2(this.cell_val+1)); 
		let max_y = num_rows-1;
    let max_x = num_cols-1;
		this.data = new this.constructor.data_arr(Math.ceil((this.constructor.bit_offset + num_cols*num_rows*this.cell_val_bits)/this.constructor.chunk_len)).fill(0); // total number of bits (div) number of bits for max_safe_int
		BitArray.set_range(this.data, 0, max_y);
		BitArray.set_range(this.data, this.constructor.max_length_bits, max_x);
		BitArray.set_range(this.data, this.constructor.max_length_bits*2, cell_val);
	}

	get arr_length(){
		return this.data.length;
	}

	set_data(xy, new_data){
		// find the bit-index of the item in the array
    if(new_data>this.cell_val || new_data<0) return;
    let index = this.constructor.bit_offset + (xy[0] * this.num_cols + xy[1])*this.cell_val_bits;
		//console.log("first",  this.constructor, this.num_cols, this.cell_val_bits);

		BitArray.set_range(this.data, index, new_data, this.cell_val_bits);
	}

	get_data(xy){
		// find the bit-index of the item in the array
    let index = this.constructor.bit_offset + (xy[0] * this.num_cols + xy[1])*this.cell_val_bits;
		if(index>this.data.length*this.constructor.chunk_len) return 0; // for truncated nbitmatrices

		return BitArray.get_range(this.data, index, this.cell_val_bits);
	}

	increment(xy){
		this.set_data(xy, this.get_data(xy)+1);
	}

	copy_data(){
		/* DEPRECATED, DO NOT USE */
		/*
			problem with using typed arrays: will cause buffer allocation to exceed maximum allowed
			problem with using regular arrays: too much memory required
			solution: store bitmatrices in a flat 1d array with a indexmap to find the next bitmatrix
		*/
		return new this.constructor.data_arr(this.data);
	}

	copy_data_to(ctn, start_index=-1, truncate=false){
		let last_index = this.data.length-1;
		if(truncate) while(this.data[last_index]==0) --last_index;
		if(start_index==-1) for(let i=0;i<=last_index;++i) ctn.push(this.data[i]);
		else for(let i=0;i<=last_index;++i){
			ctn[start_index] = this.data[i];
			++start_index;
		}
		return start_index==-1 ? ctn.length : start_index;
	}

	copy_2d(){
		return this.constructor.expand_2_matrix(this.data);
	}
}