// Lamenting Globule [version]
// General Functions
// lg.general
// (c) [copyright-date] Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com

//!CODE
function copyObject( oldObject, appendObject ) {
	var rv = typeOf(oldObject) == "array" ? [] : {};
	
	for (i in oldObject) {
		//if (typeof(oldObject[i]) == "object") {
		//	rv[i] = copyObject(oldObject[i]);
		//} else {
			rv[i] = oldObject[i];
		//}
	}
	
	if (appendObject) {
		for (i in appendObject) {
			rv[i] = appendObject[i];
		}
	}
	return rv;
};

function setInnerHTML(d,html) {
	if (html.trim() != "") {
		try {
			d.innerHTML = html;
		} catch (e) {}
	}
};

String.prototype.cleanLink = function() {
    return this.split(/[^\w\d\-]/).join("_");
};

String.prototype.repeat = function( num ) {
    return new Array( num + 1 ).join( this );
};

String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
};

String.prototype.ltrim = function() {
	return this.replace(/^\s+/,"");
};

String.prototype.rtrim = function() {
	return this.replace(/\s+$/,"");
};

String.prototype.text2HTML = function() {
	if (this == " ") return "&nbsp;";
	return this.replace(/^ | $/g,"&nbsp;").split(/ {2}/).join(" &nbsp;").split("\n").join("<br />");
};

String.prototype.hex = function() {
	var rv = "";
	for (var i = 0; i < this.length; i ++) {
		if (this.charCodeAt(i) <= 255) {
			rv += dec2Hex(this.charCodeAt(i),2);
		} else {
			rv += ("&#"+this.charCodeAt(i)+";").hex();
		}
	}
	return rv;
};

String.prototype.decimalPad = function(n) {
	var s = this.split(".");
	if (n == 0) { return s[0]; }
	if (s.length == 1) { s.push("0"); }
	while (s[1].length != n) {
		if (s[1].length > n) {
			s[1] = s[1].substr(0,n);
		} else {
			s[1] += "0";
		}
	}
	return s[0]+"."+s[1];
};

Number.prototype.decimalPad = function(n) {
	return String(this).decimalPad(n);
};

String.prototype.safeString = function() {
	var escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	var meta = { // table of character substitutions
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"': '\\"',
		'\\': '\\\\'
	};

	escapable.lastIndex = 0;
	return escapable.test(this) ? '"' + this.replace(escapable, function (a) {
		var c = meta[a];
		return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	}) + '"' : '"' + this + '"';
};


String.prototype.hex2bin = function() {
	var rv = "";
	for (var i = 0; i < this.length; i += 2) {
		rv += String.fromCharCode(hexToNibble(this.substr(i,1))<<4|hexToNibble(this.substr(i+1,1)));
	}
	return rv;
};

String.prototype.splitParams = function() {
	var lastPos = 0, pos = 0;
	var e = "";
	while ((pos = this.regexIndexOf(/[\'\"]/, pos)) !== -1) {
		var f = this.substr(pos,1);	
		pos ++;
		e += this.substr(lastPos,pos-lastPos-1);
		
		lastPos = pos;
		pos = this.indexOf(f,pos);
	
		if (pos === -1) break;
		e += escape(this.substr(lastPos,pos-lastPos));
		pos++;
		
		lastPos = pos;
	}
	if (lastPos == 0) {
		return this.split(' ');
	}
	
	var e = e.split(' ');
	for (i in e) {
		var a = e[i].split("=",2);
		if (a.length > 1) {
			e[i] = a[0]+"="+unescape(a[1]);
		}
	}
	return e;
};

String.prototype.wikify = function(toHTML) {
	var s = this.split(/\=\=\=\=([^\n\t]+)\=\=\=\=\n{0,1}/);
	for (var i = 1; i < s.length; i += 2) {
		s[i] = "[subsubhead]"+s[i]+"[/subsubhead]";
	}
	s = s.join("").split(/\=\=\=([^\n\t]+)\=\=\=\n{0,1}/);
	
	for (var i = 1; i < s.length; i += 2) {
		s[i] = "[subhead]"+s[i]+"[/subhead]";
	}
	s = s.join("").split(/\=\=([^\n\t]+)\=\=\n{0,1}/);
	
	for (var i = 1; i < s.length; i += 2) {
		s[i] = "[head]"+s[i]+"[/head]";
	}
	s = s.join("").split(/\'\'\'\'\'([^\n\t\']+)\'\'\'\'\'/);
	
	for (var i = 1; i < s.length; i += 2) {
		s[i] = "[b][i]"+s[i]+"[/i][/b]";
	}
	
	s = s.join("").split(/\'\'\'([^\n\t\']+)\'\'\'/);
	
	for (var i = 1; i < s.length; i += 2) {
		s[i] = "[b]"+s[i]+"[/b]";
	}
	
	s = s.join("").split(/\'\'([^\n\t\']+)\'\'/);
	
	for (var i = 1; i < s.length; i += 2) {
		s[i] = "[i]"+s[i]+"[/i]";
	}
	s = s.join("").split(/\n\:/);
	for (var i = 1; i < s.length; i ++) {
		s[i] = "\n[tab]"+s[i];
	}
	s = s.join("");	
	
	s = s.split("\n----\n").join("\n[hr]");
	
	if (toHTML) {
		var f = 	["subsubhead",	"subhead",	"head",	"b","i","hr"];
		var t = 	["h3",			"h2",		"h1",	"b","i","hr"];
		for (var i = 0; i < f.length; i++) {
			s = s.split("["+f[i]+"]").join("<"+t[i]+">");
			s = s.split("[/"+f[i]+"]").join("</"+t[i]+">");
		}
		
	}
	return s;
};

function docWidth() {
	return document.body.offsetWidth;
};

function docHeight() {
	return document.body.offsetHeight;
};

function urlencode(t) {
	return escape(t).split("+").join('%2B').split("%20").join('+').split("*").join('%2A').split("/").join('%2F').split("@").join('%40');
};

function dec2Hex(n,l){
	if(!l){l=1;}
	var h='0123456789ABCDEF';
	var rv = new Array();
	for (var i = l - 1; i >= 0; i--) {
		rv.push(h.charAt((n>>(i*4))&15));
	}
	return rv.join("");
};

function binaryData(fromHex) {
	this.data = fromHex;
	this.getBit = function (bit) {
		var mask = [1,2,4,8];
		return hexToNibble(this.data.charAt(bit >> 2)) & mask[bit & 3] ? 1 : 0;
	};
	
	this.setBit = function (bit,v) {
		var mask = [1,2,4,8];
		var rmask = [14,13,11,7];
		var i = bit >> 2;
		var v = dec2Hex((hexToNibble(this.data.charAt(i)) & rmask[bit & 3]) | (v ? mask[bit & 3] : 0));
		this.data = this.data.substr(0,i) + v + this.data.substr(i+1);
	};
		
	this.bitLength = function() {
		return Math.ceil(this.data.length * 4);
	};
};

function hexToNibble(hex) {
	var hex = hex.charCodeAt(0);
	if (hex >= 48 && hex <= 57) {
		return hex - 48;
	} else if (hex >= 65 && hex <= 70) {
		return hex - 55;
	} else if (hex >= 97 && hex <= 102) {
		return hex - 87;
	}
	return -1;
};

function simpleHash(n,l) {
	switch (typeOf(n)) {
		case "array":
			n = n.join(",");
			break;
			
		case "string":
			break;
		
		default:
			n = serialize(n);
			break;
	}
	
	if (!l) l = 8;
	var c = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
	var v = [];
	for (var i = 0; i < l; i++) {
		v.push(0);
	}
	
	for (var i = 0; i < n.length; i++) {
		v[i%v.length] = (v[i%v.length] ^ n.charCodeAt(i)) % c.length;
	}
	var rv = "";
	for (var i = 0; i < v.length; i++) {
		rv += c.substr(v[i],1);
	}
	return rv;
};
	
function dc(t) {
	return document.createElement(t);
};

function dg(id,p,t,a,pre) {
	if (id !== "" && document.getElementById(id)) {
		return document.getElementById(id);
	} else {
		var d = document.createElement(t);
		if (id !== "") { d.id = id; }
		if (p) { 
			if (pre) {
				p.insertBefore(d, p.firstChild);
			} else {
				p.appendChild(d);
			}
		}
		recursiveSet(d,a);
		return d;
	}
	return false;
};

function getNodeTree(parent,ref,rv) {
	if (!rv) { rv = {}; }
	if (!ref) { ref = []; }
	if (parent.childNodes) {
		for (var i = 0; i < parent.childNodes.length; i++) {
			var c = parent.childNodes[i];
			ref.push(c.name?c.name:String(i));
			rv[ref.join(".")] = c;
			rv = getNodeTree(c,ref,rv);
			ref.pop();
		}	
	}
	return rv;
};

function byteArray(s) {
	this.s = typeof(s) == "number" ? ("\0").repeat(s) : s;
	
	this.getString = function(p,l) {
		return this.s.substr(p,l);
	};
	
	this.getByte = function(p) {
		return this.s.charCodeAt(p) & 255;
	};
	
	this.setByte = function(p,v) {
		this.s = this.s.substr(0,p) + String.fromCharCode(v & 255) + this.s.substr(p+1);
	};
};

function serverRequestInterface(ref,base) {
	this.base = base;
	this.requests = Array();
	this.ref = ref;
	
	this.setRef = function(ref) {
		this.ref = ref;
	};
	
	this.setBase = function(base) {
		this.base = base;
	};
	
	this.request = function(action,data,callback,o) {
		if (o !== undefined) {
			o.async = o.async === undefined ? true : o.async;
			o.method = o.method === undefined ? "POST" : o.method;
		} else {
			var o = {async:true,method:"POST"};
		}
		if (!o.async) {
			return this.requestObject(action,data,callback,this,o);
		} else {		
			this.requests.push(new this.requestObject(action,data,callback,this,o));
		}
	};
	
	this.requestObject = function(action,data,callback,parent,o) {
		this.newHTTPRequest = function() { 
			if (window.XMLHttpRequest) { 
				 return new XMLHttpRequest();
			} else if (window.ActiveXObject) {
				 return new ActiveXObject("Microsoft.XMLHTTP");
			}
		};
		this.ref = parent.ref;
		this.parent = parent;
		this.action = action;
		this.data = "v="+urlencode(serialize(data));
		this.dataRaw = data;
		this.callback = callback;
		this.conn = this.newHTTPRequest();
		if (o.async) {
			this.conn.ob = this;
			this.conn.onreadystatechange = function() {
				switch (this.readyState) {
					case 4:
					if (this.ob.callback) {
						this.ob.callback(this,evalVars(this.responseText),this.ob);
					}
					break;
				}
			};
		}
		this.conn.open(o.method, parent.base+"?action="+action, o.async, o.user ? o.user : undefined, o.password ? o.password : undefined);
		this.conn.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		this.conn.send(this.data);
		if (!o.async && this.conn.readyState == 4 ) {
			if (this.conn.status == 200) {
				switch (o.returnType) {
					case "body":
					return this.conn.responseBody;
					
					case "text":
					return this.conn.responseText;
					
					case "ajax":
					default:
					return evalVars(this.conn.responseText);
				}
			}
		}
		return false;
	};
};

function evalVars(txt) {
	try {
		var rv = !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
		txt.replace(/"(\\.|[^"\\])*"/g, ''))) &&
		eval('(' + txt + ')');
		return rv;
	} catch (e) {
		return false;
	}
};

function stopEvent(e) {
	if (!e && window.event) e = window.event;
	if (e) {
		e.cancelBubble = true;
		if (e.preventDefault) {
			e.preventDefault();
		}
	}
	return false;
};

function unixTS(dontRound) {
	var currentTime = new Date();
	if (dontRound) {
		return currentTime.getTime() / 1000;
	} else {
		return Math.floor(currentTime.getTime() / 1000);
	}
};

function createAnchor(d) {
	this.uid = "anch"+unixTS()+"_"+((Math.random()*0xFFFF)|0);
	this.boat = d;
	window[this.uid] = this;
	this.q = [];
		
	this.doFunc = function(n) {
		this.boat[this.q[n].f](this.q[n].p,this.boat);
	};
	
	this.requestAnimationFrame = function(f,p,t) {
		this.q.push({f:f,p:p});
		setTimeout("document.getElementById('"+this.uid+"').ob.doFunc("+(this.q.length-1)+")",t);
	};
	
	this.callbackCode = function(callback,p) {
		this.q.push({f:callback,p:p});
		return "window."+this.uid+".doFunc("+(this.q.length-1)+")";
	};
};

function getDeepRef(o,r,delim) {
	if (delim === undefined) delim = ".";
	if (typeof(r) == "string") { r = r.split(delim); }
	var n = r.shift();
	if (o[n]) {
		if (r.length) {
			return getDeepRef(o[n],r,delim);
		} else {
			return o[n];
		}
	}
	return false;
};

function setDeepRef(o,r,v,delim) {
	if (delim === undefined) delim = ".";
	if (typeof(r) == "string") { r = r.split(delim); }
	var n = r.shift();

	if (r.length) {
		if (!o[n]) o[n] = {};
		setDeepRef(o[n],r,v,delim);
	} else {
		o[n] = v;
	}
	return false;
};

function recursiveSet(d,a) {
	for (var i in a) {
		if (typeof(a[i]) == "object") {
			recursiveSet(d[i],a[i]);
		} else {
			d[i] = a[i];
		}
	}
};

function serialize (mixed_value) {
    // http://kevin.vanzonneveld.net
    // +   original by: Arpad Ray (mailto:arpad@php.net)
    // +   improved by: Dino
    // +   bugfixed by: Andrej Pavlovic
    // +   bugfixed by: Garagoth
    // +      input by: DtTvB (http://dt.in.th/2008-09-16.string-length-in-bytes.html)
    // +   bugfixed by: Russell Walker (http://www.nbill.co.uk/)
    // +   bugfixed by: Jamie Beck (http://www.terabit.ca/)
    // +      input by: Martin (http://www.erlenwiese.de/)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net/)
    // +   improved by: Le Torbi (http://www.letorbi.de/)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net/)
    // +   bugfixed by: Ben (http://benblume.co.uk/)
    // -    depends on: utf8_encode

    var _utf8Size = function (str) {
        var size = 0,
            i = 0,
            l = str.length,
            code = '';
        for (i = 0; i < l; i++) {
            code = str.charCodeAt(i);
            if (code < 0x0080) {
                size += 1;
            } else if (code < 0x0800) {
                size += 2;
            } else {
                size += 3;
            }
        }
        return size;
    };
    var _getType = function (inp) {
        var type = typeof inp,
            match;
        var key;

        if (type === 'object' && !inp) {
            return 'null';
        }
        if (type === "object") {
            if (!inp.constructor) {
                return 'object';
            }
            var cons = inp.constructor.toString();
            
            try {
				match = cons.match(/(\w+)\(/);
			} catch (e) { 
				return 'null';
			}
			
            if (match) {
                cons = match[1].toLowerCase();
            }
            var types = ["boolean", "number", "string", "array"];
            for (key in types) {
                if (cons == types[key]) {
                    type = types[key];
                    break;
                }
            }
        }
        return type;
    };
    var type = _getType(mixed_value);
    var val, ktype = '';

    switch (type) {
    case "function":
        val = "";
        break;
    case "boolean":
        val = "b:" + (mixed_value ? "1" : "0");
        break;
    case "number":
		if (isNaN(mixed_value)) { // So NaN's do not break it
			val = "d:0";
		} else {
			val = (Math.round(mixed_value) == mixed_value ? "i" : "d") + ":" + mixed_value;
		}
        break;
    case "string":
        val = "s:" + _utf8Size(mixed_value) + ":\"" + mixed_value + "\"";
        break;
    case "array":
    case "object":
        val = "a";
/*
            if (type == "object") {
                var objname = mixed_value.constructor.toString().match(/(\w+)\(\)/);
                if (objname == undefined) {
                    return;
                }
                objname[1] = this.serialize(objname[1]);
                val = "O" + objname[1].substring(1, objname[1].length - 1);
            }
            */
        var count = 0;
        var vals = "";
        var okey;
        var key;
        for (key in mixed_value) {
            if (mixed_value.hasOwnProperty(key)) {
                ktype = _getType(mixed_value[key]);
                if (ktype === "function") {
                    continue;
                }

                okey = (key.match(/^[0-9]+$/) ? parseInt(key, 10) : key);
                vals += this.serialize(okey) + this.serialize(mixed_value[key]);
                count++;
            }
        }
        val += ":" + count + ":{" + vals + "}";
        break;
    case "undefined":
        // Fall-through
    default:
        // if the JS object has a property which contains a null value, the string cannot be unserialized by PHP
        val = "N";
        break;
    }
    if (type !== "object" && type !== "array") {
        val += ";";
    }
    return val;
};

function debugObject(ob,name,maxRecursion,level,ignore) {
	if (!level) level = 0;
	if (!ignore) ignore = "";
	if (!maxRecursion) maxRecursion = 1;
	var dbg = Array(level+1).join("\t")+"("+typeOf(ob)+") "+(name?name+": ":"");

	switch (typeOf(ob)) {
		//case "function":
		//dbg += "Code Hidden.";
		//break;
		
		case "null":
		dbg += "NULL";
		break;
		
		case "array":
		case "object":
		if (level < maxRecursion) {
			dbg+="\n";
			var txt = Array();
			for (var i in ob) {
				if (typeof(ob[i]) != "function") {
					dbg += debugObject(ob[i],i,maxRecursion,level+1,ignore);
				}
			}
		} else {
			dbg += "Beyond max recursion.";
		}
		break;
		
		default:
		dbg += ob;
		break;
	}
	
	return dbg+"\n";
};

function typeOf(value) {
    var s = typeof value;
    if (s === 'object') {
        if (value) {
            if (value instanceof Array) {
                s = 'array';
            }
        } else {
            s = 'null';
        }
    }
    return s;
};

function optionDefaults(o,defaults) {
	if (!o) {
		o = {};
	}
	for (var i in defaults) {
		if (o[i] === undefined) {
			o[i] = defaults[i];
		}
	}
	return o;
};


function json_encode (mixed_val) {
    // http://kevin.vanzonneveld.net
    // +      original by: Public Domain (http://www.json.org/json2.js)
    // + reimplemented by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      improved by: Michael White
    // +      input by: felix
    // +      bugfixed by: Brett Zamir (http://brett-zamir.me)
    // *        example 1: json_encode(['e', {pluribus: 'unum'}]);
    // *        returns 1: '[\n    "e",\n    {\n    "pluribus": "unum"\n}\n]'
	/*
        http://www.JSON.org/json2.js
        2008-11-19
        Public Domain.
        NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
        See http://www.JSON.org/js.html
    */
    var retVal, json = this.window.JSON;
    try {
        if (typeof json === 'object' && typeof json.stringify === 'function') {
            retVal = json.stringify(mixed_val); // Errors will not be caught here if our own equivalent to resource
            //  (an instance of PHPJS_Resource) is used
            if (retVal === undefined) {
                throw new SyntaxError('json_encode');
            }
            return retVal;
        }

        var value = mixed_val;

        var str = function (key, holder) {
            var gap = '';
            var indent = '    ';
            var i = 0; // The loop counter.
            var k = ''; // The member key.
            var v = ''; // The member value.
            var length = 0;
            var mind = gap;
            var partial = [];
            var value = holder[key];

            // If the value has a toJSON method, call it to obtain a replacement value.
            if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

            // What happens next depends on the value's type.
            switch (typeof value) {
            case 'string':
                return value.safeString();

            case 'number':
                // JSON numbers must be finite. Encode non-finite numbers as null.
                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':
                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.
                return String(value);

            case 'object':
                // If the type is 'object', we might be dealing with an object or an array or
                // null.
                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.
                if (!value) {
                    return 'null';
                }
                if ((this.PHPJS_Resource && value instanceof this.PHPJS_Resource) || (window.PHPJS_Resource && value instanceof window.PHPJS_Resource)) {
                    throw new SyntaxError('json_encode');
                }

                // Make an array to hold the partial results of stringifying this object value.
                gap += indent;
                partial = [];

                // Is the value an array?
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.
                    v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // Iterate through all of the keys in the object.
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(k.safeString() + (gap ? ': ' : ':') + v);
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.
                v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
            case 'undefined':
                // Fall-through
            case 'function':
                // Fall-through
            default:
                throw new SyntaxError('json_encode');
            }
        };

        // Make a fake root object containing our value under the key of ''.
        // Return the result of stringifying the value.
        return str('', {
            '': value
        });

    } catch (err) { // Todo: ensure error handling above throws a SyntaxError in all cases where it could
        // (i.e., when the JSON global is not available and there is an error)
        if (!(err instanceof SyntaxError)) {
            throw new Error('Unexpected error type in json_encode()');
        }
        this.php_js = this.php_js || {};
        this.php_js.last_error_json = 4; // usable by json_last_error()
        return null;
    }
};

function json_decode(o) {
	eval("o = "+o);
	return o;
};

if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(searchElement /*, fromIndex */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0)
      return -1;

    var n = 0;
    if (arguments.length > 0)
    {
      n = Number(arguments[1]);
      if (n !== n) // shortcut for verifying if it's NaN
        n = 0;
      else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }

    if (n >= len)
      return -1;

    var k = n >= 0
          ? n
          : Math.max(len - Math.abs(n), 0);

    for (; k < len; k++)
    {
      if (k in t && t[k] === searchElement)
        return k;
    }
    return -1;
  };
}

function date (format, timestamp) {
    var that = this,
        jsdate, f, formatChr = /\\?([a-z])/gi,
        formatChrCb,
        // Keep this here (works, but for code commented-out
        // below for file size reasons)
        //, tal= [],
        _pad = function (n, c) {
            if ((n = n + '').length < c) {
                return new Array((++c) - n.length).join('0') + n;
            }
            return n;
        },
        txt_words = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    formatChrCb = function (t, s) {
        return f[t] ? f[t]() : s;
    };
    f = {
        // Day
        d: function () { // Day of month w/leading 0; 01..31
            return _pad(f.j(), 2);
        },
        D: function () { // Shorthand day name; Mon...Sun
            return f.l().slice(0, 3);
        },
        j: function () { // Day of month; 1..31
            return jsdate.getDate();
        },
        l: function () { // Full day name; Monday...Sunday
            return txt_words[f.w()] + 'day';
        },
        N: function () { // ISO-8601 day of week; 1[Mon]..7[Sun]
            return f.w() || 7;
        },
        S: function () { // Ordinal suffix for day of month; st, nd, rd, th
            var j = f.j();
            return j > 4 || j < 21 ? 'th' : {1: 'st', 2: 'nd', 3: 'rd'}[j % 10] || 'th';
        },
        w: function () { // Day of week; 0[Sun]..6[Sat]
            return jsdate.getDay();
        },
        z: function () { // Day of year; 0..365
            var a = new Date(f.Y(), f.n() - 1, f.j()),
                b = new Date(f.Y(), 0, 1);
            return Math.round((a - b) / 864e5) + 1;
        },

        // Week
        W: function () { // ISO-8601 week number
            var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3),
                b = new Date(a.getFullYear(), 0, 4);
            return _pad(1 + Math.round((a - b) / 864e5 / 7), 2);
        },

        // Month
        F: function () { // Full month name; January...December
            return txt_words[6 + f.n()];
        },
        m: function () { // Month w/leading 0; 01...12
            return _pad(f.n(), 2);
        },
        M: function () { // Shorthand month name; Jan...Dec
            return f.F().slice(0, 3);
        },
        n: function () { // Month; 1...12
            return jsdate.getMonth() + 1;
        },
        t: function () { // Days in month; 28...31
            return (new Date(f.Y(), f.n(), 0)).getDate();
        },

        // Year
        L: function () { // Is leap year?; 0 or 1
            return new Date(f.Y(), 1, 29).getMonth() === 1 | 0;
        },
        o: function () { // ISO-8601 year
            var n = f.n(),
                W = f.W(),
                Y = f.Y();
            return Y + (n === 12 && W < 9 ? -1 : n === 1 && W > 9);
        },
        Y: function () { // Full year; e.g. 1980...2010
            return jsdate.getFullYear();
        },
        y: function () { // Last two digits of year; 00...99
            return (f.Y() + "").slice(-2);
        },

        // Time
        a: function () { // am or pm
            return jsdate.getHours() > 11 ? "pm" : "am";
        },
        A: function () { // AM or PM
            return f.a().toUpperCase();
        },
        B: function () { // Swatch Internet time; 000..999
            var H = jsdate.getUTCHours() * 36e2,
                // Hours
                i = jsdate.getUTCMinutes() * 60,
                // Minutes
                s = jsdate.getUTCSeconds(); // Seconds
            return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
        },
        g: function () { // 12-Hours; 1..12
            return f.G() % 12 || 12;
        },
        G: function () { // 24-Hours; 0..23
            return jsdate.getHours();
        },
        h: function () { // 12-Hours w/leading 0; 01..12
            return _pad(f.g(), 2);
        },
        H: function () { // 24-Hours w/leading 0; 00..23
            return _pad(f.G(), 2);
        },
        i: function () { // Minutes w/leading 0; 00..59
            return _pad(jsdate.getMinutes(), 2);
        },
        s: function () { // Seconds w/leading 0; 00..59
            return _pad(jsdate.getSeconds(), 2);
        },
        u: function () { // Microseconds; 000000-999000
            return _pad(jsdate.getMilliseconds() * 1000, 6);
        },

        // Timezone
        e: function () { // Timezone identifier; e.g. Atlantic/Azores, ...
            // The following works, but requires inclusion of the very large
            // timezone_abbreviations_list() function.
/*              return this.date_default_timezone_get();
*/
            throw 'Not supported (see source code of date() for timezone on how to add support)';
        },
        I: function () { // DST observed?; 0 or 1
            // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
            // If they are not equal, then DST is observed.
            var a = new Date(f.Y(), 0),
                // Jan 1
                c = Date.UTC(f.Y(), 0),
                // Jan 1 UTC
                b = new Date(f.Y(), 6),
                // Jul 1
                d = Date.UTC(f.Y(), 6); // Jul 1 UTC
            return 0 + ((a - c) !== (b - d));
        },
        O: function () { // Difference to GMT in hour format; e.g. +0200
            var a = jsdate.getTimezoneOffset();
            return (a > 0 ? "-" : "+") + _pad(Math.abs(a / 60 * 100), 4);
        },
        P: function () { // Difference to GMT w/colon; e.g. +02:00
            var O = f.O();
            return (O.substr(0, 3) + ":" + O.substr(3, 2));
        },
        T: function () { // Timezone abbreviation; e.g. EST, MDT, ...
            // The following works, but requires inclusion of the very
            // large timezone_abbreviations_list() function.
/*              var abbr = '', i = 0, os = 0, default = 0;
            if (!tal.length) {
                tal = that.timezone_abbreviations_list();
            }
            if (that.php_js && that.php_js.default_timezone) {
                default = that.php_js.default_timezone;
                for (abbr in tal) {
                    for (i=0; i < tal[abbr].length; i++) {
                        if (tal[abbr][i].timezone_id === default) {
                            return abbr.toUpperCase();
                        }
                    }
                }
            }
            for (abbr in tal) {
                for (i = 0; i < tal[abbr].length; i++) {
                    os = -jsdate.getTimezoneOffset() * 60;
                    if (tal[abbr][i].offset === os) {
                        return abbr.toUpperCase();
                    }
                }
            }
*/
            return 'UTC';
        },
        Z: function () { // Timezone offset in seconds (-43200...50400)
            return -jsdate.getTimezoneOffset() * 60;
        },

        // Full Date/Time
        c: function () { // ISO-8601 date.
            return 'Y-m-d\\Th:i:sP'.replace(formatChr, formatChrCb);
        },
        r: function () { // RFC 2822
            return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
        },
        U: function () { // Seconds since UNIX epoch
            return jsdate.getTime() / 1000 | 0;
        }
    };
    this.date = function (format, timestamp) {
        that = this;
        jsdate = ((typeof timestamp === 'undefined') ? new Date() : // Not provided
        (timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
        new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
        );
        return format.replace(formatChr, formatChrCb);
    };
    return this.date(format, timestamp);
};

function lgError(e,message) {
	alert(message+"\n\n"+debugObject(e,"e",3));
};

function base64_decode (data, urlSafe) {
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"+(urlSafe?"-._":"+/=");
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,        dec = "",
        tmp_arr = [];
 
    if (!data) {
        return data;    }
 
    data += '';
 
    do { // unpack four hexets into three octets using index points in b64
		h1 = b64.indexOf(data.charAt(i++));
        h2 = b64.indexOf(data.charAt(i++));
        h3 = b64.indexOf(data.charAt(i++));
        h4 = b64.indexOf(data.charAt(i++));
        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
 
        o1 = bits >> 16 & 0xff;
        o2 = bits >> 8 & 0xff;
        o3 = bits & 0xff; 
        if (h3 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1);
        } else if (h4 == 64) {
            tmp_arr[ac++] = String.fromCharCode(o1, o2);        } else {
            tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
        }
    } while (i < data.length);
    dec = tmp_arr.join('');
    return dec;
};

function base64_encode (data,urlSafe) {
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"+(urlSafe?"-._":"+/=");
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        enc = "",
        tmp_arr = []; 
    if (!data) {
        return data;
    }
    //data = this.utf8_encode(data + '');
 
    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);        o3 = data.charCodeAt(i++);
 
        bits = o1 << 16 | o2 << 8 | o3;
 
        h1 = bits >> 18 & 0x3f;        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;
 
        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);
 
    enc = tmp_arr.join('');
        var r = data.length % 3;
    
	return (r ? enc.slice(0, r - 3) : enc) + (urlSafe ? '___' : '===').slice(r || 3);
};
