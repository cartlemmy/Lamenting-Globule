// Lamenting Globule [version]
// Compressor / Decompressor
// lg.compress
// (c) [copyright-date] Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com

//!CODE
function lgCompress(o) {
	this.lzw = new lzw();
	
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
	
	//Set defaults:
	this.setOptions({

	});
	
	this.compress = function(o,alg) {
		switch (alg) {
			default:
			case "lzw":
			return this.lzw.encode(json_encode(o));
			
			case "lgml":
			case "html":
			return this.lzw.encode(json_encode(this.compressPredefined(o,alg)));
			
			case "lgs": //Lameting Globule Slide
			return this.compressSliding(json_encode(o));
		}
	};
	
	this.decompress = function(o,alg) {
		switch (alg) {
			default:
			case "lzw":
			return json_decode(this.lzw.decode(o));
			
			case "lgml":
			case "html":
			return this.decompressPredefined(json_decode(this.lzw.decode(o)),alg);
			
			case "lgs":
			return json_decode(this.decompressSliding(o));			
		}
	};
	
	this.compressTable = {
		lgml:["[section]","[/section]","[head]","[/head]",
	"[subhead]","[/subhead]","[subsubhead]","[/subsubhead]","[page]",
	"[url]","[url=","[/url]","[img]","[img ","[/img]","[wiki]",
	"[/wiki]","[wiki]","[wiki=","[/wiki]","[pre]","[/pre]","[code]",
	"[code lang=","[/code]","[size=","[/size]","[color=","[/color]",
	"[table]","[table","[tbody]","[/tbody]","[thead]","[/thead]","[tr]",
	"[/tr]","[td]","[/td]","[/table]","[clear]","===","\n==","==\n",
	"'''","'''''","http://","http://www.",".com",".org",".html","...",
	" target=_blank"," the "," and "," that "," have "," for "," not ",
	" with "," you "," this "," from "," they "," will "," would ",
	" there "," their "," what "," about "," which "," make ",
	"width=","height=","alt=","title=",".png",".jpeg",".jpg",
	".gif"],
		html:["<!DOCTYPE html","-//W3C//DTD XHTML 1.0 Transitional",
	"http://www.w3.org/"," href=\"","<script type=\"text/javascript\"",
	"</script>","<div ","</div>","class=\"","style=\""," onclick=",
	" onmouseover="," onmouseout="," onmousedown="," onmouseup=","<br>",
	"<!-- "," -->","<br />","<span ","</span>","<img ","&nbsp;","</a>",
	"target=","<link","src=\"","type=\"text/css\"","http://"," type=",
	" http-equiv="," rel="," id=\"","</table>","<tr>","</tr>","</td>",
	"http://www.",".com",".org",".html","float:","width:","height:",
	"window.location","text-align:","font-weight:","font-style:",
	"<font ","</font>","name=\"keywords\"","<title>","</title>",
	"document.getElementById(","..."," target=_blank"," the "," and ",
	" that "," have "," for "," not "," with "," you "," this ",
	" from "," they "," will "," would "," there "," their "," what ",
	" about "," which "," make ","width=","height=","alt=","title=",
	".png",".jpeg",".jpg",".gif"]
	};
	
	this.compressPredefined = function(o,t) {
		o = o.split("!").join("!!");
		for (i in this.compressTable[t]) {
			o = o.split(this.compressTable[t][i]).join("!"+String.fromCharCode(48+Number(i)));
		}
		//dg('debug').value = o;
		return(o);
	};
	
	this.decompressPredefined = function(o,t) {	
		for (i in this.compressTable[t]) {
			o = o.split("!"+String.fromCharCode(48+Number(i))).join(this.compressTable[t][i]);
		}
		return o.split("!!").join("!");
	};
	
	this.compressSliding = function(input) {
		return "";
	};
	
	this.decompressSliding = function(o) {
		return "";
	};
	
	this.splitNibble = function(v) {
		var h1 = "", h2 = "";
		for (var i = 0; i < v.length; i += 2) {
			h2 += v.substr(i,1);
			h1 += v.substr(i+1,1);
		}
		return h1 + h2;
	};
	
	this.joinNibble = function(v) {
		var rv = "";
		for (var i = 0; i < (v.length >> 1); i++) {
			rv += v.substr(i+(v.length >> 1),1) + v.substr(i,1);
		}
		return rv;
	};
	
	if (o) {
		this.setOptions(o);
	}
};
