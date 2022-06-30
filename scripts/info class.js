 
class UIInfoNWSE{
  constructor(infoNWSE_Id){
    this.element = document.getElementById(infoNWSE_Id);
  }
     
  Reset(){
    this.element.style.borderColor = "transparent";
    this.element.style.background = "rgb(188,186,201)";
    this.element.style.outlineColor = "black";
    this.element.style.color = "black";
    this.element.querySelector(".type").innerHTML = "";
    this.element.querySelector(".F").innerHTML = "";
    this.element.querySelector(".G").innerHTML = "";
    this.element.querySelector(".H").innerHTML = "";
     //reset a square in info map 
  }
  /* 
  DrawObstacle(){
    this.element.style.borderColor = "rgb(0,0,0)";
    this.element.querySelector("#type").innerHTML = "Obstacle"; 
    
  }
  DrawOutOfBounds(){
    this.element.style.borderColor = "transparent";
    this.element.style.background = "transparent";
    this.element.style.outlineColor = "transparent";
    this.element.style.color = "transparent";
  }
  
  DrawVisited(){
    this.element.style.borderColor = "rgb(221,48,33)";
    this.element.querySelector("#type").innerHTML = "Visited"
  }
  DrawQueue(){
    this.element.style.borderColor = "rgb(116,250,76)";
    this.element.querySelector("#type").innerHTML = "Queue"
    
  }
    */
  DrawNeighbour(f,g,h){
    this.element.style.borderColor = "rgb(0,130,105)";
     console.log(f,"f",g,"g",h,"h")
    if(f!=null ) this.element.querySelector(".F").innerHTML = f;
    if(g!=null )  this.element.querySelector(".G").innerHTML = g;
    if(h!=null )  this.element.querySelector(".H").innerHTML = h;
    this.element.querySelector(".type").innerHTML = "neighbour";
  }


  
}
var UIInfoCurrent = {
   DrawCurrent(x,y){
    document.getElementById("currentYX").innerHTML =  "( "+y+", "+x+")"; // flipped x and y because of matrix transformation
  }


}
//object with only 1 method









function UIInfoTable(){

  this.OutBottom = function(){
    let slides = document.getElementsByClassName("slide");
    //animates out last slide
    if (slides.length >= 1) slides[slides.length-1].style.animation = 'out 0.5s forwards';
     //deletes HTML of last table(use arrow function to accept parameters)
    setTimeout(()=>removebyindex(slides.length-1),1000);
  };
  this.OutTop = function(){
    //animates out first slide
    if (slides.length >= 1) slides[0].style.animation = 'out 0.5s forwards';
     //deletes HTML of last table(use arrow function to accept parameters)
    setTimeout(()=>removebyindex(0),1000);
  };
  this.InTop = function(x,y,parent_x,parent_y,f_cost,g_cost,h_cost){
  
      
    if (myUI.planners[myUI.planner_choice] == BFS || myUI.planners[myUI.planner_choice] == DFS){
      t = document.createElement('table');
      //t.setAttribute('class', 'slide'); new table automatically set "slide class"
      r = t.insertRow(0); 
      c1 = r.insertCell(0);
      c2 = r.insertCell(1);
      c3 = r.insertCell(2);
      c2.innerHTML = "";
      c2.innerHTML = x+", "+y;
      c3.innerHTML = parent_x+", "+parent_y;
      t.classList.add('slide', 'new-slide');
      document.getElementById("info-container-dynamic").prepend(t); 
    }
    else if (myUI.planners[myUI.planner_choice] == Dijkstra){
      t = document.createElement('table');
      //t.setAttribute('class', 'slide'); new table automatically set "slide class"
      r = t.insertRow(0); 
      c1 = r.insertCell(0);
      c2 = r.insertCell(1);
      c3 = r.insertCell(2);
      c4 = r.insertCell(3);
      c1.innerHTML = "";
      c2.innerHTML = x+", "+y;
      c3.innerHTML = parent_x+", "+parent_y;
      c4.innerHTML = g_cost;
      t.classList.add('slide', 'new-slide');
      document.getElementById("info-container-dynamic").prepend(t); 
      
    }
    else if (myUI.planners[myUI.planner_choice] == A_star){
      t = document.createElement('table');
      //t.setAttribute('class', 'slide'); new table automatically set "slide class"
      r = t.insertRow(0); 
      c1 = r.insertCell(0);
      c2 = r.insertCell(1);
      c3 = r.insertCell(2);
      c4 = r.insertCell(3);
      c5 = r.insertCell(4);
      c6 = r.insertCell(5);
      c1.innerHTML = "";
      c2.innerHTML = x+", "+y;
      c3.innerHTML = parent_x+", "+parent_y;
      c4.innerHTML = f_cost;
      c5.innerHTML = g_cost;
      c6.innerHTML = h_cost;
      t.classList.add('slide', 'new-slide');
      document.getElementById("info-container-dynamic").prepend(t); 
    }
    for (var i = 0; i < slides.length; i++) {
      if (slides[0].style.border != "none"){
      slides[0].style.border = "none";
        
      }

     
    }
    
    elements[i].selectedIndex = abc;
    slides[slides.length-1].classList.add("highlight-slide");
    document.getElementById("info-container-dynamic").querySelector(".highlight-slide").style.border = "2px solid red";
  };
  this.InBottom = function(x,y,parent_x,parent_y,f_cost,g_cost,h_cost){
  
      
    if (myUI.planners[myUI.planner_choice] == BFS || myUI.planners[myUI.planner_choice] == DFS){
      t = document.createElement('table');
      //t.setAttribute('class', 'slide'); new table automatically set "slide class"
      r = t.insertRow(0); 
      c1 = r.insertCell(0);
      c2 = r.insertCell(1);
      c3 = r.insertCell(2);
      c2.innerHTML = "";
      c2.innerHTML = x+", "+y;
      c3.innerHTML = parent_x+", "+parent_y;
      t.classList.add('slide', 'new-slide');
      document.getElementById("info-container-dynamic").append(t); 
    }
    else if (myUI.planners[myUI.planner_choice] == Dijkstra){
      t = document.createElement('table');
      //t.setAttribute('class', 'slide'); new table automatically set "slide class"
      r = t.insertRow(0); 
      c1 = r.insertCell(0);
      c2 = r.insertCell(1);
      c3 = r.insertCell(2);
      c4 = r.insertCell(3);
      c1.innerHTML = "";
      c2.innerHTML = x+", "+y;
      c3.innerHTML = parent_x+", "+parent_y;
      c4.innerHTML = g_cost;
      t.classList.add('slide', 'new-slide');
      document.getElementById("info-container-dynamic").append(t); 
      
    }
    else if (myUI.planners[myUI.planner_choice] == A_star){
      t = document.createElement('table');
      //t.setAttribute('class', 'slide'); new table automatically set "slide class"
      r = t.insertRow(0); 
      c1 = r.insertCell(0);
      c2 = r.insertCell(1);
      c3 = r.insertCell(2);
      c4 = r.insertCell(3);
      c5 = r.insertCell(4);
      c6 = r.insertCell(5);
      c1.innerHTML = "";
      c2.innerHTML = x+", "+y;
      c3.innerHTML = parent_x+", "+parent_y;
      c4.innerHTML = f_cost;
      c5.innerHTML = g_cost;
      c6.innerHTML = h_cost;
      t.classList.add('slide', 'new-slide');
      document.getElementById("info-container-dynamic").append(t); 
    }
    
  };
  this.HighlightNew = function(){
  
      document.getElementById("info-container-dynamic").getElementsByClassName("new-slide").style.border = "2px solid red";
    
  };
};






      
  

function removebyindex(index){
  var removeTab = slides[index];
  var parentEl = removeTab.parentElement;
  parentEl.removeChild(removeTab);
}

//let slides = document.getElementsByClassName("slide");
function RemoveAllTableSlides(){
  var temp = slides.length;// slides.length alawys changes, cannot use
   if(temp != 0){
      console.log( temp,"slides length");
     var i =temp-1;
      while(i!=-1) {
        console.log(i,"iter");
        removebyindex(i);
        i--;
      }
    } 
}
document.getElementById("currentYX").innerHTML = "(_, _)"; 