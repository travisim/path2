
function drawAxis(mapHeight = 16, mapWidth = 16) {
     largerDimension = Math.max(myUI.map_width,myUI.map_height);
    if (largerDimension < 32) {



       
        var grid_size = 472 * 2 / largerDimension;
        console.log(myUI.map_width,myUI.map_height,"width height")

        var x_axis_distance_grid_lines = 0;
        var y_axis_distance_grid_lines = 0;
        var x_axis_starting_point = { number: 1, suffix: '' };
        var y_axis_starting_point = { number: 1, suffix: '' };

        var canvas = document.getElementById("my-canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var canvas_width = canvas.width;
        var canvas_height = canvas.height;

        var num_lines_x = Math.floor(canvas_height / grid_size)*(myUI.map_height/largerDimension);
        var num_lines_y = Math.floor(canvas_width / grid_size)* (myUI.map_width/largerDimension);

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
                ctx.moveTo(0, grid_size * i);
                ctx.lineTo(canvas_width, grid_size * i);
            }
            else {
                ctx.moveTo(0, grid_size * i + 0.5);
                ctx.lineTo(canvas_width, grid_size * i + 0.5);
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
                ctx.moveTo(grid_size * i, 0);
                ctx.lineTo(grid_size * i, canvas_height);
            }
            else {
                ctx.moveTo(grid_size * i + 0.5, 0);
                ctx.lineTo(grid_size * i + 0.5, canvas_height);
            }
            ctx.stroke();
        }

        // Translate to the new origin. Now Y-axis of the canvas is opposite to the Y-axis of the graph. So the y-coordinate of each element will be negative of the actual
        ctx.translate(y_axis_distance_grid_lines * grid_size, x_axis_distance_grid_lines * grid_size);

        // Ticks marks along the positive X-axis
        for (i = 1; i < (num_lines_y - y_axis_distance_grid_lines); i++) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ffffff";

            // Draw a tick mark 6px long (-3 to 3)
            ctx.moveTo(grid_size * i + 0.5, -3);
            ctx.lineTo(grid_size * i + 0.5, 3);
            ctx.stroke();

            // Text value at that point

    
            ctx.font = '18px Arial';
            ctx.textAlign = 'start';
            ctx.fillStyle = "#ffffff";
            ctx.fillText(x_axis_starting_point.number * i + x_axis_starting_point.suffix, grid_size * i + 7, 25);
        }

        // Ticks marks along the negative X-axis
        for (i = 1; i < y_axis_distance_grid_lines; i++) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ffffff";

            // Draw a tick mark 6px long (-3 to 3)
            ctx.moveTo(-grid_size * i + 0.5, -3);
            ctx.lineTo(-grid_size * i + 0.5, 3);
            ctx.stroke();

            // Text value at that point
            ctx.font = '18px Arial';
            ctx.textAlign = 'end';
            ctx.fillStyle = "#ffffff";
            ctx.fillText(-x_axis_starting_point.number * i + x_axis_starting_point.suffix, -grid_size * i + 7, 25);
        }

        // Ticks marks along the positive Y-axis
        // Positive Y-axis of graph is negative Y-axis of the canvas
        for (i = 1; i < (num_lines_x - x_axis_distance_grid_lines); i++) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ffffff";

            // Draw a tick mark 6px long (-3 to 3)
            ctx.moveTo(-3, grid_size * i + 0.5);
            ctx.lineTo(3, grid_size * i + 0.5);
            ctx.stroke();

            // Text value at that point
            ctx.font = '18px Arial';
            ctx.textAlign = 'start';
            ctx.fillStyle = "#ffffff";

            ctx.fillText(y_axis_starting_point.number * i + y_axis_starting_point.suffix, 8, grid_size * i + 19);
        }

        // Ticks marks along the negative Y-axis
        // Negative Y-axis of graph is positive Y-axis of the canvas
        for (i = 1; i < x_axis_distance_grid_lines; i++) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#ffffff";

            // Draw a tick mark 6px long (-3 to 3)
            ctx.moveTo(-3, -grid_size * i + 0.5);
            ctx.lineTo(3, -grid_size * i + 0.5);
            ctx.stroke();

            // Text value at that point
            ctx.font = '18px Arial';
            ctx.textAlign = 'start';
            ctx.fillStyle = "#ffffff";

            ctx.fillText(y_axis_starting_point.number * i + y_axis_starting_point.suffix, 8, -grid_size * i + 17);
        }
    }
}