myUI.scale_coord = function(y, x){
	let scaled_x = Math.floor(x/myUI.canvases.hover_map.canvas.clientWidth *  myUI.map_width);
	let scaled_y = Math.floor(y/myUI.canvases.hover_map.canvas.clientHeight *  myUI.map_height);
	return [scaled_y, scaled_x];
}

myUI.handle_map_hover = function(e){
	e = e || window.event;
  e.preventDefault();
	/* colours the map on hover */
	let [scaled_y, scaled_x] = myUI.scale_coord(e.offsetY, e.offsetX);
	myUI.hover_labels.hover_x.elem.innerHTML = scaled_x;
	myUI.hover_labels.hover_y.elem.innerHTML = scaled_y;
	myUI.canvases.hover_map.erase_canvas();
	myUI.canvases.hover_map.set_color_index(0, "both");
	if(myUI.map_arr)
		if(myUI.map_arr[scaled_y][scaled_x]==0)
			myUI.canvases.hover_map.set_color_index(1, "both");
	//console.log(myUI.canvases.hover_map.ctx.strokeStyle);
	myUI.canvases.hover_map.draw_start_goal([scaled_y, scaled_x]);

	myUI.canvases.hover_map.canvas.style.cursor = "auto";
	if(myUI.planner.cell_map){
		if(myUI.planner.cell_map[scaled_y][scaled_x]){
			myUI.canvases.hover_map.canvas.style.cursor = "pointer";
		}
	}

	/* shows the popup */
	let tooltip_data = document.getElementById("tooltip_data");
	tooltip_data.style.display = "block";
	tooltip_data.style.left = e.pageX + 'px';
	tooltip_data.style.top = e.pageY + 'px';
	
}

myUI.canvases.hover_map.canvas.addEventListener(`mousemove`, myUI.handle_map_hover);

myUI.canvases.hover_map.canvas.addEventListener(`click`, e=>{
	let [scaled_y, scaled_x] = myUI.scale_coord(e.offsetY, e.offsetX);
	if(myUI.planner.cell_map){
		if(!isNaN(myUI.planner.cell_map[scaled_y][scaled_x])){
			let ind = myUI.planner.cell_map[scaled_y][scaled_x];
			myUI.jump_to_step(ind);
		}
	}

});

myUI.canvases.hover_map.canvas.addEventListener(`mouseout`, e=>{
	myUI.canvases.hover_map.erase_canvas();
	tooltip_data.style.display = "none";
});

dragElement(myUI.map_start_icon.elem);
dragElement(myUI.map_goal_icon.elem);

function dragElement(elmnt) {

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
		let x = x1 - bounds.left;
		let y = y1 - bounds.top;
		x = Math.max(0, Math.min(bounds.width-e_num, x));  // fix to boundaries
		y = Math.max(0, Math.min(bounds.height-e_num, y));
		let scaled_x = Math.floor(x/bounds.width *  myUI.map_width);  //  scale x an dy
		let scaled_y = Math.floor(y/bounds.height *  myUI.map_height);
		console.log(scaled_x, scaled_y);
		if(elmnt.id=="map_start_icon"){
			myUI.map_start = [scaled_y, scaled_x];
		}
		else if(elmnt.id=="map_goal_icon"){
			myUI.map_goal = [scaled_y, scaled_x];
		}
		myUI.displayScen(moved=true);
  }
}