<?php

$path = explode("/",$data["file"]);
$file = array_pop($path);
list($file,) = explode(".",$file);
$path = realpath("data/".implode("/",$path))."/".$file.".obj";
$out_raw = true;

echo file_get_contents($path);


?>
