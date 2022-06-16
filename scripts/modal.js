function show_modal(modal){
	modal.style.zIndex = "100"; // reveal
  modal.style.display = "block";
}

function hide_modal(modal){
	modal.style.zIndex = "-100"; // hide
  modal.style.display = "none";
}

myUI.modals.edit_map.show = function(){
  show_modal(myUI.modals.edit_map.elem);
  document.addEventListener("keydown", modal_await_keypress);
  //  to save the current state on the screen
  myUI.map_edit.curr_state = new EditState(null, deep_copy_matrix(myUI.canvases.edit_map.canvas_cache));
}

// When the user clicks on the button, open the modal
myUI.buttons.edit_map_btn.btn.addEventListener("click", myUI.modals.edit_map.show);

myUI.modals.edit_map.close = function(){
	myUI.map_arr = deep_copy_matrix(myUI.canvases.edit_map.canvas_cache, flip_bit=true);
  myUI.displayMap();
  document.removeEventListener("keydown", modal_await_keypress);
  hide_modal(myUI.modals.edit_map.elem);
}
myUI.modals.edit_map.close_btn.addEventListener("click", myUI.modals.edit_map.close);

myUI.modals.edit_map.elem.style.display = "none";

window.addEventListener("click", event=>{
	if (event.target == myUI.modals.edit_map.elem)
		myUI.modals.edit_map.close();
});


/*/ When the user clicks on the button, open the modal
myUI.buttons.edit_map_btn.btn.onclick = function() {
	var modal = myUI.modals.edit_map.elem;
  modal.style.zIndex = "100"; // reveal
  modal.style.display = "block";
  document.addEventListener("keydown", modal_await_keypress);
  //  to save the current state on the screen
  myUI.map_edit.curr_state = new EditState(null, deep_copy_matrix(myUI.canvases.edit_map.canvas_cache));
}

myUI.close_modal = function(){
	var modal = myUI.modals.edit_map.elem;
  myUI.map_arr = deep_copy_matrix(myUI.canvases.edit_map.canvas_cache, flip_bit=true);
  myUI.displayMap();
  document.removeEventListener("keydown", modal_await_keypress);
  modal.style.zIndex = "-100"; // hide
  modal.style.display = "none";
}

// When the user clicks on <span> (x), close the modal
span.onclick = myUI.close_modal;

// When the user clicks anywhere outside of the mdal, close it
window.onclick = function(event) {
  if (event.target == myUI.modals.edit_map.elem) {
    myUI.close_modal();
  }
}*/

let edit_map_ctn = document.getElementById("edit_map_ctn");
let edit_mouse_tip = document.getElementById("edit_mouse_tip");
edit_map_ctn.addEventListener("mouseenter", e=>{
  edit_mouse_tip.style.display = "block";
  edit_map_ctn.style.cursor = "none";
});

edit_map_ctn.addEventListener("mouseleave", e=>{
  edit_map_ctn.style.cursor = "auto";
	edit_mouse_tip.style.display = "none";
  
});

edit_map_ctn.addEventListener("mousemove", e=>{
  edit_mouse_tip.style.cursor = "none"
	edit_mouse_tip.style.left = e.offsetX + 2 + 'px';
  edit_mouse_tip.style.top = e.offsetY - 32 + 'px';
});

myUI.toggleDrawErase = function(){
	myUI.buttons.draw_erase_btn.next_svg();
  let erase_el = document.getElementById("erase_marker");
  let draw_el = document.getElementById("draw_marker");
	if(myUI.canvases.edit_map.toggle_draw_erase()){
    // erasing now
    erase_el.style.display = "block";
    draw_el.style.display = "none";
  }
  else{
    // drawing now
    erase_el.style.display = "none";
    draw_el.style.display = "block";
  };
}
myUI.buttons.draw_erase_btn.btn.addEventListener("click", myUI.toggleDrawErase);

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

function modal_await_keypress(e){
	e = e || window.event

	if (e.ctrlKey && e.key === 'z') {
    //alert('Undo!');
    myUI.map_edit.curr_state = myUI.map_edit.curr_state.get_parent();
    myUI.canvases.edit_map.draw_canvas(myUI.map_edit.curr_state.matrix_data, `2d`, false);
  }
	else if (e.ctrlKey && e.key === 'y') {
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
