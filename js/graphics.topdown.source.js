// Lamenting Globule [version]
// 2.5d Top Down Rendering Engine
// lg.graphics.topdown
// (c) [copyright-date] Josh "CartLemmy" Merritt
// cartlemmy@gmail.com
// http://www.yibbleware.com

//! TODO
//! Update x,y so that 0,0 is the middle of the canvas
//! Simple shading
//! Advanced skewing

//PRIVATE FUNCTIONS:calcBase2,updateSpriteSortStepsPerRow,getZForPoint,getZForPixel,getStaticSpritesForPoint,getTileCtxForPoint,renderRow,renderTile,renderTileFlat,getGradientShading,addSprite
//!CODE
function lgGraphicsTopdown(o) {
	// Generic functions
	this.calcBase2 = function(v) {
		var rv = 0;
		while (v > 1) {
			rv++;
			v /= 2;
		}
		return rv;
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
	
	this.setX = function(x) {this.setViewport(x,this.y);};
	this.setY = function(y) {this.setViewport(this.x,y);};
	this.setZ = function(z) {this.setViewport(this.x,this.y,z);};
	this.setZoom = function(zoom) {this.setViewport(this.x,this.y,undefined,zoom);};
	
	this.updateSpriteSortStepsPerRow = function() {
		this.spriteSortStepsPerRow = this.tileSize / this.spriteSortStep;
		this.spriteSortStepsPerRowExp = this.calcBase2(this.spriteSortStepsPerRow);
		this.spriteBufferSize = this.rowCacheSize * this.spriteSortStepsPerRow;
		this.spriteBufferSizeMask = this.spriteBufferSize - 1;	
	};
	
	this.clearSpriteBuffer = function() {
		this.spriteBuffer = [];
		for (var i = 0; i < this.spriteBufferSize; i++) {
			this.spriteBuffer.push([]);
		}
	};
	
	this.setSpriteSortStep = function(n) {
		
		this.spriteSortStep = n; 
		this.spriteSortStepExp = this.calcBase2(n);
				
		this.updateSpriteSortStepsPerRow();
	};
	
	this.setRowCacheSize = function(n) {
		
		this.rowCache = [];
		this.rowCacheSize = n;
		this.rowCacheSizeMask = n - 1;
		for (var i = 0; i < this.rowCacheSize; i++) {
			this.rowCache.push({y:-1});
		}
		if (this.spriteSortStep) { this.setSpriteSortStep(this.spriteSortStep); }
	};
	
	this.setViewport = function(x,y,z,zoom) {
		this.x = x|0;
		this.y = y|0;
		if (z != undefined) { this.z = z|0; }
		if (zoom != undefined) { this.zoom = zoom; }
	};
	
	this.setTileSize = function(tileSize) {
		this.tileSize = tileSize; 
		this.tileSizeExp = this.calcBase2(tileSize);
		this.tileSizeMask = tileSize - 1;
		this.updateSpriteSortStepsPerRow();
	};

	//Set defaults:
	this.setOptions({
		rowCacheSize:64,
		spriteSortStep:2,
		shading:0,
		gradientStep:1,
		skewSteps:1,
		gradientCache:{},
		enableStaticSprites:false,
		maxUnsortedSpriteHeight:32,
		zLast:-1,
		yLast:-1,
		xLast:-1,
		zoomLast:1,
		x:0,
		y:0,
		z:0,
		zoom:1,
		fetcherParams:{},
		performanceParams:[ // l = low value   h = high value   a = how much it affects performance (1 to 10 scale)
			{n:"shading",l:0,h:2,a:6},
			{n:"gradientStep",l:3,h:0,a:1,e:"pow2"},
			{n:"skewSteps",l:0,h:"this.calcBase2(this.tileSize)",a:8,e:"pow2"}
		]
	});

	//Internal getters
	this.getZForPixel = function(x,y) {
		var tileX = x >> this.tileSizeExp;
		var tileY = y >> this.tileSizeExp;
		
		var xp = (x & this.tileSizeMask) / this.tileSize;
		var yp = (y & this.tileSizeMask) / this.tileSize;
		
		var z1 = this.getZForPoint(tileX,tileY);
		var z2 = this.getZForPoint(tileX+1,tileY);
		var z3 = this.getZForPoint(tileX,tileY+1);
		var z4 = this.getZForPoint(tileX+1,tileY+1);
		
		return 	(z1 * (1-xp) + z2 * xp) * (1-yp) + (z3 * (1-xp) + z4 * xp) * yp;
	};
	
	this.getZForPoint = function(x,y) {
		return 0;
	};
	
	this.getStaticSpritesForPoint = function(x,y,n) {
		return false;
	};
	
	this.getTileCtxForPoint = function(x,y) {
		var tmp = document.createElement('canvas');
		tmp.setAttribute('width',this.tileSize);
		tmp.setAttribute('height',this.tileSize);
		return tmp.getContext('2d');
	};
			
	//Initializers
	this.initTileFetcher = function(type,v) {
		if (v.getZForPoint) { this.getZForPoint = v.getZForPoint; }
		if (v.getStaticSpritesForPoint) { this.getStaticSpritesForPoint = v.getStaticSpritesForPoint; }

		switch (type) {
			case "":
			return true;
			
			case "tile-sheet":
			this.fetcherParams = v;
			
			//load in the tile sheet
			if (!v.src || !v.getTileNumberForPoint) return false;
			if (!v.tileSize) v.tileSize = this.tileSize;
			this.fetcherParams.image = new Image();
			this.fetcherParams.image.src = v.src;
			this.fetcherParams.image.ob = this;
			this.tileCache = [];
			this.fetcherParams.image.onload = function() {
				for (var y = 0; y < this.ob.fetcherParams.image.height; y+=this.ob.fetcherParams.tileSize) {
					for (var x = 0; x < this.ob.fetcherParams.image.width; x+=this.ob.fetcherParams.tileSize) {
						var tmp = document.createElement('canvas');
						tmp.setAttribute('width',this.ob.fetcherParams.tileSize);
						tmp.setAttribute('height',this.ob.fetcherParams.tileSize);
						tmp.getContext('2d').drawImage(
							this.ob.fetcherParams.image,
							x, y,
							this.ob.fetcherParams.tileSize, this.ob.fetcherParams.tileSize,
							0, 0,
							this.ob.tileSize, this.ob.tileSize
						);
						this.ob.tileCache.push(tmp.getContext('2d'));
					}
				}
				this.ob.getTileCtxForPoint = function(x,y) {
					var rv = this.tileCache[this.getTileNumberForPoint(x,y)];
					if (!rv) {
						var tmp = document.createElement('canvas');
						tmp.setAttribute('width',this.tileSize);
						tmp.setAttribute('height',this.tileSize);
						return tmp.getContext('2d');
					}
					return rv;
				};
			};
			this.getTileNumberForPoint = v.getTileNumberForPoint;
			return true;
		}
		return false;
	};
	
	//Draw functions
	this.movedSinceLastDraw = function () {
		return (this.xLast|0)!=(this.x|0) || (this.yLast|0)!=(this.y|0) || (this.zLast|0)!=(this.z|0) ||this.zoomLast!=this.zoom;
	};
	
	this.draw = function(ctx) {
		
		this.clearSpriteBuffer();
		
		var y = Math.max(0,(this.y>>this.tileSizeExp)-1);
		var row = {ctx:null,x1:1,y1:1,x2:1,y2:1};
		var tileW = (ctx.canvas.width>>this.tileSizeExp)+2;
		
		while (row.y2-this.y > 0) {
			row = this.renderRow(y,tileW);
			ctx.drawImage(row.ctx.canvas,row.x1-this.x,row.y1-this.y+this.z);
			y--;
			if (y < 0) break;
		}
		var lowY = (y + 1) << this.spriteSortStepsPerRowExp;
		
		var row = {ctx:null,x1:1,y1:1,x2:1,y2:1};
		
		y = Math.max(0,this.y>>this.tileSizeExp);
		while (row.y1-this.y < ctx.canvas.height) {
			row = this.renderRow(y,tileW);
			ctx.drawImage(row.ctx.canvas,row.x1-this.x,row.y1-this.y+this.z);
			y++;
		}
		var highY = y << this.spriteSortStepsPerRowExp;
		
		//Render shadows
		for (var tileY = lowY; tileY < highY; tileY++) {
			var b = this.spriteBuffer[tileY & this.spriteBufferSizeMask];
			if (b.length) {
				for (var j = 0; j < b.length; j++) {
					var o = b[j];
					if (o.shadow) {
						ctx.drawImage(o.shadow.ctx.canvas,(o.x-o.shadow.xBase)-this.x,((o.y-o.shadow.yBase)-this.getZForPixel(o.x,o.y))-this.y+this.z);
					}
				}
			}
		}
		
		this.xLast = this.x;
		this.yLast = this.y;
		this.zLast = this.z;
		this.zoomLast = this.zoom;	
		
		var sprites = 0;
		//Render sprites
		for (var tileY = lowY; tileY < highY; tileY++) {
			var b = this.spriteBuffer[tileY & this.spriteBufferSizeMask];
			if (b.length) {
				for (var j = 0; j < b.length; j++) {
					var o = b[j];
					ctx.drawImage(o.ctx.canvas,(o.x-o.xBase)-this.x,((o.y-o.yBase)-o.z)-this.y+this.z);
					sprites++;
				}
				b = [];
			}			
		}
				
		debug("SPRITES: "+sprites);
		
		this.xLast = this.x;
		this.yLast = this.y;
		this.zLast = this.z;
		this.zoomLast = this.zoom;	
	};
	
	this.renderRow = function(tileY,tileW) {
		var tileX = Math.max(0,(this.x>>this.tileSizeExp)-1);
		
		var cacheNum = tileY & this.rowCacheSizeMask;
		
		var range = null;
		var oldRow = null;
		
		if (this.rowCache[cacheNum].tileY == tileY) { //Is there a cache of this row?
			oldRow = this.rowCache[cacheNum];
		
			if (tileX > oldRow.tileX+oldRow.tileW || oldRow.tileX > tileX+tileW) { // Is this row completely out of range (horizontally)
				oldRow = null;
				range = {from:tileX,to:(tileX+tileW)}; //create the entire row
			} else {
				
				if (tileX < oldRow.tileX) {
					range = {from:tileX,to:(oldRow.tileX-1)}; // Add the missing part of the beginning of the row
				} 
							
				if (tileX+tileW > oldRow.tileX+oldRow.tileW) {
					range = {from:(oldRow.tileX+oldRow.tileW+1),to:(tileX+tileW)}; // Add the missing part of the end of the row
				}
			}
		} else {
			range = {from:tileX,to:(tileX+tileW)}; //create the entire row
		}
		
		var yStart = (tileY<<this.tileSizeExp);
		
		//Get the new bounds:
		if (range) {
			var newRow = {tileX:tileX,tileY:tileY,tileW:tileW,ctx:null,zTop:[],zBottom:[],x1:(tileX<<this.tileSizeExp),y1:1000000,x2:(((tileX+tileW)<<this.tileSizeExp)+this.tileSize),y2:-1000,w:0,h:0};
			var zTop = 0, zTopMax = 0, zBottom = 0, tx = tileX;
			for (var i = 0; i < tileW + 3; i ++) {
				zTop = this.getZForPoint(tx,tileY)|0;
				zTopMax = Math.max(zTopMax,zTop);
				newRow.zTop.push(zTop);
				newRow.y1 = Math.min(yStart-zTop,newRow.y1);
				
				zBottom = this.getZForPoint(tx,tileY+1)|0;
				newRow.zBottom.push(zBottom);
				newRow.y2 = Math.max((yStart-zBottom)+this.tileSize,newRow.y2);
				
				tx ++;
			}
			zTopMax += this.maxUnsortedSpriteHeight;
			newRow.y1 = newRow.y1 - this.maxUnsortedSpriteHeight;
			newRow.w = newRow.x2 - newRow.x1;
			newRow.h = newRow.y2 - newRow.y1 + 1;

			var tmp = document.createElement('canvas');
			tmp.setAttribute('width',newRow.w);
			tmp.setAttribute('height',newRow.h);
			newRow.ctx = tmp.getContext('2d');
			
			//Render missing tiles
			var yTop = yStart - newRow.y1;
			var yBottom = yTop + this.tileSize;
			var x = ((range.from<<this.tileSizeExp) - newRow.x1);
			var n = 0; 
			
			for (var rx = range.from; rx <= range.to; rx++) {
				n = x>>this.tileSizeExp;
				this.renderTile(
					newRow.ctx,
					x,
					yTop-newRow.zTop[n],yTop-newRow.zTop[n+1],
					yBottom-newRow.zBottom[n],yBottom-newRow.zBottom[n+1],
					rx,tileY,
					newRow.zTop,
					newRow.zBottom,
					n
				);

				x += this.tileSize;
			}
			
			if (oldRow) {
				//Copy old row to new row
				newRow.ctx.drawImage(oldRow.ctx.canvas,oldRow.x1-newRow.x1,oldRow.y1-newRow.y1);
			}
			
			if (this.enableStaticSprites) {
				var x = ((range.from<<this.tileSizeExp) - newRow.x1);
				var px = 0, py = 0;
				for (var rx = range.from; rx <= range.to; rx++) {
					var sprites = this.getStaticSpritesForPoint(rx,tileY,0);
					for (var j = 0; j < sprites.length; j++) {
						var o = sprites[j];
						px = o.x+x+newRow.x1;
						py = o.y+yStart;
						if (o.shadow) {
							newRow.ctx.drawImage(o.shadow.ctx.canvas,(o.x-o.shadow.xBase)+x,(o.y-o.shadow.yBase)-(this.getZForPixel(px,py)-zTopMax));
						}
						newRow.ctx.drawImage(o.ctx.canvas,(o.x-o.xBase)+x,(o.y-o.yBase)-((o.z?o.z:this.getZForPixel(px,py))-zTopMax));
					}
					x += this.tileSize;
				}
			}
		}
		
		//Static sprites
		var tx = tileX;
		for (var i = 0; i < tileW + 2; i ++) {
			if (this.enableStaticSprites) {

				var sprites = this.getStaticSpritesForPoint(tx,tileY,1);
				for (var j = 0; j < sprites.length; j++) {
					var s = sprites[j];
					var x = s.x + (tx << this.tileSizeExp), y = s.y + yStart;
					this.addSprite(
						s.ctx,
						x,
						y,
						s.z?s.z:this.getZForPixel(x,y),
						s.xBase?s.xBase:0,
						s.yBase?s.yBase:0,
						s.shadow
					);
				}
				
			}
			tx ++;
		}
		
		
		if (!range) { return oldRow; }
		
		this.rowCache[cacheNum] = newRow;
		return newRow;
	};
	
	this.renderTile = function(ctx,x,y1Top,y2Top,y1Bottom,y2Bottom,sx,sy,z1,z2,n) {
		
		ctx.save();
		
		if (this.skewSteps > 1) { //Advanced skewing
			
		} else {
			ctx.transform(1, (y2Top-y1Top)/this.tileSize, 0, (Math.ceil(Math.max(y1Bottom,y2Bottom))-Math.floor(Math.min(y1Top,y2Top))+1)/this.tileSize, x, y1Top);
			this.renderTileFlat(ctx,x,y1Top,y2Top,y1Bottom,y2Bottom,sx,sy,z1,z2,n);
		}
		ctx.restore();
	};

	this.renderTileFlat = function(ctx,x,y1Top,y2Top,y1Bottom,y2Bottom,sx,sy,z1,z2,n) {
		ctx.drawImage(this.getTileCtxForPoint(sx,sy).canvas,0,0);
		
		switch (this.shading) {
			case 1: //Simple shading
			break;
			
			case 2: //Gradient shading
				var div = this.tileSize<<2;
 					
				var s1 = (Math.abs(z1[n]-z2[n+1])+Math.abs(z1[n+1]-z2[n]))/div;
				var s2 = (Math.abs(z1[n+1]-z2[n+2])+Math.abs(z1[n+2]-z2[n+1]))/div;
				
				var s3 = (Math.abs(z2[n]-(this.getZForPoint(sx+1,sy+2)|0))+Math.abs(z2[n+1]-(this.getZForPoint(sx,sy+2)|0)))/div;
				
				var s4 = (Math.abs(z2[n+1]-(this.getZForPoint(sx+2,sy+2)|0))+Math.abs(z2[n+2]-(this.getZForPoint(sx+1,sy+2)|0)))/div;
				
				
				ctx.drawImage(this.getGradientShading(s1,s2,s3,s4),0,0,this.tileSize,this.tileSize);
			break;		
		}
	};
	
	this.getGradientShading = function(s1,s2,s3,s4) {
		var n = ((s1*32)|0)+"_"+((s2*32)|0)+"_"+((s3*32)|0)+"_"+((s4*32)|0);
		
		if (this.gradientCache[n]) {
			return this.gradientCache[n];
		} else {
			var size = this.tileSize/this.gradientStep;

			var shade = document.createElement('canvas');
			shade.setAttribute('width',size);
			shade.setAttribute('height',size);
			
			var shadeCtx = shade.getContext('2d');
			
			shadeCtx.fillStyle = "#000";
			shadeCtx.fill();
						
			var imgd = shadeCtx.getImageData(0, 0, size, size);
			var pix = imgd.data;
			
			var pxn = 3;
			
			for (var j = 0; j < size; j++) {
				var ya = j / this.tileSizeMask;
				var yb = 1 - ya;
				for (var i = 0; i < size; i++) {
					var xa = i / this.tileSizeMask;
					var xb = 1 - xa;
					
					pix[pxn] = Math.floor(255*(yb*(s1*xb+s2*xa)+ya*(s3*xb+s4*xa)));
					pxn += 4;
				}			
			}
			
			shadeCtx.putImageData(imgd, 0, 0);
			this.gradientCache[n] = shade;
			return shade;
		}
	};

	this.addSprite = function(ctx,x,y,z,xBase,yBase,shadow) {
		//!TODO: if it is off screen because it is too high, or below ground then do not add
		var i = ((y|0)>>this.spriteSortStepExp) & this.spriteBufferSizeMask;
		
		this.spriteBuffer[i].push({ctx:ctx,x:x,y:y,z:z,xBase:xBase,yBase:yBase,shadow:shadow});
	};
	
	if (o) {
		this.setOptions(o);
	}
};
