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
            while(num_steps--) myUI.run_steps(1);
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
  let all_states = myUI.planner.all_states();
  let tmp_step = target_step;
  if(myUI.db_on)
    while(!all_states.has(tmp_step) && tmp_step>-1)
      --tmp_step;
  else
    while(!all_states.hasOwnProperty(tmp_step) && tmp_step>-1)
      --tmp_step;
  //console.log("Last state:", tmp_step);
  myUI.animation.step = tmp_step;

  const canvas_ids = [`queue`, `neighbours`, `current_YX`, `visited`, `path`];
  // create a virtual representation of all the canvases
  myUI.tmp.virtual_canvases = {};
  canvas_ids.forEach(id=>{
    myUI.tmp.virtual_canvases[id] = zero2D(myUI.map_height, myUI.map_width);
  });
  myUI.arrow.data.forEach(el=>el.classList.add(`hidden`));
  myUI.arrow.step = -1;

  if(tmp_step>-1){ //  if there is a recent state to fallback on
  
    // request the state from the db
    if(myUI.db_on){
      // draw the state virtually
      myUI.storage.get("states", tmp_step).then(state=>{
        draw_canvas_from_state(state);
        execute_steps(tmp_step, target_step);
      });
    }
    else{
      // take from memory
      let state = all_states[tmp_step];
      draw_canvas_from_state(state);     
      execute_steps(tmp_step, target_step);
    }
  }
  else{  //  no state to fall back on
    execute_steps(tmp_step, target_step);
  }

  function execute_steps(tmp_step, target_step){

    canvas_ids.forEach(id=>{
      let data = myUI.tmp.virtual_canvases[id];
      myUI.canvases[id].erase_canvas();
      myUI.canvases[id].draw_canvas(data, `2d`);
    });
    // execute the steps
    myUI.run_steps(target_step - tmp_step, "fwd", false);
  }

  function draw_canvas_from_state(state){
    myUI.draw_virtual_canvas(`queue`, state.queue, `1d`);
    curr_visited = myUI.db_on ? state.visited : myUI.planner.all_states().visited_data[state.visited[0]].slice(state.visited[1], state.visited[2]);
    //console.log(BitMatrix.expand_2_matrix(curr_visited));
    myUI.draw_virtual_canvas(`visited`, BitMatrix.expand_2_matrix(curr_visited), `2d`);
    let y = state.node_YX[0];
    let x = state.node_YX[1];
    myUI.tmp.virtual_canvases.current_YX[y][x] = 1;
    myUI.draw_virtual_canvas(`neighbours`, state.neighbours, `1d`);
    if(state.path) myUI.draw_virtual_canvas(`path`, state.path, `1d`);
    myUI.arrow.step = state.arrow_step;
    for(let i=0;i<=state.arrow_step;++i) myUI.arrow.data[i].classList.remove(`hidden`);
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
  document.getElementById("map").appendChild(elem);
  elem.style.top = (start_coord.y + elem_path_length * Math.sin(angle)/2 + 0.5) * display_ratio - 3 +"px";
  elem.style.left = (start_coord.x + 0.5 - elem_path_length * (1-Math.cos(angle))/2) * display_ratio +"px";
  elem.id = `${start_coord.y},${start_coord.x} ${end_coord.y},${end_coord.x}`;
  myUI.arrow.data.push(elem);
}
