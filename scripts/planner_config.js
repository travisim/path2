myUI.init_planner_config = function(){}

myUI.modals.planner_config.show = function(){
  show_modal(myUI.modals.planner_config.elem);
  myUI.stop_animation(change_svg = true);
}

// When the user clicks on the button, open the modal
myUI.buttons.planner_config_btn.btn.addEventListener("click", myUI.modals.planner_config.show);

myUI.modals.planner_config.close = function(){
  
  hide_modal(myUI.modals.planner_config.elem);
}
myUI.modals.planner_config.close_btn.addEventListener("click", myUI.modals.planner_config.close);

window.addEventListener("mousedown", event=>{
	if (event.target == myUI.modals.planner_config.elem)
    myUI.modals.planner_config.modalClose = true;
});

window.addEventListener("mouseup", event=>{
	if (event.target == myUI.modals.planner_config.elem)
    if(myUI.modals.planner_config.modalClose)
      myUI.modals.planner_config.close();
  myUI.modals.planner_config.modalClose = false;
});

myUI.plannerConfigCallback = function(){
  // bind "this" to the dropdown/input
  // this refers to the select/input element
  let uid = this.getAttribute("id").slice(0, -5);
  if(this.tagName=="INPUT"){
    var val = this.value;
  }
  else if(this.tagName=="BUTTON"){
    var val = this.value;
  }
  else{
		var val = this.options[this.selectedIndex].value;
  }
  myUI.planner.setConfig(uid, val);
}

myUI.setPlannerConfig = function(){
  let parent = document.getElementById("planner_config_body");
  removeChildren(parent);
  for(const config of myUI.planner.constructor.configs){
    let row = document.createElement("tr");
    let conf = document.createElement("td");
    conf.innerHTML = config.displayName+"<br>";

    if(config.options=="number"){
      let dialog = document.createElement("input");
      dialog.setAttribute("value", config.defaultVal);
      dialog.setAttribute("id", config.uid+"_pcfg");
      dialog.setAttribute("required", '');
      dialog.setAttribute("type", "number");
      dialog.addEventListener("change", myUI.plannerConfigCallback);
      conf.appendChild(dialog);
			myUI.planner.setConfig(config.uid, config.defaultVal);
    }
    else if(config.options=="button"){
      let button = document.createElement("button");
      button.setAttribute("id", config.uid+"_pcfg");
      button.innerHTML = config.displayName
      button.addEventListener('click', myUI.plannerConfigCallback);
      conf.appendChild(button);
    }
    else if(config.options=="text"){
      let text_input = document.createElement("input");
      text_input.setAttribute("value", config.defaultVal);
      text_input.setAttribute("id", config.uid+"_pcfg");
      text_input.setAttribute("required", '');
      text_input.setAttribute("type", "text");
      text_input.addEventListener("change", myUI.plannerConfigCallback);
      conf.appendChild(text_input);
			myUI.planner.setConfig(config.uid, config.defaultVal);
    }
    else{// dropdown
      let dd = document.createElement("select");
      dd.setAttribute("id", config.uid+"_pcfg");
      // dd.classList.add();
      for(let i=0;i<config.options.length;++i){
        let option = document.createElement("option");
        option.setAttribute("value", config.options[i]);
        option.innerHTML = config.options[i];
        myUI.selects["planner_select"].elem.appendChild(option);
        dd.appendChild(option);
      }
      dd.addEventListener("change", myUI.plannerConfigCallback);
      conf.appendChild(dd);
			myUI.planner.setConfig(config.uid, config.options[0]);
    }
    let desc = document.createElement("td");
    desc.innerHTML = config.description;
    row.appendChild(conf);
    row.appendChild(desc);
    parent.appendChild(row);
  };
}