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
  "UnhighlightPseudoCodeRowSec", // unhighlight Pseudo
  "SetHighlightAtIndex",
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
  3: "expanded",
  4: "neighbors",
  5: "path",
  6: "focused",
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


myUI.run_steps = function(num_steps, step_direction){
  if(step_direction===undefined){
    if(myUI.animation.reversed) step_direction="bck";
    else step_direction="fwd";
  }
  while(num_steps--){
    if(step_direction!="fwd" && myUI.animation.step>-1)--myUI.animation.step;
    else if(step_direction=="fwd" && myUI.animation.step<myUI.animation.max_step) ++myUI.animation.step;
    else return;

    let step = myUI.get_step(myUI.animation.step, step_direction);

    //console.log(step, 'step');
    let i=0;
    while(i<step.length){
      // this is implementation specific for compressed actions
      let j=i+1;
      while(j<step.length && !(Number.isInteger(step[j]) && step[j]&1))
        ++j;
      // [i,j) is the action
			
      let [command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal] = GridPathFinder.unpackAction(step.slice(i, j));
      //console.log("command", STATIC_COMMANDS[command], "dest", STATIC_DESTS[dest], "x", x, "y", y, "colorIndex", colorIndex, "arrowIndex", arrowIndex, "pseudoCodeRow", pseudoCodeRow, "infoTableRowIndex", infoTableRowIndex, "infoTableRowData", infoTableRowData, "cellVal", cellVal);

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
        myUI.InfoTables[statics_to_obj[dest]].insertRowAtIndex(infoTableRowIndex, infoTableRowData); 
      }
      else if(command==STATIC.EraseRowAtIndex){
        myUI.InfoTables[statics_to_obj[dest]].eraseRowAtIndex(infoTableRowIndex); 
      }
      else if(command==STATIC.SetHighlightAtIndex){
        myUI.InfoTables[statics_to_obj[dest]].setHighlightAtIndex(infoTableRowIndex); 
      }
      if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowPri ){
        myUI.PseudoCode.highlightPri(pseudoCodeRow);
      }  
      if(dest == STATIC.PC && command == STATIC.HighlightPseudoCodeRowSec ){
        myUI.PseudoCode.highlightSec(pseudoCodeRow);
      }  /* */  
      }catch(e){
        if(dest!=STATIC.PC){
          console.log(e);
          console.log(STATIC_COMMANDS[command], STATIC_DESTS[dest], "failed");
          console.log(step.slice(i, j));
          debugger;
        }
      }
      
      i=j;
    }
    if(myUI.map_width<=64 && myUI.map_height<=64) 
      myUI.updateInfoMap(myUI.planner.infoMapPlannerMode(),...myUI.currentCoord);
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
	let steps = myUI.step_data.fwd.data,
		indexMap = myUI.step_data.fwd.map, 
		combinedMap = myUI.step_data.fwd.combined;
	
  myUI.step_data.bck.data = [];
  myUI.step_data.bck.map = [];
	myUI.step_data.bck.combined = [];
  if(genStates)  myUI.states = [];
  console.log("myUI.stateFreq:",myUI.stateFreq);
  const stateFreq = myUI.stateFreq;
	let stepCnt=0;
	let revCombinedCnt = 0;

  //let mem = {canvasCoords:{}, drawSinglePixel:{}, fullCanvas:{}, arrowColor:{}, bounds:{}};
  let mem = {activeCanvas:{}, activeTable:{}, drawSinglePixel:{}, arrowColor:{}, bounds:{}};
  Object.values(myUI.canvases).forEach(canvas=>canvas.init_virtual_canvas());
  Object.values(myUI.InfoTables).forEach(tb=>tb.tableContainer.style.display = "none");

  let size=100, interval = 0;

  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(nextGenSteps(size)), interval);
  });

  function finishGenerating(){
    for(const [dest, bounds] of Object.entries(mem.bounds)){
      if(myUI.canvases[statics_to_obj[dest]].minVal==null) myUI.canvases[statics_to_obj[dest]].setValueBounds("min", bounds[0]);
      if(myUI.canvases[statics_to_obj[dest]].maxVal==null) myUI.canvases[statics_to_obj[dest]].setValueBounds("max", bounds[1]);
    }
    Object.values(myUI.InfoTables).forEach(tb=>tb.tableContainer.style.display = "table");
    myUI.reset_animation();
    myUI.mem = mem;
    return 0;
  }

  function nextGenSteps(nxtSize){
    while(nxtSize--){
      if(stepCnt==indexMap.length) return finishGenerating();
      let step = steps.slice(indexMap[stepCnt], indexMap[stepCnt+1]);
      if(isNaN(step[0])) return finishGenerating();
      let i=0;
      myUI.step_data.bck.map.push(myUI.step_data.bck.data.length);
      while(i<step.length){

        // this is implementation specific for compressed actions
        let j=i+1;
        while(j<step.length && !(Number.isInteger(step[j]) && step[j]&1))
          ++j;
        // [i,j) is the action length
        
        let [command, dest, x, y, colorIndex, arrowIndex, pseudoCodeRow, infoTableRowIndex, infoTableRowData, cellVal] = GridPathFinder.unpackAction(step.slice(i, j));

        let action = [];
        var includeAction = true;

        // saving minmax
        if(cellVal!==undefined && myUI.canvases[statics_to_obj[dest]].valType=="float"){
          mem.bounds[dest] = mem.bounds[dest] || [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
          if(myUI.canvases[statics_to_obj[dest]].minVal==null) mem.bounds[dest][0] = Math.min(mem.bounds[dest][0], cellVal);
          if(myUI.canvases[statics_to_obj[dest]].maxVal==null) mem.bounds[dest][1] = Math.max(mem.bounds[dest][1], cellVal);
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
          } catch(e){
            console.log(statics_to_obj[dest]);
            debugger;
          }
          myUI.canvases[statics_to_obj[dest]].draw_pixel([x,y], true, cellVal, cellVal-1, false);
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
          action = GridPathFinder.packAction({command: STATIC.DP, dest: dest, nodeCoord: [x,y], cellVal: myUI.canvases[statics_to_obj[dest]].virtualCanvas[x][y]});
          myUI.canvases[statics_to_obj[dest]].erase_pixel([x,y], true, false);
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
          let height = myUI.canvases[statics_to_obj[dest]].virtualCanvas.length;
          let width = myUI.canvases[statics_to_obj[dest]].virtualCanvas[0].length;
          let canvasDefaultVal = myUI.canvases[statics_to_obj[dest]].defaultVal;
          for(let i=0;i<height;++i){
            for(let j=0;j<width;++j){
              if(myUI.canvases[statics_to_obj[dest]].virtualCanvas[i][j]!=canvasDefaultVal){
                let subAction = GridPathFinder.packAction({command: STATIC.DP, dest: dest, nodeCoord: [i,j]});
                Array.prototype.push.apply(action, subAction);
              }
            }
          }
          myUI.canvases[statics_to_obj[dest]].erase_canvas(true);
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
          let prevHighlight = myUI.InfoTables[statics_to_obj[dest]].insertRowAtIndex(infoTableRowIndex, infoTableRowData); 
          action = GridPathFinder.packAction({command: STATIC.EraseRowAtIndex, dest: dest, infoTableRowIndex: infoTableRowIndex});
          if(prevHighlight)
            Array.prototype.push.apply(action, GridPathFinder.packAction({command: STATIC.SetHighlightAtIndex, dest: dest, infoTableRowIndex: prevHighlight}));
        }
        else if(command==STATIC.EraseRowAtIndex){
          let [data, toHighlight] = myUI.InfoTables[statics_to_obj[dest]].eraseRowAtIndex(infoTableRowIndex);
          action = GridPathFinder.packAction({command: STATIC.InsertRowAtIndex, dest: dest, infoTableRowIndex: toHighlight?infoTableRowIndex:infoTableRowIndex*-1, infoTableRowData: data});
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
        // add more here
        if(includeAction)
          Array.prototype.push.apply(myUI.step_data.bck.data, action);
        i=j;
      }
      revCombinedCnt++;
      myUI.step_data.bck.combined.push(revCombinedCnt);
      if(combinedMap[stepCnt]==1) revCombinedCnt = 0;
      ++stepCnt;

      if(genStates && stepCnt%stateFreq==0){
        if(stepCnt/stateFreq % 100==0) console.log("State", stepCnt/stateFreq);
        document.getElementById("compute_btn").innerHTML = `optimizing... ${(stepCnt/indexMap.length*100).toPrecision(3)}%`;
        let nextState = {canvas:{}, infotables:{}};
        // canvas
        for(const canvas of Object.values(mem.activeCanvas)){
          if(canvas===undefined){
            console.log("CANVAS UNDEFINED", canvas);
            continue;
          }
          if(canvas.valType=="float"){
            nextState.canvas[canvas.id] = deep_copy_matrix(canvas.virtualCanvas, false, true);
          }
          else{
            /*
            if(canvas.maxVal==1) var mat = BitMatrix.compress_bit_matrix(canvas.virtualCanvas);
            else var mat = NBitMatrix.compress_matrix(canvas.virtualCanvas, canvas.maxVal);*/
            //if(canvas.id=="visited") debugger;
            let mat = NBitMatrix.compress_matrix(canvas.virtualCanvas, canvas.maxVal);
            nextState.canvas[canvas.id] = mat.get_truncated_data();
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

        myUI.states.push(nextState);
      }
    }
    
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(nextGenSteps(size)), interval);
    });
  }
}

myUI.updateInfoMap = function(infoMapPlannerMode,x,y){
  if(infoMapPlannerMode == "none"){
    
  }

  if(infoMapPlannerMode != "none"){
    
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
  }
}

myUI.jump_to_step = function(target_step){
  //if(document.getElementById("compute_btn").innerHTML!=`Compute Path`) return;
  /*
  if state exists:
    load state
    draw state to whatever
  run the remaning steps
  */
  target_step = target_step===undefined ? myUI.animation.step : target_step;
  myUI.target_step = target_step;
  let idx = -1;
  for(const table of Object.values(myUI.InfoTables)) table.removeAllTableRows();
  for(const canvas of Object.values(myUI.dynamicCanvas)) canvas.erase_canvas();
  for(const elem of myUI.arrow.elems)
    elem.classList.add("hidden");

  // if state exists
  if(target_step>=myUI.stateFreq){
    idx = Math.floor(target_step/myUI.stateFreq)-1;
    let state = myUI.states[idx];
    // arrows
    for(const [arrowId, colorId] of Object.entries(state.arrowColor)){
      myUI.arrow.elems[arrowId].classList.remove("hidden");
      myUI.arrow.elems[arrowId].style.fill = myUI.arrow.colors[colorId];
    }

    // infotables
    for(const [tableId, tableData] of Object.entries(state.infotables)){
      myUI.InfoTables[tableId].removeAllTableRows();
      myUI.InfoTables[tableId].highlightRow = tableData[0];
      const rowSize = tableData[1];
      for(let i=2;i<tableData.length;i+=rowSize){
        let idx = -myUI.InfoTables[tableId].rows.length-1;
        myUI.InfoTables[tableId].insertRowAtIndex(idx, tableData.slice(i, i+rowSize));
      }
    }
    // pseudocode
    try{
      myUI.PseudoCode.highlightPri(state.pseudoCodeRowPri);
      myUI.PseudoCode.highlightSec(state.pseudoCodeRowSec);
    }
    catch(e){

    }
    // canvases

    let canvasesToDraw = Object.entries(state.canvas);
    function drawNextCanvas(canvasNo){
      if(canvasNo==-1) return -1;
      if(canvasNo==canvasesToDraw.length) return finishJumping();
      let [id,data] = canvasesToDraw[canvasNo];
      document.getElementById("compute_btn").innerHTML = `drawing ${id}...`;
      if(data.constructor==Array) var toDraw = data; // for 2d arrays (floats, etc.)
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
    myUI.animation.step = (idx+1)*myUI.stateFreq-1;
    myUI.run_steps(target_step-myUI.animation.step, "fwd");
    document.getElementById("compute_btn").innerHTML = `Compute Path`;
    myUI.update_search_slider(target_step);
  }
}
