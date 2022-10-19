var myUI = {}

myUI.initialize = function(){

  myUI.top_Z = 99;

  myUI.vertex = false;
  
  myUI.canvases = {};
  myUI.buttons = {};
  myUI.selects = {};
  myUI.sliders = {};
  myUI.InfoNWSE = {};
	myUI.modals = {};

  // Initialize canvases
  myUI.canvasArray = [
    {
      id:"edit_map", drawType:"cell", fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["#000000" ,"#d19b6d", "#AA1945"], toggle: "off"
    },
    {
      id:"hover_map", drawType:"cell", fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["#d19b6d", "#AA1945"], toggle: "off"
    },
    {
      id:"dotted", drawType:"dotted", fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["hsl(5,74%,55%)"], toggle: "off"
    },
    {
      id:"bg", drawType:"cell", fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["#000000"], toggle: "off"
    },
    {
      id:"queue", drawType:"cell", fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["rgb(116, 250, 76)"], toggle: "multi"
    },
    {
      id:"visited", drawType:"cell", fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["hsl(5,74%,85%)", "hsl(5,74%,75%)", "hsl(5,74%,65%)", "hsl(5,74%,55%)", "hsl(5,74%,45%)", "hsl(5,74%,35%)", "hsl(5,74%,25%)", "hsl(5,74%,15%)"], toggle: "multi"
    },
    {
      id:"current_XY", drawType:"cell", fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["#34d1ea"], toggle: "multi"
    },
    {
      id:"neighbors", drawType:"cell", fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["rgb(0,130,105)"], toggle: "multi"
    },
    {
      id:"path", drawType:"cell", fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["#34d1ea"], toggle: "multi"
    },
    {
      id:"start", drawType:"cell", fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["#96996"], toggle: "multi"
    },
    {
      id:"goal", drawType:"cell", fixedResVal: 1024, valType: "integer", defaultVal: 0, colors:["#9f17e7"], toggle: "multi"
    },
    {
      id:"fCost", drawType:"cell", fixedResVal: 1024, valType: "float", defaultVal: Number.POSITIVE_INFINITY, colors:["#0FFF50", "#013220"], toggle: "single"
    },
    {
      id:"gCost", drawType:"cell", fixedResVal: 1024, valType: "float", defaultVal: Number.POSITIVE_INFINITY, colors:["#0FFF50", "#013220"], toggle: "single"
    },
    {
      id:"hCost", drawType:"cell", fixedResVal: 1024, valType: "float", defaultVal: Number.POSITIVE_INFINITY, colors:["#0FFF50", "#013220"], toggle: "single"
    },
  ];
  myUI.canvasArray.forEach(item=>{
    myUI.canvases[item.id] = new UICanvas(item.id, item.colors, item.drawType, item.fixedResVal, item.valType, item.defaultVal, item.toggle);
  });
  myUI.canvases.edit_map.toggle_edit();
  myUI.checkbox = {}
  myUI.checkbox.canvas = [];

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
    document.getElementById(infoNWSE_Id).innerHTML = '  <section>F:<span class="F"></span>G:<span class="G"></span>H:<span class="H"></span>Type:<span class="type"></span></section>';
  //initialise html for info squares as well
  });
 

  
  myUI.InfoCurrent = UIInfoCurrent;
  
  

  
	[ 
		["edit_map_modal", "edit_map_close"],
		["planner_config_modal", "planner_config_close"],
    ["first_neighbour_modal", "first_neighbour_close"]
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
		["planner_config_btn", "planner_config_icon"],
    ["first_neighbour_btn"]
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
	myUI.hoverArray = [
		"hover_x",
		"hover_y",
    "hover_cell_index"
	];
  myUI.hoverArray.forEach(label=>{
		myUI.hover_labels[label] = {elem: document.getElementById(label)}
	})

	myUI.map_start_icon = {elem: document.getElementById("map_start_icon"), move: false}
	myUI.map_goal_icon = {elem: document.getElementById("map_goal_icon"), move: false}

  myUI.planners_cell = [PRM,A_star];
  myUI.planners_v = [BFS_Vertex];
  myUI.planners = myUI.planners_cell;
  myUI.planner_choice = 0;
  myUI.planner =  new myUI.planners[myUI.planner_choice]();

  myUI.map_arr;
  myUI.map_height = myUI.canvases.bg.canvas.height;
  myUI.map_width = myUI.canvases.bg.canvas.width;
  
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
    colors: ["#acaabb", "#1000FF"],//
    elems: [],//
    step: -1
  }
  // END OF ARROW

  myUI.map_edit = {
    curr_state: null
  };

  myUI.step_data = {fwd:{data:[], map:[], combined:[]}, bck:{data:[], map:[], combined:[]}};

  myUI.infotableArray = [
    {id:"ITQueue", displayName: "Queue", headers:["Queue No","Vertex","Parent","F cost","G cost","H cost"]}
  ];
  myUI.InfoTables = {};
  myUI.InfoTables["ITQueue"] = new UIInfoTable("Queue"); // do not shift to top as prerequisite required
  myUI.InfoTables["ITQueue"].setTableActive();
  myUI.InfoTables["ITQueue"].setTableHeader(["Vertex","Parent","F cost","G cost","H cost"]);
  myUI.InfoMap  = new UIInfoMap();
  myUI.PseudoCode = new UIInfoPseudoCode();
  myUI.pseudoCodeRaw = 'def astar(map, start_vertex, goal_vertex): \nlist = OpenList() \npath = [ ] \n#Initialise h-cost for all \nfor vertex in map.vertices(): \n    vertex.set_h_cost(goal_vertex)  \n    vertex.g_cost = ∞  \n    vertex.visited = False \n  # Assign 0 g-cost to start_vertex  \n start_vertex.g_cost = 0 \n list.add(start_vertex) \n while list.not_empty(): \n  current_vertex = list.remove() \n  # Skip if visited: a cheaper path  \n  # was already found \n    if current_vertex.visited: \n      continue \n   # Trace back and return the path if at the goal \n   if current_vertex is goal_vertex : \n     while current_vertex is not None: \n      path.push(current_vertex) \n      current_vertex = current_vertex.parent \n     return path # exit the function \n  # Add all free, neighboring vertices which \n   # are cheaper, into the list  \n  for vertex in get_free_neighbors(map, current_vertex):  \n      # f or h-costs are not checked bcos obstacles \n     # affects the optimal path cost from the g-cost \n     tentative_g = calc_g_cost(vertex, current_vertex)  \n     if tentative_g < vertex.g_cost: \n       vertex.g_cost = tentative_g  \n      vertex.parent = current_vertex  \n      list.add(vertex) \nreturn path';
  if(myUI.pseudoCodeRaw == true) myUI.PseudoCode.rowGenerator(myUI.pseudoCodeRaw);

  coll[1].click();
  coll[3].click();
  coll[4].click();

  myUI.tmp = {}; // DO NOT DELETE
}

myUI.initialize();
 
myUI.export = function(){
  // run in inspect element console
  console.log("CANVAS: ",JSON.stringify(myUI.canvasArray));
  console.log("HOVER: ",JSON.stringify(myUI.hoverArray));
  console.log("DEST ENUMS WRITING: ",JSON.stringify(STATIC_DESTS));
  console.log("DEST ENUMS READING: ",JSON.stringify(statics_to_obj));
  console.log("INFOTABLE: ",JSON.stringify(myUI.infotableArray));
}