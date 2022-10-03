// myUI.map_start;
// myUI.map_goal;
// myUI.map_arr;
// myUI.planners => array of planners
// myUI.planner_choice => references the index of the planner in myUI.planners;

/* registers & starts searching for path on the given map using the given solver */
document.getElementById("compute_btn").addEventListener("click", compute_path);

function compute_path(){
	myUI.reset_animation();  // reset first time for arrows to be removed
	//myUI.arrow.data.forEach(el=>el.remove());
	//myUI.arrow.data = [];
	if(!myUI.planner_choice) return alert("no planner loaded!");
	if(!myUI.map_arr) return alert("no map loaded!");
  if(!myUI.map_start) return alert("no scene loaded!");
	myUI.planner.add_map(myUI.map_arr);
	document.getElementById("compute_btn").innerHTML = "searching...";
	myUI.planner.search(myUI.map_start, myUI.map_goal).then(path=>{
		console.log(path ? path.length : -1);
		myUI.generateReverseSteps(myUI.planner.steps_forward, myUI.planner.step_index_map.fwd);
		myUI.sliders.search_progress_slider.elem.disabled = false;
		myUI.animation.max_step = myUI.planner.max_step();
		myUI.sliders.search_progress_slider.elem.max = myUI.animation.max_step+1;
		let each_frame_duration_min = 3000 / myUI.animation.max_step; //  5 seconds for fastest animation
		myUI.sliders.animation_speed_slider.elem.max = Math.log2(200/each_frame_duration_min)*1000;
		document.getElementById("compute_btn").innerHTML = "done!";
		setTimeout(()=>document.getElementById("compute_btn").innerHTML = "Compute Path", 2000);
		myUI.reset_animation();
		myUI.InfoTables["ITQueue"].removeAllTableRows();
   /*
    for(const [key, IT] of Object.entries(myUI.InfoTables))
        IT.removeAllTableRows();
    */
	}); 
	
	
}

/* displays the solved path */
/*document.getElementById("display_btn").addEventListener("click", display_path);

function display_path(){
	if(!myUI.planner_choice) return alert("no planner loaded!");
	if(!myUI.map_arr) return alert("no map loaded!");
  if(!myUI.map_start) return alert("no scene loaded!");
	if(!myUI.planner) return alert("not computed");

  let final_state = myUI.planner.final_state();
  if(final_state.length<=1) return;

  myUI.canvases.path.draw_canvas(final_state.path, "1d");
}/* */
//displays value of slider

myUI.sliders.animation_speed_slider.elem.oninput = function(){
	let apparent_speed = Math.pow(2, this.value/1000);
	this.parent.label.innerHTML = `${(Math.round(apparent_speed * 100) / 100).toFixed(2)}×`;
	myUI.animation.speed = apparent_speed;
	// skip steps in animation
	myUI.animation.jump_steps = 5*myUI.animation.speed/myUI.animation.max_fps;
	if(myUI.animation.jump_steps>1) myUI.animation.jump_steps = myUI.animation.jump_steps *10;
	//console.log(myUI.animation.jump_steps);
}

myUI.sliders.search_progress_slider.elem.oninput = function(){
	myUI.stop_animation(change_svg = myUI.animation.running);
	myUI.update_search_slider(this.value);
	myUI.jump_to_step(this.value);
}

myUI.reset_animation = function(){
	myUI.stop_animation(myUI.animation.running); //stop animation if scen changed halfway while still animating
	myUI.update_search_slider(-1);
	["visited",	"neighbors", "queue",	"current_XY",	"path", "dotted"].forEach(canvas_id=>{
		myUI.canvases[canvas_id].erase_canvas();
	});
	myUI.reset_arrow(false);
	myUI.arrow.step = -1;
}

myUI.buttons.clear_btn.btn.addEventListener("click", myUI.reset_animation);


myUI.step_back = function(){
	myUI.stop_animation(change_svg = true);
	/* NEW */
	if(myUI.animation.detailed)
		myUI.run_steps(1, "bck");
	else
		myUI.run_combined_step("bck");
	myUI.update_search_slider(myUI.animation.step);
	console.log(myUI.animation.step);
}
myUI.buttons.back_btn.btn.addEventListener("click", myUI.step_back);

myUI.start_animation = function(){
	myUI.animation.running = true;
	animation_backend();
}

myUI.stop_animation = function(change_svg = false){
	if(change_svg && myUI.animation.running)
		myUI.buttons.start_pause_btn.next_svg();
  	myUI.animation.running = false;
  
}

myUI.step_forward = function(){
	myUI.stop_animation(change_svg = true);
	/* NEW */
	if(myUI.animation.detailed)
		myUI.run_steps(1);
	else
		myUI.run_combined_step();
	myUI.update_search_slider(myUI.animation.step);
	console.log(myUI.animation.step);
}
myUI.buttons.forward_btn.btn.addEventListener("click", myUI.step_forward);


myUI.jump_to_end = function(){
	myUI.stop_animation(change_svg = true);
	//myUI.animation.step = -1;  //  change ot end
	myUI.update_search_slider(myUI.animation.max_step);
	myUI.jump_to_step(myUI.animation.max_step);
	return
}
myUI.buttons.end_btn.btn.addEventListener("click", myUI.jump_to_end);


myUI.toggleAnimation = function(){
	if(!myUI.planner_choice) return alert("no planner loaded!");
	if(!myUI.map_arr) return alert("no map loaded!");
  if(!myUI.map_start) return alert("no scene loaded!");
	if(!myUI.planner) return alert("not computed");
	myUI.buttons.start_pause_btn.next_svg();
	if(myUI.animation.running)
		myUI.stop_animation();
	else
		myUI.start_animation();
}
myUI.buttons.start_pause_btn.btn.addEventListener("click", myUI.toggleAnimation);


document.addEventListener(`keydown`, event=>{
	if(event.key==`ArrowLeft`){
		event.preventDefault();
		myUI.step_back();
	}
	else if(event.key==`ArrowRight`){
		event.preventDefault();
		myUI.step_forward();
	}
});


myUI.toggleMapDetail = function(){
	myUI.buttons.detail_btn.next_svg();

	myUI.animation.detailed = !myUI.animation.detailed;
	// do other stuff
}
myUI.buttons.detail_btn.btn.addEventListener("click", myUI.toggleMapDetail);

document.getElementById("show_visited").addEventListener("click", function(e){
	if(this.checked) myUI.canvases.visited.canvas.classList.remove("hidden");
	else myUI.canvases.visited.canvas.classList.add("hidden");
});

document.getElementById("show_queue").addEventListener("click", function(e){
	if(this.checked) myUI.canvases.queue.canvas.classList.remove("hidden");
	else myUI.canvases.queue.canvas.classList.add("hidden");
});

document.getElementById("show_neighbors").addEventListener("click", function(e){
	if(this.checked) myUI.canvases.neighbors.canvas.classList.remove("hidden");
	else myUI.canvases.neighbors.canvas.classList.add("hidden");
});

document.getElementById("show_f_cost").addEventListener("click", function(e){
});

document.getElementById("show_g_cost").addEventListener("click", function(e){
});

function openControlTab(evt, tabId, linkId) {

  // Get all elements with class="tabcontent" and hide them
  for (const tc of document.getElementsByClassName("controlTabContent")) 
		tc.style.display = "none";

  // Get all elements with class="tablinks" and remove the class "active"
  for (const tl of document.getElementsByClassName("controlTabLink"))
    tl.className = tl.className.replace(" active", "");

  // Show the current tab, and add an "active" class to the button that opened the tab
	if(evt) evt.currentTarget.className += " active";
	else document.getElementById(linkId).className += " active";
  document.getElementById(tabId).style.display = "block";
	var drags = document.getElementsByClassName('draggable');
	if(tabId=="manualTab"){
		for(i = 0; i < drags.length; i++) 
			drags[i].style.zIndex = 61;
	}
	else{
		for(i = 0; i < drags.length; i++) 
			drags[i].style.zIndex = 63;
	}
}
openControlTab(null, "configTab", "configLink");