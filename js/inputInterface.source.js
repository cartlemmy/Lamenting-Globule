// Lamenting Globule [version]
// Input Interface
// lg.inputInterface
// (c) [copyright-date] Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com

//!CODE
function lgInputInterface(o) {
	
	//Functions
	this.trigger = function(n,inE) {
		if (typeof(inE) == "object") { this.stopEvent(inE); }
		
		if (n == "down") {
			if (unixTS(true) < this.dblDownTimer + this.dblDownDuration) {
				this.dblDownTimer = 0;
				this.trigger("dbldown",inE);
			} else {
				this.dblDownTimer = unixTS(true);
			}
		}
		
		if (n == "move") {
			this.dblDownTimer = 0;
		}
				
		var alt = this.altOn ? "alt-" : "";
		var e = this.eventConvert(inE);
		if (e[0].offsetX) {
			this.lastE = inE;
		}
		
		for (var i in this.regions) {
			if (n == "down") {
				this.regions[i].lastIn = false;
				this.regions[i].down = true;
				this.regions[i].startX = e[0].offsetX;
				this.regions[i].startY = e[0].offsetY;
			}
			if (n == "out" || n == "up") {
				this.regions[i].down = false;
			}
			if (n == "keydown" || n == "keyup") {
				if (this.regions[i].over || i == "parent") {
					this.callback(i,n,inE);
				}
			}
			for (var j = 0; j < e.length; j++) {
				if (
					e[j].offsetX >= this.regions[i].x1 &&
					e[j].offsetX <= this.regions[i].x2 &&
					e[j].offsetY >= this.regions[i].y1 &&
					e[j].offsetY <= this.regions[i].y2
				) {
					
					if (n == "move") {
						if (!this.regions[i].lastIn) {
							this.regionOver(i,true);
							this.callback(i,alt+"over",{
								x:e[j].offsetX - this.regions[i].x1,
								y:e[j].offsetY - this.regions[i].y1
							});
						}
						this.regions[i].lastIn = true;
					}
					
					var tn = n == "move" && this.regions[i].down ? "drag" : n;
					this.callback(i,alt+tn,{
						x:e[j].offsetX - this.regions[i].x1,
						y:e[j].offsetY - this.regions[i].y1,
						zoom:e[j].zoom,
						movedX:(tn == "drag" ? e[0].offsetX-this.regions[i].startX : false),
						movedY:(tn == "drag" ? e[0].offsetY-this.regions[i].startY : false)
					});
				} else if (n == "move" && this.regions[i].lastIn) {
					this.regions[i].lastIn = false;
					this.regionOver(i,false);
					this.callback(i,alt+"out",{
						x:e[j].offsetX - this.regions[i].x1,
						y:e[j].offsetY - this.regions[i].y1
					});
				}
			}
		}
	};
	
	this.regionOver = function(i,v) {
		this.regions[i].over = v;
		var possible = ["title","style.cursor"];
		for (var j = 0; j < possible.length; j++) {
			var o = getDeepRef(this.regions[i],possible[j]);
			if (o) {
				setDeepRef(this.target,possible[j],v?o:"");
			}		
		}
	};
				
	this.eventConvert = function(e) {
		var rv = e.touches ? e.touches : [e];
		for (var i in rv) {
			if (rv[i].offsetX || rv[i].layerX) {
				rv[i].offsetX = rv[i].offsetX ? rv[i].offsetX : rv[i].layerX;
				rv[i].offsetY = rv[i].offsetY ? rv[i].offsetY : rv[i].layerY;
			}
		}
		return rv;
	};
	 
	this.defineRegion = function(name,bounds) {
		this.regions[name] = bounds;
	};
	
	this.deleteRegion = function(name) {
		delete this.regions[name];
	};
	
	this.isAlt = function(e) {
		if (!e) var e = window.event;
		return ((e.which !== undefined) ? e.which : e.button + 1) == 3;
	};
	
	this.stopEvent = function(e) {
		if (!e && window.event) e = window.event;
		if (e) {
			e.cancelBubble = true;
			if (e.preventDefault) {
				e.preventDefault();
			}
		}	
		return false;
	};
	
	this.getKeyFromEvent = function(e) {
		var k = window.event ? (event ? event.keyCode : e.keyCode) : e.which;
		if ((k >= 0x30 && k <= 0x39) || (k >= 0x41 && k <= 0x5A)) {
			return String.fromCharCode(k).toLowerCase();
		} else if (k < 0x30) {
			var a = [0,1,2,3,4,5,6,7,'backspace','tab',10,11,12,'enter',14,15,'shift',
			'ctrl','alt','pause','caps',21,22,23,24,25,26,'escape',28,29,30,31,'space',
			'pgup','pgdown','end','home','left','up','right','down',41,42,43,44,'insert','delete',47];
			return a[k];
		} else {
			switch (k) {
				case 109: return "minus";
				case 61: return "plus";
				case 144: return "numlock";
				case 188: return "lt";
				case 190: return "gt";
				case 191: return "?";
				case 220: return "|";
				case 222: return "}";
				case 219: return "{";
				default: return k;		
			}
		}
	};
	
	this.isKeyDown = function(k) {
		return this.keyDown["k"+k.toLowerCase()] ? true : false;
	};

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
	
	this.refreshTarget = function() {
		this.regions["parent"] = {x1:0,y1:0,x2:this.target.offsetWidth,y2:this.target.offsetHeight};
	};
	
	this.setTarget = function(target,callback) {
		this.target = target;
		if (this.target !== null) {
			this.regions = {};
			
			this.refreshTarget();
		
			window.ob = this.target.ob = this;
			//!TODO: Change these to addEventListener
			this.target.onmousedown = function(e) { return this.ob.trigger("down",e); };
			this.target.ontouchstart = function(e) { this.ob.trigger("down",e); };
			
			this.target.onmouseup = function(e) { return this.ob.trigger("up",e); };
			this.target.ontouchend = function(e) { this.ob.trigger("up",e); };
						
			this.target.onmousemove = function(e) { this.ob.trigger("move",e); };
			this.target.ontouchmove = function(e) { this.ob.trigger("move",e); };
			
			//!TODO:Implement a way to do these on a touch device
			this.target.addEventListener('DOMMouseScroll', function(e) { e.zoom = e.detail ? e.detail * -1 : e.wheelDelta / 40; this.ob.trigger("zoom",e); }, false);
			this.target.addEventListener('mousewheel', function(e) { e.zoom = e.detail ? e.detail * -1 : e.wheelDelta / 40; this.ob.trigger("zoom",e); }, false);
			
			this.target.onmouseout = function(e) {
				for (var i in this.ob.regions) {
					this.ob.regions[i].down = false;
				}
			}
			
			window.onkeydown = function(e) {
				var k = this.ob.getKeyFromEvent(e);
				this.ob.keyDown["k"+k] = true;
				this.ob.trigger("keydown",k);
				if (k == "space") { if (this.ob.lastE) { this.ob.altOn = true; this.ob.trigger("down", this.ob.lastE); } }
			};
			
			window.onkeyup = function(e) {
				var k = this.ob.getKeyFromEvent(e);
				this.ob.keyDown["k"+k] = false;
				this.ob.trigger("keyup",k);
				if (k == "space") { if (this.ob.lastE) { this.ob.trigger("up",this.ob.lastE); this.ob.altOn = false; } }
			};
			
			this.callback = callback;
		}
	};
	
	//Set defaults:
	this.setOptions({
		target:null,
		callback:function(){},
		regions:{},
		altOn:false,
		dblDownTimer:0,
		dblDownDuration:0.5,
		keyDown:{}
	});
		
	if (o) {
		this.setOptions(o);
	}
};
