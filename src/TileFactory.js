import * as THREE from './../lib/three.module.js';
import {Tile} from './grids/Tile.js';
import {Tools} from './utils/Tools.js';
import * as FlagDrawer from '../src/FlagCanvasDrawer.js';
/*
	Knows how to create a tile for a given cell in a grid
	@author David Lilljegren
 */

export class TileFactory{

	constructor(extrudeSettings,materialFactory,scale) {
		if (!extrudeSettings) throw new Error('You must pass in extrudeSettings');
		if (!materialFactory) throw new Error('You must pass in materialFactory');
		this._geometryCache = new Map();
		if(!scale) scale = 0.96;
		this.scale = scale;
		this._extrudeSettings = extrudeSettings;
		this._materialFactory = materialFactory;
	}


	create(cell,grid) {
		
		
		var geo = this._geometryCache.get(grid);
		if (!geo) {
			this._extrudeSettings.amount = grid.cellHeight/2;
			geo = new THREE.ExtrudeGeometry(grid.cellShape, this._extrudeSettings);
			geo.computeBoundingBox();
			this._geometryCache.set(grid, geo);
		}

		var tile = new Tile({
			size: grid.cellSize,
			scale: this.scale,
			cell: cell,
			geometry: geo,
			material: this._materialFactory.createBodyMaterial(),
			upMaterial : this._materialFactory.createUpMaterial()
			//selectedMaterial
		});
		return tile;
	}

	dispose(){
		this._geometryCache = null;
		this._materialFactory = null;
		this._extrudeSettings = null;
	}

}


//see https://threejs.org/docs/#api/geometries/ExtrudeGeometry
const DefaultExtrudeSettings = {
	amount: 1,
	bevelEnabled: true,
	bevelSegments: 1,
	steps: 1,
	bevelSize: 0.5,
	bevelThickness: 0.5
};

class AbstractMaterialFactory{
	

	createBodyMaterial(cell){}

	createUpMaterial(cell){}
	
}
const materialCache = new Map();

class RandomColorFactory extends AbstractMaterialFactory{
	constructor(rgb,deviation){
		super();
		this.rgb = rgb;
		this.deviation;

		
	}
	
	createBodyMaterial(cell){
		const col = Tools.randomizeRGB(this.rgb,10);
		var m = materialCache.get(col);
		if(!m){
			m = new THREE.MeshPhongMaterial({
				color: col
			})
			materialCache.set(col,m);
		} 
		return m;
	}	

	
}
RandomColorFactory.createUpMaterial = RandomColorFactory.createBodyMaterial;

export const RandomRed = new TileFactory(DefaultExtrudeSettings,new RandomColorFactory('100, 10, 10',10));	

export const RandomBlack = new TileFactory(DefaultExtrudeSettings,new RandomColorFactory('10, 10, 10',20));		

export const RandomBlue = new TileFactory(DefaultExtrudeSettings,new RandomColorFactory('5, 5, 100',20));	
	
export const RandomGreen = new TileFactory(DefaultExtrudeSettings,new RandomColorFactory('10, 100, 10',20));	



class FlagFactory extends AbstractMaterialFactory{
	constructor(country){
		super();
		switch(country){
			case "Sweden": default:
				this.upMaterial = FlagDrawer.createSwedishMaterial();
				this.bodyMaterial =new THREE.MeshPhongMaterial({color:new THREE.Color(0x002654)});
				break;	
		}
	}

	createBodyMaterial(cell){
		return this.bodyMaterial;
	}
	createUpMaterial(cell){
		return this.upMaterial;
	}
}

export const Swedish = new TileFactory(DefaultExtrudeSettings, new FlagFactory("Sweden"));


