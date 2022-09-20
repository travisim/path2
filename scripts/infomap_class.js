//document.getElementById("myCanvas").getContext("2d").getImageData(10, 10, 1, 1).data; //y x 

 myUI.canvases["queue"].ctx.getImageData(10, 10, 1, 1).data;
console.log( myUI.canvases["queue"].ctx.getImageData(0, 0, 16, 16).data);
console.log( myUI.canvases["visited"].ctx.getImageData(0, 0, 16, 16).data);
console.log( myUI.canvases["neighbors"].ctx.getImageData(0, 0, 16, 16).data);
console.log( myUI.canvases["start"].ctx.getImageData(1, 1, 1, 1).data);
//myUI.canvases["neighbors"].ctx.fillRect(1, 1, 1, 1);

myUI.canvases["start"].ctx.fillRect(1, 5, 1, 1);
myUI.canvases["start"].ctx.fillStyle = "rgb(12,34,56)";
console.log( myUI.canvases["start"].ctx.getImageData(1, 5, 1, 1).data);

//myUI.canvases["visited"].ctx.fillRect(1, 1, 1, 1);

/* [
    ["edit_map", "cell", "#000000" ,"#d19b6d", "#AA1945"],
		["hover_map", "cell", "#d19b6d", "#AA1945"],
    ["dotted", "dotted", "hsl(5,74%,55%)"],
    ["bg", "cell", "#000000"],
    ["queue", "cell", "#74fa4c"],
    ["visited", "cell", "hsl(5,74%,85%)", "hsl(5,74%,75%)", "hsl(5,74%,65%)", "hsl(5,74%,55%)", "hsl(5,74%,45%)", "hsl(5,74%,35%)", "hsl(5,74%,25%)", "hsl(5,74%,15%)"], // rgb(221,48,363)
    ["current_XY", "cell", "#34d1ea"],
    ["neighbors", "cell", "#008269"],
    ["path", "cell", "#34d1ea"], //  changed from #E2C2B9
    ["start", "cell", "#96996"],
    ["goal", "cell", "#9f17e7"]
  ]
  */







//Uint8ClampedArray {0: 245, 1: 193, 2: 188, 3: 255}