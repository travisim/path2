class Theta_star extends A_star{

	static get display_name(){
		return "Theta star";
  }

  static drawMode = "Free Vertex";

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