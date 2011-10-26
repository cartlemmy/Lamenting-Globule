<?php

$config = array(
	"width"=>800,
	"height"=>600
);

ob_start();

?><script type="text/javascript" src="js/base64.js"></script>
<script type="text/javascript" src="js/serialize.js"></script>
<script type="text/javascript" src="js/canvas2image.js"></script>
<script type="text/javascript" src="js/core.source.js"></script>
<script type="text/javascript" src="js/general.source.js"></script>
<script type="text/javascript" src="js/graphics.topdown.source.js"></script>
<canvas id="canvas" width="<?=$config["width"];?>" height="<?=$config["height"];?>" style="width:<?=$config["width"];?>px;height:<?=$config["height"];?>px;display:block;position:absolute;top:0px;">Canvas not supported</canvas>
<textarea id="debug" style="font-weight:bold;width:600px;height:20px;display:block;position:absolute;top:0px;left:140px;border:none;background-color:transparent;color:#FFFFFF;"></textarea>
<div id="fps" style="padding:8px;position:absolute;top:0px;color:#FFFFFF;font-size:32px;font-family:monospace;font-weight:bold;"></div>

<script type="text/javascript">

var keyDown = Object();
var tm = null;
var frame = 0;
var curTS = unixTS(true);
var x = 0, y = 0, mx = 0, my = 0;
var rand = [];
var showPlants = 1;
var showGrass = 0;

var core = null;

var spriteData = {};
var spriteSource = [
"5DCC9DE1C4786A712877A8E389534E8A417B18C91284A963",
"2E5DAE40C96857093BFD26B5641A341D5467153A58B89130",
"8B1D6FA3E5A979687B7F86479B30D81B45E54909A96BD16C",
"97A6BD23EC468CA23C5678CFF4ECB2DFBC47A668CA5F6A47",
"548BA94BE29BAC76821C25FEAA2784BC975C86295CECBEFD",
"AAE187A1D9DC5244C6ACA8EA5FEC3594EB23944A3D499ABE",
"8B1D6FA3E5A979687B7F86479B30D81B45E54909A96BD16C",
"548BA94BE29BAC76821C25FEAA2784BC975C86295CECBEFD"
];

var mapSize = 64;
var mapSizeMask = mapSize - 1;
window.onload = function() {
	
	document.getElementById('canvas').onmousemove = function getMouseXY(e) {
		mx = e.pageX * (10000 / window.innerWidth);
		my = e.pageY * (10000 / window.innerHeight);
	}

	for (var i = 0; i < mapSize * mapSize; i ++) {
		rand.push(Math.random());
	}
	
	tm = new lgGraphicsTopdown({tileSize:32,shading:2,enableStaticSprites:true});
	tm.initTileFetcher("tile-sheet",{
		tileSize:32,
		src:"images/test.png",
		getTileNumberForPoint:function(x,y){
			return ((y&3)<<2)+(x&3);
		},
		getZForPoint:function(x,y) {
			var p = getRandPoint(x/8,y/8) * 40 + 20;
			return (Math.sin(x/p)*Math.sin(y/p) * 40) + 41;
		},
		getStaticSpritesForPoint:function(x,y,requestSort) {
			var rv = [];
			if (!showPlants) return rv;
			for (var i = 0; i < spriteSource.length + showGrass; i++) {
				var size = (Math.min(12,(
					getRandPoint((x/4)+rand[i*33]*20,(y/4)+rand[i*65]*20)*1.5-1
				)* 12)|0)*10;
				
				if (i == spriteSource.length) {
					if (!requestSort) {
						for (j = 0; j < Math.max(20,size); j++) {
							var grass = document.createElement('canvas');
							var h = (Math.random() * 3 + 2)|0
							grass.setAttribute('width',1);
							grass.setAttribute('height',h);
							var ctx = grass.getContext('2d');
							ctx.strokeStyle = "#0"+((Math.random()*5+5)|0)+"0";
							ctx.moveTo(0.5,0.5);
							ctx.lineTo(0.5,h);
							ctx.stroke();
						
							rv.push({
								x:rand[x+j]*32,
								y:rand[y+j]*32,
								xBase:0,
								yBase:h,
								ctx:ctx							
							});
						}
					}
				} else {
					if (size >= 10 && getRandPoint(x,y) > size/120) {
						var tmp = getSpriteData(i,((rand[((x+y+rand[i])*12)&1023]*32)|0)&1,size);
						if (tmp && requestSort ^ (tmp.ctx.canvas.height > 32 ? 0 : 1)) {
							tmp.x = rand[((x+y+rand[i])*12)&1023] * 32;
							tmp.y = rand[((x+y+rand[i])*12)&1023] * 32;
							tmp.z = this.getZForPoint(x,y);
							rv.push(tmp);
						}
					}
				}
			}
			return rv;
		}
	});
	
	lgCoreRegister(
		core = new lgCore({
			ctx:document.getElementById('canvas').getContext('2d'),
			renderer:tm,
			render:true,
			fpsMax:30
		})
	);
	
	setInterval("upd()", 16);
};

function getRandPoint(x,y) {
	var tileX = x|0;
	var tileY = y|0;
	
	var xp = x % 1;
	var yp = y % 1;
	
	var z1 = rand[(tileY&mapSizeMask)*mapSize+(tileX&mapSizeMask)];
	var z2 = rand[(tileY&mapSizeMask)*mapSize+((tileX+1)&mapSizeMask)];
	var z3 = rand[((tileY+1)&mapSizeMask)*mapSize+(tileX&mapSizeMask)];
	var z4 = rand[((tileY+1)&mapSizeMask)*mapSize+((tileX+1)&mapSizeMask)];
	
	return 	(z1 * (1-xp) + z2 * xp) * (1-yp) + (z3 * (1-xp) + z4 * xp) * yp;
}

function getSpriteData(n,n2,size) {
	if (spriteData[n+"_"+n2+"_"+size] === null) {
		return false;
	} else if (spriteData[n+"_"+n2+"_"+size]) {
		return spriteData[n+"_"+n2+"_"+size];
	} else {
		spriteData[n+"_"+n2+"_"+size] = null;
		
		var sri = new serverRequestInterface(this,"r.php");
		sri.index = n+"_"+n2+"_"+size;
		sri.im = new Image();
		sri.im.src = "tmp/"+spriteSource[n]+"/l"+n2+"-"+size+".png";
		sri.im.ob = sri;
		sri.im.onload = function() {
			this.ob.imageLoaded();
		}

		sri.imShadow = new Image();
		sri.imShadow.src = "tmp/"+spriteSource[n]+"/sh-l"+n2+"-"+size+".png";
		sri.imShadow.ob = sri;
		sri.imShadow.onload = function() {
			this.ob.imageLoaded();
		}

		sri.loadCnt = 2;
		sri.imageLoaded = function() {
			this.loadCnt --;
			if (this.loadCnt == 0) {
				this.request("get_plant",{dna:spriteSource[n], size:size},function(response,v,ob){
					
					v.x = 16;
					v.y = 16;
					
					var tmp = document.createElement('canvas');
					tmp.setAttribute('width',ob.parent.im.width / 2);
					tmp.setAttribute('height',ob.parent.im.height / 2);
					tmp.getContext('2d').drawImage(ob.parent.im,0,0,ob.parent.im.width / 2,ob.parent.im.height / 2);
					v.ctx = tmp.getContext('2d');
					v.xBase /= 2;
					v.yBase /= 2;
					delete v.s;
					
					var tmp = document.createElement('canvas');
					tmp.setAttribute('width',ob.parent.imShadow.width);
					tmp.setAttribute('height',ob.parent.imShadow.height);
					tmp.getContext('2d').drawImage(ob.parent.imShadow,0,0,ob.parent.imShadow.width, ob.parent.imShadow.height);
					v.shadow.ctx = tmp.getContext('2d');
					delete v.shadow.s;
					
					spriteData[ob.parent.index] = v;
				});
			}
		}
	}
	return false;
};
				
function debug(txt,noClear,noCR) {
	document.getElementById('debug').value = (noClear?document.getElementById('debug').value+(noCR?"":"\n"):"")+txt;
};

function upd() {
	x += (mx - x) / 10;
	y += (my - y) / 10;
	
	document.getElementById('fps').innerHTML = core.fps + "FPS";
	tm.setViewport(x,y);
}

</script><?php

file_put_contents("lgretest2.html",ob_get_flush());

?>

