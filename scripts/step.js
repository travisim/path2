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
  "EraseAllRows", // dest, rowIndex
  "UpdateRowAtIndex", // dest, rowIndex
  "HighlightPseudoCodeRowPri", //highlight Pseudo
  "HighlightPseudoCodeRowSec", //highlight Pseudo
  "UnhighlightPseudoCodeRowSec", // unhighlight Pseudo
  "SetHighlightAtIndex",
  "DrawVertex",
  "DrawSingleVertex",
  "EraseVertex",
  "EraseAllVertex",
  "DrawEdge",
  "EraseEdge",
  "EraseAllEdge",
  "DrawDottedEdge",
  "DrawDottedVertex",
  "CreateStaticRow",
  "EditStaticRow"

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
  "ITNeighbors",
  "map",
  "ITStatistics",
  "neighboursRadius"
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
  3: "expanded",
  4: "neighbors",
  5: "path",
  6: "focused",
  7: "fCost",
  8: "gCost",
  9: "hCost",
  10: "ITQueue",
  11: "ITNeighbors",
  12: "map",
  13: "ITStatistics",
  14: "neighboursRadius"
}

myUI.get_step = function(anim_step, step_direction="fwd"){
  // wasm
  if(myUI.planner.constructor.wasm){
    return myUI.planner.getStep(anim_step);
  }
  // end of ++wasm
	if(step_direction!="fwd") anim_step++;
	let idx = myUI.step_data[step_direction].map[anim_step];
	let nxIdx = myUI.step_data[step_direction].map[anim_step+1];
  return myUI.step_data[step_direction].data.slice(idx, nxIdx);
}


myUI.run_steps = function(num_steps, step_direction){
  if(step_direction===undefined){
    if(myUI.animation.reversed) step_direction="bck";
    else step_direction="fwd";
  }
  while(num_steps--){
    if(step_direction!="fwd" && myUI.animation.step>-1)--myUI.animation.step;
    else if(step_direction=="fwd" && myUI.animation.step<myUI.animation.max_step) ++myUI.animation.step;
    else return;

    // wasm
    if(myUI.planner.constructor.wasm){
      if(step_direction!="fwd") ++myUI.animation.step;
    }
    // end of ++wasm

    let step = myUI.get_step(myUI.animation.step, step_direction);

    // wasm
    if(myUI.planner.constructor.wasm){
      if(step_direction!="fwd") --myUI.animation.step;
      let actions = step_direction == "fwd" ? step["fwdActions"] : step["revActions"];
      let i = step_direction == "fwd" ? 0 : actions.size() - 1; // reverse iteration for reverse actions
      while(i >= 0 && i < actions.size()){
        let action = actions.get(i);
        let command = action.command;
        let dest = action.dest == -1 ? undefined : action.dest;
        let x = action.nodeCoord.x == -1 ? undefined : action.nodeCoord.x;
        let y = action.nodeCoord.y == -1 ? undefined : action.nodeCoord.y;
        let colorIndex = action.colorIndex == -1 ? undefined : action.colorIndex;
        let arrowIndex = action.arrowIndex == -1 ? undefined : action.arrowIndex;
        let pseudoCodeRow = action.pseudoCodeRow == -1 ? undefined : action.pseudoCodeRow;
        let infoTableRowIndex = action.infoTableRowIndex == 0 ? undefined : action.infoTableRowIndex;
        let infoTableRowData = action.infoTableRowData.size() == 0 ? undefined : [...vector_values(action.infoTableRowData)];
        let cellVal = action.cellVal == -1 ? undefined : action.cellVal;
        let endX = action.endCoord.x == -1 ? undefined : action.endCoord.x;
        let endY = action.endCoord.y == -1 ? undefined : action.endCoord.y;

        myUI.run_action(command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal, endX, endY);
        if(step_direction == "fwd") ++i; else --i;
      }
      continue;
    }
    // end of ++wasm
    let i=0;
    while(i<step.length){
      // this is implementation specific for compressed actions
      let j=i+1;
      while(j<step.length && !(Number.isInteger(step[j]) && step[j]&1))
        ++j;
      // [i,j) is the action
      let [command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal, endX, endY] = GridPathFinder.unpackAction(step.slice(i, j), false);

      myUI.run_action(command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal, endX, endY, colour,radius,value,id);
      
      i=j;
    }
    if(myUI.map_width<=64 && myUI.map_height<=64 && myUI.currentCoord) 
      myUI.updateInfoMap(myUI.planner.infoMapPlannerMode(),...myUI.currentCoord);
  }
}

myUI.run_action = function(command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal, endX, endY, colour,radius,value,id){
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
  if(dest==STATIC.CR && (command==STATIC.DP || command==STATIC.DSP || command==STATIC.DrawSpecialVertex)){
    myUI.currentCoord = [x,y]; // record current when updated for infomap purposes
  }
  // INFOTABLE 
  if(command==STATIC.InsertRowAtIndex){
    myUI.InfoTables[statics_to_obj[dest]].insertRowAtIndex(infoTableRowIndex, infoTableRowData); 
  }
  if(command==STATIC.EraseAllRows){
    myUI.InfoTables[statics_to_obj[dest]].removeAllTableRows(); 
  }
  else if(command==STATIC.EraseRowAtIndex){
    myUI.InfoTables[statics_to_obj[dest]].eraseRowAtIndex(infoTableRowIndex); 
  }
  else if(command==STATIC.UpdateRowAtIndex){
    myUI.InfoTables[statics_to_obj[dest]].updateRowAtIndex(infoTableRowIndex, infoTableRowData); 
  }
  else if(command==STATIC.SetHighlightAtIndex){
    myUI.InfoTables[statics_to_obj[dest]].setHighlightAtIndex(infoTableRowIndex); 
  }
  if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowPri ){
    myUI.PseudoCode.highlightPri(pseudoCodeRow);
  }  
  if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowSec ){
    myUI.PseudoCode.highlightSec(pseudoCodeRow);
  }  
  else if(dest == STATIC.PC && command == STATIC.UnhighlightAllPseudoCodeRowSec ){
    myUI.PseudoCode.removeAllHighlightSec();
  }  
  else if( command == STATIC.CreateStaticRow ){
    myUI.InfoTables["ITStatistics"].createStaticRowWithACellEditableById(id,value);
  }  
  else if( command == STATIC.EditStaticRow ){
    myUI.InfoTables["ITStatistics"].editStaticCellByRowId(id,value);
  }  
    
    
  else if(command == STATIC.DrawVertex){
    let colour = myUI.canvases[statics_to_obj[dest]].fillColor;
    myUI.nodeCanvas.drawCircle([x,y],dest,false,false,radius);//id generated from coord and type
  }
  else if(command == STATIC.DrawDottedVertex){
      myUI.nodeCanvas.drawCircle([x,y],dest,false,colour,radius,false,"dotted");
    }
    

  else if(command == STATIC.EraseVertex){
    myUI.nodeCanvas.eraseCircle([x,y], dest);
  } 
  else if(command == STATIC.EraseAllVertex){
    myUI.nodeCanvas.EraseSvgsbyClass(`SVGcircle_${dest}`);
  } 
  else if(command == STATIC.DrawSingleVertex){
    myUI.nodeCanvas.EraseSvgsbyClass(`SVGcircle_${dest}`);
    let colour = myUI.canvases[statics_to_obj[dest]].fillColor;
    myUI.nodeCanvas.drawCircle([x,y],dest,false,false,radius);//id generated from coord and type
  }
  else if(command == STATIC.DrawEdge){
    let color = myUI.canvases[statics_to_obj[dest]]?.fillColor;
    myUI.edgeCanvas.drawLine([x,y], [endX,endY], dest);
  }
  else if(command == STATIC.DrawDottedEdge){
    let colour = myUI.canvases[statics_to_obj[dest]]?.fillColor;
    myUI.edgeCanvas.drawLine([x,y], [endX,endY], dest,false,true);
  }
  else if(command == STATIC.EraseEdge){
    myUI.edgeCanvas.eraseLine([x,y], [endX,endY], dest);
    console.log("removing EDGE");
  }
  else if(command == STATIC.EraseAllEdge){
    myUI.edgeCanvas.eraseAllLines(dest);
  }

  }catch(e){
    if(dest!=STATIC.PC && command!=STATIC.DA && command!=STATIC.EA){
      console.log(e);
      console.log(STATIC_COMMANDS[command], STATIC_DESTS[dest], "failed");
      debugger;
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

myUI.run_combined_step = function(step_direction){
  if(step_direction===undefined){
    if(myUI.animation.reversed) step_direction="bck";
    else step_direction="fwd";
  }
	if(step_direction=="fwd"){
		var numSteps = myUI.step_data.fwd.combined[myUI.animation.step+1]; 
	}
	else{
		var numSteps = myUI.step_data.bck.combined[myUI.animation.step]; 
	}
  while(numSteps--) myUI.run_steps(1, step_direction);
}

myUI.generateReverseSteps = function({genStates=false}={}){
  const batchSize=10000, batchInterval = 0;
  const stateFreq = myUI.stateFreq;
  
  console.log("myUI.stateFreq:",myUI.stateFreq);
  if(genStates)  myUI.states = [stateFreq];

  // wasm
  if(myUI.planner.constructor.wasm){
    Module["genSteps"](genStates, stateFreq);
    let cnt = 0;

    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(nextGenSteps(batchSize)), batchInterval);
    });
    
    function nextGenSteps(batchSize){
      let finished;
      try{
        document.getElementById("compute_btn").children[0].innerHTML = `optimizing... ${(cnt++ * batchSize / myUI.planner.max_step() * 100).toPrecision(3)}%`;
        finished = Module["nextGenSteps"](batchSize);
        if(!finished) return new Promise((resolve, reject) => {
          setTimeout(() => resolve(nextGenSteps(batchSize)), batchInterval);
        });
        console.log("finished generating wasm steps!");
        let bounds_cpp = Module["getBounds"]();
        let bounds = map_to_obj(bounds_cpp);
        for(let k of Object.keys(bounds)) bounds[k] = [bounds[k].min, bounds[k].max];
        return finishGenerating(bounds, false);
      }
      catch(e){
        let t = Date.now() - myUI.genStart;
        let n = Module["getNumStates"]();
        console.log(t);
        console.log(e);
        console.log("Number of states before error: ", n);
        console.log(n/t);
        alert("Something went wrong during state generation");
        return;
      }
    }
  }
  // end of ++wasm
  myUI.step_data.fwd.data = myUI.planner.steps_data;
  myUI.step_data.fwd.map = myUI.planner.step_index_map;
  myUI.step_data.fwd.combined = myUI.planner.combined_index_map;

	let steps = myUI.step_data.fwd.data,
		indexMap = myUI.step_data.fwd.map, 
		combinedMap = myUI.step_data.fwd.combined;
	
  myUI.step_data.bck.data = [];
  myUI.step_data.bck.map = [];
	myUI.step_data.bck.combined = [];
	let stepCnt=0;
	let revCombinedCnt = 0;

  //let mem = {canvasCoords:{}, drawSinglePixel:{}, fullCanvas:{}, arrowColor:{}, bounds:{}};
  let mem = {activeCanvas:{}, activeTable:{}, drawSinglePixel:{}, arrowColor:{}, bounds:{}, vertices:{}, edges:{}};
  myUI.mem = mem;
  Object.values(myUI.canvases).forEach(canvas=>canvas.init_virtual_canvas());
  document.querySelector("#info-tables-dynamic").style.display = "none";

  const statusUpdate = setInterval(function(){
    document.getElementById("compute_btn").children[0].innerHTML = `optimizing... ${(stepCnt/indexMap.length*100).toPrecision(3)}%`;
  }, 200);

  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(nextGenSteps(batchSize)), batchInterval);
  });

  function finishGenerating(bounds, clearUpdate = true){
    console.log(bounds);
    for(const [dest, bound] of Object.entries(bounds)){
      myUI.canvases[statics_to_obj[dest]].setValueBounds("min", bound[0]);
      myUI.canvases[statics_to_obj[dest]].setValueBounds("max", bound[1]);
    }
    document.querySelector("#info-tables-dynamic").style.display = "flex";
    myUI.reset_animation();
    if(clearUpdate)
      clearInterval(statusUpdate);
  }

  function nextGenSteps(nxtSize){
    while(nxtSize--){
      if(stepCnt==indexMap.length) return finishGenerating(mem.bounds);
      let step = steps.slice(indexMap[stepCnt], indexMap[stepCnt+1]);
      if(isNaN(step[0])) return finishGenerating(mem.bounds);
      let i=0;
      myUI.step_data.bck.map.push(myUI.step_data.bck.data.length);
      let curStep = [];
      while(i<step.length){

        // this is implementation specific for compressed actions
        let j=i+1;
        while(j<step.length && !(Number.isInteger(step[j]) && step[j]&1))
          ++j;
        // [i,j) is the action length
        
        let [command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal, endX, endY,colour,radius] = GridPathFinder.unpackAction(step.slice(i, j), false);

        let action = [];
        var includeAction = true;

        // saving minmax
        if(cellVal!==undefined && myUI.canvases[statics_to_obj[dest]].valType=="float"){
          mem.bounds[dest] = mem.bounds[dest] || [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
          mem.bounds[dest][0] = Math.min(mem.bounds[dest][0], cellVal);
          mem.bounds[dest][1] = Math.max(mem.bounds[dest][1], cellVal);
        }

        if(x!==undefined || command===STATIC.EC){
          if(!mem.activeCanvas.hasOwnProperty(dest))
            mem.activeCanvas[statics_to_obj[dest]] = myUI.canvases[statics_to_obj[dest]];
        }
        else if(infoTableRowIndex!==undefined){
          if(!mem.activeTable.hasOwnProperty(dest))
            mem.activeTable[statics_to_obj[dest]] = myUI.InfoTables[statics_to_obj[dest]];
        }

        // checking command type
        if(command==STATIC.DSP){
          try{
            if(mem.drawSinglePixel[dest]!==undefined) action = GridPathFinder.packAction({command: STATIC.DSP, dest: dest, nodeCoord: mem.drawSinglePixel[dest], cellVal: 1});
            else action = GridPathFinder.packAction({command: STATIC.EC, dest: dest});
            mem.drawSinglePixel[dest] = [x,y];
            myUI.canvases[statics_to_obj[dest]].erase_canvas(true);
            myUI.canvases[statics_to_obj[dest]].draw_pixel([x,y], true, cellVal, cellVal-1, false);
          } catch(e){
            console.log(statics_to_obj[dest]);
            debugger;
          }
          
        }
        else if(command==STATIC.SP){
          try{
            /*
            mem.fullCanvas[dest] = mem.fullCanvas[dest] || deep_copy_matrix(myUI.canvases[statics_to_obj[dest]].canvas_cache);
            action = GridPathFinder.packAction({command: STATIC.SP, dest: dest, nodeCoord: [x,y], cellVal: mem.fullCanvas[dest][x][y]});
            mem.fullCanvas[dest][x][y] = cellVal;
            
            /* virtualCanvas version */
            action = GridPathFinder.packAction({command: STATIC.SP, dest: dest, nodeCoord: [x,y], cellVal: myUI.canvases[statics_to_obj[dest]].virtualCanvas[x][y]});
            myUI.canvases[statics_to_obj[dest]].draw_pixel([x,y], true, cellVal, cellVal-1, false);
            /**/
          }
          catch(e){
            console.log(statics_to_obj[dest]);
          }
        }/* */
        else if(command==STATIC.DP){
          if(cellVal===undefined) cellVal = 1;
          /*
          mem.canvasCoords[dest] = mem.canvasCoords[dest] || [];
          for(const coord of mem.canvasCoords[dest])
            if(coord!==undefined && coord[0]==x && coord[1]==y)
              includeAction = false;
          if(includeAction){
            action = GridPathFinder.packAction({command: STATIC.EP, dest: dest, nodeCoord: [x,y], cellVal: cellVal});
            mem.canvasCoords[dest].push([x,y]);
          }
          /* virtualCanvas version */
          try{
            if(myUI.canvases[statics_to_obj[dest]].virtualCanvas[x][y]==myUI.canvases[statics_to_obj[dest]].defaultVal)
              action = GridPathFinder.packAction({command: STATIC.EP, dest: dest, nodeCoord: [x,y]});
            myUI.canvases[statics_to_obj[dest]].draw_pixel([x,y], true, cellVal, cellVal-1, false);
          } catch(e){
            console.log(statics_to_obj[dest]);
            debugger;
          }
          /**/
        }
        else if(command==STATIC.EP){
          /*
          action = GridPathFinder.packAction({command: STATIC.DP, dest: dest, nodeCoord: [x,y], cellVal: 1});
          if(!(dest in mem.canvasCoords)) mem.canvasCoords[dest] = [];
          let i;
          for(i=0;i<mem.canvasCoords[dest].length;++i){
            let coord = mem.canvasCoords[dest][i];
            if(coord===undefined) continue;
            if(coord[0]==x && coord[1]==y) break;
          }
          delete mem.canvasCoords[dest][i];
          /* virtualCanvas version */
          try{
            action = GridPathFinder.packAction({command: STATIC.DP, dest: dest, nodeCoord: [x,y], cellVal: myUI.canvases[statics_to_obj[dest]].virtualCanvas[x][y]});
            myUI.canvases[statics_to_obj[dest]].erase_pixel([x,y], true, false);
          }
          catch(e){
            console.log(e);
            debugger;
          }
          /**/
        }
        else if(command==STATIC.EC){
          action = [];
          /*
          if(!(dest in mem.canvasCoords)) mem.canvasCoords[dest] = [];
          mem.canvasCoords[dest].forEach(nodeCoord=>{
            let subAction = GridPathFinder.packAction({command: STATIC.DP, dest: dest, nodeCoord: nodeCoord});
            Array.prototype.push.apply(action, subAction);
          });
          mem.canvasCoords[dest] = [];
          /* virtualCanvas version */
          try{
            let height = myUI.canvases[statics_to_obj[dest]].virtualCanvas.length;
            let width = myUI.canvases[statics_to_obj[dest]].virtualCanvas[0].length;
            let canvasDefaultVal = myUI.canvases[statics_to_obj[dest]].defaultVal;
            for(let i=0;i<height;++i){
              for(let j=0;j<width;++j){
                if(myUI.canvases[statics_to_obj[dest]].virtualCanvas[i][j]!=canvasDefaultVal){
                  let subAction = GridPathFinder.packAction({command: STATIC.SP, dest: dest, nodeCoord: [i,j], cellVal: myUI.canvases[statics_to_obj[dest]].virtualCanvas[i][j]});
                  Array.prototype.push.apply(action, subAction);
                }
              }
            }
            myUI.canvases[statics_to_obj[dest]].erase_canvas(true);
          }
          catch(e){
            console.log(e);
            debugger;
          }
          /**/
        }
        else if(command==STATIC.INC_P){
          action = GridPathFinder.packAction({command: STATIC.DEC_P, dest: dest, nodeCoord: [x,y]});
          myUI.canvases[statics_to_obj[dest]].change_pixel([x,y], "inc", true);
        }
        else if(command==STATIC.DEC_P){
          action = GridPathFinder.packAction({command: STATIC.INC_P, dest: dest, nodeCoord: [x,y]});
          myUI.canvases[statics_to_obj[dest]].change_pixel([x,y], "dec", true);
        }
        else if(command==STATIC.DA){
          if(arrowIndex in mem.arrowColor){
            action = GridPathFinder.packAction({command: STATIC.DA, arrowIndex: arrowIndex, colorIndex: mem.arrowColor[arrowIndex]});
          }
          else
            action = GridPathFinder.packAction({command: STATIC.EA, arrowIndex: arrowIndex});
          colorIndex = colorIndex || 0;
          mem.arrowColor[arrowIndex] = colorIndex;
        }
        else if(command==STATIC.EA){
          action = GridPathFinder.packAction({command: STATIC.DA, arrowIndex: arrowIndex, colorIndex: mem.arrowColor[arrowIndex]});
          delete mem.arrowColor[arrowIndex];
        }
        else if(command==STATIC.InsertRowAtIndex){
          try{
            let prevHighlight = myUI.InfoTables[statics_to_obj[dest]].insertRowAtIndex(infoTableRowIndex, infoTableRowData); 
            action = GridPathFinder.packAction({command: STATIC.EraseRowAtIndex, dest: dest, infoTableRowIndex: infoTableRowIndex});
            if(prevHighlight)
              Array.prototype.push.apply(action, GridPathFinder.packAction({command: STATIC.SetHighlightAtIndex, dest: dest, infoTableRowIndex: prevHighlight}));
          }
          catch(e){
            console.log(e);
            console.log(infoTableRowIndex);
            debugger;
          }
        }
        else if(command==STATIC.EraseRowAtIndex){
          let [data, toHighlight] = myUI.InfoTables[statics_to_obj[dest]].eraseRowAtIndex(infoTableRowIndex);
          action = GridPathFinder.packAction({command: STATIC.InsertRowAtIndex, dest: dest, infoTableRowIndex: toHighlight?infoTableRowIndex:infoTableRowIndex*-1, infoTableRowData: data});
        }
        else if(command==STATIC.EraseAllRows){
          // IT SHOULD WORK, UNTESTED
          action = [];
          while (!myUI.InfoTables[statics_to_obj[dest]].empty()){
            let [data, toHighlight] = myUI.InfoTables[statics_to_obj[dest]].eraseRowAtIndex(1); 
            Array.prototype.unshift.apply(action, GridPathFinder.packAction({command: STATIC.InsertRowAtIndex, dest: dest, infoTableRowIndex: toHighlight ? 1 : -1, infoTableRowData: data}));
          }
        }
        else if(command==STATIC.UpdateRowAtIndex){
          let [data, prevHighlight] = myUI.InfoTables[statics_to_obj[dest]].updateRowAtIndex(infoTableRowIndex, infoTableRowData); 
          action = GridPathFinder.packAction({command: STATIC.UpdateRowAtIndex, dest: dest, infoTableRowIndex: infoTableRowIndex, infoTableRowData: data});
          if(prevHighlight)
            Array.prototype.push.apply(action, GridPathFinder.packAction({command: STATIC.SetHighlightAtIndex, dest: dest, infoTableRowIndex: prevHighlight}));
        }
        else if(command==STATIC.SetHighlightAtIndex){
          let prevHighlight = myUI.InfoTables[statics_to_obj[dest]].setHighlightAtIndex(infoTableRowIndex); 
          action = GridPathFinder.packAction({command: STATIC.SetHighlightAtIndex, dest: dest, infoTableRowIndex: prevHighlight});
        }
        else if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowPri ){
          if(mem.pseudoCodeRowPri===undefined) mem.pseudoCodeRowPri = -1;
          // -1 resets all pseudocoderows
          action = GridPathFinder.packAction({command: STATIC.HighlightPseudoCodeRowPri, dest: STATIC.PC, pseudoCodeRow: mem.pseudoCodeRowPri});
          mem.pseudoCodeRowPri = pseudoCodeRow;
        }  
        else if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowSec ){
          if(mem.pseudoCodeRowSec!==undefined) action = GridPathFinder.packAction({command: STATIC.HighlightPseudoCodeRowSec, dest: STATIC.PC, pseudoCodeRow: mem.pseudoCodeRowSec});
          else action = GridPathFinder.packAction({command: STATIC.HighlightPseudoCodeRowSec, dest: STATIC.PC, pseudoCodeRow: -1});
          mem.pseudoCodeRowSec = pseudoCodeRow;
        }
        else if(command == STATIC.DrawVertex){
          action = GridPathFinder.packAction({command: STATIC.EraseVertex, dest: dest, nodeCoord: [x,y]});
          if(!mem.vertices.hasOwnProperty(dest))
            mem.vertices[dest] = [];
          mem.vertices[dest].push([x,y]);
        }
        else if(command == STATIC.EraseVertex){
          action = GridPathFinder.packAction({command: STATIC.DrawVertex, dest: dest, nodeCoord: [x,y]});
          if(!mem.vertices.hasOwnProperty(dest)){
            console.log("ERROR: VERTEX NOT FOUND"); alert("ERROR: VERTEX NOT FOUND"); debugger;
          }
          for(let i = 0; i < mem.vertices[dest].length; ++i){
            if(mem.vertices[dest][i][0] == x && mem.vertices[dest][i][1] == y){
              mem.vertices[dest].splice(i, 1);
              break;
            }
          }
        }
        else if(command == STATIC.EraseAllVertex){
          action = [];
          if(!mem.vertices.hasOwnProperty(dest))
            mem.vertices[dest] = [];
          mem.vertices[dest].forEach(coord => Array.prototype.push.apply(action,GridPathFinder.packAction({command: STATIC.DrawVertex, dest: dest, nodeCoord: coord})));
          mem.vertices[dest] = [];
        } 
        else if(command == STATIC.DrawSingleVertex){ //now hard coded for current vertex
          action = GridPathFinder.packAction({command: STATIC.EraseAllVertex, dest: dest});
          if(!mem.vertices.hasOwnProperty(dest))
            mem.vertices[dest] = [];
          mem.vertices[dest].forEach(coord => Array.prototype.push.apply(action,GridPathFinder.packAction({command: STATIC.DrawVertex, dest: dest, nodeCoord: coord})));
          mem.vertices[dest] = [];
          mem.vertices[dest].push([x,y]);
        } 
        else if(command == STATIC.DrawEdge){
          action = GridPathFinder.packAction({command: STATIC.EraseEdge, dest: dest, nodeCoord: [x,y], endCoord: [endX,endY]});
          if(!mem.edges.hasOwnProperty(dest))
            mem.edges[dest] = [];
          mem.edges[dest].push([x,y,endX,endY]);
        }
        else if(command == STATIC.EraseEdge){
          action = GridPathFinder.packAction({command: STATIC.DrawEdge, dest: dest, nodeCoord: [x,y], endCoord: [endX,endY]});
          if(!mem.edges.hasOwnProperty(dest)){
            console.log("ERROR: EDGE NOT FOUND");
            Array.prototype.unshift.apply(curStep, action);
            i=j;
            continue;
          }
          for(let i = 0; i < mem.edges[dest].length; ++i){
            let a = mem.edges[dest][i][0] == x && mem.edges[dest][i][1] == y && mem.edges[dest][i][2] == endX && mem.edges[dest][i][3] == endY;
            let b = mem.edges[dest][i][2] == x && mem.edges[dest][i][3] == y && mem.edges[dest][i][0] == endX && mem.edges[dest][i][1] == endY;
            if(a || b){
              mem.edges[dest].splice(i, 1);
              break;
            }
          }
        }
        else if(command == STATIC.EraseAllEdge){
          action = [];
          if(!mem.edges.hasOwnProperty(dest))
            mem.edges[dest] = [];
          mem.edges[dest].forEach(quad => Array.prototype.push.apply(action,GridPathFinder.packAction({command: STATIC.DrawEdge, dest: dest, nodeCoord: [quad[0], quad[1]], endCoord: [quad[2], quad[3]]})));
          mem.edges[dest] = [];
        }
        
        // add more here
        if(includeAction)
          Array.prototype.unshift.apply(curStep, action);
        i=j;
      }
      Array.prototype.push.apply(myUI.step_data.bck.data, curStep);
      revCombinedCnt++;
      myUI.step_data.bck.combined.push(revCombinedCnt);
      if(combinedMap[stepCnt]==1) revCombinedCnt = 0;
      ++stepCnt;

      if(genStates && stepCnt%stateFreq==0){
        if(stepCnt/stateFreq % 100==0) console.log("State", stepCnt/stateFreq);
        let nextState = {canvases:{}, infotables:{}, vertices:{}, edges:{}};
        // canvas
        for(const canvas of Object.values(mem.activeCanvas)){
          if(canvas===undefined){
            console.log("CANVAS UNDEFINED", canvas);
            continue;
          }
          if(canvas.valType=="float"){
            nextState.canvases[canvas.id] = deep_copy_matrix(canvas.virtualCanvas, false, true);
          }
          else{
            /*
            if(canvas.maxVal==1) var mat = BitMatrix.compress_bit_matrix(canvas.virtualCanvas);
            else var mat = NBitMatrix.compress_matrix(canvas.virtualCanvas, canvas.maxVal);*/
            //if(canvas.id=="visited") debugger;
            let mat = NBitMatrix.compress_matrix(canvas.virtualCanvas, canvas.maxVal);
            nextState.canvases[canvas.id] = mat.get_truncated_data();
          }
        };
        // arrow
        nextState.arrowColor = JSON.parse(JSON.stringify(mem.arrowColor));
        // infotables
        
        for(const [id, table] of Object.entries(mem.activeTable)){
          if(table===undefined){
            console.log("INFOTABLE UNDEFINED", id, table);
            continue;
          }
          nextState.infotables[id] = table.flatten();
        }
        // pseudoCode
        nextState.pseudoCodeRowPri = mem.pseudoCodeRowPri;
        nextState.pseudoCodeRowSec = mem.pseudoCodeRowSec;
        
        for(const [dest, vertices] of Object.entries(mem.vertices)){
          nextState.vertices[dest] = [];
          for(const coord of vertices)
            nextState.vertices[dest].push([coord[0], coord[1]]);
        }

        for(const [dest, edges] of Object.entries(mem.edges)){
          nextState.edges[dest] = [];
          for(const coord of edges)
            nextState.edges[dest].push([coord[0], coord[1], coord[2], coord[3]]);
        }

        myUI.states.push(nextState);
      }
    }
    
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(nextGenSteps(batchSize)), batchInterval);
    });
  }
}

myUI.updateInfoMap = function(infoMapPlannerMode,x,y){
  if(infoMapPlannerMode == "none"){
    
  }
  else{
    
    /*
    1) clear info map
    */
    myUI.InfoMap.reset();
    /*
    2) update current position
    */
    myUI.InfoMap.drawObstacle(x,y);
    myUI.InfoMap.drawOutOfBound(x,y);
    for(uiCanvas of myUI.dynamicCanvas){
      if(uiCanvas.infoMapBorder) myUI.InfoMap.drawCanvasBorder(x,y,uiCanvas.id);
      if(uiCanvas.infoMapValue) myUI.InfoMap.drawCanvasValue(x,y,uiCanvas.id);
    }
    /*
    myUI.InfoMap.drawVisited(x,y);
    myUI.InfoMap.drawQueue(x,y);
    myUI.InfoMap.drawNeighbors(x,y);
    myUI.InfoMap.drawFGH(x,y);
    /* */
    myUI.InfoCurrent.DrawCurrent(x,y);
  }
}

myUI.jump_to_step = function(target_step){
  /*
  if state exists:
    load state
    draw state to whatever
  run the remaning steps
  */
  target_step = target_step===undefined ? myUI.animation.step : Number(target_step);
  myUI.target_step = target_step;
  let idx = 0;
  for(const table of Object.values(myUI.InfoTables)) table.removeAllTableRows();
  for(const canvas of Object.values(myUI.dynamicCanvas)) canvas.erase_canvas();
  for(const elem of myUI.arrow.elems)
    elem.classList.add("hidden");
  
  myUI.nodeCanvas.reset(false);
  myUI.edgeCanvas.reset(false);

  const stateFreq = myUI.states[0];

  // if state exists
  if(target_step>=stateFreq){
    idx = Math.floor(target_step/stateFreq);
    let state = myUI.planner.constructor.wasm ? Module["getState"](target_step) : myUI.states[idx];
  
    // arrows
    let arrows = myUI.planner.constructor.wasm ? map_to_obj(state.arrowColor) : state.arrowColor ;
    for(const [arrowId, colorId] of Object.entries(arrows)){
      myUI.arrow.elems[arrowId].classList.remove("hidden");
      myUI.arrow.elems[arrowId].style.fill = myUI.arrow.colors[colorId];
    }

    // infotables
    if(myUI.planner.constructor.wasm){
      for(const [tableDest, tableState] of Object.entries(map_to_obj(state.infotables))){
        const tableId = statics_to_obj[tableDest];
        const generator = vector_values(tableState.rows);
        let nxt = generator.next();
        while(!nxt.done){
          let row = [...vector_values(nxt.value)];
          myUI.InfoTables[tableId].insertRowAtIndex(1, row);
          nxt = generator.next();
        }
        myUI.InfoTables[tableId].setHighlightAtIndex(tableState.highlightedRow);
      }
    }
    else{
      for(const [tableId, tableData] of Object.entries(state.infotables)){
        myUI.InfoTables[tableId].removeAllTableRows();
        const rowSize = tableData[1];
        for(let i=2;i<tableData.length;i+=rowSize){
          let idx = -myUI.InfoTables[tableId].rows.length-1;
          myUI.InfoTables[tableId].insertRowAtIndex(idx, tableData.slice(i, i+rowSize));
        }
        myUI.InfoTables[tableId].setHighlightAtIndex(tableData[0]);
      }
    }
    // pseudocode
    try{
      myUI.PseudoCode.highlightPri(state.pseudoCodeRowPri);
      myUI.PseudoCode.highlightSec(state.pseudoCodeRowSec);
    }
    catch(e){

    }

    // free vertices
    let vertices = myUI.planner.constructor.wasm ? map_to_obj(state.vertices) : state.vertices ;
    for(let [dest, coordArray] of Object.entries(vertices)){
      if(myUI.planner.constructor.wasm) coordArray = [...vector_values(coordArray)];
      for(coord of coordArray){
        if(myUI.planner.constructor.wasm) coord = [coord.x, coord.y];
        myUI.nodeCanvas.drawCircle(coord, dest);
      }
    }

    // free edge
    let edges = myUI.planner.constructor.wasm ? map_to_obj(state.edges) : state.edges ;
    for(const [dest, edgeArray] of Object.entries(edges)){
      if(myUI.planner.constructor.wasm) edgeArray = [...vector_values(edgeArray)];
      for(line of edgeArray){
        if(myUI.planner.constructor.wasm) line = [line.get(0), line.get(1), line.get(2), line.get(3)];
        myUI.edgeCanvas.drawLine([line[0], line[1]], [line[2], line[3]], dest);
      }
    }
    

    // canvases
    let canvases = myUI.planner.constructor.wasm ? map_to_obj(state.canvases) : state.canvases;
    let canvasesToDraw = Object.entries(canvases);
    function drawNextCanvas(canvasNo){
      if(canvasNo==-1) return -1;
      if(canvasNo==canvasesToDraw.length) return finishJumping();
      let [dest,data] = canvasesToDraw[canvasNo];
      let id = myUI.planner.constructor.wasm ? statics_to_obj[dest] : dest;
      document.getElementById("compute_btn").children[0].innerHTML = `drawing ${id}...`;
      if(myUI.planner.constructor.wasm){
        if(data.$$.ptrType.name == "canvas*"){
          let coords = [...vector_values(data.keys())];
          var toDraw = {};
          for(let coord of coords){
            toDraw[coord.x * myUI.canvases[id].data_width + coord.y] = data.get(coord);
          }
        }
        else{
          var toDraw = [];
          const gen = vector_values(data);
          let n = gen.next();
          while(!n.done){
            toDraw.push([...vector_values(n.value)]);
            n = gen.next();
          }
        }
      }
      else if(data.constructor==Array) var toDraw = data; // for 2d arrays (floats, etc.)
      else var toDraw = NBitMatrix.expand_2_matrix(data);
      return myUI.canvases[id].draw_canvas_recursive(toDraw, canvasNo, target_step);
    }
    
    let arr = Array(canvasesToDraw.length+1).fill(null);
    function reductiveDrawChain(files){
      return files.reduce((chain,currentFile) => {
        return chain.then(num => drawNextCanvas(num));
      },Promise.resolve(0));
    }
  
    return reductiveDrawChain(arr);
  }
  else{
    return new Promise((resolve, _) => {
      resolve(finishJumping());
    });
  }

  function finishJumping(){
    myUI.animation.step = idx*stateFreq-1;
    myUI.run_steps(target_step-myUI.animation.step, "fwd");
    document.getElementById("compute_btn").children[0].innerHTML = `Compute Path`;
    myUI.update_search_slider(target_step);
  }
}
