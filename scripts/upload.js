let dropAreas = document.getElementsByClassName('upload');

for (let i=0;i<dropAreas.length;++i){
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
}

// GENERAL
myUI.fileHandler = {}

myUI.fileHandler.handleFiles = function (){
	// takes first map, scen & path file
	let found = {map: false, scen: false, pathf: false, json: false}
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

	function processFile(fileType, file){
		let reader = new FileReader();

		reader.addEventListener("load", function(e) {
			let contents = e.target.result;

			if(fileType=="map"){
				myUI.parseMap(contents, file.name);
  			myUI.displayMap();
			}
			else if(fileType=="scen"){
				myUI.parseScenario(contents);
				myUI.loadScenario();// shows start and goal
			}
			else if(fileType=="pathf"){ // pathf
				myUI.showPlanners();
			}
			else if(fileType=="json"){
				myUI.parseCustom(contents);
			}
		});
		reader.readAsText(file);
	}
}
document.getElementById("fileInput1").addEventListener("change", myUI.fileHandler.handleFiles);
document.getElementById("fileInput2").addEventListener("change", myUI.fileHandler.handleFiles);