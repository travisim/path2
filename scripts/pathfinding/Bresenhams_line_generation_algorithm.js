function Bresenham(x0, y0, x1, y1) {
        let dots = [];
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        dots.push([x0,y0]);

        while(!((x0 == x1) && (y0 == y1))) {
            let e2 = err << 1;

            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }

            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }

            dots.push([x0,y0]);
        }

        return dots;
    }


var x1 = 0, y1 = 0, x2 = 4, y2 =12; 
 console.log(Bresenham(x1, y1, x2, y2))
myUI.canvases["path"].draw_canvas(Bresenham(x1, y1, x2, y2), `1d`, false, false);