
function openTab(evt,tableName) {
  /*
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
  */
  
  

  
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
  constructor(tableIdentifier, rowSize){ //input titles of table in string

    this.tableGenerator(tableIdentifier)
    this.tableContainer = document.querySelector('#'+`t${tableIdentifier}`);
    this.button = document.querySelector('#'+`b${tableIdentifier}`);
    this.rows = this.tableContainer.getElementsByClassName('infoTableRow');
    this.tableHeader = this.tableContainer.getElementsByClassName('table_header');
    this.highlightedRows = this.tableContainer.getElementsByClassName('highlighting');
    this.dynamicTable = this.tableContainer.querySelector('.dynamic_table_container');
    this.rowSize = rowSize;
    
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
      temp.className = 'tableHeaderRow'; 
      temp.innerHTML = headers[i];
    }
  }
  setTableActive(){
    this.tableContainer.style.display = "table";
    this.button.classList.add('active');
  }
  rowGenerator(values){
    //var t = document.createElement('table');
    if(values.length!=this.rowSize){
      let msg = 'Wrong Infotable row size';
      alert(msg);
      throw msg;
    }
    var r = document.createElement("TR"); 
    for (let i = 0; i < values.length; i++) { 
      r.insertCell(i).innerHTML = values[i];
    }
    r.classList.add('infoTableRow'); // rmeoved rowId
    return r;
  }
  /*
  inTop(rowId,values){
  
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
  */
  removeAllTableRows(){
		if(this.rows[0]===undefined) return;
		var parentEl = this.rows[0].parentElement;
		while(this.rows.length){
			parentEl.removeChild(this.rows[0])
		}
  }
  removeRowById(Id){
    if (this.tableContainer.getElementsByClassName(Id)[0]){
      var Row = this.tableContainer.getElementsByClassName(Id)[0];
      var parentEl = Row.parentElement;
      parentEl.removeChild(Row);
    }
  }

  getHiglightIndex(){
    return this.highlightRow;
  }

  setHighlightAtIndex(rowIndex){
    rowIndex--;
    for (let i = 0; i <  this.highlightedRows.length; i++) { 
      if( this.highlightedRows[i]){
        this.highlightedRows[i].style.outlineColor = "transparent";
        this.highlightedRows[i].classList.remove('highlighting');
      }
    }
    this.rows[rowIndex].style.outline = "2px solid red";
    this.rows[rowIndex].classList.add("highlighting");
    let prevHighlight = this.highlightRow;
    this.highlightRow = rowIndex+1;
    return prevHighlight;
  }
  
  insertRowAtIndex(rowIndex,values){
    let toHighlight = (rowIndex>0);
    rowIndex = Math.abs(rowIndex)-1;
    //add row at index 0 if there is no other rows
    if(this.rows.length == 0 || rowIndex == 0 ){
       var r = this.rowGenerator(values);
       //r.style.outline = "2px solid red";//highlight latest table added
       this.dynamicTable.prepend(r);
    }
     //add row at end of table
    else if (rowIndex  == this.rows.length ){
      var r = this.rowGenerator(values);
      //r.style.outline = "2px solid red";//highlight latest table added
      this.dynamicTable.append(r);
    } 
   //add row at index by adding after prev index
    else if (rowIndex >this.rows.length ){
      console.log("row index does not yet exist")
      return 0;
    } 
    else{
      var r = this.rowGenerator(values)
      //r.style.outline = "2px solid red";//highlight latest table added
      this.rows[rowIndex-1].after(r); //highlight latest table added  
    }
    if(toHighlight) return this.setHighlightAtIndex(rowIndex+1);
    let prevHighlight = this.highlightRow;
    if(rowIndex+1<=this.highlightRow) ++this.highlightRow; // inserting a row before the highlighted row causes it to shift down by 1
    return prevHighlight;
  }

  eraseRowAtIndex(rowIndex){
    rowIndex = Math.abs(rowIndex)-1;
    if (rowIndex>=this.rows.length || this.rows.length<1){
      console.log("row index does not yet exist")
      return 0;
    } 
    let row = this.rows[rowIndex];
    let data = [];
    for(const el of row.children)
      data.push(el.innerHTML);
    
    let prevHighlight = this.highlightRow;
    if(rowIndex+1<this.highlightRow)this.highlightRow--;
    else if(rowIndex+1==this.highlightRow) this.highlightRow = null;

    row.parentElement.removeChild(row);
    return [data, prevHighlight==rowIndex+1];
  }
  
  flatten(){
    let ret = [this.highlightRow, this.rowSize];
    for(const row of this.rows){
      for(const el of row.children){
        ret.push(el.innerHTML);
        /*
        if(isNaN(el.innerHTML) || !isFinite(el.innerHTML)) ret.push(el.innerHTML);
        else ret.push(Number(el.innerHTML));
        */
      }
    }
    return ret;
  }
}





