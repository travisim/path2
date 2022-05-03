class UIStep{
  /*
  Actions
  - `dc`, draw canvas
  - `ec`, erase canvas
  - `dp`, draw pixel
  - `ec`, erase pixel
  - `ia`, infopane add
  - `ie`, infopane erase
  */


  constructor(){
    this.actions = [];
    this.inverse = [];
  }

  add_action(){
    this.actions.push(Array.from(arguments));
  }

  add_inverse(){
    this.inverse.push(Array.from(arguments));
  }

  run(inverse = false){
    if(inverse){
      var items = this.inverse;
    }
    else{
      var items = this.actions;
    }

    items.forEach(item=>{
      let command = item[0];
      //console.log(command);
      let args = item.slice(1);
      if(command==`dc`){
        myUI.canvases[args[0]].draw_canvas(args[1], args[2], args[3]);
      }
      else if(command==`ec`){
        myUI.canvases[args[0]].erase_canvas();
      }
      else if(command==`dp`){
        myUI.canvases[args[0]].draw_pixel(args[1]);
      }
      else if(command==`ep`){
        myUI.canvases[args[0]].erase_pixel(args[1]);
      }
    });
  }
}

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

