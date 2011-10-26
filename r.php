<?php

$data = unserialize(stripslashes($_POST["v"]));

switch($_GET["action"]) {
	case "ratings":
	$dna_rating = unserialize(file_get_contents("dna_rating.dat"));
	echo "<style>\ntd { padding:4px 8px 4px 8px; }s</style><table>";
	while (list($n,$v) = each($dna_rating["dnaBits"])) {
		if ($n == 0) {
			echo "<tr><td>BIT</td>";
			while (list($n2,$v2) = each($v)) {
				echo "<td>$n2</td>";
			}
			echo "</tr>";
			reset($v);
		}
		echo "<tr><td>$n</td>";
		while (list($n2,$v2) = each($v)) {
			echo "<td>".$v2."</td>";
		}
		echo "</tr>";
	}
	echo "</table>";	 
	break;
	
	case "ratings-data":
	echo json_encode(unserialize(file_get_contents("dna_rating.dat")));
	
	break;
	
	case "rate_plant":
	$dna_rating = unserialize(file_get_contents("dna_rating.dat"));
	if (!is_array($dna_rating)) $dna_rating = array("ratings"=>0,"dnaBits"=>array());
	$bit = 0;
	for ($i = 0; $i < strlen($data["dna"]); $i++) {
		for ($j = 3; $j >= 0; $j --) {
			if (hexdec($data["dna"]{$i}) & pow(2,$j)) {
				//bit is set
				while (list($n,$v) = each($data["rate"])) {
					$dna_rating["dnaBits"][$bit][$n] += (int)$v;
				}
				reset($data["rate"]);
			}
			$bit++;
		}
	}		
	$dna_rating["ratings"]++;
	ksort($dna_rating["dnaBits"]);
	file_put_contents("dna_rating.dat",serialize($dna_rating));
	break;
	
	case "get_plant":
	$dir = "tmp/".preg_replace("/[^A-Za-z0-9\-]+/" ,"", $data["dna"]);
	$base_data_file = $dir."/base_data.obj";
	$base_data = is_file($base_data_file) ? unserialize(file_get_contents($base_data_file)) : array();
	
	//echo "l0-70.png";
	//print_r($data);
	$im = $base_data["l0-".$data["size"]];
	$imShadow = $base_data["sh-l0-".$data["size"]];
	echo json_encode(array(
		"xBase"=>$im["x"],
		"yBase"=>$im["y"],
		"s"=>$im["s"],
		"shadow"=>array(
			"xBase"=>$imShadow["x"],
			"yBase"=>$imShadow["y"],
			"s"=>$imShadow["s"]
		)
	));
	break;
	
	case "save_plant":

	list($img,$imgdata) = explode(",",$data["img"],2);

	$dir = "tmp/".preg_replace("/[^A-Za-z0-9\-]+/" ,"", $data["dna"]);
	if (!is_dir($dir)) { mkdir($dir); }
	$opt = preg_replace("/[^A-Za-z0-9\-]+/" ,"", $data["opt"]);
	$file = $dir."/".(strlen($opt)?$opt:"i").".png";
	file_put_contents($file, base64_decode(str_replace(" ","+",$imgdata)));
	
	$base_data_file = $dir."/base_data.obj";
	$base_data = is_file($base_data_file) ? unserialize(file_get_contents($base_data_file)) : array();
	
	$base_data[(strlen($opt)?$opt:"i")] = array("x"=>$data["x"],"y"=>$data["y"],"s"=>$data["scale"]);
	
	file_put_contents($base_data_file,serialize($base_data));
	
	if (!$data["shadow"]) {
		$im = imagecreatefrompng($file);
		imagetruecolortopalette ($im, false, 255);
		imagecolortransparent($im, 0); 
		imagepng($im, $file);
		imagedestroy($im);
	}

	echo $file;
	break;
}

?>
