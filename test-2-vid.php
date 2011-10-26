<html>
<head>
<style>
body {
	background-color:#000000;
	color:#FFFFFF;
}
</style>
<script type="text/javascript" src="js/general.js"></script>
<script type="text/javascript" src="js/base64.js"></script>
<script type="text/javascript" src="js/serialize.js"></script>
<script type="text/javascript" src="js/canvas2image.js"></script>
<script type="text/javascript" src="js/procPlant.js"></script>
</head>
<body>
<div style="width:960px;height:540px;background-color:#FFFFFF;padding-left:120px;">
<canvas id="canvas0" width="720" height="540" style="width:720px;height:540px;display:block;position:absolute;top:0px;margin:0;padding:0px;">Canvas not supported</canvas>
<canvas id="canvas1" width="720" height="540" style="width:720px;height:540px;display:none;position:absolute;top:0px;margin:0;padding:0px;">Canvas not supported</canvas>
</div>
<div style="width:432px;height:600px;position:absolute;top:0px;left:600px;overflow:auto;"><div style="padding:8px;" id="saved">

</div></div>
<div style="position:absolute;top:620px;">
DNA: <input type="text" id="dna" value="" size="40">
<input type="button" value="GO" onclick="startIt(document.getElementById('dna').value)">
<select id="view" onchange="updateOffset(this.selectedIndex);">
<option>Bird's Eye</option>
<option SELECTED>Side View</option>
<option>2.5d</option>
</select>
<br />
<input type="button" value="RANDOM" onclick="startIt()">
<input type="button" value="SAVE" onclick="savePlant(p)">
<br />
<div id="ratearea">

</div>
<textarea id="debug" style="width:100%" rows="12"></textarea>
</div>
<script type="text/javascript">

var fps = 2;

var timeStep = 1000 / fps;

var keyDown = Object();
var lastRender = 0;

document.body.onkeydown = function(e) {
	var k = getKeyFromEvent(e);
	keyDown["k"+k] = true;
	if (isKeyDown('ctrl')) {
		switch (k) {
			case "r":
			startIt();
			stopEvent(e);
			return false;
			
			case "g":
			startIt(document.getElementById('dna').value);
			stopEvent(e);
			return false;
			
		}
	}
}	
		
document.body.onkeyup = function(e) {
	var k = getKeyFromEvent(e);
	keyDown["k"+k] = false;
}

rateTypes = {
	beauty:["Ugly","Neutral","Beautiful"],
	waterConsumption:["Low","Normal","High"],
	temperatureZone:["Cold","Moderate","Hot"],
	heartiness:["Delicate","Normal","Hearty"],
	virtue:["Evil","Neutral","Good"]
};

window.onload = function() {
	for (var j in rateTypes) {
		var sel = dg("rate_"+j,dg("ratearea"),"select");
		sel.add(new Option(j+"...",""));
		for (var k = 0; k < 3; k++) {
			sel.add(new Option(rateTypes[j][k],String(k-1)));
			
		}
	}
	dg("rate_go",dg("ratearea"),"input",{
		type:"button",
		value:"RATE",
		onclick:function(e){
			var data = {};
			for (var j in rateTypes) {
				data[j] = dg("rate_"+j).options[dg("rate_"+j).selectedIndex].value;
			}
			var sri = new serverRequestInterface(this,"r.php");
			sri.request("rate_plant",{dna:p.DNA.data, rate:data},function(response,v,ob){
				//alert(response.responseText);
			});
		}
	});	
};

function resetRateDD() {
	for (var j in rateTypes) {
		 dg("rate_"+j).selectedIndex = 0;
	 }
};

var p = null;
var i = 0;
var xoff = 0;
var yoff = 0;
var breedStart = "";

function updateOffset(view) {
	var x = [300,300,300];
	var y = [300,540,500];
	xoff = x[view];
	yoff = y[view];
	upd(1);
};

updateOffset(dg('view').selectedIndex);

var dnaList = [<?php
	$list = array();
	if ($dp = opendir("tmp")) {
		while ($file = readdir($dp)) {
			$ext = array_pop(explode(".",$file));
			if ($ext == "png") {
				$list[] = "\"".array_shift(explode(".",$file))."\"";
			}
		}
		closedir($dp);
	}
	echo implode(",\n",$list);
?>];
var curDNA = 0;

function startIt() {
	dg('debug').value = (curDNA + 1)+" / "+dnaList.length;
	
	resetRateDD();
	i = 0;
	p = new procPlant(dnaList[curDNA]);
	var sri = new serverRequestInterface(this,"r.php");
	sri.request("ratings_data",null,function(response,v,ob){
		p.setDNARelation(v);
	});
	document.getElementById('dna').value = p.DNA.data;
	lastRender = unixTS();
	upd();
	curDNA ++;
	if (curDNA >= dnaList.length) curDNA = 0;
};

function upd(noGrow) {
	if (p == null) return;
	var canvas = document.getElementById('canvas'+(i&1));
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		//ctx.fillStyle = "rgba(255,255,255,0)";
		//ctx.fillRect(0, 0, 720, 576);
		ctx.clearRect(0,0,ctx.width,ctx.height);
		canvas.width = canvas.width;

		if (!noGrow) { p.grow(1); }
		
		document.getElementById('canvas'+(i&1)).style.display = "block";
		document.getElementById('canvas'+((i&1)^1)).style.display = "none";
		
		if (p.drawPlant(ctx,xoff,yoff,{bloom:1,view:dg('view').selectedIndex,finalRender:1})) {
			if (i < 50 && p.nodeCount < 20000) {
				setTimeout("upd()",Math.max(1,timeStep-(unixTS()-lastRender)));
				lastRender = unixTS();
			} else {
				setTimeout("startIt()","20000");
				
			}
		}
		if (!noGrow) { i++; }
	} 
}

function continueRender() {
	var canvas = document.getElementById('canvas'+(i&1));
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		if (!p.drawPlant(ctx,xoff,yoff,{bloom:1,view:dg('view').selectedIndex,finalRender:1,timeStep:0.05})) {
			setTimeout("continueRender()",50);
		}
	}
}

function savePlant(p) {
	if (p == null) return;
	p.view = 2;
	var b = p.getBounds();

	if (document.getElementById('tmpcanvas')) {
		var tmp = document.getElementById('tmpcanvas');
		document.body.removeChild(tmp);
		delete tmp;
	};
	
	var tmp = dg("tmpcanvas",document.body,"canvas",{
		width:b.w,
		height:b.h,
		style:{
			width:b.w+"px",
			height:b.h+"px",
			display:"none"
		}
	});
			
	if (tmp.getContext) {
		var ctx = tmp.getContext('2d');
		p.drawPlant(ctx,0-b.x1,0-b.y1,{bloom:1,view:2,finalRender:1});
					
		var sri = new serverRequestInterface(this,"r.php");
		sri.request("save_plant",{dna:p.DNA.data,img:tmp.toDataURL()},function(response,v,ob){
			var d = dg('d-'+ob.dataRaw.dna,dg('saved'),"div",{
				style:{
					width:"133px",
					height:"216px",
					cssFloat:"left",
					position:"relative",
					cursor:"pointer"
				}
			});
			var img = dg(ob.dataRaw.dna,d,"img",{
				src:response.responseText,
				style:{
					maxWidth:"133px",
					maxHeight:"200px",
					position:"absolute",
					bottom:"16px"
				},
				onmousedown:function(e) {
					stopEvent(e)
					breedStart = this.id;				
					return false;
				},
				onmouseup:function(e) {
					stopEvent(e);
					if (breedStart && breedStart == this.id) {
						startIt(this.id);
					} else {
						startIt(crossBreed(breedStart,this.id));
					}
					return false;
				}
			});
			
			var dna = dg("",d,"input",{
				style:{
					width:"133px",
					fontSize:"10px",
					fontFamily:"Courier, monospace",
					position:"absolute",
					bottom:"0px",
					zIndex:3
				},
				value:ob.dataRaw.dna,
				type:"text"
			});
			
			
		});
	}
};

</script>
</body>
</html>

