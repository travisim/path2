// Get the modal
var modal = document.getElementById("edit_map_modal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
myUI.buttons.edit_map_btn.btn.onclick = function() {
  modal.style.zIndex = "100"; // reveal
}

myUI.close_modal = function(){
  modal.style.zIndex = "-100"; // hide
  myUI.map_arr = deep_copy_matrix(myUI.canvases.edit_map.virtualCanvas, flip_bit=true);
  myUI.displayMap();
}

// When the user clicks on <span> (x), close the modal
span.onclick = myUI.close_modal;

// When the user clicks anywhere outside of the mdal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    myUI.close_modal();
  }
}

myUI.update_map_width = function(val){
  myUI.map_width = val;
  myUI.canvases.edit_map.scale_canvas(myUI.map_height, myUI.map_width, retain_data = true);
}

myUI.sliders.map_width_slider.elem.oninput = function(){
  this.parent.label.value = this.value;
  myUI.update_map_width(this.value);
}

myUI.sliders.map_width_slider.label.onkeypress = function(e){
  if (!e) e = window.event;
  var keyCode = e.code || e.key;
  if (keyCode == 'Enter'){
    this.parent.elem.value = this.value;
    myUI.update_map_width(this.value);
  }
}

myUI.update_map_height = function(val){
  myUI.map_height = val;
  myUI.canvases.edit_map.scale_canvas(myUI.map_height, myUI.map_width, retain_data = true);
}

myUI.sliders.map_height_slider.elem.oninput = function(){
  this.parent.label.value = this.value;
  myUI.update_map_height(this.value);
}

myUI.sliders.map_height_slider.label.onkeypress = function(e){
  if (!e) e = window.event;
  var keyCode = e.code || e.key;
  if (keyCode == 'Enter'){
    this.parent.elem.value = this.value;
    myUI.update_map_height(this.value);
  }
}