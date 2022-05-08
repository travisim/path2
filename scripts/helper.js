//takes in a array of objects and returns a array of 1 property of the object
function nodes_to_array(obj_array,property_in_obj){
  var array = [];
  for (let i = 0; i < obj_array.length; i++){
    array.push(obj_array[i][property_in_obj])
  }
  return array;
}

function deep_copy_matrix(matrix, flip_bit=false){
  let res = [];
  for(let i=0;i<matrix.length;++i){
    let row = new Uint8Array(matrix[0].length);
    for(let j=0;j<matrix.length;++j) row[j] = flip_bit ? matrix[i][j] ^ 1 : matrix[i][j];
    res.push(row);
  }
  return res;
}

function zero2D(rows, cols) {
  var array = new Array(rows);
  while(rows--){
    let row = new Uint8Array(cols);
    array[rows] = row;
  }
  return array;
}

