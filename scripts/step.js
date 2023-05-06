const STATIC_COMMANDS = [
  /* rest of the items are dynamics commands/identifiers */
  "DrawSinglePixel",
  "SetPixelValue",
  "EraseCanvas", // erase canvas
  "DrawPixel", // draw pixel
  "ErasePixel", // erase pixel
  "IncrementPixel", // increment pixel
  "DecrementPixel", // increment pixel
  "DrawArrow", // draw arrow (arrow index) [colour index]
  "EraseArrow" , // erase arrow (arrow index)
  "InsertRowAtIndex", // dest, rowIndex
  "EraseRowAtIndex", // dest, rowIndex
  "EraseAllRows", // dest, rowIndex
  "UpdateRowAtIndex", // dest, rowIndex
  "HighlightPseudoCodeRowPri", //highlight Pseudo
  "HighlightPseudoCodeRowSec", //highlight Pseudo
  "UnhighlightPseudoCodeRowSec", // unhighlight Pseudo
  "UnhighlightAllPseudoCodeRowSec",
  "SetHighlightAtIndex",
  "DrawVertex",
  "DrawSingleVertex",
  "EraseVertex",
  "EraseAllVertex",
  "DrawEdge",
  "EraseEdge",
  "EraseAllEdge",
  "CreateStaticRow",
  "RemoveStaticRow",
  "EditStaticRow"
];

var STATIC = {
  max_val: STATIC_COMMANDS.length-1
};
STATIC_COMMANDS.forEach(function(value, i){
  STATIC[value] = i;
});
/*
Actions
- `dc`, draw canvas
- `ec`, erase canvas
- `dp`, draw pixel
- `ep`, erase pixel
- `ia`, infopane add
- `ie`, infopane erase

*/

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
    else{
      if(myUI.planner.recurseCurrentPath) myUI.planner.recurseCurrentPath();
      return;
    };

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
        let infoTableRowData =  action.infoTableRowData === undefined || action.infoTableRowData.size() == 0 ? undefined : [...vector_values(action.infoTableRowData)];
        let cellVal = action.cellVal == -1 ? undefined : action.cellVal;
        let endX = action.endCoord === undefined || action.endCoord.x == -1 ? undefined : action.endCoord.x;
        let endY = action.endCoord === undefined || action.endCoord.y == -1 ? undefined : action.endCoord.y;

        let debug = false;
        if(debug){
          console.log(`
          Command          : ${STATIC_COMMANDS[command]}
          Dest             : ${myUI.planner.destsToId[dest]}
          x,y              : ${x + ", " + y}
          colorIndex       : ${colorIndex}
          arrowIndex       : ${arrowIndex}
          pseudoCodeRow    : ${pseudoCodeRow}
          infoTableRowIndex: ${infoTableRowIndex}
          infoTableRowData : ${infoTableRowData}
          cellVal          : ${cellVal}
          endCoord         : ${endX + ", " + endY}
          `);
        }

        myUI.run_action(command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal, endX, endY);//,radius,value,id);
        if(step_direction == "fwd") ++i; else --i;
      }
      continue;
    }
    // end of ++wasm
    let i=0;
    while(i<step.length){
      // this is implementation specific for compressed actions
      let j=i+1;
      while(j<step.length && !(Number.isInteger(step[j]) && step[j]&1))//rightmost bit is one is start of action
        ++j;
      // [i,j) is the action
      let [command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal, endX, endY,radius,value,id] = GridPathFinder.unpackAction(step.slice(i, j), true);

      myUI.run_action(command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal, endX, endY,radius,value,id); 
      
      i=j;
    }
    if(myUI.map_width<=64 && myUI.map_height<=64 && myUI.currentCoord) 
      myUI.updateInfoMap(myUI.planner.infoMapPlannerMode(),...myUI.currentCoord);
  }
}

myUI.run_action = function(command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal, endX, endY, radius,value,id){
  try{
  let destId = myUI.planner.destsToId[dest];
  if (command == STATIC.DrawSinglePixel) { 
    
    myUI.canvases[destId].erase_canvas();
    if(cellVal===undefined) cellVal = 1;
    myUI.canvases[destId].draw_pixel([x,y], false, cellVal);
  }
  else if(command==STATIC.EraseCanvas){
    myUI.canvases[destId].erase_canvas();
  }
  else if(command==STATIC.DrawPixel || command==STATIC.SetPixelValue){
    if(cellVal===undefined) cellVal = 1;
    myUI.canvases[destId].draw_pixel([x,y], false, cellVal);
  }
  else if(command==STATIC.ErasePixel){
      myUI.canvases[destId].erase_pixel([x,y]);
  }
  else if(command==STATIC.IncrementPixel){
      myUI.canvases[destId].change_pixel([x,y], "inc");
  }
  else if(command==STATIC.DecrementPixel){
      myUI.canvases[destId].change_pixel([x,y], "dec");
  }
  else if(command==STATIC.DrawArrow){
    // draw arrow
    myUI.arrow.elems[arrowIndex].classList.remove("hidden");
    myUI.arrow.elems[arrowIndex].style.fill = myUI.arrow.colors[colorIndex];
  }
  else if(command==STATIC.EraseArrow){
    // erase arrow
    myUI.arrow.elems[arrowIndex].classList.add("hidden");
  }
  // INFOMAP
  if(dest==myUI.planner.dests.expanded && (command==STATIC.DrawPixel || command==STATIC.DrawSinglePixel || command==STATIC.DrawSpecialVertex)){
    myUI.currentCoord = [x,y]; // record current when updated for infomap purposes
  }
  // INFOTABLE 
  if(command==STATIC.InsertRowAtIndex){
    myUI.InfoTables[destId].insertRowAtIndex(infoTableRowIndex, infoTableRowData); 
  }
  if(command==STATIC.EraseAllRows){
    myUI.InfoTables[destId].removeAllTableRows(); 
  }
  else if(command==STATIC.EraseRowAtIndex){
    myUI.InfoTables[destId].eraseRowAtIndex(infoTableRowIndex); 
  }
  else if(command==STATIC.UpdateRowAtIndex){
    myUI.InfoTables[destId].updateRowAtIndex(infoTableRowIndex, infoTableRowData); 
  }
  else if(command==STATIC.SetHighlightAtIndex){
    myUI.InfoTables[destId].setHighlightAtIndex(infoTableRowIndex); 
  }
  if(command == STATIC.HighlightPseudoCodeRowPri ){
    myUI.PseudoCode.highlightPri(pseudoCodeRow);
  }  
  if(command == STATIC.HighlightPseudoCodeRowSec ){
    myUI.PseudoCode.highlightSec(pseudoCodeRow);
  }  
  else if(command == STATIC.UnhighlightAllPseudoCodeRowSec ){
    myUI.PseudoCode.removeAllHighlightSec();
  }
  else if( command == STATIC.CreateStaticRow ){
    myUI.InfoTables["ITStatistics"].createStaticRowWithACellEditableById(value,id);
  }
  else if( command == STATIC.RemoveStaticRow ){
    myUI.InfoTables["ITStatistics"].removeStaticRowWithACellEditableById(value,id);
  }  
  else if( command == STATIC.EditStaticRow ){
    myUI.InfoTables["ITStatistics"].editStaticCellByRowId(id,value);
  }
    
  else if(command == STATIC.DrawVertex){
    myUI.nodeCanvas.drawCircle([x,y],destId,false,colorIndex,radius);//id generated from coord and type
  }

  else if(command == STATIC.EraseVertex){
    myUI.nodeCanvas.eraseCircle([x,y], destId, colorIndex, radius);
  } 
  else if(command == STATIC.EraseAllVertex){
    myUI.nodeCanvas.EraseSvgsbyClass(`SVGcircle_${destId}`);
  } 
  else if(command == STATIC.DrawSingleVertex){
    myUI.nodeCanvas.EraseSvgsbyClass(`SVGcircle_${destId}`);
    myUI.nodeCanvas.drawCircle([x,y],destId,false,colorIndex,radius);//id generated from coord and type
  }
  else if(command == STATIC.DrawEdge){
    myUI.edgeCanvas.drawLine([x,y], [endX,endY], destId,false,colorIndex);
  }
  else if(command == STATIC.EraseEdge){
    myUI.edgeCanvas.eraseLine([x,y], [endX,endY], destId);
    console.log("removing EDGE");
  }
  else if(command == STATIC.EraseAllEdge){
    myUI.edgeCanvas.eraseAllLines(destId);
  }

  }catch(e){
    console.log(e);
    console.log(STATIC_COMMANDS[command], myUI.planner.destsToId[dest], "failed");
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
  const batchSize = Math.min(50000, myUI.planner.max_step() * 0.2), batchInterval = 0;
  const stateFreq = myUI.stateFreq;

  const startTime = myUI.startTime;
  
  console.log("myUI.stateFreq:",myUI.stateFreq);
  if(genStates)  myUI.states = [stateFreq];

  // wasm
  if(myUI.planner.constructor.wasm){
    //Module["genSteps"](genStates, stateFreq);
    myUI.planner.cppPlanner.generateReverseSteps(genStates, stateFreq);
    let cnt = 0;

    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(nextGenSteps(batchSize)), batchInterval);
    });
    
    function nextGenSteps(batchSize){
      // if(startTime != myUI.startTime) return;
      let finished;
      try{
        // document.getElementById("compute_btn").children[0].innerHTML = `optimizing... ${(cnt++ * batchSize / myUI.planner.max_step() * 100).toPrecision(3)}%`;

        updateOptimizeProgress((cnt++ * batchSize / myUI.planner.max_step() * 100));
        
        finished = myUI.planner.cppPlanner.nextGenSteps(batchSize);
        if(!finished) return new Promise((resolve, reject) => {
          setTimeout(() => resolve(nextGenSteps(batchSize)), batchInterval);
        });
        console.log("finished generating wasm steps!");
        //let bounds_cpp = Module["getBounds"]();
        let bounds_cpp = myUI.planner.cppPlanner.getBounds();
        let bounds = map_to_obj(bounds_cpp);
        for(let k of Object.keys(bounds)) bounds[k] = [bounds[k].min, bounds[k].max];
        return finishGenerating(bounds, false);
      }
      catch(e){
        let t = Date.now() - myUI.genStart;
        //let n = Module["getNumStates"]();
        let n = myUI.planner.cppPlanner.getNumStates();
        console.log(e);
        console.log(t);
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
    updateOptimizeProgress(stepCnt/indexMap.length*100);
    // document.getElementById("compute_btn").children[0].innerHTML = `optimizing... ${(stepCnt/indexMap.length*100).toPrecision(3)}%`;
  }, 200);

  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(nextGenSteps(batchSize)), batchInterval);
  });

  function finishGenerating(bounds, clearUpdate = true){
    console.log(bounds);
    console.log(myUI.planner.destsToId);
    for(const [dest, bound] of Object.entries(bounds)){
      console.log(dest);
      myUI.canvases[myUI.planner.destsToId[dest]].setValueBounds("min", bound[0]);
      myUI.canvases[myUI.planner.destsToId[dest]].setValueBounds("max", bound[1]);
    }
    document.querySelector("#info-tables-dynamic").style.display = "flex";
    myUI.reset_animation();
    if(clearUpdate)
      clearInterval(statusUpdate);
  }

  function nextGenSteps(nxtSize){
    // if(startTime != myUI.startTime) return;
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
        
        let [command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal, endX, endY, radius, value, id] = GridPathFinder.unpackAction(step.slice(i, j),  false);
        let destId = myUI.planner.destsToId[dest];
        let action = [];
        var includeAction = true;

        // saving minmax
        if(cellVal!==undefined && myUI.canvases[destId].valType=="float"){
          mem.bounds[dest] = mem.bounds[dest] || [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
          mem.bounds[dest][0] = Math.min(mem.bounds[dest][0], cellVal);
          mem.bounds[dest][1] = Math.max(mem.bounds[dest][1], cellVal);
        }

        if(STATIC_COMMANDS[command].includes("Pixel") || command===STATIC.EraseCanvas){
          if(!mem.activeCanvas.hasOwnProperty(dest))
            mem.activeCanvas[destId] = myUI.canvases[destId];
        }
        else if(infoTableRowIndex!==undefined){
          if(!mem.activeTable.hasOwnProperty(dest))
            mem.activeTable[destId] = myUI.InfoTables[destId];
        }

        // checking command type
        if(command==STATIC.DrawSinglePixel){
          try{
            if(mem.drawSinglePixel[dest]!==undefined) action = GridPathFinder.packAction({command: STATIC.DrawSinglePixel, dest: dest, nodeCoord: mem.drawSinglePixel[dest], cellVal: 1});
            else action = GridPathFinder.packAction({command: STATIC.EraseCanvas, dest: dest});
            mem.drawSinglePixel[dest] = [x,y];
            myUI.canvases[destId].erase_canvas(true);
            myUI.canvases[destId].draw_pixel([x,y], true, cellVal, cellVal-1, false);
          } catch(e){
            console.log(destId);
            debugger;
          }
          
        }
        else if(command==STATIC.SetPixelValue){
          try{
            /*
            mem.fullCanvas[dest] = mem.fullCanvas[dest] || deep_copy_matrix(myUI.canvases[destId].canvas_cache);
            action = GridPathFinder.packAction({command: STATIC.SetPixelValue, dest: dest, nodeCoord: [x,y], cellVal: mem.fullCanvas[dest][x][y]});
            mem.fullCanvas[dest][x][y] = cellVal;
            
            /* virtualCanvas version */
            action = GridPathFinder.packAction({command: STATIC.SetPixelValue, dest: dest, nodeCoord: [x,y], cellVal: myUI.canvases[destId].virtualCanvas[x][y]});
            myUI.canvases[destId].draw_pixel([x,y], true, cellVal, cellVal-1, false);
            /**/
          }
          catch(e){
            console.log(destId);
          }
        }/* */
        else if(command==STATIC.DrawPixel){
          if(cellVal===undefined) cellVal = 1;
          /*
          mem.canvasCoords[dest] = mem.canvasCoords[dest] || [];
          for(const coord of mem.canvasCoords[dest])
            if(coord!==undefined && coord[0]==x && coord[1]==y)
              includeAction = false;
          if(includeAction){
            action = GridPathFinder.packAction({command: STATIC.ErasePixel, dest: dest, nodeCoord: [x,y], cellVal: cellVal});
            mem.canvasCoords[dest].push([x,y]);
          }
          /* virtualCanvas version */
          try{
            if(myUI.canvases[destId].virtualCanvas[x][y]==myUI.canvases[destId].defaultVal)
              action = GridPathFinder.packAction({command: STATIC.ErasePixel, dest: dest, nodeCoord: [x,y]});
            myUI.canvases[destId].draw_pixel([x,y], true, cellVal, cellVal-1, false);
          } catch(e){
            console.log(destId);
            debugger;
          }
          /**/
        }
        else if(command==STATIC.ErasePixel){
          /*
          action = GridPathFinder.packAction({command: STATIC.DrawPixel, dest: dest, nodeCoord: [x,y], cellVal: 1});
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
            action = GridPathFinder.packAction({command: STATIC.DrawPixel, dest: dest, nodeCoord: [x,y], cellVal: myUI.canvases[destId].virtualCanvas[x][y]});
            myUI.canvases[destId].erase_pixel([x,y], true, false);
          }
          catch(e){
            console.log(e);
            debugger;
          }
          /**/
        }
        else if(command==STATIC.EraseCanvas){
          action = [];
          /*
          if(!(dest in mem.canvasCoords)) mem.canvasCoords[dest] = [];
          mem.canvasCoords[dest].forEach(nodeCoord=>{
            let subAction = GridPathFinder.packAction({command: STATIC.DrawPixel, dest: dest, nodeCoord: nodeCoord});
            Array.prototype.push.apply(action, subAction);
          });
          mem.canvasCoords[dest] = [];
          /* virtualCanvas version */
          try{
            let height = myUI.canvases[destId].virtualCanvas.length;
            let width = myUI.canvases[destId].virtualCanvas[0].length;
            let canvasDefaultVal = myUI.canvases[destId].defaultVal;
            for(let i=0;i<height;++i){
              for(let j=0;j<width;++j){
                if(myUI.canvases[destId].virtualCanvas[i][j]!=canvasDefaultVal){
                  let subAction = GridPathFinder.packAction({command: STATIC.SetPixelValue, dest: dest, nodeCoord: [i,j], cellVal: myUI.canvases[destId].virtualCanvas[i][j]});
                  Array.prototype.push.apply(action, subAction);
                }
              }
            }
            myUI.canvases[destId].erase_canvas(true);
          }
          catch(e){
            console.log(e);
            debugger;
          }
          /**/
        }
        else if(command==STATIC.IncrementPixel){
          action = GridPathFinder.packAction({command: STATIC.DecrementPixel, dest: dest, nodeCoord: [x,y]});
          myUI.canvases[destId].change_pixel([x,y], "inc", true);
        }
        else if(command==STATIC.DecrementPixel){
          action = GridPathFinder.packAction({command: STATIC.IncrementPixel, dest: dest, nodeCoord: [x,y]});
          myUI.canvases[destId].change_pixel([x,y], "dec", true);
        }
        else if(command==STATIC.DrawArrow){
          if(arrowIndex in mem.arrowColor){
            action = GridPathFinder.packAction({command: STATIC.DrawArrow, arrowIndex: arrowIndex, colorIndex: mem.arrowColor[arrowIndex]});
          }
          else
            action = GridPathFinder.packAction({command: STATIC.EraseArrow, arrowIndex: arrowIndex});
          colorIndex = colorIndex || 0;
          mem.arrowColor[arrowIndex] = colorIndex;
        }
        else if(command==STATIC.EraseArrow){
          action = GridPathFinder.packAction({command: STATIC.DrawArrow, arrowIndex: arrowIndex, colorIndex: mem.arrowColor[arrowIndex]});
          delete mem.arrowColor[arrowIndex];
        }
        else if(command==STATIC.InsertRowAtIndex){
          try{
            let prevHighlight = myUI.InfoTables[destId].insertRowAtIndex(infoTableRowIndex, infoTableRowData); 
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
          let [data, toHighlight] = myUI.InfoTables[destId].eraseRowAtIndex(infoTableRowIndex);
          action = GridPathFinder.packAction({command: STATIC.InsertRowAtIndex, dest: dest, infoTableRowIndex: toHighlight?infoTableRowIndex:infoTableRowIndex*-1, infoTableRowData: data});
        }
        else if(command==STATIC.EraseAllRows){
          // IT SHOULD WORK, UNTESTED
          action = [];
          while (!myUI.InfoTables[destId].empty()){
            let [data, toHighlight] = myUI.InfoTables[destId].eraseRowAtIndex(1); 
            Array.prototype.unshift.apply(action, GridPathFinder.packAction({command: STATIC.InsertRowAtIndex, dest: dest, infoTableRowIndex: toHighlight ? 1 : -1, infoTableRowData: data}));
          }
        }
        else if(command==STATIC.UpdateRowAtIndex){
          let [data, prevHighlight] = myUI.InfoTables[destId].updateRowAtIndex(infoTableRowIndex, infoTableRowData); 
          action = GridPathFinder.packAction({command: STATIC.UpdateRowAtIndex, dest: dest, infoTableRowIndex: infoTableRowIndex, infoTableRowData: data});
          if(prevHighlight)
            Array.prototype.push.apply(action, GridPathFinder.packAction({command: STATIC.SetHighlightAtIndex, dest: dest, infoTableRowIndex: prevHighlight}));
        }
        else if(command==STATIC.SetHighlightAtIndex){
          let prevHighlight = myUI.InfoTables[destId].setHighlightAtIndex(infoTableRowIndex); 
          action = GridPathFinder.packAction({command: STATIC.SetHighlightAtIndex, dest: dest, infoTableRowIndex: prevHighlight});
        }
        else if(command == STATIC.HighlightPseudoCodeRowPri ){
          if(mem.pseudoCodeRowPri===undefined) mem.pseudoCodeRowPri = -1;
          // -1 resets all pseudocoderows
          action = GridPathFinder.packAction({command: STATIC.HighlightPseudoCodeRowPri, dest: dest, pseudoCodeRow: mem.pseudoCodeRowPri});
          mem.pseudoCodeRowPri = pseudoCodeRow;
        }  
        else if(command == STATIC.HighlightPseudoCodeRowSec ){
          if(mem.pseudoCodeRowSec!==undefined) action = GridPathFinder.packAction({command: STATIC.HighlightPseudoCodeRowSec, dest: dest, pseudoCodeRow: mem.pseudoCodeRowSec});
          else action = GridPathFinder.packAction({command: STATIC.HighlightPseudoCodeRowSec, dest: dest, pseudoCodeRow: -1});
          mem.pseudoCodeRowSec = pseudoCodeRow;
        }
        else if(command == STATIC.DrawVertex){
          action = GridPathFinder.packAction({command: STATIC.EraseVertex, dest: dest, nodeCoord: [x,y], colorIndex: colorIndex, radius: radius});
          if(!mem.vertices.hasOwnProperty(dest))
            mem.vertices[dest] = [];
          mem.vertices[dest].push([x,y,colorIndex,radius]);
        }
        else if(command == STATIC.EraseVertex){
          console.assert(mem.vertices.hasOwnProperty(dest), "ERROR: VERTEX DEST NOT FOUND");
          let flag = false;
          for(let i = 0; i < mem.vertices[dest].length; ++i){
            if(mem.vertices[dest][i][0] == x && mem.vertices[dest][i][1] == y && mem.vertices[dest][i][2] == colorIndex && mem.vertices[dest][i][3] == radius){
              mem.vertices[dest].splice(i, 1);
              flag = true;
              action = GridPathFinder.packAction({command: STATIC.DrawVertex, dest: dest, nodeCoord: [x,y], colorIndex: colorIndex, radius: radius});
              break;
            }
          }
          console.assert(flag, "ERROR: VERTEX NOT FOUND");
        }
        
        else if(command == STATIC.EraseAllVertex){
          action = [];
          if(!mem.vertices.hasOwnProperty(dest))
            mem.vertices[dest] = [];
          mem.vertices[dest].forEach(coordData => Array.prototype.push.apply(action,GridPathFinder.packAction({command: STATIC.DrawVertex, dest: dest, nodeCoord: [coordData[0], coordData[1]], colorIndex: coordData[2], radius: coordData[3]})));
          mem.vertices[dest] = [];
        }
        else if(command == STATIC.DrawSingleVertex){ //now hard coded for current vertex
          action = [];
          if(!mem.vertices.hasOwnProperty(dest))
            mem.vertices[dest] = [];
          mem.vertices[dest].forEach(coordData => Array.prototype.push.apply(action,GridPathFinder.packAction({command: STATIC.DrawVertex, dest: dest, nodeCoord: [coordData[0], coordData[1]], colorIndex: coordData[2], radius: coordData[3]})));
          mem.vertices[dest] = [];
          mem.vertices[dest].push([x,y,colorIndex,radius]);
          action = GridPathFinder.packAction({command: STATIC.EraseAllVertex, dest: dest});
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
        else if( command == STATIC.CreateStaticRow ){
          action = GridPathFinder.packAction({command: STATIC.RemoveStaticRow, dest: dest, id: id, value: value});
        }
        else{
          console.log(STATIC_COMMANDS[command], ", ERR: COMMAND NOT REVERSED");
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
            nextState.canvases[canvas.id] = flatten_matrix(canvas.virtualCanvas, canvas.defaultVal);
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
    //let state = myUI.planner.constructor.wasm ? Module["getState"](target_step) : myUI.states[idx];
    let state = myUI.planner.constructor.wasm ? myUI.planner.cppPlanner.getState(target_step) : myUI.states[idx];
  
    // arrows
    let arrows = myUI.planner.constructor.wasm ? map_to_obj(state.arrowColor) : state.arrowColor ;
    for(const [arrowId, colorId] of Object.entries(arrows)){
      myUI.arrow.elems[arrowId].classList.remove("hidden");
      myUI.arrow.elems[arrowId].style.fill = myUI.arrow.colors[colorId];
    }

    // infotables
    if(myUI.planner.constructor.wasm){
      var infotables = map_to_obj(state.infotables);
      for(const [tableDest, tableState] of Object.entries(infotables)){
        const tableId = myUI.planner.destsToId[tableDest];
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
    var vertices = myUI.planner.constructor.wasm ? map_to_obj(state.vertices) : state.vertices;
    for(let [dest, coordArray] of Object.entries(vertices)){
      if(myUI.planner.constructor.wasm) coordArray = [...vector_values(coordArray)];
      for(coord of coordArray){
        if(myUI.planner.constructor.wasm) coord = [coord.x, coord.y];
        myUI.nodeCanvas.drawCircle(coord, myUI.planner.destsToId[dest]);
      }
    }

    // free edge
    var edges = myUI.planner.constructor.wasm ? map_to_obj(state.edges) : state.edges;
    for(const [dest, edgeArray] of Object.entries(edges)){
      if(myUI.planner.constructor.wasm) edgeArray = [...vector_values(edgeArray)];
      for(line of edgeArray){
        if(myUI.planner.constructor.wasm) line = [line.get(0), line.get(1), line.get(2), line.get(3)];
        myUI.edgeCanvas.drawLine([line[0], line[1]], [line[2], line[3]], myUI.planner.destsToId[dest]);
      }
    }
    

    // canvases
    var canvases = myUI.planner.constructor.wasm ? map_to_obj(state.canvases) : state.canvases;
    let canvasesToDraw = Object.entries(canvases);
    if(myUI.planner.constructor.wasm) canvasesToDraw = canvasesToDraw.map(item =>{
      item[0] = myUI.planner.destsToId[item[0]];
      return item;
    });
    function drawNextCanvas(canvasNo){
      if(canvasNo==-1) return -1;
      if(canvasNo==canvasesToDraw.length) return finishJumping();
      let [id,data] = canvasesToDraw[canvasNo];
      if(canvasNo == myUI.fCostNo + 1){
        console.log(`Finished drawing fCost map of size ${myUI.canvases[id].data_height} x ${myUI.canvases[id].data_width}, time taken = ${Date.now() - myUI.fCostStart}`)
      }
      if(id == "fCost"){
        console.log(data);
        myUI.test_data = data;
        myUI.fCostStart = Date.now();
        myUI.fCostNo = canvasNo;
      }
      document.getElementById("compute_btn").children[0].innerHTML = `drawing ${id}...`;
      if(data?.$$?.ptrType?.name == "vectorDouble*") data = [...vector_values(data)];
      return myUI.canvases[id].draw_canvas_recursive(data, canvasNo, target_step);
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
