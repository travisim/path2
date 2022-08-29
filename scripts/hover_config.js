myUI.initHover = function(hoverData){
  for(const obj of hoverData){
    
    let el = document.createElement("div");
    el.innerHTML = obj.name;
    for(const t of obj.tags){
      let ch = document.createElement("span");
      ch.id = `hover_${obj.t}`;
      el.appendChild(ch);
      el.innerHTML += ' - ';
    }
    tooltip_data.appendChild(el);
  }
}