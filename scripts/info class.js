 
class UIInfoMap{
  constructor(infoNWSE_Id){
    this.id = infoNWSE_Id;
  }
      
  
  
  
  Reset(){
  document.getElementById(this.id).style.borderColor = "transparent";
  document.getElementById(this.id).style.borderColor = "transparent";
  document.getElementById(this.id).style.background = "rgb(188,186,201)";
  document.getElementById(this.id).style.outlineColor = "black";
  document.getElementById(this.id).style.color = "black";
  document.getElementById(this.id).querySelector("#type").innerHTML = "";
   //reset a square in info map 
    
  }
  DrawObstacle(){
    document.getElementById(this.id).style.borderColor = "rgb(0,0,0)";
    document.getElementById(this.id).querySelector("#type").innerHTML = "Obstacle"; 
    
  }
  DrawOutOfBounds(){
    document.getElementById(this.id).style.borderColor = "transparent";
    document.getElementById(this.id).style.background = "transparent";
    document.getElementById(this.id).style.outlineColor = "transparent";
    document.getElementById(this.id).style.color = "transparent";
  }
  
  DrawVisited(){
    document.getElementById(this.id).style.borderColor = "rgb(221,48,33)";
    document.getElementById(this.id).querySelector("#type").innerHTML = "Visited"
  }
  DrawQueue(){
    document.getElementById(this.id).style.borderColor = "rgb(116,250,76)";
    document.getElementById(this.id).querySelector("#type").innerHTML = "Queue"
    
  }
    
  DrawNeighbour(f,g,h){
    document.getElementById(this.id).style.borderColor = "rgb(0,130,105)";
    // document.getElementById(myUI.planner.deltaNWSE[i]).querySelector("#F").innerHTML = f;
    // document.getElementById(myUI.planner.deltaNWSE[i]).querySelector("#G").innerHTML = g;
    // document.getElementById(myUI.planner.deltaNWSE[i]).querySelector("#H").innerHTML = h;
    document.getElementById(this.id).querySelector("#type").innerHTML = "neighbour";
  }
    
  
}

class UIInfoTable{
  out_table(){
    //animates out last table
    //slides[slides.length-1].style.animation = 'out 0.5s forwards';
     //deletes HTML of last table(use arrow function to accept parameters)
    setTimeout(()=>removebyindex(slides.length-1),1000);
  }


  
  in_table(x,y){
    var info = myUI.planner.final_state().info_matrix
    if (myUI.planner_choice == 0 || myUI.planner_choice == 1){
      t = document.createElement('table');
      //t.setAttribute('class', 'slide'); new table automatically set "slide class"
      r = t.insertRow(0); 
      c1 = r.insertCell(0);
      c2 = r.insertCell(1);
      c1.innerHTML = x+", "+y;
      c2.innerHTML = info[y][x].parent[1]+", "+info[y][x].parent[0];
      t.classList.add('slide', 'new-slide');
      document.getElementById("info-container-dynamic").prepend(t); 
    }
    else if (myUI.planner_choice == 2){
      t = document.createElement('table');
      //t.setAttribute('class', 'slide'); new table automatically set "slide class"
      r = t.insertRow(0); 
      c1 = r.insertCell(0);
      c2 = r.insertCell(1);
      c3 = r.insertCell(2);
      c1.innerHTML = x+", "+y;
      c2.innerHTML = info[y][x].parent[1]+", "+info[y][x].parent[0];
      c3.innerHTML = info[y][x].g;
      t.classList.add('slide', 'new-slide');
      document.getElementById("info-container-dynamic").prepend(t); 
      
    }
    else if (myUI.planner_choice == 3){
      t = document.createElement('table');
      //t.setAttribute('class', 'slide'); new table automatically set "slide class"
      r = t.insertRow(0); 
      c1 = r.insertCell(0);
      c2 = r.insertCell(1);
      c3 = r.insertCell(2);
      c4 = r.insertCell(3);
      c5 = r.insertCell(4);
      c6 = r.insertCell(5);
      c1.innerHTML = x+", "+y;
      c2.innerHTML = info[y][x].parent[1]+", "+info[y][x].parent[0];
      c3.innerHTML = info[y][x].f;
      c4.innerHTML = info[y][x].g;
      c5.innerHTML = info[y][x].h;
      c6.innerHTML = 1;
      t.classList.add('slide', 'new-slide');
      document.getElementById("info-container-dynamic").prepend(t); 
    }
  }
}
      
  

function removebyindex(index){
  var removeTab = slides[index];
  var parentEl = removeTab.parentElement;
  parentEl.removeChild(removeTab);
}

document.getElementById("currentYX").innerHTML = "(_, _)"; 