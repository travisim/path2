function animation_backend(){

  if(!myUI.planner) return alert("no planner loaded");
  let all_steps = myUI.animation.all_steps_fwd;
  if(all_steps==null) return alert("not yet finished searching");

  var timer;

  updateMap();

  function updateMap(){
    if (myUI.animation.step<myUI.animation.max_step){
      // display on map
      if(myUI.animation.running){

        myUI.update_search_slider(myUI.animation.step);

        if(myUI.animation.detailed)
          myUI.run_single_step(myUI.animation.step);
        else
          myUI.run_combined_step(myUI.animation.step);

				let expo_scaled = myUI.animation.speed;
        let total_time = 20/expo_scaled;
        let each_frame_duration = total_time/myUI.animation.max_step;

        timer = setTimeout(updateMap, each_frame_duration*1000);
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
  myUI.animation.step = value;
  let percent = (myUI.animation.step/myUI.animation.max_step)*100;
	myUI.sliders.search_progress_slider.label.innerHTML = (Math.round(percent * 100) / 100).toFixed(2); // format to 2dp
  myUI.sliders.search_progress_slider.elem.value = myUI.animation.step;
}

myUI.jump_to_step = function(target_step){
  let all_states = myUI.planner.all_states();
  let tmp_step = target_step;
  if(myUI.db_on)
    while(!all_states.has(tmp_step) && tmp_step>0)
      --tmp_step;
  else
    while(!all_states.hasOwnProperty(tmp_step) && tmp_step>0)
      --tmp_step;
  //console.log(tmp_step);

  const canvas_ids = [`queue`, `neighbours`, `current_YX`, `visited`, `path`];
  // create a virtual representation of all the canvases
  myUI.tmp.virtual_canvases = {};
  canvas_ids.forEach(id=>{
    myUI.tmp.virtual_canvases[id] = zero2D(myUI.map_height, myUI.map_width);
  });

  if(tmp_step!=0){ //  if there is a recent state to fallback on
  
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
  else{
    execute_steps(tmp_step, target_step);
  }

  function execute_steps(tmp_step, target_step){
    // execute the steps
    let steps_to_execute = myUI.planner.all_steps().slice(tmp_step, target_step);

    /* NEW */
    steps_to_execute.forEach(step=>{
      step.forEach(action=>{
        if(action[0]==STATIC.DC){
          let canvas = action[1];
          draw_virtual_canvas(statics_to_obj[canvas], action[2], action[3]);
        }
        else if(action[0]==STATIC.EC){
          myUI.tmp.virtual_canvases[statics_to_obj[action[1]]] = zero2D(myUI.map_height, myUI.map_width);
        }
        else if(action[0]==STATIC.DP){
          myUI.tmp.virtual_canvases[statics_to_obj[action[1]]][action[2]][action[3]] = 1;
        }
        else if(action[0]==STATIC.EP){
          myUI.tmp.virtual_canvases[statics_to_obj[action[1]]][action[2]][action[3]] = 0;
        }
      });
    });

    canvas_ids.forEach(id=>{
      let data = myUI.tmp.virtual_canvases[id];
      myUI.canvases[id].erase_canvas();
      myUI.canvases[id].draw_canvas(data, `2d`);
    });
  }

  function draw_canvas_from_state(state){
    draw_virtual_canvas(`queue`, state.queue, `1d`);
    draw_virtual_canvas(`visited`, BitMatrix.expand_2_matrix(state.visited), `2d`);
    let y = state.node_YX[0];
    let x = state.node_YX[1];
    myUI.tmp.virtual_canvases.current_YX[y][x] = 1;
    draw_virtual_canvas(`neighbours`, state.neighbours, `1d`);
    if(state.path)
      draw_virtual_canvas(`path`, state.path, `1d`);
  }

  function draw_virtual_canvas(canvas_id, array_data, array_type){
    if (array_type == "1d") {
      array_data.forEach(coord=>{
        myUI.tmp.virtual_canvases[canvas_id][coord[0]][coord[1]] = 1;
      });
    }
    else if(array_type == "2d") {  //eg [ [ 8, 6 ], [ 9, 7 ], [ 8, 8 ] ]
      for (i = 0; i < array_data.length; i++) 
        for (j = 0; j < array_data[i].length; j++) 
          if (array_data[i][j])
            myUI.tmp.virtual_canvases[canvas_id][i][j] = 1;
    }
  }
}