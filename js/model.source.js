// Lamenting Globule [version]
// 2.5d Model
// lg.model
// (c) [copyright-date] Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com

//!CODE
function lgModel(o) {
	window.lgModel = this;
	this.colorClass = new lgColor();
	
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
		selectedNodes:[],
		nodes:{},
		nodeCount:0,
		startA1:0,
		startA2:0,
		typeNames:["voxel"]
	});
	
	// Other functions
	this.typeByName = function(name) {
		for (var i = 0; i < this.typeNames.length; i++) {
			if (this.typeNames[i] == name) return i;
		}
		return -1;
	};
	
	//Save / load
	this.prepForSave = function() {
		var nodes = this.allNodes();
		for (var i = 0; i < nodes.length; i++) {
			try {
				delete nodes[i].globalX;
				delete nodes[i].globalY;
				delete nodes[i].globalZ;
			} catch (e) {};
		}
	};
	
	
	//Node Functions	
	this.nodeExistsAt = function(x,y,z,nodes) {
		if (!nodes) {
			var nodes = this.allNodes();
		}
		for (var i = 0; i < nodes.length; i++) {
			if (nodes[i].x == x && nodes[i].y == y && nodes[i].z == z) {
				return nodes[i];
			}
		}
		return false;
	};
	
	this.addNode = function(toNode,node) {
		if (!toNode) { var toNode = this.nodes; }
		//var a = this.tranformXYZToAngle(node);
		if (!toNode.c) { toNode.c = []; }
		if (this.nodeExistsAt(node.x,node.y,node.z,toNode.c)) {
			return false;
		} else {
			toNode.c.push(node);
			this.nodeCount++;
		}
		return true;
	};
	
	this.colorNode = function(o) {
		var node = null;
		if (node = this.nodeExistsAt(o.x,o.y,o.z,o.c)) {
			node.f = o.f;
		}		
	}
		
	this.removeNodes = function(nodes) {
		for (var i = 0; i < nodes.length; i ++) {
			if (this.allNodes(false,false,nodes[i])) {
				this.nodeCount--;
			}
		}
	};
	
	this.moveNodes = function(nodes,t) {
		for (var i = 0; i < nodes.length; i ++) {
			nodes[i].x += t[0];
			nodes[i].y += t[1];
			nodes[i].z += t[2];
		}
	};
	
	this.allNodes = function(rv,parent,remove) {
		if (!parent) {
			var rv = [];
			var parent = this.nodes;
		} else {
			rv.push(parent);
		}
		if (parent.c) {
			for (var i = 0; i < parent.c.length; i++) {
				if (remove && parent.c[i] == remove) {
					parent.c.splice(i,1);
					return true;
				}
				if (this.allNodes(rv,parent.c[i],remove) === true) {
					return true;
				}
			}
		}		
		return rv;
	};
	
	this.setSelectedNodes = function(nodes) {
		this.selectedNodes = nodes;
	};
	
	//Transform Functions
	this.getAngleOfXYZ = function(o) {
		var d = Math.sqrt(o.x * o.x + o.y * o.y);
		o.a1 = Math.atan2(o.y,o.x); // X,Y angle
		d = Math.sqrt(d * d + o.z * o.z);
		return {a1:Math.atan2(o.y,o.x),a2:Math.atan2(o.z,d)};
	};
	
	this.transformTo2D = function(x,y,z,zoom,t) {
		return {
			x:(x*t[0]+y*t[1]+z*t[2])*zoom,
			y:(x*t[3]+y*t[4]+z*t[5])*zoom
		};
	};
	
	this.transformTo3D = function (x,y,zoom,t,defaultP) {
		var tn = [];
		for (var i = 0; i < t.length; i ++) {
			tn.push(t[i]);
		}
		
		var rv = t ? {x:(t[0]*x+t[3]*y)/zoom, y:(t[1]*x+t[4]*y)/zoom, z:(t[2]*x+t[5]*y)/zoom} : {x:0,y:0,z:0};
		
		if (!tn[0] && !tn[3]) { rv.x = defaultP.x; }
		if (!tn[1] && !tn[4]) { rv.y = defaultP.y; }
		if (!tn[2] && !tn[5]) { rv.z = defaultP.z; }
		
		return rv;
	};
	
	this.transformAngleToXYZ = function(a1,a2,x,y,z) {
		var nx = (Math.cos(a2)*x)+((-Math.sin(a2))*z);
		return {
			x:(Math.cos(a1)*nx)+((-Math.sin(a1))*y),
			y:(Math.sin(a1)*nx)+(Math.cos(a1)*y),
			z:(Math.sin(a2)*x)+(Math.cos(a2)*z)
		};
	};

	this.distance3d = function(x,y,z) {
		return Math.sqrt((x === false ? 0 : x*x) + (y === false ? 0 : y*y) + (z === false ? 0 : z*z));
	};
	
	//Draw Functions
	this.draw = function(xOffset,yOffset,zoom,t,node,pin,drawCurrentSliceOnly,thisSlice,shade,pixelArray) {
		if (!node) {
			var node = this.nodes;
			var p = {x:0,y:0,z:0,a1:this.startA1,a2:this.startA2};
		} else {
			var p = {a1:pin.a1,a2:pin.a2,x:pin.x,y:pin.y,z:pin.z};
		}
		
		var selected = this.selectedNodes.indexOf(node) != -1;
		
		var tp = this.transformAngleToXYZ(p.a1,p.a2,node.x,node.y,node.z);
		
		this.t = t;
		this.zoom = zoom;
		var neighboringSlice = false;
		
		if (!node.c) {
			switch (drawCurrentSliceOnly) {
				case 1:
				if (Math.floor(tp.x) != thisSlice.x && Math.floor(tp.x) != thisSlice.x-1) return;
				if (Math.floor(tp.x) == thisSlice.x-1) neighboringSlice = true;
				break;
				case 2:
				if (Math.floor(tp.y) != thisSlice.y && Math.floor(tp.y) != thisSlice.y-1) return;
				if (Math.floor(tp.y) == thisSlice.y-1) neighboringSlice = true;
				break;
				case 3:
				if (Math.floor(tp.z) != thisSlice.z && Math.floor(tp.z) != thisSlice.z-1) return;
				if (Math.floor(tp.z) == thisSlice.z-1) neighboringSlice = true;
				break;
			}
		}

		
		node.globalX = tp.x;
		node.globalY = tp.y;
		node.globalZ = tp.z;
			
		/*var dp = this.transformTo2D(node.globalX,node.globalY,node.globalZ,zoom,t);
		var dp2 = this.transformTo2D(node.globalX+1,node.globalY+1,node.globalZ+1,zoom,t);
		
		dp.x = Math.min(dp.x, dp2.x) + xOffset;
		dp.y = Math.min(dp.y, dp2.y) + yOffset;
		*/
		switch (node.t) {
			case 0: // voxel
			if (pixelArray) {
			} else {
				if (!shade) {
					this.ctx.fillStyle = this.rgb(node.f,neighboringSlice?0.25:false);
				}
				if (selected) {
					this.ctx.strokeStyle = "#FF0000";
				}
				
				this.drawVoxel(this.ctx,tp,zoom,t,!selected,shade?node.f:false);
			}
			break;
		}
		if (node.c) {
			if (t[6]) { node.c.sort(this.sortNodes); }

			for (var i = 0; i < node.c.length; i++) {
				this.draw(xOffset,yOffset,zoom,t,node.c[i],p,drawCurrentSliceOnly,thisSlice,shade,pixelArray);
				//Z sort
				
			}
		}
	};
	
	this.sortNodes = function(a, b){
		var ap = window.lgModel.transformTo2D(a.x,a.y,a.z,window.lgModel.zoom,window.lgModel.t);
		var bp = window.lgModel.transformTo2D(b.x,b.y,b.z,window.lgModel.zoom,window.lgModel.t);
		//return a.z - b.z
		return ((a.z<<10)+ap.y) - ((b.z<<10)+bp.y);
	}
	
	this.rgb = function(c,a,v) {
		//return "#"+this.colorClass.convert(this.selectedColor,"IntRGB","HexRGB");
		//Faster:
		if (v) {
			var c = (Math.max(0,Math.min(255,((c>>16)&255) + v))<<16)|(Math.max(0,Math.min(255,((c>>8)&255) + v))<<8)|Math.max(0,Math.min(255,(c&255) + v));
		}
		
		if (typeof(a) == "number") {
			return "rgba("+((c>>16)&255)+","+((c>>8)&255)+","+(c&255)+","+a+")";
		} else {
			return "rgb("+((c>>16)&255)+","+((c>>8)&255)+","+(c&255)+")";
		}
	};
	
	this.drawVoxel = function(ctx,p,zoom,t,noStroke,c) {
		if (c) {
			this.drawCube(ctx,{x:p.x,y:p.y,z:p.z},{x:p.x+1,y:p.y+1,z:p.z+1},zoom,t,noStroke,c);
		} else {
			var p1 = this.transformTo2D(p.x,p.y,p.z,zoom,t);
			var p2 = this.transformTo2D(p.x+1,p.y+1,p.z+1,zoom,t);
			var x = Math.min(p1.x,p2.x);
			var y = Math.min(p1.y,p2.y);
			
			ctx.fillRect(x,y,zoom,zoom);
			if (!noStroke) { ctx.strokeRect(x,y,zoom,zoom); }
		}
	};
	
	this.drawCube = function(ctx,p1,p2,zoom,t,noStroke,c) {
		var points = [p1,p2];
		var shade = [0,0,0,0,0,64];
		var cubes = [
			[0,0,0,
			1,0,0,
			1,1,0,
			0,1,0],
			
			[0,0,0,
			0,1,0,
			0,1,1,
			0,0,1],
			
			[0,0,0,
			1,0,0,
			1,0,1,
			0,0,1],
						
			[1,0,0,
			1,1,0,
			1,1,1,
			1,0,1],
			
			[0,1,0,
			1,1,0,
			1,1,1,
			0,1,1],
			
			[0,0,1,
			1,0,1,
			1,1,1,
			0,1,1]
		];
		for (var i = 0; i < 6; i ++) {
			if (c) {
				ctx.fillStyle = this.rgb(c,false,shade[i]);
			}
			ctx.beginPath();
			for (var j = 0; j < 12; j += 3) {
				var p = this.transformTo2D(points[cubes[i][j]].x,points[cubes[i][j+1]].y,points[cubes[i][j+2]].z,zoom,t);
				if (!j) { ctx.moveTo(p.x,p.y); } else { ctx.lineTo(p.x,p.y); }		
			}
			if (!noStroke) { ctx.stroke(); }
			ctx.fill();
			ctx.closePath();
		}		
	};
	
	this.draw = function(xOffset,yOffset,zoom,t,node,pin,drawCurrentSliceOnly,thisSlice,shade) {
		if (!node) {
			var top = true;
			var node = this.nodes;
			var p = {x:0,y:0,z:0,a1:0,a2:0};
		} else {
			var top = false;
			var p = {a1:pin.a1,a2:pin.a2,x:pin.x,y:pin.y,z:pin.z};
		}
		
		var selected = this.selectedNodes.indexOf(node) != -1;
		
		var tp = this.transformAngleToXYZ(p.a1,p.a2,node.x,node.y,node.z);
		
		this.t = t;
		this.zoom = zoom;
		var neighboringSlice = false;
		
		if (!node.c) {
			switch (drawCurrentSliceOnly) {
				case 1:
				if (Math.floor(tp.x) != thisSlice.x && Math.floor(tp.x) != thisSlice.x-1) return;
				if (Math.floor(tp.x) == thisSlice.x-1) neighboringSlice = true;
				break;
				case 2:
				if (Math.floor(tp.y) != thisSlice.y && Math.floor(tp.y) != thisSlice.y-1) return;
				if (Math.floor(tp.y) == thisSlice.y-1) neighboringSlice = true;
				break;
				case 3:
				if (Math.floor(tp.z) != thisSlice.z && Math.floor(tp.z) != thisSlice.z-1) return;
				if (Math.floor(tp.z) == thisSlice.z-1) neighboringSlice = true;
				break;
			}
		}

		
		node.globalX = tp.x;
		node.globalY = tp.y;
		node.globalZ = tp.z;
			
		switch (node.t) {
			case 0: // voxel

			if (!shade) {
				this.ctx.fillStyle = this.rgb(node.f,neighboringSlice?0.25:false);
			}
			if (selected) {
				this.ctx.strokeStyle = "#FF0000";
			}
			
			this.drawVoxel(this.ctx,tp,zoom,t,!selected,shade?node.f:false);
			
			break;
		}
		if (top && node.c) {
			if (t[6]) { node.c.sort(this.sortNodes); }

			for (var i = 0; i < node.c.length; i++) {
				this.draw(xOffset,yOffset,zoom,t,node.c[i],p,drawCurrentSliceOnly,thisSlice,shade);
				//Z sort
			}
		}
	};
	
	//Render
	this.render = function(rotate) {
		this.twoXfilter = true;
		this.zAng = 0.6666;
		this.outline = 2;
		
		// Get the size of the model
		var size = this.go("size");
		size.rotWidth = Math.ceil(Math.max(size.x,size.y) * 1.414213562);
		size.xOff = size.x - size.rotWidth;

		size.yOff = size.y - size.rotWidth;
		size.x = size.y = size.rotWidth;
		
		// Create 3d array 2x the size of the model
		var ca = new this.threeDByteArray(size.x,size.y,size.z);
		var ca2x = new this.threeDByteArray(size.x*2,size.y*2,size.z*2);
		
		// Copy model to 3d array
		this.go("to3dArray",ca,{x:-Math.ceil(size.xMin/2+size.xOff/4),y:-(Math.ceil(size.yMin/2+size.yOff/4)-0.5),z:-Math.ceil(size.zMin/2)});
		this.go("to3dArray2x",ca2x,{x:-Math.ceil(size.xMin/2+size.xOff/4),y:-(Math.ceil(size.yMin/2+size.yOff/4)-0.5),z:-Math.ceil(size.zMin/2)});
		
		// 2x filter
		for (var z = 0; z < size.z; z++) {
			if (this.twoXfilter) {
				for (var x = 0; x < size.x; x++) {
					for (var y = 0; y < size.y; y++) {
						var slopeX = this.getSlope("x",{x:x,y:y,z:z},ca);
						var slopeY = this.getSlope("y",{x:x,y:y,z:z},ca);
						var slopeZ = this.getSlope("z",{x:x,y:y,z:z},ca);
													
						if (slopeX !== false || slopeY !== false || slopeZ !== false) {
							for (var x2 = 0; x2 < 2; x2++) {
								for (var y2 = 0; y2 < 2; y2++) {
									for (var z2 = 0; z2 < 2; z2++) {
										
										var s = [
											slopeX !== false ? slopeX[z2*2+y2] : false,
											slopeY !== false ? slopeY[z2*2+x2] : false,
											slopeZ !== false ? slopeZ[y2*2+x2] : false
										];
										
										var c = false, set = true;
										for (var i = 0; i < 3; i++) {
											if (s[i] !== false) {
												if (c === false) {
													c = s[i];
												} else if (s[i] != c) {
													set = false; break;
												}
											}
										}
										
										if (set) {
											ca2x.set(x*2+x2,y*2+y2,z*2+z2,c);
										}						
									}
								}
							}
						}
					}
				}
			}
			if (rotate) {
				for (var i = 0; i < 2; i ++) { this.rotateSlice(ca2x,"z",z*2+i,rotate); }
			}				
		}
	
		
		// Render model, depth map, and shadow
		
		var tmp = document.createElement('canvas');
		tmp.setAttribute('width',size.x*2+6);
		tmp.setAttribute('height',(size.y+size.z)*2+6);
		var ctx = tmp.getContext('2d');
		
		/*
		var shadow = document.createElement('canvas');
		shadow.setAttribute('width',size.x*2+6);
		shadow.setAttribute('height',(size.y+size.z)*2+6);
		var shadowCtx = shadow.getContext('2d');
		shadowCtx.fillStyle = "#800000";
		shadowCtx.fillRect(0,0,shadow.width,shadow.height);
		var shadowData = new this.pixelData(shadowCtx);
		*/
		
		var pixelData = new this.pixelData(ctx);
		//var shadeCheck = [{x:-1,y:-1},{x:0,y:-1},{x:1,y:-1},{x:-1,y:0},{x:1,y:0},{x:-1,y:1},{x:0,y:1},{x:1,y:1}];
		var shadeCheck = [{x:0,y:-1},{x:-1,y:0},{x:1,y:0},{x:0,y:1}];
		for (var y = 0; y < size.y*2; y++) {
			for (var x = 0; x < size.x*2; x++) {
				for (var z = 0; z < size.z*2; z++) {
					var c = ca2x.getRGBA(x,y,z);
					if (c.a) {
						var shade = this.getShade(x,y,z,ca2x);
						/*var shade = 64;
						for (var z2 = z + 1; z2 < size.z*2; z2++) {
							if (ca2x.getRGBA(x,y,z2).a) {
								shade = 0;
								break;
							}
						}

						if (!ca2x.getRGBA(x,y,z+1).a) {//shade == 0 && 
							for (var i = 0; i < shadeCheck.length; i++) {
								if (
									!!ca2x.getRGBA(x+shadeCheck[i].x,y+shadeCheck[i].y,z+1).a &&
									(!!ca2x.getRGBA(x-shadeCheck[i].x,y-shadeCheck[i].y,z-1).a ||
									!!ca2x.getRGBA(x-shadeCheck[i].x,y-shadeCheck[i].y,z-2).a)
								) {
									shade = 32;
									break;
								}
							}
						}
						*/
						var py = Math.floor((y*this.zAng) - z) + size.z * 2;
						c.a = 127;
						c.r = Math.max(0,Math.min(255,c.r+shade));
						c.g = Math.max(0,Math.min(255,c.g+shade));
						c.b = Math.max(0,Math.min(255,c.b+shade));
						
						pixelData.set(x+2,py+2,c);
						pixelData.set(x+2,py+3,c);
					}
				}
			}
		}
		
		// Add outlines
		if (this.outline) {
			var depthCanvas = document.createElement('canvas');
			depthCanvas.setAttribute('width',size.x*2+6);
			depthCanvas.setAttribute('height',(size.y+size.z)*2+6);
			var depthCtx = depthCanvas.getContext('2d');
			
			var depth = new this.pixelData(depthCtx);
			for (var y = 0; y < ctx.canvas.height; y++) {
				for (var x = 0; x < ctx.canvas.width; x++) {
					depth.set(x,y,{r:0,g:0,b:0,a:255});
				}
			}
					
			for (var y = 0; y < size.y*2; y++) {
				for (var x = 0; x < size.x*2; x++) {
					for (var z = 0; z < size.z*2; z++) {
						
						var c = ca2x.getRGBA(x,y,z);
						
						var py = Math.floor((y*this.zAng) - z) + size.z * 2;
						
						if (c.a) {
							var dist = 0x800000 + y + z;
							var c = {r:dist>>16,g:(dist>>8)&255,b:dist&255,a:255};
							depth.set(x+2,py+2,c);
							depth.set(x+2,py+3,c);	
						}
					}
				}
			}
			
			for (var i = 0; i < this.outline; i++) {
				var newDepth = [];
				for (var y = 0; y < ctx.canvas.height; y++) {
					for (var x = 0; x < ctx.canvas.width; x++) {
						var dist = depth.getRGBAsInt(x,y);
						var cmpDist = Math.max(depth.getRGBAsInt(x-1,y),Math.max(depth.getRGBAsInt(x+1,y),Math.max(depth.getRGBAsInt(x,y-1),depth.getRGBAsInt(x,y+1))));
						if (dist < cmpDist - 8) {
							pixelData.set(x,y,{r:0,g:0,b:0,a:255});
							if (dist < cmpDist - 100) {
								newDepth.push({x:x,y:y,d:cmpDist});
							}
						}
					}
				}
				while (d = newDepth.pop()) {
					depth.set(d.x,d.y,{r:d.d>>16,g:(d.d>>8)&255,b:d.d&255,a:255});
				}
			}
		}
		
		pixelData.put();

		return ctx;
	};
	
	this.getShade = function(x,y,z,ca2x) {
		return 0;
	};
	
	this.rotateSlice = function(pixelData,axis,sliceToRotate,angle) {
		
		var palette = [];
		
		//Create temporay canvas
		var tmp = document.createElement('canvas');
		tmp.setAttribute('width',pixelData.x);
		tmp.setAttribute('height',pixelData.y);
		var tmpCtx = tmp.getContext('2d');
		var tmpPixels = new this.pixelData(tmpCtx);
		
		for (var y = 0; y < tmp.height; y++) {
			for (var x = 0; x < tmp.width; x++) {
				var c = pixelData.getRGBA(x,y,sliceToRotate);
				
				if (c.a) { //Store original palette
					var cs = ""+c.r+"-"+c.g+"-"+c.b;
					if (palette.indexOf(cs) == -1) {
						palette.push(cs);
					}
				}
				
				tmpPixels.set(x,y,c);
			}
		}
		tmpPixels.put();
		
		//Create output canvas
		var out = document.createElement('canvas');
		out.setAttribute('width',pixelData.x);
		out.setAttribute('height',pixelData.y);
		var outCtx = out.getContext('2d');
		
		//rotate it
		outCtx.translate(out.width/2,out.height/2);
		outCtx.rotate(angle);
		outCtx.translate(-out.width/2,-out.height/2);
		
		outCtx.drawImage(tmp,0,0);
		
		for (var i = 0; i < palette.length; i++) {
			var c = palette[i].split("-");
			palette[i] = {r:Number(c[0]),g:Number(c[1]),b:Number(c[2])};
		}
		
		//Put the pixels back
		var tmpPixels = new this.pixelData(outCtx);
			
		for (var y = 0; y < tmp.height; y++) {
			for (var x = 0; x < tmp.width; x++) {
				var c = tmpPixels.get(x,y);
				
				//Convert to original palette
				/*
				if (c.a > 127) {
					var match = {best:3000,r:0,g:0,b:0};
					for (var i = 0; i < palette.length; i ++) {
						var p = palette[i];
						var h1 = this.hue(p.r,p.g,p.b);
						var h2 = this.hue(c.r,c.g,c.b);
						var dist = Math.abs(p.r - c.r) + Math.abs(p.g - c.g) + Math.abs(p.b - c.b) + Math.min(Math.abs(h1-h2),Math.abs(h2-(h1+255))) * 2;
						if (dist < match.best) {
							match = {best:dist,r:p.r,g:p.g,b:p.b};
						}
					}
					c.r = match.r;
					c.g = match.g;
					c.b = match.b;
				}
				*/
				pixelData.setRGBA(x,y,sliceToRotate,c.r,c.g,c.b, c.a > 127 ? 127 : 0);
				
			}
		}

	};
	
	this.hue = function(r, g, b) {
		var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
		var h;

		if (mx == mn){
			return 0;
		} else {
			var d = mx - mn;
			switch(mx){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			return h * 42.5;
		}
	};
		
	this.getSlope = function(coord,xyz,ca) {
		var pos = [
					[-1,-2],[0,-2],[1,-2],
			[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],
			[-2, 0],[-1, 0],       [1, 0],[2, 0],
			[-2, 1],[-1, 1],[0, 1],[1, 1],[2, 1],
					[-1, 2],[0, 2],[1, 2]
		];
		
		var same = [], colors = [];
		
		var thisC = ca.get(xyz.x,xyz.y,xyz.z);
		
		if (thisC === 0) return false;
		
		for (var i = 0; i < pos.length; i++) {
			switch (coord) {
				case "x":
					var c = ca.get(xyz.x,xyz.y + pos[i][0],xyz.z + pos[i][1]);
					break;
				
				case "y":
					var c = ca.get(xyz.x + pos[i][0],xyz.y,xyz.z + pos[i][1]);
					break;
					
				case "z":
					var c = ca.get(xyz.x + pos[i][0],xyz.y + pos[i][1],xyz.z);
					break;
			}
			colors.push(c);
			same.push(thisC === c);
		}
			
		var filters = [
			[  2,2,2,
			 2,0,0,2,2,
			 2,1,  0,2,
			 2,2,2,1,2,
			   2,2,2], // 22.5 degree (part 1)
			

			[  2,2,2,
			 2,2,0,0,2,
			 2,0,  1,2,
			 2,1,2,2,2,
			   2,2,2], // 22.5 degree mirror (part 1)
			
		 
			[  2,2,2,
			 2,2,0,2,1,
			 2,0,  1,2,
			 2,2,1,2,2,
			   2,2,2], // 45 degree
			   
			[  2,2,2,
			 1,2,0,2,2,
			 2,1,  0,2,
			 2,2,1,2,2,
			   2,2,2] // 45 degree mirror
			 
			
		];
		
		var filterRot = [
			[   12, 8,3,
			 17,13, 9,4,0,
			 18,14,   5,1,
			 19,15,10,6,2,
			    16,11,7],
			   
			[   19,18,17,
			 16,15,14,13,12,
			 11,10,    9, 8,
			  7, 6, 5, 4, 3,
			     2, 1, 0],
			     
			[  7,11,16,
			 2,6,10,15,19,
			 1,5,   14,18,
			 0,4, 9,13,17,
			   3, 8,12]
		];
		
		var slopes = [
			[0,0,
			 1,1],
		 
			[0,0,
			 1,1],

			[0,1,
			 1,1],
			 
			[1,0,
			 1,1]
		];
		
		var slopeRot = [
			[2,0,
			 3,1],
			
			[3,2,
			 1,0],
			 
			[1,3,
			 0,2]
		];
		
		
		var filterBaseLen = filters.length;
		for (var i = 0; i < 3; i++) { // build remaining angles (90, 180, 270)
			for (var j = 0; j < filterBaseLen; j++) {
				var l = filterBaseLen + (i * filterBaseLen) + j;
				filters[l] = [];
				for (var k = 0; k < filters[j].length; k++) {
					filters[l][filterRot[i][k]] = filters[j][k];
				}
				slopes[l] = [];
				for (var k = 0; k < slopes[j].length; k++) {
					slopes[l][slopeRot[i][k]] = slopes[j][k];
				}
			}
		}
		
		for (var ia = 0; ia < filterBaseLen; ia ++) {
			for (var ib = 0; ib < filters.length; ib += filterBaseLen) {
				var i = ib + ia;
				
				var pass = true, thatC = -1;
				
				for (var j = 0; j < filters[i].length; j++) {
					if (filters[i][j] == 0) {
						if (thatC == -1) {
							thatC = colors[j];
							if (thatC > thisC) {
								pass = false; break;
							}
						} else if (thatC != colors[j]) {
							pass = false; break;
						}
					}
					if (filters[i][j] != 2 && !!filters[i][j] != same[j]) {
						pass = false; break;
					}
				}
				
				if (pass) {			
					var rv = [0,0,0,0];
					var slopeC = [thatC,thisC];
					for (var j = 0; j < 4; j++) {
						rv[j] = slopeC[slopes[i][j]];
					}
					return rv;
				}
			}
		}
		
		return false;
	};
	
	this.pixelData = function(ctx) {
		this.ctx = ctx;
		this.image = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
		this.data = this.image.data;
		
		this.set = function(x,y,c) {
			if (x >= 0 && x < this.ctx.canvas.width && y >= 0 && y < this.ctx.canvas.height) {
				var i = (y*this.ctx.canvas.width+x)*4;
				this.data[i] = c.r;
				this.data[i+1] = c.g;
				this.data[i+2] = c.b;
				this.data[i+3] = c.a;
			}
		};
		
		this.get = function(x,y) {
			var c = {r:0,g:0,b:0,a:0}
			if (x >= 0 && x < this.ctx.canvas.width && y >= 0 && y < this.ctx.canvas.height) {
				var i = (y*this.ctx.canvas.width+x)*4;
				c.r = this.data[i];
				c.g = this.data[i+1];
				c.b = this.data[i+2];
				c.a = this.data[i+3];
			}
			return c;
		};
		
		this.getRGBAsInt = function(x,y) {
			if (x >= 0 && x < this.ctx.canvas.width && y >= 0 && y < this.ctx.canvas.height) {
				var i = (y*this.ctx.canvas.width+x)*4;
				return this.data[i] << 16 | this.data[i+1] << 8 | this.data[i+2];
			}
			return 0;
		};
		
		this.put = function() {
			this.image.data = this.data;
			this.ctx.putImageData(this.image, 0, 0);
		};
	};
	
	this.go = function(action,param,offset,node,parentPoint) {
		var rv = null;
		
		if (!node) {
			var top = true;
			this.size = {
				x:0,y:0,z:0,
				xMin:100000,yMin:100000,zMin:100000,
				xMax:-100000,yMax:-100000,zMax:-100000
			};
			var node = this.nodes;
			if (!node.x) node.x = 0;
			if (!node.y) node.y = 0;
			if (!node.z) node.z = 0;
			var p = {x:0,y:0,z:0,a1:this.startA1,a2:this.startA2};
			if (!offset) {
				offset = {x:0,y:0,z:0};
			}
		} else {
			var top = false;
			var p = {a1:parentPoint.a1,a2:parentPoint.a2,x:parentPoint.x,y:parentPoint.y,z:parentPoint.z};
		}
		
		var tp = this.transformAngleToXYZ(p.a1,p.a2,node.x,node.y,node.z);
		
		p.x += tp.x + offset.x;
		p.y += tp.y + offset.y;
		p.z += tp.z + offset.z;
					
		switch (action) {
			case "size":
				this.size.xMin = Math.min(p.x,this.size.xMin);
				this.size.yMin = Math.min(p.y,this.size.yMin);
				this.size.zMin = Math.min(p.z,this.size.zMin);
				
				this.size.xMax = Math.max(p.x,this.size.xMax);
				this.size.yMax = Math.max(p.y,this.size.yMax);
				this.size.zMax = Math.max(p.z,this.size.zMax);
				break;
			
			case "to3dArray":
				if (node.t == 0) {
					param.set(p.x|0,p.y|0,p.z|0,node.f|0x7F000000);
				}
				break;
				
			case "to3dArray2x":
				if (node.t == 0) {
					var px = (p.x|0)<<1;
					var py = (p.y|0)<<1;
					var pz = (p.z|0)<<1;
					for (z = pz; z < pz + 2; z++) {
						for (y = py; y < py + 2; y++) {
							for (x = px; x < px + 2; x++) {
								param.set(x,y,z,node.f|0x7F000000);
							}
						}
					}
				}
				break;
		}
		
		if (node.c) {
			for (var i = 0; i < node.c.length; i++) {
				if (node.c[i].a1) {
					p.a1 += node.c[i].a1;
					p.a2 += node.c[i].a2;
				}
				
				this.go(action,param,offset,node.c[i],p);			
			}
		}
		
		if (top) {
			switch (action) {
				case "size":
					
					this.size.xMin --;
					this.size.yMin --;
					this.size.zMin --;
					
					this.size.xMax ++;
					this.size.yMax ++;
					this.size.zMax ++;
					
					this.size.x = this.size.xMax - this.size.xMin;
					this.size.y = this.size.yMax - this.size.yMin;
					this.size.z = this.size.zMax - this.size.zMin;
					
					rv = {};
					for (var i in this.size) {
						rv[i] = this.size[i];
					}

					break;
			}
		}
		return rv;		
	};
	
	this.threeDByteArray = function(x,y,z) {
		this.x = x;
		this.y = y;
		this.xy = x * y;
		this.z = z;
		this.size = x * y * z;
		this.a = [];
		for (var i = 0; i < this.size; i++) {
			this.a.push(0);
		}
		
		this.get = function(x,y,z) {
			if (x >= 0 && x < this.x && y >= 0 && y < this.y && z >= 0 && z < this.z) {
				return this.a[z * this.xy + y * this.x + x];
			}
			return 0;
		};
		
		this.getRGBA = function(x,y,z) {
			if (x >= 0 && x < this.x && y >= 0 && y < this.y && z >= 0 && z < this.z) {
				var v = this.a[z * this.xy + y * this.x + x];
				return {
					"a":(v >> 24) ? 255 : 0,
					"r":(v >> 16) & 255,
					"g":(v >> 8) & 255,
					"b":v & 255
				};
			}
			return {"a":0,"r":0,"g":0,"b":0};
		};
		
		
		this.setRGBA = function(x,y,z,r,g,b,a) {
			if (x >= 0 && x < this.x && y >= 0 && y < this.y && z >= 0 && z < this.z) {
				this.a[z * this.xy + y * this.x + x] = (a << 24) | (r << 16) | (g << 8) | b;
			}
		};
		
		this.set = function(x,y,z,v) {
			if (x >= 0 && x < this.x && y >= 0 && y < this.y && z >= 0 && z < this.z) {
				this.a[z * this.xy + y * this.x + x] = v;
			}
		};
		
	};
	
	if (o) {
		this.setOptions(o);
	}

};

