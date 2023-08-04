
function drawAxis(mapHeight = 16, mapWidth = 16) {
    largerDimension = Math.max(myUI.map_width, myUI.map_height);
    
    if (true) {



       
        var largerDimensionOfGrid = 472 * 2 / largerDimension;
        var grid_size_Y = largerDimensionOfGrid;
        var grid_size_X = largerDimensionOfGrid;

        console.log(myUI.map_width,myUI.map_height,"width height")

        
        var canvas = document.getElementById("my-canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        
        var canvas_width = canvas.width;
        var canvas_height = canvas.height;
        
        var temp_num_lines_x = Math.floor(canvas_height / largerDimensionOfGrid) * (myUI.map_height / largerDimension);
        scaleObjY = reduceBelowXbyDividingK(temp_num_lines_x, 5, 20)
        var num_lines_x = scaleObjY.new_x
        grid_size_Y = grid_size_Y * scaleObjY.cnt
        
        var temp_num_lines_y = Math.floor(canvas_width / largerDimensionOfGrid) * (myUI.map_width / largerDimension);
        scaleObjX = reduceBelowXbyDividingK(temp_num_lines_y, 5, 20)
        var num_lines_y = scaleObjX.new_x
        grid_size_X = grid_size_X * scaleObjX.cnt

        var x_axis_distance_grid_lines = 0;
        var y_axis_distance_grid_lines = 0;
        var x_axis_starting_point = { number: scaleObjX.cnt, suffix: '' };
        var y_axis_starting_point = { number: scaleObjY.cnt, suffix: '' };
        // var temp_num_lines_y = Math.floor(canvas_width / grid_size_Y) * (myUI.map_width / largerDimension);
        // var num_lines_y = Math.floor(canvas_width / grid_size_X)* (myUI.map_width/largerDimension);

        // Draw grid lines along X-axis
        for (var i = 0; i <= num_lines_x; i++) {
            ctx.beginPath();
            ctx.lineWidth = 1;
    
            // If line represents X-axis draw in different color
            if (i == x_axis_distance_grid_lines)
                ctx.strokeStyle = "#ffffff";
            else
                ctx.strokeStyle = "#e9e9e9";
    
            if (i == num_lines_x) {
                ctx.moveTo(0, grid_size_Y * i);
                ctx.lineTo(canvas_width, grid_size_Y * i);
            }
            else {
                ctx.moveTo(0, grid_size_Y * i + 0.5);
                ctx.lineTo(canvas_width, grid_size_Y * i + 0.5);
            }
            ctx.stroke();
        }

        // Draw grid lines along Y-axis
        for (i = 0; i <= num_lines_y; i++) {
            ctx.beginPath();
            ctx.lineWidth = 1;
    
            // If line represents X-axis draw in different color
            if (i == y_axis_distance_grid_lines)
                ctx.strokeStyle = "#ffffff";
            else
                ctx.strokeStyle = "#e9e9e9";
    
            if (i == num_lines_y) {
                ctx.moveTo(grid_size_X * i, 0);
                ctx.lineTo(grid_size_X * i, canvas_height);
            }
            else {
                ctx.moveTo(grid_size_X * i + 0.5, 0);
                ctx.lineTo(grid_size_X * i + 0.5, canvas_height);
            }
            ctx.stroke();
        }

        // Translate to the new origin. Now Y-axis of the canvas is opposite to the Y-axis of the graph. So the y-coordinate of each element will be negative of the actual
        ctx.translate(y_axis_distance_grid_lines * grid_size_Y, x_axis_distance_grid_lines * grid_size_X);

        // Ticks marks along the positive X-axis
        for (i = 1; i < (num_lines_y - y_axis_distance_grid_lines); i++) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ffffff";

            // Draw a tick mark 6px long (-3 to 3)
            ctx.moveTo(grid_size_X * i + 0.5, -3);
            ctx.lineTo(grid_size_X * i + 0.5, 3);
            ctx.stroke();

            // Text value at that point

    
            ctx.font = '18px Arial';
            ctx.textAlign = 'start';
            ctx.fillStyle = "#ffffff";
            ctx.fillText(x_axis_starting_point.number * i + x_axis_starting_point.suffix, grid_size_X * i + 7, 25);
        }

        // Ticks marks along the negative X-axis
        for (i = 1; i < y_axis_distance_grid_lines; i++) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ffffff";

            // Draw a tick mark 6px long (-3 to 3)
            ctx.moveTo(-grid_size_X * i + 0.5, -3);
            ctx.lineTo(-grid_size_X * i + 0.5, 3);
            ctx.stroke();

            // Text value at that point
            ctx.font = '18px Arial';
            ctx.textAlign = 'end';
            ctx.fillStyle = "#ffffff";
            ctx.fillText(-x_axis_starting_point.number * i + x_axis_starting_point.suffix, -grid_size_X * i + 7, 25);
        }

        // Ticks marks along the positive Y-axis
        // Positive Y-axis of graph is negative Y-axis of the canvas
        for (i = 1; i < (num_lines_x - x_axis_distance_grid_lines); i++) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ffffff";

            // Draw a tick mark 6px long (-3 to 3)
            ctx.moveTo(-3, grid_size_Y * i + 0.5);
            ctx.lineTo(3, grid_size_Y * i + 0.5);
            ctx.stroke();

            // Text value at that point
            ctx.font = '18px Arial';
            ctx.textAlign = 'start';
            ctx.fillStyle = "#ffffff";

            ctx.fillText(y_axis_starting_point.number * i + y_axis_starting_point.suffix, 8, grid_size_Y * i + 19);
        }

        // Ticks marks along the negative Y-axis
        // Negative Y-axis of graph is positive Y-axis of the canvas
        for (i = 1; i < x_axis_distance_grid_lines; i++) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ffffff";

            // Draw a tick mark 6px long (-3 to 3)
            ctx.moveTo(-3, -grid_size_Y * i + 0.5);
            ctx.lineTo(3, -grid_size_Y * i + 0.5);
            ctx.stroke();

            // Text value at that point
            ctx.font = '18px Arial';
            ctx.textAlign = 'start';
            ctx.fillStyle = "#ffffff";

            ctx.fillText(y_axis_starting_point.number * i + y_axis_starting_point.suffix, 8, -grid_size_Y * i + 17);
        }
    }
}
function reduceBelowXbyDividingK(x, k, max) {
    cnt = 1
    while (true) {
        if (x < max) {
            console.log(x, "x")
            return {
                new_x: x,
                cnt: cnt
                
            }
            // x = x / k
            
        }
        x = Math.floor(x / k)
        cnt = cnt*k
    }

    
}