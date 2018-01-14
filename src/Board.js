import * as THREE from './../lib/three.module.js';
import {HexGrid} from './grids/HexGrid.js'
import {SqrGrid} from './grids/SqrGrid.js'
import {Cell} from './grids/Cell.js'
import {AStarFinder} from './pathing/AStarFinder.js'
import {Loader} from './utils/Loader.js'
import {Tools} from './utils/Tools.js'
import {vg} from './vg.js'
import {TileFactory} from './TileFactory.js'


/*
	Interface to the grid. Holds data about the visual representation of the cells (tiles).

	@author Corey Birnbaum https://github.com/vonWolfehaus/
	@author David Lilljegren
 */
export class Board{
	constructor(grid, finderConfig) {
		if (!grid) throw new Error('You must pass in a grid system for the board to use.');

		this.tiles = [];
		this.selectedTiles=new Set();
		this.group = new THREE.Object3D(); // can hold all entities, also holds tileGroup, never trashed
		
		this.grid = null;
		this.overlay = new THREE.Object3D();
		this.group.add(this.overlay);

		this.finder = new AStarFinder(finderConfig);
		// need to keep a resource cache around, so this Loader does that, use it instead of THREE.ImageUtils
		this.Loader = new Loader();

		this.tileGroup = new THREE.Object3D();
		this.group.add(this.tileGroup);

		this.hooverValidColor = new THREE.Color(0x1aaeff);
		this.hooverInvalidColor = new THREE.Color(0xff2222);
		
		this.selectedTileGroup = new THREE.Object3D();
		this.tileGroup.add(this.selectedTileGroup);

		//Hoover material
		this.hooverMaterial = new THREE.MeshBasicMaterial(
			{
				color: 0x1aaeff,
				side: THREE.DoubleSide,
				opacity: 0.4,
				transparent : true
		});
		this.setGrid(grid); 
		
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

	createTileInCell(coord,tileCreator,animationSettings){
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

		var tile =tileCreator.create(cell,this.grid);
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

	

	hooverOverTile(tile){
		if(!this.hooverCell)return;
		if(!tile){
			this.hooverCell.visible=false;
		}
		else{
			var pos = this.grid.coordToPixel(tile.cell);
			this.hooverCell.position.copy(pos);
			this.hooverCell.position.y=pos.y+this.grid.cellHeight+0.1;
			this.hooverCell.visible=true;
		}
	}

	setHooverColorValid(){
		this.hooverCell.material.color = this.hooverValidColor;
	}
	setHooverColorInvalid(){
		this.hooverCell.material.color = this.hooverInvalidColor;
	}

	

	createCells(cellFactory,layer){		
		const cf = cellFactory || (c=>new Cell(c,this.grid.cellHeight));
		const depth = layer || 0;
		for(const coord of this.grid.coordsInLayer(depth)){
			const cell = cf(coord);
			this.grid.add(cell);
		}
	}

	createTiles(tileFactory,layer,animationSettings){
		if(!(tileFactory instanceof TileFactory)) throw new Error('You must pass in an instance of a TileFactory');
		const depth = layer || 0;
		for(const coord of this.grid.coordsInLayer(depth)){
			this.createTileInCell(coord,tileFactory,animationSettings)
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
		return this.finder.findPath(startTile.cell, endTile.cell, heuristic, this.grid);
	}



	setGrid(newGrid) {		
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
		if(this.hooverCell){
			this.group.remove(this.hooverCell);
		}
		if(grid){			
			this.hooverCell = grid.generateTilePoly(this.hooverMaterial);
			this.group.add(this.hooverCell);
			this.hooverCell.visible = false;
			this.hooverCell.position.y =2; 
			this.hooverCell.name = "HooverCell";
			
		}
		else{
			this.hooverCell = null;
		}
	}


	toggleOverlay(on){
		const newState = on || !this.overlay.visible;
		this.overlay.visible = !this.overlay.visible;
	}

	/**
	 * Make the hoover hex invisible
	 */
	toggleHoover(on){
		const newState = on || !this.hooverCell.visible;
		this.hooverCell.visible=false;
	}

	toggleSelect(tile,on){
		if(tile instanceof Cell){
			tile = tile.tile;
		}
		//const newState = on || !tile.selected;
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

	_generateOverlay() {
		var mat = new THREE.LineBasicMaterial({
			color: 0x000000,
			opacity: 0.3
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


