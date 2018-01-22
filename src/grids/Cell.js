import {LinkedList} from '../utils/LinkedList.js'; 
/*
	Simple structure for holding grid coordinates and extra data about them.

	@author Corey Birnbaum https://github.com/vonWolfehaus/
*/
export class Cell{

	constructor(coord,h) {
		this.coord = coord;
		this.q = coord.q;
		this.r = coord.r;
		this.s = coord.s;
		this.t = coord.t;
		this.row = coord.row;
		this.col = coord.col;
		this.depth = coord.depth;

		this.h = h || 1; // 3D height of the cell, used by visual representation and pathfinder, cannot be less than 1
		this.tile = null; // optional link to the visual representation's class instance
		this.userData = {}; // populate with any extra data needed in your game
		this.walkable = true; // if true, pathfinder will use as a through node
		this.fog = false;
		// rest of these are used by the pathfinder and overwritten at runtime, so don't touch
		this._calcCost = 0;
		this._priority = 0;
		this._visited = false;
		this._parent = null;
		this.uniqueID = LinkedList.generateID();
	}

	/**
	 * Determine if the hoover cursor should be rendered as valid or invalid
	 */
	hooverValid(){
		return this.walkable === true;
	}

	set(q, r, s, t) {
		throw Error("Check me")
		
		console.assert(t!=null,"t not set");
		this.q = q;
		this.r = r;
		this.s = s;
		this.t = t;
		return this;
	}

	copy(cell) {
		this.coord = coord;
		this.h = cell.h;
		this.tile = cell.tile || null;
		this.userData = cell.userData || {};
		this.walkable = cell.walkable;
		return this;
	}

	

	equals(cell) {
		return this.q === cell.q && this.r === cell.r && this.s === cell.s && this.t == cell.t;
	}
};


