function encodeGrid(grid, sizeof = 1) {
  var ptrs = [];
  for (const arr of grid) {
    var ptr = encodeArray(arr, sizeof);
    ptrs.push(ptr);
  }
  var root = encodeArray(ptrs, 4);
  return root;
}

function freeGrid(root, m) {
  for (let i = root; i < root + m; ++i) {
    myWasm.free(memory.buffer[i]);
  }
  myWasm.free(root);
}

function encodeArray(arr, sizeof = 1) {
  let len = arr.length;
  var ptr;
  var out;
  if (sizeof == 8) {
    ptr = myWasm.malloc(len * 8);
    out = new BigUint64Array(memory.buffer, ptr);
  }
  else if (sizeof == 4) {
    ptr = myWasm.malloc(len * 4);
    out = new Uint32Array(memory.buffer, ptr);
  }
  else if (sizeof == 2) {
    ptr = myWasm.malloc(len * 2);
    out = new Uint16Array(memory.buffer, ptr);
  }
  else {
    ptr = myWasm.malloc(len);
    out = new Uint8Array(memory.buffer, ptr);
  }

  for (var i = 0; i < len; i++) {
    out[i] = arr[i];
  }
  return ptr;
}

function decodeArray(ptr, len) {
  return new Uint8Array(memory.buffer).slice(ptr, ptr + len);
}

function decodeString(ptr, len) {
  return new TextDecoder("utf8").decode(decodeArray(ptr, len))
}

function decodeString(ptr) {
  var bytes = new Uint8Array(memory.buffer, ptr);
  var strlen = 0;
  while (bytes[strlen] != 0) strlen++;
  return new TextDecoder("utf8").decode(bytes.slice(0, strlen));
}
