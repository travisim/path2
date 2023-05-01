
class predefinedMaps{

    constructor(){ //input titles of table in string
// document.getElementById(map_config).append
    
  }
   static empty(width, height) {
      
        // Create a 2D array of black pixels
        const pixels = new Array(height).fill('.').map(() => new Array(width).fill('.'));  
        return pixels;
    }
    static circle(width, height) {
        // Calculate the center of the circle
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
  
        // Create a 2D array of black pixels
        const pixels = new Array(height).fill('.').map(() => new Array(width).fill('.'));
  
        // Loop through each pixel in the array and check if it's inside the circle
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const distanceFromCenter = (Math.sqrt(Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2)) * 2);
                if (distanceFromCenter < centerX) {
                    pixels[y][x] = '@';
                }
            }
        }
  
        return pixels;
    }
    static narrowPassage(width, height) {
        // create a 2D array with all black pixels (".")
        const maze = Array.from({ length: height }, () => Array.from({ length: width }, () => '.'));

        // define the positions of the two passages
        const passage1 = Math.floor(width * 0.33);
        const passage2 = Math.floor(width * 0.66);

        const thickness = Math.ceil(height * 0.06) ;
        

        
            // mark the pixels in the passages as passable ("@")
            for (let x = 0; x < height; x++) {
                // mark the pixel at 33% from the top in the first passage as impassable
                if (!(x > Math.floor(height * 0.30) && x < Math.ceil(height * 0.36))) {
                    for (let y = 0; y < thickness; y++) {
                        maze[x][passage1 + y] = "@";
                    }
                   
                }
                

                // mark the pixel at 66% from the top in the second passage as impassable
                if (!(x > Math.floor(height * 0.63) && x < Math.ceil(height * 0.69))) {
                    for (let y = 0; y < thickness; y++) {
                        maze[x][passage2 + y] = "@";
                    }
                }
               
            }
        

        return maze;
    }

    static widePassage(width, height) {
        // create a 2D array with all black pixels (".")
        const maze = Array.from({ length: height }, () => Array.from({ length: width }, () => '.'));

        // define the positions of the two passages
        const passage1 = Math.floor(width * 0.33);
        const passage2 = Math.floor(width * 0.66);

        const thickness = Math.ceil(height * 0.06) ;
        

        
            // mark the pixels in the passages as passable ("@")
            for (let x = 0; x < height; x++) {
                // mark the pixel at 33% from the top in the first passage as impassable
                if (!(x > Math.floor(height * 0.20) && x < Math.ceil(height * 0.46))) {
                    for (let y = 0; y < thickness; y++) {
                        maze[x][passage1 + y] = "@";
                    }
                   
                }
                

                // mark the pixel at 66% from the top in the second passage as impassable
                if (!(x > Math.floor(height * 0.53) && x < Math.ceil(height * 0.79))) {
                    for (let y = 0; y < thickness; y++) {
                        maze[x][passage2 + y] = "@";
                    }
                }
               
            }
        

        return maze;
    }



    static logSpiral(width, height) {
        // Center of the spiral
        const centerX = Math.floor(width / 2);
        const centerY = Math.floor(height / 2);
  
        // Spiral parameters
        const a = 0.01 * width;
        const b = 0.15;
        const thetaMax = 40 * Math.PI;
        const dTheta = 0.01;

        // Initialize the 2D array
        const spiral = new Array(height).fill('.').map(() => new Array(width).fill('.'));

        // Plot the spiral
        let theta = 0;
        while (theta < thetaMax) {
            const r = a * Math.exp(b * theta);
            const x = Math.floor(centerX + r * Math.cos(theta));
            const y = Math.floor(centerY + r * Math.sin(theta));
            if (x >= 0 && x < width && y >= 0 && y < height) {
                spiral[y][x] = '@';
       
            }
            theta += dTheta;
        }

        return spiral;
    }


    static archimedesSpiral(width, height) {
        let spiral = new Array(height).fill().map(() => new Array(width).fill('.')); // initialize 2D array with all black pixels
        let centerX = Math.floor(width / 2);
        let centerY = Math.floor(height / 2);
        let numTurns = Math.floor(Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))); // calculate number of turns needed to fill most of the array
  
        for (let i = 0; i <= numTurns * 2 * Math.PI; i = i + 0.01) {
            let x = Math.floor(centerX + i * Math.cos(i));
            let y = Math.floor(centerY + i * Math.sin(i));
            if (x >= 0 && x < width && y >= 0 && y < height) {
                spiral[y][x] = '@';
            }
        }
  
        return spiral;
    }


    static pentagons(width, height) {
        this.displayName = "Pentagons"
        let pentagons = new Array(height).fill().map(() => new Array(width).fill('.')); // initialize 2D array with all black pixels
  
        let numPentagons = 8// calculate number of pentagons based on height
        let pentagonSize = Math.floor(height / 10); // calculate size of pentagons based on height
  
        for (let i = 0; i < numPentagons; i++) {
            let startX = Math.floor(Math.random() * (width - pentagonSize)); // random starting x-coordinate
            let startY = Math.floor(Math.random() * (height - pentagonSize)); // random starting y-coordinate
    
            // draw pentagon
            for (let y = startY; y < startY + pentagonSize; y = y + 0.2) {
                for (let x = startX; x < startX + pentagonSize; x = x + 0.2) {
                    if (isPentagonPixel(x - startX, y - startY, pentagonSize)) {
                        pentagons[Math.floor(y)][Math.floor(x)] = '@';
                    }
                }
            }
        }
         function isPentagonPixel(x, y, size) {
        let centerX = size / 2;
        let centerY = size / 2;
        let radius = size / 2;
        let angle = Math.atan2(y - centerY, x - centerX);
  
        let sides = [1, 2, 3, 4, 5];
        let pentagonPoints = sides.map((side) => {
            let sideAngle = (2 * Math.PI / 5) * (side - 1) - Math.PI / 2;
            return [centerX + radius * Math.cos(sideAngle), centerY + radius * Math.sin(sideAngle)];
        });
  
        let inside = false;
        for (let i = 0, j = sides.length - 1; i < sides.length; j = i++) {
            let xi = pentagonPoints[i][0], yi = pentagonPoints[i][1];
            let xj = pentagonPoints[j][0], yj = pentagonPoints[j][1];
    
            let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }
  
        return inside;
    }
  
        return pentagons;
    }

   
    static chevrons(width, height) {
        // Initialize the 2D array with all black pixels
        const grid = Array.from({ length: height }, () =>
            Array.from({ length: width }, () => ".")
        );

        // Calculate the thickness of the lines (rounded up)
        const thickness = Math.ceil(height * 0.06)-1;

        var numberChevrons = 3;
        var offsetPercentage = 0.19;
        var p1 = [0.1, 0.1];
        var p2 = [0.1, 0.5];
        var p3 = [0.5, 0.1];
        for (let i = 0; i < numberChevrons; i++) {
        
            // Draw the first line from top-left to top-right
            for (let x = Math.floor(width * p1[1]); x <= Math.floor(width * p2[1]); x++) {
                for (let y = Math.floor(height * p1[0])+thickness; y >= Math.floor(height * p2[0]); y--) {
                    if (y >= 0 && y < height) {
                        grid[y][x] = "@";
                    }
                }
            }

            // Draw the second line from bottom-left to top-left
            for (let x = Math.floor(width * p3[1])+thickness; x >= Math.floor(width * p1[1]) ; x--) {
                for (let y = Math.floor(height * p3[0]+thickness); y >= Math.floor(height * p1[0]); y--) {
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        grid[y][x] = "@";
                    }
                }
            }

            p1[0] += offsetPercentage;
            p1[1] += offsetPercentage;
            p2[0] += offsetPercentage;
            p2[1] += offsetPercentage;
            p3[0] += offsetPercentage;
            p3[1] += offsetPercentage;
        }

        // Return the generated 2D array
        return grid;
    }
 




}
let MapNames = getStaticMethodNames(predefinedMaps);
MapNames.forEach(n => {
    var opt = document.createElement('option');
    opt.value = n;
    opt.innerHTML = camelToNormal(n);
    document.getElementById("map_config").append(opt);
})



// Define a helper function that converts camel case to normal case
function camelToNormal(str) {
  // Use a regex to replace each uppercase letter with a space and the same letter
  let spaced = str.replace(/([A-Z])/g, " $1");
  // Split the string by spaces into an array of words
  let words = spaced.split(" ");
  // Map each word to its capitalized version
  let capitalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  // Join the words with spaces and return the result
  return capitalized.join(" ");
}

// Define the main function that takes a function as an argument and returns an array of static method names
function getStaticMethodNames(obj) {
  // Create an empty array to store the names
  let names = [];
  // Get the own property names of the function object
  let props = Object.getOwnPropertyNames(obj).filter(prop => typeof obj[prop] === "function");
  // Loop through each property name
  for (let prop of props) {
   
      // Convert the name from camel case to normal case and push it to the array
      names.push(prop);
    
  }
  // Return the array of names
  return names;
}

