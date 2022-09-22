//document.getElementById("myCanvas").getContext("2d").getImageData(10, 10, 1, 1).data; //y x 

//myUI.canvases["queue"].ctx.getImageData(10, 10, 1, 1).data;
console.log( myUI.canvases["queue"].ctx.getImageData(0, 0, 16, 16).data);
console.log( myUI.canvases["visited"].ctx.getImageData(0, 0, 16, 16).data);
console.log( myUI.canvases["neighbors"].ctx.getImageData(0, 0, 16, 16).data);
console.log( myUI.canvases["current_XY"].ctx.getImageData(0, 0, 16, 16).data);
//myUI.canvases["neighbors"].ctx.fillRect(1, 1, 1, 1);

//myUI.canvases["bg"].ctx.fillRect(1, 5, 1, 1);
//myUI.canvases["start"].ctx.fillStyle = "rgb(12,34,56)";
console.log( myUI.canvases["bg"].ctx.getImageData(1, 5, 1, 1).data);

//myUI.canvases["visited"].ctx.fillRect(1, 1, 1, 1);

/* [
    ["edit_map", "cell", "#000000" ,"#d19b6d", "#AA1945"],
		["hover_map", "cell", "#d19b6d", "#AA1945"],
    ["dotted", "dotted", "hsl(5,74%,55%)"],
    ["bg", "cell", "#000000"],
    ["queue", "cell", "#74fa4c"],
    ["visited", "cell", "hsl(5,74%,85%)", "hsl(5,74%,75%)", "hsl(5,74%,65%)", "hsl(5,74%,55%)", "hsl(5,74%,45%)", "hsl(5,74%,35%)", "hsl(5,74%,25%)", "hsl(5,74%,15%)"], // rgb(221,48,363)
    ["current_XY", "cell", "#34d1ea"],
    ["neighbors", "cell", "#008269"],
    ["path", "cell", "#34d1ea"], //  changed from #E2C2B9
    ["start", "cell", "#96996"],
    ["goal", "cell", "#9f17e7"]
  ]
  */

console.log( document.getElementById("bg").width,document.getElementById("bg").height)
console.log(document.getElementById("bg").getContext("2d").getImageData(5,70,1,1).data)
console.log(document.getElementById("bg").getContext("2d").getImageData(58,58,2,2).data)

//each cell when using get image data is 59 pixel but only 1 pixel when using fill rect

//Uint8ClampedArray {0: 245, 1: 193, 2: 188, 3: 255}



class UIInfoNWSE{
  constructor(infoNWSE_Id){
    this.element = document.getElementById(infoNWSE_Id);
  }
     
  resetOne(){
  this.element.style.borderColor = "transparent";
  this.element.style.background = "rgb(188,186,201)";
  this.element.style.outlineColor = "black";
  this.element.style.color = "black";
  this.element.querySelector(".type").innerHTML = "";
  if ( this.element.querySelector(".F"))  this.element.querySelector(".F").innerHTML = "";
  if (this.element.querySelector(".G"))  this.element.querySelector(".G").innerHTML = "";
  if (this.element.querySelector(".H"))  this.element.querySelector(".H").innerHTML = "";
     //reset a square in info map 
  
  }

  drawOneObstacle(){
    this.element.style.borderColor = "rgb(0,0,0)";
    this.element.querySelector(".type").innerHTML = "Obstacle"; 
    
  }

  drawOneOutOfBounds(){
    this.element.style.borderColor = "transparent";
    this.element.style.background = "transparent";
    this.element.style.outlineColor = "transparent";
    this.element.style.color = "transparent";
  }
     
  drawOneVisited(){
    this.element.style.borderColor = "rgb(221,48,33)";
    this.element.querySelector(".type").innerHTML = "Visited"
  } 
  
  drawOneQueue(){
    this.element.style.borderColor = "rgb(116,250,76)";
    this.element.querySelector(".type").innerHTML = "Queue"
    
  }
    
  drawOneNeighbour(f,g,h){
    this.element.style.borderColor = "rgb(0,130,105)";
     //console.log(f,"f",g,"g",h,"h")
    if(f!=null ) this.element.querySelector(".F").innerHTML = f;
    if(g!=null )  this.element.querySelector(".G").innerHTML = g;
    if(h!=null )  this.element.querySelector(".H").innerHTML = h;
    this.element.querySelector(".type").innerHTML = "neighbour";
  }


  
}





class UIInfoMap{
  reset(){
   myUI.planner.deltaNWSE.forEach(deltaNWSE => {myUI.InfoNWSE[deltaNWSE].resetOne();
  }); //reset obstacles in info map 

  }

  drawObstacle(x,y){


  for (let i = 0; i < myUI.planner.num_neighbors; ++i) { 
    var next_XY_temp = [ y + myUI.planner.delta[i][0], x + myUI.planner.delta[i][1]];
    if (next_XY_temp[0] < 0 || next_XY_temp[0] >= myUI.planner.map_height || next_XY_temp[1] < 0 || next_XY_temp[1] >= myUI.planner.map_width) continue;
      if ( myUI.canvases["bg"].ctx.getImageData(next_XY_temp[1], next_XY_temp[0], 1, 1).data[3] == 255) //just check r value
         myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneObstacle();  
        
      }
    
  

  
  }
  drawOutOfBound(x,y){

    var surrounding_map_deltaNWSE = []
    for (let i = 0; i < myUI.planner.num_neighbors; ++i) { 
      var next_XY_temp = [ y + myUI.planner.delta[i][0], x + myUI.planner.delta[i][1]];
      if (next_XY_temp[0] < 0 || next_XY_temp[0] >= myUI.planner.map_height || next_XY_temp[1] < 0 || next_XY_temp[1] >= myUI.planner.map_width) {
        surrounding_map_deltaNWSE.push(myUI.planner.deltaNWSE[i]);
      }
    }
    
    //console.log(surrounding_map_deltaNWSE,"obstacle");
    surrounding_map_deltaNWSE.forEach(deltaNWSE => {
      myUI.InfoNWSE[deltaNWSE].drawOneOutOfBounds();
    });//obstacle
  }
  drawVisited(x,y){ //using pre obtained map of surrounding point
    var surrounding_map_deltaNWSE = []
    for (let i = 0; i < myUI.planner.num_neighbors; ++i) { 
      var next_XY_temp = [ y + myUI.planner.delta[i][0], x + myUI.planner.delta[i][1]];
      if (next_XY_temp[0] < 0 || next_XY_temp[0] >= myUI.planner.map_height || next_XY_temp[1] < 0 || next_XY_temp[1] >= myUI.planner.map_width) continue;
      if (myUI.InfoVisited.get_data(next_XY_temp)) {// if the current node has been visited
        surrounding_map_deltaNWSE.push(myUI.planner.deltaNWSE[i]);
      }
    }
      surrounding_map_deltaNWSE.forEach(deltaNWSE => {
        myUI.InfoNWSE[deltaNWSE].drawOneVisited();
      });//visited
  }
  
  drawQueue(x,y){ //using pre obtained map of surrounding point
    var surrounding_map_deltaNWSE = []
    for (let i = 0; i < myUI.planner.num_neighbors; ++i) { 
      var next_XY_temp = [ y + myUI.planner.delta[i][0], x + myUI.planner.delta[i][1]];
      if (next_XY_temp[0] < 0 || next_XY_temp[0] >= myUI.planner.map_height || next_XY_temp[1] < 0 || next_XY_temp[1] >= myUI.planner.map_width) continue;
      if (myUI.InfoQueue.get_data(next_XY_temp)) {// if the current node has been visited
        surrounding_map_deltaNWSE.push(myUI.planner.deltaNWSE[i]);
      }
    }
      surrounding_map_deltaNWSE.forEach(deltaNWSE => {
        myUI.InfoNWSE[deltaNWSE].drawOneQueue();
      });//obstacle
  }



  recordDrawnVisited(x,y){
   //  console.log(myUI.InfoVisited.get_data([x,y]),"visited record before");
     myUI.InfoVisited.set_data([x,y], 1); // marks current node XY as visited
  //   console.log(myUI.InfoVisited.get_data([x,y]),"visited record after");
  }
   recordErasedVisited(x,y){
   //  console.log(myUI.InfoVisited.get_data([x,y]),"visited record before");
     myUI.InfoVisited.set_data([x,y], 0); // marks current node XY as visited
  //   console.log(myUI.InfoVisited.get_data([x,y]),"visited record after");
  }
    
    
    
  recordDrawnQueue(x,y){
    myUI.InfoQueue.set_data([x,y], 1); // marks current node XY as visited // marks current node XY as visited
   // console.log(visited.get_data([x,y]));
  }
   recordErasedQueue(x,y){
    myUI.InfoQueue.set_data([x,y], 1); // marks current node XY as visited // marks current node XY as visited
   // console.log(visited.get_data([x,y]));
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
      infoMapInnerHTML = '<section><div id="adjustment2">F:&nbsp<span class="F"></span></div><div id="adjustment">G:&nbsp<span class="G"></span>H:&nbsp<span class="H"></span></div>Type:&nbsp<span class="type"></span></section>';
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
      element.querySelector(".type").innerHTML = "";
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
    document.getElementById("currentXY").innerHTML =  "( "+y+", "+x+")"; // flipped x and y because of matrix transformation
  }
}




document.getElementById("currentXY").innerHTML = "(_, _)"; 




