 
class UIInfoNWSE{
  constructor(infoNWSE_Id){
    this.element = document.getElementById(infoNWSE_Id);
  }
     
  resetOne(){
  this.element.style.borderColor = "transparent";
  this.element.style.borderColor = "transparent";
  this.element.style.background = "rgb(188,186,201)";
  this.element.style.outlineColor = "black";
  this.element.style.color = "black";
  this.element.querySelector(".type").innerHTML = "";
  if (myUI.planners[myUI.planner_choice] == A_star)  this.element.querySelector(".F").innerHTML = "";
  if (myUI.planners[myUI.planner_choice] == Dijkstra || myUI.planners[myUI.planner_choice] == A_star)  this.element.querySelector(".G").innerHTML = "";
  if (myUI.planners[myUI.planner_choice] == A_star)  this.element.querySelector(".H").innerHTML = "";
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

  var surrounding_map_deltaNWSE = []
  for (let i = 0; i < myUI.planner.num_neighbours; ++i) { 
    var next_YX_temp = [ y + myUI.planner.delta[i][0], x + myUI.planner.delta[i][1]];
    if (next_YX_temp[0] < 0 || next_YX_temp[0] >= myUI.planner.map_height || next_YX_temp[1] < 0 || next_YX_temp[1] >= myUI.planner.map_width) continue;
      if (myUI.planner.map.get_data(next_YX_temp) != 1) {
        surrounding_map_deltaNWSE.push(myUI.planner.deltaNWSE[i]);
      }
    }
  
    //console.log(surrounding_map_deltaNWSE,"obstacle");
    surrounding_map_deltaNWSE.forEach(deltaNWSE => {
    myUI.InfoNWSE[deltaNWSE].drawOneObstacle();                      
    });//obstacle
  
  }
  drawOutOfBound(x,y){

    var surrounding_map_deltaNWSE = []
    for (let i = 0; i < myUI.planner.num_neighbours; ++i) { 
      var next_YX_temp = [ y + myUI.planner.delta[i][0], x + myUI.planner.delta[i][1]];
      if (next_YX_temp[0] < 0 || next_YX_temp[0] >= myUI.planner.map_height || next_YX_temp[1] < 0 || next_YX_temp[1] >= myUI.planner.map_width) {
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
    for (let i = 0; i < myUI.planner.num_neighbours; ++i) { 
      var next_YX_temp = [ y + myUI.planner.delta[i][0], x + myUI.planner.delta[i][1]];
      if (next_YX_temp[0] < 0 || next_YX_temp[0] >= myUI.planner.map_height || next_YX_temp[1] < 0 || next_YX_temp[1] >= myUI.planner.map_width) continue;
      if (myUI.InfoVisited.get_data(next_YX_temp)) {// if the current node has been visited
        surrounding_map_deltaNWSE.push(myUI.planner.deltaNWSE[i]);
      }
    }
      surrounding_map_deltaNWSE.forEach(deltaNWSE => {
        myUI.InfoNWSE[deltaNWSE].drawOneVisited();
      });//visited
  }
  
  drawQueue(x,y){ //using pre obtained map of surrounding point
    var surrounding_map_deltaNWSE = []
    for (let i = 0; i < myUI.planner.num_neighbours; ++i) { 
      var next_YX_temp = [ y + myUI.planner.delta[i][0], x + myUI.planner.delta[i][1]];
      if (next_YX_temp[0] < 0 || next_YX_temp[0] >= myUI.planner.map_height || next_YX_temp[1] < 0 || next_YX_temp[1] >= myUI.planner.map_width) continue;
      if (myUI.InfoQueue.get_data(next_YX_temp)) {// if the current node has been visited
        surrounding_map_deltaNWSE.push(myUI.planner.deltaNWSE[i]);
      }
    }
      surrounding_map_deltaNWSE.forEach(deltaNWSE => {
        myUI.InfoNWSE[deltaNWSE].drawOneQueue();
      });//obstacle
  }



  recordDrawnVisited(x,y){
   //  console.log(myUI.InfoVisited.get_data([y,x]),"visited record before");
     myUI.InfoVisited.set_data([y,x], 1); // marks current node YX as visited
  //   console.log(myUI.InfoVisited.get_data([y,x]),"visited record after");
  }
   recordErasedVisited(x,y){
   //  console.log(myUI.InfoVisited.get_data([y,x]),"visited record before");
     myUI.InfoVisited.set_data([y,x], 0); // marks current node YX as visited
  //   console.log(myUI.InfoVisited.get_data([y,x]),"visited record after");
  }
    
    
    
  recordDrawnQueue(x,y){
    myUI.InfoQueue.set_data([y,x], 1); // marks current node YX as visited // marks current node YX as visited
   // console.log(visited.get_data([y,x]));
  }
   recordErasedQueue(x,y){
    myUI.InfoQueue.set_data([y,x], 1); // marks current node YX as visited // marks current node YX as visited
   // console.log(visited.get_data([y,x]));
  }
  
}





var UIInfoCurrent = {
  DrawCurrent(x,y){
    document.getElementById("currentYX").innerHTML =  "( "+y+", "+x+")"; // flipped x and y because of matrix transformation
  }
}


//object with only 1 method


document.getElementById("currentYX").innerHTML = "(_, _)"; 