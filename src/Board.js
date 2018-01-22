import * as THREE from './../lib/three.module.js';
import {HexGrid} from './grids/HexGrid.js'
import {SqrGrid} from './grids/SqrGrid.js'
import {AbstractGrid} from './grids/AbstractGrid.js'
import {Cell} from './grids/Cell.js'
import {AStarFinder} from './pathing/AStarFinder.js'
import {Loader} from './utils/Loader.js'
import {Tools} from './utils/Tools.js'
import {vg} from './vg.js'
import {TileFactory} from './TileFactory.js'
import {Lookup} from './TileFactory.js'

/*
	Interface to the grid. Holds data about the visual representation of the cells (tiles).

	@author Corey Birnbaum https://github.com/vonWolfehaus/
	@author David Lilljegren
 */
export class Board{
	constructor(finderConfig) {
		

		this.tiles = [];
		this.selectedTiles=new Set();
		this.group = new THREE.Object3D(); // can hold all entities, also holds tileGroup, never trashed
		
		
		this.overlay = new THREE.Object3D();
		this.group.add(this.overlay);

		this.finder = new AStarFinder(finderConfig);
		
		this.tileGroup = new THREE.Object3D();
		this.group.add(this.tileGroup);

		//Set-up hoover
		this.hooverGroup = new THREE.Object3D();
		this.group.add(this.hooverGroup);

		this.hooverManagers = new Map();
		//Create the default hoover manager
		this.hooverManagers.set("default", new HooverManager(
			{

			},			
			this));
		
		
		this.selectedTileGroup = new THREE.Object3D();
		this.tileGroup.add(this.selectedTileGroup);

		this.tileFactoryFunction = Lookup;

		this.setGrid(new HexGrid());
	};
	configureGrid(config){
		let g = config.type;
		g = g || vg.HEX;

		var grid;
		switch(g){
			case vg.HEX: grid = new HexGrid(config);break;
			case vg.SQR: grid = new SqrGrid(config);break;
			default:
				throw new Error(`Unknown grid type:${config.type}`);
		}
		this.setGrid(grid);

		if(config.cells){			
			for(const cell of config.cells){				
				this.createTileInCell(cell,cell.terrain,config.animationSettings);
			}
		}
	}

	setEntityOnTile(entity, tile) {
		// snap an entity's position to a tile; merely copies position
		var pos = this.grid.coordToPixel(tile.cell);
		entity.position.copy(pos);
		// adjust for any offset after the entity was set directly onto the tile
		//entity.position.y += entity.heightOffset || 0;
		entity.position.y += (this.grid.cellHeight+0.2) || 0;
		// remove entity from old tile
		if (entity.tile) {
			entity.tile.entity = null;
		}
		// set new situation
		entity.tile = tile;
		tile.entity = entity;

		entity.scale.set(10,10,10)
		this.group.add(entity);
	}

	addTile(tile) {
		var i = this.tiles.indexOf(tile);
		if (i === -1) this.tiles.push(tile);
		else return;

		this.snapTileToGrid(tile);
		tile.position.y = 0;

		this.tileGroup.add(tile.mesh);
		this.grid.add(tile.cell);

		tile.cell.tile = tile;
	}

	createTileInCell(coord,terrain,animationSettings){
		//var c = {q:q,r:r,s:-q-r,t:t};

		var cell;
		if(coord instanceof Cell){
			cell = coord;
		}
		else{
			//Look it up
			cell = this.grid.getCell(coord);		
			if(!cell) throw Error(`No cell found at coord ${coord}`);
		}
		if(cell.tile){
			this.removeTile(tile);
		}

		const tileFactory = this.tileFactoryFunction(terrain);
		if(tileFactory==null) throw new Error("No tileFactory found for terrain:"+terrain);
		var tile =tileFactory.create(cell,this.grid);
		tile.position.y = 0;

		this.snapTileToGrid(tile);
	

		this.tileGroup.add(tile.mesh);
		this.grid.add(tile.cell);
		tile.cell.tile = tile;
		this.tiles.push(tile);

		if(animationSettings){
			var yStart =Tools.randomInt(animationSettings.yStartMax,animationSettings.yStartMin);
			var sec = Tools.random(animationSettings.averageSeconds*0.8,animationSettings.averageSeconds*1.2);
			var tilePos = tile.position;
			var yFinal = tilePos.y;
			TweenLite.fromTo(tilePos, sec, {y:yStart}, {y:yFinal,ease: animationSettings.ease});
		}
		return tile;
	}

	

	



	

	createCells(cellFactory,layer){		
		const cf = cellFactory || (c=>new Cell(c,this.grid.cellHeight));
		const depth = layer || 0;
		for(const coord of this.grid.coordsInLayer(depth)){
			const cell = cf(coord);
			this.grid.add(cell);
		}
	}

	createTiles(terrain,layer,animationSettings){
		this.removeAllTiles();				
		const depth = layer || 0;
		for(const coord of this.grid.coordsInLayer(depth)){
			this.createTileInCell(coord,terrain,animationSettings)
		}
	}

	/**
	 * Apply a function to all cells defined in the grid
	 * @param {*} cellFunction 
	 */	
	forEachCell(cellFunction){
		this.grid.forEachCell(cellFunction);
	}

	removeTile(tile) {
		if (!tile) return; // was already removed somewhere
		var i = this.tiles.indexOf(tile);
		if (i !== -1) this.tiles.splice(i, 1);
		this.tileGroup.remove(tile.mesh);
		this.selectedTileGroup.remove(tile.mesg);
		this.selectedTiles.delete(tile);
		tile.dispose();
	}

	removeAllTiles() {				
		for (const tile of this.tiles) {			
			if(this.tileGroup)this.tileGroup.remove(tile.mesh);									
			this.selectedTileGroup.remove(tile.mesh);
			this.selectedTiles.delete()
			tile.dispose();
		}
		this.tiles=[];
		this.selectedTiles = new Set();
	}

	getTileAtCell(cell) {
		var h = this.grid.cellToHash(cell);
		return cell.tile || (typeof this.grid.cells[h] !== 'undefined' ? this.grid.cells[h].tile : null);
	}

	snapToGrid(pos) {
		const coord = this.grid.pixelToCoord(pos);
		pos.copy(this.grid.coordToPixel(coord));
	}

	snapTileToGrid(tile) {
		if (tile.cell) {
			tile.position.copy(this.grid.coordToPixel(tile.cell));
		}
		else {
			const coord = this.grid.pixelToCoord(tile.position);
			tile.position.copy(this.grid.coordToPixel(coord));
		}
		return tile;
	}

	getRandomTile() {
		var i = Tools.randomInt(0, this.tiles.length-1);
		return this.tiles[i];
	}
	/**
	 * Return an orderded list of cells
	 * @param {*} startTile 
	 * @param {*} endTile 
	 * @param {*} heuristic 
	 */
	findPath(startTile, endTile, heuristic) {
		if(startTile.cell == null || endTile.cell == null) return [];
		return this.finder.findPath(startTile.cell, endTile.cell, heuristic, this.grid);
	}



	setGrid(newGrid) {		
		if(!(newGrid instanceof AbstractGrid)) throw new Error(`${newGrid} is not an instance of AbstractGrid`);
		if (this.grid && newGrid !== this.grid) {
			this.removeAllTiles();			
			this.grid.dispose();
		}
		this.grid = newGrid;
		this.tiles = [];
		
		this._initHoover(newGrid);
		this._generateOverlay();
	}
	


	_initHoover(grid){
		for(const hm of this.hooverManagers.values()){
			hm._setGrid(grid);
		}
	}


	toggleOverlay(on){		
		const newState = on==null ? !this.overlay.visible : on;
		this.overlay.visible = !this.overlay.visible;
	}

	/**
	 * Make the hoover cursors invisible
	 */
	toggleHoover(on){
		const newState = on==null ? !this.hooverGroup.visible :on;
		this.hooverGroup.visible=newState;
	}

	toggleSelect(tile,on){
		if(tile instanceof Cell){
			tile = tile.tile;
		}
		
		const newState = on ==null ? !tile.selected : on;
		tile._toggleSelect(newState);
		if(newState){
			this.selectedTileGroup.add(tile.mesh);
			this.selectedTiles.add(tile);
			this.lastSelectedTile = tile;
		}
		else{
			this.selectedTileGroup.remove(tile.mesh);
			this.tileGroup.add(tile.mesh);
			this.selectedTiles.delete(tile);
		}
	}
	toggleSelectAll(on){
		this.tiles.forEach(t=>this.toggleSelect(t,false));
	}


	hooverOverTile(tile,hooverManagerId){
		const id = hooverManagerId || "default";		
		this.hooverManagers.get(id).hooverOverTile(tile);
	}
	/**
	 * Add a Hoover manager allowing to have more than one cursor moving around the board
	 * @param {string} hooverManagerId 
	 * @param {*} hooverCfg 
	 */
	createHooverManager(hooverManagerId,hooverCfg){
		this.hooverManagers.set(name, new HooverManager(			
			hooverCfg,this));
	}

	removeHooverManager(hooverManagerId){
		this.hooverManagers.delete(hooverManagerId);
	}

	_generateOverlay() {
		var mat = new THREE.LineBasicMaterial({
			color: 0x000000,
			opacity: 0.3,
			fog:false
		});
		for (var i = this.overlay.children.length - 1; i >= 0; i--) {
			this.overlay.remove(this.overlay.children[i]);
		}
		this.grid.generateOverlay(this.overlay, mat);
	}


	reset() {
		// removes all tiles from the scene, but leaves the grid intact
		this.removeAllTiles();		
	}
	
};


class HooverManager{

	constructor(config,board){
		
		this.name = config.name || "Unknown";
		this.board = board;
		this.group = board.hooverGroup;
		
		this.valid = true;

		this.validColor = config.validColor|| new THREE.Color(0x1aaeff);
		this.invalidColor = config.invalidColor || new THREE.Color(0xff2222);

		this.hooverMesh = null;

		//Hoover material
		this.hooverMaterial = config.material || new THREE.MeshBasicMaterial(
			{
				color: this.validColor,
				side: THREE.DoubleSide,
				opacity: 0.4,
				transparent : true
		});
		this.hooverMaterial.depthTest = false;//This make sure somehow that the hoover renders correctly
	}
	

	toogleValid(on){
		const newState = on ==null ? !this.valid : on;
		if(newState != this.valid){
			this.hooverMaterial.color = newState ? this.validColor : this.invalidColor;
			this.valid = newState;
		}		
	}
	/**
	 * When a new grid is initialized we recreate the cursor mesh
	 * @param {AbstractGrid} grid 
	 */
	_setGrid(grid){
		if(this.hooverMesh){
			this.group.remove(this.hooverMesh);			
		}
		if(grid){			
			this.hooverMesh = grid.generateTilePoly(this.hooverMaterial);
			this.group.add(this.hooverMesh);
			this.hooverMesh.visible = false;

			this.hooverMesh.position.y =grid.cellHeight; 
			this.hooverMesh.name = "Hoover_"+this.name;	
			this.hooverMesh.renderOrder = 1;		
			this.hooverMesh.scale.set(0.8, 0.8, 1);
			this.grid = grid;
		}
		else{
			this.hooverMesh = null;
		}
	}

	hooverOverTile(tile){
		if(!this.hooverMesh)return;
		if(!tile){
			this.hooverMesh.visible=false;
		}
		else{
			const cell = tile.cell;
			this.toogleValid(cell.hooverValid());
			
			var pos = this.grid.coordToPixel(tile.cell);
			this.hooverMesh.position.copy(pos);
			//this.hooverMesh.position.y=pos.y+this.grid.cellHeight;
			const box = tile.geometry.boundingBox;
			const offsetY = box.max.z -box.min.z;
			this.hooverMesh.position.y=pos.y+(tile.geometry.boundingBox.max.z+tile.geometry.boundingBox.min.z);
			this.hooverMesh.visible=true;
		}
	}

}


