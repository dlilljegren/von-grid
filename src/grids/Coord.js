/**
 * Grid coordinate, expressed as either cube coordinate used by hexagon or normal x,y
 * 
 * Conversion between row/col and q/r/s space is based on odd-q https://www.redblobgames.com/grids/hexagons/#coordinates-offset
 */
export class Coord{

    /**
     * 
     * @param {int} q 
     * @param {int} r 
     * @param {int} s 
     * @param {int} t 
     */
    constructor(q, r,t){
        this._q = q || 0; // x grid coordinate (using different letters so that it won't be confused with pixel/world coordinates)
		this._r = r || 0; // y grid coordinate		
		this._t = t || 0; // The height grid coordinate
    }

    static CreateQRT(q,r,t){
        return new Coord(q,r,t);
    }

    static CreateRowColDepth(row,col,depth){
        return Coord.RCD(row,col,depth);
    }

    static QRT(q,r,t){
        return new Coord(q,r,t);
    }

    static QRS(q,r,s){
        return Coord.CreateQRT(q,r,0);
    }
    static RCD(row,col,depth){
        const q = col;
		const s = row - (col - (col&1)) / 2;
        const r = -q-s;
        return Coord.CreateQRT(q,r,depth);		
    }

    get s (){
        return -this._q-this._r;
    }

    get q (){
        return this._q;
    }

    get r(){
        return this._r;        
    }

    get t(){
        return this._t;        
    }

    get row(){
        return this.s + (this._q - (this._q&1)) / 2
    }
    get col(){
        return this._q;
    }

    get depth(){
        return this._t;
    }

    /**
     * Return coord with depth+1
     */
    get above(){
        return new Coord(this._q,this._r,this._t+1);
    }
    
    atDepth(d){
        return new Coord(this._q,this._r,d);
    }

    toString(){
        return `[${this.q},${this.r},${this.s}] row=${this.row} col=${this.col} depth=${this.depth}`;
    }

    add(otherCoord){
        return Coord.CreateQRT(this._q+otherCoord._q,this._r+otherCoord._r,this._t+otherCoord._t);
    }    
    scale(factor){
        return Coord.CreateQRT(this._q*factor,this._r*factor,this._t*factor);
    }

    //https://www.redblobgames.com/grids/hexagons/#distances-cube
    distanceInPlane(o){
        return (Math.abs(this._q - o._q) + abs(this._r - o._r) + abs(a.s - o.s)) / 2
    }

    equals(c) {
		return this.q === c.q && this.r === c.r && this.s === c.s && this.t == c.t;
    }
    /**
     * 
     * @param {*} direction 0 to 6
     */
    hexNeighbour(direction){
        return this.add(Coord.hexDirections[direction]);
    }
    sqrNeighbour(direction){
        return this.add(Coord.sqrDirections[direction]);
    }
}

Coord.ORIGO = Coord.QRT(0,0,0);

// pre-computed permutations in the place
Coord.hexDirections = [Coord.QRS(+1, -1, 0), Coord.QRS(+1, 0, -1), Coord.QRS(0, +1, -1),
    Coord.QRS(-1, +1, 0), Coord.QRS(-1, 0, +1), Coord.QRS(0, -1, +1)];

// pre-computed permutations in the plane
Coord.sqrDirections = [Coord.RCD(0, +1, 0), Coord.RCD(-1, 0, 0),Coord.RCD(0, -1, 0), Coord.RCD(+1, 0, 0)];

export class MutableCoord extends Coord{

    constructor(q, r,t){
        super(q,r,t);
    }
    static Create(){
        return new MutableCoord(0,0,0);
    }
    set(q, r, s, t) {		
		this._q = q;
		this._r = r;		
		this._t = t;
		return this;
    }
    
    setRCD(row,col,depth){
        const q = col;
		const s = row - (col - (col&1)) / 2;
        const r = -q-s;
        this.set(q,r,s,depth);
    }

    copy(coord){
        this.set(coord._q,coord._r,coord.s,coord._t);
    }
    add(otherCoord){
        this.set(this._q+otherCoord._q,this._r+otherCoord._r,null,this._t+otherCoord._t);
    }
}