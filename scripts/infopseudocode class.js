var pseudoCodeRaw = 'def astar(map, start_vertex, goal_vertex): \n&emsp;list = OpenList() \n&emsp;path = [ ] \n&emsp;# Initialise h-cost for all \n&emsp;for vertex in map.vertices(): \n &emsp;&emsp;  vertex.set_h_cost(goal_vertex)  \n &emsp;&emsp;  vertex.g_cost = ∞  \n &emsp;&emsp;  vertex.visited = False \n&emsp; # Assign 0 g-cost to start_vertex  \n &emsp;start_vertex.g_cost = 0 \n &emsp;list.add(start_vertex) \n &emsp;while list.not_empty(): \n    &emsp;&emsp;current_vertex = list.remove() \n    &emsp;&emsp;# Skip if visited: a cheaper path  \n    &emsp;&emsp;# was already found \n   &emsp;&emsp; if current_vertex.visited: \n   &emsp;&emsp;&emsp;   continue \n   &emsp;&emsp; # Trace back and return the path if at the goal \n   &emsp;&emsp; if current_vertex is goal_vertex : \n    &emsp;&emsp;&emsp;  while current_vertex is not None: \n&emsp;&emsp;&emsp;&emsp;  path.push(current_vertex) \n      &emsp;&emsp;&emsp;&emsp;  current_vertex = current_vertex.parent \n    &emsp;&emsp;&emsp;  return path # exit the function \n    &emsp;&emsp;# Add all free, neighboring vertices which \n   &emsp;&emsp; # are cheaper, into the list  \n    &emsp;&emsp;for vertex in get_free_neighbors(map, current_vertex):  \n    &emsp;&emsp;&emsp;&emsp;  # f or h-costs are not checked bcos obstacles \n    &emsp;&emsp;&emsp;&emsp; # affects the optimal path cost from the g-cost \n    &emsp;&emsp;&emsp;&emsp; tentative_g = calc_g_cost(vertex, current_vertex)  \n    &emsp;&emsp;&emsp;&emsp; if tentative_g < vertex.g_cost: \n     &emsp;&emsp;&emsp;&emsp;&emsp;  vertex.g_cost = tentative_g  \n      &emsp;&emsp;&emsp;&emsp;&emsp; vertex.parent = current_vertex  \n      &emsp;&emsp;&emsp;&emsp;&emsp; list.add(vertex) \n return path';

//var pseudoCodeRaw = 'def astar(map, start_vertex, goal_vertex): \n&emsp;list = OpenList() \n&emsp;path = [ ] ';


class UIInfoPseudoCode{
  constructor(){ //input titles of table in string
  
    this.pseudoCodeTable =  document.querySelector(`#dynamic-pseudo-code-table`)
     

   this.pseudoCodeRows = this.pseudoCodeTable.getElementsByClassName('psuedoRow');
     this.highlightedRowsSec = document.getElementById("pseudo-code-container").getElementsByClassName('highlightingSec');
    this.highlightedRowsPri = document.getElementById("pseudo-code-container").getElementsByClassName('highlightingPri');
  }
  
rowGenerator(pseudoCodeTxtFileContent){
   var pseudoCodeArrayByline = pseudoCodeTxtFileContent.split("\n");
    //var t = document.createElement('table');
    for (let i = 0; i < (pseudoCodeArrayByline.length ); i++) { 
      var r = document.createElement("TR"); 
      if ((pseudoCodeArrayByline[i] == null)) break;
      r.insertCell(0).innerHTML = pseudoCodeArrayByline[i];
      r.classList.add('psuedoRow');
      
      
      document.getElementById("dynamic-pseudo-code-table").append(r);
   
    }  
  }
  
  
 highlightPri(rowNo){
  for (let i = 0; i < this.highlightedRowsPri.length; i++) { 
     if(this.highlightedRowsPri[0]){
       this.highlightedRowsPri[0].classList.remove('highlightingPri');
     }
   }
    this.pseudoCodeRows[rowNo].className += " highlightingPri";
 }
 highlightSec(rowNo){
 /*
   for (let i = 0; i < this.highlightedPseudoRows.length; i++) { 
     if(this.highlightedPseudoRows[0]){
       this.highlightedPseudoRows[0].classList.remove('highlighting');
     }
   }
   */
    this.pseudoCodeRows[rowNo].className += " highlightingSec";

 }
  
  removeAllHighlightSec(){
    var temp = this.highlightedRowsSec.length
    for (let i = 0; i < temp; i++) { 
      if(this.highlightedRowsSec[0]){
        this.highlightedRowsSec[0].classList.remove('highlightingSec');
      }
    }
  }
}
/*
 var pseudoCodeRaw = 'def astar(map, start_vertex, goal_vertex): \n&emsp;list = OpenList() \n&emsp;path = [ ] \n&emsp;# Initialise h-cost for all \n&emsp;for vertex in map.vertices(): \n &emsp;&emsp;  vertex.set_h_cost(goal_vertex)  \n &emsp;&emsp;  vertex.g_cost = ∞  \n &emsp;&emsp;  vertex.visited = False \n&emsp; # Assign 0 g-cost to start_vertex  \n &emsp;start_vertex.g_cost = 0 \n &emsp;list.add(start_vertex) \n &emsp;while list.not_empty(): \n    &emsp;&emsp;current_vertex = list.remove() \n    &emsp;&emsp;# Skip if visited: a cheaper path  \n    &emsp;&emsp;# was already found \n   &emsp;&emsp; if current_vertex.visited: \n   &emsp;&emsp;&emsp;   continue \n   &emsp;&emsp; # Trace back and return the path if at the goal \n   &emsp;&emsp; if current_vertex is goal_vertex : \n    &emsp;&emsp;&emsp;  while current_vertex is not None: \n&emsp;&emsp;&emsp;&emsp;  path.push(current_vertex) \n      &emsp;&emsp;&emsp;&emsp;  current_vertex = current_vertex.parent \n    &emsp;&emsp;&emsp;  return path # exit the function \n    &emsp;&emsp;# Add all free, neighboring vertices which \n   &emsp;&emsp; # are cheaper, into the list  \n    &emsp;&emsp;for vertex in get_free_neighbors(map, current_vertex):  \n    &emsp;&emsp;&emsp;&emsp;  # f or h-costs are not checked bcos obstacles \n    &emsp;&emsp;&emsp;&emsp; # affects the optimal path cost from the g-cost \n    &emsp;&emsp;&emsp;&emsp; tentative_g = calc_g_cost(vertex, current_vertex)  \n    &emsp;&emsp;&emsp;&emsp; if tentative_g < vertex.g_cost: \n     &emsp;&emsp;&emsp;&emsp;&emsp;  vertex.g_cost = tentative_g  \n      &emsp;&emsp;&emsp;&emsp;&emsp; vertex.parent = current_vertex  \n      &emsp;&emsp;&emsp;&emsp;&emsp; list.add(vertex) \n return path';
  
var x = new UIInfoPseudoCode();
x.rowGenerator(pseudoCodeRaw);
//x.highlightPri(4);
x.highlightPri(10);
x.highlightSec(1);
x.highlightSec(2);
x.highlightSec(0);
//x.highlightSec(11);
//x.removeAllHighlightSec();*/
/*
function pseudoCodeHighlight(rowNo){
  for (let i = 0; i < this.highlightedPseudoRows.length; i++) { 
     if(this.highlightedPseudoRows[0]){
       this.highlightedPseudoRows[0].style.outlineColor = "transparent";
       this.highlightedPseudoRows[0].classList.remove('highlighting');
     }
   }
  
  document.getElementById(rowNo).className += " highlighting";
}
pseudoCodeRowGenerator(pseudoCodeArrayByline)
pseudoCodeHighlight("4")




document.getElementById("p4").className += " highlighting";*/