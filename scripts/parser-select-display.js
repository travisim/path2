function removeChildren(elem, childTag, omitIds=[]){
  childTag = childTag.toUpperCase();
  for (const child of elem.children){
    let flag = false;
    for(const id of omitIds){
      if(child.id == id) flag = true;
    }
    if(flag) continue;
    if(child.tagName.toUpperCase()==childTag) elem.removeChild(child);
  }
}

myUI.resetSelectOptions = function(select_elem){
  removeChildren(select_elem, "OPTION");
}

/* MAP PARSER & DISPLAY */

myUI.parseMap = function(map_str_var, file_name){
	myUI.map_name = file_name;
	myUI.map_height = parseInt(map_str_var.split('\n')[1].split(' ')[1]);
	myUI.map_width = parseInt(map_str_var.split('\n')[2].split(' ')[1]);
	myUI.map_arr = zero2D(myUI.map_height, myUI.map_width);
	myUI.InfoQueue = new BitMatrix(myUI.map_height, myUI.map_width); // recreates the visited 2d array from tha steps for the display of the info map
  myUI.InfoVisited = new BitMatrix(myUI.map_height, myUI.map_width); // recreates the visited 2d array from tha steps for the display of the info map
  console.log(myUI.map_height);
	console.log(myUI.map_width)
	
  let map_array = map_str_var.split("\n").splice(4).filter((el) => {
    return el !== null && typeof el !== 'undefined' && el.length > 0;
  });

  for (i = 0; i < map_array.length; i++) {
		map_array[i] = map_array[i].replace(/\t/g, '');
    for (j = 0; j < map_array[i].length; j++) {
      if (map_array[i][j] == "." || map_array[i][j] == "G" || map_array[i][j] == "S") {
				myUI.map_arr[i][j] = 1;
        //console.log("1");
      }
      else if (map_array[i][j] == "@" || map_array[i][j] == "0" || map_array[i][j] == "T" || map_array[i][j] == "W") {
        myUI.map_arr[i][j] = 0;
        //console.log("0");  
      }
    }
	}
 
	myUI.planner.add_map(myUI.map_arr);
}

myUI.displayMap = function(){
  console.log("Map Arr");
	console.log(myUI.map_arr);
	myUI.reset_animation();
	myUI.planner.cell_map = undefined;
	myUI.sliders.search_progress_slider.elem.disabled = true;
	
	const height = myUI.map_arr.length;
	const width = myUI.map_arr[0].length;

  Object.values(myUI.canvases).forEach(uiCanvas=>{
    uiCanvas.scale_canvas(height, width);
		console.log(uiCanvas.id, height, width);
  });

  /* summary the css canvas and html/ js canvas are different
    to get sharp lines dont let the canvs auto scale up a low res js canvas to a high res one 
    instead create a js canvas that is the same as the css one and scale up the small/large image created
  
  for scaling down, image gets lighter, solution: make lines thicker
  for scaling up, lines between pixel forms, solution: make lines thicker
  */
	document.getElementById("map_height_axis").innerHTML = myUI.map_arr.length - 1;
	document.getElementById("map_width_axis").innerHTML = myUI.map_arr[0].length - 1;
  document.getElementById("left_axes").style.height = myUI.canvases.bg.canvas.clientHeight+"px";
  document.getElementById("top_axes").style.width = myUI.canvases.bg.canvas.clientWidth+"px";

  myUI.canvases["bg"].draw_canvas(myUI.map_arr, "2d", true);
	myUI.canvases["edit_map"].draw_canvas(myUI.map_arr, "2d", true);
	if(myUI.scenFail)
		myUI.displayScen();
}

/* SCEN PARSER */

myUI.parseScenario = function(contents){
  /*Bucket	map	map width	map height	start x-coordinate	start y-coordinate	goal x-coordinate	goal y-coordinate	optimal length*/
	// Split by line
	var lines = contents.split('\n');
	// remove the first line; contains "version X"
	lines = lines.slice(1);
  // remove the last line; contains a new line
	const lines_filtered = lines.filter((el) => {
	  return el !== null && typeof el !== 'undefined' && el.length>0;
	});
	// Initialise an array containing all the different scenarios
	let scen_array = [];

	for (let i=0;i<lines_filtered.length;++i){
		/* Split line into individual values
		contains "Bucket,map,map width,map height,start x-coordinate,start y-coordinate,goal x-coordinate,goal y-coordinate,optimal length"*/
		let line_arr = lines_filtered[i].split("\t");
		// Add new line to array
		scen_array.push(line_arr);
	}
	/*returns 3d array indexed on options 2ns indexed on columns:Bucket,map,map width,map height,start x-coordinate,start y-coordinate,goal x-coordinate,goal y-coordinate,optimal length"*/
  myUI.scen_arr = scen_array;
	myUI.scen_name = scen_array[0][1];
}

myUI.loadScenario = function(){
  let elem = this;
  if(elem==myUI) elem = document.querySelector('#scen_num');
  if(elem==document.querySelector('#scen_num')){
    // selected by scenario
    elem.value = Math.max(0, Math.min(myUI.scen_arr.length, elem.value));
    if(elem.value==0){
      if(myUI.scen_arr.length>0) elem.value = 1;
    }
    let index = elem.value-1;
    myUI.map_start = [Number(myUI.scen_arr[index][5]),Number(myUI.scen_arr[index][4])];//  in Y, X
    myUI.map_goal = [Number(myUI.scen_arr[index][7]), Number(myUI.scen_arr[index][6])];//  in Y, X

    myUI.displayScen(true, false);
  }
  else{
    console.log(this.id);
    let change=0;
    if(myUI.vertex) change=1
    if(this.id.includes(x)) this.value = Math.max(0, Math.min(myUI.map_height-1+change, elem.value));
    else this.value = Math.max(0, Math.min(myUI.map_width-1+change, elem.value));
    myUI.map_start = [
      Number(document.querySelector("#scen_start_x").value),
      Number(document.querySelector("#scen_start_y").value)
    ];//  in Y, X
    myUI.map_goal = [
      Number(document.querySelector("#scen_goal_x").value),
      Number(document.querySelector("#scen_goal_y").value)
    ];//  in Y, X
    myUI.displayScen(false, true);
  }
}

document.querySelectorAll(".scen_controls").forEach(elem=>{
  elem.addEventListener("change", myUI.loadScenario);
})

document.getElementById("vertexToggle").addEventListener("change", e=>{
  if(document.getElementById("vertexToggle").checked){
    // enable vertex
    myUI.vertex = true;
    ["hover_map", "queue", "visited", "current_XY", "neighbors", "path", "start", "goal"].forEach(canvas=>{
      myUI.canvases[canvas].scale_canvas(1024, 1024, false);
      myUI.canvases[canvas].setDrawType("vertexCircle");
    });
    myUI.planners = myUI.planners_v;
    console.log("ENABLED VERTEX");
  }
  else{
    myUI.vertex = false;
    ["hover_map", "queue", "visited", "current_XY", "neighbors", "path", "start", "goal"].forEach(canvas=>{
      myUI.canvases[canvas].setDrawType("pixel");
    });
    myUI.planners = myUI.planners_cell;
    // disable vertex
  }
  myUI.displayMap();
  myUI.displayScen();
  /* first call */
  myUI.showPlanners();
  myUI.loadPlanner();
});
if(myUI.vertex) document.getElementById("vertexToggle").checked=true;
else document.getElementById("vertexToggle").checked=false;

myUI.displayScen = function(update=false, reset_zero=false){
	myUI.canvases.start.erase_canvas();
	myUI.canvases.goal.erase_canvas();
	myUI.reset_animation();
	myUI.planner.cell_map = undefined;
	myUI.sliders.search_progress_slider.elem.disabled = true;
	myUI.scenFail = false;
	if(myUI.map_name!=myUI.scen_name && document.querySelector('#scen_num').value>0){
		myUI.scenFail = true;  // will remember to load the Scen the next time a map is loaded
	}
	else{
		console.log(myUI.map_start, myUI.map_goal);
    let change = myUI.vertex ? 1 : 0;
    myUI.map_start[0] = Math.max(0, Math.min(myUI.map_height-1+change, myUI.map_start[0]));
    myUI.map_goal[0] = Math.max(0, Math.min(myUI.map_height-1+change, myUI.map_goal[0]));
    myUI.map_start[1] = Math.max(0, Math.min(myUI.map_width-1+change, myUI.map_start[1]));
    myUI.map_goal[1] = Math.max(0, Math.min(myUI.map_width-1+change, myUI.map_goal[1]));
		myUI.canvases["start"].draw_start_goal(myUI.map_start, "rgb(150,150,150)");
		myUI.canvases["goal"].draw_start_goal(myUI.map_goal, "rgb(159,23,231)");
		if(update){
      // update the inputs
      document.querySelector("#scen_start_x").value = myUI.map_start[0];
      document.querySelector("#scen_start_y").value = myUI.map_start[1];
      document.querySelector("#scen_goal_x").value = myUI.map_goal[0];
      document.querySelector("#scen_goal_y").value =myUI.map_goal[1];
    }
    if(reset_zero) document.querySelector('#scen_num').value = 0;
    console.log("moving");
    myUI.map_start_icon.move(myUI.map_start);
    myUI.map_goal_icon.move(myUI.map_goal);
		
	}
	/*clear all canvases*/
	["visited",	"neighbors", "queue",	"current_XY",	"path"].forEach(canvas_id=>{
		myUI.canvases[canvas_id].erase_canvas();
	})
}

function moveDraggable(xy){
	let bounds = myUI.canvases.hover_map.canvas.getBoundingClientRect();
  let offset = 0.5;
  if(myUI.vertex)
    offset = 0;

  this.elem.style.top = ((xy[0]+offset)*bounds.height / myUI.map_height - this.elem.height/2) + "px";
  this.elem.style.left =  ((xy[1]+offset)*bounds.width / myUI.map_width - this.elem.width/2) + "px";
  
}

myUI.map_start_icon.move = moveDraggable;
myUI.map_goal_icon.move = moveDraggable;

/* PLANNER PARSER */
/* haven't build yet */
//var planner_upload_elem = document.getElementById("planner-upload");

myUI.showPlanners = function() {
  /* used to populate the planner selection */

  /* custom self-built planners uploading */
  // planner_upload_elem
  // get data from planner_upload_elem
  // add_planner()
  myUI.resetSelectOptions(myUI.selects["planner_select"].elem);
  myUI.resetSelectOptions(myUI.selects["planner_select2"].elem);
  for (i = 0; i < myUI.planners.length; ++i) {
    let option = document.createElement("option");
    option.setAttribute("value", i);
    option.innerHTML = myUI.planners[i].display_name;
    myUI.selects["planner_select"].elem.appendChild(option);

		let option2 = option.cloneNode(true);
    myUI.selects["planner_select2"].elem.appendChild(option2);
  }
}

myUI.loadPlanner = function() {
	if(this==myUI) var planner_select_elem = myUI.selects["planner_select"].elem;
	else var planner_select_elem = this; // binds to the planner select element
	
  myUI.planner_choice = planner_select_elem.options[planner_select_elem.selectedIndex].value;
  myUI.planner = new myUI.planners[myUI.planner_choice]();

	// updates both selects
	myUI.selects["planner_select"].elem.value = myUI.planner_choice;
	myUI.selects["planner_select2"].elem.value = myUI.planner_choice;
	myUI.reset_animation();
  myUI.InfoTable.setTableHeader(myUI.planner.display_table_header_name());
  myUI.InfoMap.PlannerMode(myUI.planner.infoMapPlannerMode());
  //determine_info_map_header();
  myUI.init_planner_config();
}


/* first call */
myUI.showPlanners();
myUI.loadPlanner();

// default map
myUI.runDefault = function(){
	let default_map = `type octile
	height 16
	width 16
	map
	................
	................
	..@@@@@@@@@@@@..
	..@.............
	..@.............
	..@..@@@@@@@@@..
	..@..@..........
	..@..@..........
	..@..@..@@@@@@..
	..@..@..@.......
	..@..@..@.......
	..@..@..@.......
	..@..@..@.......
	..@..@..@.......
	................
	................`;
	myUI.parseMap(default_map, `16x16_default.map`);
	myUI.displayMap();

	let default_scen = `version 1\n0\t16x16_default.map\t16\t16\t0\t0\t13\t13\t-1`;
	myUI.parseScenario(default_scen);
  myUI.loadScenario();

}
myUI.runDefault();

myUI.selects["planner_select"].elem.addEventListener("change", myUI.loadPlanner);
myUI.selects["planner_select2"].elem.addEventListener("change", myUI.loadPlanner);

myUI.parseCustom = function(contents){
  const STRUCT = JSON.parse(contents);
  if(STRUCT.config.canvas){
    let keepCanvases = ["edit_map", "bg", "hover_map"];
    const CONTAINER = document.getElementById("canvas_container");
    removeChildren(CONTAINER, "canvas", keepCanvases);
    Object.keys(myUI.canvases).forEach((key) => keepCanvases.includes(key) || delete myUI.canvases[key]);
    for(const cvInfo of STRUCT.config.canvas){
      console.log(cvInfo.name);
      let myCanvas = document.createElement("canvas");
      myCanvas.setAttribute("id", cvInfo.name);
      myCanvas.className += "map_canvas";
      CONTAINER.appendChild(myCanvas);
      myUI.canvases[cvInfo.name] = new UICanvas(cvInfo.name, cvInfo.colors, cvInfo.drawType);
    }
  }
}

