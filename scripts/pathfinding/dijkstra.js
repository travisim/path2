class Dijkstra extends GridPathFinder{

	static get display_name(){
		return "Dijkstra";
	}
	
	constructor(num_neighbours = 8, diagonal_allow = true, first_neighbour = "N", search_direction = "anticlockwise"){
		super(num_neighbours, diagonal_allow, first_neighbour, search_direction); 
	}

  search(start, goal){
    // this method finds the path using the prescribed map, start & goal coordinates
    this.start = start; //in array form [y,x]  [0,0] is top left  [512,512] is bottom right
    this.goal = goal;
		this.queue = [];  // BFS uses a FIFO queue to order the sequence in which nodes are visited
		this.neighbours = [];  // current cell's neighbours; only contains passable cells
    this.path = null;
    this.steps = [];

    this.queue_matrix = Array.from({length: this.map_height}, ()=>new Array(this.map_width).fill(0));  // initialise a matrix of 0s (zeroes), height x width

    this.searched = false;
    
		this.visited = Array.from({length: this.map_height}, ()=>new Array(this.map_width).fill(0));  // initialise a matrix of 0s (zeroes), height x width
		// generate empty 2d array

		console.log("starting");
		let start_node = new Node(null, 0, null, null, this.start);
		//var found = false;  // once the program exits the while-loop, this is the variable which determines if the endpoint has been found
    /* ^ deprecated, used a this.path variable to assign */
		this.queue.push(start_node);  // begin with the start; add starting node to rear of []
    //---------------------checks if visited 2d array has been visited






    
    while(this.queue.length){  // while there are still nodes left to visit
      console.log(nodes_to_array(this.queue, "g_cost"),"a");          //++ from bfs.js
      this.queue.sort(function (a, b){return a.g_cost - b.g_cost});   //++ from bfs.js
      console.log(nodes_to_array(this.queue, "g_cost"),"b");          //++ from bfs.js
      // if not first node
      if(this.current_node_YX){
        this.prev_node_YX = this.current_node_YX
      }
			this.current_node = this.queue.shift(); // remove the first node in queue
			this.current_node_YX = this.current_node.self_YX; // first node in queue YX
			/*if the current node has already been visited, we can move on to the next node*/
      /*console.log("current");
			console.log(this.current_node_YX);
      console.log("visited?")
      if(this.visited[this.current_node_YX[0]][this.current_node_YX[1]]) console.log("true");
      else console.log("false");*/
      
      let step = new UIStep();
      step.add_action(`ec`, `current_YX`);
      step.add_action(`ec`, `neighbours`);
      step.add_action(`dp`, `current_YX`, this.current_node_YX);
      step.add_action(`dp`, `visited`, this.current_node_YX);
      step.add_inverse(`ec`, `current_YX`, this.current_node_YX);
      step.add_inverse(`ep`, `visited`, this.current_node_YX);
      // if not first node
      if(this.prev_node_YX){
        step.add_inverse(`dp`, `current_YX`, this.prev_node_YX);
        this.neighbours.forEach(neighbour=>{
          step.add_inverse(`dp`, `neighbours`, neighbour.self_YX);
        });
      }
      this.steps.push(step);
      
      /* first check if visited */
			if(this.visited[this.current_node_YX[0]][this.current_node_YX[1]]) continue; // if the current node has been visited, skip to next one in queue

      this.visited[this.current_node_YX[0]][this.current_node_YX[1]] = 1;  // marks current node YX as visited
			if(this.current_node_YX[0]==this.goal[0] && this.current_node_YX[1]==this.goal[1]){  // found the goal & exits the loop
        var path = [];
        var curr = this.current_node;
        // retraces the entire parent tree until start is found
        while (curr!=null){
          console.log(curr.self_YX); 
          path.unshift(curr.self_YX);
          curr = curr.parent;
        }

        //creates array starting from start to goal
				console.log("found");
        this.path = path;
        let step = new UIStep();
        step.add_action(`dc`, `path`, this.path, `1d`, false);
        step.add_inverse(`ec`, `path`);
        this.steps.push(step);
				break;
			}
			// NOTE, a node is only visited if all its neighbours have been added to the queue
			this.neighbours = [];  // reset the neighbours for each new node
			//console.log("next");
			/* iterates through the 4 or 8 neighbours and adds the valid (passable & within boundaries of map) ones to the queue & neighbour array */
        //need current node
      var surrounding_map_deltaNWSE = [];
      for(var i=0;i<this.num_neighbours;++i){
        var next_YX_temp = [this.current_node_YX[0]+this.delta[i][0], this.current_node_YX[1]+this.delta[i][1]];
        if(next_YX_temp[0]<0 || next_YX_temp[0]>=this.map_height || next_YX_temp[1]<0 || next_YX_temp[1]>=this.map_width) continue;  
        if (this.map[next_YX_temp[0]][next_YX_temp[1]] == 1){
                surrounding_map_deltaNWSE.push(this.deltaNWSE[i]);
        }
      }
    
      
			for(var i=0;i<this.num_neighbours;++i){
				var next_YX = [this.current_node_YX[0]+this.delta[i][0], this.current_node_YX[1]+this.delta[i][1]];  // calculate the coordinates for the new neighbour
				//console.log(next_YX);
				if(next_YX[0]<0 || next_YX[0]>=this.map_height || next_YX[1]<0 || next_YX[1]>=this.map_width) continue;  // if the neighbour not within map borders, don't add it to queue
        /* second check if visited */
				if(this.visited[next_YX[0]][next_YX[1]]) continue; // if the neighbour has been visited, don't add it to queue
       
				if (this.map[next_YX[0]][next_YX[1]]==1){  // if neighbour is passable & not visited
          if (this.diagonal_allow == true && this.num_neighbours == 8){
           
         
              if (this.deltaNWSE[i] == "NW"){ 
                if(!(surrounding_map_deltaNWSE.includes("N") || surrounding_map_deltaNWSE.includes("W"))){
                 continue;
                }        
              } 
              else if(this.deltaNWSE[i] == "SW"){
                if(!(surrounding_map_deltaNWSE.includes("S") || surrounding_map_deltaNWSE.includes("W"))){
                  continue;
                }  
              } 
              else if(this.deltaNWSE[i] == "SE"){
                if(!(surrounding_map_deltaNWSE.includes("S") || surrounding_map_deltaNWSE.includes("E"))){
                  continue;
                }
              } 
              else if(this.deltaNWSE[i] == "NE"){
              if(!(surrounding_map_deltaNWSE.includes("N") || surrounding_map_deltaNWSE.includes("E"))){
               continue;
              }
            }
          }
        




          // start to a node, taking into account obstacles
          var g_cost = this.current_node.g_cost + ((this.current_node.self_YX[0]-next_YX[0])**2+(this.current_node.self_YX[1]-next_YX[1])**2)**0.5//euclidean //++ from bfs.js
         // var g_cost = this.current_node.g_value + (math.abs(this.current_node.node_YX[0]-next_YX[0])+math.abs(this.current_node.node_YX[1]-next_YX[1]))//manhatten //++ from bfs.js
         
					var next_node = new Node(null, g_cost, null, this.current_node, next_YX);  // create a new node with said neighbour's details
          
         
          
          
          
					
					this.neighbours.push(next_node);  // add to neighbours

          step = new UIStep();
          step.add_action('dp', 'neighbours', next_YX);
          // step.add_action('ia', 'info data');
          step.add_inverse('ep', 'neighbours', next_YX);
          // step.add_inverse('ie', 'info data');

          if(!this.queue_matrix[next_YX[0]][next_YX[1]]){ // prevent from adding to queue again
					  this.queue.push(next_node);  // add to queue
            this.queue_matrix[next_YX[0]][next_YX[1]] = 1;
            step.add_action('dp', 'queue', next_YX);
            // step.add_action('ia', 'info data');
            step.add_inverse('ep', 'queue', next_YX);
            // step.add_inverse('ie', 'info data');
          }
          
          this.steps.push(step);
				}
			}
      /* extra code to check if diagonal blocking *//*
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
              this.neighbours.splice(i, 1);o
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
      // problem cannot push 2d array into object

      //this.states.push({node_YX: this.current_node.self_YX, F_cost:null, G_cost:null, H_cost:null, queue: nodes_to_array(this.queue, "self_YX"), neighbours: nodes_to_array(this.neighbours, "self_YX")}); 

   
      // [node YX, FGH cost, array of queue, 2d array of current visited points, valid neighbours array]

		}
	  if (this.path==null) console.log("path does not exist");
    myUI.sliders["search_progress_slider"].elem.max = this.steps.length;
    this.searched = true;
    return this.path;
  }

  final_state(){
    if(!this.start) return alert("haven't computed!");
    return {path:this.path, queue:this.queue, visited:this.visited};
  }

  all_steps(){
    if(this.searched)
      return this.steps;
    else
      return null;
  }

}

//takes in a array of objects and returns a array of 1 property of the object
 function nodes_to_array(obj_array,property_in_obj){
  var array = [];
  for (let i = 0; i < obj_array.length; i++){
    array.push(obj_array[i][property_in_obj])
  }
  return array;
}