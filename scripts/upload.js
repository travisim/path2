let dropAreas = document.getElementsByClassName('upload');

for (var i=0;i<dropAreas.length;++i){
	let area = dropAreas[i];
	try {
		['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		  area.addEventListener(eventName, preventDefaults, false);
		})
		
		function preventDefaults (e) {
		  e.preventDefault();
		  e.stopPropagation();
		}
		
		['dragenter', 'dragover'].forEach(eventName => { 
		  area.addEventListener(eventName, highlight, false);
		});
		
		['dragleave', 'drop'].forEach(eventName => {
		  area.addEventListener(eventName, unhighlight, false);
		});
		
		function highlight(e) {
		  area.classList.add('highlight');
		}
		
		function unhighlight(e) {
		  area.classList.remove('highlight');
		}

		area.addEventListener('drop', handleDrop, false);
	
	} catch (error) {
		console.log(error);
		console.log(area);
	}
	
}

function handleDrop(e) {
  let dt = e.dataTransfer;
	myUI.fileHandler.files = dt.files;
	myUI.fileHandler.handleFiles();
	/*
	if(files[0].name.endsWith(".map")){
		handleMap(files[0]);
	}
	else if(files[0].name.endsWith(".scen")){
		handleScen(files[0]);
	}
	else{ // if planner 
		//handlePlanner(files[0];)
	}
	*/
}

// GENERAL
myUI.fileHandler = {}

myUI.fileHandler.handleFiles = function (){
	// takes first map, scen & path file
	let found = {map: false, scen: false, pathf: false}
	Object.keys(found).forEach(key=>{
		for(let i=0;i<this.files.length;++i){
			if(this.files[i].name.endsWith(`.${key}`)){
				if(found[key]) continue;
				else{
					found[key] = true;
					processFile(key, this.files[i]);
				}
			}
		}
	});

	function processFile(file_type, file){
		let reader = new FileReader();

		reader.addEventListener("load", function(e) {
			let contents = e.target.result;

			if(file_type=="map"){
				myUI.parseMap(contents);
  			myUI.displayMap();
			}
			else if(file_type=="scen"){
				myUI.parseScenario(contents);
				myUI.showScenSelection();// shows start and goal
			}
			else if(file_type=="pathf"){ // pathf

			}
		});
		reader.readAsText(file);
	}
}
document.getElementById("file_input").addEventListener("change", myUI.fileHandler.handleFiles);