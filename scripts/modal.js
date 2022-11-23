function show_modal(modal){
  ++myUI.top_Z;
	modal.style.zIndex = String(myUI.top_Z); // reveal
  modal.style.display = "block;"
}

function hide_modal(modal){
  --myUI.top_Z;
	modal.style.zIndex = "-100"; // hide
  modal.style.display = "none;"
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
  myUI.displayScen(true, true);
  document.removeEventListener("keydown", modal_await_keypress);
  hide_modal(myUI.modals.edit_map.elem);
}
myUI.modals.edit_map.close_btn.addEventListener("click", myUI.modals.edit_map.close);

window.addEventListener("click", event=>{
	if (event.target == myUI.modals.edit_map.elem)
		myUI.modals.edit_map.close();
});

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
  let bounds = edit_map_ctn.getBoundingClientRect();
	edit_mouse_tip.style.left = e.clientX - bounds.left - 2 + 'px';
  edit_mouse_tip.style.top = e.clientY - bounds.top - 32 + 'px';
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

function updateMapWidth(e){
  if (!e) e = window.event;
  if (e.key == 'Enter' || e.type == 'focusout'){
    myUI.map_width = Number(this.value);
    myUI.canvases.edit_map.scale_canvas(myUI.map_height, myUI.map_width, retain_data = true);
  }
}
myUI.sliders.map_width_slider.label.addEventListener("keydown", updateMapWidth);
myUI.sliders.map_width_slider.label.addEventListener("focusout", updateMapWidth);

function updateMapHeight(e){
  if (!e) e = window.event;
  if (e.key == 'Enter' || e.type == 'focusout'){
    myUI.map_height = Number(this.value);
    myUI.canvases.edit_map.scale_canvas(myUI.map_height, myUI.map_width, retain_data = true);
  }
}
myUI.sliders.map_height_slider.label.addEventListener("keydown", updateMapHeight);
myUI.sliders.map_height_slider.label.addEventListener("focusout", updateMapHeight);

function modal_await_keypress(e){
	e = e || window.event

	if (e.ctrlKey && e.key === 'z') {
    //alert('Undo!');
    myUI.map_edit.curr_state = myUI.map_edit.curr_state.parent;
    myUI.canvases.edit_map.draw_canvas(myUI.map_edit.curr_state.matrix_data, `2d`, false);
  }
	else if (e.ctrlKey && e.key === 'y') {
    //alert('Redo!');
    myUI.map_edit.curr_state = myUI.map_edit.curr_state.child;
    myUI.canvases.edit_map.draw_canvas(myUI.map_edit.curr_state.matrix_data, `2d`, false);
  }
}

class EditState{
  
  constructor(parent, matrix_data, child=null){
    this._parent = parent;
    this.matrix_data = matrix_data;
    this.child = child;
  }

  get parent(){
    return this._parent==null ? this : this._parent;
  }

  get child(){
    return this._child==null ? this : this._child;
  }

  set child(child){
    this._child = child;
  }
}
