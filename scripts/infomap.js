 
class UIInfoNWSE{
  constructor(infoNWSE_Id){
    this.element = document.getElementById(infoNWSE_Id);
  }
     
  resetOne(){
  this.element.style.borderColor = "transparent";
  this.element.style.background = "rgb(188,186,201)";
  this.element.style.outlineColor = "black";
  this.element.style.color = "black";
  if (this.element.querySelector(".type")) this.element.querySelector(".type").innerHTML = "";
  this.screenValues.forEach(val=>this.element.querySelector("."+val).innerHTML = "")
  this.drawOrder = 99;
     //reset a square in info map 
  }

  drawOneObstacle(){
    this.element.style.borderColor = "rgb(0,0,0)";
    if (this.element.querySelector(".type")) this.element.querySelector(".type").innerHTML = "Obstacle"; 
    
  }

  drawOneOutOfBounds(){
    this.element.style.borderColor = "transparent";
    this.element.style.background = "transparent";
    this.element.style.outlineColor = "transparent";
    this.element.style.color = "transparent";
  }

  drawOneCanvasBorder(canvasId, xy){
    if(this.drawOrder<myUI.canvases[canvasId].drawOrder) return;
    this.drawOrder = myUI.canvases[canvasId].drawOrder;
    let val = myUI.canvases[canvasId].canvas_cache[xy[0]][xy[1]];
    this.element.style.borderColor = myUI.canvases[canvasId].calc_color(val, val-1);
    if (this.element.querySelector(".type")) this.element.querySelector(".type").innerHTML = canvasId;
  }

  drawOneCanvasValue(canvasId, xy){
    let val = myUI.canvases[canvasId].canvas_cache[xy[0]][xy[1]];
    let qSelector = "."+myUI.canvases[canvasId].infoMapValue;
    if(val==Number.POSITIVE_INFINITY) this.element.querySelector(qSelector).innerHTML = "inf";
    else this.element.querySelector(qSelector).innerHTML = +val.toFixed(2);
  }
}





class UIInfoMap{
  reset(){
   myUI.planner.deltaNWSE.forEach(deltaNWSE => {myUI.InfoNWSE[deltaNWSE].resetOne();
  }); //reset obstacles in info map 

  }

  drawGeneral(x,y,drawName,canvasId){
    for (let i = 0; i < myUI.planner.num_neighbors; ++i) { 
      var next_XY_temp = [ x + myUI.planner.delta[i][0], y + myUI.planner.delta[i][1]];
      if (next_XY_temp[0] < 0 || next_XY_temp[0] >= myUI.planner.map_height || next_XY_temp[1] < 0 || next_XY_temp[1] >= myUI.planner.map_width){
        if(drawName=="outOfBound") myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneOutOfBounds();
        continue;
      }
      if(drawName=="bg" && myUI.canvases[drawName].canvas_cache[next_XY_temp[0]] && myUI.canvases[drawName].canvas_cache[next_XY_temp[0]][next_XY_temp[1]]>0){
        myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneObstacle();  
      }
      else if(canvasId && myUI.canvases[canvasId] && myUI.canvases[canvasId].canvas_cache[next_XY_temp[0]] && myUI.canvases[canvasId].canvas_cache[next_XY_temp[0]][next_XY_temp[1]]>0){
        if(drawName=="border") myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneCanvasBorder(canvasId, next_XY_temp); 
        else if(drawName=="value") myUI.InfoNWSE[myUI.planner.deltaNWSE[i]].drawOneCanvasValue(canvasId, next_XY_temp); 
      }
    }
  }

  drawObstacle(x,y){
    this.drawGeneral(x,y,"bg");
  }
  drawOutOfBound(x,y){
    this.drawGeneral(x,y,"outOfBound");   
  }
  drawCanvasBorder(x,y,canvasId){
    this.drawGeneral(x,y,"border",canvasId);
  }
  drawCanvasValue(x,y,canvasId){
    this.drawGeneral(x,y,"value",canvasId);
  }

  CanvasMode(planner='none', canvases){
    var infoMapInnerHTML = ["<section>"];
    if(planner=="none"){
      document.getElementById("infomap").style.display = "none";
      document.getElementById("infodivider").style.display = "none";
    }
    let screenValues = [];
    for(const uiCanvas of canvases){
      if(uiCanvas.infoMapValue){
        infoMapInnerHTML.push(`<div>${uiCanvas.infoMapValue}:&nbsp<span class="${uiCanvas.infoMapValue}"></span></div>`);
        screenValues.push(uiCanvas.infoMapValue);
      }
    }
    infoMapInnerHTML[infoMapInnerHTML.length-1] = infoMapInnerHTML[infoMapInnerHTML.length-1].slice(5, -6);
    //infoMapInnerHTML.push(`Type:&nbsp<span class="type"></span></section>`);
    var infoMapInnerHTMLStr = infoMapInnerHTML.join("");
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
      document.getElementById(infoNWSE_Id).innerHTML = infoMapInnerHTMLStr;
      myUI.InfoNWSE[infoNWSE_Id].screenValues = screenValues;
    //initialise html for info squares as well
      });
  }

  NumneighborsMode(num_neighbors=8){
   if (num_neighbors == 8){
    [
  		["NE"],
      ["SE"],
      ["SW"],
      ["NW"] 
      ].forEach(item=>{
      let element = document.getElementById(item[0]);
      element.style.borderColor = "transparent";
      element.style.background = "rgb(188,186,201)";
      element.style.outlineColor = "black";
      element.style.color = "black";
      if (element.querySelector(".type")) element.querySelector(".type").innerHTML = "";
      if (element.querySelector(".F"))  element.querySelector(".F").innerHTML = "";
      if (element.querySelector(".G"))  element.querySelector(".G").innerHTML = "";
      if (element.querySelector(".H"))  element.querySelector(".H").innerHTML = "";
      });
    }
   else  if (num_neighbors == 4){
      [
  		["NE"],
      ["SE"],
      ["SW"],
      ["NW"] 
      ].forEach(item=>{
      let element = document.getElementById(item[0]);
      element.style.borderColor = "transparent";
      element.style.background = "transparent";
      element.style.outlineColor = "transparent";
      element.style.color = "transparent";
      });
    }
  }

}


var UIInfoCurrent = {
  DrawCurrent(x,y){
    x = x === undefined ? '-' : x;
    y = y===undefined ? '-' : y;
    document.getElementById("currentXY").innerHTML =  "( "+x+", "+y+")"; // flipped x and y because of matrix transformation
  }
}




document.getElementById("currentXY").innerHTML = "(_, _)"; 