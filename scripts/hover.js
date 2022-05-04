myUI.handle_map_hover = function(e){
	let x = e.offsetX;
	let y = e.offsetY;
	let scaled_x = Math.floor(x/myUI.canvases.hover_map.canvas.clientWidth *  myUI.map_width);
	let scaled_y = Math.floor(y/myUI.canvases.hover_map.canvas.clientHeight *  myUI.map_height);
	if (myUI.map_goal_icon.clicked){
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
	}
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

myUI.map_goal_icon.elem.addEventListener(`mousedown`, e=>{
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
});
