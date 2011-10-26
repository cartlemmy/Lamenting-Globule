// Lamenting Globule 0.0 (Apathetic Amoeba)
// Geshi Implementation
// lg.gui
// (c) 2011 Josh "CartLemmy" Merritt
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


function lgGeshi(o){this.sri=new serverRequestInterface(this,"lg.php");this.setOptions=function(o){for(i in o){var n="set"+i.charAt(0).toUpperCase()+i.substr(1);if(this[n]){this[n](o[i])}else{this[i]=o[i]}}};this.setOptions({});this.highlight=function(o){var b=this.sri.request("geshi",o,null,{async:false});if(o.vars){var a=o.vars.split(",");for(var i in a){b.parsed=b.parsed.split(a[i]).join("'''''"+a[i]+"'''''")}b.parsed=b.parsed.wikify(true)}return b.error?o.data:b.parsed};if(o){this.setOptions(o)}};