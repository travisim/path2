 
document.getElementById("currentYX").innerHTML = "(1024,1024)"; 





/*
document.createElement("div").innerHTML = "F:<span class "F_cost" id="F"></span>G:<span id="G"></span>H:<span id="H"></span>Type:<span id="type"></span>";

document.getElementById("N").appendChild(document.createElement("div")); 
*/

//use '' and "" to differentiate or else it does not work, the string of html is to create the F:13.13G:H:Type: in each box.

//document.getElementById("N").innerHTML = 'F:<span class "F_cost" id="F"></span>G:<span id="G"></span>H:<span id="H"></span>Type:<span id="type"></span>';

var info_neighbours_id = ["NW","N","NE","W","E","SW","S","SE"];

for(var i=0;i<info_neighbours_id.length;++i){
  document.getElementById(info_neighbours_id[i]).innerHTML = 'F:<span class "F_cost" id="F"></span>G:<span id="G"></span>H:<span id="H"></span>Type:<span id="type"></span>';
};

document.querySelector("#NW").querySelector("#F").innerHTML = "13.13";



/*
document.getElementById("NW").style.backgroundColor ="rgb(116,250,76)";
document.getElementById("N").style.backgroundColor ="rgb(221,48,33)";
document.getElementById("NE").style.backgroundColor ="rgb(52,119,234)";
document.getElementById("W").style.backgroundColor ="rgb(30,73,25)";
*/
/*["queue", "rgb(116,250,76)"],
    ["visited", "rgb(221,48,33)"],
    ["current_YX", "rgb(52,119,234)"],
    ["neighbours", "rgb(30,73,25)"],
    */
document.getElementById("NW").style.borderColor = "rgb(0,0,0)";
document.getElementById("N").style.borderColor = "rgb(221,48,33)";

document.getElementById("W").style.borderColor = "rgb(0,130,105)";





 table = document.getElementById("info_table");
for(var i=1;i<5;++i){
  var row = table.insertRow(i);
  for(var j=0;j<5;++j){
   row.insertCell(j).innerHTML = "hi";
   
  }

} 

l
