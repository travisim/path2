class Theta_star extends A_star{

	static get display_name(){ return "Theta star"; }

  static drawMode = "Free Vertex";

  static get configs(){
    let configs = super.configs;
    for(let i = 0; i < configs.length; ++i) if(configs[i].uid == "distance_metric"){
      configs[i].options = ["Euclidean"];
      configs[i].description =  `The metrics used for calculating distances.<br>Euclidean takes the L2-norm between two cells, which is the real-world distance between two points. This is commonly used for any angle paths.`;
    }
		return configs;
  }

  pick_parent(successor){
    if(this.current_node.parent){
      let OFFSET = this.vertexEnabled ? 0 : 0.5;
      let src = [this.current_node.parent.self_XY[0] + OFFSET, this.current_node.parent.self_XY[1] + OFFSET];
      let tgt = [successor[0] + OFFSET, successor[1] + OFFSET];
      if(CustomLOSChecker(src, tgt).boolean)
        return this.current_node.parent;
      return this.current_node;
    }
    return this.current_node;
  }
}