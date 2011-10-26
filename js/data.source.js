// Lamenting Globule [version]
// Data Manipulateion
// lg.data
// (c) [copyright-date] Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com

//!CODE
function lgData(o) {
	
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
	
	this.getColNames = function(o,depth,rv,level) {
		if (!rv) var rv = {};
		if (!level) var level = 0;
		for (var i in o) {
			for (var j in o[i].data) {
				
				if (o[i].data[j][1] != "collection" && !rv[j]) {
					rv[j] = j;
				}
			}
 
			if (o[i].data["collection"]) {
				if (!depth || level < depth) {
					rv = this.getColNames(o[i].data["collection"][0],depth,rv,level+1);
				}
			}
		}
		return rv;
	};
	
	this.dataObjectToText = function(o) {
		switch (typeOf(o)) {
			case "string":
			return o;
			
			case "object":
			return "Object";
			
			case "array":
			//alert(debugObject(o,"createView",12));
			switch (o[1]) {
				case "s": // String
				case "n": // Number
				return o[0];
				
				case "b": // Boolean
				return o[2] ? o[2][o[0]] : (o[0] ? "YES" : "NO");
				
				case "i": //index (numeric)
				case "k": //index (string)
				return "Not implemented";
				
				case "ts": //Unix timestamp
				return date(o[2]?o[2]:"n/j/Y g:ia",Number(o[0]));
				
				case "mime":
				return o[0];
				
				case "bytes":
				var v = o[0];
				var n = 0;
				var t = ["B","KB","MB","GB","TB"];
				while (v > 1024) {
					n++;
					v = v >> 10;
				}
				return (n?Math.round(v*100)/100:v)+t[n];
			}			
			
			default:
			case "null":
			case "undefined":
			case "false":
			return "N/A";			
		}
	};
	
	//Set defaults:
	this.setOptions({
		data:null
	});
		
	if (o) {
		this.setOptions(o);
	}
};
