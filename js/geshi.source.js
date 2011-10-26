// Lamenting Globule [version]
// Geshi Implementation
// lg.gui
// (c) [copyright-date] Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com
//
/*
          GeSHi - GEneric Syntax HIghlighter
        ----------------------------------
                
Author:          Benny Baumann, Nigel McNie
Email:           BenBE@geshi.org, nigel@geshi.org
GeSHi Website:   http://qbnz.com/highlighter

*/

//!CODE
function lgGeshi(o) {
	this.sri = new serverRequestInterface(this,"lg.php");

	//Setters
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
	
	//Set defaults
	this.setOptions({
		
	});
	
	//Functions
	this.highlight = function(o) {
		var rv = this.sri.request("geshi",o,null,{async:false});
		if (o.vars) {
			var a = o.vars.split(",");
			for (var i in a) {
				rv.parsed = rv.parsed.split(a[i]).join("'''''"+a[i]+"'''''");
			}
			rv.parsed = rv.parsed.wikify(true);
		}
		return rv.error ? o.data : rv.parsed;
	};
	
	if (o) {
		this.setOptions(o);
	}
};
