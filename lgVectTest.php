<html>
<head>
<script type="text/javascript" src="js/general.js"></script>
<script type="text/javascript" src="js/vectimage.js"></script>
</head>
<style>
.head {
	font-size:150%;
}
.cont {
	border:1px solid #CCCCCC;
	padding:8px;
}
</style>
<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
<canvas id="canvas" width="400" height="200" style="width:400px;height:200px;display:block;border:1px solid #000000;">Canvas not supported</canvas>
<div id="c"></div>
<script type="text/javascript">

 
var c = null;

/*
var data = {
	layers:[
		[
			{t:"img",x:0,y:0,w:"=this.width",h:"=this.height",src:"http://localhost/lamenting-globule/images/lamenting-globule-logo.png"}
		],
		[
			{t:"rect",x:0,y:0,w:24,h:24,fs:"#0000FF",s:"fill"},
			{t:"rect",x:0,y:0,w:12,h:12,fs:"#FF0000",s:"fill"},
			{t:"rect",x:12,y:12,w:36,h:36,ss:"#FF00FF",s:"stroke"},
			{t:"arc",x:50,y:40,r:10,a1:0,a2:3.14,fs:"#00FFFF",ss:"#000000",s:"stroke,fill",lw:4},
			{t:"circle",x:120,y:40,r:20,fs:"#00FFFF",ss:"#000000",s:"stroke,fill"},
			{t:"circle",x:120,y:40,r:10,s:"clear"},
			{t:"multi",lj:"round",x:120,y:120,fs:"#FF9900",ss:"#000000",s:"stroke,fill",lw:6,
				p:[
					{x:36,y:48},
					{t:"quad",x:-12,y:22,cx:0,cy:10},
					{t:"bez",x:-12,y:48,cx1:-14,cy1:-14,cx2:0,cy2:0}
				]
			},
			{t:"text",a:0,x:10,y:100,tf:"bold 24px sans-serif",ta:"left",tb:"top",text:"Testing the text",s:"stroke,fill",lw:0.75,ss:"#330000",fs:"#FFFF00"},
			{t:"children",c:[
				{t:"rect",x:0,y:60,w:30,h:30,fs:{
					x1:0,y1:0,x2:30,y2:0,stops:[
						[0,"#FF0000"],[0.25,"#FFFF00"],[0.5,"#00FF00"],[0.75,"#00FFFF"],[1,"#0000FF"]
					]
				},s:"fill"}
			]}
		]
	]
};
*/

var data = {
	"layers":[
		[
			{t:"children",

				"x":"=12",
				"y":"=12",
				"w":"=parent.w - 24",
				"h":"=parent.h - 24",
				"src":"http://localhost/lamenting-globule/images/lamenting-globule-logo.png",
				c:[
					{"t":"text","a":0,"x":"=(parent.w - this.width) / 2","y":0,"tf":"=lgvi.fontStyle(parent.w,'bold','sans-serif','Testing the text')","ta":"left","tb":"top","text":"Testing the text",s:"stroke,fill",lw:"1",ss:"#FFFFFF",fs:"#000000"}
				]
			},
			{"t":"img","x":"=10+lgvi.fit(380,180).x","y":"=10+lgvi.fit(380,180).y","w":"=lgvi.fit(380,180).w","h":"=lgvi.fit(380,180).h","src":"http://www.gerardribas.com/wp-content/uploads/2011/04/desktop-computer2.png"}
		]
	]
};
	
window.onload = function() {
	c = new lgVectimage({
		ctx:document.getElementById('canvas').getContext('2d'),
		data:data
	});
	
	//setInterval("go()",10);
	go();
};

function go() {
	/*for (var i = 1; i < data.layers[0].length; i++) {
		if (data.layers[0][i].a == undefined) data.layers[0][i].a = 0;
		if (data.layers[0][i].z == undefined) data.layers[0][i].z = 1;
		data.layers[0][i].a += (Math.sin(unixTS(true)+i)) * ((unixTS(true) + i * 20) % 100) / 100;
		//data.layers[0][i].z += Math.random() - 0.5;
	}*/
	c.setData(data);
	c.render();
};


</script>
</body></html>
