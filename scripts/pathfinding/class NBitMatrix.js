function zero2D(rows, cols, max_val=255) {
  var array = new Array(rows);
  while(rows--){
    if(max_val<(1<<8)){
      var row = new Uint8Array(cols);
    }
    else if(max_val<(1<<16)){
      var row = new Uint16Array(cols);
    }
    else if(max_val<(1<<32)){
      var row = new Uint32Array(cols);
    }
    else{
      var row = new Array(cols);
    }
    array[rows] = row;
  }
  return array;
}

function ones(bit_len){
	if(bit_len<32) return ((1<<bit_len)-1)>>>0;
	return Math.pow(2, bit_len)-1;
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
		console.log("mask", (mask>>>0).toString(2));
		//let mask = 0b11111111 ^ (((1<<length)-1)<<pos);
		let first_data_length = length+pos > chunk_len ? chunk_len - pos : length;
		array[arr_index] = (array[arr_index] & mask)+ (val << pos);
		//console.log(val, pos, mask.toString(2), first_data_length);
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

	static chunk_len = 8;
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
			cell_val = 0;
			matrix.forEach(row=>row.forEach(item=>cell_val = Math.max(cell_val, item)));
		}
		let tmp = new NBitMatrix(matrix.length, matrix[0].length, cell_val);
		for(let i=0;i<matrix.length;++i){
			for(let j=0;j<matrix[0].length;++j){
				tmp.set_data([i,j], matrix[i][j]);
			}
		}
		return tmp.data;
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

	set_data(yx, new_data){
		// find the bit-index of the item in the array
    let index = this.constructor.bit_offset + (yx[0] * this.num_cols + yx[1])*this.cell_val_bits;
		//console.log("first",  this.constructor, this.num_cols, this.cell_val_bits);

		BitArray.set_range(this.data, index, new_data, this.cell_val_bits);
	}

	get_data(yx){
		// find the bit-index of the item in the array
    let index = this.constructor.bit_offset + (yx[0] * this.num_cols + yx[1])*this.cell_val_bits;

		return BitArray.get_range(this.data, index, this.cell_val_bits);
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

	copy_data_to(ctn, start_index=-1){
		if(start_index==-1)this.data.forEach(el=>ctn.push(el));
		else this.data.forEach(el=>{
			ctn[start_index] = el;
			++start_index;
		})
	}

	copy_2d(){
		return this.constructor.expand_2_matrix(this.data);
	}
}

/*let bit_arr = new Uint32Array(1);
BitArray.set_range(bit_arr, 0, 1, 1);
console.log(BitArray.get_range(bit_arr, 0, 1));
BitArray.set_range(bit_arr, 0, 0, 1);
console.log(BitArray.get_range(bit_arr, 0, 1));*/


let bit_mat = new NBitMatrix(5, 5, 2);
console.log(bit_mat.get_data([0,0]));
bit_mat.set_data([0,0], 1);
console.log(bit_mat.get_data([0,0]));
bit_mat.set_data([0,0], 0);
console.log(bit_mat.get_data([0,0]));

let mat = zero2D(5, 5);
mat[0][0] = 50;
mat[2][0] = 1;
mat[2][1] = 4;
mat[2][2] = 1;
mat[2][3] = 5;
mat[3][4] = 2;
mat[4][4] = 1;
let arr = NBitMatrix.compress_matrix(mat);
let mat2 = NBitMatrix.expand_2_matrix(arr);
console.log(mat);
console.log(arr);
console.log(mat2);

/*let bit_arr = new Uint32Array(100);
BitArray.set_range(bit_arr, 0, 10);
console.log(BitArray.get_range(bit_arr, 0, 4));
BitArray.set_range(bit_arr, 1, 15);
console.log(BitArray.get_range(bit_arr, 1, 4));
BitArray.set_range(bit_arr, 31, 15);
console.log(BitArray.get_range(bit_arr, 31, 4));*/
