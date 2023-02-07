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

	let default_scen = `version 1\n0\t16x16_default.map\t16\t16\t0\t0\t13\t13\t-1`;
	myUI.parseScenario(default_scen);
  myUI.loadScenario();
  
  /* first call */
  myUI.showPlanners();
  myUI.loadPlanner();

  myUI.stateFreq = Number(myUI.sliders.state_freq_slider.elem.value);

  coll[1].click();
  coll[3].click();
  coll[4].click();

	let data = {"coords":[[1,12],[1,13],[14,10],[14,7],[10,2],[14,15],[2,10],[4,11],[3,11],[8,3],[9,4],[10,1],[1,0],[14,3],[11,8],[3,14],[2,5],[2,16],[13,1],[9,10],[9,3],[7,10],[16,13],[16,14],[8,10],[9,9],[15,0],[6,14],[7,0],[5,8],[3,6],[11,6],[1,6],[15,14],[12,7],[13,13],[0,0]],"neighbors":[[1,17],[0,17],[3,22,33,23,5],[2,34,31,13,22,23,26,33],[11,28],[33,23,22,2,19,35],[16,32],[8,15,30],[7,15,30],[20,10],[9,20],[4,18,28,26],[16,28,32,36],[3,26],[34,31],[7,8,17,27],[12,32,6],[0,1,15,27],[11,26],[5,25],[9,10],[24,27],[2,5,23,33,3],[2,5,22,33,3],[21],[19],[13,18,11,3],[15,17,21],[4,11,12],[30],[29,8,7],[3,14,34],[12,16,6],[2,5,22,23,3],[3,14,31],[5],[12]],"edges":[[[1,12],[1,13]],[[1,12],[2,16]],[[1,13],[2,16]],[[14,10],[14,7]],[[14,10],[16,13]],[[14,10],[15,14]],[[14,10],[16,14]],[[14,7],[12,7]],[[14,7],[11,6]],[[14,7],[14,3]],[[10,2],[10,1]],[[10,2],[7,0]],[[14,15],[15,14]],[[14,15],[16,14]],[[14,15],[16,13]],[[14,15],[9,10]],[[4,11],[3,11]],[[4,11],[3,14]],[[3,11],[3,14]],[[8,3],[9,3]],[[8,3],[9,4]],[[9,4],[9,3]],[[10,1],[13,1]],[[10,1],[7,0]],[[1,0],[2,5]],[[1,0],[7,0]],[[1,0],[1,6]],[[14,3],[15,0]],[[11,8],[12,7]],[[11,8],[11,6]],[[3,14],[2,16]],[[3,14],[6,14]],[[2,5],[1,6]],[[2,5],[2,10]],[[2,16],[6,14]],[[13,1],[15,0]],[[9,10],[9,9]],[[7,10],[8,10]],[[16,13],[16,14]],[[16,13],[14,7]],[[16,14],[14,7]],[[15,0],[10,1]],[[15,0],[14,7]],[[6,14],[7,10]],[[5,8],[3,6]],[[3,6],[3,11]],[[3,6],[4,11]],[[11,6],[12,7]],[[1,6],[2,10]],[[15,14],[14,7]],[[13,13],[14,15]],[[0,0],[1,0]]]}

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
}
myUI.runDefault();