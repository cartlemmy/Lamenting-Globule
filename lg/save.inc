<?php

$path = explode("/",$data["file"]);
$file = array_pop($path);
list($file,) = explode(".",$file);
$path = realpath("data/".implode("/",$path))."/".$file.".obj";

if (file_put_contents($path,json_encode($data["data"]))) {
	$out["success"] = 1;
}



?>
