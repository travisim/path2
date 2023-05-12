function updateComputeProgress(){
  const progressBar = document.getElementById("compute_progress");
  const progressBarText = progressBar.firstElementChild;
  const progressBarContainer = progressBar.parentElement;

  progressBarText.style.display = "none";
  progressBar.style.backgroundColor = "#e76f51";
  progressBarContainer.style.boxShadow = "0 0 5px #e76f51"; 

  const progressBarStates = [7, 27, 34, 68, 80];

  gsap.to(progressBar, {
    width: `0%`,
    duration: 0,
  });

  let time = 0;
  // let endState = 80;
  // progressBar.classList.add("animate-width");

  myUI.progressTimers = [];
  progressBarStates.forEach(state => {
    let interval = 200;
    myUI.progressTimers.push(setTimeout(() => {
      // document.querySelector(":root").style.setProperty("--end-pct", state+"%");
      // document.querySelector(":root").style.setProperty("--start-pct", state+"%");
      // if(state == endState){
      //   progressBar.style.width = endState + "%";
      //   progressBar.classList.remove("animate-width");
      // }

      gsap.to(progressBar, {
        width: `${state}%`,
        duration: 0.5,
        ease:"slow"
          
        });
    }, interval + time));
    time += interval;
  });

  myUI.interval = setInterval(function(){
		document.getElementById("compute_progress_label").innerHTML = `${(Date.now()-myUI.startTime)/1000.0}s`;
	}, 50);
}

function setComputeFinish(){
  const progressBar = document.getElementById("compute_progress");
  const progressBarText = progressBar.firstElementChild;
  const progressBarContainer = progressBar.parentElement;

  for(const timer of myUI.progressTimers) clearTimeout(timer);

  gsap.to(progressBar, {
    width: `100%`,

    duration: 0.5,
    ease:"slow",
    backgroundColor: '#4895ef',
    onComplete: () => {
      progressBarText.style.display = "initial";
      progressBarText.innerHTML = "Computed path";
      progressBarContainer.style.boxShadow = '0 0 5px #4895ef';
    }
  });

  clearInterval(myUI.interval);
  document.getElementById("compute_progress_label").innerHTML = `${myUI.searchDuration}ms`;
}

function updateOptimizeProgress(percent){
  const progressBar = document.getElementById("optimize_progress");
  const progressBarText = progressBar.firstElementChild;
  const progressBarContainer = progressBar.parentElement;

  progressBar.style.backgroundColor = "#e76f51";
  progressBarText.style.display = "none";
  progressBarContainer.style.boxShadow = "0 0 5px #e76f51"; 

  gsap.to(progressBar, {
    width: `${percent}%`,
    duration: 0,
    ease:"slow"
  });

  document.getElementById("optimize_progress_label").innerHTML = `${percent.toPrecision(3)}%`;
}

function setOptimizeFinish(){
  const progressBar = document.getElementById("optimize_progress");
  const progressBarText = progressBar.firstElementChild;
  const progressBarContainer = progressBar.parentElement;

  gsap.to(progressBar, {
    width: `100%`,
    duration: 0.5,
    backgroundColor: '#4895ef',
    ease:"slow",
    onComplete: () => {
      progressBarText.style.display = "initial";
      progressBarText.innerHTML = "Optimized path";
      progressBarContainer.style.boxShadow = '0 0 5px #4895ef';
    }
  });

  document.getElementById("optimize_progress_label").innerHTML = `${myUI.genDuration}ms`;
}