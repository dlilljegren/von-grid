import * as Generator from './grids/CoordGenerators.js'
import {Coord} from './grids/Coord.js'
import {Cell} from './grids/Cell.js'
export class MapCreator{

    constructor(){

    }

    createConfig(){

        const config = {};
        

        config.type ="hex";
        config.cellSize = 5;
        config.cellHeight = 2;
        config.area = {
            rect: {
                width:64,
                height:32
            }
        };

        config.animationSettings = 
        {
            yStartMax:150,
            yStartMin:50,
            averageSeconds:1.2,
            ease:"Elastic.easeIn.config(1, 0.3)"
		};
        //Get all coords in 

        //Add cells
        config.cells =[]
        
        const origo = Coord.ORIGO;
        
        for(const c of Generator.rectArea(64,32)){
            const cell = new Cell(c);            
            const distance = c.distanceInPlane(origo);
            cell.fog = distance>10; 
            cell.terrain = distance>5 ? "RandomGreen" : "RandomBlue" ;
            cell.walkable = distance>5;
            config.cells.push(cell)                
        }

        return config;
    }

}