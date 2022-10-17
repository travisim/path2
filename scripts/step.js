const STATIC_COMMANDS = [
  /* rest of the items are dynamics commands/identifiers */
  "DSP",
  "SP",
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

myUI.get_step = function(anim_step, step_direction="fwd"){
	if(step_direction!="fwd") anim_step++;
	let idx = myUI.step_data[step_direction].map[anim_step];
	let nxIdx = myUI.step_data[step_direction].map[anim_step+1];
  return myUI.step_data[step_direction].data.slice(idx, nxIdx);
}


myUI.run_steps = function(num_steps, step_direction="fwd"){
  while(num_steps--){
    if(step_direction!="fwd" && myUI.animation.step>-1)--myUI.animation.step;
    else if(step_direction=="fwd" && myUI.animation.step<myUI.animation.max_step) ++myUI.animation.step;
    else return;

    let step = myUI.get_step(myUI.animation.step, step_direction);

    console.log(step, 'step');
    let i=0;
    while(i<step.length){
      // this is implementation specific for compressed actions
      let j=i+1;
      while(j<step.length && !(Number.isInteger(step[j]) && step[j]&1))
        ++j;
      // [i,j) is the action length
			
      let [command, dest, x, y, parentX, parentY, colorIndex, stepNo, arrowIndex, gCost, hCost, pseudoCodeRow,infoTableRowIndex, cellVal] = GridPathFinder.unpackAction(step.slice(i, j));
      if(gCost!==undefined && hCost!==undefined) var fCost=(gCost+hCost).toPrecision(5);
      console.log("command", STATIC_COMMANDS[command], "dest", STATIC_DESTS[dest], "x", x, "y", y, "parentX", parentX, "parentY", parentY, "colorIndex", colorIndex, "stepNo", stepNo, "arrowIndex", arrowIndex, "fCost", fCost, "gCost", gCost, "hCost", hCost, "pseudoCodeRow", pseudoCodeRow, "infoTableRowIndex", infoTableRowIndex, "cellVal", cellVal);
      //console.log(step.slice(i,j));
      try{
      if(command==STATIC.DSP){
        myUI.canvases[statics_to_obj[dest]].erase_canvas();
        if(cellVal===undefined) cellVal = 1;
        myUI.canvases[statics_to_obj[dest]].draw_pixel([x,y], false, cellVal);
      }
      
      else if(command==STATIC.EC){
        myUI.canvases[statics_to_obj[dest]].erase_canvas();
      }
      else if(command==STATIC.DP || command==STATIC.SP){
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
        myUI.InfoTables[statics_to_obj[dest]].insertRowAtIndex(infoTableRowIndex, stepNo, [x+", "+y,parentX+", "+parentY, fCost, gCost, hCost]); 
      }
      else if(command==STATIC.EraseRowAtIndex){
        myUI.InfoTables[statics_to_obj[dest]].eraseRowAtIndex(infoTableRowIndex); 
      }
      if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowPri ){
        myUI.PseudoCode.highlightPri(pseudoCodeRow);
      }  
      if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowSec ){
        myUI.PseudoCode.highlightSec(pseudoCodeRow);
      }  /* */  
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
	if(step_direction=="fwd"){
		var numSteps = myUI.step_data.fwd.combined[myUI.animation.step+1]; 
	}
	else{
		var numSteps = myUI.step_data.bck.combined[myUI.animation.step]; 
	}
  while(numSteps--) myUI.run_steps(1, step_direction);
}



myUI.generateReverseSteps = function(){
	let steps = myUI.step_data.fwd.data,
		indexMap = myUI.step_data.fwd.map, 
		combinedMap = myUI.step_data.fwd.combined;
	
  myUI.step_data.bck.data = [];
  myUI.step_data.bck.map = [];
	myUI.step_data.bck.combined = [];

	let stepCnt=0;
	let revCombinedCnt = 0;
  let mem = {infoTable:{}, canvasCoords:{}, drawSinglePixel:undefined, fullCanvas:{}, arrowColor:{}, bounds:{}};
  
  while(stepCnt<indexMap.length){
    let step = steps.slice(indexMap[stepCnt], indexMap[stepCnt+1]);
    let i=0;
    myUI.step_data.bck.map.push(myUI.step_data.bck.data.length);
    while(i<step.length){

			// this is implementation specific for compressed actions
      let j=i+1;
      while(j<step.length && !(Number.isInteger(step[j]) && step[j]&1))
        ++j;
      // [i,j) is the action length
			
      let [command, dest, x, y, parentX, parentY, colorIndex, stepNo, arrowIndex, gCost, hCost, pseudoCodeRow, infoTableRowIndex, cellVal] = GridPathFinder.unpackAction(step.slice(i, j));

      let action = [];
      var includeAction = true;

      // saving minmax
      if(cellVal!==undefined && myUI.canvases[statics_to_obj[dest]].valType=="float"){
        if(mem.bounds[dest]===undefined) mem.bounds[dest] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
        if(myUI.canvases[statics_to_obj[dest]].minVal==null) mem.bounds[dest][0] = Math.min(mem.bounds[dest][0], cellVal);
        if(myUI.canvases[statics_to_obj[dest]].maxVal==null) mem.bounds[dest][1] = Math.max(mem.bounds[dest][1], cellVal);
      }

      if(command==STATIC.DSP){
        if(mem.drawSinglePixel!==undefined) action = GridPathFinder.packAction({command: STATIC.DSP, dest: dest, nodeCoord: mem.drawSinglePixel, cellVal: 1});
				else action = GridPathFinder.packAction({command: STATIC.EC, dest: dest});
        mem.drawSinglePixel = [x,y];
      }
      else if(command==STATIC.SP){
        try{
          if(mem.fullCanvas[dest]===undefined) mem.fullCanvas[dest] = deep_copy_matrix(myUI.canvases[statics_to_obj[dest]].canvas_cache);
          action = GridPathFinder.packAction({command: STATIC.SP, dest: dest, nodeCoord: [x,y], cellVal: mem.fullCanvas[dest][x][y]});
          mem.fullCanvas[dest][x][y] = cellVal;
        }
        catch(e){
          console.log(statics_to_obj[dest]);
        }
      }/* */
      else if(command==STATIC.DP){
        if(cellVal===undefined) cellVal = 1;
        if(!(dest in mem.canvasCoords)) mem.canvasCoords[dest] = [];
        for(const coord of mem.canvasCoords[dest]){
          if(coord===undefined) continue;
          if(coord[0]==x && coord[1]==y){
            includeAction = false;
          }
        }
        if(includeAction){
          action = GridPathFinder.packAction({command: STATIC.EP, dest: dest, nodeCoord: [x,y], cellVal: cellVal});
          mem.canvasCoords[dest].push([x,y]);
        }
      }
      else if(command==STATIC.EP){
        action = GridPathFinder.packAction({command: STATIC.DP, dest: dest, nodeCoord: [x,y], cellVal: 1});
        if(!(dest in mem.canvasCoords)) mem.canvasCoords[dest] = [];
        let i;
        for(i=0;i<mem.canvasCoords[dest].length;++i){
          let coord = mem.canvasCoords[dest][i];
          if(coord===undefined) continue;
          if(coord[0]==x && coord[1]==y) break;
        }
        delete mem.canvasCoords[dest][i];
      }
      else if(command==STATIC.EC){
        action = [];
        if(!(dest in mem.canvasCoords)) mem.canvasCoords[dest] = [];
        mem.canvasCoords[dest].forEach(nodeCoord=>{
          let subAction = GridPathFinder.packAction({command: STATIC.DP, dest: dest, nodeCoord: nodeCoord});
          Array.prototype.push.apply(action, subAction);
        });
        mem.canvasCoords[dest] = [];
      }
      else if(command==STATIC.INC_P){
        action = GridPathFinder.packAction({command: STATIC.DEC_P, dest: dest, nodeCoord: [x,y]});
      }
      else if(command==STATIC.DEC_P){
        action = GridPathFinder.packAction({command: STATIC.INC_P, dest: dest, nodeCoord: [x,y]});
      }
      else if(command==STATIC.DA){
				if(arrowIndex in mem.arrowColor){
					action = GridPathFinder.packAction({command: STATIC.DA, arrowIndex: arrowIndex, colorIndex: mem.arrowColor[arrowIndex]});
				}
        else
					action = GridPathFinder.packAction({command: STATIC.EA, arrowIndex: arrowIndex});
				if(colorIndex===undefined) colorIndex = 0;
				mem.arrowColor[arrowIndex] = colorIndex;
      }
      else if(command==STATIC.EA){
        action = GridPathFinder.packAction({command: STATIC.DA, arrowIndex: arrowIndex, colorIndex: colorIndex});
				delete mem.arrowColor[arrowIndex];
      }
      else if(command==STATIC.InsertRowAtIndex){
        mem.infoTable[dest] = {nodeCoord: [x,y], stepIndex: stepNo, hCost: hCost, gCost: gCost, parentCoord: [parentX, parentY]};
        action = GridPathFinder.packAction({command: STATIC.EraseRowAtIndex, dest: dest, infoTableRowIndex: infoTableRowIndex});
      }
      else if(command==STATIC.EraseRowAtIndex){
        action = GridPathFinder.packAction({command: STATIC.InsertRowAtIndex, dest: dest, nodeCoord: mem.infoTable[dest].nodeCoord, stepIndex: mem.infoTable[dest].stepIndex, infoTableRowIndex: infoTableRowIndex, hCost: mem.infoTable[dest].hCost, gCost: mem.infoTable[dest].gCost, parentCoord: mem.infoTable[dest].parentCoord});
      }
      else if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowPri ){
        if(mem.pseudoCodeRowPri===undefined) mem.pseudoCodeRowPri = -1;
				// -1 resets all pseudocoderows
				action = GridPathFinder.packAction({command: STATIC.HighlightPseudoCodeRowPri, dest: STATIC.PC, pseudoCodeRow: mem.pseudoCodeRowPri});
        mem.pseudoCodeRowPri = pseudoCodeRow;
      }  
      else if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowSec ){
        if(mem.pseudoCodeRowSec!==undefined) action = GridPathFinder.packAction({command: STATIC.HighlightPseudoCodeRowSec, dest: STATIC.PC, pseudoCodeRow: mem.pseudoCodeRowSec});
        // else reset all pseudocodeSec
        mem.pseudoCodeRowSec = pseudoCodeRow;
      } 
      // add more here
      if(includeAction)
        Array.prototype.push.apply(myUI.step_data.bck.data, action);
      i=j;
    }
		revCombinedCnt++;
		myUI.step_data.bck.combined.push(revCombinedCnt);
		if(combinedMap[stepCnt]==1) revCombinedCnt = 0;
		++stepCnt;
  }
  for(const [dest, bounds] of Object.entries(mem.bounds)){
    if(myUI.canvases[statics_to_obj[dest]].minVal==null) myUI.canvases[statics_to_obj[dest]].setValueBounds("min", bounds[0]);
    if(myUI.canvases[statics_to_obj[dest]].maxVal==null) myUI.canvases[statics_to_obj[dest]].setValueBounds("max", bounds[1]);
  }
  myUI.mem = mem;
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