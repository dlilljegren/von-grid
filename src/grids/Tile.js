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

		this.cell = settings.cell;
		if (this.cell.tile && this.cell.tile !== this) this.cell.tile.dispose(); // remove whatever was there
		this.cell.tile = this;

		this.coord = this.cell.coord;


		this.uniqueID = Tools.generateID();

		this.geometry = settings.geometry;
		this.material = settings.material;
		if (!this.material) {
			this.material = new THREE.MeshPhongMaterial({
				color: Tools.randomizeRGB('30, 30, 30', 13)
			});
		}

		this.objectType = vg.TILE;
		this.entity = null;
		this.userData = {};

		this.selected = false;
		this.highlight = '0x0084cc';

		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.userData.structure = this;

		// create references so we can control orientation through this (Tile), instead of drilling down
		this.position = this.mesh.position;
		this.rotation = this.mesh.rotation;

		// rotate it to face "up" (the threejs coordinate space is Y+)
		this.rotation.x = -90 * vg.DEG_TO_RAD;
		this.mesh.scale.set(settings.scale, settings.scale, 1);

		if (this.material.emissive) {
			this._emissive = this.material.emissive.getHex();
		}
		else {
			this._emissive = null;
		}
	}


	_select() {
		if (this.material.emissive) {
			this.material.emissive.setHex(this.highlight);
		}
		this.selected = true;
		return this;
	}

	_deselect() {
		if (this._emissive !== null && this.material.emissive) {
			this.material.emissive.setHex(this._emissive);
		}
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
		this.material = null;
		this.userData = null;
		this.entity = null;
		this.geometry = null;
		this._emissive = null;
	}
};


