// Lamenting Globule 0.0 (Apathetic Amoeba)
// File Class
// lg.file
// (c) 2011 Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com


function lgFile(o){this.sri=new serverRequestInterface(this,"lg.php");this.setOptions=function(o){for(i in o){var n="set"+i.charAt(0).toUpperCase()+i.substr(1);if(this[n]){this[n](o[i])}else{this[i]=o[i]}}};this.getFolderContents=function(a,b){this.folder=a?a:this.baseDir;return this.sri.request("fileGetFolderContents",{folder:this.folder,createIfMissing:b},null,{async:false})};this.save=function(a,b){var c={};if(b.prepForSave){b.prepForSave()}for(var i in b.saveVars){setDeepRef(c,b.saveVars[i],getDeepRef(b,b.saveVars[i]))}return this.sri.request("save",{file:a,data:c},null,{async:false})};this.load=function(a,b){var l=this.sri.request("load",{file:a},null,{async:false});for(var i in b.saveVars){var o=null;if(o=getDeepRef(l,b.saveVars[i])){setDeepRef(b,b.saveVars[i],o)}}if(b.postLoad){b.postLoad()}};this.setOptions({baseDir:".",callback:null});if(o){this.setOptions(o)}};