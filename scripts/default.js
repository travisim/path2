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
}
myUI.runDefault();