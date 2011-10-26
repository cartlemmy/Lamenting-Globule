// procPlant v0.0
// Procedurally Generated Plants
// (c) 2011 Josh "CartLemmy" Merritt unless otherwise noted
// cartlemmy@gmail.com


// TODO
// Final render of the bark should look better
// Thorns
// Big leaves = tropical
// Fruit or berries also the should possibly be poisoness
// Snow is a bit too white

var keyDown = Object();

function crossBreed(dna1,dna2) {
	var dna1 = new binaryData(dna1);
	var dna2 = new binaryData(dna2);
	var dnaChild = new binaryData("0".repeat(dna1.data.length));
	
	for (var i = 0; i < dna1.bitLength(); i ++) {
		var out = dna1.getBit(i) + dna2.getBit(i);
		if (Math.random() > 0.99) { // Random mutation
			out = Math.max(0,Math.min(2,(out + Math.random() > 0.5 ? 1 : -1)));
		}
		if (out == 0) {
			dnaChild.setBit(i,0);
		} else if (out == 1) {
			dnaChild.setBit(i,Math.random() > 0.5 ? 1 : 0);
		} else {
			dnaChild.setBit(i,1);
		}
	}
	return dnaChild.data;
};

function procPlant(DNA) {
	this.generateRandomDNA = function() {
		var rv = "";
		var bits = 190;
		for (var i = 0; i < Math.ceil(bits / 4); i++) {
			rv += dec2Hex(Math.round(Math.random()*0xF),1);
		}
		return rv;
	};
	
	this.view = 0;
	this.nodeCount = 1;
	this.depth = 0;
	this.height = 0;
	this.width = 0;
	this.age = 0;
	this.DNA = new binaryData(DNA ? DNA : this.generateRandomDNA());
	this.DNARelation = null;
	this.DNARelationRatings = 0;


	
	this.nodes = {a:Math.random() * Math.PI * 2,n:0,lvl:0,a1:1.570796327,a2:Math.random()*Math.PI*2,l:0,w:0.2,c:[]};
		
	this.DNADefinition = {
		size:{bits:4,lv:0.2,hv:1},
		initialBranchesYes:{bits:1,onOrOff:1},
		initialBranches:{bits:6,lv:1,hv:64,calc:function(v,t){return Math.round(v/((t.getDNA("branchWidth")-0.04)*3.85+1));}},
		branchPos:{bits:3,lv:0,hv:1},
		branchEvery:{bits:3,lv:2,hv:9},
		branchEveryRand:{bits:2,lv:0,hv:3},
		branchCount:{bits:3,lv:0,hv:7,calc:function(v,t){return Math.round(v*(t.getDNA("initialBranchesYes")?0.2:1));}},
		branchCountRand:{bits:2,lv:0,hv:3},
		branchLength:{bits:2,lv:6,hv:15},
		branchLengthRand:{bits:3,lv:0,hv:4},
		branchWidth:{bits:4,lv:0.04,hv:0.3},
		branchGravitation:{bits:4,lv:-0.8,hv:1.5},
		trunkGravitation:{bits:4,lv:-0.8,hv:1},
		droopyness:{bits:4,lv:0,hv:1},
		branchTwist:{bits:4,lv:0,hv:Math.PI/2},
		branchTwistRand:{bits:3,lv:0,hv:3},
		branchHue:{bits:4,lv:0,hv:0.4},
		branchEndHue:{bits:3,lv:0,hv:0.2},
		branchSat:{bits:4,lv:0.2,hv:1},
		branchEndSat:{bits:3,lv:0,hv:0.3},
		
		trunkSegments:{bits:3,lv:0,hv:7},
		trunkCoreSize:{bits:3,lv:0.7,hv:1},
		trunkColorRand:{bits:2,lv:0,hv:0.1},
		trunkSegmentLum:{bits:3,lv:-0.1,hv:0.3},
		trunkSegmentSize:{bits:3,lv:0.1,hv:0.5},
		
		trunkTwist:{bits:5,lv:-Math.PI*3/16,hv:Math.PI*4/16},
		hitGroundRoot:{bits:1,onOrOff:1},
		leafPosition:{bits:2,lv:0,hv:3},
		bushiness:{bits:4,lv:0.1,hv:1},
		leafAngle:{bits:3,lv:0.1,hv:1.570796327},
		leafTwist:{bits:3,lv:Math.PI/16,hv:Math.PI/3},
		leafCount:{bits:3,lv:0,hv:15},
		leafSize:{bits:3,lv:4,hv:8,calc:function(v,t){return v*(1+t.getDNA("branchWidth")*5);}},
		leafWidth:{bits:5,lv:0.1,hv:1},
		leafHue:{bits:3,lv:0.2333,hv:0.4333,calc:function(v,t){return v+(t.getDNA("magic")?0.3:0);}},
		leafSat:{bits:3,lv:0.3,hv:1},
		hasFlowers:{bits:1,onOrOff:1},
		flowerDensity:{bits:3,lv:1,hv:5,calc:function(v){return Math.round(v)}},
		flowerSize:{bits:4,lv:3,hv:15},
		flowerHue:{bits:6,lv:0,hv:1},
		flowerHueDiff:{bits:4,lv:-0.2,hv:0.2},
		flowerLum:{bits:6,lv:0.4,hv:1},
		flowerLumDiff:{bits:4,lv:-0.4,hv:0.6},
		flowerPetals:{bits:4,lv:1,special:"exp2x3"},
		flowerPetalStagger:{bits:1,onOrOff:1},
		flowerHasLevels:{bits:1,onOrOff:1},
		flowerPetalLevels:{bits:3,lv:1,hv:8},
		flowerPetalLength:{bits:5,lv:0.3,hv:2},
		flowerPetalWidth1:{bits:5,lv:0.1,hv:1},
		flowerPetalMidpoint1:{bits:3,lv:0.2,hv:0.5},
		flowerPetalWidth2:{bits:5,lv:0.1,hv:1},
		flowerPetalMidpoint2:{bits:3,lv:0.4,hv:0.8},
		flowerPetalBend:{bits:4,lv:-0.7,hv:0.8},
		flowerPetalBendEnd:{bits:4,lv:-0.7,hv:0.8},
		flowerCenterSize:{bits:3,lv:0.1,hv:0.7},
		seedDispertion:{bits:3,lv:0.01,hv:1,calc:function(v,t){return v*t.getDNA("size")*(t.getDNA("hasFlowers")?3:1);}},
		magic:{bits:1,onOrOff:1,calc:function(v,t){
			isMagic = true;
			var v = 3, n = 0;
			for (var i = 3; i < 64; i += 9) {
					v += t.DNA.getBit(i) * (1 << n);			
					n++;
			}
			v /= 10;

			for (var i = 0; i < 50; i += v) {
				isMagic = isMagic && t.DNA.getBit(Math.round(i));
			}			
			return isMagic;
		}},
		aura:{bits:4,lv:0,hv:15}
	};
	
	var n = 0;
	for (var i in this.DNADefinition) {
		var d = this.DNADefinition[i];
		d.bp = n;
		n += d.bits;
	};
	
	this.hslToRgb = function(h, s, l, p) {
		var x,y,r,g,b;
		
		if (this.drawShadow) { return "rgb(0,0,0);"; }
		
		var shadow = 1;
		if (!this.darkness && this.shadowData && p) {
			
			var x = ((p.x>>3)+127)&255;
			var y = ((p.y>>3)+127)&255;
			var z = Math.max(0,Math.min(255,p.z>>4))+2;
			
			if (this.shadowData[y][x][z]) {
				//console.log("this.shadowData["+y+"]["+x+"]["+z+"] = "+this.shadowData[y][x][z]);
				var dens = this.shadowData[y][x][z];
				if (dens) {
					//shadow = Math.max(0.5,(1-(this.shadowData[y][x]-p.z)/(10+dens*5)));
					shadow = Math.max(0.5,1-(dens/15));
				}
			}
		}

		if (this.dead) {
			y = (l > .5)?
			l + s - l * s:
			l * (s + 1),
			x = l * 2 - y,
			r = hToC(x, y, h + 1 / 3);
			g = hToC(x, y, h);
			b = hToC(x, y, h - 1 / 3);
			
			if (g > r) {
				r = g;
			}
			b/=1.5;
			
			var hsl = rgbToHsl(r, g, b);
			h = hsl[0];
			s = hsl[1]*0.6;
			l = hsl[2];
		}
		
		if (this.burnt) {
			if (p && p.w) {
				l *= p.w < 1.5 + Math.random() && Math.random() > 0.5 ? 2 : 0.25 +Math.random()*0.1;
			} else {
				l *= 0.5;
			}
			
			s /= 15;
			h /= 5;
		} else if (this.snow) {
			l = ((l / 4) + 0.75) * shadow;
			if (shadow > 0.55) { l = Math.min(1, l * 1.25); }
			s /= shadow > 0.55 ? 50 : 4;
		} else {
			l = (this.getDNA("aura") == 0 ? l / 2 : l) * shadow;
		}
		
		if (this.darkness) {
			l /= 1.5;
			s /= 1.5;
		}

		y = (l > .5)?
			l + s - l * s:
			l * (s + 1),
		x = l * 2 - y,
		r = hToC(x, y, h + 1 / 3);
		g = hToC(x, y, h);
		b = hToC(x, y, h - 1 / 3);
		
		if (this.darkness) {
			r /= 1.5;
			g /= 1.5;
		}
		
		return "rgb("+Math.round(r * 255)+","+Math.round(g * 255)+","+Math.round(b * 255)+")";
	};
	
	this.getDNA = function(n) {
		var d = this.DNADefinition[n];
		if (d.c) return d.c; //cached
		if (d.onOrOff) {
			d.c = this.DNA.getBit(d.bp);
		} else {
			var v = 0;
			for (var i = 0; i < d.bits; i++) {
				v += this.DNA.getBit(d.bp + i) * (1 << i);
			}
			if (d.special) {
				switch (d.special) {
					case "exp2":
					d.c = d.lv + Math.pow(2,v);
					break;
					case "exp3":
					d.c = d.lv + Math.pow(3,v);
					break;
					case "exp2x3":
					var v = 0,v2 = 0;
					for (var i = 0; i < d.bits; i++) {
						if (i&1) {
							v2 += this.DNA.getBit(d.bp + i) * (1 << (i >> 1));
						} else {
							v += this.DNA.getBit(d.bp + i) * (1 << (i >> 1));
						}
					}
					d.c = d.lv + Math.pow(2,v) + Math.pow(3,v2);
					break;
				}
			} else if (d.expIncrease) {
				d.c = d.lv + ((Math.pow(d.expIncrease,(v / ((1 << d.bits) - 1)))- 1) * ((d.hv - d.lv) / d.expIncrease));
			} else {
				d.c = (d.lv + (v / ((1 << d.bits) - 1)) * (d.hv - d.lv));
			}
		}
		if (d.calc) {
			d.c = d.calc(d.c,this);
		}
		return d.c;
	};
	
	this.leafColor = this.hslToRgb(this.getDNA("leafHue"), this.getDNA("leafSat"), 0.5);
	this.flowerColor = this.hslToRgb(this.getDNA("flowerHue"), 1, this.getDNA("flowerLum"));
	this.branchColors = [];
	this.size = this.getDNA("size");
	this.leafTwist = 0;
	this.hasBeenDrawn = null;
	
	this.setDNARelation = function(v) {
		this.DNARelation = v.dnaBits;
		this.DNARelationRatings = Number(v.ratings);
	};
	
	this.getAttributes = function() {
		var rv = {
			DNA:this.DNA.data,
			age:this.age,
			height:this.height,
			width:this.width,
			hasFlowers:this.getDNA("hasFlowers"),
			seedDispertion:this.getDNA("seedDispertion"),
			waterNeed:(this.getDNA("leafCount")+0.1) * this.getDNA("leafSize") * (this.getDNA("branchHue") + 1),
			growthRate:((this.getDNA("leafCount")+0.1) * this.getDNA("leafSize") * (this.getDNA("branchHue") + 1)+10) * this.getDNA("branchLength") / 10,
			heartiness:(1000/((this.getDNA("leafCount")+0.1) * this.getDNA("leafSize") * (this.getDNA("branchHue") + 1)+1)) * this.getDNA("branchWidth") * (1-this.getDNA("branchHue")),
			temperatureZone:((1-(this.getDNA("leafWidth")) + this.getDNA("leafHue"))) + (1-this.getDNA("branchHue")),
			magic:this.getDNA("magic"),
			aura:this.getDNA("aura"),
		};
		
		/*var high = {}, low = {}, tot = {};
		
		for (var i in this.DNARelation) {
			
			for (var j in this.DNARelation[i]) {
				if (high[j] == undefined) {
					high[j] = 0;
					low[j] = 0;
				}
				
				if (Number(this.DNARelation[i][j]) < 0) {
					low[j] += Number(this.DNARelation[i][j]);
				} else {
					high[j] += Number(this.DNARelation[i][j]);
				}
				
				if (this.DNA.getBit(Number(i))) {
					if (rv[j] != undefined) {
						tot[j]++;
						rv[j] += Number(this.DNARelation[i][j]) / this.DNARelationRatings;
					} else {
						tot[j] = 1;
						rv[j] =  Number(this.DNARelation[i][j]) / this.DNARelationRatings;
					}
				}
			}
		}

		
		for (var i in low) {
			rv[i] = Math.round((rv[i] - low[i]) / (high[i] - low[i]) * 100);
		}*/
		
		return rv;
	};
	
	this.getDNADescription = function(n) {
		var rv = ["DNA: "+this.DNA.data];
		var bits = 0;
		for (var i in this.DNADefinition) {
			var d = this.DNADefinition[i];
			rv.push(i + ": "+d.c);
			bits += d.bits;
		};
		rv.push("Total bits: "+bits);
		return rv.join("\n");
	};
	
	this.grow = function(step) {
		for (var i = 0; i < step; i++) {
			this.growNode(this.nodes,1);
			this.age+=1;
		}
	};
	
	this.growNode = function(node,step) {
		var firstBranch = (node.lvl == 0 && this.getDNA("initialBranchesYes"));
	
		var s = this.size * step ? step : 1;
		
		var ungreenness = (Math.pow(1+Math.abs((this.getDNA("branchHue") - this.getDNA("branchEndHue")) - 0.33333),2)-1)*30+((this.size-0.15)*3);
		
		if (node.w > ungreenness) {
			this.maxGrowth = 1;			
		} else {
			
			if (!firstBranch) {
				node.l += s;
				if (node.l > this.getDNA("branchWidth") * 4) {
					node.w += this.getDNA("branchWidth") * s;
				}
			}
			if ((node.l > (this.getDNA("branchLength") + Math.random() * this.getDNA("branchLengthRand")) * s || firstBranch) && !node.c.length) {
				var be = Math.round(this.getDNA("branchEvery") + Math.random() * this.getDNA("branchEveryRand"));
				if ((node.lvl % be) == Math.round(this.getDNA("branchPos") * (be - 1)) || firstBranch) { // branch
					var m = firstBranch ? this.getDNA("initialBranches") : Math.round(this.getDNA("branchCount") + this.getDNA("branchCountRand") * Math.random());
					var mh = m / 2;
					if (mh == 0) { mh = 0.001; }
					
					for (var i = 0; i <= m; i ++) {
						var a1 = node.a1 + (((i / mh) - 1) * this.getDNA("branchTwist")) + (Math.random() - 0.5) * this.getDNA("branchTwistRand");
						var a2 = node.a2 + ((i / mh) - 1) * Math.PI;
						
						node.c.push({
							a:Math.random() * Math.PI * 2,
							n:this.nodeCount,
							lvl:node.lvl+1,
							a1:Math.atan2(Math.sin(a1) + this.getDNA("branchGravitation"),Math.cos(a1)),
							a2:a2,
							l:0.1,
							w:0.2,
							c:[]
						});
						this.nodeCount++;
					}
				} else { // trunk direction
					this.nodeCount++;
					//var t = Math.max(1, (node.w / this.getDNA("branchWidth")) / 30);
					var t = 1;
					
					var a1 = node.a1 + Math.cos(node.a) * this.getDNA("trunkTwist") * t;
					node.c.push({
						a:node.a,
						n:this.nodeCount,
						lvl:node.lvl+1,
						a1:Math.atan2(Math.sin(a1) + (this.getDNA("trunkGravitation")/2),Math.cos(a1)),
						a2:node.a2 + Math.sin(node.a) * this.getDNA("trunkTwist") * t,
						l:0.1,
						w:0.2,
						c:[]
					});
				}			
			}
			
			var droopyness = this.getDNA("droopyness") * ((node.lvl / (this.depth + 30)) / 10);
			node.a1 = Math.atan2(Math.sin(node.a1)-droopyness,Math.cos(node.a1));
			node.a2 = Math.atan2(Math.sin(node.a2)-droopyness,Math.cos(node.a2));
				
			if (node.c && node.c.length) {
				for (var i = 0; i < node.c.length; i++) {
					this.growNode(node.c[i]);
				}
			}
		}
	};
	
	this.drawPlant = function(ctx,ox,oy,options) {
		this.ox = ox;
		this.oy = oy;
		this.leafTwist = 0;
		this.height = 0;
		this.width = 0;
		this.wlow = this.whigh = 0;
		this.startDrawTime = unixTS();
		
		if (options.finalRender || options.drawShadow) {
			var useCtx = {p:ctx,c:[]};
		} else {
			var useCtx = ctx;
		}
		
		this.darkness = options.darkness ? true : false;
		this.burnt = options.burnt ? true : false;
		this.dead = options.dead ? true : false;
		this.drawShadow = options.drawShadow ? true : false;
		var leaves = options.leaves;
		if (this.burnt) { options.leaves = 0; }
		this.snow = options.snow ? true : false;
		
		if (options.generateShadowData) {
			this.shadowData = [];
			for(var y=0;y<256;y++){
				this.shadowData[y]=[];
				for(var x=0;x<256;x++){
					this.shadowData[y][x]=[];
					for(var z=0;z<64;z++){
						this.shadowData[y][x][z]=0;
					}
				}
			}
		}
		
		if (this.hasBeenDrawn == null || !options.timeStep) {
			this.hasBeenDrawn = [];
		}
		if (options.view != undefined) {
			this.view = options.view;
		}
		if (this.drawNode(useCtx,options,this.nodes)) {
			if (options.drawShadow) {
				this.makeShadow(ctx,useCtx);
			} else if (options.finalRender) {
				for (i in useCtx.c) {
					if (useCtx.c[i]) {
						ctx.drawImage(useCtx.c[i], 0, 0);
					}
				}
			}
			options.leaves = leaves;
			this.hasBeenDrawn = null;
			return true;
		} else {
			return false;
		}
	};
	
	this.makeShadow = function(ctx,shadowLayers) {
		
		var tmp = document.createElement('canvas');
		tmp.setAttribute('width',ctx.canvas.width);
		tmp.setAttribute('height',ctx.canvas.height);
		var shadow = tmp.getContext('2d');
			
		var maxI = 0;
		for (var i in shadowLayers.c) {
			maxI = Math.max(Number(i),maxI);
		}
		
		for (var i = maxI; i >= 0; i --) {
			if (shadowLayers.c[i]) {
				
				shadow.drawImage(shadowLayers.c[i],0,0);

				this.blurImage(shadow,Math.ceil((Math.pow(2,i/5)-1)/2));
			}
		}
		ctx.globalAlpha = 0.5;
		ctx.drawImage(shadow.canvas,0,0);
		ctx.globalAlpha = 1.0;
		
	};
	
	this.blurImage = function(ctx,r) {
		r = Math.max(1,r);
		var tmp = document.createElement('canvas');
		tmp.setAttribute('width',Math.max(32,Math.floor(ctx.canvas.width/r)));
		tmp.setAttribute('height',Math.max(32,Math.floor(ctx.canvas.height/r)));
		var shadow = tmp.getContext('2d');

		shadow.drawImage(ctx.canvas,0,0,shadow.canvas.width,shadow.canvas.height);
		
		ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
		ctx.drawImage(shadow.canvas,0,0,ctx.canvas.width,ctx.canvas.height);
		
	};
	
	this.drawNode = function(useCtx,options,node,start,level) {
		if (options.timeStep && this.hasBeenDrawn[node.n]) return true;
		
		if (!options) {options = {};};
		this.depth = Math.max(this.depth,node.lvl);
		if (!start) {
			var start = {x:0,y:0,z:0};
		}
		
		var p = {x:start.x,y:start.y,z:start.z};
		var pstart = {x:start.x,y:start.y,z:start.z};
		var x = this.transformX(pstart), y = this.transformY(pstart);
		var ps = {x:x,y:y};
		
		if (node.lvl > 0 && ((Math.sin(node.a1) < 0 && p.z < 5) || p.z < 0)) {
			if (this.getDNA("hitGroundRoot")) {
				node.a1 = node.a2 = 1.570796327;
			} else {
				node.a1 = Math.atan2(0,Math.cos(node.a1));
				node.a2 = Math.atan2(0,Math.cos(node.a2));
			}
		}
		
		var dist = Math.cos(node.a1) * node.l;
		p.x += Math.sin(node.a2) * dist;
		p.y += Math.cos(node.a2) * dist;
		p.z += Math.sin(node.a1) * node.l;
		
		this.height = Math.max(p.z,this.height);
		this.wlow = Math.min(p.y,Math.min(p.x,this.wlow));
		this.whigh = Math.max(p.y,Math.max(p.x,this.whigh));
		this.width = this.whigh - this.wlow;
		
		
		if (options.generateShadowData) {
			this.createShadow(pstart,p,node.w);
		} else if (options.finalRender) {		
			this.drawBranch(useCtx,pstart,p,node);
		} else {
			useCtx.strokeStyle = this.getBranchColor(node.w);
			useCtx.lineWidth = node.w;
			
			useCtx.beginPath();

			useCtx.lineCap = 'round';
			useCtx.moveTo(x,y);
			
			useCtx.lineTo(this.transformX(p),this.transformY(p));	

			useCtx.stroke();
		}
	
		var leafDepth = this.getDNA("bushiness") * this.depth;
		
		if (options.leaves && node.lvl >= this.depth - leafDepth) { //draw leaves
			var lc;
			if (lc = this.getDNA("leafCount") * options.leaves) {
				lc = Math.max(2,Math.round((lc * this.size) / this.getDNA("branchEvery")) + 1);
				var pe = {x:this.transformX(p),y:this.transformY(p)};
				var num = 0;
				var again = 0;
				for (var i = 1; i < lc; i++) {
					again = 0;
					switch (this.getDNA("leafPosition")) {
						case 0:
						case 1:
						var dir = num & 1 ? 1 : -1;
						if ((num & 1) == 0) { again = 1; }
						break;
						case 2:
						var dir = Math.random() > 0.5 ? 1 : -1;
						break;
						case 3:
						var dir = ((i+node.lvl)&1) ? 1 : -1;
						break;
					}
					var dist = i / (lc + 1);
					var nDist = 1-dist;
					var nwd2 = (2+(node.w/5));
					if (options.generateShadowData) {
						this.createShadow(p,p,nwd2*this.getDNA("leafSize"));
					} else if (options.finalRender) {
						this.drawLeaf(useCtx,{
							x:pstart.x*dist+p.x*nDist,
							y:pstart.y*dist+p.y*nDist,
							z:pstart.z*dist+p.z*nDist
						},node.a1+this.getDNA("leafAngle"),node.a2,dir,nwd2);
					} else {
						var aa = Math.atan2(pe.y-ps.y,pe.x-ps.x)+this.getDNA("leafAngle")*dir;
						var x1 = (ps.x*dist+pe.x*nDist)+Math.cos(aa)*nwd2;
						var y1 = (ps.y*dist+pe.y*nDist)+Math.sin(aa)*nwd2;
						
						var x2 = (ps.x*dist+pe.x*nDist)+Math.cos(aa)*nwd2*this.getDNA("leafSize");
						var y2 = (ps.y*dist+pe.y*nDist)+Math.sin(aa)*nwd2*this.getDNA("leafSize");
					
						useCtx.strokeStyle = this.leafColor;
						useCtx.lineWidth = ((this.getDNA("flowerPetalWidth1")/2)+1) * this.getDNA("leafSize");
						useCtx.beginPath();
						useCtx.lineCap = 'round';
						useCtx.moveTo(x1,y1);
						useCtx.lineTo(x2,y2);	
						useCtx.stroke();
					}
					if (again) {i--;}
					num++;
				}
			}
		}
			
		if (node.c.length && !(this.burnt && node.w < 0.5 + Math.random() * 3 && Math.random() > 0.5 && node.lvl > 1)) {
		//if (node.c.length) {
			for (var i = 0; i < node.c.length; i++) {
				if (!this.drawNode(useCtx,options,node.c[i],p,level + 1)) return false;
			}
		} else if (options.bloom && !options.burnt && !options.dead && this.getDNA("hasFlowers") && (node.n % (this.getDNA("flowerDensity")) == 0)) {
		
			//if (this.depth > this.getDNA("branchEvery") && node.lvl > this.depth - this.getDNA("branchEvery") && options.bloom && this.getDNA("hasFlowers") && ((node.n % (this.getDNA("flowerDensity")) == 0) || !node.c.length)) {
			if (options.generateShadowData) {
				this.createShadow(p,p,this.getDNA("flowerSize"));
			} else if (options.finalRender) {
				this.drawFlower(useCtx,p,node.a1,node.a2);
			} else {
				useCtx.fillStyle = this.flowerColor;
				useCtx.beginPath();
				useCtx.arc( this.transformX(p),this.transformY(p), this.getDNA("flowerSize"), 0, Math.PI*2, true);
				useCtx.closePath();
				useCtx.fill();
			}
		}
		if (options.timeStep) {
			this.hasBeenDrawn[node.n] = 1;
			if (unixTS() > this.startDrawTime + options.timeStep) {
				return false;
			}
		}
		
		return true;
	};	
	
	this.getBounds = function(node,start,level,bounds) {
		var oxOld = this.ox;
		var oyOld = this.oy;
		this.oy = this.ox = 0;
		if (!level) {
			var node = this.nodes;
			var start = {x:0,y:0,z:0};
			var level = 0;
			var bounds = {x1:5000,y1:5000,x2:-5000,y2:-5000};
			this.padding = Math.max(
				this.getDNA("leafSize") * (2+(node.w/5)),
				this.getDNA("flowerPetalBendEnd") * this.getDNA("flowerSize")
			) + 1;
		}
		
		var p = {x:start.x,y:start.y,z:start.z};
		
		if (node.lvl == 0) {
			var x = this.transformX(p);
			var y = this.transformY(p);
			bounds.x1 = Math.min(bounds.x1,x-this.padding);
			bounds.y1 = Math.min(bounds.y1,y-this.padding);
			bounds.x2 = Math.max(bounds.x2,x+this.padding);
			bounds.y2 = Math.max(bounds.y2,y+this.padding);	
		}
			
		var dist = Math.cos(node.a1) * node.l;
		p.x += Math.sin(node.a2) * dist;
		p.y += Math.cos(node.a2) * dist;
		p.z += Math.sin(node.a1) * node.l;
		
		var x = this.transformX(p);
		var y = this.transformY(p);
		
		bounds.x1 = Math.min(bounds.x1,x-this.padding);
		bounds.y1 = Math.min(bounds.y1,y-this.padding);
		bounds.x2 = Math.max(bounds.x2,x+this.padding);
		bounds.y2 = Math.max(bounds.y2,y+this.padding);
		
		if (node.c.length) {
			for (var i = 0; i < node.c.length; i++) {
				this.getBounds(node.c[i],p,level + 1,bounds);
			}
		}
		if (level == 0) {
			bounds.w = bounds.x2 - bounds.x1;
			bounds.h = bounds.y2 - bounds.y1;

			this.ox = oxOld;
			this.oy = oyOld;
			return bounds;
		}
	};
	
	this.createShadow = function(start,end,size) {
		var x = ((start.x>>3)+127)&255;
		var y = ((start.y>>3)+127)&255;
		var z = Math.max(0,Math.min(255,start.z>>4));
		//TODO Make shadow go from start to end and be affected by size
		
		for (var i = z; i >= 0; i--) {
			if (size < 1) {
				this.shadowData[y][x][i] += size;
			} else {
				size = size>>4+1;
				for (var y2 = y-size; y2 <= y+size; y2++) {
					for (var x2 = x-size; x2 <= x+size; x2++) {
						this.shadowData[y2][x2][i] ++;
					}
				}
			}
		}
	};
			
	this.drawBranch = function(useCtx,start,end,node) {
		
		var trunkSegments = this.getDNA("trunkSegments");
		var coreSize = this.getDNA("trunkCoreSize");
		var colorRand = this.getDNA("trunkColorRand");
		var segmentLum = this.getDNA("trunkSegmentLum");
		var segmentSize =this.getDNA("trunkSegmentSize");

		var pos = Math.min(1, node.w / (this.getDNA("branchWidth") * this.size * 40));

		var h = ((this.getDNA("branchHue") - (this.getDNA("branchEndHue") * pos)) * 2 + this.getDNA("leafHue")) / 3;
		
		var s = ((this.getDNA("branchSat") - (this.getDNA("branchEndSat") * pos)) * 2 + this.getDNA("leafSat")) / 3;
		
		var l = 0.5 + segmentLum;
		
		
		var ps = {x:this.transformX(start),y:this.transformY(start)};
		var pe = {x:this.transformX(end),y:this.transformY(end)};
		var ctx = this.getCtx(useCtx,start);
		
		ctx.strokeStyle = this.hslToRgb(h,s,0.5+Math.cos(node.a1)/6,node);
		ctx.lineWidth = node.w * coreSize;
		ctx.beginPath();
		ctx.lineCap = 'round';
		ctx.moveTo(ps.x,ps.y);	
		ctx.lineTo(pe.x,pe.y);		
		ctx.stroke();
		
		if (this.drawShadow) { return; }
				
		var a1 = Math.atan2(pe.y-ps.y,pe.x-ps.x) + Math.PI/2;
		var a2 = a1 + Math.PI;
		var b1 = a2 + Math.PI/2;
		var b2 = b1 + Math.PI;
		
		var d = {x:start.x-end.x,y:start.y-end.y,z:start.z-end.z};
		var dist = Math.sqrt(d.x*d.x+d.y*d.y);
		var dist = Math.sqrt(dist*dist+d.z*d.z);
		var segmentIncrement = 1/trunkSegments;
		var nwd2 = node.w/2;
				
		if (trunkSegments) {
			for (i = 0; i < 1; i += segmentIncrement) {
				var ni = 1-i;
				var p = {x:start.x*ni+end.x*i,y:start.y*ni+end.y*i,z:start.z*ni+end.z*i};
				
				var ctx = this.getCtx(useCtx,p);

				ctx.fillStyle = this.hslToRgb(h,s,l+Math.cos(node.a1)/6+Math.random()*colorRand,node);
				
				ctx.beginPath();
				
				ctx.moveTo(this.transformX(p)+Math.cos(a1)*nwd2,this.transformY(p)+Math.sin(a1)*nwd2); 
				
				ctx.lineTo(this.transformX(p)+Math.cos(b1)*segmentSize,this.transformY(p)+Math.sin(b1)*segmentSize); 
				
				ctx.lineTo(this.transformX(p)+Math.cos(a2)*nwd2,this.transformY(p)+Math.sin(a2)*nwd2); 

				ctx.lineTo(this.transformX(p)+Math.cos(b2)*segmentSize,this.transformY(p)+Math.sin(b2)*segmentSize); 

				ctx.closePath();
				ctx.fill();

			}
		}
	}
	
	this.drawLeaf = function(useCtx,sp,a1,a2,dir,w) {
		var trans = {x:sp.x,y:sp.y,z:sp.z,a1:a1-Math.PI/2,a2:a2-Math.PI/2};
		var ctx = this.getCtx(useCtx,trans);
		
		var p = {x:0,y:0};
		
		var size = this.getDNA("leafSize") * w;
				
		var leafWidth = size * this.getDNA("leafWidth");
		
		var midpoint1 = this.getDNA("flowerPetalMidpoint1");
		var midpoint2 = this.getDNA("flowerPetalMidpoint2");
		var leafWidth1 = ((this.getDNA("flowerPetalWidth1")/2)+1) * leafWidth;
		var leafWidth2 = ((this.getDNA("flowerPetalWidth2")/2)+1) * leafWidth;
		
		var zmid1 = this.getDNA("flowerPetalMidpoint1") * this.getDNA("flowerPetalBend") * size;
		var zmid2 = this.getDNA("flowerPetalMidpoint2") * this.getDNA("flowerPetalBend") * size;
		var zend = this.getDNA("flowerPetalBendEnd") * size;
		
		if (this.getDNA("leafTwist")) {
			this.leafTwist += this.getDNA("leafTwist");
		}
		
		a = (this.leafTwist) + (Math.PI/2)*dir;
		var ab = a + (Math.PI/2);
		
		var pmid1 = {x:p.x+Math.cos(a)*size*midpoint1,y:p.y+Math.sin(a)*size*midpoint1,z:zmid1};
		var pmid2 = {x:p.x+Math.cos(a)*size*midpoint2,y:p.y+Math.sin(a)*size*midpoint2,z:zmid2};
		
		//ctx.strokeStyle = this.hslToRgb(hue,1,lum);
		ctx.fillStyle = this.hslToRgb(this.getDNA("leafHue"), this.getDNA("leafSat"), 0.6-Math.abs(Math.sin(a2)/5),trans);
		ctx.beginPath();
		//ctx.lineCap = 'round';
		
		var tpstart = this.transform3dTo2d({x:p.x+Math.cos(a),y:p.y+Math.sin(a),z:0},trans);	
		ctx.moveTo(tpstart.x,tpstart.y);
		
		var tp = this.transform3dTo2d({x:p.x+Math.cos(a)*size,y:p.y+Math.sin(a)*size,z:zend},trans);
		var tpm1 = this.transform3dTo2d({x:pmid1.x+Math.cos(ab)*leafWidth1,y:pmid1.y+Math.sin(ab)*leafWidth1,z:zmid1},trans);
		var tpm2 = this.transform3dTo2d({x:pmid2.x+Math.cos(ab)*leafWidth2,y:pmid2.y+Math.sin(ab)*leafWidth2,z:zmid2},trans);
		ctx.bezierCurveTo(tpm1.x,tpm1.y, tpm2.x,tpm2.y, tp.x,tp.y);
		
		var tp = this.transform3dTo2d({x:p.x+Math.cos(a)*size,y:p.y+Math.sin(a)*size,z:0},trans);
		var tpm1 = this.transform3dTo2d({x:pmid1.x+Math.cos(ab+Math.PI)*leafWidth1,y:pmid1.y+Math.sin(ab+Math.PI)*leafWidth1,z:zmid1},trans);
		var tpm2 = this.transform3dTo2d({x:pmid2.x+Math.cos(ab+Math.PI)*leafWidth2,y:pmid2.y+Math.sin(ab+Math.PI)*leafWidth2,z:zmid2},trans);
		ctx.bezierCurveTo(tpm2.x,tpm2.y, tpm1.x,tpm1.y, tpstart.x,tpstart.y);
		
		
		ctx.closePath();
		//ctx.stroke();
		ctx.fill();
		
	};
	
	this.drawFlower = function(useCtx,sp,a1,a2) {
		var trans = {x:sp.x,y:sp.y,z:sp.z,a1:a1-Math.PI/2,a2:a2-Math.PI/2};
		var ctx = this.getCtx(useCtx,trans);
		var p = {x:0,y:0};
		var size = this.getDNA("flowerSize");
		//var size = this.getDNA("flowerSize") * this.size * 10; //Zoomed in for debug
		
		var centerSize = this.getDNA("flowerCenterSize") * size;
		var petals = this.getDNA("flowerPetals");
		var levels = this.getDNA("flowerHasLevels") ? this.getDNA("flowerPetalLevels") : 1;
		
		var hue = this.getDNA("flowerHue");
		var lum = this.getDNA("flowerLum");
		var midpoint1 = this.getDNA("flowerPetalMidpoint1");
		var midpoint2 = this.getDNA("flowerPetalMidpoint2");
		var flowerPetalWidth1 = this.getDNA("flowerPetalWidth1") * size;
		var flowerPetalWidth2 = this.getDNA("flowerPetalWidth2") * size;
		
		var zmid1 = this.getDNA("flowerPetalMidpoint1") * this.getDNA("flowerPetalBend") * size;
		var zmid2 = this.getDNA("flowerPetalMidpoint2") * this.getDNA("flowerPetalBend") * size;
		var zend = this.getDNA("flowerPetalBendEnd") * size;
		
		
		for (var lvl = 0; lvl < levels; lvl++) {
			centerSize *= 0.8;
		}
		
		ctx.fillStyle = this.hslToRgb(1/6,this.getDNA("leafSat"),0.5-Math.abs(Math.sin(a2)/5),p);
		ctx.beginPath();
		var tp = this.transform3dTo2d({x:p.x+Math.cos(a)*centerSize,y:p.y+Math.sin(a)*centerSize,z:0},trans);
		ctx.moveTo(tp.x,tp.y);
		var a = 0;
		for (var i = 0; i < petals; i ++) {
			a += (Math.PI*2) / petals;
			var tp = this.transform3dTo2d({x:p.x+Math.cos(a)*centerSize,y:p.y+Math.sin(a)*centerSize,z:0},trans);
			ctx.lineTo(tp.x,tp.y);
		}
		ctx.closePath();
		ctx.fill();
		
		var a = 0;
		var centerSize = this.getDNA("flowerCenterSize") * size;
		for (var lvl = 0; lvl < levels; lvl++) {
			for (var i = 0; i < petals; i ++) {
				a += (Math.PI*2) / petals;
				var ab = a + (Math.PI/2);
				
				var pmid1 = {x:p.x+Math.cos(a)*(centerSize+size)*midpoint1,y:p.y+Math.sin(a)*(centerSize+size)*midpoint1,z:zmid1};
				var pmid2 = {x:p.x+Math.cos(a)*(centerSize+size)*midpoint2,y:p.y+Math.sin(a)*(centerSize+size)*midpoint2,z:zmid2};
				
				//ctx.strokeStyle = this.hslToRgb(hue,1,lum);
				ctx.fillStyle = this.hslToRgb(hue,1,lum-Math.abs(Math.sin(a2)/5),pmid1);
				ctx.beginPath();
				ctx.lineCap = 'round';
				
				var tpstart = this.transform3dTo2d({x:p.x+Math.cos(a)*centerSize,y:p.y+Math.sin(a)*centerSize,z:0},trans);	
				ctx.moveTo(tpstart.x,tpstart.y);
				
				var tp = this.transform3dTo2d({x:p.x+Math.cos(a)*(centerSize+size),y:p.y+Math.sin(a)*(centerSize+size),z:zend},trans);
				var tpm1 = this.transform3dTo2d({x:pmid1.x+Math.cos(ab)*flowerPetalWidth1,y:pmid1.y+Math.sin(ab)*flowerPetalWidth1,z:zmid1},trans);
				var tpm2 = this.transform3dTo2d({x:pmid2.x+Math.cos(ab)*flowerPetalWidth2,y:pmid2.y+Math.sin(ab)*flowerPetalWidth2,z:zmid2},trans);
				ctx.bezierCurveTo(tpm1.x,tpm1.y, tpm2.x,tpm2.y, tp.x,tp.y);
				
				var tp = this.transform3dTo2d({x:p.x+Math.cos(a)*(centerSize+size),y:p.y+Math.sin(a)*(centerSize+size),z:0},trans);
				var tpm1 = this.transform3dTo2d({x:pmid1.x+Math.cos(ab+Math.PI)*flowerPetalWidth1,y:pmid1.y+Math.sin(ab+Math.PI)*flowerPetalWidth1,z:zmid1},trans);
				var tpm2 = this.transform3dTo2d({x:pmid2.x+Math.cos(ab+Math.PI)*flowerPetalWidth2,y:pmid2.y+Math.sin(ab+Math.PI)*flowerPetalWidth2,z:zmid2},trans);
				ctx.bezierCurveTo(tpm2.x,tpm2.y, tpm1.x,tpm1.y, tpstart.x,tpstart.y);
				
				
				ctx.closePath();
				//ctx.stroke();
				ctx.fill();
				
			}
			if (this.getDNA("flowerPetalStagger")) a += ((Math.PI*2) / petals) / 2;
			centerSize *= 0.8;
			size *= 0.8;
			hue += this.getDNA("flowerHueDiff") / levels;
			lum = Math.min(1,lum + this.getDNA("flowerLumDiff") / levels);
			
		}
		
		
	};
	
	//flowerPetals:{bits:5,lv:2,hv:34},
	//flowerPetalLevels:{bits:3,lv:1,hv:8},
	//flowerPetalLength:{bits:5,lv:0.3,hv:2},
	//flowerCenterSize:{bits:3,lv:0.1,hv:0.7}
		
	this.getBranchColor = function (w) {
		if (this.branchColors["n"+w]) {
			return this.branchColors["n"+w];
		} else {
			var pos = Math.min(1, w / (this.getDNA("branchWidth") * this.size * 40));

			var h = ((this.getDNA("branchHue") - (this.getDNA("branchEndHue") * pos)) * 2 + this.getDNA("leafHue")) / 3;
			var s = ((this.getDNA("branchSat") - (this.getDNA("branchEndSat") * pos)) * 2 + this.getDNA("leafSat")) / 3;
		
			return this.branchColors["n"+w] = this.hslToRgb(h,s,0.5);
		}
	};
	
	this.getCtx = function(a,p) {
		if (a.c) {
			if (this.drawShadow) {
				var i = Math.max(0,p.z >> 4);
			} else {
				switch (this.view) {
					case 0: //Bird's Eye
					var i = Math.max(0,p.z >> 3);
					break;
					
					case 1: //Side View
					var i = Math.max(0,p.y >> 3);
					break;
					
					case 2: //2.5D
					var i = Math.max(0,(p.y+p.z) >> 3);
					break;
				}
			}
			if (!a.c[i]) {
				a.c[i] = document.createElement('canvas');
				a.c[i].setAttribute('width',a.p.canvas.width);
				a.c[i].setAttribute('height',a.p.canvas.height);
			}
			return a.c[i].getContext('2d');
		}
		return a;	
	};
	
	this.transformX = function (p) {
		switch (this.view) {
			case 0: //Bird's Eye
			case 1: //Side View
			case 2: //2.5D
			return p.x+this.ox;
		}
	};
	
	this.transformY = function (p) {
		var z = this.drawShadow ? 0 : p.z;

		switch (this.view) {
			case 0: //Bird's Eye
			return p.y+this.oy;
			
			case 1: //Side View
			return -z+this.oy;
			
			case 2: //2.5D
			return (p.y/2)-z+this.oy;
		}
	};
	
	this.transform3dTo2d = function(p,trans) {
		
		var a1 = Math.atan2(p.y,p.z) + trans.a1;
		var dist = Math.sqrt(p.y * p.y + p.z * p.z);
		
		p.z = Math.cos(a1) * dist;
		p.y = Math.sin(a1) * dist;
		
		var a2 = Math.atan2(p.y,p.x) + trans.a2;
		var dist = Math.sqrt(p.y * p.y + p.x * p.x);
		
		p.x = Math.cos(a2) * dist;
		p.y = Math.sin(a2) * dist;
						
		p.x += trans.x;
		p.y += trans.y;
		var z = p.z + trans.z;
		
		if (this.drawShadow) { z = 0; }
		
		switch (this.view) {
			case 0: //Bird's Eye
			return {x:p.x+this.ox,y:p.y+this.oy};
			
			case 1: //Side View
			return {x:p.x+this.ox,y:-z+this.oy};
			
			case 2: //2.5D
			return {x:p.x+this.ox,y:(p.y/2)-z+this.oy};
		}
	};
		
};
