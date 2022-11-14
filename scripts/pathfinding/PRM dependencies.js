//PRMnode
class PRMNode {
  constructor(key, value = key, parent = null) {
    this.key = key;
    this.value = value;
    this.parent = [];
    this.neighbours = [];
    this.neighboursCost = [];
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
    var svg = this.getSvgNode("svg",{width:myUI.canvases.bg.canvas.clientWidth,height:myUI.canvases.bg.canvas.clientHeight,id:canvas_id});
   // svg.width = myUI.canvases.bg.canvas.clientWidth;
   // svg.height = myUI.canvases.bg.canvas.clientHeight;
    svg.setAttribute('id',canvas_id)
    document.getElementById("canvas_container").append(svg);
  }
  drawLine(start_XY=[0,0], end_XY = [3,3],canvas_id="node_edge",line_id="ki"){
    const start_coord = {y:start_XY[1], x:start_XY[0]};
    const end_coord = {y:end_XY[1], x:end_XY[0]};
    const display_ratio = myUI.canvases.bg.canvas.clientWidth / myUI.map_width;// the canvas square has fixed dimentions 472px
    var x1 = display_ratio*start_coord.y + display_ratio*0.5;
    var y1 = display_ratio*start_coord.x + display_ratio*0.5;
    var x2 = display_ratio*end_coord.y + display_ratio*0.5;
    var y2 = display_ratio*end_coord.x + display_ratio*0.5; 
    var line = this.getSvgNode('line', { x1: x1, y1: y1, x2: x2,y2: y2, id: line_id, strokeWidth:2, id:line_id, style:"stroke:rgb(255,0,0);stroke-width:2" });
    //document.getElementById(canvas_id).innerHTML =  `<line x1=${x1} y1=${y1} x2=${x2} y2=${y2} id=${line_id} style="" />`;
     document.getElementById(canvas_id).appendChild(line);
  }
  drawCircle(circle_XY=[1,1], r= 20,canvas_id="node_edge",circle_id="circle"){
    const circle_coord = {y:circle_XY[1], x:circle_XY[0]};
    const display_ratio = myUI.canvases.bg.canvas.clientWidth / myUI.map_width;// the canvas square has fixed dimentions 472px
    var r = 0.3*display_ratio;
    var cx = display_ratio*circle_coord.y + display_ratio*0.5;
    var cy = display_ratio*circle_coord.x + display_ratio*0.5;
    var cir = this.getSvgNode('circle', { cx: cx, cy: cy, r: r,  strokeWidth:2, id:circle_id, fill:"grey"});
    //var toAppend =`<circle cx=${cx} cy=${cy} r=${r} id=${circle_id} stroke-width="2" fill="grey" />`
    document.getElementById(canvas_id).appendChild(cir);
    
  }
  reset(){
    document.getElementById("node_edge").innerHTML = "";
  }
}




//document.getElementById("4").innerHTML =indexOfSelectedRandomCoord;

/*
var currentTree = new Tree(myUI.map_start);

  if(find(start) == true){ 
   currentTree.insert(start, key);
   varpreviousNode
 }
else{currentTree.insert(start, key);}

myUI.canvases.bg.canvas.clientWidth
*/

/*

createSvgCanvas("node_edge")
drawSvgLine([3,3],[4,4]);
drawSvgCircle([3,3]);
drawSvgCircle([7,7]);
//drawSvgCircle([4,4]);
*/

/*
function createSvgCanvas(canvas_id="node_edge"){
  var svg = getSvgNode("svg",{width:myUI.canvases.bg.canvas.clientWidth,height:myUI.canvases.bg.canvas.clientHeight});
  svg.width = myUI.canvases.bg.canvas.clientWidth;
  svg.height = myUI.canvases.bg.canvas.clientHeight;
  svg.setAttribute('id',canvas_id)
  document.getElementById("canvas_container").append(svg);
}


function drawSvgLine(start_XY=[0,0], end_XY = [3,3],canvas_id="node_edge",line_id="ki"){
  const start_coord = {y:start_XY[1], x:start_XY[0]};
  const end_coord = {y:end_XY[1], x:end_XY[0]};
  const display_ratio = myUI.canvases.bg.canvas.clientWidth / myUI.map_width;// the canvas square has fixed dimentions 472px
  var x1 = display_ratio*start_coord.x + display_ratio*0.5;
  var y1 = display_ratio*start_coord.y + display_ratio*0.5;
  var x2 = display_ratio*end_coord.x + display_ratio*0.5;
  var y2 = display_ratio*end_coord.y + display_ratio*0.5; 
  var line = getSvgNode('line', { x1: x1, y1: y1, x2: x2,y2: y2, id: line_id, strokeWidth:2, id:line_id, style:"stroke:rgb(255,0,0);stroke-width:2" });
  //document.getElementById(canvas_id).innerHTML =  `<line x1=${x1} y1=${y1} x2=${x2} y2=${y2} id=${line_id} style="" />`;
   document.getElementById(canvas_id).appendChild(line);
}
function drawSvgCircle(circle_XY=[1,1], r= 20,canvas_id="node_edge",circle_id="circle"){
  const circle_coord = {y:circle_XY[1], x:circle_XY[0]};
  const display_ratio = myUI.canvases.bg.canvas.clientWidth / myUI.map_width;// the canvas square has fixed dimentions 472px
  var r = 0.3*display_ratio;
  var cx = display_ratio*circle_coord.x + display_ratio*0.5;
  var cy = display_ratio*circle_coord.y + display_ratio*0.5;
  var cir = getSvgNode('circle', { cx: cx, cy: cy, r: r,  strokeWidth:2, id:circle_id, fill:"grey"});
  //var toAppend =`<circle cx=${cx} cy=${cy} r=${r} id=${circle_id} stroke-width="2" fill="grey" />`
  document.getElementById(canvas_id).appendChild(cir);
  
}
function resetSVGCanvas(){
  document.getElementById("node_edge").innerHTML = ""
}


function getSvgNode(n, v) {
  n = document.createElementNS("http://www.w3.org/2000/svg", n);
  for (var p in v)
    n.setAttributeNS(null, p.replace(/[A-Z]/g, function(m, p, o, s) { return "-" + m.toLowerCase(); }), v[p]);
  return n
}*/
//---------------------------------------

function BresenhamLOSChecker(start_XY, end_XY) {//return 0 if no LOS return 1 if there is LOS also checks the start and goal
  const start_coord = {y0:start_XY[1], x0:start_XY[0]};
  const end_coord = {y1:end_XY[1], x1:end_XY[0]};
  var x0 = start_coord.x0;
  var y0 = start_coord.y0;
  var x1 = end_coord.x1;
  var y1 = end_coord.y1;
  let dots = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = (x0 < x1) ? 1 : -1;
  let sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy; // err should be zero

  //dots.push([x0,y0]);
  if(myUI.planner.map.get_data([x0,y0]) == 0){//if there is obstacle
      return 0
    }

  while(!((x0 == x1) && (y0 == y1))) {
    let e2 = err << 1;

    if (e2 > -dy) {
        err -= dy;
        x0 += sx;
    }

    if (e2 < dx) { 
        err += dx; 
        y0 += sy;
    }

    //dots.push([x0,y0]);
    if(myUI.planner.map.get_data([x0,y0]) == 0){//if there is obstacle
      return 0
    }
  }

  return 1; //if there is LOS
}
console.log(BresenhamLOSChecker([0, 0], [3, 3]),"BresenhamLOSChecker")
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


