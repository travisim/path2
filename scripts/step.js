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
];

const STATIC_DESTS = [
  /* index 0 to index 4 are canvas ids, must be the same as statics_to_obj */
  "QU", // queue
  "VI", // visited
  "CR", // current
  "NB", // neighbours
  "PA", // path
  "IN", // info NWSE
  "INE",
  "IE",
  "ISE",
  "IS",
  "ISW",
  "IW",
  "INW",
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
  4: "path"
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
          let [command, dest, y, x, parent_y, parent_x] = GridPathFinder.unpack_action(step[i]);
          if(parent_y || parent_x){
            console.log("parent exists");
            var g_cost = step[i+1];
            var h_cost = step[i+2];
            var f_cost = g_cost + h_cost;
            i+=2;
          }
          console.log([command, dest, y, x, parent_y, parent_x, g_cost, h_cost]);
          
          
          if(dest==STATIC.ICR ){//draw "current_YX",
            info_map_reset(); // reset all info NWSE
            myUI.InfoCurrent.DrawCurrent(x,y);
            console.log(STATIC.ICR);
          }
         //to draw neighbours
          if(dest==STATIC.IN && command == STATIC.DP ){
            myUI.InfoNWSE["N"].DrawNeighbour(f_cost,g_cost,h_cost);
            
          }
          if(dest==STATIC.INW && command == STATIC.DP ){
            myUI.InfoNWSE["NW"].DrawNeighbour(f_cost,g_cost,h_cost);
            
          }
          if(dest==STATIC.IW && command == STATIC.DP ){
            myUI.InfoNWSE["W"].DrawNeighbour(f_cost,g_cost,h_cost);
            
          }
          if(dest==STATIC.ISW && command == STATIC.DP ){
            myUI.InfoNWSE["SW"].DrawNeighbour(f_cost,g_cost,h_cost);
            
          }
          if(dest==STATIC.IS && command == STATIC.DP ){
           myUI.InfoNWSE["S"].DrawNeighbour(f_cost,g_cost,h_cost);
            
          }
          if(dest==STATIC.ISE && command == STATIC.DP ){
            myUI.InfoNWSE["SE"].DrawNeighbour(f_cost,g_cost,h_cost);
            
          }
          if(dest==STATIC.IE && command == STATIC.DP ){
            myUI.InfoNWSE["E"].DrawNeighbour(f_cost,g_cost,h_cost);
            
          }
           if(dest==STATIC.INE && command == STATIC.DP ){
            myUI.InfoNWSE["NE"].DrawNeighbour(f_cost,g_cost,h_cost);
            
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
            myUI.arrow.data[myUI.arrow.step].classList.remove("hidden");
          }
          else if(command==STATIC.EA){
            // erase arrow
            myUI.arrow.data[myUI.arrow.step].classList.add("hidden");
            --myUI.arrow.step;
          }
          ++i;
        }
        /*step.forEach(action=>{
          let [command, dest, y, x, parent_y, parent_x] = GridPathFinder.unpack_action(action);
          console.log(GridPathFinder.unpack_action(action),action);
          
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
            myUI.arrow.data[myUI.arrow.step].classList.remove("hidden");
          }
          else if(command==STATIC.EA){
            // erase arrow
            myUI.arrow.data[myUI.arrow.step].classList.add("hidden");
            --myUI.arrow.step;
          }
        });*/
        //if(virtual) console.log(myUI.tmp.virtual_canvases.visited);
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