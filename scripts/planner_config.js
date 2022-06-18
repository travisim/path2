myUI.modals.planner_config.show = function(){
  show_modal(myUI.modals.planner_config.elem);
  //document.getElementById("planner_name").innerHTML = myUI.planner.constructor.display_name;

}

// When the user clicks on the button, open the modal
myUI.buttons.planner_config_btn.btn.addEventListener("click", myUI.modals.planner_config.show);

myUI.modals.planner_config.close = function(){
  hide_modal(myUI.modals.planner_config.elem);
}
myUI.modals.planner_config.close_btn.addEventListener("click", myUI.modals.planner_config.close);
																									myUI.modals.planner_config.elem.style.display = "none";

window.addEventListener("click", event=>{
	if (event.target == myUI.modals.planner_config.elem)
		myUI.modals.planner_config.close();
});

myUI.selects["planner_select2"].elem.addEventListener("change", myUI.loadPlanner);

if(myUI.planner.diagonal_allow) document.getElementById("diagonal_block_label").innerHTML = "Blocked";
else document.getElementById("diagonal_block_label").innerHTML = "Unblocked";
document.getElementById("diagonal_block_btn").addEventListener("click", e=>{
  myUI.planner.diagonal_allow = !myUI.planner.diagonal_allow;
  if(myUI.planner.diagonal_allow) document.getElementById("diagonal_block_label").innerHTML = "Blocked";
  else document.getElementById("diagonal_block_label").innerHTML = "Unblocked";
});

document.getElementById("num_neighbours_label").innerHTML = myUI.planner.num_neighbours;
document.getElementById("num_neighbours_btn").addEventListener("click", e=>{
  if(myUI.planner.num_neighbours!=8) myUI.planner.num_neighbours=8;
  else myUI.planner.num_neighbours=4;
  document.getElementById("num_neighbours_label").innerHTML = myUI.planner.num_neighbours;
});