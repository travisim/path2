myUI.scale_coord = function (x, y) {
	const CANVAS_OFFSET = Number(getComputedStyle(document.querySelector(".map_canvas")).getPropertyValue('top').slice(0,-2));
	if(myUI.vertex && !myUI.gridPrecision ){
		let sy = myUI.canvases.hover_map.canvas.clientWidth/myUI.map_width;
		let sx = myUI.canvases.hover_map.canvas.clientHeight/myUI.map_height;
		var scaled_y = Math.floor((y+sy/2) / (myUI.canvases.hover_map.canvas.clientWidth+sy) * (myUI.map_width+1));
		var scaled_x = Math.floor((x+sx/2) / (myUI.canvases.hover_map.canvas.clientHeight+sx) * (myUI.map_height+1));
	}
	else if(myUI.vertex && myUI.gridPrecision == "float"){
		let sy = myUI.canvases.hover_map.canvas.clientWidth/myUI.map_width;
		let sx = myUI.canvases.hover_map.canvas.clientHeight/myUI.map_height;
		var scaled_y = (y-CANVAS_OFFSET) / sy;
		var scaled_x = (x-CANVAS_OFFSET) / sx;
	}
	else{
		var scaled_y = Math.floor(y/myUI.canvases.hover_map.canvas.clientWidth * myUI.map_width);
		var scaled_x = Math.floor(x/myUI.canvases.hover_map.canvas.clientHeight * myUI.map_height);
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
	if(cellIsValid([scaled_x, scaled_y])){
		myUI.canvases.hover_map.set_color_index(2, "both");
		myUI.canvases.hover_map.canvas.style.cursor = "pointer";
		//document.getElementById("hover_cell_index").innerHTML = myUI.planner.cell_map.get([scaled_x, scaled_y])
	}
	myUI.canvases.hover_map.draw_start_goal([scaled_x, scaled_y]);

	myUI.hoverData.forEach(obj=>{
		if(obj.type=="canvasCache"){
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


if(myUI.planner.constructor.display_name != "RRT" )myUI.canvases.hover_map.canvas.addEventListener(`mousemove`, myUI.handle_map_hover);

myUI.canvases.hover_map.canvas.addEventListener(`click`, e=>{
	let xy = myUI.scale_coord(e.offsetY, e.offsetX);
	if(cellIsValid(xy)){
		myUI.animation.step = myUI.planner.cell_map.get(xy);
		myUI.jump_to_step();
	}
});

myUI.canvases.hover_map.canvas.addEventListener(`mouseleave`, e=>{
	myUI.canvases.hover_map.erase_canvas();
	tooltip_data.style.display = "none";
});






function dragElementGridSnap(elmnt) {

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
		
  }

  function closeDragElement(e) {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
	e = e || window.event;
    e.preventDefault();
		let y = x1 - bounds.left;
		let x = y1 - bounds.top;
		y = Math.max(CANVAS_OFFSET, Math.min(bounds.width- e_num + CANVAS_OFFSET, y));  // fix to boundaries
		x = Math.max(CANVAS_OFFSET, Math.min(bounds.height- e_num + CANVAS_OFFSET, x));
		let [scaled_x, scaled_y] = myUI.scale_coord(x,y);
		console.log(scaled_x, scaled_y);
		if(elmnt.id=="map_start_icon"){
			myUI.map_start = [scaled_x, scaled_y];

		} 
		else if(elmnt.id=="map_goal_icon") {
			myUI.map_goal = [scaled_x, scaled_y];
			
		}
	
	  
		console.log("GOING TO DISPLAY")
	  myUI.displayScen(true, true);
	  
	  
  }
}

function dragElementNoSnap(elmnt) {
	var dx = 0, dy = 0, x1 = 0, y1 = 0;
	const CANVAS_OFFSET = Number(getComputedStyle(document.querySelector(".map_canvas")).getPropertyValue('top').slice(0,-2));
 	const e_num = 1e-3;
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
	var bounds = myUI.canvases.hover_map.canvas.getBoundingClientRect();

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
	var bounds = myUI.canvases.hover_map.canvas.getBoundingClientRect();
	// calculate the new cursor position:
	dx = x1 - e.clientX;
	dy = y1 - e.clientY;
	x1 = e.clientX;
	y1 = e.clientY;
	// set the element's new position:
	if (elmnt.offsetTop - dy >= -elmnt.clientHeight / 2 + CANVAS_OFFSET && elmnt.offsetTop - dy <= bounds.height - elmnt.clientHeight / 2 + CANVAS_OFFSET) {  // if within y-bounds
		elmnt.style.top = (elmnt.offsetTop - dy) + "px";
		
	}
	if (elmnt.offsetLeft - dx >= -elmnt.clientWidth / 2 + CANVAS_OFFSET && elmnt.offsetLeft - dx <= bounds.width - elmnt.clientWidth / 2 + CANVAS_OFFSET) {  // if within x-bounds
		elmnt.style.left = (elmnt.offsetLeft - dx) + "px";
	}
}

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
	document.onmousemove = null;
	
	let y = x1 - bounds.left;
	let x = y1 - bounds.top;
	y = Math.max(CANVAS_OFFSET, Math.min(bounds.width - e_num + CANVAS_OFFSET, y));  // fix to boundaries
	x = Math.max(CANVAS_OFFSET, Math.min(bounds.height - e_num + CANVAS_OFFSET, x));
	let [scaled_x, scaled_y] = myUI.scale_coord(x,y);
	if(elmnt.id=="map_start_icon"){
			myUI.map_start = [scaled_x, scaled_y];

		}   
	else if(elmnt.id=="map_goal_radius") {
		myUI.map_goal = [scaled_x, scaled_y];
		
	}
	  

	  //
	  
		
	  myUI.displayScen(true, true);
	  myUI.planner.generateNewMap(myUI.map_start, myUI.map_goal);
	  /*
	  document.getElementById("compute_btn").click();
	
	setTimeout(() => {
		document.getElementById("end_btn").click()
		}, 100);
	  //setTimeout(myUI.jump_to_end(), 5000)
	  */
  }
}

