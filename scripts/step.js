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
  "DICR", // draw infocurrent 
  "DIM",
  "DIT",
  "EIM",
  "EIT",
  "InTop",
  "OutTop",
  "InBottom",
  "OutBottom",
  "Sort",
  "RemoveRowByID",
  "HighlightPseudoCodeRowPri", //highlight Pseudo
  "UnhighlightPseudoCodeRowPri", // unhighlight Pseudo
  "HighlightPseudoCodeRowSec", //highlight Pseudo
  "UnhighlightPseudoCodeRowSec" // unhighlight Pseudo
  
 
];

const STATIC_DESTS = [
  /* index 0 to index 4 are canvas ids, must be the same as statics_to_obj */
  "QU", // queue
  "VI", // visited
  "CR", // current
  "NB", // neighbors
  "PA", // path
  "IN", // info NWSE 5
  "INW",
  "IW",
  "ISW",
  "IS",
  "ISE", //10
  "IE",
  "INE",
  "ICR", //info current path
  "IT", //info table
  "DT",
  "PC" // Pseudo Code
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
  2: "current_XY",
  3: "neighbors",
  4: "path",
  5: "N",
  6: "NW",
  7: "W",
  8: "SW",
  9: "S",
  10:"SE",
  11:"E",
  12:"NE",
  15:"dotted",
  16:"pseudocode"
}


myUI.run_steps = function(num_steps, step_direction="fwd", combined=false){
  if(num_steps--){
    if(step_direction!="fwd" && myUI.animation.step>-1)--myUI.animation.step;
    else if(step_direction=="fwd" && myUI.animation.step<myUI.animation.max_step) ++myUI.animation.step;
    else return;

    let step, num;
    if(combined) [step, num] = myUI.planner.get_combined_step(myUI.animation.step, step_direction);
    else [step, num] = myUI.planner.get_step(myUI.animation.step, step_direction);

    console.log("NUM IS: ", num);
    if(num>1){
      if(step_direction=="fwd") myUI.animation.step+=num-1;
      else myUI.animation.step-=num-1;
    }
    console.log(step, 'step');
    let i=0;
    while(i<step.length){
      let j=i+1;
      while(j<step.length){
        if(Number.isInteger(step[j]) && step[j]&1) break;
        ++j;
      }
      if(myUI.testing) console.log(i,j);
      let [command, dest, x, y, parentX, parentY, colorIndex, stepNo, arrowIndex, gCost_str, hCost_str, pseudoCodeRow] = GridPathFinder.unpackAction(step.slice(i, j));
      var gCost = Number(gCost_str);
      var hCost = Number(hCost_str);
        if(dest == "IT") console.log(stepNo," stepNo");  
      if(myUI.testing) console.log([STATIC_COMMANDS[command], STATIC_DESTS[dest], x, y, parentX, parentY, stepNo, arrowIndex, gCost, hCost]);
      if(gCost!==undefined && hCost!==undefined) var fCost=(gCost+hCost).toPrecision(5);
      console.log("cmd",STATIC_COMMANDS[command],"dest", statics_to_obj[dest],"x", x, "y", y, "f",fCost,"g",gCost,"h",hCost,parentX,parentY,'stepno', stepNo,'pseudoCodeRow', pseudoCodeRow);
      if(command==STATIC.EC){
        myUI.canvases[statics_to_obj[dest]].erase_canvas();
      }
      else if(command==STATIC.DP){
        myUI.canvases[statics_to_obj[dest]].draw_pixel([x,y]);
      }
      else if(command==STATIC.EP){
          myUI.canvases[statics_to_obj[dest]].erase_pixel([x,y]);
      }
      else if(command==STATIC.INC_P){
          myUI.canvases[statics_to_obj[dest]].change_pixel([x,y], "inc");
        
      }
      else if(command==STATIC.DEC_P){
          myUI.canvases[statics_to_obj[dest]].change_pixel([x,y], "dec");
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
      if(command == STATIC.DICR   && dest==STATIC.ICR){//draw "current_XY",
        myUI.InfoMap.reset();
        myUI.InfoMap.drawObstacle(x,y);
        myUI.InfoMap.drawOutOfBound(x,y);
        myUI.InfoMap.drawVisited(x,y);
        myUI.InfoMap.drawQueue(x,y);
        myUI.InfoCurrent.DrawCurrent(x,y);
      }

      
      //to draw neighbors
      else if(command == STATIC.DIM){
  
        myUI.InfoNWSE[statics_to_obj[dest]].drawOneNeighbour(fCost,gCost,hCost);
      
        
      }
    
      else if(command == STATIC.InTop && dest==STATIC.IT){
        myUI.InfoTable.inTop(stepNo,[stepNo,x+", "+y,parentX+", "+parentY,fCost,gCost,hCost]);                
      }
      else if(command == STATIC.InBottom && dest==STATIC.IT){
        myUI.InfoTable.inBottom(stepNo,[stepNo,x+", "+y,parentX+", "+parentY,fCost,gCost,hCost]);                
      }
      else if(command == STATIC.OutTop && dest==STATIC.IT){
        myUI.InfoTable.outTop();             
      }
      else if(command == STATIC.OutBottom && dest==STATIC.IT){
        myUI.InfoTable.outBottom();             
      }
      else if(command == STATIC.Sort){
        if (myUI.InfoTable.rows.length >= 2){
          myUI.InfoTable.sort(); // emulats insert at based on F cost
        }
      }
      //to erase neighbors
      else if(command == STATIC.EIM ){
        myUI.InfoNWSE[statics_to_obj[dest]].resetOne();
    
      }
      
      if(dest==STATIC.CR && command == STATIC.DP ){//record  "visiters" in 2d array
        myUI.InfoMap.recordDrawnVisited(x,y);            	            
      }
      if(dest == STATIC.QU && command == STATIC.DP ){//record  "visiters" in 2d array
        myUI.InfoMap.recordDrawnQueue(x,y);
      }
      if(dest == STATIC.IT && command == STATIC.RemoveRowByID ){//record  "visiters" in 2d array
        myUI.InfoTable.removeRowById(stepNo);
      }  
      if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowPri ){//record  "visiters" in 2d array
        myUI.PseudoCode.highlightPri(pseudoCodeRow);
      }  
      if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowSec ){//record  "visiters" in 2d array
        myUI.PseudoCode.highlightSec(pseudoCodeRow);
      }  
      try{
      }catch(e){
        console.log(e);
        console.log(STATIC_COMMANDS[command], STATIC_DESTS[dest], "failed");
        console.log(step.slice(i, j));
        debugger;
      }
      
      /*++i;*/
      i=j;
    }
  }
}

/*
steps_arr = [
  each step: 
  [
    each action:
    [
      each param
    ]
  ]
]
*/

myUI.run_combined_step = function(step_direction="fwd"){
  this.run_steps(1, step_direction, true);
  return;
  let tmp_step = myUI.animation.step, start_step = myUI.animation.step;
  
  if(step_direction=="fwd") ++tmp_step;
  search_for_simple();
  function search_for_simple(){
    if(step_direction!="fwd"){
      myUI.planner.get_step(tmp_step, "bck").then(step=>{
        let first_command = myUI.planner.constructor.unpackAction(step)
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



myUI.generateReverseSteps = function(steps, indexMap){
  let stepNo=0;
  let reverseSteps = [];
  let reverseMap = [];
  while(stepNo<indexMap.length){
    let step = steps.slice(indexMap[stepNo], indexMap[stepNo+1]);
    let i=0;
    reverseMap.push(reverseSteps.size());
    while(i<step.length){
      let j=i+1;
      while(j<step.length){
        // this is implementation specific for compressed actions
        if(Number.isInteger(step[j]) && step[j]&1) break;
        ++j;
      }
      // [i,j) is the action length
      let [command, dest, x, y, parentX, parentY, colorIndex, stepNo, arrowIndex, gCost_str, hCost_str, pseudoCodeRow] = GridPathFinder.unpackAction(step.slice(i, j));
      var gCost = Number(gCost_str);
      var hCost = Number(hCost_str);

      let action;
      if(command==STATIC.DP){
        action = GridPathFinder.packAction({command: STATIC.EP, dest: dest, nodeCoord: [x,y]});
      }
      else if(command==STATIC.EP){
        action = GridPathFinder.packAction({command: STATIC.DP, dest: dest, nodeCoord: [x,y]});
      }
      else if(command==STATIC.INC_P){
        action = GridPathFinder.packAction({command: STATIC.DEC_P, dest: dest, nodeCoord: [x,y]});
      }
      else if(command==STATIC.DEC_P){
        action = GridPathFinder.packAction({command: STATIC.INC_P, dest: dest, nodeCoord: [x,y]});
      }
      else if(command==STATIC.DA){
        action = GridPathFinder.packAction({command: STATIC.EA, arrowIndex: arrowIndex, colorIndex: colorIndex});
      }
      else if(command==STATIC.EA){
        action = GridPathFinder.packAction({command: STATIC.DA, arrowIndex: arrowIndex, colorIndex: colorIndex});
      }
      // add more here
      Array.prototype.push.apply(reverseSteps, action);
      j=i;
    }
    ++stepNo;
  }
}