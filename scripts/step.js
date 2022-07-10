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
  "DA", // draw arrow (arrow index) [colour index]
  "EA" , // erase arrow (arrow index)
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
          let [command, dest, y, x, parent_y, parent_x, parent_exists, arrow_index, arrow_color] = GridPathFinder.unpack_action(step[i]);
          if(parent_exists){
            console.log("parent exists");
            var g_cost = step[i+1];
            var h_cost = step[i+2];
            var f_cost = (parseInt(g_cost) + parseInt(h_cost)).toPrecision(3); // null + null = 0 this causes f_cost to be 0
         //  var f_cost = f_cost.toPrecision(3);
            if(g_cost == null || h_cost == null ) f_cost = null; 
            i+=2;
          }
          console.log([command, dest, y, x, parent_y, parent_x, g_cost, h_cost, arrow_index, arrow_color]);
          
          
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
              /*let fromyx = myUI.arrow.coords[myUI.arrow.step*2];
              let toyx = myUI.arrow.coords[myUI.arrow.step*2+1];
              myUI.draw_arrow(fromyx, toyx, false, 0, false);/* */
              myUI.arrow.elems[arrow_index].classList.remove("hidden");
              myUI.arrow.elems[arrow_index].style.fill = myUI.arrow.colors[arrow_color];
            }
            else if(command==STATIC.EA){
              // erase arrow
              myUI.arrow.elems[arrow_index].classList.add("hidden");
              /*let data = myUI.arrow.data[myUI.arrow.step];
              myUI.arrow.ctx.putImageData(...data);/* */
            }
	         
            
               
            else if(dest==STATIC.ICR ){//draw "current_YX",
	            
              myUI.InfoMap.reset();
              myUI.InfoMap.drawObstacle(x,y);
	            myUI.InfoMap.drawOutOfBound(x,y);
              myUI.InfoMap.drawVisited(x,y);
	            myUI.InfoMap.drawQueue(x,y);
              myUI.InfoTable.OutTop();  
	            myUI.InfoCurrent.DrawCurrent(x,y);

	          }
	         	//to draw neighbours
	          else if(command == STATIC.DI ){
	            myUI.InfoNWSE[statics_to_obj[dest]].drawOneNeighbour(f_cost,g_cost,h_cost);
                
             myUI.InfoTable.InTop(x,y,parent_x,parent_y,f_cost,g_cost,h_cost);
             if (slides.length >= 2){
                myUI.InfoTable.Sort();
              }
              
            
	          }
	        	//to erase neighbours
	          else if(command == STATIC.EI ){
	            myUI.InfoNWSE[statics_to_obj[dest]].resetOne();
              myUI.InfoTable.removelastSlidebById();
	          }
	          
	
	
	          if(dest==STATIC.CR && command == STATIC.DP ){//record  "visiters" in 2d array
	            myUI.InfoMap.recordDrawnVisited(x,y);            	            
	          }
	          if(dest== STATIC.QU && command == STATIC.DP ){//record  "visiters" in 2d array
	            myUI.InfoMap.recordDrawnQueue(x,y);
	          }
            try{
	         
          }catch(e){
            console.log(command, dest, "failed");
            console.log(i, step);
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



//start of js for info table

var slides = document.getElementsByClassName("slide");