<html>
<head>
<script type="text/javascript" src="js/base64.js"></script>
<script type="text/javascript" src="js/general.source.js"></script>
<script type="text/javascript" src="js/data.source.js"></script>
<script type="text/javascript" src="js/file.source.js"></script>
<script type="text/javascript" src="js/gui.source.js"></script>
<link href="lg.css" rel="stylesheet" type="text/css" />
</head>
<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
<textarea id="debug" style="width:100%;height:100px;font-family:monospace"></textarea>
<div id="c"></div>
<script type="text/javascript">

var gui = null;

window.onload = function() {
	gui = new lgGUI();
	
	gui.createDialouge({
		t:"fileOpen",
		folder:"",
		clickToChoose:true,
		filter:{
			selectable:"file-ext:obj"
		},
		callback:function(o) {
			dg('debug').value = debugObject(o,"callback:function(o)",3);
			switch (o.action) {
				case "choose":
				this.gui.remove(this.handle);
				break;
			}
		}
	});
};


</script>
</body></html>
