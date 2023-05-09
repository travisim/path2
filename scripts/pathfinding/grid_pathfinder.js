class GridPathfinder extends Pathfinder{

  static get configs(){
    let configs = super.configs;
    configs.push(
      {uid: "diagonal_block", displayName: "Diagonal Blocking:", options: ["Blocked", "Unblocked"], description: `Block connection to an ordinal neighbor (e.g. NW) if there are obstacles in its applicable cardinal directions (e.g. N, W). <br>Unblock to ignore this constraint`},
      {uid: "num_neighbors", displayName: "Neighbors:", options: ["Octal (8-directions)", "Cardinal (4-directions)"], description: `Octal when all 8 neighbors surrounding the each cell are searched.<br>Cardinal when 4 neighbors in N,W,S,E (cardinal) directions are searched.`},
      {uid: "first_neighbor", displayName: "Starting Node:", options: ["N", "NW", "W", "SW", "S", "SE", "E", "NE"], description: `The first direction to begin neighbour searching. Can be used for breaking ties. N is downwards (+i/+x/-row). W is rightwards (+j/+y/-column).`},//["+x", "+x+y", "+y", "-x+y", "-x", "-x-y", "-y", "+x-y"]},
      {uid: "search_direction", displayName: "Search Direction:", options: ["Anticlockwise", "Clockwise"], description: `The rotating direction to search neighbors. Can be used for breaking ties. Anticlockwise means the rotation from N to W. Clockwise for the opposite rotation.`},
			{uid: "mapType", displayName: "Map Type:", options: ["Grid Cell", "Grid Vertex"], description: `Grid Cell is the default cell-based expansion. Grid Vertex uses the vertices of the grid. There is no diagonal blocking in grid vertex`},
    );
    return configs;
	}

  constructor(num_neighbors = 8, diagonal_allow = true, first_neighbor = "N", search_direction = "anticlockwise"){
    super();
		this.init_neighbors(num_neighbors, first_neighbor, search_direction);
		this.diagonal_allow = diagonal_allow;
  }

  setConfig(uid, value){
		console.log("SETTING CONFIG:", uid, value);
    switch(uid){
      case "diagonal_block":
				this.diagonal_allow = value=="Unblocked";
        break;
      case "num_neighbors":
        let num = value=="Octal (8-directions)" ? 8 : 4;
        this.init_neighbors(num);
        myUI.InfoMap.NumneighborsMode(num);
        break;
      case "first_neighbor":
				this.init_first_neighbor(value);
        break;
      case "search_direction":
        value = value.toLowerCase();
        this.init_search_direction(value);
        break;
			case "mapType":
				if(value=="Grid Vertex"){
					this.vertexEnabled = true;
					myUI.toggleVertex(true);
					myUI.gridPrecision = "int"
				}
				else{
					this.vertexEnabled = false;
					myUI.toggleVertex(false);
					myUI.gridPrecision = "int"
				}
				myUI.displayScen();
				break;
      default:
        super.setConfig(uid, value);
    }
  }

	static get infoTables(){
		return [
			{id:"ITNeighbors", displayName: "Neighbors", headers:["Dir", "Vertex", "F-Cost", "G-Cost", "H-Cost", "State"]},
			{ id: "ITQueue", displayName: "Queue", headers: ["Vertex", "Parent", "F-Cost", "G-Cost", "H-Cost"] },
		];
	}

  

	init_neighbors(num_neighbors, first_neighbor=this.first_neighbor, search_direction=this.search_direction){
		this.num_neighbors = num_neighbors;
		
		if(this.num_neighbors==8){
			this.delta = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]]; //x,y
			this.deltaNWSE = ["N", "NW", "W", "SW", "S", "SE", "E", "NE"];// North is positive x 
			this.neighborsIndex = [0, 1, 2, 3, 4, 5, 6, 7];
		}
		else{ // if(this.num_neighbors==4)
			this.delta = [[1, 0], [0, 1], [-1, 0], [0, -1]];
			this.deltaNWSE = ["N", "W", "S", "E"];
			this.neighborsIndex = [0, 1, 2, 3];
		}
		this.search_direction = "anticlockwise";
		this.first_neighbor = first_neighbor;
		this.init_search_direction(search_direction);
	}

	init_search_direction(search_direction){
		if(this.search_direction!=search_direction){
			this.neighborsIndex.reverse();
			this.search_direction = search_direction;
		}
		this.init_first_neighbor(this.first_neighbor);
	}

	init_first_neighbor(first_neighbor){
		this.first_neighbor = first_neighbor;
		let first_index = this.neighborsIndex.indexOf(this.deltaNWSE.indexOf(this.first_neighbor));
		this.neighborsIndex = this.neighborsIndex.slice(first_index).concat(this.neighborsIndex.slice(0, first_index));
		return;
	}

  _init_search(start, goal){
    super._init_search(start, goal);
    // generate empty 2d array
    this.visited = new NBitMatrix(this.map_height, this.map_width, 8);
    this._create_cell_index();
  }

  
	// things with _cell_index are only for the 2d maps

	_create_cell_index(){
		this.cell_map = new Empty2D(this.map_height, this.map_width);
	}

	_assign_cell_index(xy){
		// index is the step index for the first expansion of that cell
		this.cell_map.set(xy, this.step_index);
	}

  _nodeIsNeighbor(next_XY, next_NWSE, cardinalCoords){
		if(this.vertexEnabled){
			// no diagonal blocking considered
			if(next_XY[0]!=this.current_node_XY[0] && next_XY[1]!=this.current_node_XY[1]){
				// diagonal crossing
				// consider [Math.min(next_XY[0], this.current_node_XY[0]), Math.min(next_XY[1], this.current_node_XY[1])];
				let coord = [Math.min(next_XY[0], this.current_node_XY[0]), Math.min(next_XY[1], this.current_node_XY[1])];
				if(this.map.get_data(coord)==0) return false; // not passable
			}
			else{
				// cardinal crossing
				if(next_XY[0]!=this.current_node_XY[0]){
					// consider [Math.min(next_XY[0], this.current_node_XY[0]), next_XY[1]]
					// consider [Math.min(next_XY[0], this.current_node_XY[0]), next_XY[1]-1]
					var c1 =  [Math.min(next_XY[0], this.current_node_XY[0]), next_XY[1]];
					var c2 = [Math.min(next_XY[0], this.current_node_XY[0]), next_XY[1]-1];
				}
				else{
					// consider [next_XY[0], Math.min(next_XY[1], this.current_node_XY[1])]
					// consider [next_XY[0]-1, Math.min(next_XY[1], this.current_node_XY[1])] 
					var c1 = [next_XY[0], Math.min(next_XY[1], this.current_node_XY[1])];
					var c2 = [next_XY[0]-1, Math.min(next_XY[1], this.current_node_XY[1])];
				}
				if(this.map.get_data(c1)==0 && this.map.get_data(c2)==0) return false; // not passable
			}
		}
		else{
			if (this.map.get_data(next_XY) == 0) return false;  // if neighbour is not passable
			if (this.diagonal_allow == false && this.num_neighbors == 8) { // if diagonal blocking is enabled
				if (next_NWSE == "NW") {
					if(this.map.get_data(cardinalCoords["N"]) == 0 && this.map.get_data(cardinalCoords["W"]) == 0) return false;
				}
				else if (next_NWSE == "SW") {
					if(this.map.get_data(cardinalCoords["S"]) == 0 && this.map.get_data(cardinalCoords["W"]) == 0) return false;
				}
				else if (next_NWSE == "SE") {
					if(this.map.get_data(cardinalCoords["S"]) == 0 && this.map.get_data(cardinalCoords["E"]) == 0) return false;
				}
				else if (next_NWSE == "NE") {
					if(this.map.get_data(cardinalCoords["N"]) == 0 && this.map.get_data(cardinalCoords["E"]) == 0) return false;
				}
			}
		}
		return true;
	}
}