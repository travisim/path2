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
  constructor(canvas_id, drawOrder, colors, drawType="cell", fixedResVal=1024, valType="int", defaultVal=0, create=true, minVal=null, maxVal=null, infoMapBorder=true, infoMapValue=false){
    this.id = canvas_id;
    if(create){
      this.canvas = document.createElement("canvas");// getElementById(canvas_id);
      this.canvas.setAttribute("id", canvas_id);
      this.canvas.classList.add("map_canvas");
      this.canvas.style.zIndex = getComputedStyle(document.documentElement)
      .getPropertyValue('--canvas-z-index')-drawOrder;
      document.getElementById("canvas_container").appendChild(this.canvas);
    }
    else{
      this.canvas = document.getElementById(canvas_id);
    }
    this.ctx = this.canvas.getContext("2d");
    this.drawOrder = drawOrder;
    this.defaultHeight = this.canvas.clientHeight;
    this.defaultWidth = this.canvas.clientWidth;

    var height = this.canvas.height;
    var width = this.canvas.width;
    //if(this.id=="edit_map") console.log(`Height: ${height}, Width: ${width}`);
    this.defaultVal = defaultVal;
    this.valType = valType;
    this.minVal = minVal;
    this.maxVal = maxVal;
    this.infoMapBorder = infoMapBorder;
    this.infoMapValue = infoMapValue;
    this.canvas_cache = zero2D(height, width, this.defaultVal, this.defaultVal, this.valType);  // initialise a matrix of 0s (zeroes), height x width

    this.data_height = this.canvas.height;
    this.data_width = this.canvas.width;
    
    this.colors = colors;
		this.set_color_index(0, "all");

    this.fixedResVal = fixedResVal;
    this.setDrawType(drawType);
  }
  

  matrixConstructor(){
    return zero2D(this.data_height, this.data_width, this.defaultVal, this.defaultVal, this.valType);
  }

  setValueBounds(minOrMax, val){
    if(minOrMax=="min") this.minVal = val;
    else if(minOrMax=="max") this.maxVal = val;
  }

  setDrawType(drawType="cell"){
    this.drawType = drawType;
    switch(drawType){
      case "vertex":
        this.fixedRes = true;
        this.scale_canvas(this.data_height+1, this.data_width+1, false);
        break;
      case "dotted":
        this.fixedRes = true;
        break;
      case "cell":
        this.fixedRes = false;
        if(myUI.map_height) this.data_height = myUI.map_height;
        if(myUI.map_width) this.data_width = myUI.map_width;
        this.scale_canvas(this.data_height, this.data_width, false);
        break;
      case "svg":
      case "svgDotted":
        break;
      default:
        console.error(`UNKNOWN CANVAS DRAWTYPE, ID: ${this.id}`)
    }
    this.canvas_cache = this.matrixConstructor();
  }

  hide() {
    this.canvas.classList.add("hidden");
  }

  show(){
    this.canvas.classList.remove("hidden");
  }

  scale_coord(x,y){
    let scaled_y = Math.round(x/this.canvas.clientWidth * myUI.map_width);
    let scaled_x = Math.round(y/this.canvas.clientHeight * myUI.map_height); //if x/y > 472 numbers will be skipped due to rounding
    return [scaled_x, scaled_y];
  }

  scale_canvas(data_height, data_width, retain_data=false){
    const dpr = 2;  // controls canvas resolution
    //window.devicePixelRatio usually got decimals

    this.canvas.style.width = Math.min(this.defaultWidth, data_width/data_height*this.defaultWidth) + "px";
    this.canvas.style.height = Math.min(this.defaultHeight, data_height/data_width*this.defaultHeight) + "px";
    
    if(this.fixedRes){
      this.canvas.width = this.fixedResVal * this.canvas.clientWidth/this.defaultWidth;
      this.canvas.height = this.fixedResVal * this.canvas.clientHeight/this.defaultHeight;
      this.data_height = data_height;
      this.data_width = data_width;
      if(!retain_data) this.canvas_cache = this.matrixConstructor();
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

    if (data_width > 256 || data_height > 256) this.pixelSize = 1.2;
   
    else this.pixelSize = 1;

    if(retain_data){
      let new_canvas_cache = deep_copy_matrix(this.canvas_cache);
      this.canvas_cache = this.matrixConstructor();
      this.draw_canvas(new_canvas_cache, `2d`, false);
    }
    else{
      this.canvas_cache = this.matrixConstructor();
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
    this.virtualCanvas = this.matrixConstructor();
  }

  change_pixel(xy, direction, virtual=false){
    let [x,y] = xy;
    try{
      let val = virtual ? this.virtualCanvas[x][y] : this.canvas_cache[x][y];
      if(direction=="inc") ++val; else --val;
      if(val==this.defaultVal)
        return this.erase_pixel(xy);
      val = Math.min(this.maxVal, Math.max(val, this.minVal));
      this.draw_pixel(xy, virtual, val, val-1);
    }
    catch(e){
      console.log(e);
      debugger;
    }
  }

  calc_color(val, color_index){
    if(this.valType=="float"){
      let r = (val-this.minVal)/(this.maxVal-this.minVal);
      var color = chroma.scale("Spectral")(1-r).hex();
    }
    else if(color_index!=-1)
      var color = this.colors[color_index];
    else
      var color = this.colors[val - 1];
    return color;
  }

  draw_pixel(xy, virtual=false, val=1, color_index = -1, save_in_cache=true){
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
      
      this.set_color(this.calc_color(val, color_index));

      switch(this.drawType){
        case "dotted":
          this.draw_dotted_square(xy);
          break;
        case "vertex":
          this.draw_vertex(xy);
          break;
        default:
          this.ctx.fillRect(y, x, this.pixelSize, this.pixelSize);
      }
    }
  }
  //  draw_rect(xy, virtual=false, val=1, color_index=0,x_height,y_height ){
  //   let [x,y] = xy;
  //   if(x>=this.data_height || y>=this.data_width) return;
  //   if(virtual)
  //     this.virtualCanvas[x][y] = val;
  //   else {
  //     if(val==this.defaultVal){
  //       this.erase_pixel(xy);
  //       return;
  //     }
      
  //     this.set_color(this.calc_color(val, color_index));

  //     switch(this.drawType){
  //       case "dotted":
  //         this.draw_dotted_square(xy);
  //         break;
  //       case "vertex":
  //         this.draw_vertex(xy);
  //         break;
  //       default:
  //         this.ctx.fillRect(y, x, this.pixelSize*x_height, this.pixelSize*y_height);
  //     }
  //   }
  // }

  erase_pixel(xy, virtual=false, save_in_cache=true){
		let [x,y] = xy;
    if(x>=this.data_height || y>=this.data_width) return;
    if(virtual)
      this.virtualCanvas[x][y] = this.defaultVal;
    else {
      if(save_in_cache) this.canvas_cache[x][y] = this.defaultVal;
      switch(this.drawType){
        case "dotted":
          this.erase_dotted_square(xy);
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
    //this.set_color(strokeColor, "all");
    this.set_color(this.fillColor, "all");
    if (myUI.map_height < 64){
      this.draw_pixel(point, false, 1, -1, false);
    }
    else{
      this.draw_scaled_cross(point, strokeColor);
    }
  }

  draw_scaled_cross(coord, strokeColor){
    const scaled_cross_length = Math.round(this.data_height*0.025);
    let lineWidth = this.data_height/128;
    if(lineWidth % 2) lineWidth--;
    if(lineWidth < 0) lineWidth = 0;
    let [x,y] = coord; 
    this.ctx.fillRect(y - scaled_cross_length, x - lineWidth/2, scaled_cross_length * 2 + 1, lineWidth + 1);
    this.ctx.fillRect(y - lineWidth/2, x - scaled_cross_length, lineWidth + 1, scaled_cross_length * 2 + 1);
    return;
    for(let offset = -lineWidth/2; offset <= lineWidth/2; ++offset){
      console.log("OFFSET:", offset);
      let data = [coord[0], coord[1] + offset];
      for(let i = data[0] - scaled_cross_length; i <= data[0] + scaled_cross_length; ++i){
        this.draw_pixel([i, data[1]], false, 1, -1, false);
      }
      data = [coord[0] + offset, coord[1]];
      for(let j = data[1] - scaled_cross_length; j <= data[1] + scaled_cross_length; ++j){
        this.draw_pixel([data[0], j], false, 1, -1, false);
      }
    }
    /*
    //drawing the crosses from top left down and top right down
    let ctx = this.ctx;
    ctx.beginPath();
    ctx.lineWidth = this.data_height/128;
   // context.arc(point[1], point[0], 7.5, 0, 2 * Math.PI);
    
    ctx.moveTo(coord[1]-scaled_cross_length, coord[0]-scaled_cross_length);
    ctx.lineTo(coord[1]+scaled_cross_length, coord[0]+scaled_cross_length);
    ctx.moveTo(coord[1]-scaled_cross_length, coord[0]+scaled_cross_length);
    ctx.lineTo(coord[1]+scaled_cross_length, coord[0]-scaled_cross_length);
    this.set_color(strokeColor, "stroke");
    ctx.stroke();
    */
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
          if(this.valType=="float") this.draw_pixel([i,j], virtual, array_data[i][j]);
          else if(array_data[i][j]!=this.defaultVal){
            let val = Math.min(this.maxVal, Math.max(array_data[i][j], this.minVal));
            this.draw_pixel([i,j], virtual, val, val-1);
          }
    }
  }

  
  draw_canvas_recursive(toDraw, canvasNo, target_step){
    var canvas = this;
    // first way: array with NaN as delimiters
    // simplest approach -> use a number to keep track then iteratively increase the index
    if(toDraw.constructor != NBitMatrix.data_arr){
      var arrayData = toDraw;
      var prev = NaN;
      var idx = 0;
    }
    // second way: NBitMatrix
    // simplest approach -> NBitMatrix to 2D Array then manually draw
    else if(toDraw.constructor == NBitMatrix.data_arr){
      var arrayData = NBitMatrix.expand_2_matrix(toDraw);
    }
    // third way?: nx where n is the number of following continguous cells -> uses 2D Array
    function draw_next_batch(start){
      if(target_step!=myUI.target_step) return -1;
      const batchSize = Math.max(10 * Math.max(canvas.data_height, canvas.data_width), 500);
      let end = start + batchSize;
      if(toDraw.constructor != NBitMatrix.data_arr){
        while(start < arrayData.length){
          let curr = arrayData[start];
          if(isNaN(prev)){
            idx = curr;
          }
          else if(!isNaN(curr)){
            let x = Math.floor(idx / canvas.data_width);
            let y = idx++ - x * canvas.data_width;
            canvas.draw_pixel([x, y], false, curr);
          }
          prev = curr;
          start++;
          if(start >= end) break;
        }
        if(start >= arrayData.length) return canvasNo + 1;
      }
      else if(toDraw.constructor == NBitMatrix.data_arr){
        while(start < end && start < arrayData.length * arrayData[0].length){
          let x = Math.floor(start / arrayData[0].length);
          let y = start++ - x * arrayData[0].length;
          canvas.draw_pixel([x, y], false, arrayData[x][y]);
        }
        if(start >= arrayData.length * arrayData[0].length) return canvasNo + 1;
      }

      return new Promise((resolve, _) => {
        //resolve(draw_line(r+20));
        setTimeout(() => resolve(draw_next_batch(end)), 0);
      });
    }
    return new Promise((resolve, _) => {
      resolve(draw_next_batch(0));
    });
  }

  erase_canvas(virtual=false){
    if(virtual) return this.init_virtual_canvas();
    if(this.fixedRes) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    else this.ctx.clearRect(0, 0, this.data_width, this.data_height);
    this.canvas_cache = this.matrixConstructor();
  }

  draw_vertex(xy, color_index){
    let y = xy[0]*this.canvas.height/myUI.map_height;
    let x = xy[1]*this.canvas.width/myUI.map_width;
    let r = Math.max(1.5, 0.15 * this.canvas.height/myUI.map_height);

    this.set_color(this.strokeColor, "stroke");
    this.ctx.beginPath();
    this.ctx.lineWidth = Math.max(r*1.9, 1);
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.stroke();  
  }

  erase_vertex_circle(xy){
    let y = xy[0]*this.canvas.height/myUI.map_height;
    let x = xy[1]*this.canvas.width/myUI.map_width;
    let r = Math.max(1.5, 0.15 * this.canvas.height/myUI.map_height);
    if(myUI.map_height>32 || myUI.map_width>32){
      r = Math.min(this.canvas.height/myUI.map_height * 4/16, this.canvas.width/myUI.map_width * 4/16)
    }
    let d = r*2.1;
    this.ctx.clearRect(x-d, y-d, 2*d, 2*d);
  }

  draw_dotted_square(xy){
    let y = xy[0]*this.canvas.height/myUI.map_height;
    let x = xy[1]*this.canvas.width/myUI.map_width;
    let side = this.canvas.height/myUI.map_height;
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
		let x = xy[0]*this.canvas.height/myUI.map_height;
    let y = xy[1]*this.canvas.width/myUI.map_width;
    let side = this.canvas.height/myUI.map_height;

		this.ctx.clearRect(y, x-3, side*1.2, side*1.2);
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

  squareOfPixels(canvas_x, canvas_y) {
    
    var resolution = Math.max(myUI.map_height,myUI.map_width)>472?Math.min(1/(Math.ceil(myUI.map_height/472)),1/(Math.ceil(myUI.map_width/472))):1

    let thickness = Math.floor(472 * 0.03);    
    for (let y = 0; y < thickness; y=y+resolution) {
      for (let x = 0; x < thickness; x = x + resolution) {
        let canvas_x_processed = canvas_x+x
        this._fillEditedCell(canvas_x_processed, canvas_y+y);
      }
    }
  }

  _handleMouseDown(e){
    // this function is bound to the canvas dom element, use this.wrapper to refer to the UICanvas
    
    let canvas_x = Math.floor(e.offsetX/472*myUI.map_height)/myUI.map_height*472;
    let canvas_y = Math.floor(e.offsetY/472*myUI.map_width)/myUI.map_width*472;
   
   
    this.wrapper.squareOfPixels(canvas_x,canvas_y)
    
    this.wrapper.isDrawing = true;
  }

  _handleMouseMove(e){
    // this function is bound to the canvas dom element, use this.wrapper to refer to the UICanvas
    this.canvas_x = Math.floor(e.offsetX/472*myUI.map_height)/myUI.map_height*472;
    this.canvas_y = Math.floor(e.offsetY/472*myUI.map_width)/myUI.map_width*472;
    
    if (this.canvas_x == 300) {
      console.log(this.canvas_x, this.prev_canvas_x);
    } 
    this.wrapper.draw_canvas(deep_copy_matrix(this.wrapper.canvas_cache), `2d`);
    if (this.wrapper.isDrawing) {
      
// balance between interpolation and thickness, speed vs beauty
      if (this.prev_canvas_x) {
        
        let toDrawPoints = getInterpolatedPoints(this.prev_canvas_x, this.prev_canvas_y, this.canvas_x, this.canvas_y)
        toDrawPoints.forEach(p => {
         this.wrapper.squareOfPixels(p.x,p.y)
        })
      }
      
    this.prev_canvas_x = this.canvas_x;
     this.prev_canvas_y = this.canvas_y;
    } 
    
    
    this.wrapper._drawHover(this.canvas_x, this.canvas_y);
    function getInterpolatedPoints(x1, y1, x2, y2) {
      var numPoints = Math.max(Math.abs(x1 - x2)/2, Math.abs(y1 - y2)/2, 1)
      const dx = (x2 - x1) / (numPoints - 1);
      const dy = (y2 - y1) / (numPoints - 1);

      const points = [];
      for (let i = 0; i < numPoints; i++) {
        const x = x1 + i * dx;
        const y = y1 + i * dy;
        points.push({ x, y });
    }

  return points;
}

  }

  _handleMouseUp(e){
    // this function is bound to the canvas dom element, use this.wrapper to refer to the UICanvas
    this.wrapper.isDrawing = false;
    if(this.id=="edit_map"){  //  to save the current state on the screen
      let child = new EditState(myUI.map_edit.curr_state, deep_copy_matrix(this.wrapper.canvas_cache));
      myUI.map_edit.curr_state.child = child;
      myUI.map_edit.curr_state = child;

       this.prev_canvas_x = null;
     this.prev_canvas_y = null;
    }
  }
  
  _handleMouseLeave(e){
    this.wrapper.draw_canvas(deep_copy_matrix(this.wrapper.canvas_cache), `2d`);
  }

  _fillEditedCell(canvas_x, canvas_y){
    let [x, y] = this.scale_coord(canvas_x, canvas_y);
    this.ctx.lineCap = 'round';
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
    if(arguments.length>1 && arguments[1]!==undefined){
      let svg_ids = arguments[1];
      console.log(arguments[1]);
      svg_ids.forEach(id=>{
        this.svgs.push(document.getElementById(id));
      });
      this.svg_index = 0;
    }
    if(this.svgs[0]) this.svgs[0].classList.remove("hidden");

    if(arguments.length>2 && arguments[2]!==undefined){
      this.alts = arguments[2];
    }
  }

  next_svg(){
    // assumes all svgs are hidden except the first one
    this.svgs[this.svg_index].classList.add("hidden");  // hide the current one
    this.svg_index = (this.svg_index+1)%this.svgs.length;  // increment to next svg in list
    this.svgs[this.svg_index].classList.remove("hidden");  // show the next one
    if(this.alts) this.btn.setAttribute("alt", this.alts[this.svg_index]);
  }

  toggle_pressed(){
    this.btn.classList.toggle("pressed");
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

const toggleCollapsible = () => {
  this.classList.toggle("active_Section");
  var content = this.nextElementSibling;
  
  if (content.style.maxHeight){
    content.style.maxHeight = null;
  } 
  else {
    content.style.maxHeight = content.scrollHeight + "px";
  } 
}
for (var i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active_Section");
    
    const content = this.nextElementSibling;
    
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } 
    else {
      content.style.maxHeight = content.scrollHeight + "px";
    } 
    
  });
}

const collapseAllCollapsible =  () => {
  for (var i = 0; i < coll.length; i++) {
  const content = coll[i].nextElementSibling;
   if(coll[i].classList.contains("active_Section"))coll[i].classList.remove("active_Section")
    content.style.maxHeight = null;
  
    
  }
  
}
const expandAllCollapsible =  () => {
  for (var i = 0; i < coll.length; i++) {
  const content = coll[i].nextElementSibling;
   if(coll[i].classList.contains("active_Section"))coll[i].classList.remove("active_Section")
    content.style.maxHeight = content.scrollHeight + "px";
  
    
  }
  
}
const expandSelectedIndex = (x) => {
  collapseAllCollapsible();
  for (var i = 0; i < x.length; i++) {
    coll[x[i]].click();
  }
}


/*
const collapsible = {
  infoPane: document.getElementById("info-pane").getElementsByClassName("collapsible"),
  controls: document.getElementById("controls").getElementsByClassName("collapsible"),
  clearAll: () => {
    this.infoPane.each()
    this.controls.each()
    }

  }

*/
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