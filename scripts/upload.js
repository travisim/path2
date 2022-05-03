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
  let files = dt.files;

	if(files[0].name.endsWith(".map")){
		handleMap(files[0]);
	}
	else if(files[0].name.endsWith(".scen")){
		handleScen(files[0]);
	}
	else{ // if planner 
		//handlePlanner(files[0];)
	}
}


// MAP


/*
function handleMap(file) {
  let reader = new FileReader();

	reader.addEventListener("load", function(e) {
		console.log(e.target.result);
			
		// ADD MAP STUFF HERE
		myUI.parseMap(e.target.result);
		myUI.displayMap();
	})
  
  if(file == null){
    reader.readAsText(this.files[0])
  }
  else{
    reader.readAsText(file);
  }
	
}
*/




function handleMap(file) {
  let reader = new FileReader();

	reader.addEventListener("load", function(e) {
		console.log(e.target.result);
			
		// ADD MAP STUFF HERE
		myUI.parseMap(e.target.result);
		myUI.displayMap();
	})
	reader.readAsText(file);
}

document.getElementById("map_input").addEventListener("change", handleMap1);

function handleMap1(){
    var reader = new FileReader();
   
   
    reader.addEventListener("load", function(e) {
      myUI.parseMap(e.target.result);
  		myUI.displayMap();
    });

    reader.readAsText(this.files[0]);
}





// SCEN



function handleScen(file) {
  let reader = new FileReader();

	reader.addEventListener("load", function(e) {
		console.log(e.target.result);

		// ADD SCEN STUFF HERE
		var contents = e.target.result;
		
		myUI.parseScenario(contents);
		
		myUI.showScenSelection();// shows start and goal
	})
    reader.readAsText(file)
}
document.getElementById("scen_input").addEventListener("change", handleScen1);

function handleScen1() {
  let reader = new FileReader();

	reader.addEventListener("load", function(e) {
		console.log(e.target.result);

		// ADD SCEN STUFF HERE
		var contents = e.target.result;
		
		myUI.parseScenario(contents);
		
		myUI.showScenSelection();// shows start and goal
	})
    reader.readAsText(this.files[0])
}

// PLANNER


