

myUI.buttons.download_map_btn.btn.addEventListener("click", e=>{
	let contents = `type octile
height ${myUI.map_arr.length}
width ${myUI.map_arr[0].length}
map\n`;
	myUI.map_arr.forEach(row=>{
		row.forEach(item=>{
			if(item) contents+=`.`;
			else contents+=`@`;
		});
		contents+=`\n`
	});
	download(`saved_map.map`, contents);
});

myUI.buttons.download_scen_btn.btn.addEventListener("click", e=>{
	let contents = "";
	download(`saved_scen.scen`, contents);
});

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}