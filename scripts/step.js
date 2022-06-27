/*const STATIC_NAMES = [
  // index 0 to index 4 are canvas ids, must be the same as statics_to_obj 
  "QU", // queue
  "VI", // visited
  "CR", // current
  "NB", // neighbours
  "PA", //
   "IN", // info NWSE
  "INE",
  "IE",
  "ISE",
  "IS",
  "ISW",
  "IW",
  "INW",
  "ICR", //info current path
  // rest of the items are dynamics commands/identifiers
  "SIMPLE", // shows that the step is a simple step
  "EC", // erase canvas
  "DP", // draw pixel
  "EP", // erase pixel
  "INC_P", // increment pixel
  "DEC_P", // increment pixel
  "DA", // draw, arrow
  "EA" , // erase arrow
  "DF",
  "EF",
  "DG",
  "EG",
  "DH",
  "EH",
  "Dparent",
  "Eparent",
  "Einfomap",
  "TableAdd",
  "Tableremove"
];*/

const STATIC_COMMANDS = [
  /* rest of the items are dynamics commands/identifiers */
  "SIMPLE", // shows that the step is a simple step
  "EC", // erase canvas
  "DP", // draw pixel
  "EP", // erase pixel
  "INC_P", // increment pixel
  "DEC_P", // increment pixel
  "DA", // draw, arrow
  "EA" , // erase arrow
  "DI",
  "EI",
  "Dparent",
  "Eparent",
  "Einfomap",
  "TableAdd",
  "Tableremove"
];

const STATIC_DESTS = [
  /* index 0 to index 4 are canvas ids, must be the same as statics_to_obj */
  "QU", // queue
  "VI", // visited
  "CR", // current
  "NB", // neighbours
  "PA", // path
  "IN", // info NWSE 5
  "INW",
  "IW",
  "ISW",
  "IS",
  "ISE", //10
  "IE",
  "INE",
  "IF",
  "IG",
  "IH",
  "ICR", //info current path
];

// IMPT, ENSURE THAT COMMANDS AND DEST DO NOT CONFLICT

var STATIC = {
  max_val: Math.max(STATIC_COMMANDS.length-1, STATIC_DESTS.length-1)
};
STATIC_COMMANDS.forEach(function(value, i){
  STATIC[value] = i;
});
STATIC_DESTS.forEach(function(value, i){
  STATIC[value] = i;
});
console.log(STATIC);
/*
Actions
- `dc`, draw canvas
- `ec`, erase canvas
- `dp`, draw pixel
- `ep`, erase pixel
- `ia`, infopane add
- `ie`, infopane erase

*/
const statics_to_obj = {
  0: "queue",
  1: "visited",
  2: "current_YX",
  3: "neighbours",
  4: "path",
  5:"N",
  6:"NW",
  7:"W",
  8:"SW",
  9:"S",
  10:"SE",
  11:"E",
  12: "NE"
}

myUI.run_steps = function(num_steps, step_direction="fwd", virtual=false){
  run_next_step();

  function run_next_step(){
    if(num_steps--){
      if(step_direction!="fwd" && myUI.animation.step>-1)--myUI.animation.step;
      else if(step_direction=="fwd" && myUI.animation.step<myUI.animation.max_step) ++myUI.animation.step;
      else return;
      myUI.planner.get_step(myUI.animation.step, step_direction).then(step=>{
        let i=0;
        
        while(i<step.length){
          let [command, dest, y, x, parent_y, parent_x, parent_exists] = GridPathFinder.unpack_action(step[i]);
          if(parent_exists){
            console.log("parent exists");
            var g_cost = step[i+1];
            var h_cost = step[i+2];
            var f_cost = (parseInt(g_cost) + parseInt(h_cost)).toPrecision(3); // null + null = 0 this causes f_cost to be 0
         //  var f_cost = f_cost.toPrecision(3);
            if(g_cost == null || h_cost == null ) f_cost = null; 
            i+=2;
          }
          console.log([command, dest, y, x, parent_y, parent_x, g_cost, h_cost]);
          
          try{
	          if(dest==STATIC.ICR ){//draw "current_YX",
	            info_map_reset(); // reset all info NWSE
	            info_map_obstacles(x,y);
	            info_map_out_of_bound(x,y);
	            info_map_visited(x,y);
	            info_map_queue(x,y)
	          //  myUI.InfoTable.out_table();
	            out_last_slide();
	            myUI.InfoCurrent.DrawCurrent(x,y);
	            
	             console.log(myUI.planner.cell_map[y][x],"step");
	          }
	         	//to draw neighbours
	          else if(command == STATIC.DI ){
	            myUI.InfoNWSE[statics_to_obj[dest]].DrawNeighbour(f_cost,g_cost,h_cost);
	            in_table(x,y,parent_x,parent_y,f_cost,g_cost,h_cost);
	          }
	        	//to erase neighbours
	          else if(command == STATIC.EI ){
	            myUI.InfoNWSE[statics_to_obj[dest]].Reset();
	            out_first_slide()
	            
	          }
	          
	
	
	          if(dest==STATIC.CR && command == STATIC.DP ){//record  "visiters" in 2d array
	            console.log(x,"x",y,"y","visited recorded");
	            record_drawn_visited(x,y);
	            var next_YX_temp = [y,x]
	            //console.log(visited.get_data(next_YX_temp),"check");
	            
	          }
	          if(dest== STATIC.QU && command == STATIC.DP ){//record  "visiters" in 2d array
	            console.log(x,"x",y,"y","Queue");
	            record_drawn_queue(x,y);
	           
	          }
	          /*
	          if(dest==STATIC.CR && command == STATIC.DP ){//draw "current_YX",
	            document.getElementById("currentYX").innerHTML =  "( "+x+", "+y+")"; 
	           // console.log(x,"x",y,"y","current_YX");
	           // info_map_visited(x,y);
	            info_map_reset();
	            //myUI.infomap.ResetAll();
	            info_map_obstacles(x,y);
	            info_map_out_of_bound(x,y);
	             info_map_queue(x,y)
	            info_map_visited(x,y);
	          
	            out_table();
	            
	            
	
	      //      out_table();
	           //  console.log(x,"x",y,"y","obstacle drawn");
	            
	          }
	
	          
	
	          if(dest==STATIC.NB && command == STATIC.DP ){//draw "neighbours"
	           // console.log(x,"x",y,"y","neighbours");
	            info_map_neighbours_draw(x,y);
	            in_table(x,y);
	            
	          }
	
	          if(dest==STATIC.NB && command == STATIC.EP ){//erase "neighbours"
	           // console.log(x,"x",y,"y","neighbours");
	          //  info_map_neighbours_erase(x,y);
	             
	          }
	          if(dest==1 && command == STATIC.DP ){//record  "visiters" in 2d array
	            //console.log(x,"x",y,"y","visited recorded");
	           record_drawn_visited(x,y);
	          }
	          if(dest== STATIC.QU && command == STATIC.DP ){//record  "visiters" in 2d array
	            //console.log(x,"x",y,"y","HI");
	            record_drawn_queue(x,y);
	           
	          }
	*/
            if(command==STATIC.EC){
              if(virtual) myUI.tmp.virtual_canvases[statics_to_obj[dest]] = zero2D(myUI.map_height, myUI.map_width);
              else myUI.canvases[statics_to_obj[dest]].erase_canvas();
            }
            else if(command==STATIC.DP){
              if(virtual) myUI.tmp.virtual_canvases[statics_to_obj[dest]][y][x] = 1;
              else myUI.canvases[statics_to_obj[dest]].draw_pixel([y, x]);
            }
            else if(command==STATIC.EP){
              if(virtual) myUI.tmp.virtual_canvases[statics_to_obj[dest]][y][x] = 0;
              else myUI.canvases[statics_to_obj[dest]].erase_pixel([y, x]);
            }
            else if(command==STATIC.INC_P){
              if(virtual) myUI.tmp.virtual_canvases[statics_to_obj[dest]][y][x] = 1;
              else myUI.canvases[statics_to_obj[dest]].change_pixel([y, x], "inc");
              
            }
            else if(command==STATIC.DEC_P){
              if(virtual) myUI.tmp.virtual_canvases[statics_to_obj[dest]][y][x] = 0;
              else myUI.canvases[statics_to_obj[dest]].change_pixel([y, x], "dec");
            }
            else if(command==STATIC.DA){
              // draw arrow
              ++myUI.arrow.step;
              let fromyx = myUI.arrow.coords[myUI.arrow.step*2];
              let toyx = myUI.arrow.coords[myUI.arrow.step*2+1];
              myUI.draw_arrow(fromyx, toyx, false, 0, false);
              //myUI.arrow.data[myUI.arrow.step].classList.remove("hidden");
            }
            else if(command==STATIC.EA){
              // erase arrow
              //myUI.arrow.data[myUI.arrow.step].classList.add("hidden");
              let data = myUI.arrow.data[myUI.arrow.step];
              //console.log(data);
              myUI.arrow.ctx.putImageData(...data);
              --myUI.arrow.step;
            }
          }catch(e){
            console.log(command, dest, "failed");
          }
          ++i;
        }
        run_next_step();
      });
    }
  }
}

/*
steps_arr = [
  each step: 
  [
    each action
    UInt8Array( (5)
      [action_type,args]
    );
  ]
]
*/


myUI.run_combined_step = function(step_direction="fwd"){
  let tmp_step = myUI.animation.step, start_step = myUI.animation.step;
  
  if(step_direction=="fwd") ++tmp_step;
  search_for_simple();
  function search_for_simple(){
    if(step_direction!="fwd"){
      myUI.planner.get_step(tmp_step, true).then(step=>{
        let first_command = (step[0] >> 2) & ((1 << myUI.planner.static_bit_len) - 1);
        if(first_command!=STATIC.SIMPLE && tmp_step>0){
          --tmp_step;
          search_for_simple();
        }
        else{
          --tmp_step;
          myUI.run_steps(start_step - tmp_step, step_direction);
        }
      });
    }
    else{
      myUI.planner.get_step(tmp_step+1).then(step=>{
        let first_command = (step[0] >> 2) & ((1 << myUI.planner.static_bit_len) - 1);
        if(first_command!=STATIC.SIMPLE && tmp_step<myUI.animation.max_step-1){
          ++tmp_step;
          search_for_simple();
        }
        else{
          myUI.run_steps(tmp_step - start_step, step_direction);
        }
      });
    }
  }
}

// info map post process
function info_map_reset(){
  var deltaNWSE = ["N", "NW", "W", "SW", "S", "SE", "E", "NE"];
 
  deltaNWSE.forEach(deltaNWSE => {document.getElementById(deltaNWSE).style.borderColor = "transparent";
  document.getElementById(deltaNWSE).style.borderColor = "transparent";
  document.getElementById(deltaNWSE).style.background = "rgb(188,186,201)";
  document.getElementById(deltaNWSE).style.outlineColor = "black";
  document.getElementById(deltaNWSE).style.color = "black";
  document.getElementById(deltaNWSE).querySelector(".type").innerHTML = "";
  if (myUI.planners[myUI.planner_choice] == A_star) document.getElementById(deltaNWSE).querySelector(".F").innerHTML = "";
  if (myUI.planners[myUI.planner_choice] == Dijkstra || myUI.planners[myUI.planner_choice] == A_star) document.getElementById(deltaNWSE).querySelector(".G").innerHTML = "";
  if (myUI.planners[myUI.planner_choice] == A_star) document.getElementById(deltaNWSE).querySelector(".H").innerHTML = "";
  }); //reset obstacles in info map 

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
    document.getElementById(deltaNWSE).querySelector(".type").innerHTML = "Obstacle";                           
                                                 });//obstacle

}


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



function record_drawn_visited(x,y){
 //  console.log(myUI.InfoVisited.get_data([y,x]),"visited record before");
   myUI.InfoVisited.set_data([y,x], 1); // marks current node YX as visited
//   console.log(myUI.InfoVisited.get_data([y,x]),"visited record after");
}


function record_drawn_queue(x,y){
  myUI.InfoQueue.set_data([y,x], 1); // marks current node YX as visited // marks current node YX as visited
 // console.log(visited.get_data([y,x]));
}




function info_map_visited(x,y){ //using pre obtained map of surrounding point
  var surrounding_map_deltaNWSE = []
  for (let i = 0; i < myUI.planner.num_neighbours; ++i) { 
    var next_YX_temp = [ y + myUI.planner.delta[i][0], x + myUI.planner.delta[i][1]];
    if (next_YX_temp[0] < 0 || next_YX_temp[0] >= myUI.planner.map_height || next_YX_temp[1] < 0 || next_YX_temp[1] >= myUI.planner.map_width) continue;
    if (myUI.InfoVisited.get_data(next_YX_temp)) {// if the current node has been visited
      surrounding_map_deltaNWSE.push(myUI.planner.deltaNWSE[i]);
    }
  }
    surrounding_map_deltaNWSE.forEach(deltaNWSE => {
      document.getElementById(deltaNWSE).style.borderColor = "rgb(221,48,33)";
      document.getElementById(deltaNWSE).querySelector(".type").innerHTML = "Visited"
    });//obstacle
}
  
     
function info_map_queue(x,y){ //using pre obtained map of surrounding point
  var surrounding_map_deltaNWSE = []
  for (let i = 0; i < myUI.planner.num_neighbours; ++i) { 
    var next_YX_temp = [ y + myUI.planner.delta[i][0], x + myUI.planner.delta[i][1]];
    if (next_YX_temp[0] < 0 || next_YX_temp[0] >= myUI.planner.map_height || next_YX_temp[1] < 0 || next_YX_temp[1] >= myUI.planner.map_width) continue;
    if (myUI.InfoQueue.get_data(next_YX_temp)) {// if the current node has been visited
      surrounding_map_deltaNWSE.push(myUI.planner.deltaNWSE[i]);
    }
  }
    surrounding_map_deltaNWSE.forEach(deltaNWSE => {
      document.getElementById(deltaNWSE).style.borderColor = "rgb(116,250,76)";
      document.getElementById(deltaNWSE).querySelector(".type").innerHTML = "Queue"
    });//obstacle
}


//start of js for info table

var slides = document.getElementsByClassName("slide");

function out_last_slide(){
  //animates out last slide
  if (slides.length >= 1) slides[slides.length-1].style.animation = 'out 0.5s forwards';
   //deletes HTML of last table(use arrow function to accept parameters)
  setTimeout(()=>removebyindex(slides.length-1),1000);
}
function out_first_slide(){
  //animates out first slide
  if (slides.length >= 1) slides[0].style.animation = 'out 0.5s forwards';
   //deletes HTML of last table(use arrow function to accept parameters)
  setTimeout(()=>removebyindex(0),1000);
}



function in_table(x,y,parent_x,parent_y,f_cost,g_cost,h_cost){


    
  if (myUI.planners[myUI.planner_choice] == BFS || myUI.planners[myUI.planner_choice] == DFS){
    t = document.createElement('table');
    //t.setAttribute('class', 'slide'); new table automatically set "slide class"
    r = t.insertRow(0); 
    c1 = r.insertCell(0);
    c2 = r.insertCell(1);
    c3 = r.insertCell(2);
    c2.innerHTML = "";
    c2.innerHTML = x+", "+y;
    c3.innerHTML = parent_x+", "+parent_y;
    t.classList.add('slide', 'new-slide');
    document.getElementById("info-container-dynamic").prepend(t); 
  }
  else if (myUI.planners[myUI.planner_choice] == Dijkstra){
    t = document.createElement('table');
    //t.setAttribute('class', 'slide'); new table automatically set "slide class"
    r = t.insertRow(0); 
    c1 = r.insertCell(0);
    c2 = r.insertCell(1);
    c3 = r.insertCell(2);
    c4 = r.insertCell(3);
    c1.innerHTML = "";
    c2.innerHTML = x+", "+y;
    c3.innerHTML = parent_x+", "+parent_y;
    c4.innerHTML = g_cost;
    t.classList.add('slide', 'new-slide');
    document.getElementById("info-container-dynamic").prepend(t); 
    
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
    c1.innerHTML = "";
    c2.innerHTML = x+", "+y;
    c3.innerHTML = parent_x+", "+parent_y;
    c4.innerHTML = f_cost;
    c5.innerHTML = g_cost;
    c6.innerHTML = h_cost;
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




