// Lamenting Globule [version]
// Color Class
// lg.color
// (c) [copyright-date] Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com

//!CODE
function lgColor(o) {
	//Conversion Functions
		
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
	
	this.setFromIntRGB = function(c) {
		this.colorRGB = c;
	};
	
	this.setFromFloatRGB = function(r,g,b) {
		if (typeof(r) == "object") { g = r[1]; b = r[2]; r = r[0]; }
		this.setFromByteRGB(
			Math.min(0,Math.max(255,(r*255)|0)),
			Math.min(0,Math.max(255,(g*255)|0)),
			Math.min(0,Math.max(255,(b*255)|0))
		);
	};
	
	this.setFromByteRGB = function(r,g,b) {
		if (typeof(r) == "object") { g = r[1]; b = r[2]; r = r[0]; }
		this.colorRGB = r<<16 | g<<8 | b;
	};
	
	
	this.setFromFloatHSL = function(h,s,l) {
		if (typeof(h) == "object") { s = h[1]; l = h[2]; h = h[0]; }
		var rgb = this.hslToRgb(h,s,l);
		this.setFromFloatRGB(rgb[0],rgb[1],rgb[2]);
	};
	
	this.setFromByteHSL = function(h,s,l) {
		if (typeof(h) == "object") { s = h[1]; l = h[2]; h = h[0]; }
		this.setFromFloatHSL(h/255,s/255,l/255);
	};
	
	//Getters
	this.getIntRGB = function() {
		return this.colorRGB;
	};
	
	this.getHexRGB = function() {
		return dec2Hex(this.colorRGB,6);
	};
	
	this.getFloatRGB = function() {
		var rgb = this.getByteRGB();
		return [rgb[0]/255,rgb[1]/255,rgb[2]/255];
	};
	
	this.getByteRGB = function() {
		return [(c>>16)&255,(c>>8)&255,c&255];
	};
	
	this.getFloatHSL = function() {
		var rgb = this.getFloatRGB();
		return this.rgbToHsl(rgb[0],rgb[1],rgb[2]);
	};
	
	this.getByteHSL = function() {
		var rgb = this.getFloatRGB();
		var hsl = this.rgbToHsl(rgb[0],rgb[1],rgb[2]);
		return [(h*255)&255,(s*255)&255,(l*255)&255];
	};
	
	//Converter
	this.convert = function(v,from,to) {
		this["setFrom"+from](v);
		return this["get"+to]();
	};
	
	//Color Functions
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
	
	this.hslToRgb = function(h, s, l) {
		var x;
		var y;
		var r;
		var g;
		var b;

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
	
	//Set defaults:
	this.setOptions({
		colorRGB:0
	});
	
	if (o) {
		this.setOptions(o);
	}
};
