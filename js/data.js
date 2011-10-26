// Lamenting Globule 0.0 (Apathetic Amoeba)
// Data Manipulateion
// lg.data
// (c) 2011 Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com


function lgData(o){this.setOptions=function(o){for(i in o){var n="set"+i.charAt(0).toUpperCase()+i.substr(1);if(this[n]){this[n](o[i])}else{this[i]=o[i]}}};this.getColNames=function(o,a,b,c){if(!b)var b={};if(!c)var c=0;for(var i in o){for(var j in o[i].data){if(o[i].data[j][1]!="collection"&&!b[j]){b[j]=j}}if(o[i].data["collection"]){if(!a||c<a){b=this.getColNames(o[i].data["collection"][0],a,b,c+1)}}}return b};this.dataObjectToText=function(o){switch(typeOf(o)){case"string":return o;case"object":return"Object";case"array":switch(o[1]){case"s":case"n":return o[0];case"b":return o[2]?o[2][o[0]]:(o[0]?"YES":"NO");case"i":case"k":return"Not implemented";case"ts":return date(o[2]?o[2]:"n/j/Y g:ia",Number(o[0]));case"mime":return o[0];case"bytes":var v=o[0];var n=0;var t=["B","KB","MB","GB","TB"];while(v>1024){n++;v=v>>10}return(n?Math.round(v*100)/100:v)+t[n]}default:case"null":case"undefined":case"false":return"N/A"}};this.setOptions({data:null});if(o){this.setOptions(o)}};