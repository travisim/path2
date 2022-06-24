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
	
  let map_array_final = [];
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

myUI.showScenSelection = function(){

	let scen_array = myUI.scen_arr;
  
  let scen_label_elem = myUI.selects["scen_select"].label; //document.getElementById("scen_label");
	scen_label_elem.innerHTML = `Choose scenario for ${scen_array[0][1]}. Map   Width: ${scen_array[0][2]} Map Height: ${scen_array[0][3]}`;	
	//display first scene as default at index 0
	myUI.scenChoice = 0;
	myUI.loadScen();
	let scen_select_elem = myUI.selects["scen_select"].elem;
	let child = scen_select_elem.lastElementChild; 
	while (child) {
		scen_select_elem.removeChild(child);
		child = scen_select_elem.lastElementChild;
	}
	/* each iteration 
  [ '9',
    'Berlin_0_512.map',
    '512',
    '512',
    '173',
    '435',
    '156',
    '467',
    '39.04163055' ]*/
	for (let i=0;i<scen_array.length;++i){
		let scen = scen_array[i]
		let option = document.createElement("option");

    option.setAttribute("value", i);
    // when a option is clicked function is runned to redraw start and end points
    //option.setAttribute("onclick", load_scen());
		let option_str = "";
		for (let j=4;j<=7;++j){
      //adding spaces to ensure each column in the options line up
      // &nbsp non breaking space, space that will not go to new line
			option_str+='&nbsp'.repeat(4-scen[j].length) + scen[j] + '&nbsp';
		}
		option_str+=scen[8];
		option.innerHTML = option_str;
    // options is child of select
		scen_select_elem.appendChild(option);
	}	
}

myUI.loadScen = function(){
	console.log("selected by dropdown");
	let scen_select_elem = myUI.selects["scen_select"].elem;
	myUI.scenChoice= scen_select_elem.selectedIndex==-1 ? 0 : scen_select_elem.selectedIndex;
	let scen_array = myUI.scen_arr;

	let choice = myUI.scenChoice;
 
	myUI.map_start = [Number(scen_array[choice][5]),Number(scen_array[choice][4])];//  in Y, X
	myUI.map_goal = [Number(scen_array[choice][7]), Number(scen_array[choice][6])];//  in Y, X
	myUI.displayScen();
}

myUI.displayScen = function(moved=false){
	myUI.canvases.start.erase_canvas();
	myUI.canvases.goal.erase_canvas();
	myUI.reset_animation();
	myUI.planner.cell_map = undefined;
	myUI.sliders.search_progress_slider.elem.disabled = true;
	myUI.scenFail = false;
	if(myUI.map_name!=myUI.scen_name){
		myUI.scenFail = true;  // will remember to load the Scen the next time a map is loaded
	}
	else{
		console.log(myUI.map_start, myUI.map_goal);
		myUI.canvases["start"].draw_start_goal(myUI.map_start, "rgb(150,150,150)");
		myUI.canvases["goal"].draw_start_goal(myUI.map_goal, "rgb(159,23,231)");
		if(!moved){
			//console.log("moving");
			myUI.map_start_icon.move(myUI.map_start);
			myUI.map_goal_icon.move(myUI.map_goal);
		}
	}

	/*clear all canvases*/
	["visited",	"neighbours", "queue",	"current_YX",	"path"].forEach(canvas_id=>{
		myUI.canvases[canvas_id].erase_canvas();
	})
}

function moveDraggable(yx){
	let bounds = myUI.canvases.hover_map.canvas.getBoundingClientRect();
	this.elem.style.top = `${(yx[0]+0.5)*bounds.height / myUI.map_height - this.elem.height/2}px`;
	this.elem.style.left = `${(yx[1]+0.5)*bounds.width / myUI.map_width - this.elem.width/2}px`;
}

myUI.map_start_icon.move = moveDraggable;
myUI.map_goal_icon.move = moveDraggable;

myUI.selects["scen_select"].elem.addEventListener("change", myUI.loadScen);


/* PLANNER PARSER */

/* haven't build yet */
//var planner_upload_elem = document.getElementById("planner-upload");

myUI.showPlanners = function() {
  /* used to populate the planner selection */

  /* custom self-built planners uploading */
  // planner_upload_elem
  // get data from planner_upload_elem
  // add_planner()
  /*let child = myUI.selects["planner_select"].elem.lastElementChild;

  while (child) {
    planner_select_elem.removeChild(child);
    child = planner_select_elem.lastElementChild;
  }/**/
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

	// updates both selects
	myUI.selects["planner_select"].elem.value = myUI.planner_choice;
	myUI.selects["planner_select2"].elem.value = myUI.planner_choice;
	myUI.reset_animation();
  determine_table_header();
	myUI.planner = new myUI.planners[myUI.planner_choice]();
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

	let default_scen = `version 1\n0\t16x16_default.map\t16\t16\t1\t1\t13\t13\t-1`;
	myUI.parseScenario(default_scen);
	myUI.showScenSelection();
}

myUI.runDefault();

myUI.selects["planner_select"].elem.addEventListener("change", myUI.loadPlanner);



//determines the type of info table
function determine_table_header(){

  if (myUI.planners[myUI.planner_choice] == BFS || myUI.planners[myUI.planner_choice] == DFS){
  // delete previous header
    if(document.getElementById("info_table").rows.length == 1){
      document.getElementById("info_table").deleteRow(0); 
    }
    RemoveAllTableSlides()
    
    
    var table = document.getElementById("info_table");
    var header = table.createTHead();
    var row = header.insertRow(0);
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
  
  
    cell0.innerHTML = "<b>Vertex</b>";
    cell1.innerHTML = "<b>Parent</b>";
  
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
    document.getElementById(infoNWSE_Id).innerHTML = 'Type:<span id="type"></span>';
  //initialise html for info squares as well
    });
    
  }
  else if (myUI.planners[myUI.planner_choice] == Dijkstra){
   if(document.getElementById("info_table").rows.length == 1){
      document.getElementById("info_table").deleteRow(0);
    }
    RemoveAllTableSlides()
    var table = document.getElementById("info_table");
    var header = table.createTHead();
    var row = header.insertRow(0);
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    var cell2 = row.insertCell(2);
    
  
    cell0.innerHTML = "<b>Vertex</b>";
    cell1.innerHTML = "<b>Parent</b>";
    cell2.innerHTML = "<b>G cost</b>";

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
    document.getElementById(infoNWSE_Id).innerHTML = 'G:<span id="G"></span>Type:<span id="type"></span>';
  //initialise html for info squares as well
    });
  
    
  }

    
  else if (myUI.planners[myUI.planner_choice] == A_star){
    if(document.getElementById("info_table").rows.length == 1){
      document.getElementById("info_table").deleteRow(0);
    }
    RemoveAllTableSlides()
    var table = document.getElementById("info_table");
    var header = table.createTHead();
    var row = header.insertRow(0);
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    var cell2 = row.insertCell(2);
    var cell3 = row.insertCell(3);
    var cell4 = row.insertCell(4);
  
    cell0.innerHTML = "<b>Vertex</b>";
    cell1.innerHTML = "<b>Parent</b>";
    cell2.innerHTML = "<b>F cost</b>";
    cell3.innerHTML = "<b>G cost</b>";
    cell4.innerHTML = "<b>H cost</b>";
  

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
    document.getElementById(infoNWSE_Id).innerHTML = 'F:<span class "F_cost" id="F"></span>G:<span id="G"></span>H:<span id="H"></span>Type:<span id="type"></span>';
  //initialise html for info squares as well
    });
  }
}

function RemoveAllTableSlides(){
  var temp = slides.length;// slides.length alawys changes, cannot use
   if(temp != 0){
      console.log( temp,"slides length");
     var i =temp-1;
      while(i!=-1) {
        console.log(i,"iter");
        removebyindex(i);
        i--;
      }
    } 
}