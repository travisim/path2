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
	let fileTypes = ["map", "scen", "pathf", "mapnode", "pseudo"];

	const FILES = Array.from(this.files);

	nextFileType(0);

	function nextFileType(idx){
		if(idx>=fileTypes.length) return;
		console.log("CURRENT FILE TYPE: ", fileTypes[idx])
		let fileSelected = false;
		for(const file of FILES){
			if(file.name.endsWith(`.${fileTypes[idx]}`)){
				console.log("FILE MATCHED");
				processNextFile(idx, file);
				fileSelected = true;
				break;
			}
		};
		if(!fileSelected){
			nextFileType(idx + 1);
		}
	}

	function processNextFile(idx, file){
		let fileType = fileTypes[idx];
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
			else if(fileType=="mapnode"){
				myUI.parseNodeMap(contents);
			}
      else if(fileType=="pseudo"){
        console.log(contents);  
      	myUI.PseudoCode.rowGenerator(contents);
				console.log(contents);  
			}
			nextFileType(idx + 1);
		});
		reader.readAsText(file);
	}
}
document.getElementById("fileInput1").addEventListener("change", myUI.fileHandler.handleFiles);
document.getElementById("fileInput2").addEventListener("change", myUI.fileHandler.handleFiles);