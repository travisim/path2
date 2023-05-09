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

class Modal{
  constructor(elem_id, open_elem_id, close_elem_id, open_callback, close_callback){
    let elem = document.getElementById(elem_id);
    this.open_btn = document.getElementById(open_elem_id);
    this.close_btn = document.getElementById(close_elem_id);

    function show(){
      show_modal(elem);
      if(open_callback) open_callback();
    }

    function hide(){
      if(close_callback) close_callback();
      hide_modal(elem);
    }
    
    this.open_btn.addEventListener("click", show);
    this.close_btn.addEventListener("click", hide);
    // by default, clicking outside the modal will close it
    window.addEventListener("click", event=>{
      if (event.target == elem)
        hide();
    });
  }
}

function edit_map_open(){
  document.addEventListener("keydown", map_edit_await_keypress);
  document.addEventListener("wheel", map_edit_await_wheel, {passive: false});
  //  to save the current state on the screen
  myUI.map_edit.curr_state = new EditState(null, deep_copy_matrix(myUI.canvases.edit_map.canvas_cache));
}

function edit_map_close(){
  myUI.map_arr = deep_copy_matrix(myUI.canvases.edit_map.canvas_cache, flip_bit=true);
  myUI.displayMap();
  myUI.displayScen(true, true);
  document.removeEventListener("keydown", map_edit_await_keypress);
  document.removeEventListener("wheel", map_edit_await_wheel, {passive: false});
}

function planner_config_open(){
  myUI.stop_animation(change_svg = true);
}

function planner_config_close(){

}