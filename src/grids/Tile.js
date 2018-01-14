import * as THREE from './../../lib/three.module.js';
import {Tools} from '../utils/Tools.js'
import {vg} from '../vg.js'


/*
	Example tile class that constructs its geometry for rendering and holds some gameplay properties.

	@author Corey Birnbaum https://github.com/vonWolfehaus/
*/
export class Tile{
	constructor(config) {
		config = config || {};
		var settings = {
			cell: null, // required vg.Cell
			geometry: null, // required threejs geometry
			material: null // not required but it would improve performance significantly
		};
		settings = Tools.merge(settings, config);

		if (!settings.cell || !settings.geometry) {
			throw new Error('Missing Tile configuration');
		}
		if(!settings.material){
			throw new Error("Missing material in config")
		}

		this.cell = settings.cell;
		if (this.cell.tile && this.cell.tile !== this) this.cell.tile.dispose(); // remove whatever was there
		this.cell.tile = this;

		this.coord = this.cell.coord;


		this.uniqueID = Tools.generateID();

		this.geometry = settings.geometry;
		
		this.material = settings.material;
		
		//Set the material to use for the tiles flat side
		this.upMaterial = settings.upMaterial || settings.material;
		this.selectedMaterial = settings.selectedMaterial || DefaultSelectedMaterial;
		

		this.objectType = vg.TILE;
		this.entity = null;
		this.userData = {};

		this.selected = false;
		


		const materials = [this.upMaterial,this.material];
		this.mesh = new THREE.Mesh(this.geometry, materials);
		this.mesh.userData.structure = this;

		// create references so we can control orientation through this (Tile), instead of drilling down
		this.position = this.mesh.position;
		this.rotation = this.mesh.rotation;

		// rotate it to face "up" (the threejs coordinate space is Y+)
		this.rotation.x = -90 * vg.DEG_TO_RAD;
		this.mesh.scale.set(settings.scale, settings.scale, 1);

		/*
		if (this.material.emissive) {
			this._emissive = this.material.emissive.getHex();
		}
		else {
			this._emissive = null;
		}*/
	}

	_select(){
		//Change the material of the sides of the material to black so we get like a border
		this.mesh.material[1] = this.selectedMaterial;
		this.selected = true;
		return this;
	}
	_deselect(){
		this.mesh.material[1] = this.material;
		this.selected = false;
		return this;
	}

	_toggleSelect(on) {
		const newState = on==null ? !this.selected : on;
		if (newState) {
			this._select();
		}
		else {
			this._deselect();
		}
		return this;
	}

	isDisposed(){return this.cell==null;}

	dispose() {
		if (this.cell && this.cell.tile) this.cell.tile = null;
		this.cell = null;
		this.position = null;
		this.rotation = null;
		if (this.mesh){//ToDo this should never be null, check if we dispose too many times when switching grid
			if(this.mesh.parent) this.mesh.parent.remove(this.mesh);
			if(this.mesh.userData)this.mesh.userData.structure = null;			
		}
		this.mesh = null;	
		this.userData = null;
		this.entity = null;
		this.geometry = null;
		this._emissive = null;
	}
};

const DefaultSelectedMaterial =new THREE.MeshPhongMaterial({color:  new THREE.Color( 0x101010 )})
