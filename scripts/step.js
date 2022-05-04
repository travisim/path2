const STATIC = {
  /* commands (index 0) */
  DC: 1,
  EC: 2,
  DP: 3,
  EP: 4,
  /* canvases (index 1) */
  QU: 11, // queue
  VI: 12, // visited
  CR: 13, // current
  NB: 14, // neighbours
  PA: 15, // path
}

const statics_to_obj = {
  11: "queue",
  12: "visited",
  13: "current_YX",
  14: "neighbours",
  15: "path"
}


myUI.run_steps = function(steps_arr){

  steps_arr.forEach(step=>{
    step.forEach(action=>{
      if(action[0]==STATIC.DC){
        let canvas = action[1];
        myUI.canvases[statics_to_obj[canvas]].draw_canvas(action[2], action[3], action[4]);
      }
      else if(action[0]==STATIC.EC){
        myUI.canvases[statics_to_obj[action[1]]].erase_canvas();
      }
      else if(action[0]==STATIC.DP){
        myUI.canvases[statics_to_obj[action[1]]].draw_pixel([action[2], action[3]]);
      }
      else if(action[0]==STATIC.EP){
        myUI.canvases[statics_to_obj[action[1]]].erase_pixel([action[2], action[3]]);
      }
    });
  });
  /*
  steps_arr = [
    each step: 
    [
      each action
      UInt8Array( (5)
        [action_type,]
      );
    ]
  ]
  */
}

