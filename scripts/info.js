

//start of js for info map
let info_neighbours_id = ["NW","N","NE","W","E","SW","S","SE"];
//var deltaNWSE = ["N", "NW", "W", "SW", "S", "SE", "E", "NE"];
//var delta = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
for(let i=0;i<info_neighbours_id.length;++i){
  document.getElementById(info_neighbours_id[i]).innerHTML = '<span id="type"></span>';
};
//document.getElementById(info_neighbours_id[i]).innerHTML = 'F:<span class "F_cost" id="F"></span>G:<span id="G"></span>H:<span id="H"></span>Type:<span id="type"></span>';
var current_XY_ani = [];


/*
function info_map_reset(){
 /* myUI.planner.deltaNWSE.forEach(deltaNWSE => {document.getElementById(deltaNWSE).style.borderColor = "transparent";
  document.getElementById(deltaNWSE).style.borderColor = "transparent";
  document.getElementById(deltaNWSE).style.background = "rgb(188,186,201)";
  document.getElementById(deltaNWSE).style.outlineColor = "black";
  document.getElementById(deltaNWSE).style.color = "black";
  document.getElementById(deltaNWSE).querySelector("#type").innerHTML = "";
  }); //reset obstacles in info map 
  
  //myUI.planner.deltaNWSE.forEach(deltaNWSE => {
    myUI.infomap[deltaNWSE].Reset();
  }); //reset obstacles in info map 
}

*/
 

function info_map_out_of_bound(x,y){
  current_XY_ani = [x,y];
  var surrounding_map_deltaNWSE = []
  for (let i = 0; i < myUI.planner.num_neighbours; ++i) { 
    var next_YX_temp = [ y + myUI.planner.delta[i][0], x + myUI.planner.delta[i][1]];
    if (next_YX_temp[0] < 0 || next_YX_temp[0] >= myUI.planner.map_height || next_YX_temp[1] < 0 || next_YX_temp[1] >= myUI.planner.map_width) {
      surrounding_map_deltaNWSE.push(myUI.planner.deltaNWSE[i]);
    }
  }
  
  //console.log(surrounding_map_deltaNWSE,"obstacle");
surrounding_map_deltaNWSE.forEach(deltaNWSE => {
document.getElementById(deltaNWSE).style.borderColor = "transparent";
document.getElementById(deltaNWSE).style.background = "transparent";
document.getElementById(deltaNWSE).style.outlineColor = "transparent";
document.getElementById(deltaNWSE).style.color = "transparent";
});//obstacle
}
  
 

function info_map_obstacles(x,y){
  current_XY_ani = [x,y];
  var surrounding_map_deltaNWSE = []
  for (let i = 0; i < myUI.planner.num_neighbours; ++i) { 
    var next_YX_temp = [ y + myUI.planner.delta[i][0], x + myUI.planner.delta[i][1]];
    if (next_YX_temp[0] < 0 || next_YX_temp[0] >= myUI.planner.map_height || next_YX_temp[1] < 0 || next_YX_temp[1] >= myUI.planner.map_width) continue;
    if (myUI.planner.map[next_YX_temp[0]][next_YX_temp[1]] != 1) {
      surrounding_map_deltaNWSE.push(myUI.planner.deltaNWSE[i]);
    }
  }
  
  //console.log(surrounding_map_deltaNWSE,"obstacle");
  surrounding_map_deltaNWSE.forEach(deltaNWSE => {
    document.getElementById(deltaNWSE).style.borderColor = "rgb(0,0,0)";
    document.getElementById(deltaNWSE).querySelector("#type").innerHTML = "Obstacle";                           
                                                 });//obstacle

}


function info_map_neighbours_draw(x,y){ // comparing surrounding point to current point
  let [xc,yc] = current_XY_ani;
  var relative_deltaNWSE = [y-yc,x-xc];
  //console.log(relative_deltaNWSE,"relative_deltaNWSE" );
  for (let i = 0; i < myUI.planner.num_neighbours; ++i) { 
    if (relative_deltaNWSE[0] == myUI.planner.delta[i][0] && relative_deltaNWSE[1] == myUI.planner.delta[i][1]){
      document.getElementById(myUI.planner.deltaNWSE[i]).style.borderColor = "rgb(0,130,105)";
     // document.getElementById(myUI.planner.deltaNWSE[i]).querySelector("#F").innerHTML = info[y][x].f;
     // document.getElementById(myUI.planner.deltaNWSE[i]).querySelector("#G").innerHTML = info[y][x].g;
     // document.getElementById(myUI.planner.deltaNWSE[i]).querySelector("#H").innerHTML = info[y][x].h;
      document.getElementById(myUI.planner.deltaNWSE[i]).querySelector("#type").innerHTML = "neighbour";
     // console.log(myUI.planner.deltaNWSE[i],"neighbour");
      
    } 
  }

  
}


function info_map_neighbours_erase(x,y){ // comparing surrounding point to current point
  let [xc,yc] = current_XY_ani;
  var relative_deltaNWSE = [y-yc,x-xc];
  //console.log(relative_deltaNWSE,"relative_deltaNWSE" );
  for (let i = 0; i < myUI.planner.num_neighbours; ++i) { 
    if (relative_deltaNWSE[0] == myUI.planner.delta[i][0] && relative_deltaNWSE[1] == myUI.planner.delta[i][1]){
      document.getElementById(myUI.planner.deltaNWSE[i]).style.borderColor = "transparent";
       document.getElementById(myUI.planner.deltaNWSE[i]).querySelector("#type").innerHTML = "";
     // console.log(myUI.planner.deltaNWSE[i],"neighbour");
     
    } 
  }
}


var visited = new BitMatrix(myUI.planner.map_height, myUI.planner.map_width); // recreates the visited 2d array from tha steps for the display of the info map
function record_drawn_visited(x,y){
   visited.set_data([y,x], 1); // marks current node YX as visited
 // console.log(visited.get_data([y,x]));
}
var queue = new BitMatrix(myUI.planner.map_height, myUI.planner.map_width);
function record_drawn_queue(x,y){
   queue.set_data([y,x], 1); // marks current node YX as visited
 // console.log(visited.get_data([y,x]));
}

function info_map_visited(x,y){ //using pre obtained map of surrounding point
  var surrounding_map_deltaNWSE = []
  for (let i = 0; i < myUI.planner.num_neighbours; ++i) { 
    var next_YX_temp = [ y + myUI.planner.delta[i][0], x + myUI.planner.delta[i][1]];
    if (next_YX_temp[0] < 0 || next_YX_temp[0] >= myUI.planner.map_height || next_YX_temp[1] < 0 || next_YX_temp[1] >= myUI.planner.map_width) continue;
    if (visited.get_data(next_YX_temp)) {// if the current node has been visited
      surrounding_map_deltaNWSE.push(myUI.planner.deltaNWSE[i]);
    }
  }
    surrounding_map_deltaNWSE.forEach(deltaNWSE => {
      document.getElementById(deltaNWSE).style.borderColor = "rgb(221,48,33)";
      document.getElementById(deltaNWSE).querySelector("#type").innerHTML = "Visited"
    });//obstacle
}
  
     
function info_map_queue(x,y){ //using pre obtained map of surrounding point
  var surrounding_map_deltaNWSE = []
  for (let i = 0; i < myUI.planner.num_neighbours; ++i) { 
    var next_YX_temp = [ y + myUI.planner.delta[i][0], x + myUI.planner.delta[i][1]];
    if (next_YX_temp[0] < 0 || next_YX_temp[0] >= myUI.planner.map_height || next_YX_temp[1] < 0 || next_YX_temp[1] >= myUI.planner.map_width) continue;
    if (queue.get_data(next_YX_temp)) {// if the current node has been visited
      surrounding_map_deltaNWSE.push(myUI.planner.deltaNWSE[i]);
    }
  }
    surrounding_map_deltaNWSE.forEach(deltaNWSE => {
      document.getElementById(deltaNWSE).style.borderColor = "rgb(116,250,76)";
      document.getElementById(deltaNWSE).querySelector("#type").innerHTML = "Queue"
    });//obstacle
}
 

//end of js for info map


















  


//start of js for info table

var slides = document.getElementsByClassName("slide");
//document.getElementById("teef").innerHTML = slides.length;

//out_table();
//in_table();
function out_table(){
  //animates out last table
  //slides[slides.length-1].style.animation = 'out 0.5s forwards';
   //deletes HTML of last table(use arrow function to accept parameters)
  setTimeout(()=>removebyindex(slides.length-1),1000);
}



function in_table(x,y){

var info = myUI.planner.final_state().info_matrix
  
if (myUI.planner_choice == 0 || myUI.planner_choice == 1){
  t = document.createElement('table');
  //t.setAttribute('class', 'slide'); new table automatically set "slide class"
  r = t.insertRow(0); 
  c1 = r.insertCell(0);
  c2 = r.insertCell(1);
  c1.innerHTML = x+", "+y;
  c2.innerHTML = info[y][x].parent[1]+", "+info[y][x].parent[0];
  t.classList.add('slide', 'new-slide');
  document.getElementById("info-container-dynamic").prepend(t); 
}
else if (myUI.planner_choice == 2){
  t = document.createElement('table');
  //t.setAttribute('class', 'slide'); new table automatically set "slide class"
  r = t.insertRow(0); 
  c1 = r.insertCell(0);
  c2 = r.insertCell(1);
  c3 = r.insertCell(2);
  c1.innerHTML = x+", "+y;
  c2.innerHTML = info[y][x].parent[1]+", "+info[y][x].parent[0];
  c3.innerHTML = info[y][x].g;
  t.classList.add('slide', 'new-slide');
  document.getElementById("info-container-dynamic").prepend(t); 
  
}
else if (myUI.planner_choice == 3){
  t = document.createElement('table');
  //t.setAttribute('class', 'slide'); new table automatically set "slide class"
  r = t.insertRow(0); 
  c1 = r.insertCell(0);
  c2 = r.insertCell(1);
  c3 = r.insertCell(2);
  c4 = r.insertCell(3);
  c5 = r.insertCell(4);
  c6 = r.insertCell(5);
  c1.innerHTML = x+", "+y;
  c2.innerHTML = info[y][x].parent[1]+", "+info[y][x].parent[0];
  c3.innerHTML = info[y][x].f;
  c4.innerHTML = info[y][x].g;
  c5.innerHTML = info[y][x].h;
  c6.innerHTML = 1;
  t.classList.add('slide', 'new-slide');
  document.getElementById("info-container-dynamic").prepend(t); 
  
}


  

  
  
  /*
x+", "+y;
myUI.planner.info_matrix()
  info[y][x].parent;
 info[y][x].f;
 info[y][x].g;
 info[y][x].h;
 info[y][x].state;
  */

}
  /*
vertex
f
g
h
parent
state
*/
   
function removebyindex(index){
  var removeTab = slides[index];
  var parentEl = removeTab.parentElement;
  parentEl.removeChild(removeTab);
}



//end of js for info table






//demo
/*document.querySelector("#NW").querySelector("#F").innerHTML = "13.13";


document.getElementById("NW").style.borderColor = "rgb(0,0,0)";//obstacle
document.getElementById("N").style.borderColor = "rgb(221,48,33)";//visited

document.getElementById("W").style.borderColor = "rgb(0,130,105)";//neighbour


*/
 
document.getElementById("currentYX").innerHTML = "(_, _)"; 



