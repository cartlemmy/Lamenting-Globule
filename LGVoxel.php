<html>
<head>
<script type="text/javascript" src="js/base64.js"></script>
<script type="text/javascript" src="js/general.source.js"></script>
<script type="text/javascript" src="js/color.source.js"></script>
<script type="text/javascript" src="js/inputInterface.source.js"></script>
<script type="text/javascript" src="js/gui.source.js"></script>
<script type="text/javascript" src="js/data.source.js"></script>
<script type="text/javascript" src="js/file.source.js"></script>
<script type="text/javascript" src="js/model.source.js"></script>
<script type="text/javascript" src="js/model.edit.source.js"></script>
<link href="lg.css" rel="stylesheet" type="text/css" />
<script type="text/javascript">

var editor = null;

window.onload = function() {
	editor = new lgModelEdit({
		ctx:document.getElementById('canvas').getContext('2d'),
		consoleElement:dg('console'),
		statusElement:dg('status'),
		palette:"palettes/NES_NTSC.png"
	});
	setCanvasSize();
};

window.onresize = function() {
	setCanvasSize();
};

function setCanvasSize() {
	var c = document.getElementById('canvas');
	c.style.width = (c.width = window.innerWidth) + "px";
	c.style.height = (c.height = window.innerHeight - dg('console').offsetHeight - dg('statusCont').offsetHeight - 2) + "px";
	
	editor.redraw();
};

setInterval("upd()", 100);

var angle = 0;
function upd() {
	
}

var curFrame = 0;

function rotateIt() {	
	editor.anim[curFrame].style.display = "none";
	editor.anim[(curFrame + 1) % editor.anim.length].style.display = "block";
	curFrame ++;
	curFrame = curFrame % editor.anim.length;
}

</script>
</head>
<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
<canvas id="canvas" width="600" height="400" style="width:600px;height:400px;display:block;">Canvas not supported</canvas>
<textarea id="console" style="font-weight:bold;width:100%;height:100px;display:block;border:none;background-color:transparent;color:#000000;"></textarea>
<div id="statusCont" style="font-family:monospace;width:100%;height:24px;font-size:12px;overflow:hidden;display:block;background-color:transparent;color:#000000;"><pre style="margin:2px"><div id="status"></div></pre></div>
</body></html>
