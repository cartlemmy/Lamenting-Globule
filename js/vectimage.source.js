// Lamenting Globule [version]
// Vector Image Renderer
// lg.vectimage
// (c) [copyright-date] Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com

//!CODE
function lgVectimage(o) {
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
	
	this.setCallback = function(callback) {
		this.callback = callback;
	};
	
	this.styleMask = function(style) {
		if (typeof(style) == "string") {
			var style = style.split(",");
			var rv = 0;
			for (var i = 0; i < style.length; i++) {
				if (this.styles.indexOf(style[i]) != -1) {
					rv = rv | Math.pow(2,this.styles.indexOf(style[i]));
				}
			}
		} else {
			var rv = style;
		}
		return rv;
	};
	
	this.setCtx = function(ctx) {
		this.mainCtx = ctx;
		if (ctx != null) {
			ctx.canvas.ob = this;
			ctx.canvas.onclick = function(e) {
				this.ob.doCallback("click",e);
			};
			ctx.canvas.style.cursor = "pointer";
		
			this.width = ctx.canvas.width;
			this.height = ctx.canvas.height;
		}
	};

	this.setData = function(data) {
		this.loading = 0;
		if (data.global) {
			for (var i in data.global) {
				this.global[i] =  data.global[i].value != undefined ? data.global[i].value :  data.global[i];
			}
		}
		this.data = data;
		this.preload();
	};
	
	this.setAttr = function(n,v,d) {
		switch (n) {
			case "fillStyle":
				if (typeof(v) == "object") {
					if (v.r1) {
						var g = this.ctx.createRadialGradient(v.x1-d.x, v.y1-d.y, v.r1, v.x2-d.x, v.y2-d.y, v.r2);
					} else {
						var g = this.ctx.createLinearGradient(v.x1-d.x, v.y1-d.y, v.x2-d.x, v.y2-d.y);
					}
					for (var i in v.stops) {
						g.addColorStop(v.stops[i][0],v.stops[i][1]);
					}
					this.ctx[n] = g;
					break;
				} else {
					this.ctx[n] = v;
				}
				break;
			
			case "angle":
				this.ctx.translate(d.x,d.y);
				this.ctx.rotate(v);
				this.ctx.translate(-d.x,-d.y);
				break;
				
			case "scale":
				this.ctx.translate(d.x,d.y);
				if (typeof(v) == "array") {
					this.ctx.scale(v[0],v[1]);
				} else {
					this.ctx.scale(v,v);
				}
				this.ctx.translate(-d.x,-d.y);
				break;
				
			default:
				this.ctx[n] = v;
				break;
		}
	};
	
	this.preload = function() {
		if (!this.data.layers) { return; }
		for (var i = 0; i < this.data.layers.length; i++) {
			this.doPreload(this.data.layers[i],{w:this.mainCtx.canvas.width,h:this.mainCtx.canvas.height});
		}		
	};
	
	this.doPreload = function(d,parent) {
		if (!d.length) { return; }
		
		for (var i = 0; i < d.length; i++) {
			var di = d[i];
			this.calcAllParams(di,parent);
			var name = typeof(di.t) == "number" ? this.types[di.t] : di.t;
			switch (name) {
				case "img":					
					var n = simpleHash(di.image ? di.image : di.src);
					if (!this.images[n]) {
						this.images[n] = new Image();
						this.images[n].src = di.image ? this.data.images[di.image] : di.src;
						this.images[n].ob = this;
						this.images[n].onload = function() {
							this.ob.loading--;
							if (this.ob.loading == 0) {
								this.ob.loaded();
							}
						};
						this.loading++;
					}
					break;
					
				case "children":
					this.doPreload(di.c,di);
					break;
			}
		}
	};
	
	this.loaded = function() {
		if (this.renderOnLoad) {
			this.render();
		}
	};
			
	this.render = function() {
		if (this.loading) {
			this.renderOnLoad = true;
			return false;
		}
		this.mainCtx.clearRect(0,0,this.mainCtx.canvas.width,this.mainCtx.canvas.height);
		for (var i = 0; i < this.data.layers.length; i++) {
			var tmp = document.createElement('canvas');
			tmp.setAttribute('width',this.mainCtx.canvas.width);
			tmp.setAttribute('height',this.mainCtx.canvas.height);
			this.ctx = tmp.getContext('2d');
			this.doRender(this.data.layers[i],{w:this.mainCtx.canvas.width,h:this.mainCtx.canvas.height});
			this.mainCtx.drawImage(this.ctx.canvas,0,0);
		}
		this.doCallback("rendered");
		if (this.cache) {
			var sri = new serverRequestInterface(this,this.cacheHandler?this.cacheHandler:"lg.php");
			
			var data = this.mainCtx.canvas.toDataURL("image/"+this.cache.split(".").pop());

			sri.request('cacheImage',{file:this.cache,data:data});
		}
		return true;
	};
	
	this.doRender = function(d,parent) {
		if (!d.length) { return; }

		for (var i = 0; i < d.length; i++) {
			var di = d[i];
			var name = typeof(di.t) == "number" ? this.types[di.t] : di.t;
			
			if (name != "translate") { this.ctx.save(); }
			
			
			var n = "draw" + name.charAt(0).toUpperCase() + name.substr(1);

			if (typeof(this[n]) == "function") {
				this.di = di;
				if (this.styleMask(di.s) & 4) { this.ctx.globalCompositeOperation = "destination-out"; }
				
				for (var j in this.conv) {
					if (di[j]) {
						this.setAttr(this.conv[j],di[j],di);
					} else if (di[this.conv[j]]) {
						this.setAttr(this.conv[j],di[this.conv[j]],di);
					}
				}

				this.calcAllParams(di,parent);
								
				this.ctx.beginPath(); 
				
				if (di.lw) { this.ctx.lineWidth = di.lw; }
				if (di.fs) { this.ctx.fillStyle = di.fs; }
				if (di.ss) { this.ctx.strokeStyle = di.ss; }
				if (this[n](di)) {
					if (this.styleMask(di.s) & 1) { this.ctx.stroke(); }
					if (this.styleMask(di.s) & 2 || this.styleMask(di.s) & 4) { this.ctx.fill(); }
					if (this.styleMask(di.s) & 8) { this.ctx.clip(); }
				}
				//this.di = null;
			}
			
			if (name != "translate") { this.ctx.restore(); }
		}
		
	};

	this.calcAllParams = function(di,parent) {
		var c = [
			"lw","lc","lj","ml","sx","sy","sb","sc","fs","ss",
			"tf","ta","tb","gco","ga","a","z","x","y","z","x1",
			"y1","x2","y2","h","w","cx","cy","cx1","cy1","cx2",
			"cy2","r","text","src"
		];
		
		for (var j in c) {
			if (di[c[j]] != undefined || di[c[j]+"_orig"] != undefined) { 
				
				if (di[c[j]+"_orig"] == undefined && typeof(di[c[j]]) == "string" && di[c[j]].substr(0,1) == "=") {
					di[c[j]+"_orig"] = di[c[j]];
				}
				if (di[c[j]+"_orig"] != undefined) {
					di[c[j]] = this.calcParam(di[c[j]+"_orig"],di,parent);
				}
			}
		}
	};
				
	this.calcParam = function(v,t,u) {
		if (typeof(v) == "string" && v.substr(0,1) == "=") {
			var n = simpleHash(t.image ? t.image : t.src);
			if (this.images[n]) {
				t.width = this.images[n].naturalWidth;
				t.height = this.images[n].naturalHeight;
				t.prop = this.images[n].naturalWidth / this.images[n].naturalHeight;
			}
			try {
				eval(("rv = " + v.substr(1)).split("this.").join("t.").split("lgvi.").join("this.").split("parent.").join("u.").split("global.").join("this.global.")+";");
			} catch (e) {
				return null;
			}
			return rv;
		}
		return v;
	};
	
	this.drawRect = function(d) {
		this.ctx.rect(d.x, d.y, d.w, d.h);
		return true;
	};
	
	this.drawArc = function(d) {
		this.ctx.arc(d.x, d.y, d.r, d.a1, d.a2, d.acw);
		return true;
	};
	
	this.drawCircle = function(d) {
		this.ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2, false);
		return true;
	};
	
	this.drawChildren = function(d) {
		this.ctx.save();
		this.ctx.translate(d.x,d.y);
		this.doRender(d.c,d);
		this.ctx.restore();
		return false;
	};
	
	this.drawMulti = function(d) {
		this.ctx.translate(d.x,d.y);
		this.ctx.beginPath();
		this.ctx.moveTo(0,0);
					
		for (var i in d.p) {
			var di = d.p[i];
			this.calcAllParams(di,d);
		
			switch (di.t) {
				case "move":
				this.ctx.moveTo(di.x,di.y);
				break;
				
				case "quad":
				this.ctx.quadraticCurveTo(di.cx,di.cy,di.x,di.y);
				break;
				
				case "bez":
				this.ctx.bezierCurveTo(di.cx1,di.cy1,di.cx2,di.cy2,di.x,di.y);
				break;
				
				default:
				this.ctx.lineTo(di.x,di.y);
				break;
			}
		}
		this.ctx.closePath();
		return true;
	};

	this.drawImg = function(d) {
		var n = simpleHash(d.image ? d.image : d.src);
		if (d.sx) {
			this.ctx.drawImage(this.images[n],d.sx,d.sy,d.sw,d.sh,d.x,d.y,d.w,d.h);
		} else {
			this.ctx.drawImage(this.images[n],d.x,d.y,d.w,d.h);
		}
		return false;
	};
	
	this.drawText = function(d) {
		if (this.styleMask(d.s) & 2) {
			this.ctx.fillText(d.text,d.x,d.y);
		}
		if (this.styleMask(d.s) & 1) {
			this.ctx.strokeText(d.text,d.x,d.y);
		}
		return false;
	};
	
	this.drawTranslate = function(d) {
		this.ctx.translate(d.x,d.y);
	};
	
	this.drawFilter = function(d) {
		var image = this.ctx.getImageData(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		var data = image.data;
		var size = this.ctx.canvas.width * this.ctx.canvas.height * 4;
		
		switch (d.c) {
			case "hsl":
				for (var i = 0; i < size; i += 4) {
					var a = data[i+3];
					var hsl = this.rgbToHsl(data[i]/255,data[i+1]/255,data[i+2]/255);
					var h = hsl[0],s = hsl[1],l = hsl[2];
					eval(d.f);
					var rgb = this.hslToRgb(h,s,l);
					data[i] = Math.round(rgb[0]*255);
					data[i+1] = Math.round(rgb[1]*255);
					data[i+2] = Math.round(rgb[2]*255);
					data[i+3] = a;
				}
				break;
				
			case "rgb": default:
				for (var i = 0; i < size; i += 4) {
					var r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
					eval(d.f);
					data[i] = r;
					data[i+1] = g;
					data[i+2] = b;
					data[i+3] = a;
				}
				break;
		}
		
		image.data = data;
		this.ctx.putImageData(image, 0, 0);
	};
	
	this.fontStyle = function(width,style,font,text,maxFontSize) {
		if (!this.mainCtx) return;
		var size = 32;
		this.mainCtx.font = (style ? style+" " : "")+size+"px "+font;
		var dist = 0;
		var step = 16;
		var best = 0, bestDist = 100;
		while (Math.abs(dist = this.mainCtx.measureText(text).width - width) > 1 || best == 0) {
			size += dist > 0 ? -step : step;
			step --; if (step < 1) step = 1;			
			this.mainCtx.font = (style ? style+" " : "")+size+"px "+font;
			if (Math.abs(dist) < bestDist && dist <= 0) {
				bestDist = Math.abs(dist);
				best = size;
			} else if (step == 1) {
				break;
			}
		}
		best = maxFontSize ? Math.min(maxFontSize,best) : best;
		
		this.mainCtx.font = (style ? style+" " : "")+best+"px "+font;

		this.di.width = this.mainCtx.measureText(text).width;
		this.di.height = best;
		return (style ? style+" " : "")+best+"px "+font;
	};
		
	this.fit = function(w,h) {
		if (!this.di) return {x:0,y:0,w:0,h:0};
		var prop = w / h;
		if (this.di.prop > prop) {
			var uh = w/this.di.prop;
			return {x:0,y:(h-uh)/2,w:w,h:uh};
		} else {
			var uw = h*this.di.prop;
			return {x:(w-uw)/2,y:0,w:uw,h:h};
		}
	};
	
	this.el = function(ref,parent) {
		if (!this.data.layers) { return; }
		var rv = null;
		for (var i = 0; i < this.data.layers.length; i++) {
			if ((rv = this.doEl(ref,this.data.layers[i])) !== null) {
				return rv;
			}
		}
		return null;
	};
	
	this.doEl = function(ref,d) {
		for (var i = 0; i < d.length; i++) {
			if (d[i].id && d[i].id == ref) return d[i];
			if (d[i].name == "children") {
				var rv;
				if ((rv = this.doEl(ref,d[i].c)) !== null) {
					return rv;
				}
			}
		}
		return null;
	};
	
	this.doCallback = function(type,e) {
		if (typeof(this.callback) == "function") {
			if (typeof(e) != "object") { e = {}; }
			e.type = type;
			this.callback(e);
		}
	};
	
	// Color conversion
	this.hslToRgb = function(h, s, l) {
		var x,y,r,g,b;

		y = (l > .5) ?
			l + s - l * s:
			l * (s + 1);
		x = l * 2 - y;
		r = this.hToC(x, y, h + 1 / 3);
		g = this.hToC(x, y, h);
		b = this.hToC(x, y, h - 1 / 3);
		return [r,g,b];
	};

	this.rgbToHsl = function(r, g, b) {
		var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
		var h, s, l = (mx + mn) / 2;

		if (mx == mn){
			h = s = 0; // achromatic
		} else {
			var d = mx - mn;
			s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
			switch(mx){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return [h, s, l];
	};
	
	this.hToC = function(x,y,h) {
		var c;
		if(h < 0) {
			h += 1;
		}
		if(h > 1) {
			h -= 1;
		}
		if (h<1/6) {
			c = x +(y - x) * h * 6;
		} else {
			if(h < 1/2) {
				c=y;
			} else {
				if(h < 2/3) {
					c=x + (y - x) * (2 / 3 - h) * 6;
				} else {
					c=x;
				}
			}
		}
		return c;
	};
	
	//Set defaults:
	this.setOptions({
		ctx:null,
		width:0,
		height:0,
		global:{},
		data:{},
		types:[
			"fillRect","strokeRect","clearRect","arc","circle","multi","children"
		],
		styles:[
			"stroke","fill","clear","clip"
		],
		conv:{
			"lw":"lineWidth","lc":"lineCap","lj":"lineJoin","ml":"miterLimit",
			"sx":"shadowOffsetX","sy":"shadowOffsetY","sb":"shadowBlur","sc":"shadowColor",
			"fs":"fillStyle","ss":"strokeStyle",
			"tf":"font","ta":"textAlign","tb":"textBaseline",
			"gco":"globalCompositeOperation","ga":"globalAlpha","a":"angle","z":"scale"
		},
		images:{},
		loading:0,
		renderOnLoad:false
	});
	
	if (o) {
		this.setOptions(o);
	}
};

function textWidth(font,text) {
	var c = document.createElement('canvas');
	var ctx = c.getContext('2d');
	ctx.font = font;
	return ctx.measureText(text).width;
};
