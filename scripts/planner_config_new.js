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

window.addEventListener("click", event=>{
	if (event.target == myUI.modals.planner_config.elem)
		myUI.modals.planner_config.close();
});

myUI.plannerConfigCallback = function(){
  // bind "this" to the dropdown/input
  // this refers to the select/input element
  let uid = this.getAttribute("id").slice(0, -5);
  if(this.tagName=="INPUT"){
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
  for(const config of myUI.planner.configs){
    let el = document.createElement("div");
    el.classList.add("flex-row");
    let lbl = document.createElement("label");
    lbl.classList.add("label_centered");
    lbl.innerHTML = config.displayName;
    el.appendChild(lbl);
    if(config.options=="number"){
      let dialog = document.createElement("input");
      dialog.setAttribute("value", config.defaultVal);
      dialog.setAttribute("id", config.uid+"_pcfg");
      dialog.setAttribute("required", '');
      dialog.setAttribute("type", "number");
      dialog.addEventListener("change", myUI.plannerConfigCallback);
      el.appendChild(dialog);
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
      el.appendChild(dd);
			myUI.planner.setConfig(config.uid, config.options[0]);
    }
    parent.appendChild(el);
  };
}

myUI.setPlannerConfig();