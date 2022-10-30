
//var randomCoords = [[1,1],[7,1],[1,4]];
 
var sampleSize = 20;
var randomCoords = [];
for (let i = 0; i < sampleSize; ++i) {
  var randomCoord_XY = [Math.round(Math.random()*(myUI.planner.map_height-1)), Math.round(Math.random()*(myUI.planner.map_width-1))]
  if (myUI.planner.map.get_data(randomCoord_XY) == 0) {  // if neighbour is not passable
    --i;
    continue;
  }
  
  if(randomCoords.length != 0){
    for (let j = 0; j < randomCoords.length; ++j) {
      if(randomCoords[j][0] == randomCoord_XY[0] && randomCoords[j][1] == randomCoord_XY[1]){//dont add random coord that is already added into list of random coord
        --i;
        continue;
      }
    }
  }
  
  randomCoords.push(randomCoord_XY);
}
console.log(myUI.map_start)
randomCoords.push(myUI.map_start)
randomCoords.push(myUI.map_goal)
console.log("random coods",randomCoords);
//myUI.canvases["path"].draw_canvas(randomCoords, `1d`, false, false);
var otherRandomCoordsDistance = empty2D(randomCoords.length,randomCoords.length-1); // this contains the distance between a Coord and all other coord in a 2d array with the index of otherRandomCoordDistance corresponding to coord in  randomCoord



for (let i = 0; i < randomCoords.length; ++i) {
  let otherRandomCoords = deep_copy_matrix(randomCoords, flip_bit=false); // randomCoord passed by reference here
  //document.getElementById("1").innerHTML =randomCoords;
  otherRandomCoords.splice(i, 1); // from here is otherRandomCoords really correctly labeleld
 // document.getElementById("2").innerHTML ="modified array:" + otherRandomCoords+" original array:"+randomCoords+" index removed:"+i;

  //otherRandomCoordsDistance.push([]); 
  
  for (let j = 0; j < otherRandomCoords.length; ++j) {
   
    otherRandomCoordsDistance[i][j] = /*Math.sqrt(*/(randomCoords[i][0] - otherRandomCoords[j][0])**2 + (randomCoords[i][1] - otherRandomCoords[j][1])**2/*)*/; // could store as befopre sqrt form
   // document.getElementById("3").innerHTML ="distance of first index coor to other coord ^2: "+otherRandomCoordsDistance[0];
  }
  
}
//const distances = [1, 4, 8, 3, 3, 5, 9, 0, 4, 2];

const indexOfSelectedRandomCoord = Object.entries(otherRandomCoordsDistance[0]) // returns array with index of the 5 lowest values in array
                      .sort(([,a],[,b]) => a - b)
                      .map(([index]) => +index)
                      .slice(0, 5)


//document.getElementById("4").innerHTML =indexOfSelectedRandomCoord;

/*
var currentTree = new Tree(myUI.map_start);

  if(find(start) == true){ 
   currentTree.insert(start, key);
   varpreviousNode
 }
else{currentTree.insert(start, key);}


*/


