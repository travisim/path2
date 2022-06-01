//takes in a array of objects and returns a array of 1 property of the object
function nodes_to_array(obj_array,property_in_obj){
  var array = new Uint32Array(obj_array.length);//new Array(obj_array.length); 
  //  only needs maximum val of 1024*1024 => 20 bits
  // default js uses 64 bits
  for(let i=0;i<obj_array.length;++i){
    var res = obj_array[i][property_in_obj];
    if(property_in_obj=="self_YX"){
      res = res[0] * myUI.planner.map_width + res[1]; // row-major form
    }
    array[i] = res;
  }
  return array;
}

function deep_copy_matrix(matrix, flip_bit=false){
  let res = [];
  console.log(matrix);
  for(let i=0;i<matrix.length;++i){
    let row = new Uint8Array(matrix[0].length);
    for(let j=0;j<matrix.length;++j) row[j] = flip_bit ? matrix[i][j] ^ 1 : matrix[i][j];
    res.push(row);
  }
  return res;
}

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

