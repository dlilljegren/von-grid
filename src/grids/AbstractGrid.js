import * as THREE from './../../lib/three.module.js';
import {vg} from '../vg.js'
import {MutableCoord,Coord}  from './Coord.js'
import {Cell}  from './Cell.js'
import * as Generator from './CoordGenerators.js'
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
            
            this._coordsInPlane = ()=>this.rectArea(width,height);//coordsInPlane is a generator wont get evaluated here
                
		}
		else if(area.circle){
            const radius = area.circle.radius || 10;			
            this._coordsInPlane = ()=>this.circleArea(radius,Coord.ORIGO);                             
		}
		else{
			throw new Error(`Unknown area:${area}`);
		}
    }

    // create a flat, square-shaped grid
	rectArea(width,height) {	
        return Generator.rectArea(width,height);        
	}


    circleArea(radius,centerCoord){
        return Generator.circleArea(radius,centerCoord);        
    }

    /**
     * Return all coord in a rectangle around the centre
     * @param {int} rows 
     * @param {int} cols 
     * @param {*} centerCoord 
     */
    rect_ring(rows,cols,centerCoord){
        return Generator.rect_ring(rows,cols,centerCoord);
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
    
    clearPath() {		
		for (const c of this.cells.values()) {			
			c._calcCost = 0;
			c._priority = 0;
			c._parent = null;
			c._visited = false;
		}
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