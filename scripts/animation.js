function animation_backend(){
  if(!myUI.planner) return alert("no planner loaded");
  myUI.animation.all_steps_fwd = myUI.planner.all_steps();
  myUI.animation.all_steps_bck = myUI.planner.all_steps(bck=true);
  let all_steps = myUI.animation.all_steps_fwd;
  if(all_steps==null) return alert("not yet finished searching");
  myUI.animation.max_step = all_steps.length;
  myUI.sliders.search_progress_slider.elem.max = myUI.animation.max_step;

  var timer;

  updateMap();

  function updateMap(){
    if (myUI.animation.step<myUI.animation.max_step){
      // display on map
      if(myUI.animation.running){

        myUI.run_single_step(myUI.animation.step);

        myUI.update_search_slider(myUI.animation.step);

        ++myUI.animation.step;

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
  //console.log(target_step);
  let all_states = myUI.planner.all_states();
  let tmp_step = target_step;
  while(!all_states.hasOwnProperty(tmp_step) && tmp_step>0){
    --tmp_step;
  }
  //console.log(tmp_step);
  // create a virtual representation of all the canvases
  let canvas_ids = [`queue`, `neighbours`, `current_YX`, `visited`, `path`];
  let virtual_canvases = {};
  canvas_ids.forEach(id=>{
    virtual_canvases[id] = zero2D(myUI.map_height, myUI.map_width);
  });

  if(tmp_step!=0){ //  if there is a recent state to fallback on
    // draw the state virtually
    let state = all_states[tmp_step];
    // request the state from the db
    draw_virtual_canvas(`queue`, state.queue, `1d`);
    draw_virtual_canvas(`visited`, BitMatrix.expand_2_matrix(state.visited), `2d`);
    let y = state.node_YX[0];
    let x = state.node_YX[1];
    virtual_canvases.current_YX[y][x];
    draw_virtual_canvas(`neighbours`, state.neighbours, `1d`);
    if(state.path)
      draw_virtual_canvas(`path`, state.path, `1d`);
  }

  // execute the steps
      let steps_to_execute = myUI.planner.all_steps().slice(tmp_step, target_step);

      // preprocess
      /* OLD */
      /*
      steps_to_execute.forEach(step=>{
        let items = step.actions;
        items.forEach(items=>{
          let command = items[0];
          //console.log(command);
          let args = items.slice(1);
          if(command==`dc`){
            draw_virtual_canvas(args[0], args[1], args[2]);
          }
          else if(command==`ec`){
            virtual_canvases[args[0]] = Array.from({length: myUI.map_height}, ()=>new Array(myUI.map_width).fill(0));
          }
          else if(command==`dp`){
            virtual_canvases[args[0]][args[1][0]][args[1][1]] = 1;
          }
          else if(command==`ep`){
            virtual_canvases[args[0]][args[1][0]][args[1][1]] = 0;
          }
        });
      });

      /* NEW */
      steps_to_execute.forEach(step=>{
        step.forEach(action=>{
          if(action[0]==STATIC.DC){
            let canvas = action[1];
            draw_virtual_canvas(statics_to_obj[canvas], action[2], action[3]);
          }
          else if(action[0]==STATIC.EC){
            virtual_canvases[statics_to_obj[action[1]]] = zero2D(myUI.map_height, myUI.map_width);
          }
          else if(action[0]==STATIC.DP){
            virtual_canvases[statics_to_obj[action[1]]][action[2]][action[3]] = 1;
          }
          else if(action[0]==STATIC.EP){
            virtual_canvases[statics_to_obj[action[1]]][action[2]][action[3]] = 0;
          }
        });
      });

      canvas_ids.forEach(id=>{
        let data = virtual_canvases[id];
        myUI.canvases[id].erase_canvas();
        myUI.canvases[id].draw_canvas(data, `2d`);
      });

  function draw_virtual_canvas(canvas_id, array_data, array_type){
    if (array_type == "1d") {
      array_data.forEach(coord=>{
        virtual_canvases[canvas_id][coord[0]][coord[1]] = 1;
      });
    }
    else if(array_type == "2d") {  //eg [ [ 8, 6 ], [ 9, 7 ], [ 8, 8 ] ]
      for (i = 0; i < array_data.length; i++) 
        for (j = 0; j < array_data[i].length; j++) 
          if (array_data[i][j])
            virtual_canvases[canvas_id][i][j] = 1;
    }
  }
}

myUI.run_single_step = function(target_step, inverse=false){
  let step = inverse ? myUI.animation.all_steps_bck[target_step] : myUI.animation.all_steps_fwd[target_step];
  step.forEach(action=>{
    if(action[0]==STATIC.DC){
      let canvas = action[1];
      myUI.canvases[statics_to_obj[canvas]].draw_canvas(action[2], action[3], action[4]);
    }
    else if(action[0]==STATIC.EC){
      myUI.canvases[statics_to_obj[action[1]]].erase_canvas();
    }
    else if(action[0]==STATIC.DP){
      myUI.canvases[statics_to_obj[action[1]]].draw_pixel([action[2], action[3]]);
    }
    else if(action[0]==STATIC.EP){
      myUI.canvases[statics_to_obj[action[1]]].erase_pixel([action[2], action[3]]);
    }
  });
}