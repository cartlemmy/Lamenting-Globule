<?php

$path = realpath("data/".$data["folder"]."/");
$parentPath = explode("/","data/".$data["folder"]); array_pop($parentPath);
$parentPath = realpath(implode("/",$parentPath)."/");

if (!$path && $parentPath && $data["createIfMissing"]) {
	mkdir("data/".$data["folder"]);
	$path = realpath("data/".$data["folder"]."/");
}

$topFolder = $path == realpath("data");

if ($path) {
	$out = getTree($path);
} else {
	$out = false;
}

function getTree($path) {
	global $topFolder;
	if ($dp = opendir($path)) {
		while ($file = readdir($dp)) {
			if ($file == ".") {
				//do nothing
			} else if (!($file == ".." && $topFolder)) {
				$out[] = array(
					"t"=>is_dir($path."/".$file) ? "collection" : "item",
					"data"=>array(
						"path"=>array(($file == ".." ? ".." : lgPath($path."/".$file)),"s"),
						"type"=>array((is_dir($path."/".$file) ? "folder" : "file"),"s"),
						"modified"=>array(filemtime($path."/".$file),"ts"),
						"size"=>array(filesize($path."/".$file),"bytes"),
						"mime"=>array(getmime($path."/".$file),"mime")
					)
				);
				if (is_dir($path."/".$file) && $file != "..") {
					$out[count($out)-1]["data"]["collection"] = array(getTree($path."/".$file),"collection");
				}
			}
		}
		closedir($dp);
		return $out;
	}
}

function lgPath($path) {
	return str_replace(realpath("data")."/","",realpath($path));
}

function getmime($path) {
	$finfo = finfo_open(FILEINFO_MIME, "/usr/share/misc/magic"); // return mime type ala mimetype extension

	if ($finfo) {
		$rv = finfo_file($finfo, $path);
		finfo_close($finfo);
		return $rv;
	}
	return null;
}
?>
