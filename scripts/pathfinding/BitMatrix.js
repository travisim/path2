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

class BitMatrix{

	// THIS IS A CUSTOM CLASS THAT USES THE UINT8 ARRAYS TO MORE EFFICIENTLY STORE 2D BIT ARRAYS

	static chunk_length = 32;

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
		return res.data;
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
    this.data = new Uint32Array(Math.ceil((this.constructor.max_size_bit*2 + num_cols*num_rows)/this.constructor.chunk_length)); // total number of bits (div) number of bits for max_safe_int
		this.data[0] = max_y;
		this.data[0] += max_x<<this.constructor.max_size_bit;
		this.num_rows = num_rows;
		this.num_cols = num_cols;
	}


	set_data(yx, new_data){
    let index = this.constructor.max_size_bit*2 + yx[0] * this.num_cols + yx[1];
    let arr_index = Math.floor(index/this.constructor.chunk_length);
		// alternatives are for chunk_lengths > 30 as js bit shifting doesn't work for n>30;

    //let pos = 1 << (index % this.constructor.chunk_length);
		// alteratively can do // 
		let pos = Math.pow(2, (index % this.constructor.chunk_length));
    new_data = new_data ? pos : 0;
		
    //let mask = ((1<<this.constructor.chunk_length)-1) ^ pos;
		// alteratively can do // let mask = parseInt(`1`.repeat(this.constructor.chunk_length), 2) ^ pos;
		// or // 
		let mask = (Math.pow(2, this.constructor.chunk_length+1)-1) ^ pos;
    this.data[arr_index] = (this.data[arr_index] & mask) + new_data;
	}

	get_data(yx){
		let index = this.constructor.max_size_bit*2 + yx[0] * this.num_cols + yx[1];
    let arr_index = Math.floor(index/this.constructor.chunk_length);
		let rem = (index % this.constructor.chunk_length);
		let pos = 1 << rem;
    return (this.data[arr_index] & pos)>>rem;
	}

	copy_data(){
		//let new_arr = [];
		//this.data.forEach(el=>new_arr.push(el));
		return new Uint32Array(this.data);
	}

	copy_2d(){
		return this.constructor.expand_2_matrix(this.data);
	}
}

let bit_mat = new BitMatrix(5, 5);
console.log(bit_mat.get_data([0,0]));
bit_mat.set_data([0,0], 1);
console.log(bit_mat.get_data([0,0]));
bit_mat.set_data([0,0], 0);
console.log(bit_mat.get_data([0,0]));

let mat = zero2D(5, 5);
mat[0][0] = 1;
mat[2][1] = 1;
mat[3][4] = 1;
let arr = BitMatrix.compress_bit_matrix(mat);
let mat2 = BitMatrix.expand_2_matrix(arr);
console.log(mat);
console.log(arr);
console.log(mat2);