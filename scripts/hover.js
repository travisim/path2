myUI.scale_coord = function(x,y){
	if(myUI.vertex){
		let sy = myUI.canvases.hover_map.canvas.clientWidth/myUI.map_width;
		let sx = myUI.canvases.hover_map.canvas.clientHeight/myUI.map_height;
		var scaled_y = Math.floor((y+sy/2) / (myUI.canvases.hover_map.canvas.clientWidth+sy) * (myUI.map_width+1));
		var scaled_x = Math.floor((x+sx/2) / (myUI.canvases.hover_map.canvas.clientHeight+sx) * (myUI.map_height+1));
	}
	else{
		var scaled_y = Math.floor(y/myUI.canvases.hover_map.canvas.clientWidth * myUI.map_width);
		var scaled_x = Math.floor(x/myUI.canvases.hover_map.canvas.clientHeight * myUI.map_height);
	}
	return [scaled_x, scaled_y];
}

myUI.handle_map_hover = function(e){

	let tooltip_data = document.getElementById("tooltip_data");

	e = e || window.event;
  e.preventDefault();
	/* colours the map on hover */
	let [scaled_x, scaled_y] = myUI.scale_coord(e.offsetY, e.offsetX);
	document.getElementById("hover_y").innerHTML = scaled_y;
	document.getElementById("hover_x").innerHTML = scaled_x;
	myUI.canvases.hover_map.erase_canvas();
	myUI.canvases.hover_map.set_color_index(0, "both");
	if(myUI.map_arr && !myUI.vertex)
		if(myUI.map_arr[scaled_x][scaled_y]==0)
			myUI.canvases.hover_map.set_color_index(1, "both");
	//console.log(myUI.canvases.hover_map.ctx.strokeStyle);
	myUI.canvases.hover_map.draw_start_goal([scaled_x, scaled_y]);

	myUI.canvases.hover_map.canvas.style.cursor = "auto";
	document.getElementById("hover_cell_index").innerHTML = "-";
	tooltip_data.style.backgroundColor = ``;
	if(myUI.planner.cell_map){
		if(!isNaN(myUI.planner.cell_map[scaled_x][scaled_y])){
			myUI.canvases.hover_map.canvas.style.cursor = "pointer";
			document.getElementById("hover_cell_index").innerHTML = myUI.planner.cell_map[scaled_x][scaled_y];
			document.getElementById("hover_cell_visited").innerHTML = myUI.planner.visited.get_data([scaled_x, scaled_y]);
			tooltip_data.style.backgroundColor = `#3bd44b`;
		}
	}

	/* shows the popup */
	tooltip_data.style.display = "block";
	tooltip_data.style.left = e.pageX + 'px';
	tooltip_data.style.top = e.pageY + 'px';
	
}

myUI.canvases.hover_map.canvas.addEventListener(`mousemove`, myUI.handle_map_hover);

myUI.canvases.hover_map.canvas.addEventListener(`click`, e=>{
	let [scaled_x, scaled_y] = myUI.scale_coord(e.offsetY, e.offsetX);
	if(myUI.planner.cell_map){
		if(!isNaN(myUI.planner.cell_map[scaled_x][scaled_y])){
			let idx = myUI.planner.cell_map[scaled_x][scaled_y];
			myUI.update_search_slider(idx);
			myUI.jump_to_step(idx);
		}
	}
});

myUI.canvases.hover_map.canvas.addEventListener(`mouseleave`, e=>{
	myUI.canvases.hover_map.erase_canvas();
	tooltip_data.style.display = "none";
});

dragElement(myUI.map_start_icon.elem);
dragElement(myUI.map_goal_icon.elem);

function dragElement(elmnt) {

	elmnt.addEventListener(`mouseenter`, e=>elmnt.style.cursor = "move");
	elmnt.addEventListener(`mouseleave`, e=>elmnt.style.cursor = "auto");

  var bounds = myUI.canvases.hover_map.canvas.getBoundingClientRect();
	let x1, y1, dx, dy;
	const e_num = Math.pow(10, -3);
	elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    x1 = e.clientX;
    y1 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
		bounds = myUI.canvases.hover_map.canvas.getBoundingClientRect();
		
    // calculate the new cursor position:
		//console.log(e.clientX);
    dx = x1 - e.clientX;
    dy = y1 - e.clientY;
		if(elmnt.offsetTop - dy >= -elmnt.height/2 && elmnt.offsetTop - dy <= bounds.height-elmnt.height/2){  // if within y-bounds
			elmnt.style.top = (elmnt.offsetTop - dy) + "px";  // move the element in y-axis
			y1 = elmnt.getBoundingClientRect().y + elmnt.height/2;// update the y-coordinate when mouseup 
		}
		if(elmnt.offsetLeft - dx >= -elmnt.width/2 && elmnt.offsetLeft - dx <= bounds.width-elmnt.width/2){  // if within x-bounds
			elmnt.style.left = (elmnt.offsetLeft - dx) + "px";  // move the element in x-axis
			x1 = elmnt.getBoundingClientRect().x + elmnt.width/2; // update the x-coordinate when mouseup
		}
  }

  function closeDragElement(e) {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
		e = e || window.event;
    e.preventDefault();
		let y = x1 - bounds.left;
		let x = y1 - bounds.top;
		y = Math.max(0, Math.min(bounds.width-e_num, y));  // fix to boundaries
		x = Math.max(0, Math.min(bounds.height-e_num, x));
		let [scaled_x, scaled_y] = myUI.scale_coord(x,y);
		console.log(scaled_x, scaled_y);
		if(elmnt.id=="map_start_icon"){
			myUI.map_start = [scaled_x, scaled_y];
		}
		else if(elmnt.id=="map_goal_icon"){
			myUI.map_goal = [scaled_x, scaled_y];
		}
		myUI.displayScen(true, true);
  }
}