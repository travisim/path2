// Get the modal
var modal = document.getElementById("edit_map_modal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
myUI.buttons.edit_map_btn.btn.onclick = function() {
  modal.style.zIndex = "100"; // reveal
  document.addEventListener("keydown", undo_edit);
  document.addEventListener("keydown", redo_edit);
  //  to save the current state on the screen
  myUI.map_edit.curr_state = new EditState(null, deep_copy_matrix(myUI.canvases.edit_map.canvas_cache));
}

myUI.close_modal = function(){
  modal.style.zIndex = "-100"; // hide
  myUI.map_arr = deep_copy_matrix(myUI.canvases.edit_map.canvas_cache, flip_bit=true);
  myUI.displayMap();
  document.removeEventListener("keydown", undo_edit);
  document.removeEventListener("keydown", redo_edit);
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

function undo_edit(e){
  e = e || window.event;
  if (e.ctrlKey && e.key === 'z') {
    //alert('Undo!');
    myUI.map_edit.curr_state = myUI.map_edit.curr_state.get_parent();
    myUI.canvases.edit_map.draw_canvas(myUI.map_edit.curr_state.matrix_data, `2d`, false);
  }
}

function redo_edit(e){
  e = e || window.event;
  if (e.ctrlKey && e.key === 'y') {
    //alert('Redo!');
    myUI.map_edit.curr_state = myUI.map_edit.curr_state.get_child();
    myUI.canvases.edit_map.draw_canvas(myUI.map_edit.curr_state.matrix_data, `2d`, false);
  }
}

class EditState{
  
  constructor(parent, matrix_data, child=null){
    this.parent = parent;
    this.matrix_data = matrix_data;
    this.child = child;
  }

  get_parent(){
    if(this.parent==null) return this;
    else return this.parent;
  }

  get_child(){
    if(this.child==null) return this;
    else return this.child;
  }

}
