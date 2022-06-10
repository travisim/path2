 
class UIInfoMap{
 
    
 
ResetAll(){
  myUI.planner.deltaNWSE.forEach(deltaNWSE => {document.getElementById(deltaNWSE).style.borderColor = "transparent";
  document.getElementById(deltaNWSE).style.borderColor = "transparent";
  document.getElementById(deltaNWSE).style.background = "rgb(188,186,201)";
  document.getElementById(deltaNWSE).style.outlineColor = "black";
  document.getElementById(deltaNWSE).style.color = "black";
  document.getElementById(deltaNWSE).querySelector("#type").innerHTML = "";
  }); //reset obstacles in info map 
  
}
DrawNeighbour(f,g,h){
    document.getElementById(myUI.planner.deltaNWSE[i]).style.borderColor = "rgb(0,130,105)";
    // document.getElementById(myUI.planner.deltaNWSE[i]).querySelector("#F").innerHTML = f;
    // document.getElementById(myUI.planner.deltaNWSE[i]).querySelector("#G").innerHTML = g;
    // document.getElementById(myUI.planner.deltaNWSE[i]).querySelector("#H").innerHTML = h;
    document.getElementById(myUI.planner.deltaNWSE[i]).querySelector("#type").innerHTML = "neighbour";
  }
  
}

