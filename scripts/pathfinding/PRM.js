class PRM extends GridPathFinder{
  
  static get display_name(){
		return "PRM";
  }
  infoMapPlannerMode(){
    return 'none';
  }
  
  //var randomCoords = [[1,1],[7,1],[1,4]];
  constructor(num_neighbors = 8, diagonal_allow = true, first_neighbour = "N", search_direction = "anticlockwise") {
 
  }
  var sampleSize = 5;
  var randomCoords = [];
  for (let i = 0; i < sampleSize; ++i) { // gets the 5 unique random points within the map and not on obstacles
    var randomCoord_XY = [Math.round(Math.random()*this.map_height), Math.round(Math.random()*this.map_width)]);
    if (this.map.get_data(randomCoords_XY) == 0) {  // if neighbour is not passable
      i--;
      continue;
    }
    for (let j = 0; j < randomCoords.length; ++j) {
      if(randomCoords[j][0] == randomCoord_XY[0] && randomCoords[j][1] == randomCoord_XY[1]]){//dont add random coord that is already added into list of random coord
        i--;
        continue;
      }
    }
  this._create_action({command: STATIC.DP, dest: STATIC.CR, nodeCoord: randomCoord_XY});
   randomCoords.push(randomCoord_XY)
  }
 /*
  var otherRandomCoordsDistance = empty2D(randomCoords.length, randomCoords.length-1); // this containsdistance between a Coord and all other coord in a 2d array with the index of otherRandomCoordDistance corresponding to coord in  randomCoord
 
  for (let i = 0; i < randomCoords.length; ++i){
    let otherRandomCoords = deep_copy_matrix(randomCoords, flip_bit=false); // randomCoord passed by reference here
   // document.getElementById("1").innerHTML =randomCoords;
    otherRandomCoords.splice(i, 1); // from here is otherRandomCoords really correctly labeleld
   // document.getElementById("2").innerHTML ="modified array:" + otherRandomCoords+" original array:"+randomCoords+" index removed:"+i;
  
    //otherRandomCoordsDistance.push([]); 
    
    for (let j = 0; j < otherRandomCoords.length; ++j){
     otherRandomCoordsDistance[i][j] = Math.sqrt((randomCoords[i][0] - otherRandomCoords[j][0])**2 + (randomCoords[i][1] - otherRandomCoords[j][1])**2); // could store as befopre sqrt form
      //document.getElementById("3").innerHTML ="distance of first index coor to other coord ^2: "+otherRandomCoordsDistance[0];
    }
    
  }
  //const distances = [1, 4, 8, 3, 3, 5, 9, 0, 4, 2];
 
  const indexOfSelectedRandomCoord = Object.entries(otherRandomCoordsDistance[0]) // returns array with index of the 5 lowest values in array
                        .sort(([,a],[,b]) => a - b)
                        .map(([index]) => +index)
                        .slice(0, 5);
 */


  

  this._save_step(true);
  //document.getElementById("1").innerHTML =randomCoords;
 // document.getElementById("4").innerHTML = indexOfSelectedRandomCoord;
  
  /*
 var currentTree = new Tree(this.start);
  
  
  if
   if(find(this.start) == true){ 
     currentTree.insert(this.start, key);
     varpreviousNode
   }
  else{currentTree.insert(this.start, key);}
*/
}






