function animation_backend(){

  if(!myUI.planner) return alert("no planner loaded");

  var timer;

  updateMap();

  function updateMap(){
    if (myUI.animation.step<myUI.animation.max_step){
      // display on map
      if(myUI.animation.running){

        if(myUI.animation.jump_steps>1){
          let num_steps = parseInt(myUI.animation.jump_steps);
          if(myUI.animation.detailed){
            if(num_steps>50) myUI.jump_to_step(myUI.animation.step + num_steps);
            else myUI.run_steps(num_steps);
          }
          else
            while(num_steps--) myUI.run_combined_step();
        }
        else{
          if(myUI.animation.detailed)
            myUI.run_steps(1);
          else
            myUI.run_combined_step();
        }
        myUI.update_search_slider(myUI.animation.step);
        // 1× speed is defined as 5 fps
        let each_frame_duration = 200/myUI.animation.speed;
        timer = setTimeout(updateMap, each_frame_duration);
      }
      else{
        clearTimeout(timer);
      }
    }
    else{
      console.log("map_done")
      clearTimeout(timer);
      myUI.stop_animation(change_svg=true);
    }
  }
}

myUI.update_search_slider = function(value){
  myUI.animation.step = Number(value);
  let percent = ((myUI.animation.step+1)/(myUI.animation.max_step+1))*100;
	myUI.sliders.search_progress_slider.label.innerHTML = (Math.round(percent * 100) / 100).toFixed(2); // format to 2dp
  myUI.sliders.search_progress_slider.elem.value = myUI.animation.step;
}

myUI.jump_to_step = function(target_step){
  myUI.animation.step = myUI.planner.search_state(target_step);

  const canvas_ids = [`queue`, `neighbors`, `current_XY`, `visited`, `path`];
  // create a virtual representation of all the canvases
  myUI.tmp.virtual_canvases = {};
  canvas_ids.forEach(id=>{
    myUI.canvases[id].init_virtual_canvas();
  });
  //myUI.arrow.ctx.clearRect(...myUI.arrow.full_canvas);
  myUI.arrow.step = -1;
  myUI.arrow.elems.forEach(el=>el.classList.add("hidden"));

  if(myUI.animation.step>-1){ //  if there is a recent state to fallback on
  
    // take from memory
    let state = myUI.planner.get_state(myUI.animation.step);
    draw_canvas_from_state(state);
  }
  canvas_ids.forEach(id=>{
    let data = myUI.canvases[id].virtualCanvas;
    myUI.canvases[id].draw_canvas(data, `2d_heatmap`);
  });/* */
  myUI.run_steps(target_step - myUI.animation.step, "fwd");
  myUI.determine_header

  function draw_canvas_from_state(state){
    
    myUI.canvases.queue.draw_canvas(nodes_to_array(state.queue, "self_XY"), `1d`, false, true);

    let curr_visited = NBitMatrix.expand_2_matrix(myUI.planner.get_visited(state.visited_tuple));
    myUI.canvases.visited.draw_canvas(curr_visited, `2d_heatmap`, false, true);

    myUI.canvases.current_XY.draw_canvas([state.node_XY], `1d`, false, true);
//console.log("state",state.visited_tuple);
    myUI.canvases.neighbors.draw_canvas(nodes_to_array(state.neighbors, "self_XY"), `1d`, false, true);

    if(state.path) myUI.canvases.neighbors.draw_canvas(state.path, `1d`, false, true);

    if(state.arrow_state) for(let i=0;i<myUI.arrow.elems.length;++i){
      myUI.arrow.elems[i].style.fill = myUI.arrow.colors[0];
      if(state.arrow_state[i]) myUI.arrow.elems[i].classList.remove("hidden");
      else myUI.arrow.elems[i].classList.add("hidden");
    }

    try{
      myUI.InfoMap.reset();
      for(const [key, IT] of Object.entries(myUI.InfoTables))
        IT.removeAllTableSlides();
    
      myUI.InfoMap.drawObstacle(state.node_XY[1],state.node_XY[0]);
      myUI.InfoMap.drawOutOfBound(state.node_XY[1],state.node_XY[0]);
      myUI.InfoCurrent.DrawCurrent(state.node_XY[1],state.node_XY[0]);
      myUI.InfoQueue = new BitMatrix(myUI.map_height, myUI.map_width); // recreates the visited 2d array from tha steps for the display of the info map
      myUI.InfoVisited = new BitMatrix(myUI.map_height, myUI.map_width); // recreates the visited 2d array from tha steps for the display of the info map
      state.queue.forEach(xy=>{ 
        myUI.InfoQueue.set_data(xy, 1);
      });
      myUI.InfoMap.drawQueue(x,y);

      /*
    forEach(xy=>{ 
      myUI.InfoVisited.set_data(xy, 1);
    });
    
  
      myUI.InfoMap.drawVisitedFromState(x,y);
      
      
    */
    }
    catch(e){
      debugger;
    }
  }
}

myUI.draw_virtual_canvas = function(canvas_id, array_data, array_type){
  if (array_type == "1d") {
    array_data.forEach(coord=>{
      // coord is in row-major form
      var y = Math.floor(coord/myUI.planner.map_width);
      var x = coord - y * myUI.planner.map_width;
      myUI.tmp.virtual_canvases[canvas_id][x][y] = 1;
    });
  }
  else if(array_type == "2d") {  //eg [ [ 8, 6 ], [ 9, 7 ], [ 8, 8 ] ]
    for (i = 0; i < array_data.length; i++) 
      for (j = 0; j < array_data[i].length; j++) 
        if (array_data[i][j])
          myUI.tmp.virtual_canvases[canvas_id][i][j] = 1;
  }
}

myUI.create_arrow = function(start_XY, end_XY, head_pc=0.7){
  // head_pc is defined as the proportion of line is in front of the pointer
  const start_coord = {y:start_XY[0], x:start_XY[1]};
  const end_coord = {y:end_XY[0], x:end_XY[1]};
  const display_ratio = myUI.canvases.bg.canvas.clientWidth / myUI.map_width;
  let elem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  elem.classList.add("arrow");
  elem.classList.add("hidden");
  let dy = end_coord.y-start_coord.y, dx = end_coord.x-start_coord.x;
  let angle = Math.atan2(dy, dx);
  let elem_path_length = Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2));
  let elem_window_length = display_ratio * elem_path_length;
  elem.setAttribute('viewBox', `0 0 ${elem_window_length + 3} 9`);
  elem.style.width = String(elem_window_length+3)+"px";
  elem.style.transform = `rotate(${angle}rad)`;
  let total_len = 3+elem_window_length;
  let front_len = head_pc * total_len - 1.5 - 3;
  let back_len = (1-head_pc) * total_len - 1.5 - 3;
  if(elem_window_length<14) elem.innerHTML = `<path d="M 1.5 3 a 1.5 1.5, 0, 0, 0, 0 3 h ${elem_window_length} a 1.5 1.5, 0, 0, 0, 0 -3 z"></path>`;
  else elem.innerHTML = `<path d="M 1.5 3 a 1.5 1.5, 0, 0, 0, 0 3 h ${back_len} v 3 l 6 -3 h ${front_len} a 1.5 1.5, 0, 0, 0, 0 -3 h ${0-front_len} l -6 -3 v 3 z"></path>`;
  document.getElementById("canvas_container").appendChild(elem);
  let displayOffset = 0.5;
  if(myUI.vertex){
    displayOffset = 0;
    elem.style.zIndex = 40
  }
  elem.style.top = (start_coord.y + elem_path_length * Math.sin(angle)/2 + displayOffset) * display_ratio - 4.5 +"px";
  elem.style.left = (start_coord.x + displayOffset - elem_path_length * (1-Math.cos(angle))/2) * display_ratio - 1.5 +"px";
  elem.id = `${start_coord.y},${start_coord.x} ${end_coord.y},${end_coord.x}`;
  myUI.arrow.elems.push(elem);
  return myUI.arrow.elems.length-1;
}

myUI.reset_arrow = function(clear_data=false){
  if(clear_data){
    myUI.arrow.data = [];
    myUI.arrow.coords = [];
    myUI.arrow.elems.forEach(el=>el.remove());
    myUI.arrow.elems = [];
  }
  else{
    myUI.arrow.elems.forEach(el=>{
      el.classList.add("hidden");
      el.style.fill = myUI.arrow.colors[0];
    });
  }
}

myUI.draw_arrow = function(start_XY, end_XY, save_data=false, color_index=0,vertex=false, canvas=null){

  function scale_coord(xy){
    return [xy[0]*canvas.height / myUI.map_height, xy[1]*canvas.width / myUI.map_width];
  }

  console.log(`drawing ${start_XY} ${end_XY}`);
  let color = "black";
  if(canvas==null){
    canvas = myUI.arrow.canvas;
    color = myUI.arrow.colors[color_index];
  }
  const line_width = canvas.height/192;//10.6667;//canvas.height/myUI.map_height/12;
	//console.log(line_width);
	const headlen = line_width*1.5;
	const ctx = canvas.getContext('2d');
  
  if(save_data)
    myUI.arrow.coords.push(start_XY, end_XY);
  if(!vertex){
    // offset coordinates based on vertex to draw arrows
    start_XY = [start_XY[0]+0.5, start_XY[1]+0.5];
    end_XY = [end_XY[0]+0.5, end_XY[1]+0.5];
  }
  if(save_data){
    // save data before drawing the arrow
    let min_x = Math.min(start_XY[1], end_XY[1])-0.25;
    let min_y = Math.min(start_XY[0], end_XY[0])-0.25;
    let max_x = Math.max(start_XY[1], end_XY[1])+0.25;
    let max_y = Math.max(start_XY[0], end_XY[0])+0.25;
    [min_y, min_x] = scale_coord([min_y, min_x]);
    [max_y, max_x] = scale_coord([max_y, max_x]);
    console.log(min_x, min_y, max_x, max_y);
    //throw "error";
    let img_data = myUI.arrow.ctx.getImageData(min_x, min_y, max_x, max_y);
    myUI.arrow.data.push([img_data, min_x, min_y]);
  }
	
	let [fromy, fromx] = scale_coord(start_XY);
	let [toy, tox] = scale_coord(end_XY);

	/*fromx *= canvas.width / myUI.map_width;
	fromy *= canvas.height / myUI.map_height;
	tox *=  canvas.width / myUI.map_width
	toy *= canvas.height / myUI.map_height;*/
	const angle = Math.atan2(toy-fromy,tox-fromx);

	let midx = fromx + (tox-fromx)*1/4 + headlen*Math.cos(angle);
	let midy = fromy + (toy-fromy)*1/4 + headlen*Math.sin(angle);
	if(myUI.map_height>16){
		midx = fromx + (tox-fromx)/2 + headlen*Math.cos(angle);
	 	midy = fromy + (toy-fromy)/2+ headlen*Math.sin(angle);
	}
	
	ctx.save();
	// First path
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.moveTo(fromx, fromy);
	ctx.lineTo(tox, toy);
	ctx.lineWidth = line_width;
	ctx.stroke();

	if(myUI.map_height>32) return;
//starting a new path from the head of the arrow to one of the sides of
  //the point
  ctx.beginPath();
  ctx.moveTo(midx, midy);
  ctx.lineTo(midx-headlen*Math.cos(angle-Math.PI/7),
              midy-headlen*Math.sin(angle-Math.PI/7));

  //path from the side point of the arrow, to the other side point
  ctx.lineTo(midx-headlen*Math.cos(angle+Math.PI/7),
              midy-headlen*Math.sin(angle+Math.PI/7));

  //path from the side point back to the tip of the arrow, and then
  //again to the opposite side point
  ctx.lineTo(midx, midy);
  ctx.lineTo(midx-headlen*Math.cos(angle-Math.PI/7),
              midy-headlen*Math.sin(angle-Math.PI/7));

  //draws the paths created above
  ctx.stroke();
  ctx.restore();
  
}
