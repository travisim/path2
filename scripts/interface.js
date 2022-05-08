var myUI = {}

myUI.initialize = function(){
  
  myUI.canvases = {};
  myUI.buttons = {};
  myUI.selects = {};
  myUI.sliders = {};
  myUI.infopanes = {};

  // Initialize canvases
  [
    ["edit_map", "#000000"],
		["hover_map", "#d19b6d", "#AA1945"],
    ["bg", "#000000"],
    ["queue", "rgb(116,250,76)"],
    ["visited", "rgb(221,48,33)"],
    ["current_YX", "rgb(52,119,234)"],
    ["neighbours", "rgb(30,73,25)"],
    ["path", "#E2C2B9"],
    ["start", "rgb(150,150,150)"],
    ["goal", "rgb(159,23,231)"],
  ].forEach(item=>{
    let canvasId = item[0];
    let color = item.slice(1);
    myUI.canvases[canvasId] = new UICanvas(canvasId, color);
  });
  myUI.canvases.edit_map.toggle_edit();
  // Initialize selects
  [
    ["scen_select", "scen_label"],
    ["planner_select", "planner_label"]
  ].forEach(arr=>{
    let id = arr[0];
    let select_label = arr[1];
    myUI.selects[id] = {elem: document.getElementById(id), label: document.getElementById(select_label)};
  });

  // Initialize buttons
  [
		["download_map_btn"],
		["download_scen_btn"],
    ["clear_btn"],
    ["back_btn"],
    ["start_pause_btn", "start_icon", "pause_icon"],
    ["forward_btn"],
    ["end_btn"],
    ["detail_btn", "map_detailed_icon", "map_simple_icon"],
    ["draw_erase_btn", "draw_icon", "erase_icon"],
    ["edit_map_btn", "edit_map_icon"],
    ["stop_edit_btn", "stop_edit_icon"]
  ].forEach(item=>{
    let btn_id = item[0];
    let svg_ids = item.slice(1);
    myUI.buttons[btn_id] = new UIButton(btn_id, svg_ids);
  });

  [
    ["animation_speed_slider", "animation_speed_label"],
    ["search_progress_slider", "search_progress_label"],
    ["map_width_slider", "map_width_label"],
    ["map_height_slider", "map_height_label"]
  ].forEach(item=>{
    let slider_id = item[0];
    let slider_label = item[1];
    myUI.sliders[slider_id] = {elem: document.getElementById(slider_id), label: document.getElementById(slider_label)};
    myUI.sliders[slider_id].elem.parent = myUI.sliders[slider_id];
    myUI.sliders[slider_id].label.parent = myUI.sliders[slider_id];
  });

	myUI.hover_labels = {};
	[
		"hover_x",
		"hover_y"
	].forEach(label=>{
		myUI.hover_labels[label] = {elem: document.getElementById(label)}
	})

	myUI.map_start_icon = {elem: document.getElementById("map_start_icon"), clicked: false}
	myUI.map_goal_icon = {elem: document.getElementById("map_goal_icon"), clicked: false}

  myUI.planners = [BFS,DFS,Dijkstra];
  myUI.planner_choice = 0;
  myUI.planner =  new myUI.planners[myUI.planner_choice]();

  myUI.map_arr;
  myUI.map_height = myUI.canvases.bg.canvas.height;
  myUI.map_width = myUI.canvases.bg.canvas.width;

  Object.values(myUI.canvases).forEach(uiCanvas=>{
    uiCanvas.scale_canvas(myUI.map_height, myUI.map_width);
  });

  myUI.animation = {
    running: false,
    step: 0,
    max_step: 100, // arbitrary
    speed: 1, // refers to how fast the animation will take to complete. max speed of 4x should complete the animation in 10 seconds. 50 should take twice as long to complete, 25, 4 times as long etc.
    detailed: true,
    max_fps: 250, // 4ms
    jump_steps: 1
  };

  myUI.storage = {};

  myUI.tmp = {};
}


myUI.initialize();



