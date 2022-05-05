myUI.handle_map_hover = function(e){
	let x = e.offsetX;
	let y = e.offsetY;
	let scaled_x = Math.floor(x/myUI.canvases.hover_map.canvas.clientWidth *  myUI.map_width);
	let scaled_y = Math.floor(y/myUI.canvases.hover_map.canvas.clientHeight *  myUI.map_height);
	/*if (myUI.map_goal_icon.clicked){
		//  means released
		myUI.map_goal_icon.elem.style.top = (y-15).toString() + "px";
		myUI.map_goal_icon.elem.style.left = (x-15).toString() + "px";
		myUI.map_goal_icon.clicked = false;
		myUI.map_goal = [scaled_y, scaled_x];
		myUI.displayScen();
		return
	}
	else if (myUI.map_start_icon.clicked){
		//  means released
		myUI.map_start_icon.elem.style.top = (y-15).toString() + "px";
		myUI.map_start_icon.elem.style.left = (x-15).toString() + "px";
		myUI.map_start_icon.clicked = false;
		myUI.map_start = [scaled_y, scaled_x];
		myUI.displayScen();
		return
	}*/
	myUI.hover_labels.hover_x.elem.innerHTML = scaled_x;
	myUI.hover_labels.hover_y.elem.innerHTML = scaled_y;
	myUI.canvases.hover_map.erase_canvas();
	myUI.canvases.hover_map.set_color("#d19b6d", "both");
	if(myUI.map_arr)
		if(myUI.map_arr[scaled_y][scaled_x]==0)
			myUI.canvases.hover_map.set_color("#AA1945", "both");
	//console.log(myUI.canvases.hover_map.ctx.strokeStyle);
	myUI.canvases.hover_map.draw_start_goal([scaled_y, scaled_x]);
}

myUI.canvases.hover_map.canvas.addEventListener(`mousemove`, myUI.handle_map_hover);

myUI.canvases.hover_map.canvas.addEventListener(`mouseout`, e=>myUI.canvases.hover_map.erase_canvas());

/*myUI.map_goal_icon.elem.addEventListener(`mousedown`, e=>{
	myUI.map_goal_icon.clicked = true;
});

myUI.map_goal_icon.elem.addEventListener(`mouseup`, e=>{
	myUI.map_goal_icon.clicked = false;
});

myUI.map_start_icon.elem.addEventListener(`mousedown`, e=>{
	myUI.map_start_icon.clicked = true;
});

myUI.map_start_icon.elem.addEventListener(`mouseup`, e=>{
	myUI.map_start_icon.clicked = false;
});*/
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
			elmnt.style.top = (elmnt.offsetTop - dy) + "px";
			y1 = e.clientY;
		}
		if(elmnt.offsetLeft - dx >= -elmnt.width/2 && elmnt.offsetLeft - dx <= bounds.width-elmnt.width/2){
			elmnt.style.left = (elmnt.offsetLeft - dx) + "px";
			x1 = e.clientX;
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
		console.log(x, y);
		let scaled_x = Math.floor(x/bounds.width *  myUI.map_width);  //  scale x an dy
		let scaled_y = Math.floor(y/bounds.height *  myUI.map_height);
		if(elmnt.id=="map_start_icon"){
			myUI.map_start = [scaled_y, scaled_x];
		}
		else if(elmnt.id=="map_goal_icon"){
			myUI.map_goal = [scaled_y, scaled_x];
		}
		myUI.displayScen();
  }
}