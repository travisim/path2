class wasm_Theta_star extends wasm_A_star{
	static get display_name(){ return "Theta star (wasm)"; }

  static get showFreeVertex(){ return true; }

  static get configs(){
    let configs = super.configs;
    for(let i = 0; i < configs.length; ++i) if(configs[i].uid == "distance_metric"){
      configs[i].options = ["Euclidean"];
      configs[i].description =  `The metrics used for calculating distances.<br>Euclidean takes the L2-norm between two cells, which is the real-world distance between two points. This is commonly used for any angle paths.`;
    }
		return configs;
  }

  loadWasmPlanner(){
    return this.bigMap ? new Module["BaseThetaStarPlanner"]() : new Module["ThetaStarPlanner"]();
  }
}