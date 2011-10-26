<?php

$data = unserialize(stripslashes($_POST["v"]));
$out = array();

$include_file = realpath("lg/".$_GET["action"].".inc");

ob_start();

if ($include_file) {
	include($include_file);
} else {
	$out["error"] = "The action '".$_GET["action"]."' could not be found.";
}
if (!$out_raw) {
	if (($c = ob_get_clean()) && !count($out)) {
		$out["content"] = $c;
	}

	echo json_encode($out);
}
?>
