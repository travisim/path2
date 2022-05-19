




/*
document.createElement("div").innerHTML = "F:<span class "F_cost" id="F"></span>G:<span id="G"></span>H:<span id="H"></span>Type:<span id="type"></span>";

document.getElementById("N").appendChild(document.createElement("div")); 
*/

//use '' and "" to differentiate or else it does not work, the string of html is to create the F:13.13G:H:Type: in each box.

//document.getElementById("N").innerHTML = 'F:<span class "F_cost" id="F"></span>G:<span id="G"></span>H:<span id="H"></span>Type:<span id="type"></span>';

let info_neighbours_id = ["NW","N","NE","W","E","SW","S","SE"];

for(let i=0;i<info_neighbours_id.length;++i){
  document.getElementById(info_neighbours_id[i]).innerHTML = 'F:<span class "F_cost" id="F"></span>G:<span id="G"></span>H:<span id="H"></span>Type:<span id="type"></span>';
};
/*
function get_RGB_point(id,x,y){
var RGB_string = "rgb(${document.getElementById("id").getImageData(x, y, 1, 1).data[0]},${document.getElementById("id").getImageData(x, y, 1, 1).data[1]},${document.getElementById("id").getImageData(x, y, 1, 1).data[2]})";
}

*/
    
  



//demo
document.querySelector("#NW").querySelector("#F").innerHTML = "13.13";


document.getElementById("NW").style.borderColor = "rgb(0,0,0)";//obstacle
document.getElementById("N").style.borderColor = "rgb(221,48,33)";//visited

document.getElementById("W").style.borderColor = "rgb(0,130,105)";//neighbour



 
document.getElementById("currentYX").innerHTML = "(1024,1024)"; 


 table = document.getElementById("info_table");
for(let i=1;i<5;++i){
  var row = table.insertRow(i);
  for(var j=0;j<5;++j){
   row.insertCell(j).innerHTML = "hi";
   
  }

} 
