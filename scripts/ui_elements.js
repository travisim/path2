class UICanvas{

  // adapted from: https://www.npmjs.com/package/intrinsic-scale
  //contains extra code to cover map elements that exceed css canvas 
  static getObjectFitSize(
    contains /* true = contain(contain within css canvas), false = cover (extend beyond css canvas)*/,
    containerWidth,
    containerHeight,
    width,
    height
  ) {
    var doRatio = width / height; //1.4
    var cRatio = containerWidth / containerHeight;
    var targetWidth = 0;
    var targetHeight = 0;
    //         if true bitmap larger than css canvas
    var test = contains ? (doRatio > cRatio) : (doRatio < cRatio);
  
    if (test) {
      targetWidth = containerWidth;
      targetHeight = targetWidth / doRatio;
    } else {
      targetHeight = containerHeight;
      targetWidth = targetHeight * doRatio;
    }
  
    return {
      width: targetWidth,
      height: targetHeight,
      x: (containerWidth - targetWidth) / 2,
      y: (containerHeight - targetHeight) / 2
    };
  }
  constructor(canvas_id, colors, drawType="cell", fixedResVal=1024, valType="int", defaultVal=0, toggleType="off", minVal=null, maxVal=null){
    this.id = canvas_id;
    this.canvas = document.getElementById(canvas_id);
    this.ctx = this.canvas.getContext("2d");
    this.defaultHeight = this.canvas.clientHeight;
    this.defaultWidth = this.canvas.clientWidth;

    var height = this.canvas.height;
    var width = this.canvas.width;
    //if(this.id=="edit_map") console.log(`Height: ${height}, Width: ${width}`);
    this.defaultVal = defaultVal;
    this.valType = valType;
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.canvas_cache = zero2D(height, width, this.defaultVal, this.defaultVal, this.valType);  // initialise a matrix of 0s (zeroes), height x width

    this.data_height = this.canvas.height;
    this.data_width = this.canvas.width;
    
    this.colors = colors;
		this.set_color_index(0, "all");

    this.fixedResVal = fixedResVal;
    this.setDrawType(drawType);
  }

  setValueBounds(minOrMax, val){
    if(minOrMax=="min") this.minVal = val;
    else if(minOrMax=="max") this.maxVal = val;
  }

  setDrawType(drawType="pixel"){
    this.drawType = drawType;

    switch(drawType){
      case "vertex":
        this.canvas_cache = zero2D(this.data_height+1, this.data_width+1, this.defaultVal, this.defaultVal, this.valType);
      case "dotted":
        this.fixedRes = true;
        break;
      default:
        this.canvas_cache = zero2D(this.data_height, this.data_width, this.defaultVal, this.defaultVal, this.valType);
        this.fixedRes = false;
    }
  }

  scale_coord(x,y){
    let scaled_y = Math.floor(x/this.canvas.clientWidth * myUI.map_width);
    let scaled_x = Math.floor(y/this.canvas.clientHeight * myUI.map_height);
    return [scaled_x, scaled_y];
  }

  scale_canvas(data_height, data_width, retain_data=false){
    const dpr = 2;
    //window.devicePixelRatio usually got decimals

    this.canvas.style.width = Math.min(this.defaultWidth, data_width/data_height*this.defaultWidth) + "px";
    this.canvas.style.height = Math.min(this.defaultHeight, data_height/data_width*this.defaultHeight) + "px";
    
    if(this.fixedRes){
      this.canvas.width = this.fixedResVal * this.canvas.clientWidth/this.defaultWidth;
      this.canvas.height = this.fixedResVal * this.canvas.clientHeight/this.defaultHeight;
      this.data_height = this.canvas.height;
      this.data_width = this.canvas.width;
      return
    }
    this.data_height = data_height;
    this.data_width = data_width;

    // canvas resolution
    this.canvas.width = this.canvas.clientWidth*dpr;
    this.canvas.height = this.canvas.clientHeight*dpr;

    let widthRatio = this.canvas.clientHeight / data_height;
    let heightRatio = this.canvas.clientWidth / data_width;
    
    this.ctx.scale(widthRatio*dpr, heightRatio*dpr); //adjust this! context.scale(2,2); 2=200

    if (data_width > 256 || data_height>256) this.pixelSize = 1.2;
    else this.pixelSize = 1;

    if(retain_data){
      let new_canvas_cache = deep_copy_matrix(this.canvas_cache);//zero2D(data_height, data_width);
      this.canvas_cache = zero2D(data_height, data_width, this.defaultVal, this.defaultVal, this.valType);
      this.draw_canvas(new_canvas_cache, `2d`, false);
    }
    else{
      this.canvas_cache = zero2D(data_height, data_width, this.defaultVal, this.defaultVal, this.valType);
    }
  }

  set_color(color, color_type="all"){
    if(color_type=="fill"){
      this.ctx.fillStyle = color;
			this.fillColor = color;
    }
		else if(color_type=="all" || color_type=="both"){
      this.ctx.fillStyle = color;
			this.fillColor = color;
      this.ctx.strokeStyle = color;
			this.strokeColor = color;
		}
    else{ // stroke
      this.ctx.strokeStyle = color;
			this.strokeColor = color;
    }
  }

	set_color_index(index=0, color_type="all"){
    this.set_color(this.colors[index], color_type);
	}

  init_virtual_canvas(){
    this.virtualCanvas = zero2D(this.data_height, this.data_width);
  }

  change_pixel(xy, direction, virtual=false){
    let [x,y] = xy;
    let val = this.canvas_cache[x][y];
    if(direction=="inc") ++val; else --val;
    val = Math.min(this.colors.length, Math.max(val, 0));
    if(val==0){
      this.erase_pixel(xy);
      return;
    }
    this.draw_pixel(xy, virtual, val, val-1);
  }

  draw_pixel(xy, virtual=false, val=1, color_index=0, save_in_cache=true){
    let [x,y] = xy;
    if(x>=this.data_height || y>=this.data_width) return;
    if(virtual)
      this.virtualCanvas[x][y] = val;
    else {
      if(save_in_cache) this.canvas_cache[x][y] = val;
      if(val==this.defaultVal){
        this.erase_pixel(xy);
        return;
      }
      
      if(this.valType=="float"){
        let r = (val-this.minVal)/(this.maxVal-this.minVal);
        let color = chroma.scale("Spectral")(1-r).hex();
        //let color = chroma(chroma.mix(this.colors[0], this.colors[1], r, 'hsl')).hex();
        this.set_color(color);
      }
      else
        this.set_color_index(color_index);

      switch(this.drawType){
        case "dotted":
          this.draw_dotted_square(xy);
          break;
        case "vertex":
          this.draw_vertex_circle(xy);
          break;
        default:
          this.ctx.fillRect(y, x, this.pixelSize, this.pixelSize);
      }
    }
  }

  erase_pixel(xy, virtual=false, save_in_cache=true){
		let [x,y] = xy;
    if(x>=this.data_height || y>=this.data_width) return;
    if(virtual)
      this.virtualCanvas[x][y] = this.defaultVal;
    else {
      if(save_in_cache) this.canvas_cache[x][y] = this.defaultVal;
      switch(this.drawType){
        case "dotted":
          this.draw_dotted_square(xy);
          break;
        case "vertex":
          this.erase_vertex_circle(xy);
          break;
        default:
          this.ctx.clearRect(y, x, this.pixelSize, this.pixelSize);
      }
    }
  }

  draw_start_goal(point, strokeColor=this.ctx.strokeStyle){
    this.set_color(strokeColor, "all");
    if (myUI.map_height < 64 || this.fixedRes){
      this.draw_pixel(point);
    }
    else{
      this.draw_scaled_cross(point, strokeColor);
    }
  }

  draw_scaled_cross(array_data, strokeColor){
    let ctx = this.ctx;
    const scaled_cross_length = Math.round(this.data_height*0.02);
    //drawing the crosses from top left down and top right down
    ctx.beginPath();
    ctx.lineWidth = this.data_height/128;
   // context.arc(point[1], point[0], 7.5, 0, 2 * Math.PI);
    ctx.moveTo(array_data[1]-scaled_cross_length, array_data[0]-scaled_cross_length);
    ctx.lineTo(array_data[1]+scaled_cross_length, array_data[0]+scaled_cross_length);
    ctx.moveTo(array_data[1]-scaled_cross_length, array_data[0]+scaled_cross_length);
    ctx.lineTo(array_data[1]+scaled_cross_length, array_data[0]-scaled_cross_length);
    this.set_color(strokeColor, "stroke");
    ctx.stroke();
  }

  draw_canvas(array_data, array_type, draw_zeroes=false, virtual=false){
    if(virtual) this.init_virtual_canvas();
    else this.erase_canvas();  // clear canvas first before drawing
    // remember to scale canvas first on new maps!
    if(array_data==null || array_data==undefined) return;
    if (array_type == "1d") 
      array_data.forEach(coord=>{
        // coord is in row-major form
        if(Number.isInteger(coord)){
          var y = Math.floor(coord/myUI.planner.map_width);
          var x = coord - y * myUI.planner.map_width;
          coord = [x,y];
        }
        this.draw_pixel(coord, virtual);
      });
    else if(array_type == "2d"){  //eg [ [ 8, 6 ], [ 9, 7 ], [ 8, 8 ] ]
      for (let i = 0; i < array_data.length; i++) 
        for (let j = 0; j < array_data[i].length; j++) 
          if (array_data[i][j] ^ draw_zeroes)
            this.draw_pixel([i,j], virtual);
    }
    else if(array_type == "2d_heatmap"){
      for (let i = 0; i < array_data.length; i++) 
        for (let j = 0; j < array_data[i].length; j++)
          if(array_data[i][j]){
            let val = Math.min(this.colors.length, Math.max(array_data[i][j], 0));
            this.draw_pixel([i,j], virtual, val, val-1);
          }
    }
  }

  erase_canvas(){
    let height = this.data_height ? this.data_height : this.canvas.height;
    let width = this.data_width ? this.data_width : this.canvas.width;
    this.ctx.clearRect(0, 0, width, height);
    this.canvas_cache = zero2D(height, width);  // reset to a matrix of 0s (zeroes), height x width
  }

  draw_vertex_circle(xy, color_index){
    let y = xy[0]*this.data_height/myUI.map_height;
    let x = xy[1]*this.data_width/myUI.map_width;
    let r = 6;//this.data_height/myUI.map_height * 5/16;
    if(myUI.map_height>32 || myUI.map_width>32){
      r = Math.min(this.data_height/myUI.map_height * 4/16, this.data_width/myUI.map_width * 4/16)
      debugger;
    }

    this.set_color(this.strokeColor, "stroke");
    this.ctx.beginPath();
    this.ctx.lineWidth = r*1.8;
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  erase_vertex_circle(xy){
    let y = xy[0]*this.data_height/myUI.map_height;
    let x = xy[1]*this.data_width/myUI.map_width;
    let r = 6//this.data_height/myUI.map_height * 5/16;
    if(myUI.map_height>32 || myUI.map_width>32){
      r = Math.min(this.data_height/myUI.map_height * 4/16, this.data_width/myUI.map_width * 4/16)
    }
    let d = r*2;
    this.ctx.clearRect(x-d, y-d, 2*d, 2*d);
  }

  draw_dotted_square(xy){
    let y = xy[0]*this.data_height/myUI.map_height;
    let x = xy[1]*this.data_width/myUI.map_width;
    let side = this.data_height/myUI.map_height;
    console.log(x,y);
    this.set_color(this.strokeColor, "stroke");
    this.ctx.setLineDash([12, 6]);/*dashes are 2px and spaces are 2px*/
    this.ctx.lineWidth = 6;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x+side, y);
    this.ctx.lineTo(x+side, y+side);
    this.ctx.lineTo(x, y+side);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

	erase_dotted_square(xy){
		let y = xy[0]*this.data_height/myUI.map_height;
    let x = xy[1]*this.data_width/myUI.map_width;
    let side = this.data_height/myUI.map_height;

		this.ctx.clearRect(y, x, side, side);
	}

  toggle_edit(){
    this.edit_state = !this.edit_state;
    /*if(!this.edit_enabled){
      this.canvas.addEventListener(`mousedown`, handleMouseDown, true);
      this.canvas.addEventListener('mousemove', handleMouseMove, true);
      window.addEventListener('mouseup', handleMouseUp, true);
      this.edit_enabled = true;
    }*/

    // wrapper for mouse event handlers
    this.canvas.wrapper = this;
    this.window = window;
    this.window.wrapper = this;

    if(this.edit_state){  // enable editing mode
      console.log(`enabling editing`);
      this.canvas.addEventListener(`mousedown`, this._handleMouseDown, true);
      this.canvas.addEventListener('mousemove', this._handleMouseMove, true);
      this.canvas.addEventListener('mouseup', this._handleMouseUp, true);
      this.canvas.addEventListener('mouseleave', this._handleMouseLeave, true);
      window.addEventListener('mouseup', this._handleMouseUp, true);
    }
    else{
      this.canvas.removeEventListener(`mousedown`, this._handleMouseDown, true);
      this.canvas.removeEventListener('mousemove', this._handleMouseMove, true);
      this.canvas.removeEventListener('mouseup', this._handleMouseUp, true);
      this.canvas.removeEventListener('mouseleave', this._handleMouseLeave, true);
      window.removeEventListener('mouseup', this._handleMouseUp, true);
    }
  }

  _handleMouseDown(e){
    // this function is bound to the canvas dom element, use this.wrapper to refer to the UICanvas
    let canvas_x = e.offsetX;
    let canvas_y = e.offsetY;
    this.wrapper._fillEditedCell(canvas_x, canvas_y);
    this.wrapper.isDrawing = true;
  }

  _handleMouseMove(e){
    // this function is bound to the canvas dom element, use this.wrapper to refer to the UICanvas
    let canvas_x = e.offsetX;
    let canvas_y = e.offsetY;
    this.wrapper.draw_canvas(deep_copy_matrix(this.wrapper.canvas_cache), `2d`);
    if (this.wrapper.isDrawing) this.wrapper._fillEditedCell(canvas_x, canvas_y);
    this.wrapper._drawHover(canvas_x, canvas_y);
  }

  _handleMouseUp(e){
    // this function is bound to the canvas dom element, use this.wrapper to refer to the UICanvas
    this.wrapper.isDrawing = false;
    if(this.id=="edit_map"){  //  to save the current state on the screen
      let child = new EditState(myUI.map_edit.curr_state, deep_copy_matrix(this.wrapper.canvas_cache));
      myUI.map_edit.curr_state.child = child;
      myUI.map_edit.curr_state = child;
    }
  }
  
  _handleMouseLeave(e){
    this.wrapper.draw_canvas(deep_copy_matrix(this.wrapper.canvas_cache), `2d`);
  }

  _fillEditedCell(canvas_x, canvas_y){
    let [x,y] = this.scale_coord(canvas_x, canvas_y);
    if(this.erase) this.erase_pixel([x,y]);
    else this.draw_pixel([x,y]);
  }

  _drawHover(canvas_x, canvas_y){
    let [x,y] = this.scale_coord(canvas_x, canvas_y);
    if(this.erase) this.draw_pixel([x,y], false, 1, 2, false);
    else this.draw_pixel([x,y], false, 1, 1, false);
  }

  toggle_draw_erase(){
    // initial state => set this.erase to true, because draw is default and calling of function means it has been clicked to erase
    this.erase = !this.erase;
    return this.erase;
  }

  copy_data_to(other_id){
    myUI.canvases[other_id].draw_canvas(this.canvas_cache, `2d`, false);
  }
}

class UIButton{
  constructor(button_id){
    this.btn = document.getElementById(button_id);

    this.svgs = [];
    if(arguments.length>1){
      let svg_ids = arguments[1];
      svg_ids.forEach(id=>{
        this.svgs.push(document.getElementById(id));
      });
      this.svg_index = 0;
    }
    if(this.svgs[0]) this.svgs[0].classList.remove("hidden");
  }

  next_svg(){
    // assumes all svgs are hidden except the first one
    this.svgs[this.svg_index].classList.add("hidden");  // hide the current one
    this.svg_index = (this.svg_index+1)%this.svgs.length;  // increment to next svg in list
    this.svgs[this.svg_index].classList.remove("hidden");  // show the next one
  }
}

// below 23 lines have been adapted from https://stackoverflow.com/a/4663129
var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
if (CP && CP.lineTo) {
  CP.dashedLine = CP.dashedLine || function(x, x,y2, y2, da) {
    if (!da) da = [10,5];
    this.save();
    var dx = (x2-x), dy = (y2-y);
    var len = Math.sqrt(dx*dx + dy*dy);
    var rot = Math.atan2(dy, dx);
    this.translate(x, y);
    this.moveTo(0, 0);
    this.rotate(rot);       
    var dc = da.length;
    var di = 0, draw = true;
    x = 0;
    while (len > x) {
      x += da[di++ % dc];
      if (x > len) x = len;
      draw ? this.lineTo(x, 0): this.moveTo(x, 0);
      draw = !draw;
    }       
    this.restore();
  }
}


var coll = document.getElementsByClassName("collapsible");



for (var i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active_Section");
    var content = this.nextElementSibling;
    
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } 
    else {
      content.style.maxHeight = content.scrollHeight + "px";
    } 
    
  });
}
/*
for (var i = 0; i < coll.length; i++) {
  coll[i].nextElementSibling.style.height = "0px";
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active_Section");
    var content = this.nextElementSibling;
    
    if (content.style.height != "0px"){
      content.style.height = "0px";
    } 
    else {
      content.style.height = "auto";
    } 
    
  });
}
*/