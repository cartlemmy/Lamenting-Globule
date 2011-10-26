// Lamenting Globule [version]
// File Class
// lg.file
// (c) [copyright-date] Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com

//!CODE
function lgFile(o) {
	this.sri = new serverRequestInterface(this,"lg.php");
	
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
	
	//Getters
	this.getFolderContents = function(folder, createIfMissing) {
		this.folder = folder ? folder : this.baseDir;
		return this.sri.request("fileGetFolderContents",{folder:this.folder,createIfMissing:createIfMissing},null,{async:false});
	};
	
	//Save / Load
	this.save = function(file, data) {
		var saveData = {};
		if (data.prepForSave) {
			data.prepForSave();
		}
		for (var i in data.saveVars) {
			setDeepRef(saveData, data.saveVars[i],
				getDeepRef(data,data.saveVars[i])
			);
		}
		return this.sri.request("save",{file:file,data:saveData},null,{async:false});
	};
	
	this.load = function(file, data) {
		var l = this.sri.request("load",{file:file},null,{async:false});
		for (var i in data.saveVars) {
			var o = null;
			
			if (o = getDeepRef(l,data.saveVars[i])) {
				setDeepRef(data, data.saveVars[i], o);
			}
		}
		
		if (data.postLoad) {
			data.postLoad();
		}
		
	};
	
	//Set defaults:
	this.setOptions({
		baseDir:".",
		callback:null
	});
	
	if (o) {
		this.setOptions(o);
	}
	
};
