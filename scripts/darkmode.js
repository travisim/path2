var x = 0
function darkmode(){
  if (x == 0){
    x++;
    document.getElementById('darkmode').innerHTML = `
 
html {
    background-color: #000000 !important;
}
html {
    /*! color-scheme: dark !important; */
}
html, body, input, textarea, select, button {
    background-color: #000000;
}
html, body, input, textarea, select, button {
    border-color: #41392b;
    color: #c5c3c0;
}
a {
    color: #0063d8;
}
table {
    border-color: #1f272a;
}
::placeholder {
    color: #888176;
}
input:-webkit-autofill,
textarea:-webkit-autofill,
select:-webkit-autofill {
    background-color: #080c00 !important;
    color: #c5c3c0 !important;
}
::selection {
    background-color: #001780 !important;
    color: #c5c3c0 !important;
}
::-moz-selection {
    background-color: #001780 !important;
    color: #c5c3c0 !important;
}
    `;
   //document.getElementById("MyId").className = "dark";

  }
   else if (x == 1){
    x--;
    document.getElementById('darkmode').innerHTML = ''
   //document.getElementById("MyId").className = "light";
  } 
}
