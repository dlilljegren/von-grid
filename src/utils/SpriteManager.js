
import * as THREE from '../../lib/three.module.js';
export class SpriteManager{

    constructor(config){
        this.urls = config.urls || [];
        
        this.textureLoader = new THREE.TextureLoader();

        this.all = this._loadAllPromise();
    }


    _loadAllPromise(){
        
        return Promise.all( this.urls.map( u=>this._load(u).then( t=>this._makeMaterial(t) ) ));
    }


    _load(url){                        
        const tl = this.textureLoader;       
        return new Promise( function(resolve,reject){
            try{
                var t =tl.load(url)
                resolve(t);
            }catch(error){
                reject(error)
            }
        });
    }

 

    _makeMaterial(texture){
        return new THREE.SpriteMaterial( { map: texture, color: 0xffffff } );
    }

    async makeSprite(index){
        const allMaterials = await this.all;
        return new THREE.Sprite(allMaterials[index]);
    }
}