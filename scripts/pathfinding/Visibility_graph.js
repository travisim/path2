class VisibilityGraph extends PRM{

  static get display_name(){
		return "Visibility Graph";
  }

  static get configs(){
		let configs = GridPathFinder.configs;
		configs.push(
      {uid: "distance_metric", displayName: "Distance Metric:", options: ["Euclidean"], description: `The metrics used for calculating distances.<br>Euclidean takes the L2-norm between two cells, which is the real-world distance between two points. This is commonly used for any angle paths.`},
      {uid: "g_weight", displayName: "G-Weight:", options: "number", defaultVal: 1, description: `Coefficient of G-cost when calculating the F-cost. Setting G to 0 and H to positive changes this to the greedy best first search algorithm.`},
      {uid: "h_weight", displayName: "H-Weight:", options: "number", defaultVal: 1, description: `Coefficient of H-cost when calculating the F-cost. Setting H to 0 and G to positive changes this to Dijkstra's algorithm.`},
      {uid: "h_optimized", displayName: "H-optimized:", options: ["On", "Off"], description: `For algorithms like A* and Jump Point Search, F-cost = G-cost + H-cost. This has priority over the time-ordering option.<br> If Optimise is selected, when retrieving the cheapest vertex from the open list, the vertex with the lowest H-cost among the lowest F-cost vertices will be chosen. This has the effect of doing a Depth-First-Search on equal F-cost paths, which can be faster.<br> Select Vanilla to use their original implementations`},  
      {uid: "time_ordering", displayName: "Time Ordering:", options: ["FIFO", "LIFO"], description: `When sorting a vertex into the open-list or unvisited-list and it has identical cost* to earlier entries, select: <br>FIFO to place the new vertex behind the earlier ones, so it comes out after them<br> LIFO to place the new vertex in front of the earlier ones, so it comes out before them.<br>* cost refers to F-cost & H-cost, if F-H-Cost Optimisation is set to "Optimise", otherwise it is the F-cost for A*, G-cost for Dijkstra and H-cost for GreedyBestFirst)`});
		return configs;
  }

  postProcess(){
    this.setConfig("mapType", "Grid Vertex");
  }

  generateNewMap(start, goal){
    this.add_map(myUI.map_arr);
    // iterate through entire map
    // find vertices

    function cornerCoords(gridObj, kernelSize, startX, startY){
      
      if(kernelSize == 2){
        // 2x2 data
        let cnt = 0;
        for(let i = startX; i < startX + kernelSize; ++i){
          for(let j = startY; j < startY + kernelSize; ++j){
            if(gridObj.get_data([i,j])) cnt++;
          }
        }
        if(cnt == 3) return [[startX + 1, startY + 1]];
      }
      else if(kernelSize == 3){
        const N = null;
        // 3x3 data
        let presets = [
          // squares & L-shapes (centered)
          {
            data: [ [1,1,1],
                    [1,0,0],
                    [1,0,N] ],
            coords: [[1,1]],
          },
          {
            data: [ [1,1,1],
                    [0,0,1],
                    [N,0,1] ],
            coords: [[1,2]],
          },
          {
            data: [ [N,0,1],
                    [0,0,1],
                    [1,1,1] ],
            coords: [[2,2]],
          },
          {
            data: [ [1,0,N],
                    [1,0,0],
                    [1,1,1] ],
            coords: [[2,1]],
          },
          // Zig-zags & P-shapes
          {
            data: [ [1,1,1],
                    [1,0,0],
                    [0,0,N] ],
            coords: [[1,1]],
          },
          {
            data: [ [0,1,1],
                    [0,0,1],
                    [N,0,1] ],
            coords: [[1,2]],
          },
          {
            data: [ [N,0,0],
                    [0,0,1],
                    [1,1,1] ],
            coords: [[2,2]],
          },
          {
            data: [ [1,0,N],
                    [1,0,0],
                    [1,1,0] ],
            coords: [[2,1]],
          },

          // Reflected Zig-zags & P-shapes
          {
            data: [ [1,1,0],
                    [1,0,0],
                    [1,0,N] ],
            coords: [[1,1]],
          },
          {
            data: [ [1,1,1],
                    [0,0,1],
                    [N,0,0] ],
            coords: [[1,2]],
          },
          {
            data: [ [N,0,1],
                    [0,0,1],
                    [0,1,1] ],
            coords: [[2,2]],
          },
          {
            data: [ [0,0,N],
                    [1,0,0],
                    [1,1,1] ],
            coords: [[2,1]],
          },

          // L-shapes (off-center)
          {
            data: [ [1,1,1],
                    [1,0,1],
                    [1,0,0] ],
            coords: [[1,1]],
          },
          {
            data: [ [1,1,1],
                    [1,0,1],
                    [0,0,1] ],
            coords: [[1,2]],
          },
          {
            data: [ [1,1,1],
                    [0,0,1],
                    [0,1,1] ],
            coords: [[1,2]],
          },
          {
            data: [ [0,1,1],
                    [0,0,1],
                    [1,1,1] ],
            coords: [[2,2]],
          },
          {
            data: [ [0,0,1],
                    [1,0,1],
                    [1,1,1] ],
            coords: [[2,2]],
          },
          {
            data: [ [1,0,0],
                    [1,0,1],
                    [1,1,1] ],
            coords: [[2,1]],
          },
          {
            data: [ [1,1,0],
                    [1,0,0],
                    [1,1,1] ],
            coords: [[2,1]],
          },
          {
            data: [ [1,1,1],
                    [1,0,0],
                    [1,1,0] ],
            coords: [[1,1]],
          },

          //sticks
          {
            data: [ [1,1,1],
                    [1,0,1],
                    [1,0,1] ],
            coords: [[1,1],[1,2]],
          },
          {
            data: [ [1,1,1],
                    [0,0,1],
                    [1,1,1] ],
            coords: [[1,2],[2,2]],
          },
          {
            data: [ [1,0,1],
                    [1,0,1],
                    [1,1,1] ],
            coords: [[2,2],[2,1]],
          },
          {
            data: [ [1,1,1],
                    [1,0,0],
                    [1,1,1] ],
            coords: [[1,1],[2,1]],
          }
        ];
        presetLoop: for(const preset of presets){
          for(let i = 0; i < kernelSize; ++i){
            for(let j = 0; j < kernelSize; ++j){
              if(preset.data[i][j] == N) continue; // skip for null
              if(preset.data[i][j] != gridObj.get_data([i + startX, j + startY])){
                continue presetLoop;
              }
            }
          }
          let ret = [];
          for(const coord of preset.coords){
            ret.push([coord[0] + startX, coord[1] + startY]);
          }
          return ret;
        }
      }
      return null;
    }

    this.randomCoordsNodes = [];
    let kernelSize = 2;

    for(let i = 0; i < this.bg_height - kernelSize + 1; ++i){
      for(let j = 0; j < this.bg_width - kernelSize + 1; ++j){
        let coords = cornerCoords(this.map, kernelSize, i, j);
        if(coords == null) continue;
        for(const coord of coords){
          this.randomCoordsNodes.push(new MapNode(null, coord, []));
          this._create_action({command: STATIC.DrawVertex, dest: this.dests.networkGraph, nodeCoord: coord});
        }
      }
    }
    this._save_step(true);

    // iterate through coordinates & check for visbiliity between them

    for(let i = 0; i < this.randomCoordsNodes.length; ++i){
      for(let j = 0; j < i; ++j){
        let n1 = this.randomCoordsNodes[i], n2 = this.randomCoordsNodes[j];
        if(CustomLOSChecker(n1.value_XY, n2.value_XY).boolean){
          this._create_action({command: STATIC.DrawEdge, dest: this.dests.networkGraph, nodeCoord: n1.value_XY, endCoord: n2.value_XY});
          this.randomCoordsNodes[i].neighbours.push(j);
          this.randomCoordsNodes[j].neighbours.push(i);
        }
      }
    }
    this._save_step(true);
    this.addNodeToGraph(start);
    this.addNodeToGraph(goal);
    this._save_step(true);
  }

  addNodeToGraph(coord){
    // simple algorithm which checks all nodes with LOS to start node and picks the shortest one
    let node = new MapNode(null, coord, []);
    let n = this.randomCoordsNodes.length;
    let curMin = Number.MAX_SAFE_INTEGER;
    for(let i = 0; i < n; ++i){
      if(CustomLOSChecker(coord, this.randomCoordsNodes[i].value_XY).boolean){
        let a = this.randomCoordsNodes[i].value_XY[0] - coord[0];
        let b = this.randomCoordsNodes[i].value_XY[1] - coord[1];
        let dist = Math.hypot(a, b);
        if(dist < curMin){
          curMin = dist;
          node.neighbours[0] = i;
        }
      }
    }
    this.randomCoordsNodes.push(node);
    this.randomCoordsNodes[node.neighbours[0]].neighbours.push(n);
    this._create_action({command: STATIC.DrawVertex, dest: this.dests.networkGraph, nodeCoord: coord});
    this._create_action({command: STATIC.DrawEdge, dest: this.dests.networkGraph, nodeCoord: coord, endCoord: this.randomCoordsNodes[node.neighbours[0]].value_XY});

  }

}