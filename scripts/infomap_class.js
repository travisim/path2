 
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
    
  drawOneNeighbour(){
    this.element.style.borderColor = "rgb(0,130,105)";
    if (this.element.querySelector(".type")) this.element.querySelector(".type").innerHTML = "neighbour";
  }

  drawOneFGH(f,g,h){
    if(f!=null ) this.element.querySelector(".F").innerHTML = +f.toFixed(2);
    if(g!=null )  this.element.querySelector(".G").innerHTML = +g.toFixed(2);
    if(h!=null )  this.element.querySelector(".H").innerHTML = +h.toFixed(2);
  }


  
}





class UIInfoMap{
  reset(){
   myUI.planner.deltaNWSE.forEach(deltaNWSE => {myUI.InfoNWSE[deltaNWSE].resetOne();
  }); //reset obstacles in info map 

  }

  drawGeneral(x,y,drawName){
    for (let i = 0; i < myUI.planner.num_neighbors; ++i) { 
      var next_XY_temp = [ x + myUI.planner.delta[i][0], y + myUI.planner.delta[i][1]];
      if (next_XY_temp[0] < 0 || next_XY_temp[0] >= myUI.planner.map_height || next_XY_temp[1] < 0 || next_XY_temp[1] >= myUI.planner.map_width){
        if(drawName=="outOfBound") myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneOutOfBounds();
        continue;
      }
      if(drawName=="bg" && myUI.canvases[drawName].canvas_cache[next_XY_temp[0]][next_XY_temp[1]]>0){
        myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneObstacle();  
      }
      else if(drawName=="visited" && myUI.canvases[drawName].canvas_cache[next_XY_temp[0]][next_XY_temp[1]]>0){
        myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneVisited();  
      }
      else if(drawName=="neighbors" && myUI.canvases[drawName].canvas_cache[next_XY_temp[0]][next_XY_temp[1]]>0){
        myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneNeighbour();  
      }
      else if(drawName=="queue" && myUI.canvases[drawName].canvas_cache[next_XY_temp[0]][next_XY_temp[1]]>0){
        myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneQueue();  
      }
      else if(drawName=="fghCost"){
        let f = myUI.canvases["fCost"].canvas_cache[next_XY_temp[0]][next_XY_temp[1]];
        let g = myUI.canvases["gCost"].canvas_cache[next_XY_temp[0]][next_XY_temp[1]];
        let h = myUI.canvases["hCost"].canvas_cache[next_XY_temp[0]][next_XY_temp[1]];
        myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneFGH(f,g,h);  
      }
    }
  }

  drawObstacle(x,y){
    this.drawGeneral(x,y,"bg");
  }
  drawOutOfBound(x,y){
    this.drawGeneral(x,y,"outOfBound");   
  }
  drawVisited(x,y){
    this.drawGeneral(x,y,"visited");
  }
  
  drawQueue(x,y){ 
    this.drawGeneral(x,y,"queue");
  }

  drawNeighbors(x,y){
    this.drawGeneral(x,y,"neighbors");
  }

  drawFGH(x,y){
    this.drawGeneral(x,y,"fghCost");
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