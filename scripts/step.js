const STATIC_COMMANDS = [
  /* rest of the items are dynamics commands/identifiers */
  "EC", // erase canvas
  "DP", // draw pixel
  "EP", // erase pixel
  "INC_P", // increment pixel
  "DEC_P", // increment pixel
  "DA", // draw arrow (arrow index) [colour index]
  "EA" , // erase arrow (arrow index)
  "InsertRowAtIndex", // dest, rowIndex
  "EraseRowAtIndex", // dest, rowIndex
  "HighlightPseudoCodeRowPri", //highlight Pseudo
  "HighlightPseudoCodeRowSec", //highlight Pseudo
  "UnhighlightPseudoCodeRowSec" // unhighlight Pseudo
];

const STATIC_DESTS = [
  "PC", // Pseudo Code
  "QU", // queue
  "VI", // visited
  "CR", // current
  "NB", // neighbors
  "PA", // path
  "DT",
  "FCanvas",
  "GCanvas",
  "HCanvas",
  "ITQueue", //info table
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
  0: "pseudocode",
  1: "queue",
  2: "visited",
  3: "current_XY",
  4: "neighbors",
  5: "path",
  6: "dotted",
  7: "fCost",
  8: "gCost",
  9: "hCost",
  10: "ITQueue"
}


myUI.run_steps = function(num_steps, step_direction="fwd"){
  while(num_steps--){
    if(step_direction!="fwd" && myUI.animation.step>-1)--myUI.animation.step;
    else if(step_direction=="fwd" && myUI.animation.step<myUI.animation.max_step) ++myUI.animation.step;
    else return;

    let step = myUI.planner.get_step(myUI.animation.step, step_direction);

    console.log(step, 'step');
    let i=0;
    while(i<step.length){
      let j=i+1;
      while(j<step.length){
        if(Number.isInteger(step[j]) && step[j]&1) break;
        ++j;
      }
      if(myUI.testing) console.log(i,j);
      let [command, dest, x, y, parentX, parentY, colorIndex, stepNo, arrowIndex, gCost_str, hCost_str, pseudoCodeRow,infoTableRowIndex, cellVal] = GridPathFinder.unpackAction(step.slice(i, j));
      var gCost = Number(gCost_str);
      var hCost = Number(hCost_str);
      if(dest == "IT") console.log(stepNo," stepNo");  
      if(myUI.testing) console.log([STATIC_COMMANDS[command], STATIC_DESTS[dest], x, y, parentX, parentY, stepNo, arrowIndex, gCost, hCost]);
      if(gCost!==undefined && hCost!==undefined) var fCost=(gCost+hCost).toPrecision(5);
      console.log("cmd",STATIC_COMMANDS[command],"dest", statics_to_obj[dest],"x", x, "y", y, "f",fCost,"g",gCost,"h",hCost,parentX,parentY,'stepno', stepNo,'pseudoCodeRow', pseudoCodeRow, 'infoRowIndex', infoTableRowIndex);
      console.log(step.slice(i,j));
    
      if(command==STATIC.EC){
        myUI.canvases[statics_to_obj[dest]].erase_canvas();
      }
      else if(command==STATIC.DP){
        if(cellVal===undefined) cellVal = 1;
        myUI.canvases[statics_to_obj[dest]].draw_pixel([x,y], false, cellVal);
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
      
      // INFOMAP
      if(dest==STATIC.CR && command==STATIC.DP){
        myUI.currentCoord = [x,y]; // record current when updated for infomap purposes
      }

      // INFOTABLE 
      if(command==STATIC.InsertRowAtIndex){
        console.log(dest);
        //debugger;
        myUI.InfoTables["ITQueue"].insertRowAtIndex(infoTableRowIndex, stepNo, [stepNo,x+", "+y,parentX+", "+parentY, fCost, gCost, hCost]); 
         // myUI.InfoTables["ITQueue"].insertRowAtIndex(0,"1",["1","ko","hi"]);
      }
      else if(command==STATIC.EraseRowAtIndex){
        // myUI.InfoTable.inBottom(stepNo,[stepNo,x+", "+y,parentX+", "+parentY,fCost,gCost,hCost]); 
      }
      
      if(command == STATIC.InTop && dest==STATIC.ITQueue){
        myUI.InfoTable.inTop(stepNo,[stepNo,x+", "+y,parentX+", "+parentY,fCost,gCost,hCost]);                
      }
      else if(command == STATIC.InBottom && dest==STATIC.ITQueue){
        myUI.InfoTable.inBottom(stepNo,[stepNo,x+", "+y,parentX+", "+parentY,fCost,gCost,hCost]);                
      }
      else if(command == STATIC.OutTop && dest==STATIC.ITQueue){
        myUI.InfoTable.outTop();             
      }
      else if(command == STATIC.OutBottom && dest==STATIC.ITQueue){
        myUI.InfoTable.outBottom();             
      }
      else if(command == STATIC.Sort){
        if (myUI.InfoTable.rows.length >= 2){
          myUI.InfoTable.sort(); // emulats insert at based on F cost
        }
      }/* */
      if(dest == STATIC.ITQueue && command == STATIC.RemoveRowByID ){
        myUI.InfoTable.removeRowById(stepNo);
      }
      if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowPri ){//record  "visiters" in 2d array
        myUI.PseudoCode.highlightPri(pseudoCodeRow);
      }  
      if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowSec ){//record  "visiters" in 2d array
        myUI.PseudoCode.highlightSec(pseudoCodeRow);
      }  /* */  
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
    myUI.updateInfoMap(...myUI.currentCoord);
    //myUI.updateInfoMap();
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
  let numSteps = myUI.planner.get_numsteps_2_combined(myUI.animation.step+1, step_direction);
  while(numSteps--) myUI.run_steps(1, step_direction);
}



myUI.generateReverseSteps = function(steps, indexMap){
  let stepNo=0;
  let reverseSteps = [];
  let reverseMap = [];

  let mem = {};

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
      let [command, dest, x, y, parentX, parentY, colorIndex, stepNo, arrowIndex, gCost_str, hCost_str, pseudoCodeRow, cellVal] = GridPathFinder.unpackAction(step.slice(i, j));
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
      else if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowPri ){
        if(mem.pseudoCodeRowPri!==undefined) action = GridPathFinder.packAction({command: STATIC.HighlightPseudoCodeRowPri, dest: STATIC.PC, pseudoCodeRow: mem.pseudoCodeRowPri});
        // else reset all pseudocodePri
        mem.pseudoCodeRowPri = pseudoCodeRow;
      }  
      else if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowSec ){
        if(mem.pseudoCodeRowSec!==undefined) action = GridPathFinder.packAction({command: STATIC.HighlightPseudoCodeRowSec, dest: STATIC.PC, pseudoCodeRow: mem.pseudoCodeRowSec});
        // else reset all pseudocodeSec
        mem.pseudoCodeRowSec = pseudoCodeRow;
      } 
      // add more here
      Array.prototype.push.apply(reverseSteps, action);
      j=i;
    }
    ++stepNo;
  }
}

myUI.updateInfoMap = function(x,y){
  /*
  1) clear info map
  */
  myUI.InfoMap.reset();
  /*
  2) update current position
  */
  myUI.InfoMap.drawObstacle(x,y);
  myUI.InfoMap.drawOutOfBound(x,y);
  myUI.InfoMap.drawVisited(x,y);
  myUI.InfoMap.drawQueue(x,y);
  myUI.InfoMap.drawNeighbors(x,y);
  myUI.InfoMap.drawFGH(x,y);
  myUI.InfoCurrent.DrawCurrent(x,y);
  
  
  // tbc
}