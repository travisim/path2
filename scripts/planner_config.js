myUI.modals.planner_config.show = function(){
  show_modal(myUI.modals.planner_config.elem);
  myUI.stop_animation(change_svg = true);
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

document.getElementById("diagonal_block_btn").addEventListener("click", e=>{
  myUI.planner.diagonal_allow = !myUI.planner.diagonal_allow;
  if(myUI.planner.diagonal_allow) document.getElementById("diagonal_block_label").innerHTML = "Blocked";
  else document.getElementById("diagonal_block_label").innerHTML = "Unblocked";
});


function toggle_num_neighbors(e){
  if(myUI.planner.num_neighbors!=8){
    myUI.planner.init_neighbors(8);
    //document.querySelectorAll(".first_neighbour_choice").forEach(el=>{if(el.innerHTML.length==2) el.style.zIndex = myUI.top_Z});
    document.getElementById("num_neighbors_label").innerHTML = "Octal (8-directions)";
    myUI.InfoMap.NumneighborsMode(8);
  }
  else{
    myUI.planner.init_neighbors(4);
    //document.querySelectorAll(".first_neighbour_choice").forEach(el=>{if(el.innerHTML.length==2) el.style.zIndex = -100});
    document.getElementById("num_neighbors_label").innerHTML = "Cardinal (4-directions)";
    myUI.InfoMap.NumneighborsMode(4);  
  }
}
document.getElementById("num_neighbors_btn").addEventListener("click", toggle_num_neighbors);



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

function toggle_search_direction(e){
  if(myUI.planner.search_direction=="clockwise"){
    myUI.planner.init_search_direction("anticlockwise");
    document.getElementById("search_direction_label").innerHTML = "Anti-clockwise";
  }
  else{
    myUI.planner.init_search_direction("clockwise");
    document.getElementById("search_direction_label").innerHTML = "Clockwise";
  }
}
document.getElementById("search_direction_btn").addEventListener("click", toggle_search_direction);

myUI.loadDistanceMetric = function(){
  let selectElem = document.querySelector("#distance_select");
  myUI.planner.set_distance_metric(selectElem.value);
}

document.querySelector("#distance_select").addEventListener("change", myUI.loadDistanceMetric);

myUI.init_planner_config = function(){
  if(myUI.planner.diagonal_allow) document.getElementById("diagonal_block_label").innerHTML = "Blocked";
  else document.getElementById("diagonal_block_label").innerHTML = "Unblocked";

  toggle_num_neighbors(null);
  toggle_num_neighbors(null);
  
  toggle_search_direction();
  toggle_search_direction();
  
  myUI.buttons.first_neighbour_btn.btn.innerHTML = myUI.planner.first_neighbour;

  myUI.resetSelectOptions(document.querySelector("#distance_select"));
  if(myUI.planner.constructor.distance_metrics.length>0){
    document.querySelector("#distance_select_ctn").style.display = "block";
    let arr = myUI.planner.constructor.distance_metrics;
    for(const metric of arr){
      let option = document.createElement("option");
      option.setAttribute("value", metric);
      option.innerHTML = metric;
      document.querySelector("#distance_select").appendChild(option);
    }
    myUI.loadDistanceMetric();
  }
  else{
    document.querySelector("#distance_select_ctn").style.display = "none";
  }
}