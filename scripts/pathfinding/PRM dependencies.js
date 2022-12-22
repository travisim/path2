// program to generate random strings

// declare all characters
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = ' ';
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
  const start_coord = {y0:start_XY[1]*59, x0:start_XY[0]*59};
  const end_coord = {y1:end_XY[1]*59, x1:end_XY[0]*59};
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


class PRMNode {
  constructor( parent = null, value_XY,neighbours = null) {

    this.parent = parent;
    this.value_XY = value_XY;
    this.neighbours = neighbours;
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
  constructor(canvas_id) {
    this.canvas_id = canvas_id;
    this.createSvgCanvas(this.canvas_id);
   // this.reset(this.canvas_id);
  }
  getSvgNode(n, v) {
    n = document.createElementNS("http://www.w3.org/2000/svg", n);
    for (var p in v)
      n.setAttributeNS(null, p.replace(/[A-Z]/g, function(m, p, o, s) { return "-" + m.toLowerCase(); }), v[p]);
    return n
  }
  createSvgCanvas(canvas_id="node_edge"){
    var svg = this.getSvgNode("svg",{width:472/*myUI.canvases.bg.canvas.clientWidth*/,height:472/*myUI.canvases.bg.canvas.clientHeight*/,id:canvas_id});
   // svg.width = myUI.canvases.bg.canvas.clientWidth;
   // svg.height = myUI.canvases.bg.canvas.clientHeight;
    svg.setAttribute('id',canvas_id)
    svg.setAttribute('style', "position: absolute");
    document.getElementById("canvas_container").append(svg);
  }
  drawLine(start_XY=[0,0], end_XY = [3,3],canvas_id="node_edge",line_id="ki"){
    const start_coord = {y:start_XY[1], x:start_XY[0]};
    const end_coord = {y:end_XY[1], x:end_XY[0]};
    const display_ratio = myUI.canvases.bg.canvas.clientWidth / myUI.map_width;// the canvas square has fixed dimentions 472px
    var x1 = display_ratio*start_coord.y;
    var y1 = display_ratio*start_coord.x;
    var x2 = display_ratio*end_coord.y;
    var y2 = display_ratio*end_coord.x; 
    var line = this.getSvgNode('line', { x1: x1, y1: y1, x2: x2,y2: y2, id: line_id, strokeWidth:2, id:line_id, style:"stroke:rgb(255,0,0);stroke-width:2" });
    //document.getElementById(canvas_id).innerHTML =  `<line x1=${x1} y1=${y1} x2=${x2} y2=${y2} id=${line_id} style="" />`;
     document.getElementById(canvas_id).appendChild(line);
  }
  drawCircle(circle_XY=[1,1], r= 20,color = "grey",canvas_id="node_edge",circle_id="circle"){
    const circle_coord = {y:circle_XY[1], x:circle_XY[0]};
    const display_ratio = myUI.canvases.bg.canvas.clientWidth / myUI.map_width;// the canvas square has fixed dimentions 472px
    var r = 0.3*display_ratio;
    var cx = display_ratio*circle_coord.y;
    var cy = display_ratio*circle_coord.x;
    var cir = this.getSvgNode('circle', { cx: cx, cy: cy, r: r,  strokeWidth:2, id:circle_id, fill:color});
    //var toAppend =`<circle cx=${cx} cy=${cy} r=${r} id=${circle_id} stroke-width="2" fill="grey" />`
    document.getElementById(canvas_id).appendChild(cir);
    
  }
  reset(canvas_id){
    if(document.getElementById(canvas_id)){
      document.getElementById(canvas_id).innerHTML = "";
    }
    
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
