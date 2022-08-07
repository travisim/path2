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
  "DICRF", // draw infocurrent foreward
  "DICRB", // draw infocurrent backwards
  "DIM",
  "DIT",
  "EIM",
  "EIT",
  "InTopTemp",
  "InTop",
  "OutTop",
  "InBottom",
  "Sort",
  "Einfomap",
  "OutLastAddedTable",
 
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
  "IT" //info table
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
        if(myUI.testing)
          console.log(step);
        while(i<step.length){
          let j=i+1;
          while(j<step.length){
            if(Number.isInteger(step[j]) && step[j]&1) break;
            ++j;
          }
          if(myUI.testing) console.log(i,j);
          let [command, dest, y, x, parentY, parentX, colorIndex, stepNo, arrowIndex, gCost, hCost] = GridPathFinder.unpack_action(step.slice(i, j));
          if(myUI.testing) console.log([STATIC_COMMANDS[command], STATIC_DESTS[dest], y, x, parentY, parentX, stepIndex, arrowIndex, gCost, hCost]);
          if(gCost!==undefined && hCost!==undefined) var fCost=(gCost+hCost);
console.log("cmd",STATIC_COMMANDS[command],"f",fCost,"g",gCost,"h",hCost);
          /* OLD */

          /*let [command, dest, y, x, parent_y, parent_x, parent_exists, arrow_index, color_index] = GridPathFinder.unpack_action(step[i]);
          
          if(parent_exists){
            if(myUI.testing){
              console.log("parent exists");
            }
            var g_cost = step[i+1].toPrecision(5);
            var h_cost = step[i+2].toPrecision(5);
            var stepNo = step[i+3];
            var f_cost = (step[i+1]+step[i+2]).toPrecision(5);
            if(g_cost == null || h_cost == null ) f_cost = null; 
            i+=2;
          }
          if(myUI.testing) console.log([STATIC_COMMANDS[command], STATIC_DESTS[dest], y, x, parent_y, parent_x, parent_exists, arrow_index, color_index]);/* */

          /* OLD */
          /*try{  
            console.log(myUI.animation.step,"step");
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
              myUI.arrow.elems[arrow_index].classList.remove("hidden");
              myUI.arrow.elems[arrow_index].style.fill = myUI.arrow.colors[color_index];
            }
            else if(command==STATIC.EA){
              // erase arrow
              myUI.arrow.elems[arrow_index].classList.add("hidden");
            }
            if (myUI.planners[myUI.planner_choice] == BFS || myUI.planners[myUI.planner_choice] == DFS){
             
            }
            else if (myUI.planners[myUI.planner_choice] == Dijkstra){
              
            }
            else if (myUI.planners[myUI.planner_choice] == A_star){
             if(dest==STATIC.CR && command == STATIC.EP ){//record  "visiters" in 2d array
  	            myUI.InfoMap.recordErasedVisited(x,y);            	            
  	          }
  	          if(dest== STATIC.QU && command == STATIC.EP ){//record  "visiters" in 2d array
  	            myUI.InfoMap.recordErasedQueue(x,y);
  	          }
              if(command == STATIC.DICRF && dest==STATIC.ICR){//draw "current_YX",
                myUI.InfoMap.reset();
                myUI.InfoMap.drawObstacle(x,y);
  	            myUI.InfoMap.drawOutOfBound(x,y);
                myUI.InfoMap.drawVisited(x,y);
  	            myUI.InfoMap.drawQueue(x,y);
  	            myUI.InfoCurrent.DrawCurrent(x,y);
                //if (slides.length >= 1) myUI.InfoTable.recordLastStepNo(slides[0].rows[0].cells[0].firstChild.nodeValue);  
  
  	          }
              else if(command == STATIC.DICRB && dest==STATIC.ICR){//draw "current_YX",
                myUI.InfoMap.reset();
                myUI.InfoMap.drawObstacle(x,y);
  	            myUI.InfoMap.drawOutOfBound(x,y);
                myUI.InfoMap.drawVisited(x,y);
  	            myUI.InfoMap.drawQueue(x,y);
  	            myUI.InfoCurrent.DrawCurrent(x,y);
                
  
  	          }
              
  	          //to draw neighbours
  	          else if(command == STATIC.DIM){
  	            myUI.InfoNWSE[statics_to_obj[dest]].drawOneNeighbour(f_cost,g_cost,h_cost);
             
                
  	          }
            
              else if(command == STATIC.InTop && dest==STATIC.DIT){
                myUI.InfoTable.InTop(x,y,parent_x,parent_y,f_cost,g_cost,h_cost,stepNo);                
  	          }
              else if(command == STATIC.OutTop && dest==STATIC.DIT){
                myUI.InfoTable.OutTop();             
  	          }
              else if(command == STATIC.Sort){
                if (slides.length >= 2){
                  myUI.InfoTable.Sort(); // emulats insert at based on F cost
                }
  	          }
  	        	//to erase neighbours
  	          else if(command == STATIC.EIM ){
  	            myUI.InfoNWSE[statics_to_obj[dest]].resetOne();
            
                myUI.InfoTable.removeSlidebById((stepNo+1).toString());
  	          }
            }
	          if(dest==STATIC.CR && command == STATIC.DP ){//record  "visiters" in 2d array
	            myUI.InfoMap.recordDrawnVisited(x,y);            	            
	          }
	          if(dest== STATIC.QU && command == STATIC.DP ){//record  "visiters" in 2d array
	            myUI.InfoMap.recordDrawnQueue(x,y);
	          }
          }catch(e){
            console.log(STATIC_COMMANDS[command], STATIC_DESTS[dest], "failed");
            console.log(i, step);
          }/* */

          
            console.log(myUI.animation.step,"step");
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
              myUI.arrow.elems[arrowIndex].classList.remove("hidden");
              myUI.arrow.elems[arrowIndex].style.fill = myUI.arrow.colors[colorIndex];
            }
            else if(command==STATIC.EA){
              // erase arrow
              myUI.arrow.elems[arrowIndex].classList.add("hidden");
            }
           
             if(dest==STATIC.CR && command == STATIC.EP ){//record  "visiters" in 2d array
  	            myUI.InfoMap.recordErasedVisited(x,y);            	            
  	          }
  	          if(dest== STATIC.QU && command == STATIC.EP ){//record  "visiters" in 2d array
  	            myUI.InfoMap.recordErasedQueue(x,y);
  	          }
              if(command == STATIC.DICRF && dest==STATIC.ICR){//draw "current_YX",
                myUI.InfoMap.reset();
                myUI.InfoMap.drawObstacle(x,y);
  	            myUI.InfoMap.drawOutOfBound(x,y);
                myUI.InfoMap.drawVisited(x,y);
  	            myUI.InfoMap.drawQueue(x,y);
  	            myUI.InfoCurrent.DrawCurrent(x,y);
                //if (slides.length >= 1) myUI.InfoTable.recordLastStepNo(slides[0].rows[0].cells[0].firstChild.nodeValue);  
  
  	          }
              else if(command == STATIC.DICRB && dest==STATIC.ICR){//draw "current_YX",
                myUI.InfoMap.reset();
                myUI.InfoMap.drawObstacle(x,y);
  	            myUI.InfoMap.drawOutOfBound(x,y);
                myUI.InfoMap.drawVisited(x,y);
  	            myUI.InfoMap.drawQueue(x,y);
  	            myUI.InfoCurrent.DrawCurrent(x,y);
                
  
  	          }
              
  	          //to draw neighbours
  	          else if(command == STATIC.DIM){
                console.log(dest);
  	            myUI.InfoNWSE[statics_to_obj[dest]].drawOneNeighbour(fCost.toPrecision(5),gCost.toPrecision(5),hCost.toPrecision(5));
             
                
  	          }
            
              else if(command == STATIC.InTop && dest==STATIC.DIT){
                myUI.InfoTable.inTop(stepNo,[x+", "+y,parentX+", "+parentY,fCost.toPrecision(5),gCost.toPrecision(5),hCost.toPrecision(5)]);                
  	          }
              else if(command == STATIC.OutTop && dest==STATIC.DIT){
                myUI.InfoTable.outTop();             
  	          }
              else if(command == STATIC.Sort){
                if (myUI.InfoTable.slides.length >= 2){
                  myUI.InfoTable.sort(); // emulats insert at based on F cost
                }
  	          }
  	        	//to erase neighbours
  	          else if(command == STATIC.EIM ){
  	            myUI.InfoNWSE[statics_to_obj[dest]].resetOne();
                myUI.InfoTable.removeSlidebById((stepNo+1).toString());
  	          }
            
	          if(dest==STATIC.CR && command == STATIC.DP ){//record  "visiters" in 2d array
	            myUI.InfoMap.recordDrawnVisited(x,y);            	            
	          }
	          if(dest== STATIC.QU && command == STATIC.DP ){//record  "visiters" in 2d array
	            myUI.InfoMap.recordDrawnQueue(x,y);
	          }

            try{
          }catch(e){
            console.log(e);
            console.log(STATIC_COMMANDS[command], STATIC_DESTS[dest], "failed");
            console.log(step[i], i, step);
          }
          
          /*++i;*/
          i=j;
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

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

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



