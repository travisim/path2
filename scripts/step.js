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
            var f_cost = g_cost + h_cost;
            i+=2;
          }
          console.log([command, dest, y, x, parent_y, parent_x, g_cost, h_cost]);
          
          
          if(dest==STATIC.ICR ){//draw "current_YX",
            info_map_reset(); // reset all info NWSE
            info_map_obstacles(x,y);
            info_map_out_of_bound(x,y);
           // info_map_queue(x,y)
            info_map_visited(x,y);
            myUI.InfoCurrent.DrawCurrent(x,y);
            console.log(STATIC.ICR);
          }
         //to draw neighbours
          else if(command == STATIC.DI ){
            myUI.InfoNWSE[statics_to_obj[dest]].DrawNeighbour(f_cost,g_cost,h_cost);
          }


          if(dest==STATIC.NB && command == STATIC.DP ){//record  "visiters" in 2d array
            console.log(x,"x",y,"y","visited recorded");
            record_drawn_visited(x,y);
            var next_YX_temp = [y,x]
            console.log(visited.get_data(next_YX_temp),"check");
            
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
          try{
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
  document.getElementById(deltaNWSE).querySelector("#type").innerHTML = "";
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
    document.getElementById(deltaNWSE).querySelector("#type").innerHTML = "Obstacle";                           
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


var visited = new BitMatrix(myUI.planner.map_height, myUI.planner.map_width); // recreates the visited 2d array from tha steps for the display of the info map
function record_drawn_visited(x,y){
   console.log(visited.get_data([y,x]),"visited recordbefore");
   visited.set_data([y,x], 1); // marks current node YX as visited
 console.log(visited.get_data([y,x]),"visited record");
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
 
