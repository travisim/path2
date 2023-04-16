myUI.resetSelectOptions = function(select_elem){
  removeChildren(select_elem);
}

/* MAP PARSER & DISPLAY */

myUI.parseMap = function(map_str_var, file_name){
	myUI.map_name = file_name;
	myUI.map_height = parseInt(map_str_var.split('\n')[1].split(' ')[1]);
	myUI.map_width = parseInt(map_str_var.split('\n')[2].split(' ')[1]);
	myUI.map_arr = zero2D(myUI.map_height, myUI.map_width);
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
    let plus = uiCanvas.drawType=="vertex";
    uiCanvas.scale_canvas(height+plus, width+plus, false);
		console.log(uiCanvas.id, height, width);
  });

  /* summary the css canvas and html/ js canvas are different
    to get sharp lines dont let the canvs auto scale up a low res js canvas to a high res one 
    instead create a js canvas that is the same as the css one and scale up the small/large image created
  
  for scaling down, image gets lighter, solution: make lines thicker
  for scaling up, lines between pixel forms, solution: make lines thicker
  */
  let height_px = getComputedStyle(document.getElementById("bg")).getPropertyValue('height').slice(0, -2);
  let height_interval = height_px / height;
  let height_muls = calcIntervals(height, height_interval, 10);
  console.log("LEFT:", height_muls);
  document.getElementById("left_axes_markers").innerHTML = "";
  for(const m of height_muls){
    let el = document.createElement("div");
    el.classList.add("left-tick");
    el.innerHTML = `<span>${m}</span>`;
    el.style.top = m * height_interval + "px";
    document.getElementById("left_axes_markers").appendChild(el);
  }

  let width_px = getComputedStyle(document.getElementById("bg")).getPropertyValue('width').slice(0, -2);
  let width_interval = width_px / width;
  let width_muls = calcIntervals(width, width_interval, 29);
  console.log("TOP:", width_muls);
  document.getElementById("top_axes_markers").innerHTML = "";
  for(const m of width_muls){
    let el = document.createElement("div");
    el.classList.add("top-tick");
    el.innerHTML = `<span>${m}</span>`;
    el.style.left = m * width_interval + "px";
    document.getElementById("top_axes_markers").appendChild(el);
  }

  myUI.canvases["bg"].draw_canvas(myUI.map_arr, "2d", true);
	myUI.canvases["edit_map"].draw_canvas(myUI.map_arr, "2d", true);
	if(myUI.scenFail)
		myUI.displayScen();
}

function calcIntervals(num, intervalSize, minDist){
  let ret = [0];
  let interval = Math.ceil(num / 16);
  let allowed = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];

  let i = 0;
  while(allowed[i] < interval || allowed[i] * intervalSize < minDist) i++;
  interval = allowed[i];

  for(let i = interval; i < num; i += interval) ret.push(i);

  if( (num - ret[ret.length - 1]) * intervalSize < minDist) ret[ret.length - 1] = num;
  else ret.push(num);
  return ret;
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
  //elem.addEventListener("change", myUI.planner.addGoalNode(myUI.map_start));
})

myUI.displayScen = function(update=false, reset_zero=false){
	//myUI.canvases.start.erase_canvas();
	//myUI.canvases.goal.erase_canvas();
	myUI.reset_animation();
	if(myUI.planner) myUI.planner.cell_map = undefined;
	myUI.sliders.search_progress_slider.elem.disabled = true;
	myUI.scenFail = false;
	/*if(myUI.map_name!=myUI.scen_name && document.querySelector('#scen_num').value>0){
		myUI.scenFail = true;  // will remember to load the Scen the next time a map is loaded
	}
	/* */
  console.log(myUI.map_start, myUI.map_goal);
  let change = myUI.vertex ? 1 : 0;
  myUI.map_start[0] = Math.max(0, Math.min(myUI.map_height-1+change, myUI.map_start[0]));
  myUI.map_goal[0] = Math.max(0, Math.min(myUI.map_height-1+change, myUI.map_goal[0]));
  myUI.map_start[1] = Math.max(0, Math.min(myUI.map_width-1+change, myUI.map_start[1]));
  myUI.map_goal[1] = Math.max(0, Math.min(myUI.map_width-1+change, myUI.map_goal[1]));
  //myUI.canvases["start"].draw_start_goal(myUI.map_start, "rgb(150,150,150)");
  //myUI.canvases["goal"].draw_start_goal(myUI.map_goal, "rgb(159,23,231)");
  if(update){
    // update the inputs
    document.querySelector("#scen_start_x").value = myUI.map_start[0];
    document.querySelector("#scen_start_y").value = myUI.map_start[1];
    document.querySelector("#scen_goal_x").value = myUI.map_goal[0];
    document.querySelector("#scen_goal_y").value =myUI.map_goal[1];
  }
  if(reset_zero) document.querySelector('#scen_num').value = 0;
  myUI.map_start_icon.move(myUI.map_start);
    myUI.map_goal_radius.move(myUI.map_goal);
  myUI.map_goal_icon.move(myUI.map_goal);

  
  console.log("LOS:", CustomLOSChecker(myUI.map_start, myUI.map_goal));
	try{myUI.updateInfoMap(myUI.map_start);}catch(e){}
}

function moveDraggable(xy){
  const CANVAS_OFFSET = Number(getComputedStyle(document.querySelector(".map_canvas")).getPropertyValue('top').slice(0,-2));
	let bounds = myUI.canvases.hover_map.canvas.getBoundingClientRect();
  let offset = 0.5;
  if(myUI.vertex)
    offset = 0;

  if (this.elem.height) { //checks if the elem has this property
    this.elem.style.top = ((xy[0] + offset) * bounds.height / myUI.map_height - this.elem.height / 2) + CANVAS_OFFSET + "px";
    this.elem.style.left = ((xy[1] + offset) * bounds.width / myUI.map_width - this.elem.width / 2) + CANVAS_OFFSET + "px";
  }
  else if (this.elem.scrollHeight) {
    this.elem.style.top = ((xy[0] + offset) * bounds.height / myUI.map_height - this.elem.scrollHeight / 2) + 11 + "px";
    this.elem.style.left = ((xy[1] + offset) * bounds.width / myUI.map_width - this.elem.scrollWidth / 2) + CANVAS_OFFSET + "px";
  
  }
}

myUI.map_start_icon.move = moveDraggable;
myUI.map_goal_radius.move = moveDraggable;
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
  // myUI.resetSelectOptions(myUI.selects["planner_select2"].elem);
  for (i = 0; i < myUI.planners.length; ++i) {
    let option = document.createElement("option");
    option.setAttribute("value", i);
    option.innerHTML = myUI.planners[i].display_name;
    myUI.selects["planner_select"].elem.appendChild(option);

		// let option2 = option.cloneNode(true);
    // myUI.selects["planner_select2"].elem.appendChild(option2);
  }
}

myUI.loadPlanner = function(create_planner = true) {
  if(create_planner){
    var planner_select_elem = myUI.selects["planner_select"].elem;
    myUI.planner_choice = planner_select_elem.options[planner_select_elem.selectedIndex].value;
    myUI.planner = new myUI.planners[myUI.planner_choice]();
    // updates select
    myUI.selects["planner_select"].elem.value = myUI.planner_choice;
  }
  myUI.canvasReset();
  for(const cb of myUI.planner.constructor.checkboxes)
    appendCheckbox(...cb);
  myUI.dynamicCanvas = myUI.canvasGenerator(myUI.planner.canvases);
  myUI.infoTableReset();
  myUI.infoTableGenerator(myUI.planner.infoTables);
  if(create_planner) myUI.setPlannerConfig();

	myUI.reset_animation();
  myUI.InfoMap.CanvasMode(myUI.planner.infoMapPlannerMode(), myUI.dynamicCanvas);
  myUI.buttons.planner_config_btn.btn.children[0].innerHTML = myUI.planner.constructor.display_name;
  myUI.displayMap();
  myUI.initHover(myUI.planner.constructor.hoverData);
  if(myUI.planner.bigMap) document.getElementById("info-container").classList.add("none");
  else document.getElementById("info-container").classList.remove("none");
  if (myUI.planner.postProcess) myUI.planner.postProcess();
  
  expandSelectedIndex(myUI.planner.constructor.indexOfCollapsiblesToExpand);
  if(myUI.planner.constructor.pseudoCode)myUI.PseudoCode.rowGenerator(myUI.planner.constructor.pseudoCode)
}

myUI.selects["planner_select"].elem.addEventListener("change", myUI.loadPlanner);

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

myUI.toggleVertex = function(enable=true){
  if(enable){
    myUI.vertex = true;
    for(const uiCanvas of myUI.dynamicCanvas){
      if(uiCanvas.drawType=="dotted")
        uiCanvas.hide();
      else uiCanvas.setDrawType("vertex");
    }
    myUI.canvases.hover_map.setDrawType("vertex");

    if (myUI.gridPrecision != "float" ) {
      dragElementGridSnap(myUI.map_start_icon.elem);
      dragElementGridSnap(myUI.map_goal_icon.elem);
    }

    else if (myUI.gridPrecision =="float") {
      dragElementNoSnap(myUI.map_start_icon.elem);
      dragElementNoSnap(myUI.map_goal_icon.elem,myUI.map_goal_radius.elem);
      //dragElementNoSnap();
    }
    
  }
  else{
    myUI.vertex = false;
    for(const uiCanvas of myUI.dynamicCanvas){
      uiCanvas.show();
      if(uiCanvas.drawType=="vertex")
        uiCanvas.setDrawType("cell");
    }
    myUI.canvases.hover_map.setDrawType("cell");
  }
}

myUI.parseNodeMap = function(contents){
  let data = JSON.parse(contents);
  console.log(data);  
  if(document.getElementById("node")){
    document.getElementById("node").innerHTML = "";
  }
  if(document.getElementById("edge")){
    document.getElementById("edge").innerHTML = "";
  }
  myUI.planner.randomCoordsNodes = [];
  for(const coord of data.coords){
    myUI.planner.randomCoordsNodes.push(new MapNode(null, coord, []));
  }

  myUI.planner.randomCoordsNodes.forEach(node=>{
    myUI.nodeCanvas.drawCircle(node.value_XY);
  });

  for(let i = 0; i < myUI.planner.randomCoordsNodes.length; ++i){
    myUI.planner.randomCoordsNodes[i].neighbours.push(...data.neighbors[i]);
  }

  for (let i = 0; i < data.edges.length; ++i) {
    myUI.edgeCanvas.drawLine(data.edges[i][0],data.edges[i][1]);
  }

  for(const coord of data.coords){
    if(!(Number.isInteger(coord[0]) && Number.isInteger(coord[0]))){
      myUI.planner.roundNodes = false;
      break;
    }
  }
}




function resizeDivWithChildSvg(side) {
  
  this.elem.style.width = side +"px"
  this.elem.getElementsByTagName("svg")[0].setAttribute("viewBox", `0 0 ${side} ${side}`); 
}
myUI.map_goal_radius.resize = resizeDivWithChildSvg;



 //myUI.parseMap(default_map, `16x16_default.map`);



document.getElementById("map_config").addEventListener("change", function () {
  
  myUI.reset_animation()
  myUI.resetMapAnimations()
  if (document.getElementById("map_config").value == "none") {
    let default_map = `type octile
height 16
width 16
map
................
................
................
................
................
................
................
................
................
................
................
................
................
................
................
................`;
    myUI.parseMap(default_map, `16x16_none.map`);  
  	myUI.displayMap();
  } 
  else if (document.getElementById("map_config").value == "Lshape") {
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
...............`;
    myUI.parseMap(default_map, `16x16_default.map`);
  	myUI.displayMap();
  }
  else if (document.getElementById("map_config").value == "concave") {
    let default_map = `type octile
height 16
width 16
map
................
................
................
................
................
................
................
................
................
................
..........@@@@@.
..........@.....
..........@.....
..........@.....
..........@.....
..........@@@@@.`;
    myUI.parseMap(default_map, `16x16_default.map`);
  	myUI.displayMap();
  }
    else if (document.getElementById("map_config").value == "narrowPassage") {
    let default_map = `type octile
height 16
width 16
map
....@.....@.....
....@.....@.....
....@.....@.....
....@.....@.....
....@...........
....@...........
....@.....@.....
....@.....@.....
....@.....@.....
....@.....@.....
..........@.....
..........@.....
....@.....@.....
....@.....@.....
....@.....@.....
....@.....@.....`;
    myUI.parseMap(default_map, `16x16_default.map`);
  	myUI.displayMap();
  }
    
}); 


