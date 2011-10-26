// Lamenting Globule [version]
// Core Engine
// lg.core
// (c) [copyright-date] Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com

//!CODE
function lgCore(o) {
	this.anch = new createAnchor(this);
	
	//Setters:
	this.setOptions = function(o) {
		for (i in o) {
			var n = "set" + i.charAt(0).toUpperCase() + i.substr(1);
			if (this[n]) { // Has a setter
				this[n](o[i]);
			} else {
				this[i] = o[i];
			}
		}
	};
	
	this.setFpsMax = function(fps) {
		this.fpsMax = fps;
		this.fpsMaxMS = 1000 / fps;
	};
	
	//Timer functions
	this.requestAnimationFrame = function(callback,ms) {
		if (ms === false) { //idle
			window.setTimeout(this.anch.callbackCode(callback), 200);
		} else {
			eval("var cb = this."+callback+";");
			if (!window.requestAnimationFrame(cb)) {
				window.setTimeout(this.anch.callbackCode(callback), ms);
			}
		}
	};
	
	//Set defaults:
	this.setOptions({
		//Graphics
		ctx:null,
		renderer:null,
		render:false,
		frame:0,
		fpsBuffer:[],
		fps:0,
		fpsMax:30,
		lastGraphicsUpdate:unixTS(true),
		
		//Physics
		lastPhysicsUpdate:unixTS(true),
		physicsInterval:15
	});
	
	//Updaters
	this.graphicsUpdate = function() {
		if (this.render) {
			var duration = unixTS(true) - this.lastGraphicsUpdate;
			this.lastGraphicsUpdate = unixTS(true);
			this.fpsBuffer[frame & 63] = duration;
			this.frame ++;
			if ((this.frame & 63) == 0) {

				var n = 0, t = 0;
				for (var i = 0; i < 64; i ++) {
					if (this.fpsBuffer[i]) {
						n += 1 / this.fpsBuffer[i];
						t++;
					}
				}
				
				this.fps = Math.round(n / t);
			}			
			if (this.renderer && this.ctx) {
				this.renderer.draw(this.ctx);
			}
		}
	};	
		
	this.physicsUpdate = function() {};
	
	if (o) {
		this.setOptions(o);
	}
};

var lgCoreRef = null;

function lgCoreAnimate() {
    lgCoreRef.graphicsUpdate();
    requestAnimationFrame(lgCoreAnimate);
};

function lgCorePhysicsUpdate() {
	var now = unixTS(true);
	var t = now - lgCoreRef.lastPhysicsUpdate;
	lgCoreRef.lastPhysicsUpdate = now;
    lgCoreRef.physicsUpdate(t);
    setTimeout(lgCorePhysicsUpdate, lgCoreRef.physicsInterval);
};

function lgCoreRegister(core) {
	lgCoreRef = core;
	lgCoreAnimate();
	lgCorePhysicsUpdate();
};

window.requestAnimationFrame = (function(){
    //Check for each browser
    //@paul_irish function
    //Globalises this function to work on any browser as each browser has a different namespace for this
    return  window.requestAnimationFrame       ||  //Chromium
            window.webkitRequestAnimationFrame ||  //Webkit
            window.mozRequestAnimationFrame    || //Mozilla Geko
            window.oRequestAnimationFrame      || //Opera Presto
            function(callback, element){ //Fallback function
                window.setTimeout(callback, 1000/60);               
            }
     
})();
