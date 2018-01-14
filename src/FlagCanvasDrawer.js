
import * as THREE from '../../lib/three.module.js';

function drawAmericanFlag(canvas, x, y, height) {
    var ctx = canvas.getContext("2d");

    // From the height, derive other measurements.
    var width = height * 1.9;
    var xStarSeparation = height * 0.063;
    var yStarSeparation = height * 0.054;

    // Make sure we start with a white base. That's the default for a 
    // canvas, but maybe someone else has already drawn on it.
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    // Color the red stripes.
    for (var ixStripe = 0; ixStripe < 13; ixStripe += 2) {
        ctx.fillStyle = "#C40043";
        ctx.fillRect(0, ixStripe * height / 13, width, height / 13);
    }

    // Draw the blue field.
    ctx.fillStyle = "#002654";
    ctx.fillRect(0, 0, 0.76 * height, height * 7 / 13);

    // Draw the stars.
    var outerRadius = 0.0616 * height / 2;
    var innerRadius = outerRadius * Math.sin(Math.PI / 10) / Math.sin(7 * Math.PI / 10);
    ctx.fillStyle = "white";
    for (var row = 1; row <= 9; ++row) {
        for (var col = 1; col <= 11; ++col) {
            if ((row + col) % 2 == 0) {
                drawStar(ctx, xStarSeparation * col, yStarSeparation * row, 5, outerRadius, innerRadius);
                ctx.fill();
            }
        }
    }
}

// Draw a star. This function just does does the lineTo's. It is up to the caller
// to set the fillStyle and/or strokeStyle on the context, and call fill() or stroke()
// after this function returns.
// context     - The HTML5 canvas' context, obtained with getContext("2d").
// xCenter     - The x coordinate of the center of the star, in the context.
// yCenter     - The y coordinate of the center of the star, in the context.
// nPoints     - The number of points the start should have.
// outerRadius - The radius of a circle that would tightly fit the star's outer vertexes.
// innerRadius - The radius of a circle that would tightly fit the star's inner vertexes.
function drawStar(context, xCenter, yCenter, nPoints, outerRadius, innerRadius) {
    context.beginPath();
    for (var ixVertex = 0; ixVertex <= 2 * nPoints; ++ixVertex) {
        var angle = ixVertex * Math.PI / nPoints - Math.PI / 2;
        var radius = ixVertex % 2 == 0 ? outerRadius : innerRadius;
        context.lineTo(xCenter + radius * Math.cos(angle), yCenter + radius * Math.sin(angle));
    }
}

function drawBorder(ctx,width,height){
    ctx.beginPath();
    ctx.lineWidth=width*0.05;
    //ctx.lineWidth=10;
    ctx.fillStyle= 'rgb(37, 37, 37)';
    ctx.strokeRect(0,0,width,height);
}


export function drawNeutral(canvas,color){
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    ctx.fillStyle=color;
    ctx.fillRect(0,0,width,height);	
    drawBorder(ctx,width,height);
}

export function drawItalian(canvas){
    var green ='#009246';
    var white ='#F1F2F1';
    var red   ='#CE2B37';
    drawTricolore(canvas,green,white,red);
    var ctx = canvas.getContext("2d");
    drawBorder(ctx,canvas.width,canvas.height);
}

function drawTricolore(canvas,c1,c2,c3){
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    ctx.beginPath();	
    ctx.fillStyle = c1;
    ctx.fillRect(0,0,width/3,height);	
    ctx.fillStyle = c2;
    ctx.fillRect(width/3,0,width/3,height);	
    ctx.fillStyle = c3;
    ctx.fillRect(width*2/3,0,width/3,height);	

}

export function makeFlagMaterial(){
    var m = new THREE.MeshBasicMaterial();
    var canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    var map;
    drawSwedish(canvas);            
    m.map = new THREE.CanvasTexture(canvas);
    m.magFilter =THREE.NearestFilter;
    m.map.repeat.x = 0.05;
    m.map.repeat.y = 0.05;
    m.map.offset.x = 0.5;
    m.map.offset.y = 0.5;
    //m.map.offset.y = 10;
    //m.map.wrapS = THREE.RepeatWrapping;             
    //m.map.wrapT = THREE.RepeatWrapping;             
    return m;
}


export function drawSwedish(canvas){
    var ctx = canvas.getContext("2d");
    var blue = '#0b5089';
    var yellow = '#ffc100';

    ctx.fillStyle = blue;	
    ctx.fillRect(0,0,canvas.width,canvas.height);

    
    var width = canvas.width*3/5;
    var height = width * 5/8;
    var wOffset = (canvas.width-width)/2;
    var hOffset = (canvas.height - height)/2;
    let drawer = function(){
        drawCrossFlag2(canvas,blue,yellow,width,height);        
    }
    drawInMiddle(ctx,wOffset,hOffset,drawer);
    //drawer();
    drawBorder(ctx,canvas.width,canvas.height);
}


function drawInMiddle(ctx,wOffset,hOffset,drawer){
    ctx.translate(wOffset, hOffset);
    drawer();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawCrossFlag2(canvas,bgColor,crossColor,width,height){ 
    

    var ctx = canvas.getContext("2d");
    ctx.beginPath();	
	ctx.fillStyle = bgColor;	
	ctx.rect(0,0,width,height);
    ctx.fill();
    
    ctx.beginPath();	
	ctx.fillStyle = crossColor;	
    var crossWidth = height*2/10;
    
    //draw horizontal
    ctx.rect(0,height*2/5,width,height/5);   
    
    //draw vertical
    ctx.rect(width*2/5,0,width/5,height);
    
    ctx.fill();
}



export function drawSwiss(canvas){
	var ctx = canvas.getContext("2d");
	ctx.beginPath();	
	ctx.fillStyle = "red";	
	ctx.rect(0,0,canvas.width,canvas.height);
	ctx.fill();

	ctx.beginPath();	
	ctx.fillStyle = "white";
	var w = canvas.width;
	var h = canvas.height;
	ctx.rect(w/5, h/5*2, w/5*3, h/5);
	ctx.rect(w/5*2, h/5, w/5, h/5*3);
	ctx.fill();
    
    drawBorder(ctx,canvas.width,canvas.height);
}
export function drawChinese(canvas){    
    var context = canvas.getContext('2d');
    var width=canvas.width*3/2;
    var height=width*2/3;
    
    var w=width/30;//Small mesh width
    context.fillStyle="red";
    context.fillRect(0,0,width,height);
    var maxR = 0.15, minR = 0.05;//
    var maxX = 0.25, maxY = 0.25;//A large five-star position
    var minX = [0.50, 0.60, 0.60, 0.50];
    var minY = [0.10, 0.20, 0.35, 0.45];
    // Painting☆
    var ox = height * maxX, oy = height * maxY;
    create5star(context,ox,oy,height * maxR,"#ff0",0);//Draw a five pointed star
    // Draw a small★
    for (var idx = 0; idx <4; idx++) {
      var  sx = minX[idx] * height, sy = minY[idx] * height;
      var  theta = Math.atan((oy - sy)/(ox - sx));
      create5star(context,sx, sy, height * minR, "#ff0",-Math.PI/2+theta);
     }
    //Auxiliary line
    /*
    context.moveTo(0,height/2)
    context.lineTo(width,height/2);
    context.stroke();
    context.moveTo(width/2,0);
    context.lineTo(width/2,height);
    context.stroke();
    */
    /*
    //Gridding, vertical lines
     for(var j=0;j<15;j++){
        context.moveTo(j*w,0);
        context.lineTo(j*w,height/2);
        context.stroke();
     }
     //Draw the grid, the line
      for(var j=0;j<10;j++){
        context.moveTo(0,j*w);
        context.lineTo(width/2,j*w);
        context.stroke();
     }
     */

    /*
      //Draw the circle
      context.beginPath();
      context.arc(ox,oy,maxR*height,0,Math.PI*2,false);
      context.closePath();
      context.stroke();
      // Small round painting
      for (var idx = 0; idx <4; idx++) {
       context.beginPath();
       var  sx = minX[idx] * height, sy = minY[idx] * height;
       context.arc(sx, sy, height * minR,0,Math.PI*2,false);
       context.closePath();
       context.stroke();
      }  
      //Great circle center and circle center connecting line
      for (var idx = 0; idx <4; idx++) {
       context.moveTo(ox,oy);
       var  sx = minX[idx] * height, sy = minY[idx] * height;
       context.lineTo(sx, sy);
       context.stroke();
      }  
      */
     //Draw a five pointed star
    /**
     * Create a star shape. The coordinates of the center of the star for (SX, SY), the center to the vertex distance is radius, rotate=0 is a vertex on the axis of symmetry
     * Rotate: spin around the axis of symmetry rotate arc
     */
    function create5star(context,sx,sy,radius,color,rotato){
      context.save();
      context.fillStyle=color;
      context.translate(sx,sy);//The moving coordinate origin
      context.rotate(Math.PI+rotato);//Rotation
      context.beginPath();//Create a path
      var x = Math.sin(0);
      var y= Math.cos(0);
      var dig = Math.PI/5 *4;
      for(var i = 0;i<5;i++){//Five draw five pointed star
       var x = Math.sin(i*dig);
       var y = Math.cos(i*dig);
       context.lineTo(x*radius,y*radius);
     } 
     context.closePath();
     context.stroke();
     context.fill();
     context.restore();
    }  

    drawBorder(context,canvas.width,canvas.height);
}
