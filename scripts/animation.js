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

  const canvas_ids = [`queue`, `neighbours`, `current_YX`, `visited`, `path`];
  // create a virtual representation of all the canvases
  myUI.tmp.virtual_canvases = {};
  canvas_ids.forEach(id=>{
    myUI.canvases[id].init_virtual_canvas();
  });
  myUI.arrow.ctx.clearRect(...myUI.arrow.full_canvas);
  myUI.arrow.step = -1;

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

  function draw_canvas_from_state(state){

    myUI.canvases.queue.draw_canvas(state.queue, `1d`, false, true);

    let curr_visited = myUI.planner.get_visited(state.visited_tuple);
    myUI.canvases.visited.draw_canvas(NBitMatrix.expand_2_matrix(curr_visited), `2d_heatmap`, false, true);

    myUI.canvases.current_YX.draw_canvas([state.node_YX], `1d`, false, true);

    myUI.canvases.neighbours.draw_canvas(state.neighbours, `1d`, false, true);

    if(state.path) myUI.canvases.neighbours.draw_canvas(state.path, `1d`, false, true);
    
    myUI.arrow.step = state.arrow_step;
    if(state.arrow_img) myUI.arrow.ctx.putImageData(state.arrow_img, 0, 0);
    //for(let i=0;i<=state.arrow_step;++i) myUI.arrow.data[i].classList.remove(`hidden`);
  }
}

myUI.draw_virtual_canvas = function(canvas_id, array_data, array_type){
  if (array_type == "1d") {
    array_data.forEach(coord=>{
      // coord is in row-major form
      var y = Math.floor(coord/myUI.planner.map_width);
      var x = coord - y * myUI.planner.map_width;
      myUI.tmp.virtual_canvases[canvas_id][y][x] = 1;
    });
  }
  else if(array_type == "2d") {  //eg [ [ 8, 6 ], [ 9, 7 ], [ 8, 8 ] ]
    for (i = 0; i < array_data.length; i++) 
      for (j = 0; j < array_data[i].length; j++) 
        if (array_data[i][j])
          myUI.tmp.virtual_canvases[canvas_id][i][j] = 1;
  }
}

myUI.create_arrow = function(start_YX, end_YX){
  const start_coord = {y:start_YX[0], x:start_YX[1]};
  const end_coord = {y:end_YX[0], x:end_YX[1]};
  const display_ratio = myUI.canvases.bg.canvas.clientWidth / myUI.map_width;
  let elem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  elem.classList.add("arrow");
  elem.classList.add("hidden");
  let dy = end_coord.y-start_coord.y, dx = end_coord.x-start_coord.x;
  let angle = Math.atan2(dy, dx);
  let elem_path_length = Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2));
  let elem_window_length = display_ratio * elem_path_length;
  elem.setAttribute('viewBox', `0 0 ${elem_window_length + 3} 9`);
  elem.style.width = elem_window_length + 3;
  elem.style.transform = `rotate(${angle}rad)`;
  elem.innerHTML = `<path fill="purple" d="M 1.5 3 a 1.5 1.5, 0, 0, 0, 0 3 h ${elem_window_length - 18} v 3 l 6 -3 h 12 a 1.5 1.5, 0, 0, 0, 0 -3 h -12 l -6 -3 v 3 z"></path>`;
  document.getElementById("canvas_container").appendChild(elem);
  elem.style.top = (start_coord.y + elem_path_length * Math.sin(angle)/2 + 0.5) * display_ratio - 3 +"px";
  elem.style.left = (start_coord.x + 0.5 - elem_path_length * (1-Math.cos(angle))/2) * display_ratio +"px";
  elem.id = `${start_coord.y},${start_coord.x} ${end_coord.y},${end_coord.x}`;
  myUI.arrow.data.push(elem);
}

myUI.reset_arrow = function(){
  myUI.arrow.data = [];
  myUI.arrow.coords = [];
}

myUI.draw_arrow = function(start_YX, end_YX, save_data=false, color_index=0,vertex=false, canvas=null){

  function scale_coord(yx){
    return [yx[0]*canvas.height / myUI.map_height, yx[1]*canvas.width / myUI.map_width];
  }

  console.log(`drawing ${start_YX} ${end_YX}`);
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
    myUI.arrow.coords.push(start_YX, end_YX);
  if(!vertex){
    start_YX = [start_YX[0]+0.5, start_YX[1]+0.5];
    end_YX = [end_YX[0]+0.5, end_YX[1]+0.5];
  }
  if(save_data){
    let min_x = Math.min(start_YX[1], end_YX[1])-0.25;
    let min_y = Math.min(start_YX[0], end_YX[0])-0.25;
    let max_x = Math.max(start_YX[1], end_YX[1])+0.25;
    let max_y = Math.max(start_YX[0], end_YX[0])+0.25;
    [min_y, min_x] = scale_coord([min_y, min_x]);
    [max_y, max_x] = scale_coord([max_y, max_x]);
    let img_data = myUI.arrow.ctx.getImageData(min_x, min_y, max_x, max_y);
    myUI.arrow.data.push([img_data, min_x, min_y]);
  }
	
	let [fromy, fromx] = scale_coord(start_YX);
	let [toy, tox] = scale_coord(end_YX);

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
