
function openTab(evt,tableName) {
  console.log(evt,"evt")
  //remove all previosly displayed tabs
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  //remove tab highlight by removing all classes that are set as "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  
  
  

  
  if( document.getElementById(tableName).style.display != "table"){
    //highlight tab by seting id as active
    document.getElementById(tableName).style.display = "table";
    evt.currentTarget.className += " active";
  }
  else{
    document.getElementById(tableName).style.display = "none";
    evt.currentTarget.className.replace(" active", "");
  }

}







/*var tableid = "7"
document.querySelector(`#t${tableid}`).getElementsByClassName('5')[0].innerHTML = "hi"; 
/*
const div = document.createElement("div");
div.setAttribute("id", "t2");
div.innerHTML = "   <div class='table_title'>Queue</div> 
<table class = 'table_header'> </table> 
<div  class='info_Table_Scroll' >
  <table class='dynamic_table_container'> </table>
</div> ";

document.getElementById("info-container").append(div);
*/


class UIInfoTable{
  constructor(tableIdentifier){ //input titles of table in string
     this.tableGenerator(tableIdentifier)
    this.tableContainer = document.querySelector('#'+`t${tableIdentifier}`);
   this.button = document.querySelector('#'+`b${tableIdentifier}`);
    this.rows = this.tableContainer.getElementsByClassName('row');
    this.tableHeader = this.tableContainer.getElementsByClassName('table_header');
    this.highlightedRows = this.tableContainer.getElementsByClassName('highlighting');
    this.dynamicTable = this.tableContainer.querySelector('.dynamic_table_container');
    
    //querySelector returns 1 element but getElementsByClassName returns array of elements
  }
  
  tableGenerator(tableIdentifier){
    const div = document.createElement("div");
    div.setAttribute("id", `t${tableIdentifier}`);
    div.setAttribute("class", 'tabcontent');
    div.innerHTML = `   <div class='table_title'>${tableIdentifier}</div>  <table class = 'table_header'> </table> <div  class='info_Table_Scroll' ><table class='dynamic_table_container'> </table> </div> `;
    document.getElementById("info-tables-dynamic").append(div);
    
    const button = document.createElement("button");
    button.setAttribute("id", `b${tableIdentifier}`);
    button.setAttribute("class", 'tablinks');
    button.setAttribute("onclick", `openTab(event, "t${tableIdentifier}")`);
    button.innerHTML = `${tableIdentifier}`;
    document.querySelector(".tab").append(button);
    
  }
  setTableHeader(headers){
    var header = this.tableHeader[0].createTHead();
    var row = header.insertRow(0);
    for (let i = 0; i < headers.length; i++){
      var temp = row.insertCell(i)
      temp.className = 'table_header_cell'; 
      temp.innerHTML = headers[i];
    }
  }

  setTableActive(){
    this.tableContainer.style.display = "table";
    this.button.className += " active";
  }
  inTop(rowId,values){
   /*
    var values = [];
    for (let i = 1; i < arguments.length; i++) { 
        values.push(arguments[i]);
    }   */
   //unhighlight second latest table added  
   for (let i = 0; i < this.highlightedRows.length; i++) { 
     if(this.highlightedRows[0]){
       this.highlightedRows[0].style.outlineColor = "transparent";
       this.highlightedRows[0].classList.remove('highlighting');
     }
   }
    var r = this.rowGenerator(rowId,values);
    r.style.outline = "2px solid red";//highlight latest table added
    this.dynamicTable.prepend(r);
 
    
    
  }
  inBottom(rowId,values){
    //unhighlight second latest table added  
      for (let i = 0; i < this.highlightedRows.length; i++) { 
     if(this.highlightedRows[0]){
       this.highlightedRows[0].style.outlineColor = "transparent";
       this.highlightedRows[0].classList.remove('highlighting');
     }
   }
    var r = this.rowGenerator(rowId,values);
    r.style.outline = "2px solid red";//highlight latest table added
    console.log(r);
    this.dynamicTable.append(r);

  }
  rowGenerator(rowId,values){
    //var t = document.createElement('table');
    var r = document.createElement("TR"); 
    for (let i = 0; i < values.length; i++) { 
      r.insertCell(i).innerHTML = values[i];
    }
    r.classList.add('row','highlighting',(rowId).toString());
    return r;
  }
  outBottom(){
    //animates out last row
    if (this.rows.length > 0){ 
      this.removeRowByIndex(this.rows.length-1)
    }
  }
  outTop = function(){
    //animates out first slide
    if (this.rows.length >= 1){ 
      this.removeRowByIndex(0)
    }
  };
  insertRowAfterIndex(rowIndex,rowId,values){
    for (let i = 0; i <  this.highlightedRows.length; i++) { 
      if( this.highlightedRows[i]){
         this.highlightedRows[i].style.outlineColor = "transparent";
         this.highlightedRows[i].classList.remove('highlighting');
      }
    }
    var r = this.rowGenerator(rowId,values)
    r.style.outline = "2px solid red";//highlight latest table added
    this.dynamicTable.append(r); // to allow next line to work
    this.rows[rowIndex].after(r); //highlight latest table added
  }
  sort(indexOfColumnToBeSorted=3){
   if(this.rows.length > 1){
      var table, i, x, y;
      var switching = true;
  
      // Run loop until no switching is needed
      while (switching) {
        switching = false;
        // Loop to go through all rows
         for (i = 0; i < (this.rows.length-1); i++){
           var Switch = false;
           // Fetch 2 elements that need to be compared
           x = this.rows[i].cells[indexOfColumnToBeSorted].firstChild.nodeValue;
           y = this.rows[i+1].cells[indexOfColumnToBeSorted].firstChild.nodeValue;
           // Check if 2 rows need to be switched
           if (x > y){
             // If yes, mark Switch as needed and break loop
             Switch = true;
             break;
           }
         }
        if (Switch){
          // Function to switch rows and mark switch as completed
          this.rows[i+1].after(this.rows[i]);
          switching = true;
        }
      }
    }
  } 
  removeAllTableRows(){
    var temp = this.rows.length;// rows.length alawys changes, cannot use
    if(temp != 0){
      var i = temp-1;
      while(i!=-1) { 
        this.removeRowByIndex(i);
        i--;
      }
    } 
  }
  removeRowById(Id){
    if (this.tableContainer.getElementsByClassName(Id)[0]){
      var Row = this.tableContainer.getElementsByClassName(Id)[0];
      var parentEl = Row.parentElement;
      parentEl.removeChild(Row);
    }
  }
  removeRowByIndex(index){
    var row = this.rows[index];
    var parentEl = row.parentElement;
    parentEl.removeChild(row)
  }
}





