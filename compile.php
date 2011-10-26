<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"><head>
<script type="text/javascript" src="jscompressor/jscompressor_files/my.js"></script>
<script src="jscompressor/jscompressor_files/base2-load.js" type="text/javascript"></script>
<script src="jscompressor/jscompressor_files/Packer.js" type="text/javascript"></script>
<script src="jscompressor/jscompressor_files/Words.js" type="text/javascript"></script>
<script src="jscompressor/jscompressor_files/bindings.js" type="text/javascript"></script>
<script type="text/javascript">
function submitted() {
	setTimeout("document.getElementById('aspnetForm').submit();",100);
}

<?php if (isset($_POST["n"])) { ?>
setTimeout("document.getElementById('pack-script').click();",100);
<?php } ?>

</script>
<body id="packer">
<form name="aspnetForm" method="post" action="compile.php" id="aspnetForm">
<?php

$version = "0.0";

$ve = explode(".",$version);
$va = array(
	array("Apathetic","Bewailing","Cryin'","Dangerous"),
	array("Amoeba","Blob","Cow","Drip")
);

$from = array(	"[version]",											"[copyright-date]");
$to = array(	$version." (".$va[0][$ve[0]]." ".$va[1][$ve[1]].")",	"2011".(date("Y")!="2011"?"-".date("Y"):""));

$thisNum = (int)$_POST["n"];

if ($dp = opendir("js")) {
	while ($file = readdir($dp)) {
		$base = explode(".",$file);
		$ext = array_pop($base);
		if (array_pop($base) == "source") {
			if ($thisNum == $num) {
				$base = join(".", $base);
				$source_file = "js/".$file;
				$out_file = "js/".$base.".".$ext;
				$code_file = "js/".$base.".".$ext;
				
				list($header,$code) = explode("//!CODE\n",str_replace($from,$to,file_get_contents($source_file)),2);
				
				if ($_POST["output"]) {
					$out = $header."\n".stripslashes($_POST["output"]);
					file_put_contents($out_file,$out);
					unset($_POST["output"]);
					$thisNum ++;
				} else {
					echo "<pre>".$header."</pre>";
					?><input type="hidden" name="n" value="<?=$thisNum;?>">
					<textarea spellcheck="false" id="input" name="input" rows="12" cols="120"><?=htmlspecialchars($code);?></textarea><br />
					<textarea spellcheck="false" id="output" name="output" rows="12" cols="110" readonly="readonly"></textarea><br />
					<label for="base62">Base62 encode
		<input id="base62" name="base62" value="1" type="checkbox"></label>
		<label for="shrink">Shrink variables
		<input id="shrink" name="shrink" value="1" type="checkbox" CHECKED></label><br />
					<button type="button" id="pack-script" onclick="submitted();">Compress</button>
					Algorithm author: <a href="http://dean.edwards.name/packer/">Dean Edwards</a><?php
					$break = true;
					break;
				}
				
			}
			$num++;
		}		
	}
	closedir($dp);
}

if (!$break) {
	//Cleanup stuff here
}

?></form></body></html>
