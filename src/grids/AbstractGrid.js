import {vg} from '../vg.js'
import * as THREE from '../../lib/three.module.js';
import {MutableCoord,Coord}  from './Coord.js'
import {Cell}  from './Cell.js'

export class AbstractGrid{

    constructor(config){
        config = config || {};
        this._vec3 = new THREE.Vector3();
        this.cells = new Map();
        this.cellHeight = config.cellHeight || 1;
        this._coord = MutableCoord.Create();
        this._hashDelimeter = '.';
        this.cellSize = typeof config.cellSize === 'undefined' ? 10 : config.cellSize;
        this.depth = typeof config.depth === 'undefined' ? 1 : config.depth;

        const area = config.area || {circle:{radius:10}};

        if(area.rect){
			const width = area.rect.width || 64;
			const height = area.rect.height || 32;
            
            this._coordsInPlane = ()=>this.generateRect(width,height);//coordsInPlane is a generator wont get evaluated here
                
		}
		else if(area.circle){
            const radius = area.circle.radius || 10;			
            this._coordsInPlane = ()=>this.cube_ring_fill(radius,Coord.ORIGO);                             
		}
		else{
			throw new Error(`Unknown area:${area}`);
		}
    }

    // create a flat, square-shaped grid
	*generateRect(width,height) {		
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

    *cube_ring(radius,centerCoord){
        centerCoord = centerCoord || Coord.QRT(0,0,0);
        var results = []
        // this code doesn't work for radius == 0; can you see why?
        var cube = centerCoord.add(Coord.hexDirections[4].scale(radius));            
        for(var i=0;i<6;i++){
            for(var j=0;j<radius;j++){
                //results.push(cube);
                yield cube;
                cube = cube.hexNeighbour(i);
            }
        }
        //return results
    }

    *cube_ring_fill(radius,centerCoord){
        centerCoord = centerCoord || Coord.QRT(0,0,0);
        var result = [];
        for(let r =1;r<=radius;r++){
            //result = result.concat(this.cube_ring(r,centerCoord));
            for(const c of this.cube_ring(r,centerCoord))
                yield c;
        }
        yield centerCoord;        
    }


    *rect_ring(rows,cols,centerCoord){
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

    *coordsInLayer(layer){
        const d = layer || 0;
        if(d==0){
            for(const c of this._coordsInPlane()){
                yield c;
            }
        }
        else{
            for(const c of this._coordsInPlane()){
                yield c.atDepth(d);
            }
        }
    }

    generateTilePoly(material) {
		if (!material) {
			material = new THREE.MeshBasicMaterial({color: 0x24b4ff});
		}
		var mesh = new THREE.Mesh(this.cellShapeGeo, material);
		this._vec3.set(1, 0, 0);
		mesh.rotateOnAxis(this._vec3, vg.PI/2);
		return mesh;
    }
    
    
    generateOverlay(overlayObj,overlayMat){
        const geo = this.cellShape.createPointsGeometry();
        for(const c of this._coordsInPlane()){
            var line = new THREE.Line(geo, overlayMat);
			line.position.copy(this.coordToPixel(c));
			line.rotation.x = 90 * vg.DEG_TO_RAD;
			overlayObj.add(line);
        }
    }

    getRandomCell() {				
		return this.cells[Tools.randomInt(0, this.cells.size())];		
    }
    
    forEachCell(cellApply){
        for(const cell of this.cells.values(cellApply)){
            cellApply(cell);
        }
        
    }
    
    /**
     * Return the cell for a given coordinate, creating a new one if it didnt already exist
     */
    getCell(coord){		
        const h = this.coordToHash(coord);
        let cell= this.cells.get(h);
        if(!cell){
            cell = new Cell(coord,this.gridHeight);
            this.cells.set(h,cell);
        }
        return cell;
    }

    remove(cell) {
		var h = this.coordToHash(cell.coord);
		if (this.cells.has(h)) {
			this.cells.delete(h);			
		}
    }
    add(cell) {
        var h = this.coordToHash(cell);                
        if (this.cells.has(h)) {
			// console.warn('A cell already exists there');
			return this.cells.get(h);
		}
		this.cells.set(h,cell);
		return cell;
	}
    
    coordToHash(cell) {
		throw Error("coordToHash implementation missing in subclass");
    }
    coordToPixel(coord){
        throw Error("coordToPixel implementation missing in subclass");
    }
    pixelToCoord(pos) {
        throw Error("pixelToCoord implementation missing in subclass");
    }
    dispose(){
        this.cells = null;
    }
}