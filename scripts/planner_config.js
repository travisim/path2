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


function toggle_num_neighbours(e){
  if(myUI.planner.num_neighbours!=8){
    myUI.planner.init_neighbours(8);
    document.querySelectorAll(".first_neighbour_choice").forEach(el=>{if(el.innerHTML.length==2) el.style.zIndex = myUI.top_Z});
    document.getElementById("num_neighbours_label").innerHTML = "Octal (8-directions)";
  }
  else{
    myUI.planner.init_neighbours(4);
    document.querySelectorAll(".first_neighbour_choice").forEach(el=>{if(el.innerHTML.length==2) el.style.zIndex = -100});
    document.getElementById("num_neighbours_label").innerHTML = "Cardinal (4-directions)";
  }
}
toggle_num_neighbours(null);
toggle_num_neighbours(null);
document.getElementById("num_neighbours_btn").addEventListener("click", toggle_num_neighbours);

myUI.buttons.first_neighbour_btn.btn.addEventListener("click", e=>show_modal(myUI.modals.first_neighbour.elem));

myUI.modals.first_neighbour.close = function(){
  hide_modal(myUI.modals.first_neighbour.elem);
}
myUI.modals.first_neighbour.close_btn.addEventListener("click", myUI.modals.first_neighbour.close);

window.addEventListener("click", event=>{
	if (event.target == myUI.modals.first_neighbour.elem)
		myUI.modals.first_neighbour.close();
});

document.querySelectorAll(".first_neighbour_choice").forEach(el=>{
  if(el.classList.contains("empty")) return;
  el.addEventListener("click", e=>{
    myUI.planner.init_first_neighbour(el.innerHTML);
    myUI.buttons.first_neighbour_btn.btn.innerHTML = el.innerHTML;
    myUI.modals.first_neighbour.close();
  })
});