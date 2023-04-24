function appendCheckbox(id,checked = false, label,subLabel = null,toggleType){
  if (checked == true){
    var checked_value = "checked"; 
  }
  else{
    document.getElementById(id.slice(5)).classList.add("hidden");
    var checked_value = "";
  }
  const div = document.createElement("div");
  div.innerHTML = `
  <input type="checkbox" id=${id} name=${id} class="layers" ${checked_value}>
    <label for=${id} class="unselectable">
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
  `;
  
  style.innerHTML = s;
  document.getElementById("checkbox_style").append(style);
  myUI.checkbox.canvas.push(document.getElementById(id));

  if(toggleType=="multi"){
    document.getElementById(id).addEventListener("click", function (e) {
   
        if (this.checked) document.getElementById(id.slice(5)).classList.remove("hidden");
        else document.getElementById(id.slice(5)).classList.add("hidden");
      toggleHideSVGCircleByClassIdentifier(id.slice(5))
      toggleHideSVGLineByClassIdentifier(id.slice(5))
    });
  }
  else if(toggleType=="single"){
    document.getElementById(id).addEventListener("click", function(e){
      if(this.checked){
        resetAllCheckboxes("canvas");
        this.checked = true;
        document.getElementById(id.slice(5)).classList.remove("hidden");
      }
      else document.getElementById(id.slice(5)).classList.add("hidden");
    });
  }
}

function resetAllCheckboxes(type){
  myUI.checkbox[type].forEach(el=>{
    el.checked=true;
    el.click();
  });
}

function selectAllCheckboxes(type){
  myUI.checkbox[type].forEach(el=>{
    el.checked=false;
    el.click();
  });
}

document.getElementById("reset_checkboxes").addEventListener("click", function(){
  resetAllCheckboxes("canvas");
});

document.getElementById("select_checkboxes").addEventListener("click", function(){
  selectAllCheckboxes("canvas");
});
