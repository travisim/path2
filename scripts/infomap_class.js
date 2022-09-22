 
class UIInfoNWSE{
  constructor(infoNWSE_Id){
    this.element = document.getElementById(infoNWSE_Id);
  }
     
  resetOne(){
  this.element.style.borderColor = "transparent";
  this.element.style.background = "rgb(188,186,201)";
  this.element.style.outlineColor = "black";
  this.element.style.color = "black";
  if (this.element.querySelector(".type")) this.element.querySelector(".type").innerHTML = "";
  if ( this.element.querySelector(".F"))  this.element.querySelector(".F").innerHTML = "";
  if (this.element.querySelector(".G"))  this.element.querySelector(".G").innerHTML = "";
  if (this.element.querySelector(".H"))  this.element.querySelector(".H").innerHTML = "";
     //reset a square in info map 
  
  }

  drawOneObstacle(){
    this.element.style.borderColor = "rgb(0,0,0)";
    if (this.element.querySelector(".type")) this.element.querySelector(".type").innerHTML = "Obstacle"; 
    
  }

  drawOneOutOfBounds(){
    this.element.style.borderColor = "transparent";
    this.element.style.background = "transparent";
    this.element.style.outlineColor = "transparent";
    this.element.style.color = "transparent";
  }
     
  drawOneVisited(){
    this.element.style.borderColor = "rgb(221,48,33)";
    if (this.element.querySelector(".type")) this.element.querySelector(".type").innerHTML = "Visited"
  } 
  
  drawOneQueue(){
    this.element.style.borderColor = "rgb(116,250,76)";
    if (this.element.querySelector(".type"))this.element.querySelector(".type").innerHTML = "Queue"
    
  }
    
  drawOneNeighbour(f,g,h){
    this.element.style.borderColor = "rgb(0,130,105)";
     //console.log(f,"f",g,"g",h,"h")
    if(f!=null ) this.element.querySelector(".F").innerHTML = f;
    if(g!=null )  this.element.querySelector(".G").innerHTML = g;
    if(h!=null )  this.element.querySelector(".H").innerHTML = h;
    if (this.element.querySelector(".type")) this.element.querySelector(".type").innerHTML = "neighbour";
  }


  
}





class UIInfoMap{
  reset(){
   myUI.planner.deltaNWSE.forEach(deltaNWSE => {myUI.InfoNWSE[deltaNWSE].resetOne();
  }); //reset obstacles in info map 

  }

  drawObstacle(x,y){

 
  for (let i = 0; i < myUI.planner.num_neighbors; ++i) { 
    var next_XY_temp = [ x + myUI.planner.delta[i][0], y + myUI.planner.delta[i][1]];
    if (next_XY_temp[0] < 0 || next_XY_temp[0] >= myUI.planner.map_height || next_XY_temp[1] < 0 || next_XY_temp[1] >= myUI.planner.map_width) continue;
      if ( myUI.canvases["bg"].ctx.getImageData(next_XY_temp[1]*59, next_XY_temp[0]*59, 1, 1).data[3] == 255) //just check r value
         myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneObstacle();  
      }
    
  }
  drawOutOfBound(x,y){

   
    for (let i = 0; i < myUI.planner.num_neighbors; ++i) { 
      var next_XY_temp = [ x + myUI.planner.delta[i][0], y + myUI.planner.delta[i][1]];
      if (next_XY_temp[0] < 0 || next_XY_temp[0] >= myUI.planner.map_height || next_XY_temp[1] < 0 || next_XY_temp[1] >= myUI.planner.map_width) {
         myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneOutOfBounds();
      }
    }
    
   
  }
  drawVisited(x,y){ //using pre obtained map of surrounding point
    var surrounding_map_deltaNWSE = []
    for (let i = 0; i < myUI.planner.num_neighbors; ++i) { 
      var next_XY_temp = [ x + myUI.planner.delta[i][0], y + myUI.planner.delta[i][1]];
      if (next_XY_temp[0] < 0 || next_XY_temp[0] >= myUI.planner.map_height || next_XY_temp[1] < 0 || next_XY_temp[1] >= myUI.planner.map_width) continue;
      if ( myUI.canvases["visited"].ctx.getImageData(next_XY_temp[1]*59, next_XY_temp[0]*59, 1, 1).data[0] != 0) {// if the current node has been visited
        myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneVisited();
      }
    }
    
  }
  
  drawQueue(x,y){ //using pre obtained map of surrounding point
    
    for (let i = 0; i < myUI.planner.num_neighbors; ++i) { 
      var next_XY_temp = [ x + myUI.planner.delta[i][0], y + myUI.planner.delta[i][1]];
      if (next_XY_temp[0] < 0 || next_XY_temp[0] >= myUI.planner.map_height || next_XY_temp[1] < 0 || next_XY_temp[1] >= myUI.planner.map_width) continue;
      if ( myUI.canvases["queue"].ctx.getImageData(next_XY_temp[1]*59, next_XY_temp[0]*59, 1, 1).data[0] == 116){ //just check r value
        myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneQueue();  
      }
    }
  }
  

  PlannerMode(planner='A_star'){
    var infoMapInnerHTML;
    if (planner == 'BFS' || planner == 'DFS'){
      infoMapInnerHTML = '<section>Type:&nbsp<span class="type"></span></section>';
  //initialise html for info squares as well
    }
    else if (planner == 'Dijkstra'){
      infoMapInnerHTML  = '<section>G:&nbsp<span class="G"></span>Type:&nbsp<span class="type"></span></section>';
      //initialise html for info squares as well
    }
    else if (planner == 'A_star'){
      infoMapInnerHTML = '<section><div id="adjustment2">F:&nbsp<span class="F"></span></div><div id="adjustment">G:&nbsp<span class="G"></span>H:&nbsp<span class="H"></span></div></section>';
//      infoMapInnerHTML = '<section><div id="adjustment2">F:&nbsp<span class="F"></span></div><div id="adjustment">G:&nbsp<span class="G"></span>H:&nbsp<span class="H"></span></div>Type:&nbsp<span class="type"></span></section>';
      //initialise html for info squares as well
    }
     else if (planner == 'none'){
      document.getElementById("infomap").style.display = "none";
      document.getElementById("infodivider").style.display = "none";
      //initialise html for info squares as well
    }

   
    
    [
    ["N"],
		["NE"],
    ["E"],
    ["SE"],
    ["S"],
    ["SW"],
    ["W"],
    ["NW"] 
    ].forEach(item=>{
    let infoNWSE_Id = item[0];
    document.getElementById(infoNWSE_Id).innerHTML = infoMapInnerHTML;
  //initialise html for info squares as well
    });
  }


  NumneighborsMode(num_neighbors=8){
    console.log("hihu")
   if (num_neighbors == 8){
    [
  		["NE"],
      ["SE"],
      ["SW"],
      ["NW"] 
      ].forEach(item=>{
      let element = document.getElementById(item[0]);
      element.style.borderColor = "transparent";
      element.style.background = "rgb(188,186,201)";
      element.style.outlineColor = "black";
      element.style.color = "black";
      if (element.querySelector(".type")) element.querySelector(".type").innerHTML = "";
      if (element.querySelector(".F"))  element.querySelector(".F").innerHTML = "";
      if (element.querySelector(".G"))  element.querySelector(".G").innerHTML = "";
      if (element.querySelector(".H"))  element.querySelector(".H").innerHTML = "";
      });
 
     

    }
   else  if (num_neighbors == 4){
      [
  		["NE"],
      ["SE"],
      ["SW"],
      ["NW"] 
      ].forEach(item=>{
      let element = document.getElementById(item[0]);
      element.style.borderColor = "transparent";
      element.style.background = "transparent";
      element.style.outlineColor = "transparent";
      element.style.color = "transparent";
      });
    }
  }

}


var UIInfoCurrent = {
  DrawCurrent(x,y){
    document.getElementById("currentXY").innerHTML =  "( "+x+", "+y+")"; // flipped x and y because of matrix transformation
  }
}




document.getElementById("currentXY").innerHTML = "(_, _)"; 

myUI.updateInfoMap = function(){
  /*
  1) clear info map
  */
  myUI.InfoMap.reset();
  /*
  2) update current position
  */
  myUI.UIInfoCurrent.DrawCurrent(...myUI.currentCoord);
  /*
  3) extract data from canvases and populate
  */
  // tbc
}