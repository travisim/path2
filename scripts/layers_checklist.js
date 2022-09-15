function appendCheckbox(id,checked = false, label,subLabel = null,){
if (checked == true){
  var checked_value = "checked"; 
}
else{
  var checked_value = "";
}
  const div = document.createElement("div");
  div.innerHTML = `
  <input type="checkbox" id=${id} name=${id} class="layers" ${checked_value}>
    <label for=${id}>
       <h2>${label}<span>${subLabel}</span></h2>
    </label>`;
     document.getElementById("canvas_layers").append(div);


    var style = document.createElement('style');

    var s =  `
    #${id}:checked ~ label[for=${id}]{
    background: #2C3E50;
    border-bottom: 1px solid #34495E;
    color: #1ABC9C;
  }

   #${id}:checked ~ label[for=${id}] h2 span{
    color: #1ABC9C;

  }

   #${id}:checked ~ label[for=${id}]:after{
    background:  white;
  }
  `;
  
  style.innerHTML = s;
  document.getElementById("checkbox_style").append(style);
  
  }

appendCheckbox("show_visited",true, "Visited","layer");
appendCheckbox("show_queue",true, "Queue","layer");
appendCheckbox("show_neighbors",true, "neighbors","layer");
appendCheckbox("show_f_cost",false, "f cost","layer");
appendCheckbox("show_g_cost",false, "g cost","layer");
