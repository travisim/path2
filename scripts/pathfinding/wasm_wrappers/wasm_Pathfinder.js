class wasm_Pathfinder extends Pathfinder{

  _run_next_search(){
    let finished;
    try{
      finished = this.wasmPlanner.runNextSearch(this.batch_size);
      if(finished){
        return this._finish_searching();
      }
      
      let planner = this;
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(planner._run_next_search()), planner.batch_interval);
      });
    }
    catch(e){
      console.log(`ERROR ${this.constructor.display_name} FAILED`);
      console.log(e);
      let t = Date.now() - myUI.startTime;
      console.log(t);
      let n = this.wasmPlanner.stepIndex;
      console.log("Number of steps before error: ",n);
      console.log(n/t);
      alert("Something went wrong during searching");
      return this._finish_searching();
    }
  }

  _finish_searching(){
    // this uses the struct implementation of steps & actions in c++ wasm
    console.log(Date.now() - myUI.startTime);
    
    console.log("getting cell map now");
    this.cell_map = new Empty2D(0, 0, 0, this.wasmPlanner.cellMap);  // override using emscripten version

    console.log("getting arrow coords now");
    // since c++ cannot create arrows, we need to do it here
    // possible to export the javascript create_arrow function, will do so after the c++ A* is finalized
    let arrows = this.wasmPlanner.arrowCoords;
    for(let i = 0; i < arrows.size(); ++i){
      let arrow_data = vec_to_arr(arrows.get(i));
      let start = arrow_data.slice(0, 2), end = arrow_data.slice(2);
      myUI.create_arrow(start, end);
    }

    // draw vertices and edges from vertex and edge stores
    let obj = map_to_obj(this.wasmPlanner.vertexStore);
    for(const [dest, vertices] of Object.entries(obj)){
      for (const vertex of vec_to_arr(vertices)) {
        console.log(vertex.radius)
        myUI.nodeCanvas.drawCircle([vertex.nodeCoord.x, vertex.nodeCoord.y], this.destsToId[dest], false, vertex.colorIndex, vertex.radius);
      }
    }

    console.log("WASM EDGESTORE:", this.wasmPlanner.edgeStore);
    obj = map_to_obj(this.wasmPlanner.edgeStore);
    for(const [dest, edges] of Object.entries(obj)){
      for(const edge of vec_to_arr(edges)){
        myUI.edgeCanvas.drawLine([edge.nodeCoord.x, edge.nodeCoord.y], [edge.endCoord.x, edge.endCoord.y], this.destsToId[dest], false, edge.colorIndex, edge.lineWidth);
      }
    }

    return this._terminate_search();
  }

  getStep(stepNo){
    return myUI.planner.wasmPlanner.getStep(stepNo);
  }

  clearMapNodes(){
    if(this.wasmPlanner){
      this.wasmPlanner.clearMapNodes();
    }
	}
}

class wasm_GridPathfinder extends GridPathfinder{

  _run_next_search(){
    let finished;
    try{
      finished = this.wasmPlanner.runNextSearch(this.batch_size);
      if(finished){
        return this._finish_searching();
      }
      let planner = this;
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(planner._run_next_search()), planner.batch_interval);
      });
    }
    catch(e){
      console.log(`ERROR ${this.constructor.display_name} FAILED`);
      console.log(e);
      let t = Date.now() - myUI.startTime;
      console.log(t);
      let n = this.wasmPlanner.stepIndex;
      console.log("Number of steps before error: ",n);
      console.log(n/t);
      alert("Something went wrong during searching");
      return this._finish_searching();
    }
  }

  _finish_searching(){
    // this uses the struct implementation of steps & actions in c++ wasm
    console.log(Date.now() - myUI.startTime);
    
    console.log("getting cell map now");
    this.cell_map = new Empty2D(0, 0, 0, this.wasmPlanner.cellMap);  // override using emscripten version

    console.log("getting arrow coords now");
    // since c++ cannot create arrows, we need to do it here
    // possible to export the javascript create_arrow function, will do so after the c++ A* is finalized
    let arrows = this.wasmPlanner.arrowCoords;
    for(let i = 0; i < arrows.size(); ++i){
      let arrow_data = vec_to_arr(arrows.get(i));
      let start = arrow_data.slice(0, 2), end = arrow_data.slice(2);
      myUI.create_arrow(start, end);
    }

    // draw vertices and edges from vertex and edge stores
    let obj = map_to_obj(this.wasmPlanner.vertexStore);
    for(const [dest, vertices] of Object.entries(obj)){
      for(const vertex of vec_to_arr(vertices)){
        myUI.nodeCanvas.drawCircle([vertex.nodeCoord.x, vertex.nodeCoord.y], this.destsToId[dest], false, vertex.colorIndex, vertex.radius);
      }
    }

    obj = map_to_obj(this.wasmPlanner.edgeStore);
    for(const [dest, edges] of Object.entries(obj)){
      for(const edge of vec_to_arr(edges)){
        myUI.edgeCanvas.drawLine([edge.nodeCoord.x, edge.nodeCoord.y], [edge.endCoord.x, edge.endCoord.y], this.destsToId[dest], false, edge.colorIndex, edge.opacity);
      }
    }
    
    return this._terminate_search();
  }

  getStep(stepNo){
    return myUI.planner.wasmPlanner.getStep(stepNo);
  }
}