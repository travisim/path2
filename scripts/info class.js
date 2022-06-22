 
class UIInfoNWSE{
  constructor(infoNWSE_Id){
    this.element = document.getElementById(infoNWSE_Id);
  }
     
  Reset(){
    this.element.style.borderColor = "transparent";
    this.element.style.background = "rgb(188,186,201)";
    this.element.style.outlineColor = "black";
    this.element.style.color = "black";
    this.element.querySelector("#type").innerHTML = "";
    this.element.querySelector("#F").innerHTML = "";
    this.element.querySelector("#G").innerHTML = "";
    this.element.querySelector("#H").innerHTML = "";
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
    if(f!=null ) this.element.querySelector("#F").innerHTML = f;
    if(g!=null )  this.element.querySelector("#G").innerHTML = g;
    if(h!=null )  this.element.querySelector("#H").innerHTML = h;
    this.element.querySelector("#type").innerHTML = "neighbour";
  }


  
}
var UIInfoCurrent = {
   DrawCurrent(x,y){
    document.getElementById("currentYX").innerHTML =  "( "+y+", "+x+")"; // flipped x and y because of matrix transformation
  }


}
//object with only 1 method









class UIInfoTable{
  /*
  out_table(){
    //animates out last table
    //slides[slides.length-1].style.animation = 'out 0.5s forwards';
     //deletes HTML of last table(use arrow function to accept parameters)
    setTimeout(()=>removebyindex(slides.length-1),1000);
  },
*/
  /* below references myUI cannot be in interface.js
    
 in_table:function(x,y,parent_x,parent_y,f_cost,g_cost,h_cost){


    
  if (myUI.planner_choice == 0 || myUI.planner_choice == 1){
    t = document.createElement('table');
    //t.setAttribute('class', 'slide'); new table automatically set "slide class"
    r = t.insertRow(0); 
    c1 = r.insertCell(0);
    c2 = r.insertCell(1);
    c1.innerHTML = x+", "+y;
    c2.innerHTML = parent_x+", "+parent_y;
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
    c2.innerHTML = parent_x+", "+parent_y;
    c3.innerHTML = g_cost;
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
    c1.innerHTML = x+", "+y;
    c2.innerHTML = parent_x+", "+parent_y;
    c3.innerHTML = f_cost;
    c4.innerHTML = g_cost;
    c5.innerHTML = h_cost;
    t.classList.add('slide', 'new-slide');
    document.getElementById("info-container-dynamic").prepend(t); 
  
  }
*/
}
      
  

function removebyindex(index){
  var removeTab = slides[index];
  var parentEl = removeTab.parentElement;
  parentEl.removeChild(removeTab);
}

document.getElementById("currentYX").innerHTML = "(_, _)"; 