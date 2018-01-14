import * as THREE from '../../lib/three.module.js';
//import * as TweenMax  from '../../lib/TweenMax.min.js';

export class CircularMotion{

    constructor(config){
        config = config || {};
        this.radius = config.radius || 15;
        this.duration = config.duration || 1;
        this.turns = config.turns || 1;
        this.yOffset = config.yOffset || 1;
    }

    tween(meshOrGroup){
        const mesh = meshOrGroup;
        const radius = this.radius;
        const start =mesh.position.clone();

        //start of circle segment
        let xStart; 
        let zStart;
        //end of circle segment
        let xEnd= start.x +radius;
        let zEnd= start.z;
        const angle = 2*Math.PI/24;
        
        let i=1;
        let tween;
        var onRepeat = function(){            
            xStart = xEnd;
            zStart = zEnd;
            const na = angle*i;
            xEnd = radius*Math.cos(na)+start.x;
            zEnd = radius*Math.sin(na)+start.z;
            i++;
            mesh.position.x = xStart;
            mesh.position.z = zStart;
            tween.updateTo({x:xEnd, z:zEnd}, false);
        }
        const repetitions = this.turns*24;

        mesh.position.y = this.yOffset;

        tween =TweenMax.to(
            mesh.position,this.duration/(repetitions+1), {
                x:xEnd,
                z:zEnd,
                repeat: repetitions,
                onRepeat:onRepeat,
                onComplete: ()=>{mesh.position.copy(start);}
            }
        );
        return tween;
    }
}