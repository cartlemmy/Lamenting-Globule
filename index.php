<?php

$q = $_SERVER["QUERY_STRING"];

$docfile = "documentation/".($q?$q:"manual").".lgml";

if (!is_file($docfile)) $docfile = "documentation/404.lgml";
if (substr($_GET["viewsource"],0,8) == "example-") {
	$viewsource = $_GET["viewsource"];
}

?><html>
<head>
<title><?=$page_title;?></title>
<script type="text/javascript" src="js/base64.js"></script>
<script type="text/javascript" src="js/general.source.js"></script>
<script type="text/javascript" src="js/gui.source.js"></script>
<script type="text/javascript" src="js/geshi.source.js"></script>
<link href="lg.css" rel="stylesheet" type="text/css" />
</head>
<style>
body {
	background-color:#DDDDDD;
}
</style>
<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
<div class="mlc"><a href="http://www.yibbleware.com/" class="ml">Yibbleware Home</a> &nbsp;&nbsp;&nbsp; <?php if ($q) { ?><a href="?"  class="ml">CONTENTS</a><img style="float:right;height:61px;" src="images/lamenting-globule-logo.png"><?php } ?></div>
<div id="c" class="mlc"></div>
<script type="text/javascript">

var gui = null;
var geshi = null;

window.onload = function() {
	
	gui = new lgGUI();
	
	gui.parseLayoutFromSource(dg('c'),<?=json_encode(
		$viewsource ? 
		"==".$viewsource."==\n[code lang=php]".file_get_contents($viewsource)."[/code]" :
		file_get_contents($docfile));?>
	);
	
};


</script>
</body></html>
