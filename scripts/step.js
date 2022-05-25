const STATIC_NAMES = [
  /* index 0 to index 4 are canvas ids, must be the same as statics_to_obj */
  "QU", // queue
  "VI", // visited
  "CR", // current
  "NB", // neighbours
  "PA", // path
  /* rest of the items are dynamics commands/identifiers */
  "SIMPLE", // shows that the step is a simple step
  "EC", // erase canvas
  "DP", // draw pixel
  "EP", // erase pixel
  "DA", // draw arrow
  "EA"  // erase arrow
];

var STATIC = {
  max_val: STATIC_NAMES.length-1
};
STATIC_NAMES.forEach(function(value, i){
  STATIC[value] = i;
})
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
        step.forEach(action=>{
          let [command, dest, y, x] = GridPathFinder.unpack_action(action);
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
          else if(command==STATIC.DA){
            // draw arrow
            ++myUI.arrow.step;
            myUI.arrow.data[myUI.arrow.step].classList.remove("hidden");
          }
          else if(action[0]==STATIC.EA){
            // erase arrow
            myUI.arrow.data[myUI.arrow.step].classList.add("hidden");
            --myUI.arrow.step;
          }
          
          
          /*if(action[0]==STATIC.EC){
            if(virtual) myUI.tmp.virtual_canvases[statics_to_obj[action[1]]] = zero2D(myUI.map_height, myUI.map_width);
            else myUI.canvases[statics_to_obj[action[1]]].erase_canvas();
          }
          else if(action[0]==STATIC.DP){
            if(virtual) myUI.tmp.virtual_canvases[statics_to_obj[action[1]]][action[2]][action[3]] = 1;
            else myUI.canvases[statics_to_obj[action[1]]].draw_pixel([action[2], action[3]]);
          }
          else if(action[0]==STATIC.EP){
            if(virtual) myUI.tmp.virtual_canvases[statics_to_obj[action[1]]][action[2]][action[3]] = 0;
            else myUI.canvases[statics_to_obj[action[1]]].erase_pixel([action[2], action[3]]);
          }
          else if(action[0]==STATIC.DA){
            // draw arrow
            ++myUI.arrow.step;
            myUI.arrow.data[myUI.arrow.step].classList.remove("hidden");
          }
          else if(action[0]==STATIC.EA){
            // erase arrow
            myUI.arrow.data[myUI.arrow.step].classList.add("hidden");
            --myUI.arrow.step;
          }*/
        });
        if(virtual) console.log(myUI.tmp.virtual_canvases.visited);
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