 
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
    
    
    
    recordDrawnQueue(x,y){
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




var tableId = 0;
var lastAddedSlideId = 0;
function UIInfoTable(){
  this.InsertAfterSlidesIndex = function(SlidesIndex,x,y,parent_x,parent_y,f_cost,g_cost,h_cost){
    var t = TableColumnDecider(x,y,parent_x,parent_y,f_cost,g_cost,h_cost)
    slides[SlidesIndex].after(t);
    
  }
 
  this.Sort = function(){
      var table, i, x, y;
    // var slides = document.getElementsByClassName("slide");
      var switching = true;

      // Run loop until no switching is needed
      while (switching) {
          switching = false;
        

          // Loop to go through all rows
           for (i = 0; i < (slides.length-1); i++){
              var Switch = false;

              // Fetch 2 elements that need to be compared
              x = slides[i].rows[0].cells[3].firstChild.nodeValue;
              y = slides[i+1].rows[0].cells[3].firstChild.nodeValue;

              // Check if 2 rows need to be switched
              if (x > y)
                  {

                  // If yes, mark Switch as needed and break loop
                  Switch = true;
                  break;
              }
          }
          if (Switch) {
              // Function to switch rows and mark switch as completed
              slides[i+1].after(slides[i]);
         
              switching = true;
          }
      }

  } 
  this.OutBottom = function(){
    let slides = document.getElementsByClassName("slide");
    //animates out last slide
    if (slides.length >= 1){ 
      slides[slides.length-1].style.animation = 'out 0.5s forwards';
       //deletes HTML of last table(use arrow function to accept parameters)
      setTimeout(()=>this.removebyindex(slides.length-1),1000);
    }
  };
  this.OutTop = function(){
    //animates out first slide
    if (slides.length >= 1){ slides[0].style.animation = 'out 0.5s forwards';
      //deletes HTML of last table(use arrow function to accept parameters)
      setTimeout(()=>this.removebyindex(0),1000);
    }
  };
  this.InTop = function(x,y,parent_x,parent_y,f_cost,g_cost,h_cost,stepNo){
    //unhighlight second latest table added
    
   for (let i = 0; i < document.getElementsByClassName("highlighting").length; i++) { 
      if(document.getElementsByClassName("highlighting")[0]){
  
       document.getElementsByClassName("highlighting")[0].style.border = "none";
       document.getElementsByClassName("highlighting")[0].classList.remove('highlighting');
      }
    }
    
    var t = TableColumnDecider(x,y,parent_x,parent_y,f_cost,g_cost,h_cost,stepNo)   
    document.getElementById("info-container-dynamic").prepend(t); 
    slides[0].style.border = "2px solid rgb(200,66,64)"; //highlight latest table added
    
  };
  this.InBottom = function(x,y,parent_x,parent_y,f_cost,g_cost,h_cost,stepNo){
        //unhighlight second latest table added
      for (let i = 0; i < slides.length; i++) { 
        if(document.getElementById("highlighting")){
         document.getElementById("highlighting").style.border = "none";
         document.getElementById("highlighting").removeAttribute('id');
        }
      }
      
    var t = TableColumnDecider(x,y,parent_x,parent_y,f_cost,g_cost,h_cost,stepNo)
    document.getElementById("info-container-dynamic").append(t); 
    slides[slides.length-1].style.border = "2px solid rgb(200,66,64)";
    
  };
  function TableColumnDecider(x,y,parent_x,parent_y,f_cost,g_cost,h_cost,stepNo){
    if (myUI.planners[myUI.planner_choice] == BFS || myUI.planners[myUI.planner_choice] == DFS){
      t = document.createElement('table');
      //t.setAttribute('class', 'slide'); new table automatically set "slide class"
      r = t.insertRow(0); 
      c1 = r.insertCell(0);
      c2 = r.insertCell(1);
      c3 = r.insertCell(2);
      c1.innerHTML = stepNo;
      c2.innerHTML = x+", "+y;
      c3.innerHTML = parent_x+", "+parent_y;
      t.classList.add('slide',"highlighting");
     
    }
    else if (myUI.planners[myUI.planner_choice] == Dijkstra){
      t = document.createElement('table');
      //t.setAttribute('class', 'slide'); new table automatically set "slide class"
      r = t.insertRow(0); 
      c1 = r.insertCell(0);
      c2 = r.insertCell(1);
      c3 = r.insertCell(2);
      c4 = r.insertCell(3);
      c1.innerHTML = stepNo;
      c2.innerHTML = x+", "+y;
      c3.innerHTML = parent_x+", "+parent_y;
      c4.innerHTML = g_cost;
      t.classList.add('slide',"highlighting");
    
      
    }
    else if (myUI.planners[myUI.planner_choice] == A_star){
      t = document.createElement('table');
      //t.setAttribute('class', 'slide'); new table automatically set "slide class"
      r = t.insertRow(0); 
      c1 = r.insertCell(0);
      c2 = r.insertCell(1);
      c3 = r.insertCell(2);
      c4 = r.insertCell(3);
      c5 = r.insertCell(4);
      c6 = r.insertCell(5);
      c1.innerHTML = stepNo;
      c2.innerHTML = x+", "+y;
      c3.innerHTML = parent_x+", "+parent_y;
      c4.innerHTML = f_cost;
      c5.innerHTML = g_cost;
      c6.innerHTML = h_cost;
      t.classList.add('slide',"highlighting");
      t.setAttribute("id", (stepNo).toString() )

   
      
    
    }
    return t;
  }
  this.removeAllTableSlides = function(){
    var temp = slides.length;// slides.length alawys changes, cannot use
    if(temp != 0){
      var i = temp-1;
      while(i!=-1) { 
        this.removebyindex(i);
        i--;
      }
    } 
  }
  this.removeSlidebById = function(Id){
    if (document.getElementById(Id)){
      var slide = document.getElementById(Id);
      var parentEl = slide.parentElement;
      parentEl.removeChild(slide);
    }
  }
  var previousStepNo;
  this.recordLastStepNo = function(StepNo){
    previousStepNo = StepNo;
  }
  this.lastStepNo = function(){
    return previousStepNo--;
  }
  this.removebyindex = function(index){
    var slide = slides[index];
    var parentEl = slide.parentElement;
    parentEl.removeChild(slide)
  }
  
}




      
  

function removebyindex(index){
  var slide = slides[index];
  var parentEl = slide.parentElement;
  parentEl.removeChild(slide);
}
function removeSlidebById(Id){
  var slide = document.getElementById(Id);
  var parentEl = slide.parentElement;
  parentEl.removeChild(slide);
}


document.getElementById("currentYX").innerHTML = "(_, _)"; 