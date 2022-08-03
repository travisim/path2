
class UIInfoTable{
  constructor(slidesID=document.getElementsByClassName("slide")){ //input titles of table in string
    this.slides = slidesID;
  }
  setTableHeader(titles){
    var table = document.getElementById("info_table_header");
    var header = table.createTHead();
    var row = header.insertRow(0);
    for (let i = 0; i < titles.length; i++){
      var temp = row.insertCell(i)
      temp.className = 'table_header_cell'; 
      temp.innerHTML = titles[i];
    }
  }
  
  inTop(rowId,values){
   /*
    var values = [];
    for (let i = 1; i < arguments.length; i++) { 
        values.push(arguments[i]);
    }   */
   //unhighlight second latest table added  
   for (let i = 0; i < document.getElementsByClassName("highlighting").length; i++) { 
     if(document.getElementsByClassName("highlighting")[0]){
       document.getElementsByClassName("highlighting")[0].style.outlineColor = "transparent";
       document.getElementsByClassName("highlighting")[0].classList.remove('highlighting');
     }
   }
    var r = this.rowGenerator(rowId,values);
    r.style.outline = "2px solid red";//highlight latest table added
    document.getElementById("info-container-dynamic").prepend(r);
 
    
    
  }
  inBottom(rowId,values){
    //unhighlight second latest table added  
   for (let i = 0; i < document.getElementsByClassName("highlighting").length; i++) { 
     if(document.getElementsByClassName("highlighting")[0]){
       document.getElementsByClassName("highlighting")[0].style.outlineColor = "transparent";
       document.getElementsByClassName("highlighting")[0].classList.remove('highlighting');
     }
   }
    var r = this.rowGenerator(rowId,values);
    r.style.outline = "2px solid red";//highlight latest table added
    document.getElementById("info-container-dynamic").append(r);

  }
  rowGenerator(rowId,values){
    //var t = document.createElement('table');
    var r = document.createElement("TR"); 
    //t.setAttribute('class', 'slide'); new table automatically set "slide class"
    for (let i = 0; i < values.length; i++) { 
      r.insertCell(i).innerHTML = values[i];
    }
    r.classList.add('slide','highlighting');
    r.setAttribute("id", (rowId).toString());
    return r;
  }
  outBottom(){
    //animates out last slide
    if (this.slides.length >= 1){ 
     // slides[slides.length-1].style.animation = 'out 0.5s forwards';
       //deletes HTML of last table(use arrow function to accept parameters)
     // setTimeout(()=>this.removebyindex(slides.length-1),1000);
      this.removeSlideByIndex(this.slides.length-1)
    }
  }
  outTop = function(){
    //animates out first slide
    if (this.slides.length >= 1){ 
      //slides[0].style.animation = 'out 0.5s forwards';
      //deletes HTML of last table(use arrow function to accept parameters)
     // setTimeout(()=>this.removebyindex(0),1000);
      this.removeSlideByIndex(0)
    }
  };
  insertAfterSlidesIndex(SlidesIndex,rowId,values){
    for (let i = 0; i < document.getElementsByClassName("highlighting").length; i++) { 
      if(document.getElementsByClassName("highlighting")[0]){
        document.getElementsByClassName("highlighting")[0].style.outlineColor = "transparent";
        document.getElementsByClassName("highlighting")[0].classList.remove('highlighting');
      }
    }
    var r = this.rowGenerator(rowId,values)
    r.style.outline = "2px solid red";//highlight latest table added
    this.slides[SlidesIndex].after(r); //highlight latest table added
    
    
  }
  sort(indexOfColumnToBeSorted){
    var table, i, x, y;
  // var slides = document.getElementsByClassName("slide");
    var switching = true;

    // Run loop until no switching is needed
    while (switching) {
      switching = false;
      // Loop to go through all rows
       for (i = 0; i < (slides.length-1); i++){
         var Switch = false;
         // Fetch 2 elements that need to be compared
         x = this.slides[i].cells[indexOfColumnToBeSorted].firstChild.nodeValue;
         y = this.slides[i+1].cells[indexOfColumnToBeSorted].firstChild.nodeValue;
         // Check if 2 rows need to be switched
         if (x > y){
           // If yes, mark Switch as needed and break loop
           Switch = true;
           break;
         }
       }
      if (Switch){
        // Function to switch rows and mark switch as completed
        slides[i+1].after(slides[i]);
        switching = true;
      }
    }
  } 
 
 
  
  removeAllTableSlides(){
    var temp = this.slides.length;// slides.length alawys changes, cannot use
    if(temp != 0){
      var i = temp-1;
      while(i!=-1) { 
        this.removeSlideByIndex(i);
        i--;
      }
    } 
  }
  removeSlideById(Id){
    if (document.getElementById(Id)){
      var slide = document.getElementById(Id);
      var parentEl = slide.parentElement;
      parentEl.removeChild(slide);
    }
  }

  removeSlideByIndex(index){
    var slide = slides[index];
    var parentEl = slide.parentElement;
    parentEl.removeChild(slide)
  }
}

