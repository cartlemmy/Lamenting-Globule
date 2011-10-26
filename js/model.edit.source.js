// Lamenting Globule [version]
// Voxel Model Editor
// lg.model.edit
// (c) [copyright-date] Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com

//!TODO
/*
 * Toolbar
 * Load palette
 * Select Voxel(s)
 * Pick selected color
 * z-sort no perspective views
 * Erase tool
 * Move tool (move shortcuts as well)
 * Mirror tool (per view) (Draws a mirror image of what you are drawing)
 * Stretch tool
 * Sphere Tool
 * Box Tool
 * Fill Tool
 * Import image as voxels
 * Import image as reference
 * Hollow tool - discards extra voxels
 * 'parent' node - a node that a part can be connected to
 * Add more 'parts'
 * Allow specifying 'shinyness' of voxels
 * 
 */

//!CODE
function lgModelEdit(o) {
	this.anch = new createAnchor(this);
	this.model = new lgModel();
	this.ii = new lgInputInterface();
	this.ii.editor = this;
	this.colorClass = new lgColor();
	this.gui = new lgGUI();
	
	//GUI Elements:
	this.toolbarElement = dg("toolbar", document.body, "div", {
		style:{
			zIndex:2,
			position:"absolute",
			top:"0px"
		}
	});
	
	this.toolbarCallback = function(o,view,ob) {
		
		if (o.action == "selected") {
			ob.setSelectedTool(o.selected);
		} else if (o.action == "click") {
			switch (o.name) {
				case "load":
					ob.gui.createDialouge({
						viewType:"alert",
						t:"fileOpen",
						folder:"voxel",
						clickToChoose:true,
						filter:{
							selectable:"file-ext:obj"
						},
						callback:function(o,view,ob) {
							switch (o.action) {
								case "choose":
								ob.load(o.data.path[0],ob);
								this.gui.remove(this.handle);
								break;
							}
						}
					},ob);

					break;
				
				case "save":
					if (ob.saveName) {
						ob.save();
						break;
					}
				case "save-as":
				
					ob.gui.createDialouge({
						viewType:"alert",
						t:"fileSave",
						folder:"voxel",
						file:ob.saveName,
						clickToChoose:true,
						filter:{
							selectable:"file-ext:obj"
						},
						callback:function(o,view,ob) {
							switch (o.action) {
								case "save":
								ob.saveName = view.folder+"/"+(view.path?view.path+"/":"")+view.file;
								ob.save();
								this.gui.remove(this.handle);
								break;
							}
						}
					},ob);
					
					break;
					
				case "render":
					if (document.getElementById("renderCanvas")) {
						document.body.removeChild(document.getElementById("renderCanvas"));
					}
					
					ob.anim = [];
					for (var a = 0; a < Math.PI * 2; a += Math.PI * 1/4) {
						var ctx = this.ob.model.render(a);
						var mult = 8;		
						var bigCanvas = document.createElement('canvas');
						bigCanvas.setAttribute('width',ctx.canvas.width * mult);
						bigCanvas.setAttribute('height',ctx.canvas.height * mult);
						var bigCtx = bigCanvas.getContext('2d');
			
						var pd = new this.ob.model.pixelData(ctx);
						
						for (var y = 0; y < ctx.canvas.height; y ++) {
							for (var x = 0; x < ctx.canvas.width; x ++) {
								var c = pd.get(x,y);
								if (c.a) {
									bigCtx.fillStyle = "#"+dec2Hex(c.r,2)+dec2Hex(c.g,2)+dec2Hex(c.b,2);
									bigCtx.fillRect(x*mult,y*mult,mult,mult);
								}
							}
						}
			
						bigCtx.canvas.style.position = "absolute";
						bigCtx.canvas.style.left = ((1680/2)-Math.floor(bigCtx.canvas.width/2))+"px";
						bigCtx.canvas.style.top = "100px";
						bigCtx.canvas.style.backgroundColor = "#FFFFFF";
						bigCtx.canvas.style.border = "1px solid #000000";
						
						bigCtx.canvas.id = "renderCanvas";
						bigCtx.canvas.zIndex = 10000;
						document.body.appendChild(bigCtx.canvas);
						ob.anim.push(bigCanvas);
					}
					setInterval("rotateIt()",1000);
					break;
			}
		}
	};
	
	this.toolbarView = this.gui.createView({
		parentElement:this.toolbarElement,
		layout:[
			{t:"toolGroup",title:"File",path:"images/icons/",data:
				[
					{t:"icon",name:"load",data:{img:"actions/document-open",title:"Load Model"}},
					{t:"icon",name:"save",data:{img:"actions/document-save",title:"Save Model"}},
					{t:"icon",name:"save-as",data:{img:"actions/document-save-as",title:"Save Model As..."}},
					{t:"icon",name:"help",data:{img:"apps/help-browser",title:"How To Use",href:"./?lgVoxelEditor",target:"_blank"}},
					{t:"icon",name:"render",data:{img:"draw/render",title:"Render Model"}}
				]
			},
			{name:"draw",t:"toolGroup",selectable:1,title:"Tools",path:"images/icons/",data:
				[
					{t:"icon",name:"select",data:{img:"draw/select",title:"Select"}},
					{t:"icon",name:"move",data:{img:"draw/move",title:"Move"}},
					{t:"icon",name:"voxel",data:{img:"draw/voxel",title:"Voxel"}},
					{t:"icon",name:"color",data:{img:"draw/color",title:"Color"}},
					{t:"icon",name:"fill",data:{img:"draw/fill",title:"Fill"}},
					{t:"icon",name:"basePoint",data:{img:"draw/basePoint",title:"basePoint"}}
				]
			}
		],
		callback:this.toolbarCallback
	}, this);
	
	
	//Console / Status
	this.consoleLog = function(t) {
		if (this.consoleElement) {
			this.consoleLines.push(t);
			if (this.consoleLines.length > this.consoleLimit) { this.consoleLines.shift(); }
			this.consoleElement.value = this.consoleLines.join("\n");
			this.consoleElement.scrollTop = this.consoleElement.scrollHeight;
		}
	};
	
	this.setStatus = function(t) {
		if (this.statusElement !== null) {
			this.statusElement.innerHTML = t;
		}
	};
	
	this.padNumber = function(n) {
		var n = String(n).split(".");
		if (n.length == 1) n.push("0");
		n[1] = n[1].substr(0,3);
		while (n[0].length < 4) { n[0] = " "+n[0]; }
		while (n[1].length < 3) { n[1] += "0"; }
		return n.join(".");
	};
	
	//Save / load
	this.prepForSave = function() {
		this.viewAdjustable.rotate = !!this.viewAdjustable.rotate;
		this.model.prepForSave();
	};
	
	this.save = function() {
		var file = new lgFile();
		file.save(this.saveName,this);
	};
	
	this.load = function(path) {
		this.cleanUp();
		var file = new lgFile();
		file.load(path,this);
	};
	
	this.postLoad = function() {
		if (this.viewAdjustable.rotate) {
			this.startRotate();
		}
		this.redraw();
	};
	
	this.cleanUp = function() {
		try { clearInterval(this.viewAdjustable.rotate); } catch (e) {}
	};
	
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
	
	this.setCtx = function(ctx) {
		this.model.ctx = this.ctx = ctx;
		if (ctx !== null) {
			if (!this.cursorCtx) {
				var tmp = document.createElement('canvas');
				tmp.setAttribute('width',64);
				tmp.setAttribute('height',64);
				this.cursorCtx = tmp.getContext('2d');
			}
			this.ii.setTarget(ctx.canvas,function(r,n,e) {
				
				var view = this.editor[r];
				if (r == "parent") {
					if (n == "keydown") {
						switch (e) {
							case "m":
							this.editor.drawXYZMarker = !this.editor.drawXYZMarker;
							this.editor.refreshAllViews();
							break;
							
							case "l":
							this.editor.drawCurrentSliceOnly = !this.editor.drawCurrentSliceOnly;
							this.editor.refreshAllViews();
							break;
							
							case "delete":
							this.editor.model.removeNodes(this.editor.model.selectedNodes);
							this.editor.refreshAllViews();
							break;
							
						}
					}
				} else {
					if (!view) return;
					if (view.t) {
						
						if (n == "keydown") {
							var p = null;
							switch (e) {
								case "w": //Push up
								var p = [0,-1,0];
								break;
								
								case "s": //Push down
								var p = [0,1,0];
								break;
								
								case "a": //Push left
								var p = [-1,0,0];
								break;
								
								case "d": //Push right
								var p = [1,0,0];
								break;
								
								case "r": //Push in
								var p = [0,0,-1];
								break;
								
								case "f": //Push out
								var p = [0,0,1];
								break;
							}
							if (p) {
								this.editor.model.moveNodes(this.editor.model.selectedNodes,this.editor.tranformDimensions(view.t,p));
								this.editor.refreshAllViews();
							}
						}
					
						this.editor.currentView = view;
						var cp = this.editor.getCenterPoint(view,true);
						this.editor.cursor = this.editor.model.transformTo3D(e.x-Math.round(cp.x+view.offX),e.y-Math.round(cp.y+view.offY),view.zoom,view.t,this.editor.currentSlice);
						this.editor.cursor.x = Math.floor(this.editor.cursor.x);
						this.editor.cursor.y = Math.floor(this.editor.cursor.y);
						this.editor.cursor.z = Math.floor(this.editor.cursor.z);
						
						this.editor.setStatus(r+": (zoom:"+this.editor.padNumber(view.zoom)+", x:"+this.editor.padNumber(this.editor.cursor.x)+", y:"+this.editor.padNumber(this.editor.cursor.y)+", z:"+this.editor.padNumber(this.editor.cursor.z)+")  Node Count: "+this.editor.model.nodeCount);
						
						if (view.zoom !== undefined && n == "zoom") {
							if (e.zoom > 0) {
								view.zoom *= 1+(e.zoom / 3)*(Math.pow(2,1/5) - 1);
							} else if (e.zoom < 0) {
								view.zoom /= 1-(e.zoom / 3)*(Math.pow(2,1/5) - 1);
							}
							if (Math.abs(view.zoom - 1) < 0.0001) { view.zoom = 1; }
								
							this.editor.setStatus(r+": (zoom:"+this.editor.padNumber(view.zoom)+")");
							this.editor.refreshView(view);
						}
						this.editor.refreshCursor();
					}
					
					if (view.t) {
						if (n == "alt-down") {
							view.oldOffX = view.offX;
							view.oldOffY = view.offY;
						} else if (n == "alt-drag") {
							view.offX = view.oldOffX + e.movedX;
							view.offY = view.oldOffY + e.movedY;
							this.editor.refreshView(view);
						}
					}
					
					if (view.drawable) {
						if (n == "move") {
							if (this.isKeyDown('shift')) {
								this.editor.setSlice(view);
								this.editor.refreshAllViews();
							}
							this.editor.checkForOver(view);
						}
						
						if (n == "down") {
							this.editor.toolStart = true;
							this.editor.toolUse("start",view);
						}
						if (n == "drag" || n == "down") {
							this.editor.toolUse("update",view);
						}
						if ((n == "out" || n == "up") && this.editor.toolStart) {
							this.editor.toolStart = false;
							this.editor.toolUse("stop",view);
						}
					}
				}
				this.editor[r+"InputEvent"](n,e);
			});
		}
	};
	
	this.setBounds = function(x1,y1,x2,y2) {
		return {x1:x1,y1:y1,x2:x2,y2:y2,w:x2-x1,h:y2-y1,xc:(x1+x2)/2,yc:(y1+y2)/2};
	};
	
	this.setConsoleElement = function(console) { // Must be a textarea
		this.consoleLines = [];
		this.consoleElement = console;
		this.consoleLog("Lamenting Globule [version]\nVoxel Model Editor\nConsole started.\n");
	};
	
	this.setStatusElement = function(status) { // Must be a div or span
		this.statusElement = status;
	};
	
	this.setSelectedTool = function(tool) {
		if (this.selectedTool != tool) {
			this.selectedTool = tool;
			this.gui.view(this.toolbarView).getElement("draw").o.select(tool);
		}
	};
	
	//Set defaults:
	this.setOptions({
		cursorCtx:null,
		ctx:null,
		width:0,
		height:0,
		hGuides:[],
		vGuides:[],
		currentView:null,
		viewToolbar:{type:"toolbar",ul:1},
		viewPalette:{type:"palette",ul:1},
		palette:null,
		selectedColor:[0,0,0],
		viewTop:{drawable:1,zoom:8,center:1,offX:0,offY:0,t:[1,0,0,0,1,0]},
		viewSide:{drawable:1,zoom:8,offX:0,offY:0,t:[0,1,0,0,0,-1]},
		viewFront:{drawable:1,zoom:8,offX:0,offY:0,t:[1,0,0,0,0,-1]},
		viewAdjustable:{zoom:8,offX:0,offY:0,t:[1,0,0,0,(2/3),-1,1],shade:1},
		lastZSortAngle:0,
		adjustableViewAngle:0,
		adjustableViewSkew:(2/3),
		adjustableViewRotateSpeed:(Math.PI / 48),
		consoleLimit:100, // Number of lines
		consoleElement:null,
		statusElement:null,
		cursor:{x:0,y:0,z:0},
		currentSlice:{x:0,y:0,z:0},
		drawCurrentSliceOnly:true,
		drawXYZMarker:true,
		sliceSize:64,
		snap:1,
		nodeSnap:5,
		overNode:null,
		selectedNode:null,
		selectedTool:"voxel",
		saveName:"",
		saveVars:["viewToolbar","viewPalette","palette","selectedColor",
			"viewTop","viewSide","viewFront","viewAdjustable",
			"adjustableViewAngle","adjustableViewSkew",
			"adjustableViewRotateSpeed","cursor","currentSlice",
			"drawCurrentSliceOnly","drawXYZMarker","sliceSize","snap",
			"nodeSnap","selectedTool","saveName","model.nodes",
			"model.nodeCount","model.startA1","model.startA2"
		]
	});

	//Input Interface
	this.parentInputEvent = function(){};
	
	this.viewToolbarInputEvent = function(n,e){
	};
	
	this.viewPaletteInputEvent = function(n,e){
		if (n == "down") {
			var c = ((e.x/this.viewPalette.cellW)|0)*this.viewPalette.rows+((e.y/this.viewPalette.cellH)|0);

			this.setOptions({selectedColor:this.palette[c]});
		}	
	};
	
	this.viewTopInputEvent = function(){};
	
	this.viewSideInputEvent = function(){};
	
	this.viewFrontInputEvent = function(){};
	
	this.viewAdjustableRotate = function() {
		this.setAdjustableViewAngle(this.adjustableViewAngle + this.adjustableViewRotateSpeed);
	};
		
	this.viewAdjustableInputEvent = function(n,e) {
		switch (n) {
			case "dbldown":

			if (this.viewAdjustable.rotate) {
				clearInterval(this.viewAdjustable.rotate);
				this.viewAdjustable.rotate = null;
			} else {
				this.startRotate();
			}
			break;
			
			case "down":
			this.viewAdjustable.oldAngle = this.viewAdjustable.rotate ? this.adjustableViewRotateSpeed : this.adjustableViewAngle;
			break;
			
			case "drag":
			if (!this.ii.isKeyDown("space")) {
				var v = this.viewAdjustable.oldAngle + e.movedX/(this.viewAdjustable.bounds.w/(Math.PI*3));
				if (this.viewAdjustable.rotate) {
					this.adjustableViewRotateSpeed = v;
				} else {
					this.setAdjustableViewAngle(v);
				}
			}
			break;
		}
	};
	
	this.startRotate = function () {
		this.viewAdjustable.rotate = setInterval(this.anch.callbackCode("viewAdjustableRotate"), 100);
	};
	
	//Editor Functions
	this.checkForOver = function(view) {
		var nodes = this.model.allNodes();
		var closest = this.nodeSnap;
		var lastOver = this.overNode;
		this.overNode = null;
		for (var i = 0; i < nodes.length; i++) {
			switch (this.getsliceDimension(view.t)) {
				case 1:
				if (nodes[i].x == this.currentSlice.x && nodes[i].y == this.cursor.y && nodes[i].z == this.cursor.z) {
					this.overNode = nodes[i];
				}
				break;
				case 2:
				if (nodes[i].x == this.cursor.x && nodes[i].y == this.currentSlice.y && nodes[i].z == this.cursor.z) {
					this.overNode = nodes[i];
				}
				break;
				case 3:
				if (nodes[i].x == this.cursor.x && nodes[i].y == this.cursor.y && nodes[i].z == this.currentSlice.z) {
					this.overNode = nodes[i];
				}
				break;
			}
			if (this.overNode) break;
		}
		if (this.overNode != lastOver) {
			this.model.setSelectedNodes([this.overNode]);
			this.refreshAllViews();
		}
	};
	
	this.toolUse = function(action,view) {
		if (!this.ii.isKeyDown("space")) {
			if (this.cursor) {
				this.setSlice(view);
				switch (this.selectedTool) {
					case "voxel":
						this.viewAdjustable.t[6] = 1
						if (this.model.addNode(false,{
							t:this.model.typeByName(this.selectedTool),
							x:this.cursor.x,
							y:this.cursor.y,
							z:this.cursor.z,
							f:this.colorClass.convert(this.selectedColor,"ByteRGB","IntRGB")
						})) { break; }
						
					case "color":
						this.model.colorNode({
							x:this.cursor.x,
							y:this.cursor.y,
							z:this.cursor.z,
							f:this.colorClass.convert(this.selectedColor,"ByteRGB","IntRGB")
						});
						break;
				}
				this.refreshAllViews();
			}
		}
	};
	
	this.setSlice = function(view) {
		if (!!view.t[0] || !!view.t[3]) { this.currentSlice.x = this.cursor.x; }
		if (!!view.t[1] || !!view.t[4]) { this.currentSlice.y = this.cursor.y; }
		if (!!view.t[2] || !!view.t[5]) { this.currentSlice.z = this.cursor.z; }
	};
	
	this.getCenterPoint = function(view,offset) {
		if (view.ul) {
			return {x:view.bounds.x1,y:view.bounds.y1};
		} 
		return {x:view.bounds.xc-(offset ? view.bounds.x1 : 0),y:(view.center ? view.bounds.yc : (view.bounds.yc+view.bounds.y2)/2) - (offset ? view.bounds.y1 : 0) };
	};
	
	this.getsliceDimension = function(t) {
		if (!t[0] && !t[3]) return 1;
		if (!t[1] && !t[4]) return 2;
		if (!t[2] && !t[5]) return 3;
		return 0;
	};
	
	this.tranformDimensions = function(from,to) {
		var x = from[0]+from[1]+from[2];
		var y = from[3]+from[4]+from[5];
		
		//this.consoleLog(from);
		
		switch (this.getsliceDimension(from)) {
			case 1: //X
			return [to[2],x*to[0],y*to[1]];
			
			case 2: //Y
			return [x*to[0],to[2],y*to[1]];
			
			case 3: //Z
			return [x*to[0],y*to[1],to[2]];
		}
	};
	
	this.refreshView = function(view) {
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.fillRect(view.bounds.x1, view.bounds.y1, view.bounds.w, view.bounds.h);
		
		this.setView(this.ctx, view);
		
		switch (view.type) {
			case "palette":
				if (this.palette) {
					
					view.cellW = view.bounds.w / view.cols;
					view.cellH = view.bounds.h / view.rows;
				
					var i = 0;
					var w = view.cellW, h = view.cellH;
					for (var x = 0; x < view.cols; x++) {
						for (var y = 0; y < view.rows; y++) {		
							var p = this.palette[i];
							this.ctx.beginPath();
							this.ctx.fillStyle = "rgb("+p[0]+","+p[1]+","+p[2]+")";
							this.ctx.fillRect(w*x, h*y, w, h);
							i++;
						}
					}
				}
				break;
			
			case "toolbar":
				dg("toolbar").style.width = view.bounds.w + "px";
				dg("toolbar").style.height = view.bounds.h + "px";
				break;
			
			default:
				if (view == this.viewAdjustable && 0) {
					this.model.render(view.t, view.bounds.w, view.bounds.h);
				} else {
					if (this.drawXYZMarker) {
						this.ctx.lineWidth = 0.75;
						
						var o = [{l:"x",c:"#0000FF"},{l:"y",c:"#00FF00"},{l:"z",c:"#FF0000"}];
						for (var i = 0; i < 3; i ++) {
							this.ctx.beginPath();
							this.ctx.fillStyle = this.ctx.strokeStyle = o[i].c;
							var p = this.model.transformTo2D(0,0,0,view.zoom,view.t); this.ctx.moveTo(p.x,p.y);
							var p = this.model.transformTo2D(i==0?8:0,i==1?8:0,i==2?8:0,view.zoom,view.t); this.ctx.lineTo(p.x,p.y);
							this.ctx.stroke();
							
							this.ctx.font = "bold 12px sans-serif";
							var p = this.model.transformTo2D(i==0?10:0,i==1?10:0,i==2?10:0,view.zoom,view.t);
							var m = this.ctx.measureText(o[i].l);
							this.ctx.fillText(o[i].l, p.x-(m.width/2), p.y-5);
						}
					}
							
					this.model.draw(0,0,view.zoom,view.t,false,false,this.drawCurrentSliceOnly ? this.getsliceDimension(view.t) : 0, this.currentSlice,view.shade);
					
					//Draw slice marker	
					if (view.drawable) {
						this.ctx.strokeStyle = "rgba(0,0,0,0.05)";
						this.ctx.fillStyle = "rgba(0,0,255,0.05)";
						if (!!view.t[0] || !!view.t[3]) {
							this.model.drawCube(this.ctx,{x:this.currentSlice.x,y:-this.sliceSize,z:-this.sliceSize},{x:this.currentSlice.x+1,y:this.sliceSize,z:this.sliceSize},view.zoom,view.t);
						}
						this.ctx.fillStyle = "rgba(0,255,0,0.05)";
						if (!!view.t[1] || !!view.t[4]) {
							this.model.drawCube(this.ctx,{x:-this.sliceSize,y:this.currentSlice.y,z:-this.sliceSize},{x:this.sliceSize,y:this.currentSlice.y+1,z:this.sliceSize},view.zoom,view.t);
						}
						this.ctx.fillStyle = "rgba(255,0,0,0.05)";
						if (!!view.t[2] || !!view.t[5]) {
							this.model.drawCube(this.ctx,{x:-this.sliceSize,y:-this.sliceSize,z:this.currentSlice.z},{x:this.sliceSize,y:this.sliceSize,z:this.currentSlice.z+1},view.zoom,view.t);
						}
					}
				}
				break;
		}
		this.ctx.restore();
		
		this.ctx.strokeStyle = "#CCCCCC";
		this.ctx.beginPath();
		this.ctx.strokeRect(view.bounds.x1+0.5, view.bounds.y1+0.5, view.bounds.w, view.bounds.h);

		this.ii.refreshTarget();
	};
	
	this.setView = function(ctx, view) {
		ctx.save();
		ctx.beginPath();
		ctx.rect(view.bounds.x1 + 1, view.bounds.y1 + 1, view.bounds.w - 1, view.bounds.h - 1);
		ctx.clip();
		
		var cp = this.getCenterPoint(view);
		
		ctx.translate(cp.x+(view.offX?view.offX:0),cp.y+(view.offY?view.offY:0));
	};
	
	this.setPalette = function(src) {
		var image = new Image();
		image.src = src;
		image.ob = this;
		image.onload = function() {
			
			var tmp = document.createElement('canvas');
			tmp.setAttribute('width',this.width);
			tmp.setAttribute('height',this.height);
			tmp.getContext('2d').drawImage(this,0,0);
			
			var imgd = tmp.getContext('2d').getImageData(0, 0, this.width, this.height);
			var pix = imgd.data;
			
			this.ob.palette = [];

			for (var i = 0; i < pix.length; i+=4) {
				this.ob.palette.push([pix[i],pix[i+1],pix[i+2]]);
			}
			
			this.ob.viewPalette.cols = 4;
			this.ob.viewPalette.rows = Math.ceil(this.ob.palette.length / this.ob.viewPalette.cols);
								
			this.ob.refreshView(this.ob.viewPalette);		
		};
	};
		
	this.refreshCursor = function(view) {
		if (view) {
			this.cursorCtx.clearRect(view.bounds.x1, view.bounds.y1, view.bounds.w, view.bounds.h);
		
			//Draw cursor
			this.setView(this.cursorCtx,view);
			this.cursorCtx.strokeStyle = "rgba(0,0,0,0.5)";
			this.cursorCtx.fillStyle = "rgba(0,0,0,0.2)";
			this.model.drawCube(this.cursorCtx,{x:this.cursor.x,y:this.cursor.y,z:this.cursor.z},{x:this.cursor.x+1,y:this.cursor.y+1,z:this.cursor.z+1},view.zoom,view.t);
			this.cursorCtx.restore();
		} else {

			this.refreshCursor(this.viewTop);
			this.refreshCursor(this.viewSide);
			this.refreshCursor(this.viewFront);
			this.refreshCursor(this.viewAdjustable);
		}
	};
	
	this.setAdjustableViewAngle = function(a) {
		var zSort = Math.floor((a / Math.PI) * 4);//Math.abs(a - this.lastZSortAngle) > Math.PI / 4;
		this.adjustableViewAngle = a;
		this.viewAdjustable.t = [Math.cos(a),-Math.sin(a),0,Math.sin(a)*(2/3),Math.cos(a)*(2/3),-1,zSort != this.lastZSortAngle];		
		if (zSort != this.lastZSortAngle) {
			this.lastZSortAngle = zSort;
		}
		this.refreshView(this.viewAdjustable);
	};
	
	this.setAdjustableViewSkew = function(s) {
		this.adjustableViewSkew = s;
		this.refreshView(this.viewAdjustable);
	};
	
	this.refreshAllViews = function() {
		this.refreshView(this.viewToolbar);
		this.refreshView(this.viewPalette);
		this.refreshView(this.viewTop);
		this.refreshView(this.viewSide);
		this.refreshView(this.viewFront);
		this.refreshView(this.viewAdjustable);
	}
	
	this.redraw = function() {
		this.width = this.ctx.canvas.width;
		this.height = this.ctx.canvas.height;
		
		this.ctx.fillStyle = "#FFFFFF";
		this.ctx.fillRect(0, 0, this.width, this.height);
		
		this.vGuides = [0,128,138,Math.round((138+this.width) / 2),this.width-1];
		this.hGuides = [0,Math.round(this.height / 2),this.height-1];
		
		this.viewToolbar.bounds = this.setBounds(this.vGuides[0],this.hGuides[0],this.vGuides[1],this.hGuides[1]);
		this.ii.defineRegion("viewToolbar",this.viewToolbar.bounds);

		this.viewPalette.bounds = this.setBounds(this.vGuides[0],this.hGuides[1],this.vGuides[1],this.hGuides[2]);
		this.ii.defineRegion("viewPalette",this.viewPalette.bounds);
		
		this.viewTop.bounds = this.setBounds(this.vGuides[2],this.hGuides[0],this.vGuides[3],this.hGuides[1]);
		this.ii.defineRegion("viewTop",this.viewTop.bounds);
		this.viewSide.bounds = this.setBounds(this.vGuides[3],this.hGuides[0],this.vGuides[4],this.hGuides[1]);
		this.ii.defineRegion("viewSide",this.viewSide.bounds);
		
		this.viewFront.bounds = this.setBounds(this.vGuides[2],this.hGuides[1],this.vGuides[3],this.hGuides[2]);
		this.ii.defineRegion("viewFront",this.viewFront.bounds);
		this.viewAdjustable.bounds = this.setBounds(this.vGuides[3],this.hGuides[1],this.vGuides[4],this.hGuides[2]);
		this.viewAdjustable.bounds.title = "Drag to rotate view";
		this.viewAdjustable.bounds.style = {cursor:"pointer"};
		this.ii.defineRegion("viewAdjustable",this.viewAdjustable.bounds);
		
		this.refreshAllViews();
		
	};
	
	if (o) {
		this.setOptions(o);
	}

};

