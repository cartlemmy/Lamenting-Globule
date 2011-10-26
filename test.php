<html>
<head>
<title>ProComm.com - [title]</title>
<script type="text/javascript" src="js/general.js"></script>
<script type="text/javascript" src="js/vectimage.source.js"></script>

<script type="text/javascript">
 
var c = null;

var data = {
	"name":"tab",
	"width":200,
	"height":200,
	"imgType":"png",
	"layers":[
		[
			{"t":"img","x":0,"y":0,"w":"=this.width","h":"=this.height","src":"http://localhost/proComm/images/bg-img-home.png"},
			{"t":"filter","c":"hsl","f":"s*=0.1;l=l*0.1+0.9;"}
		]
	]
};

window.onload = function() {
	c = new lgVectimage({
		ctx:document.getElementById('canvas').getContext('2d'),
		data:data
	});
	
	c.setData(data);
	c.render();
};

</script>

</head>
<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">

<div style="position:absolute;left:50%;">
<div class="page_cont">
<div style="width:800px;height:36px"></div>
<!--lgVect-->
<canvas id="canvas" width="200" height="200" style="width:200px;height:200px;display:block;position:relative;left:100px;top:100px;">Canvas not supported</canvas>
<!--END:lgVect-->
</div></div>
</body></html>
