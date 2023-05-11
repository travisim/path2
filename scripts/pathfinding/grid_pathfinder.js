class GridPathfinder extends Pathfinder{

  static get configs(){
    let configs = super.configs;
    configs.push(
      {uid: "num_neighbors", displayName: "Neighbors:", options: ["Octal (8-directions)", "Cardinal (4-directions)"], description: `Octal when all 8 neighbors surrounding the each cell are searched.<br>Cardinal when 4 neighbors in N,W,S,E (cardinal) directions are searched.`},
      {uid: "first_neighbor", displayName: "Starting Node:", options: ["N", "NW", "W", "SW", "S", "SE", "E", "NE"], description: `The first direction to begin neighbour searching. Can be used for breaking ties. N is downwards (+i/+x/-row). W is rightwards (+j/+y/-column).`},//["+x", "+x+y", "+y", "-x+y", "-x", "-x-y", "-y", "+x-y"]},
      {uid: "search_direction", displayName: "Search Direction:", options: ["Anticlockwise", "Clockwise"], description: `The rotating direction to search neighbors. Can be used for breaking ties. Anticlockwise means the rotation from N to W. Clockwise for the opposite rotation.`},
			{uid: "mapType", displayName: "Map Type:", options: ["Grid Cell", "Grid Vertex"], description: `Grid Cell is the default cell-based expansion. Grid Vertex uses the vertices of the grid. There is no diagonal blocking in grid vertex`},
    );
    return configs;
	}

  constructor(num_neighbors = 8, first_neighbor = "N", search_direction = "anticlockwise"){
    super();
		this.init_neighbors(num_neighbors, first_neighbor, search_direction);
  }

  setConfig(uid, value){
		console.log("SETTING CONFIG:", uid, value);
    switch(uid){
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
				}
				else{
					this.vertexEnabled = false;
					myUI.toggleVertex(false);
				}
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

  getCardinalCoords(){
		let cardinalCoords = {};
		if(this.diagonal_allow == false && this.num_neighbors == 8)
			for(let i = 0; i < this.num_neighbors; ++i)
				if(this.delta[i].includes(0))
					cardinalCoords[this.deltaNWSE[i]] = [this.current_node_XY[0] + this.delta[i][0], this.current_node_XY[1] + this.delta[i][1]];
		return cardinalCoords;
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

	isValidCellCoord(coord){
		return coord[0] >= 0 && coord[1] >= 0 && coord[0] < this.grid_height && coord[1] < this.grid_width;
	}

	isDiagonalBlockedVertex(next_XY, current_XY, parent_XY){
		if(parent_XY === undefined) return false; // assume able to pass through in ambiguous case
		let blocked1 = current_XY, blocked2 = current_XY.map(x=>x-1);
		if(this.isValidCellCoord(blocked1) && this.isValidCellCoord(blocked2) && !this.isPassable(blocked1) && !this.isPassable(blocked2)){
			let sideOf = (XY) => XY[0] >= current_XY[0] && XY[1] <= current_XY[1];
			if(sideOf(next_XY) != sideOf(parent_XY)) return true; // different sides, blocked
		}
		blocked1 = [current_XY[0] - 1, current_XY[1]]; blocked2 = [current_XY[0], current_XY[1] - 1];
		if(this.isValidCellCoord(blocked1) && this.isValidCellCoord(blocked2) && !this.isPassable(blocked1) && !this.isPassable(blocked2)){
			let sideOf = (XY) => XY[0] + XY[1] > current_XY[0] + current_XY[1];
			if(sideOf(next_XY) != sideOf(parent_XY)) return true; // different sides, blocked
		}
		return false; // no cases triggered, not blocked
	}

  _nodeIsNeighbor(next_XY, next_NWSE, cardinalCoords){
		if(this.vertexEnabled){
			let parent_XY = this.current_node.parent ? this.current_node.parent.self_XY : undefined;
			if(next_XY[0]!=this.current_node_XY[0] && next_XY[1]!=this.current_node_XY[1]){
				// diagonal crossing
				let coord = [Math.min(next_XY[0], this.current_node_XY[0]), Math.min(next_XY[1], this.current_node_XY[1])];
				if(!this.isPassable(coord)) return false; // not passable
			}
			else{
				// cardinal crossing
				if(next_XY[0]!=this.current_node_XY[0]){
					// change in x, "N-S" movement
					var c1 = [Math.min(next_XY[0], this.current_node_XY[0]), next_XY[1]];
					var c2 = [Math.min(next_XY[0], this.current_node_XY[0]), next_XY[1]-1];

					if(next_XY[1] == 0 && !this.isPassable(c1)) return false; // edges of map
					else if(next_XY[1] == this.grid_width && !this.isPassable(c2)) return false;
				}
				else{
					// change in y, "E-W" movement
					var c1 = [next_XY[0], Math.min(next_XY[1], this.current_node_XY[1])];
					var c2 = [next_XY[0]-1, Math.min(next_XY[1], this.current_node_XY[1])];

					if(next_XY[0] == 0 && !this.isPassable(c1)) return false; // edges of map
					else if(next_XY[0] == this.grid_height && !this.isPassable(c2)) return false;
				}
				if(!this.isPassable(c1) && !this.isPassable(c2)) return false; // not passable
			}
			// at this point, the vertex is visible in either case. last check will be for diagonal blocking
			if(!this.diagonal_allow){
				if(this.isDiagonalBlockedVertex(next_XY, this.current_node_XY, parent_XY)) return false;
			}
		}
		else{
			if (!this.isPassable(next_XY)) return false;  // if neighbour is not passable
			if (this.diagonal_allow == false && this.num_neighbors == 8) { // if diagonal blocking is enabled
				if (next_NWSE == "NW") {
					if(!this.isPassable(cardinalCoords["N"]) && !this.isPassable(cardinalCoords["W"])) return false;
				}
				else if (next_NWSE == "SW") {
					if(!this.isPassable(cardinalCoords["S"]) && !this.isPassable(cardinalCoords["W"])) return false;
				}
				else if (next_NWSE == "SE") {
					if(!this.isPassable(cardinalCoords["S"]) && !this.isPassable(cardinalCoords["E"])) return false;
				}
				else if (next_NWSE == "NE") {
					if(!this.isPassable(cardinalCoords["N"]) && !this.isPassable(cardinalCoords["E"])) return false;
				}
			}
		}
		return true;
	}
}