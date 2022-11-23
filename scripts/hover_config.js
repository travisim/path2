const tooltip_data = document.getElementById("tooltip_data");

myUI.initHover = function(hoverData){
  removeChildren(document.getElementById("tooltip_data"), "div", ["hoverCoord"]);
  for(const obj of hoverData){
    let el = document.createElement("div");
    el.innerHTML = obj.displayName+": ";
    let sp = document.createElement("span");
    sp.id = obj.id;
    sp.innerHTML = "-";
    el.appendChild(sp);
    tooltip_data.appendChild(el);
  }
}