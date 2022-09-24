'use strict';

class A_star extends GridPathFinder{

	static get display_name(){
		return "A star";
  }
  display_table_header_name(){
		return ["Queue No","Vertex","Parent","F cost","G cost","H cost"];
  }
  infoMapPlannerMode(){
    return "A_star";
  }
  

  static get distance_metrics(){
    return ["Euclidean", "Manhattan", "Chebyshev"];
  }

  constructor(num_neighbors = 8, diagonal_allow = true, first_neighbour = "N", search_direction = "anticlockwise") {
    super(num_neighbors, diagonal_allow, first_neighbour, search_direction);
  }

  set_distance_metric(metric){
    this.distance_metric = metric;
  }
  
  calc_cost(successor){
    function manhattan(c1, c2){
      return Math.abs(c1[0]-c2[0]) + Math.abs(c1[1]-c2[1]);
    }

    function euclidean(c1, c2){
      return Math.hypot(c1[0]-c2[0], c1[1]-c2[1]);
    }
    
    function chebyshev(c1, c2){
      return Math.max(Math.abs(c1[0]-c2[0]), Math.abs(c1[1]-c2[1]));
    }

    if(this.distance_metric == "Manhattan"){
      var g_cost = this.current_node.g_cost + manhattan(this.current_node.self_XY, successor);
      var h_cost = manhattan(successor, this.goal);
    }
    else if(this.distance_metric == "Euclidean"){
      var g_cost = this.current_node.g_cost + euclidean(this.current_node.self_XY, successor);
      var h_cost = euclidean(successor, this.goal);
    }
    else if(this.distance_metric == "Chebyshev"){
      var g_cost = this.current_node.g_cost + chebyshev(this.current_node.self_XY, successor);
      var h_cost = chebyshev(successor, this.goal);
    }

    var f_cost = g_cost + h_cost;//++ from bfs.js
    return [f_cost, g_cost, h_cost];
  }

  search(start, goal) {
    // this method finds the path using the prescribed map, start & goal coordinates
    this._init_search(start, goal);
		this.closed_list =  new Empty2D(this.map_height, this.map_width);
		this.open_list =  new Empty2D(this.map_height, this.map_width);
    // "Producing Code" (May take some time)

    console.log("starting");
    let start_node = new Node(0, 0, 0, null, this.start, undefined, 0);
    this.queue.push(start_node);  // begin with the start; add starting node to rear of []
    this.open_list.set(start_node.self_XY, start_node);
    //---------------------checks if visited 2d array has been visited

    let planner = this;

    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search(planner, planner.batch_size)), planner.batch_interval);
    });
  }

  _run_next_search(planner, num) {
    while (num--) {
      // while there are still nodes left to visit
      if (this.queue.length == 0) return this._terminate_search();
           //++ from bfs.js
      this.queue.sort(function (a, b){return a.f_cost - b.f_cost});   
      //++ from bfs.js
      
      if (this.current_node){// if second node and on 
       
        this.prev_g_cost = this.current_node.g_cost;
        this.prev_h_cost = this.current_node.h_cost;
        this.prev_node_XY = this.current_node_XY;
      }
        
      /*
      
      this._create_action({command: STATIC.HighlightPseudoCodeRowSec, dest: STATIC.PC,pseudoCodeRow: 11});
      this._save_step("fwd");*/
      
      this.current_node = this.queue.shift(); // remove the first node in queue
      this.current_node_XY = this.current_node.self_XY; // first node in queue XY
      this.open_list[this.current_node_XY] = undefined;
      
      /* first check if visited */
      if (this.visited.get_data(this.current_node_XY)>0){
        this.visited.increment(this.current_node_XY);
        this.visited_incs.push(this.current_node_XY);
        continue;  // if the current node has been visited, skip to next one in queue
      }/* */
      this.visited.increment(this.current_node_XY); // marks current node XY as visited

      
      this._create_action({command: STATIC.EC, dest: STATIC.DT});
      this._create_action({command: STATIC.DP, dest: STATIC.DT, nodeCoord: this.current_node_XY});
      this._create_action({command: STATIC.EC, dest: STATIC.CR});
      this._create_action({command: STATIC.EC, dest: STATIC.NB});
      this._create_action({command: STATIC.DP, dest: STATIC.CR, nodeCoord: this.current_node_XY});
      this._create_action({command: STATIC.DICR, dest: STATIC.ICR, nodeCoord: this.current_node_XY});
      this._create_action({command: STATIC.OutTop, dest: STATIC.IT});
      this._create_action({command: STATIC.INC_P, dest: STATIC.VI, nodeCoord: this.current_node_XY});
      this._create_action({command: STATIC.EP, dest: STATIC.QU, nodeCoord: this.current_node_XY});
      this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: STATIC.PC, pseudoCodeRow: 12});
      this.visited_incs.forEach(coord=>this._create_action({command: STATIC.INC_P, dest: STATIC.VI, nodeCoord: coord}));
      this._save_step("fwd", true);
      /*
      
      this._create_action(STATIC.SIMPLE);
      this._create_action(STATIC.EC, STATIC.CR);
      this._create_action(STATIC.EC, STATIC.NB);
      this._create_action(STATIC.DP, STATIC.CR, this.current_node_XY);
      this._create_action(STATIC.DICRF, STATIC.ICR, this.current_node_XY);
      this._create_action(STATIC.OutTop, STATIC.DIT);
      //this._create_action(STATIC.DP, STATIC.VI, this.current_node_XY);
      this._create_action(STATIC.INC_P, STATIC.VI, this.current_node_XY);
      this._create_action(STATIC.EP, STATIC.QU, this.current_node_XY);
      this.visited_incs.forEach(coord=>this._create_action(STATIC.INC_P, STATIC.VI, coord));
      //setTimeout( console.log("step_index","current",this.step_index),1000)
      this._save_step("fwd");*/

      
      this._create_action({command: STATIC.EC, dest: STATIC.CR});
      this._create_action({command: STATIC.EP, dest: STATIC.VI, nodeCoord: this.current_node_XY});
      this._create_action({command: STATIC.DP, dest: STATIC.QU, nodeCoord: this.current_node_XY});
      if(this.prev_node_XY){
        this._create_action({command: STATIC.DP, dest: STATIC.CR, nodeCoord: this.prev_node_XY});
        this._create_action({command: STATIC.DICR, dest: STATIC.ICR, nodeCoord: this.prev_node_XY});
        this._create_action({command: STATIC.InTop, dest: STATIC.IT, nodeCoord: this.current_node_XY, stepIndex: this.current_node.id, hCost: this.current_node.h_cost.toPrecision(5), gCost: this.current_node.g_cost.toPrecision(5), parentCoord: this.prev_node_XY});
        for(let i=0;i<this.neighbors.length;++i){
          this._create_action({command: STATIC.DP, dest: STATIC.NB, nodeCoord: this.neighbors[i].self_XY});
          this._create_action({command: STATIC.DIM, dest: this.neighbors_deltaNWSE_STATICS[i], nodeCoord: this.neighbors[i].self_XY, stepIndex: this.neighbors[i].id, hCost: this.neighbors[i].h_cost.toPrecision(5), gCost: this.neighbors[i].g_cost.toPrecision(5), parentCoord: this.current_node_XY});
        }
        this.visited_incs.forEach(coord=>this._create_action({command: STATIC.DEC_P, dest: STATIC.VI, nodeCoord: coord}));
        this._create_action({command: STATIC.EC, dest: STATIC.DT});
        if(this.neighbors.length>0){
          this._create_action({command: STATIC.DP, dest: STATIC.DT, nodeCoord: this.neighbors[0].self_XY});
        }
        else{
          this._create_action({command: STATIC.DP, dest: STATIC.DT, nodeCoord: this.prev_node_XY});
        }
      }
      this._save_step("bck", true);/*

      
      this._create_action(STATIC.SIMPLE);
      this._create_action(STATIC.EC, STATIC.CR);
      this._create_action(STATIC.EP, STATIC.VI, this.current_node_XY);
      //this._create_action(STATIC.DEC_P, STATIC.VI, this.current_node_XY);
      this._create_action(STATIC.DP, STATIC.QU, this.current_node_XY);
      if (this.prev_node_XY) {
        this._create_action(STATIC.DP, STATIC.CR, this.prev_node_XY);
        this._create_action(STATIC.DICRB,STATIC.ICR, this.prev_node_XY);
        this._create_action(STATIC.InTop,STATIC.DIT, this.current_node_XY,this.step_index, this.current_node.h_cost, this.current_node.g_cost,this.prev_node_XY);
        
       for (let i = 0; i < this.neighbors.length; ++i){
          this._create_action(STATIC.DP, STATIC.NB,  this.neighbors[i].self_XY);
          this._create_action(STATIC.DIM, this.neighbors_deltaNWSE_STATICS[i],this.neighbors[i].self_XY,this.step_index,this.neighbors[i].h_cost, this.neighbors[i].g_cost,this.current_node_XY);
        }
      }
      this.visited_incs.forEach(coord=>this._create_action(STATIC.DEC_P, STATIC.VI, coord));
      this._save_step("bck");/* */
     

      /* FOUND GOAL */
      if(this._found_goal(this.current_node)) return this._terminate_search(); // found the goal & exits the loop

      this.visited_incs = []; // reset visited_incs after adding them

      // NOTE, a node is only visited if all its neighbors have been added to the queue
      this.neighbors = [];
      this.neighbors_deltaNWSE_STATICS = [];
      var surrounding_map_deltaNWSE = [];
      for (let i = 0; i < this.num_neighbors; ++i) {
    /*
      
      this._create_action({command: STATIC.RemoveRowByID, dest: STATIC.PC, pseudoCodeRow: 25});
      this._save_step("fwd");
        */
        var next_XY_temp = [this.current_node_XY[0] + this.delta[i][0], this.current_node_XY[1] + this.delta[i][1]];
        if (next_XY_temp[0] < 0 || next_XY_temp[0] >= this.map_height || next_XY_temp[1] < 0 || next_XY_temp[1] >= this.map_width) continue;
        if(this.map.get_data(next_XY_temp) == 1) surrounding_map_deltaNWSE.push(this.deltaNWSE[i]);
      }
      this.deltaNWSE_STATICS_Temp = [];//temporarily stores the deltaNWSE_STATICS_Temp to allow display of neighbors if stepping backwards from a current node to previous node
      /* iterates through the 4 or 8 neighbors and adds the valid (passable & within boundaries of map) ones to the queue & neighbour array */
      for (let i = 0; i < this.num_neighbors; ++i) {
        var next_XY = [this.current_node_XY[0] + this.delta[i][0], this.current_node_XY[1] + this.delta[i][1]];  // calculate the coordinates for the new neighbour
        if (next_XY[0] < 0 || next_XY[0] >= this.map_height || next_XY[1] < 0 || next_XY[1] >= this.map_width) continue;  // if the neighbour not within map borders, don't add it to queue
        
        if (this.map.get_data(next_XY) == 1) {  // if neighbour is passable
          if (this.diagonal_allow == true && this.num_neighbors == 8) { // if neighbour is not blocked
            if (this.deltaNWSE[i] == "NW") {
              if (!(surrounding_map_deltaNWSE.includes("N") || surrounding_map_deltaNWSE.includes("W"))) {
                continue;
              }
            }
            else if (this.deltaNWSE[i] == "SW") {
              if (!(surrounding_map_deltaNWSE.includes("S") || surrounding_map_deltaNWSE.includes("W"))) {
                continue;
              }
            }
            else if (this.deltaNWSE[i] == "SE") {
              if (!(surrounding_map_deltaNWSE.includes("S") || surrounding_map_deltaNWSE.includes("E"))) {
                continue;
              }
            }
            else if (this.deltaNWSE[i] == "NE") {
              if (!(surrounding_map_deltaNWSE.includes("N") || surrounding_map_deltaNWSE.includes("E"))) {
                continue;
              }
            }
          }

          /* second check if visited */
          if (this.visited.get_data(next_XY)>0) {
            this.visited_incs.push(next_XY);
            this.visited.increment(next_XY);
            continue;  // if the neighbour has been visited or is already in queue, don't add it to queue
          }

          // start to a node, taking into account obstacles
          let [f_cost, g_cost, h_cost] = this.calc_cost(next_XY);
          
          
          let new_node = new Node(f_cost, g_cost, h_cost, this.current_node, next_XY, undefined, this.step_index);

					let open_node = this.open_list.get(next_XY);
					if(open_node !== undefined) if(open_node.f_cost<=f_cost) continue;
					let closed_node = this.closed_list.get(next_XY);
					if(closed_node !== undefined) if(closed_node.f_cost<=f_cost) continue; // do not add to queue if closed list already has a lower cost node
          this.neighbors.unshift(new_node);
          this.neighbors_deltaNWSE_STATICS.unshift(this.deltaNWSE_STATICS[i]);

          this._create_action({command: STATIC.DP, dest: STATIC.FCanvas, nodeCoord: next_XY, cellVal: f_cost});
          this._create_action({command: STATIC.DP, dest: STATIC.GCanvas, nodeCoord: next_XY, cellVal: g_cost});
          this._create_action({command: STATIC.DP, dest: STATIC.HCanvas, nodeCoord: next_XY, cellVal: h_cost});

          /* OLD *//*
          
          this._create_action(STATIC.DP, STATIC.NB, next_XY);
          this._create_action(STATIC.DIM, this.deltaNWSE_STATICS[i], next_XY,this.step_index, h_cost, g_cost,this.current_node_XY);
          this._create_action(STATIC.InTop, STATIC.DIT, next_XY,this.step_index, h_cost, g_cost,this.current_node_XY);
          this._create_action(STATIC.Sort);
          this.deltaNWSE_STATICS_Temp.push(i);
					*/
          /* NEW */
          
          this._create_action({command: STATIC.EC, dest: STATIC.DT});
          this._create_action({command: STATIC.DP, dest: STATIC.DT, nodeCoord: next_XY});
          this._create_action({command: STATIC.DP, dest: STATIC.NB, nodeCoord: next_XY});
          this._create_action({command: STATIC.DIM, dest: this.deltaNWSE_STATICS[i], nodeCoord: next_XY, stepIndex: this.step_index, hCost: h_cost.toPrecision(5), gCost: g_cost.toPrecision(5), parentCoord: this.current_node_XY});
          this._create_action({command: STATIC.InBottom, dest: STATIC.IT, nodeCoord: next_XY, stepIndex: this.step_index, hCost: h_cost.toPrecision(5), gCost: g_cost.toPrecision(5), parentCoord: this.current_node_XY});
          this._create_action({command: STATIC.Sort});
          this._create_action({command: STATIC.HighlightPseudoCodeRowPri, dest: STATIC.PC, pseudoCodeRow: 32});
          this.deltaNWSE_STATICS_Temp.push(i);

					// since A* is a greedy algorithm, it requires visiting of nodes again even if it has already been added to the queue
					// see https://www.geeksforgeeks.org/a-search-algorithm/
					if (this.draw_arrows) {
						// ARROW
            if(open_node!==undefined){ // need to remove the previous arrow drawn and switch it to the new_node
              //this._create_action(STATIC.EA, open_node.arrow_index);
              this._create_action({command: STATIC.EA, arrowIndex: open_node.arrow_index});
              this.arrow_state[open_node.arrow_index] = 0;
            }
            if(closed_node!==undefined){ // need to remove the previous arrow drawn and switch it to the new_node
              //this._create_action(STATIC.EA, closed_node.arrow_index);
              this._create_action({command: STATIC.EA, arrowIndex: closed_node.arrow_index});
              this.arrow_state[closed_node.arrow_index] = 0;
            }
            new_node.arrow_index = myUI.create_arrow(next_XY, this.current_node_XY); // node is reference typed so properties can be modified after adding to queue or open list
            this.arrow_state[new_node.arrow_index] = 1;
						//this._create_action(STATIC.DA, new_node.arrow_index);
            this._create_action({command: STATIC.DA, arrowIndex: new_node.arrow_index});
						// END OF ARROW
					}
          //this._create_action(STATIC.DP, STATIC.QU, next_XY);
          this._create_action({command: STATIC.DP, dest: STATIC.QU, nodeCoord: next_XY});
					this.queue.push(new_node);  // add to queue
					this.open_list.set(next_XY, new_node);  // add to open list
          this._save_step("fwd");

          /* OLD *//*
          
          this._create_action(STATIC.EP, STATIC.NB, next_XY);
          this._create_action(STATIC.EIM, this.deltaNWSE_STATICS[i]);
         // this._create_action(STATIC.EIT, this.deltaNWSE_STATICS[i], next_XY, h_cost, g_cost,this.current_node_XY);
					this._create_action(STATIC.EP, STATIC.QU, next_XY);
					if (this.draw_arrows){
            this._create_action(STATIC.EA, new_node.arrow_index);
            if(open_node!==undefined){ // need to remove the previous arrow drawn and switch it to the new_node
              this._create_action(STATIC.DA, open_node.arrow_index);
              this._create_action(STATIC.DP, STATIC.QU, next_XY);
            }
            if(closed_node!==undefined){ // need to remove the previous arrow drawn and switch it to the new_node
              this._create_action(STATIC.DA, closed_node.arrow_index);
              this._create_action(STATIC.DP, STATIC.QU, next_XY);
            }
          }
          this._save_step("bck");/* */

          
          this._create_action({command: STATIC.EC, dest: STATIC.DT});
          if(this.neighbors.length==1) this._create_action({command: STATIC.DP, dest: STATIC.DT, nodeCoord: this.current_node_XY});
          else this._create_action({command: STATIC.DP, dest: STATIC.DT, nodeCoord: this.neighbors[1].self_XY});
          this._create_action({command: STATIC.EP, dest: STATIC.NB, nodeCoord: next_XY});
          this._create_action({command: STATIC.EIM, dest: this.deltaNWSE_STATICS[i]});
          this._create_action({command: STATIC.RemoveRowByID, dest: STATIC.IT,stepIndex: this.step_index});
					this._create_action({command: STATIC.EP, dest: STATIC.QU, nodeCoord: next_XY});
					if (this.draw_arrows){
            this._create_action({command: STATIC.EA, arrowIndex: new_node.arrow_index});
            if(open_node!==undefined){ // need to remove the previous arrow drawn and switch it to the new_node
              this._create_action({command: STATIC.DA, arrowIndex: open_node.arrow_index});
              this._create_action({command: STATIC.DP, dest: STATIC.QU, nodeCoord: next_XY});
            }
            if(closed_node!==undefined){ // need to remove the previous arrow drawn and switch it to the new_node
              this._create_action({command: STATIC.DA, arrowIndex: closed_node.arrow_index});
              this._create_action({command: STATIC.DP, dest: STATIC.QU, nodeCoord: next_XY});
            }
          }
          this._save_step("bck");

          if(this._found_goal(new_node)) return this._terminate_search();
        }
      }

			this.closed_list.set(this.current_node_XY, this.current_node);

      this._assign_cell_index(this.current_node_XY);

      this._manage_state();
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(planner._run_next_search(planner, planner.batch_size)), planner.batch_interval);
    });
  }
}



