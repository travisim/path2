class BFS extends GridPathFinder {

  static get display_name() {
    return "Breadth-First Search (BFS)";
  }

  constructor(num_neighbours = 8, diagonal_allow = true, first_neighbour = "N", search_direction = "anticlockwise") {
    super(num_neighbours, diagonal_allow, first_neighbour, search_direction);
  }

  search(start, goal) {
    // this method finds the path using the prescribed map, start & goal coordinates
    this.start = start; //in array form [y,x]  [0,0] is top left  [512,512] is bottom right
    this.goal = goal;
    this.queue = [];  // BFS uses a FIFO queue to order the sequence in which nodes are visited
    this.queue_cache = []; // used to store states
    this.neighbours = [];  // current cell's neighbours; only contains passable cells
    this.path = null;
    this.steps = [];
    this.steps_forward = [];
    this.steps_inverse = [];
    this.requires_uint16 = this.map_height > 255 || this.map_width > 255 ? true : false;
    this.states_nums = new Set(); // stores the unique ids of each state// only used for DB
    this.states = {};
    this.states_arr = [];

    // generate empty 2d array
    this.queue_matrix = zero2D(this.map_height, this.map_width); // initialise a matrix of 0s (zeroes), height x width
    this.visited = new BitMatrix(this.map_height, this.map_width);
    this.searched = false;

    let step_counter = 0;
    let step_index = 0;
    let state_counter = 0;
    let simple_counter = 0;
    this.arrow_step = -1;
    // counter is used to count the number of times a step is created
    // at every ~100 steps, a state is saved
    // this balances between processer and memory usage


    console.log("starting");
    let start_node = new Node(null, null, null, null, this.start);
    //var found = false;  // once the program exits the while-loop, this is the variable which determines if the endpoint has been found
    /* ^ deprecated, used a this.path variable to assign */
    this.queue.push(start_node);  // begin with the start; add starting node to rear of []
    //---------------------checks if visited 2d array has been visited

    while (this.queue.length) {  // while there are still nodes left to visit
      if (this.current_node_YX)
        this.prev_node_YX = this.current_node_YX
      this.current_node = this.queue.shift(); // remove the first node in queue
      this.current_node_YX = this.current_node.self_YX; // first node in queue YX
      /*if the current node has already been visited, we can move on to the next node*/
      /*console.log("current");
      console.log(this.current_node_YX);
      console.log("visited?")
      if(this.visited[this.current_node_YX[0]][this.current_node_YX[1]]) console.log("true");
      else console.log("false");*/

      /* NEW */

      let step_fwd = [];
      let step_bck = [];
      step_fwd.push(new Uint8Array([STATIC.SIMPLE]));
      step_fwd.push(new Uint8Array([STATIC.EC, STATIC.CR]));
      step_fwd.push(new Uint8Array([STATIC.EC, STATIC.NB]));
      step_bck.push(new Uint8Array([STATIC.SIMPLE]));
      step_bck.push(new Uint8Array([STATIC.EC, STATIC.CR]));
      let items = { fwd: [], bck: [] };
      items.fwd.push([STATIC.DP, STATIC.CR, this.current_node_YX[0], this.current_node_YX[1]]);
      items.fwd.push([STATIC.DP, STATIC.VI, this.current_node_YX[0], this.current_node_YX[1]]);
      items.fwd.push([STATIC.EP, STATIC.QU, this.current_node_YX[0], this.current_node_YX[1]]);
      items.bck.push([STATIC.EP, STATIC.VI, this.current_node_YX[0], this.current_node_YX[1]]);
      items.bck.push([STATIC.DP, STATIC.QU, this.current_node_YX[0], this.current_node_YX[1]]);
      if (this.prev_node_YX) {
        items.bck.push([STATIC.DP, STATIC.CR, this.prev_node_YX[0], this.prev_node_YX[1]]);
        this.neighbours.forEach(neighbour => {
          items.bck.push([STATIC.DP, STATIC.NB, neighbour.self_YX[0], neighbour.self_YX[1]]);
        });
      }
      /* check if map size > 255, then use uint16 */
      if (this.requires_uint16) {
        items.fwd.forEach(item => step_fwd.push(new Uint16Array(item)));
        //items.bck.forEach(item=>step_bck.push(new Uint16Array(item)));
      }
      else {
        items.fwd.forEach(item => step_fwd.push(new Uint8Array(item)));
        items.bck.forEach(item => step_bck.push(new Uint8Array(item)));
      }
      //console.log(step_fwd);
      //console.log(step_bck);

      ++step_counter;
      this.steps_forward.push(step_fwd);
      this.steps_inverse.push(step_bck);
      ++simple_counter;


      /* first check if visited */
      //if(this.visited[this.current_node_YX[0]][this.current_node_YX[1]]) continue; // if the current node has been visited, skip to next one in queue
      if (this.visited.get_data(this.current_node_YX)) continue; // if the current node has been visited, skip to next one in queue

      //this.visited[this.current_node_YX[0]][this.current_node_YX[1]] = 1;  // marks current node YX as visited
      this.visited.set_data(this.current_node_YX, 1); // marks current node YX as visited
      /* FOUND GOAL */
      if (this.current_node_YX[0] == this.goal[0] && this.current_node_YX[1] == this.goal[1]) {  // found the goal & exits the loop
        var path = [];
        var curr = this.current_node;
        // retraces the entire parent tree until start is found
        while (curr != null) {
          //console.log(curr.self_YX); 
          path.unshift(curr.self_YX);
          curr = curr.parent;
        }

        //creates array starting from start to goal
        console.log("found");
        this.path = path;

        /* NEW */

        let step_fwd = [];
        step_fwd.push(new Uint8Array([STATIC.SIMPLE]));
        step_fwd.push(new Uint8Array([STATIC.EC, STATIC.CR]));
        step_fwd.push([STATIC.DC, STATIC.PA, this.path, `1d`, false]);

        let step_bck = [];
        step_bck.push(new Uint8Array([STATIC.SIMPLE]));
        step_bck.push(new Uint8Array([STATIC.EC, STATIC.PA]));
        if (this.requires_uint16) step_bck.push(new Uint16Array([STATIC.DP, STATIC.CR, this.current_node_YX[0], this.current_node_YX[1]]));
        else step_bck.push(new Uint8Array([STATIC.DP, STATIC.CR, this.current_node_YX[0], this.current_node_YX[1]]));

        ++step_counter;
        this.steps_forward.push(step_fwd);
        this.steps_inverse.push(step_bck);
        ++simple_counter;

        this.steps_forward.push([new Uint8Array([STATIC.SIMPLE])]);
        this.steps_inverse.push([new Uint8Array([STATIC.SIMPLE])]);
        break;
      }
      // NOTE, a node is only visited if all its neighbours have been added to the queue
      this.neighbours = [];  // reset the neighbours for each new node
      //console.log("next");

      var surrounding_map_deltaNWSE = [];
      for (var i = 0; i < this.num_neighbours; ++i) {
        var next_YX_temp = [this.current_node_YX[0] + this.delta[i][0], this.current_node_YX[1] + this.delta[i][1]];
        if (next_YX_temp[0] < 0 || next_YX_temp[0] >= this.map_height || next_YX_temp[1] < 0 || next_YX_temp[1] >= this.map_width) continue;
        if (this.map[next_YX_temp[0]][next_YX_temp[1]] == 1) {
          surrounding_map_deltaNWSE.push(this.deltaNWSE[i]);
        }
      }

      /* iterates through the 4 or 8 neighbours and adds the valid (passable & within boundaries of map) ones to the queue & neighbour array */
      for (var i = 0; i < this.num_neighbours; ++i) {
        var next_YX = [this.current_node_YX[0] + this.delta[i][0], this.current_node_YX[1] + this.delta[i][1]];  // calculate the coordinates for the new neighbour
        if (next_YX[0] < 0 || next_YX[0] >= this.map_height || next_YX[1] < 0 || next_YX[1] >= this.map_width) continue;  // if the neighbour not within map borders, don't add it to queue
        /* second check if visited */
        //if(this.visited[next_YX[0]][next_YX[1]]) continue; // if the neighbour has been visited, don't add it to queue
        if (this.visited.get_data(next_YX)) continue; // if the neighbour has been visited, don't add it to queue
        if (this.map[next_YX[0]][next_YX[1]] == 1) {  // if neighbour is passable & not visited
          if (this.diagonal_allow == true && this.num_neighbours == 8) {


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

          var next_node = new Node(null, null, null, this.current_node, next_YX);  // create a new node with said neighbour's details
          this.neighbours.push(next_node);  // add to neighbours

          /* NEW */

          let step_fwd = [];
          let step_bck = [];
          if (this.requires_uint16) {
            step_fwd.push(new Uint16Array([STATIC.DP, STATIC.NB, next_YX[0], next_YX[1]]));
            step_bck.push(new Uint16Array([STATIC.EP, STATIC.NB, next_YX[0], next_YX[1]]));
          }
          else {
            step_fwd.push(new Uint8Array([STATIC.DP, STATIC.NB, next_YX[0], next_YX[1]]));
            step_bck.push(new Uint8Array([STATIC.EP, STATIC.NB, next_YX[0], next_YX[1]]));
          }

          if (!this.queue_matrix[next_YX[0]][next_YX[1]]) { // prevent from adding to queue again
            this.queue.push(next_node);  // add to queue
            this.queue_cache.push(next_node);
            this.queue_matrix[next_YX[0]][next_YX[1]] = 1;
            if (this.requires_uint16) {
              step_fwd.push(new Uint16Array([STATIC.DP, STATIC.QU, next_YX[0], next_YX[1]]));
              step_bck.push(new Uint16Array([STATIC.EP, STATIC.QU, next_YX[0], next_YX[1]]));
            }
            else {
              step_fwd.push(new Uint8Array([STATIC.DP, STATIC.QU, next_YX[0], next_YX[1]]));
              step_bck.push(new Uint8Array([STATIC.EP, STATIC.QU, next_YX[0], next_YX[1]]));
            }
            /* ARROW */
            ++this.arrow_step;
            myUI.create_arrow(this.current_node_YX , next_YX);
            step_fwd.push(new Uint16Array([STATIC.DA]));
            step_bck.push(new Uint16Array([STATIC.EA]));
            /* END OF ARROW */
          }
          ++step_counter;
          this.steps_forward.push(step_fwd);
          this.steps_inverse.push(step_bck);

        }
      }
      /*
      
            if (this.diagonal_allow == true && this.num_neighbours == 8){  
              var neighbours_deltaNWSE = [];
              var relative_delta = [];
              var neighbours_array = nodes_to_array(this.neighbours, "self_YX")
              for(var i=0;i<neighbours_array.length;++i){
                var relative_delta = [neighbours_array[i][0]-this.current_node_YX[0], neighbours_array[i][1]-this.current_node_YX[1]];
              
                for(var j=0;j<this.delta.length;++j){
                  if (String(this.delta[j]) == String(relative_delta)){
                    var index_of_current_YX_in_delta = j;
                    break;
                  }
                }
                neighbours_deltaNWSE.push(this.deltaNWSE[index_of_current_YX_in_delta]);
                  
                //current_delta.push contains array of valid this.deltaNWSE
              }
      
              var surrounding_map_deltaNWSE = [];
              for(var i=0;i<this.num_neighbours;++i){
                var next_YX = [this.current_node_YX[0]+this.delta[i][0], this.current_node_YX[1]+this.delta[i][1]];
                if(next_YX[0]<0 || next_YX[0]>=this.map_height || next_YX[1]<0 || next_YX[1]>=this.map_width) continue;
                if (this.map[next_YX[0]][next_YX[1]] == 1){
                  surrounding_map_deltaNWSE.push(this.deltaNWSE[i]);
                }
              }
      
              for(var i = 0; i<this.neighbours.length; i++){ 
                if (neighbours_deltaNWSE[i] == "NW"){ 
                  if(!(surrounding_map_deltaNWSE.includes("N") || surrounding_map_deltaNWSE.includes("W"))){
                    this.queue.splice(-(this.neighbours.length-i), 1); 
                    this.neighbours.splice(i, 1);
                  }        
                } 
                else if(neighbours_deltaNWSE[i] == "SW"){
                  if(!(surrounding_map_deltaNWSE.includes("S") || surrounding_map_deltaNWSE.includes("W"))){
                    this.queue.splice(-(this.neighbours.length-i), 1); 
                    this.neighbours.splice(i, 1);
                  }  
                } 
                else if(neighbours_deltaNWSE[i] == "SE"){
                  if(!(surrounding_map_deltaNWSE.includes("S") || surrounding_map_deltaNWSE.includes("E"))){
                    this.queue.splice(-(this.neighbours.length-i), 1); 
                    this.neighbours.splice(i, 1);
                  }
                } 
                else if(neighbours_deltaNWSE[i] == "NE"){
                  if(!(surrounding_map_deltaNWSE.includes("N") || surrounding_map_deltaNWSE.includes("E"))){
                    this.queue.splice(-(this.neighbours.length-i), 1); 
                    this.neighbours.splice(i, 1);
                  }
                } 
              }
            }
            */

      // [node YX, FGH cost, arrayof queue, 2d array of current visited points, valid neighbours array, visited array]
      if (step_counter >= 20) {
        step_index += step_counter;
        step_counter = 0;
        ++state_counter;
        //if (state_counter % 100 == 0) console.log(`reached state ${state_counter}, step ${step_index}`);
        if(step_index>400 && step_index<434){
          console.log(this.current_node_YX);
          console.log(BitMatrix.expand_2_matrix(this.visited.data));
        }
        // add state
        if (myUI.db_on) {
          if (state_counter % 1000 == 0) {
            myUI.storage.add("states", this.states_arr);
            this.states_arr = [];
          }
          this.states_arr.push({ id: step_index-1, node_YX: this.current_node.self_YX, F_cost: this.current_node.f_value, G_cost: null, H_cost: null, queue: nodes_to_array(this.queue, "self_YX"), neighbours: nodes_to_array(this.neighbours, "self_YX"), visited: this.visited.copy_data(), path: this.path, arrow_step: this.arrow_step });
          //myUI.storage.add("states", [{id: step_index, node_YX: this.current_node.self_YX, F_cost:this.current_node.f_value, G_cost:null, H_cost:null, queue: nodes_to_array(this.queue, "self_YX"), neighbours: nodes_to_array(this.neighbours, "self_YX"), visited: this.visited.copy_data(), path: this.path}]);
          this.states_nums.add(step_index-1);
        }
        else {
          this.states[step_index-1] = { node_YX: this.current_node.self_YX, F_cost: this.current_node.f_value, G_cost: null, H_cost: null, queue: nodes_to_array(this.queue, "self_YX"), neighbours: nodes_to_array(this.neighbours, "self_YX"), visited: this.visited.copy_data(), path: this.path, arrow_step: this.arrow_step };
        }

      }

    }
    if (this.path == null) console.log("path does not exist");
    myUI.sliders["search_progress_slider"].elem.max = this.steps.length;
    this.searched = true;
    return this.path;
  }

  final_state() {
    if (!this.start) return alert("haven't computed!");
    return { path: this.path, queue: this.queue, visited: this.visited.copy_data(), arrow_step: this.arrow_step};
  }

  all_steps(bck = false) {
    if (this.searched) {
      if (bck) return this.steps_inverse;
      else return this.steps_forward;
    }
    return null;
  }

  all_states() {
    if (this.searched) return myUI.db_on ? this.states_nums : this.states;
    return null;
  }

}