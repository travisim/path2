myUI.scale_coord = function (x, y) {
	const HOVER_MAP = myUI.canvases.hover_map.canvas;
	var scaled_y = (y) / (HOVER_MAP.clientWidth) * myUI.map_width;
	var scaled_x = (x) / (HOVER_MAP.clientHeight) * myUI.map_height;
	if(myUI.planner.constructor.gridPrecision != "float"){
		if(myUI.vertex){
			var scaled_y = Math.round(scaled_y);
			var scaled_x = Math.round(scaled_x);
		}
		else{
			var scaled_y = Math.floor(scaled_y);
			var scaled_x = Math.floor(scaled_x);
		}
	}
	return [scaled_x, scaled_y];
}

function cellIsValid(xy){
	return myUI.planner.cell_map && !isNaN(myUI.planner.cell_map.get(xy)) && myUI.planner.cell_map.get(xy) != -1;
}

myUI.handle_map_hover = function(e){

	let tooltip_data = document.getElementById("tooltip_data");

	e = e || window.event;
	e.preventDefault();
	/* colours the map on hover */
	let [scaled_x, scaled_y] = myUI.scale_coord(e.offsetY, e.offsetX);
	
	// set max 2dp for tooltip coords
	if (precision(scaled_x) > 4) scaled_x = scaled_x.toPrecision(4);
	if (precision(scaled_y) > 4) scaled_y = scaled_y.toPrecision(4);
	document.getElementById("hover_y").innerHTML = scaled_y;
	document.getElementById("hover_x").innerHTML = scaled_x;

	myUI.canvases.hover_map.erase_canvas();
	myUI.canvases.hover_map.set_color_index(0, "both");
	if(myUI.map_arr && !myUI.vertex)
		if(myUI.map_arr[scaled_x][scaled_y]==0)
			myUI.canvases.hover_map.set_color_index(1, "both");

	myUI.canvases.hover_map.canvas.style.cursor = "auto";
	//document.getElementById("hover_cell_index").innerHTML = "-";
	tooltip_data.style.backgroundColor = ``;
	if(myUI.planner.constructor.gridPrecision != "float"  && cellIsValid([scaled_x, scaled_y])){ //lazy evaluation
		myUI.canvases.hover_map.set_color_index(2, "both");
		myUI.canvases.hover_map.canvas.style.cursor = "pointer";
		//document.getElementById("hover_cell_index").innerHTML = myUI.planner.cell_map.get([scaled_x, scaled_y])
	}
	myUI.canvases.hover_map.draw_start_goal([scaled_x, scaled_y]);

	myUI.planner.constructor.hoverData.forEach(obj=>{
		if(obj.type=="canvasCache"){
			if(!myUI.canvases[obj.canvasId]) return;
			let val = myUI.canvases[obj.canvasId].canvas_cache[scaled_x][scaled_y];
			if(myUI.canvases[obj.canvasId].valType=="float") val = val.toPrecision(5);
			document.getElementById(obj.id).innerHTML = val;
		}
	});

	/* shows the popup */
	tooltip_data.style.display = "block";
	tooltip_data.style.left = e.pageX + 'px';
	tooltip_data.style.top = e.pageY + 'px';
}


myUI.canvases.hover_map.canvas.addEventListener(`mousemove`, myUI.handle_map_hover);

myUI.canvases.hover_map.canvas.addEventListener(`click`, e=>{
	let xy = myUI.scale_coord(e.offsetY, e.offsetX);
	if(myUI.planner.constructor.gridPrecision != "float"  && cellIsValid(xy)){
		myUI.animation.step = myUI.planner.cell_map.get(xy);
		myUI.jump_to_step();
	}
});

myUI.canvases.hover_map.canvas.addEventListener(`mouseleave`, e=>{
	myUI.canvases.hover_map.erase_canvas();
	tooltip_data.style.display = "none";
});

function dragElement(elmnt, slaveElmnt) {

	elmnt.addEventListener(`mouseenter`, e=>elmnt.style.cursor = "move");
	elmnt.addEventListener(`mouseleave`, e=>elmnt.style.cursor = "auto");

	var bounds = myUI.canvases.hover_map.canvas.getBoundingClientRect();
	let x1, y1, dx, dy;
	const CANVAS_OFFSET = Number(getComputedStyle(document.querySelector(".map_canvas")).getPropertyValue('top').slice(0,-2));
	const e_num = 1e-3;
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
	  

	//elmnt.style.top = (elmnt.offsetTop - dy) + "px";
    //elmnt.style.left = (elmnt.offsetLeft - dx) + "px";
		if(elmnt.offsetTop - dy >= -elmnt.height/2 + CANVAS_OFFSET && elmnt.offsetTop - dy <= bounds.height-elmnt.height/2 + CANVAS_OFFSET){  // if within y-bounds
			elmnt.style.top = (elmnt.offsetTop - dy) + "px";  // move the element in y-axis
			y1 = elmnt.getBoundingClientRect().y + elmnt.height/2;// update the y-coordinate when mouseup 
		}
	 
	  if (elmnt.offsetLeft - dx >= -elmnt.width / 2 + CANVAS_OFFSET && elmnt.offsetLeft - dx <= bounds.width - elmnt.width / 2 + CANVAS_OFFSET) {  // if within x-bounds
			elmnt.style.left = (elmnt.offsetLeft - dx) + "px";  // move the element in x-axis
			x1 = elmnt.getBoundingClientRect().x + elmnt.width/2; // update the x-coordinate when mouseup
		}
		
		if (slaveElmnt) {
			if (slaveElmnt.offsetTop - dy >= -slaveElmnt.clientHeight / 2 + CANVAS_OFFSET && slaveElmnt.offsetTop - dy <= bounds.height - slaveElmnt.clientHeight / 2 + CANVAS_OFFSET) {  // if within y-bounds
					slaveElmnt.style.top = (slaveElmnt.offsetTop - dy) + "px";
			}
			if (slaveElmnt.offsetLeft - dx >= -slaveElmnt.clientWidth / 2 + CANVAS_OFFSET && slaveElmnt.offsetLeft - dx <= bounds.width - slaveElmnt.clientWidth / 2 + CANVAS_OFFSET) {  // if within x-bounds
				slaveElmnt.style.left = (slaveElmnt.offsetLeft - dx) + "px";
			}
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
		y = Math.max(0, Math.min(bounds.width - e_num + CANVAS_OFFSET, y));  // fix to boundaries
		x = Math.max(0, Math.min(bounds.height - e_num + CANVAS_OFFSET, x));
		let [scaled_x, scaled_y] = myUI.scale_coord(x,y);

		//below code auto shifts coords to prevent start.goal to be on obstacle
		let checkX = scaled_x, checkY = scaled_y;
		if(!myUI.vertex) checkX += 0.5, checkY += 0.5;
		while(CustomLOSChecker([checkX, checkY], [checkX, checkY]).boolean == false){
			checkX++; checkY++;
		}
		if(!myUI.vertex) checkX -= 0.5, checkY -= 0.5;
		if(checkX != scaled_x) alert("coordinates have been shifted to avoid obstacles");
		scaled_x = checkX; scaled_y = checkY;
		
		if(elmnt.id=="map_start_icon"){
			myUI.map_start = [scaled_x, scaled_y];
		} 
		else if(elmnt.id=="map_goal_icon") {
			myUI.map_goal = [scaled_x, scaled_y];
		}

	  myUI.displayScen(true, true);
  }
}

dragElement(myUI.map_start_icon.elem)
dragElement(myUI.map_goal_icon.elem, myUI.map_goal_radius.elem);

// retruns number of digits after decimal place
function precision(a) {
  if (!isFinite(a)) return 0;
  var e = 1, p = 0;
  while (Math.round(a * e) / e !== a) { e *= 10; p++; }
  return p;
}