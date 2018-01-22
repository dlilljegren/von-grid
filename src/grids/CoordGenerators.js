import {Coord}  from './Coord.js'

export function *rectArea(width,height) {		
    var x, y, c;
    var halfW = Math.ceil(width / 2);
    var halfH = Math.ceil(height / 2);
    for (x = -halfW; x < halfW; x++) {
        for (y = -halfH; y < halfH; y++) {
            const coord = Coord.RCD(y,x,0);				
            yield coord;
        }
    }
}


export function *circleArea(radius,centerCoord){
    centerCoord = centerCoord || Coord.QRT(0,0,0);
    var result = [];
    for(let r =1;r<=radius;r++){
        //result = result.concat(this.cube_ring(r,centerCoord));
        for(const c of circle(r,centerCoord))
            yield c;
    }
    yield centerCoord;        
}

export function *circle(radius,centerCoord){
    centerCoord = centerCoord || Coord.QRT(0,0,0);        
    // this code doesn't work for radius == 0; can you see why?
    var cube = centerCoord.add(Coord.hexDirections[4].scale(radius));            
    for(var i=0;i<6;i++){
        for(var j=0;j<radius;j++){            
            yield cube;
            cube = cube.hexNeighbour(i);
        }
    }        
}

/**
* Return all coord in a rectangle around the centre
* @param {int} rows 
* @param {int} cols 
* @param {*} centerCoord 
*/
export function *rect_ring(rows,cols,centerCoord){
   centerCoord = centerCoord || Coord.QRT(0,0,0);        
   var rHalf = Math.floor(rows/2);
   var cHalf = Math.floor(cols/2);
   var cube = centerCoord.add(Coord.sqrDirections[1].scale(rHalf),Coord.sqrDirections[2].scale(cHalf));            
   for(var i=0;i<4;i++){
       const steps = (i==0 || i==2) ? cols : rows;
       for(const j=0;j<steps;j++){
           yield cube;
           cube = cube.sqrNeighbour(i);
       }
   }        
}


export function *halfCircle(radius,centerCoord){
    centerCoord = centerCoord || Coord.QRT(0,0,0);        
    //First move up on the R axis
    let coord = centerCoord.addR(radius);
    yield coord;
    //Then move South West 
    for(let i=0;i<radius;i++){
        coord = coord.addQ(-1);
        yield coord;
    }
    //The move South 
    for(let i=0;i<radius;i++){
        coord = coord.addR(-1);
        yield coord;
    }
    //The move South East
    for(let i=0;i<radius;i++){
        coord = coord.addQ(1);
        yield coord;
    }
}


