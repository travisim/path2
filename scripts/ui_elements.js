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

  constructor(canvas_id, colors){
    this.id = canvas_id;
    this.canvas = document.getElementById(canvas_id);
    this.ctx = this.canvas.getContext("2d");

    // parent for mouse event handlers
    this.canvas.parent = this;
    this.window = window;
    this.window.parent = this;

    var height = this.canvas.height;
    var width = this.canvas.width;
    if(this.id=="edit_map") console.log(`Height: ${height}, Width: ${width}`);
    this.canvas_cache = zero2D(height, width);  // initialise a matrix of 0s (zeroes), height x width

    this.data_height = this.canvas.height;
    this.data_width = this.canvas.width;
    
    this.colors = colors;
		this.set_color_index(0, "all");
  }

  scale_canvas(data_height, data_width, retain_data=false){

    this.data_height = data_height
    this.data_width = data_width

    let originalWidth = data_height
    let originalHeight = data_width

    const dimensions = UICanvas.getObjectFitSize(
        true,
        this.canvas.clientWidth,
        this.canvas.clientHeight,
        this.canvas.width,
        this.canvas.height
    );

    const dpr = 2;
    //window.devicePixelRatio usually got decimals
    //console.log(dimensions.height, dimensions.width);
    this.canvas.width = dimensions.width * dpr; // change js/html canvas width
    this.canvas.height = dimensions.height * dpr;// change js/html canvas height

    //console.log(this.canvas.clientWidth /  originalWidth,this.canvas.clientHeight / originalHeight);
    let ratio = Math.min(
        this.canvas.clientWidth / originalWidth,
        this.canvas.clientHeight / originalHeight
    );
    let widthRatio = this.canvas.clientWidth / originalWidth;
    let heightRatio = this.canvas.clientHeight / originalHeight;
    //this.ctx.scale(ratio * dpr, ratio * dpr); //adjust this! context.scale(2,2); 2=200
    this.ctx.scale(heightRatio * dpr, widthRatio * dpr); //adjust this! context.scale(2,2); 2=200

    if (data_width > 256 || data_height>256) this.pixelSize = 1.5;
    else this.pixelSize = 1;

    if(retain_data){
      //console.log(data_width);
      let new_canvas_cache = zero2D(data_height, data_width);
      //console.log(`first`);
      //console.log(new_canvas_cache);

      for(let i=0;i<this.data_height;++i){
        if(i<this.canvas_cache.length)
          for(let j=0;j<this.data_width;++j){
            if(j<this.canvas_cache[0].length)
              new_canvas_cache[i][j] = this.canvas_cache[i][j];
          }
      }
      //console.log(`second`);
      //console.log(new_canvas_cache);
      //console.log(`Height: ${new_canvas_cache.length}`);
      //console.log(`Width: ${new_canvas_cache[0].length}`);
      this.canvas_cache = zero2D(data_height, data_width);
      //console.log(`reset`);
      //console.log(`Height: ${this.canvas_cache.length}`);
      //console.log(`Width: ${this.canvas_cache[0].length}`);
      //console.log(this.canvas_cache);
      this.draw_canvas(new_canvas_cache, `2d`, false);
      //console.log(this.canvas_cache);
    }
    else{
      this.canvas_cache = zero2D(data_height, data_width);
    }
  }

  set_color(color, color_type="fill"){
    if(color_type=="fill"){
      this.ctx.fillStyle = color;
			this.fillColor = color;
    }
		else if(color_type=="all" || color_type=="both"){
      this.ctx.fillStyle = color;
			this.fillColor = color;
      this.ctx.strokeStyle = color;
			this.strokeStyle = color;
		}
    else{
      this.ctx.strokeStyle = color;
			this.strokeColor = color;
    }
  }

	set_color_index(index=0, color_type="fill"){
		if(color_type=="fill"){
      this.ctx.fillStyle = this.colors[index];
			this.fillColor = this.colors[index];
    }
		else if(color_type=="all" || color_type=="both"){
      this.ctx.fillStyle = this.colors[index];
      this.fillColor = this.colors[index];
      this.ctx.strokeStyle = this.colors[index];
			this.strokeStyle = this.colors[index];
		}
    else{
      this.ctx.strokeStyle = this.colors[index];
			this.strokeStyle = this.colors[index];
    }
	}

  init_virtual_canvas(){
    this.virtualCanvas = zero2D(this.data_height, this.data_width);
  }

  change_pixel(yx, direction, virtual=false){
    let [y,x] = yx;
    let curr = this.canvas_cache[y][x];
    if(direction=="inc") ++curr; else --curr;
    this.draw_pixel(yx, virtual, curr);
  }

  draw_pixel(yx, virtual=false, val=1){
    val = Math.min(this.colors.length, Math.max(val, 0));
    this.set_color_index(val-1);
    let [y,x] = yx;
    if(virtual)
      this.virtualCanvas[y][x] = val;
    else {
      this.canvas_cache[y][x] = val;
      this.ctx.fillRect(x, y, this.pixelSize, this.pixelSize);
    }
  }

  erase_pixel(yx){
    let y = yx[0];
    let x = yx[1];
    this.canvas_cache[y][x] = 0;
    this.ctx.clearRect(x, y, this.pixelSize, this.pixelSize);
  }

  draw_start_goal(point, strokeColor=this.ctx.strokeStyle){
    this.set_color(strokeColor, "all");
    if (this.data_height < 64){
      this.draw_pixel(point);
    }
    else if (this.data_height >= 64){
      this.draw_scaled_cross(point, strokeColor);
    }
  }

  draw_scaled_cross(array_data, strokeColor){
    let ctx = this.ctx;
    var scaled_cross_length = Math.round(this.data_height*0.02);
    var x = scaled_cross_length;
    //drawing the crosses from top left down and top right down
    ctx.beginPath();
    ctx.lineWidth = this.data_height/128;
   // context.arc(point[1], point[0], 7.5, 0, 2 * Math.PI);
    ctx.moveTo(array_data[1]-x, array_data[0]-x);
    ctx.lineTo(array_data[1]+x, array_data[0]+x);
    ctx.moveTo(array_data[1]-x, array_data[0]+x);
    ctx.lineTo(array_data[1]+x, array_data[0]-x);
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
        if(isInt(coord)){
          var y = Math.floor(coord/myUI.planner.map_width);
          var x = coord - y * myUI.planner.map_width;
          coord = [y,x];
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
          if(array_data[i][j] ^ draw_zeroes){
            this.draw_pixel([i,j], virtual, array_data[i][j]);
          }
    }
  }

  erase_canvas(){
    let height = this.data_height ? this.data_height : this.canvas.height;
    let width = this.data_width ? this.data_width : this.canvas.width;
    this.ctx.clearRect(0, 0, width, height);
    this.canvas_cache = zero2D(height, width);  // reset to a matrix of 0s (zeroes), height x width
  }

  toggle_edit(){
    this.edit_state = !this.edit_state;
    /*if(!this.edit_enabled){
      this.canvas.addEventListener(`mousedown`, handleMouseDown, true);
      this.canvas.addEventListener('mousemove', handleMouseMove, true);
      window.addEventListener('mouseup', handleMouseUp, true);
      this.edit_enabled = true;
    }*/

    if(this.edit_state){  // enable editing mode
      console.log(`enabling editing`);
      this.canvas.addEventListener(`mousedown`, this._handleMouseDown, true);
      this.canvas.addEventListener('mousemove', this._handleMouseMove, true);
      this.canvas.addEventListener('mouseup', this._handleMouseUp, true);
      window.addEventListener('mouseup', this._handleMouseUp, true);
    }
    else{
      this.canvas.removeEventListener(`mousedown`, this._handleMouseDown, true);
      this.canvas.removeEventListener('mousemove', this._handleMouseMove, true);
      this.canvas.removeEventListener('mouseup', this._handleMouseUp, true);
      window.removeEventListener('mouseup', this._handleMouseUp, true);
    }
  }

  _handleMouseDown(e){
    // this function is bound to the canvas dom element, use this.parent to refer to the UICanvas
    let x = e.offsetX;
    let y = e.offsetY;
    this.parent._fillEditedCell(x, y);
    this.parent.isDrawing = true;
  }

  _handleMouseMove(e){
    // this function is bound to the canvas dom element, use this.parent to refer to the UICanvas
    if (this.parent.isDrawing) {
      let x = e.offsetX;
      let y = e.offsetY;
      this.parent._fillEditedCell(x, y);
      //console.log(`${x}, ${y}`);
    }
  }

  _handleMouseUp(e){
    // this function is bound to the canvas dom element, use this.parent to refer to the UICanvas
    this.parent.isDrawing = false;
    if(this.id=="edit_map"){  //  to save the current state on the screen
      let child = new EditState(myUI.map_edit.curr_state, deep_copy_matrix(this.parent.canvas_cache));
      myUI.map_edit.curr_state.child = child;
      myUI.map_edit.curr_state = child;
    }
  }

  _fillEditedCell(canvas_x, canvas_y){
    let x = canvas_x/this.canvas.clientWidth*this.data_width;
    let y = canvas_y/this.canvas.clientHeight*this.data_height;
    x = Math.floor(x);
    y = Math.floor(y);
    if(this.erase) this.erase_pixel([y,x]);
    else this.draw_pixel([y,x]);
  }

  toggle_draw_erase(){
    // initial state => set his.erase to true, because draw is default and calling of function means it has been clicked to erase
    this.erase = !this.erase;
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

  toggle_display(){
    if(this.btn.style.display == "none")
      this.btn.style.display = "inline-grid";
    else
      this.btn.style.display = "none";
  }
}

// below 23 lines have been adapted from https://stackoverflow.com/a/4663129
var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
if (CP && CP.lineTo) {
  CP.dashedLine = CP.dashedLine || function(x, y, x2, y2, da) {
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