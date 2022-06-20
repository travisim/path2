var myUI = {}

myUI.initialize = function(){
  
  myUI.canvases = {};
  myUI.buttons = {};
  myUI.selects = {};
  myUI.sliders = {};
  myUI.InfoNWSE = {};
	myUI.modals = {};

  // Initialize canvases
  [
    ["edit_map", "#000000" ,"#d19b6d", "#AA1945"],
		["hover_map", "#d19b6d", "#AA1945"],
    ["bg", "#000000"],
    ["queue", "rgb(116,250,76)"],
    ["visited", "hsl(5,74%,85%)", "hsl(5,74%,75%)", "hsl(5,74%,65%)", "hsl(5,74%,55%)", "hsl(5,74%,45%)", "hsl(5,74%,35%)", "hsl(5,74%,25%)", "hsl(5,74%,15%)"], // rgb(221,48,33)
    ["current_YX", "rgb(52,209,234)"],
    ["neighbours", "rgb(0,130,105)"],
    ["path", "rgb(52,209,234)"], //  changed from #E2C2B9
    ["start", "rgb(150,150,150)"],
    ["goal", "rgb(159,23,231)"]
  ].forEach(item=>{
    let canvasId = item[0];
    let color = item.slice(1);
    myUI.canvases[canvasId] = new UICanvas(canvasId, color);
  });
  myUI.canvases.edit_map.toggle_edit();
 //initialise info
  
  [
    ["N"],
		["NE"],
    ["E"],
    ["SE"],
    ["S"],
    ["SW"],
    ["W"],
    ["NW"] 
  ].forEach(item=>{
    let infoNWSE_Id = item[0];
    myUI.InfoNWSE[infoNWSE_Id] = new UIInfoNWSE(infoNWSE_Id);
    document.getElementById(infoNWSE_Id).innerHTML = 'F:<span class "F_cost" id="F"></span>G:<span id="G"></span>H:<span id="H"></span>Type:<span id="type"></span>';
  //initialise html for info squares as well
  });


  
  myUI.InfoCurrent = UIInfoCurrent;
 // myUI.InfoTable  = new UIInfoTable;
  myUI.InfoVisited;
  myUI.InfoQueue;

  
	[ 
		["edit_map_modal", "edit_map_close"],
		["planner_config_modal", "planner_config_close"]
	].forEach(item=>{
		myUI.modals[item[0].slice(0, -6)] = {
			elem: document.getElementById(item[0]),
			close_btn: document.getElementById(item[1]),
			show: null,
			close: null // show and close modal function is bound to itself
		};
	});

  
  // Initialize selects
  [
    ["scen_select", "scen_label"],
    ["planner_select", "planner_label"],
    ["planner_select2", "planner_label2"]
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
    ["stop_edit_btn", "stop_edit_icon"],
		["planner_config_btn", "planner_config_icon"]
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
		"hover_y",
    "hover_cell_index"
	].forEach(label=>{
		myUI.hover_labels[label] = {elem: document.getElementById(label)}
	})

	myUI.map_start_icon = {elem: document.getElementById("map_start_icon"), move: false}
	myUI.map_goal_icon = {elem: document.getElementById("map_goal_icon"), move: false}

  myUI.planners = [BFS,DFS,Dijkstra,A_star];
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
    step: -1,
    max_step: 100, // arbitrary
    speed: 1, // refers to how fast the animation will take to complete. max speed of 4x should complete the animation in 10 seconds. 50 should take twice as long to complete, 25, 4 times as long etc.
    detailed: true,
    max_fps: 250, // 4ms
    jump_steps: 1
  };

  // START OF ARROW
  myUI.arrow = {
    data: [],
    canvas: document.getElementById("arrows"),
    ctx: document.getElementById("arrows").getContext("2d"),
    colors: ["purple", "green"],
    coords: [],
    step: -1
  }
  myUI.arrow.full_canvas = [0, 0, myUI.arrow.canvas.width, myUI.arrow.canvas.height];
  // END OF ARROW

  myUI.map_edit = {
    curr_state: null
  };

  myUI.storage = {};

  myUI.tmp = {};
}


myUI.initialize();



