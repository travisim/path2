// program to generate random strings

// declare all characters
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}




function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function BresenhamLOSChecker(start_XY, end_XY) {//return 0 if no LOS return 1 if there is LOS also checks the start and goal//LOS uses canvas data for greater detail
  const start_coord = {y0:start_XY[1]*(944/myUI.map_height), x0:start_XY[0]*(944/myUI.map_width)};
  const end_coord = {y1:end_XY[1]*(944/myUI.map_height), x1:end_XY[0]*(944/myUI.map_width)};
  var x0 = start_coord.x0;
  var y0 = start_coord.y0;
  var x1 = end_coord.x1;
  var y1 = end_coord.y1;
  var Prev_x;// 0 1 2  0 58 117
  var Prev_y;
  let dots = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = (x0 < x1) ? 1 : -1;
  let sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy; // err should be zero

  //dots.push([x0,y0]);
  PixelCloudObstacleStrength = (myUI.canvases["bg"].ctx.getImageData(y0+1, x0, 1, 1).data[3] + myUI.canvases["bg"].ctx.getImageData(y0, x0+1, 1, 1).data[3] + myUI.canvases["bg"].ctx.getImageData(y0-1, x0, 1, 1).data[3] +myUI.canvases["bg"].ctx.getImageData(y0, x0-1, 1, 1).data[3])/4;
  if(PixelCloudObstacleStrength == 255){ //just check r value
      return 0;
    }

  while(!((x0 == x1) && (y0 == y1))) {
    let e2 = err << 1;

    if (e2 > -dy) {
        err -= dy;
        Prev_x = x0;
        x0 += sx;
    }

    if (e2 < dx) { 
        err += dx; 
        Prev_y = y0;
        y0 += sy;
    }
  PixelCloudObstacleStrength = (myUI.canvases["bg"].ctx.getImageData(y0+1, x0, 1, 1).data[3] + myUI.canvases["bg"].ctx.getImageData(y0, x0+1, 1, 1).data[3] + myUI.canvases["bg"].ctx.getImageData(y0-1, x0, 1, 1).data[3] +myUI.canvases["bg"].ctx.getImageData(y0, x0-1, 1, 1).data[3])/4;
    if(PixelCloudObstacleStrength == 255){ //just check r value
      return 0;
    }
  }

  return 1; //if there is LOS
}
//console.log(BresenhamLOSChecker([0, 0], [3, 3]),"BresenhamLOSChecker")
//tree data structure---------------------------------------
// from https://www.30secondsofcode.org/articles/s/js-data-structures-tree

function CustomLOSChecker(src, tgt){
  let grid = myUI.canvases.bg.canvas_cache;                     // obstacle 2d matrix
  if(grid == undefined || grid[0] == undefined) return false;
  if (src[0] == tgt[0] && src[1] == tgt[1]) {
    if(src[0] == Math.floor(src[0]) && src[1] == Math.floor(src[1])){
      return { boolean: true };
    }
    else if (grid[Math.floor(src[0])][Math.floor(src[1])]) {
      return { boolean: false };
    }
    else {
      return {  boolean: true };
    }
  }
  

  var src_dynamic = [];
  src[0] == myUI.map_height ? src_dynamic.push(src[0]-1):src_dynamic.push(src[0]);
  src[1] == myUI.map_width ? src_dynamic.push(src[1]-1):src_dynamic.push(src[1]);
  var tgt_dynamic= [];
  tgt[0] == myUI.map_height ? tgt_dynamic.push(tgt[0]-1):tgt_dynamic.push(tgt[0]);
  tgt[1] == myUI.map_width ? tgt_dynamic.push(tgt[1]-1):tgt_dynamic.push(tgt[1]);
  


  if((src[0] == tgt[0] && Number.isInteger(src[0])) || (src[1] == tgt[1] && Number.isInteger(src[1]))){
    // cardinal crossing(horizontal/vertical)
    
    
    let x1 = src[0], x0 = src[0] - 1;
    if(src[0] == tgt[0]){                      
      if(src[0]-1 < 0){                 //at top edge of canvas     //if(x0 == 0 || x1 == myUI.map_height){
        // travelling along edge of map/ top or bottom of map
        // accept or reject depending on the map configuration
        // we'll just not accept it for now
        if (src[1]>tgt[1]){
          for (let y = src_dynamic[1]; y > tgt_dynamic[1]-1; --y){
            if (grid[src[0]][y]){
              return{
                boolean: false,
                lastPassableCoordBeforeUnpassable: [src[0],y+1],
              } 
            } 
          }  
          return{
            boolean: true,
          } 
          
        }
        if (src[1]<tgt[1]){
          for (let y = src_dynamic[1]; y < tgt_dynamic[1]; ++y){
            if (grid[src[0]][y]){
              return{
                boolean: false,
                lastPassableCoordBeforeUnpassable: [src[0],y],
              } 
            } 
          } 
          return{
            boolean: true,
          } 
          
        }  
        
      }
      else if(src[0] == myUI.map_height){ // at bottom edge of canvas need check index 16 of grid which is not there so check index 15 instead
        if (src[1]>tgt[1]){
          for (let y = src_dynamic[1]; y > tgt_dynamic[1]-1; --y){
            if (grid[src[0]-1][y]){
              return{
                boolean: false,
                lastPassableCoordBeforeUnpassable: [src[0],y+1],
              } 
            } 
          } 
          return{
            boolean: true,
          }  
          
        }
        if (src[1]<tgt[1]){
          for (let y = src_dynamic[1]; y < tgt_dynamic[1]; ++y){
            if (grid[src[0]-1][y]){
              return{
                boolean: false,
                lastPassableCoordBeforeUnpassable: [src[0],y],
              } 
            } 
          } 
          return{
            boolean: true,
          } 
        }  
          

      }
      else{//below is the case for LOS is not at the edge of canvas
        
        if (src[1]>tgt[1]){
          for (let y = src_dynamic[1]; y > tgt_dynamic[1]-1; --y){
            if (grid[src[0]-1][y] && (grid[src[0]][y] == undefined || grid[src[0]][y])){
              return{
                boolean: false,
                lastPassableCoordBeforeUnpassable: [src[0],y+1],
              } 
            } 
          }
          return{
            boolean: true,
          } 
        }
        if (src[1]<tgt[1]){
          for (let y = src_dynamic[1]; y < tgt_dynamic[1]; ++y){
            if (grid[src[0]-1][y] && (grid[src[0]][y] == undefined || grid[src[0]][y])){
              return{
                boolean: false,
                lastPassableCoordBeforeUnpassable: [src[0],y],
              } 
            } 
          }
          return{
            boolean: true,
          }
        }
      }
    }
    let y1 = src[1], y0 = src[1] - 1; 
    if(src[1] == tgt[1]){
      
      if(src[1]-1 < 0 ){
        // travelling along edge of map
        // accept or reject depending on the map configuration
        // we'll just not accept it for now
        if (src[0]>tgt[0]){
          for (let x = src_dynamic[0]; x > tgt_dynamic[0]-1; --x){
            if (grid[x][src[1]]){
              return{
                boolean: false,
                lastPassableCoordBeforeUnpassable: [x+1,src[1]],
              } 
            } 
          }
          return{
            boolean: true,
          }
          
        }
        if (src[0]<tgt[0]){
          for (let x = src_dynamic[0]; x < tgt_dynamic[0]; ++x){
            if (grid[x][src[1]]){
              return{
                boolean: false,
                lastPassableCoordBeforeUnpassable: [x,src[1]],
              } 
            } 
          }
          return{
            boolean: true,
          }
          
        }
      }
      else if( src[1] == myUI.map_width){
        if (src[0]>tgt[0]){
          for (let x = src_dynamic[0]; x > tgt_dynamic[0]-1; --x){
            if (grid[x][src[1]-1]){
              return{
                boolean: false,
                lastPassableCoordBeforeUnpassable: [x+1,src[1]],
              } 
            } 
          }
          return{
            boolean: true,
          }
          
          
        }
        if (src[0]<tgt[0]){
          for (let x = src_dynamic[0]; x < tgt_dynamic[0]; ++x){
            if (grid[x][src[1]-1]){
              return{
                boolean: false,
                lastPassableCoordBeforeUnpassable: [x,src[1]],
              } 
            } 
          }
          return{
            boolean: true,
          }
        
        }
      }
      
      else{ 
        if (src[0]>tgt[0]){
          for (let x = src_dynamic[0]; x > tgt_dynamic[0]-1; --x){
            if (grid[x][src[1]-1] && (grid[x][src[1]] == undefined || grid[x][[src[1]]])){
              return{
                boolean: false,
                lastPassableCoordBeforeUnpassable: [x+1,src[1]],
              } 
            } 
          }
          return{
            boolean: true,
          }
          
        }
        if (src[0]<tgt[0]){
          for (let x = src_dynamic[0]; x < tgt_dynamic[0]; ++x){
            if (grid[x][src[1]-1] && (grid[x][src[1]] == undefined || grid[x][src[1]])){
              return{
                boolean: false,
                lastPassableCoordBeforeUnpassable: [x,src[1]],
              } 
            } 
          }
          return{
            boolean: true,
          }
        
        }
      }

    }
  }

  else{
    let path = CustomLOSGenerator(src, tgt, false);
    let prevX = undefined, prevY = undefined;
    for(coord of path){
      let x = coord[0];
      let y = coord[1];
      
      if(myUI.planner && !myUI.planner.diagonal_allow
        && prevX !== undefined && prevY !== undefined
        && x != prevX && y != prevY){
        console.log(x, y, prevX, prevY);
        // diagonal crossing 
        if(grid[x][prevY] && grid[prevX][y]){
          // diagonal blocked
          return false;
        }
      }

      if(grid[x][y]){
        return{
          boolean: false,
        } 
      } 
      prevX = x;
      prevY = y;
    }
    return{
      boolean: true,
    }
  }
}

function CustomLOSGenerator(src, tgt, cons = false){
  const THRES = 1e-3;
  
  /* addition to given algo */
  if(src.reduce(add, 0) < tgt.reduce(add, 0))
    [src, tgt] = [tgt, src];  // swap the arrays
  /* end of addition */
  let diffX = tgt.map((x, i) => x - src[i]);    // i is index here
  let absX = diffX.map(Math.abs);

  let cflag = absX[0] > absX[1];   

  let diffZ = conv(cflag, diffX);
  let absZ = diffZ.map(Math.abs);
  let dZ = diffZ.map(x => x > 0 ? 1 : x < 0 ? -1 : 0);

  let srcZ = conv(cflag, src);
  let tgtZ = conv(cflag, tgt);
  let tgtFloorZ = tgtZ.map(Math.floor);
  let floorZ = srcZ.map(Math.floor);
  let prevS = srcZ[1];

  let psiZ = dZ.map(x => x > 0 ? x : 0);
  let cmp = (floorZ[0] + psiZ[0] - srcZ[0]) * absZ[1] / diffZ[0] - dZ[1] * psiZ[1];
  let changeS = diffZ[1] / absZ[0];
  if(cons) console.log(`diffZ[1]: ${diffZ[1]}, absZ[0]: ${absZ[0]}`);

  /* addition to given algo */
  let gradient = (tgt[1] - src[1]) / (tgt[0] - src[0]);
  /* end of addition */
  let path = [];
  /* addition to given algo */
  if(src[0] > 0 && src[1] > 0){
    let srcFloor = src.map(Math.floor);
    if(src[0] > srcFloor[0] && src[1] > srcFloor[1]) path.push(srcFloor);
  }
  /* end of addition */
  if(cons) console.log(`src, tgt: [${src[0]}, ${src[1]}], [${tgt[0]}, ${tgt[1]}]`);
  if(cons) console.log("initial path: ", coords2String(path));
  let step = 0;
  while (!equal(floorZ, tgtFloorZ)) {
    if(cons) console.log(`floorZ: ${floorZ}, tgtFloorZ: ${tgtFloorZ}`);
    step++;

    let S = changeS * step + srcZ[1];
    if(cons) console.log(`S: ${S}, changeS: ${changeS}, step: ${step}, srcZ[1]: ${srcZ[1]}`);
    let floorS = Math.floor(S);
    if(cons) console.log(`floorS: ${floorS}`);
    if (floorS !== floorZ[1]) {
      // short incremented
      let cmpS = dZ[1] * (floorZ[1] - prevS);

      if(cons) console.log(`cmpS: ${cmpS}, cmp: ${cmp}`);
      if (cmpS - THRES > cmp) {
        // pass thru large first
        floorZ[0] = floorZ[0] + dZ[0];
        path.push(conv(cflag, floorZ));
        if(cons) console.log(`small1: [${conv(cflag, floorZ)}]`);
        if (equal(floorZ, tgtFloorZ)) {
            break; // reached destination
        }
        floorZ[1] = floorZ[1] + dZ[1];
        if(cons)console.log(`small2: [${conv(cflag, floorZ)}]`);
      } 
      else if (cmpS + THRES < cmp) {
        // pass thru small first
        floorZ[1] = floorZ[1] + dZ[1];
        path.push(conv(cflag, floorZ));
        if(cons) console.log(`long1: [${conv(cflag, floorZ)}]`);
        if (equal(floorZ, tgtFloorZ)) {
            break;
        }
        floorZ[0] = floorZ[0] + dZ[0];
        if(cons) console.log(`long2: [${conv(cflag, floorZ)}]`);
      } 
      else {
        // pass thru both at same time
        /* addition to given algo */
        // check if moving x reaches tgt
        let floorZ1 = [...floorZ];
        floorZ1[0] = floorZ1[0] + dZ[0];
        if(equal(floorZ1, tgtFloorZ)){
          if(cons) console.log(`eqx: out`);
          break;
        }
        // then check y
        let floorZ2 = [...floorZ];
        floorZ2[1] = floorZ2[1] + dZ[1];
        if(equal(floorZ2, tgtFloorZ)){
          if(cons) console.log(`eqy: out`);
          break;
        }
        /* end of addition */
        floorZ = floorZ.map((x, i) => x + dZ[i]);
        if(cons) console.log(`eq: [${conv(cflag, floorZ)}]`);
      }
    }
    else {
      // no change in short
      floorZ[0] = floorZ[0] + dZ[0];
      if(cons) console.log(`nc: [${conv(cflag, floorZ)}]`);
    }
    if(cons) console.log("current path: ", coords2String(path));
    /* addition to given algo */
    if(equal(tgtFloorZ, floorZ) && cmp == -1)
      break;
    if(gradient == -1 && (isInt(src))){
      prevS = S;
      continue;
    }
    /* end of addition */
    path.push(conv(cflag, floorZ));
    prevS = S;
    if(cons) console.log("current path: ", coords2String(path));
  }
      
  if(cons) console.log(path);
  return path;
  
  function conv(absDx_Gt_absDy, B) {
    return absDx_Gt_absDy ? [B[0], B[1]] : [B[1], B[0]];
  }
  
  function equal(A, B) {
    return A.every((x, i) => x === B[i]);
  }

  function add(accumulator, a) {
    return accumulator + a;
  }

  function isInt(A){
    return A.every((x, i) => Number.isInteger(x));
  }

  function coords2String(coords){
    let s = "";
    for(const coord of coords){
      s += "[" + coord.toString() + "] ";
    }
    return s;
  }

}

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


class MapNode {
  constructor( parent = null, value_XY,neighbours = null, additionalCoord, additionalEdge, g_cost) { // additionalCoord, additionalEdge used for RRT_star

    this.parent = parent;
    this.value_XY = value_XY;
    this.neighbours = neighbours;
    this.additionalCoord = additionalCoord;
    this.additionalEdge = additionalEdge;
    this.g_cost = g_cost;
  }

  numberOfNeighbours() {
    return this.neighbours.length;
  }

  hasNeighbours() {
    return (this.numberOfNeighbours > 0);
  }
  edgeConnectionMade(potentialNeighbour_XY){
    for (let i = 0; i < this.neighbours.length; ++i){
      if(potentialNeighbour_XY[0] == this.neighbours[i][0] && potentialNeighbour_XY[1] == this.neighbours[i][1]) return 1;
    }
  }
}

class SVGCanvas {
  constructor(canvas_id, drawOrder) {
    this.canvas_id = canvas_id;
    this.createSvgCanvas(this.canvas_id, drawOrder);
    this.isGrid = true
   // this.reset(this.canvas_id);
  }

  isDisplayRatioGrid(isGrid=true){
    this.isGrid = isGrid;
  }

  get displayRatio(){
    if(this.isGrid)
      //return myUI.canvases.bg.canvas.clientWidth/myUI.map_width;
      return Math.max(myUI.canvases.bg.canvas.clientWidth,myUI.canvases.bg.canvas.clientHeight)/Math.max(myUI.map_width, myUI.map_height);
       // only need width or height as client width and map width both change as map aspect changes
    else
      return 472;
  }

  getSvgNode(n, v) {
    n = document.createElementNS("http://www.w3.org/2000/svg", n);
    for (var p in v)
      n.setAttributeNS(null, p.replace(/[A-Z]/g, function(m, p, o, s) { return "-" + m.toLowerCase(); }), v[p]);
    return n
  }
  createSvgCanvas(canvas_id, drawOrder){
    var svg = this.getSvgNode("svg",{width:472/*myUI.canvases.bg.canvas.clientWidth*/,height:472/*myUI.canvases.bg.canvas.clientHeight*/,id:canvas_id});
   // svg.width = myUI.canvases.bg.canvas.clientWidth;
   // svg.height = myUI.canvases.bg.canvas.clientHeight;
   
    const documentStyle = getComputedStyle(document.body)
    const canvas_length = documentStyle.getPropertyValue('--canvas-length'); // #336699
    svg.setAttribute('id',canvas_id)
    svg.setAttribute('style', "position: absolute;");
    svg.style.height = canvas_length;
    svg.style.width = canvas_length;

    const CANVAS_OFFSET = getComputedStyle(document.querySelector(".map_canvas")).getPropertyValue('top');
    svg.setAttribute('viewBox', `-${CANVAS_OFFSET.slice(0,-2)} -${CANVAS_OFFSET.slice(0,-2)} ${canvas_length.slice(0,-2)} ${canvas_length.slice(0,-2)}`);
    svg.style.zIndex = Number(documentStyle.getPropertyValue('--canvas-z-index')) - drawOrder;
    
    svg.addEventListener("load", () => {
      "makeDraggable(evt)"
    });

    document.getElementById("canvas_container").append(svg);
    return svg;
  }
  drawLine(start_XY, end_XY, destId = "networkGraph", id=false, colorIndex = 0, lineWidth = 1){
    if(myUI.planner.constructor.gridPrecision != "float" && myUI.vertex == false){
      // draw lines from centre of squares
      start_XY = start_XY.map(x => x + 0.5);
      end_XY = end_XY.map(x => x + 0.5);
    }

    const start_coord = {y:start_XY[1], x:start_XY[0]};
    const end_coord = {y:end_XY[1], x:end_XY[0]};
 
    var x1 = this.displayRatio*start_coord.y;
    var y1 = this.displayRatio*start_coord.x;
    var x2 = this.displayRatio*end_coord.y;
    var y2 = this.displayRatio * end_coord.x;
    var strokeWidth = Math.max(lineWidth/20*this.displayRatio, 1)
    var line_id = id?id:`SVGline_${start_coord.x}_${start_coord.y}_${end_coord.x}_${end_coord.y}_${destId}`;
    var line_class = `SVGline_${destId}`;
    var color = myUI.canvases[destId] ? myUI.canvases[destId].colors[colorIndex] : "grey";
    var line = this.getSvgNode('line', { x1: x1, y1: y1, x2: x2,y2: y2, id:line_id, strokeWidth:strokeWidth, class:line_class, stroke: color,});
    if(myUI.canvases[destId].drawType == "svgDotted") line.style.strokeDasharray = 5;
    document.getElementById(this.canvas_id).appendChild(line);
  }
  eraseLine(start_XY, end_XY, destId){
    const start_coord = {y:start_XY[1], x:start_XY[0]};
    const end_coord = {y:end_XY[1], x:end_XY[0]};
    var line_id = `SVGline_${start_coord.x}_${start_coord.y}_${end_coord.x}_${end_coord.y}_${destId}`;
    try{this.EraseSvgById(line_id);}catch{
      line_id = `SVGline_${end_coord.x}_${end_coord.y}_${start_coord.x}_${start_coord.y}_${destId}`;
      try{this.EraseSvgById(line_id);}catch{
        console.error("LINE DOES NOT EXIST");
      }
    }
  }
  
  eraseAllLines(destId){
    this.EraseSvgsbyClass(`SVGline_${destId}`);
  }
  drawCircle(circle_XY, destId = "networkGraph",id=false, colorIndex = 0, radius = undefined, opacityValue = false){
    const circle_coord = {y:circle_XY[1], x:circle_XY[0]};
    var r = radius?radius:Math.max(0.25*this.displayRatio, 4);
    var cx = this.displayRatio*circle_coord.y;
    var cy = this.displayRatio*circle_coord.x; 
    //console.log("DP",this.displayRatio)
    var circle_id = id?id:`SVGcircle_${circle_coord.x}_${circle_coord.y}_${destId}_${colorIndex}_${radius}`;
    var circle_class = `SVGcircle_${destId}`;

    var color = myUI.canvases[destId] ? myUI.canvases[destId].colors[colorIndex] : "grey";
    var drawType = myUI.canvases[destId] ? myUI.canvases[destId].drawType : "cell";
    var opacity = opacityValue ? opacityValue : "100%";
    
    let config = { cx: cx, cy: cy, r: r,  strokeWidth:2, id:circle_id, class:circle_class, fill:color,opacity:opacity};
    if(drawType == "dotted" || drawType == "svgDotted"){
      config.fill = "none";
      config.stroke = color;
      config.strokeDasharray = "6.5,6.5";
      config.r = ((radius && radius > 0.29) ? radius : 0.29) * this.displayRatio
      config.strokeWidth = 2;
    }
    var cir = this.getSvgNode('circle', config);
    //var toAppend =`<circle cx=${cx} cy=${cy} r=${r} id=${circle_id} stroke-width="2" fill="grey" />`
    document.getElementById(this.canvas_id).appendChild(cir);
  }


  eraseCircle(circle_XY, destId, colorIndex = 0, radius = undefined){
    const circle_coord = {y:circle_XY[1], x:circle_XY[0]};
    var circle_id = `SVGcircle_${circle_coord.x}_${circle_coord.y}_${destId}_${colorIndex}_${radius}`;
    try{this.EraseSvgById(circle_id);}catch{
      console.error(`CIRCLE DOES NOT EXIST ${circle_id}`);
    }
  }
  EraseSvgById(svg_id){
    document.getElementById(this.canvas_id).getElementById(svg_id).remove();
  }
  EraseSvgsbyClass(svg_class){
    const classElements = document.querySelectorAll("."+svg_class);
    classElements.forEach(element => {
      element.remove();
    });
  }
  eraseAllandDrawCircle(circle_XY, r, color ,circle_id, circle_class ,canvas_id){
    EraseSvgsbyClass(circle_class,canvas_id);
    drawCircle(circle_XY, r, color ,circle_id, circle_class ,canvas_id);
  }

  //myUI.SVGCanvas.EraseSvgsbyClass(`SVGClass_1`);
  reset(eraseMap = false){
    if(!document.getElementById(this.canvas_id)) return;
    
      document.getElementById(this.canvas_id).innerHTML = "";
  
  }

  eraseAllSvgExceptClass(className = "tmp_svg") {
      let tmp_doc = this.createSvgCanvas(className, 0);
      for(const el of document.getElementById(this.canvas_id).getElementsByClassName(`SVGcircle_${STATIC.networkGraph}`))
        tmp_doc.appendChild(el.cloneNode());
      
      for(const el of document.getElementById(this.canvas_id).getElementsByClassName(`SVGline_${STATIC.networkGraph}`))
        tmp_doc.appendChild(el.cloneNode());
      
      document.getElementById(this.canvas_id).innerHTML = "";
      for(const el of tmp_doc.children)
        document.getElementById(this.canvas_id).appendChild(el.cloneNode());

      tmp_doc.remove();
  }

  show(){
    document.getElementById(this.canvas_id).classList.remove("none");
  }

  hide(){
    document.getElementById(this.canvas_id).classList.add("none");
  }
}

function toggleHideSVGCircleByClassIdentifier(className, checked){
  var divsToHide = document.getElementsByClassName(`SVGcircle_${className}`); //divsToHide is an array
  for (var i = 0; i < divsToHide.length; i++) {
    if(checked) divsToHide[i].classList.remove("hidden");
    else divsToHide[i].classList.add("hidden");
  }
}
function toggleHideSVGLineByClassIdentifier(className, checked){
  var divsToHide = document.getElementsByClassName(`SVGline_${className}`); //divsToHide is an array
  for (var i = 0; i < divsToHide.length; i++) {
    if(checked) divsToHide[i].classList.remove("hidden");
    else divsToHide[i].classList.add("hidden");
  }
}

function isArraysEqual(arr1, arr2)
    {
        let N = arr1.length;
        let M = arr2.length;
 
        // If lengths of array are not equal means
        // array are not equal
        if (N != M)
            return false;
 
        // Sort both arrays
        arr1.sort();
        arr2.sort();
 
        // Linearly compare elements
        for (let i = 0; i < N; i++)
            if (arr1[i] != arr2[i])
                return false;
 
        // If all elements were same.
        return true;
    }
function deepCopy(src) {
  let target = Array.isArray(src) ? [] : {};
  for (let key in src) {
    let v = src[key];
    if (v) {
      if (typeof v === "object") {
        target[key] = deepCopy(v);
      } else {
        target[key] = v;
      }
    } else {
      target[key] = v;
    }
  }

  return target;
}

// for explanation https://math.stackexchange.com/questions/175896/finding-a-point-along-a-line-a-certain-distance-away-from-another-point 
function getCoordinatesofPointsXAwayFromSource(src,tgt,x){
  var distanceBetween2Points = Math.sqrt(Math.pow((src[0]-tgt[0]), 2) + Math.pow((src[1]-tgt[1]), 2));
  if(distanceBetween2Points<x){
    return tgt;
  }
  else{
    var ratioOfDistance = x/distanceBetween2Points;
    var differenceInXAndYCoordinateOfSourceAndTarget = [tgt[0]-src[0],tgt[1]-src[1]];
    var coordinatesXAwayFromSource = [(1-(ratioOfDistance))*src[0] + ratioOfDistance*tgt[0],(1-(ratioOfDistance))*src[1] + ratioOfDistance*tgt[1]];
    return coordinatesXAwayFromSource;
  }
 
  
}

function distanceBetween2Points2(src,tgt){
 return Math.sqrt(Math.pow((src[0]-tgt[0]), 2) + Math.pow((src[1]-tgt[1]), 2));
}


function distanceBetween2Points(src,tgt){
  return Math.hypot(src[0] - tgt[0], src[1]  - tgt[1]);
 }





 function getNearestNodeIndexInTreeToRandomCoord(mapNodes,randomCoord_XY){
  var indexOfClosestCoordInTreeToRandomCoord = 0;
  var k = indexOfClosestCoordInTreeToRandomCoord;
  var distanceOfClosestCoordInTreeToRandomCoord = distanceBetween2Points(mapNodes[k].value_XY,randomCoord_XY)

  for (let x = 1; x < mapNodes.length; ++x){
      var distanceOfPotentialClosestCoordInTreeToRandomCoord = distanceBetween2Points(mapNodes[x].value_XY,randomCoord_XY)
      if (distanceOfClosestCoordInTreeToRandomCoord>distanceOfPotentialClosestCoordInTreeToRandomCoord){
        k = x;
        var distanceOfClosestCoordInTreeToRandomCoord = distanceBetween2Points(mapNodes[k].value_XY,randomCoord_XY)
        
      }
  }  
  return k;
}

function getNodesNearby(mapNodes ,nextCoordToAdd_XY,neighbourSelectionMethod, connectionDistance,numberOfTopClosestNeighbours ){
  var distancesBetweenACoordAndAllOthers =[];
  for (let i = 0; i < mapNodes.length; ++i) {
  
    
    distancesBetweenACoordAndAllOthers.push([distanceBetween2Points(mapNodes[i].value_XY ,nextCoordToAdd_XY),i]); // could store as before sqrt form
  }
  distancesBetweenACoordAndAllOthers.sort((a,b)=>{
    return a[0] - b[0]; // sort by distance
  });


  var indexOfSelectedOtherRandomCoords;

  if(neighbourSelectionMethod == "Top Closest Neighbours"){
    // checks LOS between the the top X closes neighbours 
    indexOfSelectedOtherRandomCoords = distancesBetweenACoordAndAllOthers
      .slice(0, numberOfTopClosestNeighbours)//this.numberOfTopClosestNeighbours)
      .map(p => p[1]);
  }
  else if(neighbourSelectionMethod == "Closest Neighbours By Radius"){
    indexOfSelectedOtherRandomCoords = distancesBetweenACoordAndAllOthers
      .filter(p => p[0] < connectionDistance)
      .map(p => p[1]);
  }
  return indexOfSelectedOtherRandomCoords;
}


function determineParentWithLowestCost(nodesNearby_Index,nextCoordToAdd_XY,nearestNode_Index, mapNodes){  // parent maybe further than nearest node but with lower cost
var selectedParent_index = nearestNode_Index;
for (let i = 0; i < nodesNearby_Index.length; ++i) {
  //console.log(nodesNearby_Index,i,"i",selectedParent_index,mapNodes)
  if(mapNodes[nodesNearby_Index[i]].g_cost + distanceBetween2Points(mapNodes[nodesNearby_Index[i]].value_XY,nextCoordToAdd_XY)<mapNodes[selectedParent_index].g_cost+distanceBetween2Points(mapNodes[selectedParent_index].value_XY,nextCoordToAdd_XY) &&  CustomLOSChecker(mapNodes[nodesNearby_Index[i]].value_XY , nextCoordToAdd_XY).boolean){
    selectedParent_index = nodesNearby_Index[i];
    
  }
}
return selectedParent_index;
}


function incrementValue(incrementNumber)
{
    var value = parseInt(document.getElementById('number').value, 10);
    value = isNaN(value) ? 0 : value;
    value+=incrementNumber;
    document.getElementById('number').value = value;
}

// Define a helper function that converts camel case to normal case
function camelToNormal(str) {
  // Use a regex to replace each uppercase letter with a space and the same letter
  let spaced = str.replace(/([A-Z])/g, " $1");
  // Split the string by spaces into an array of words
  let words = spaced.split(" ");
  // Map each word to its capitalized version
  let capitalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  // Join the words with spaces and return the result
  return capitalized.join(" ");
}
