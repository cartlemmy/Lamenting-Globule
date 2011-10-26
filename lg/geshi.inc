<?php

include("lg/geshi/geshi.php");

$geshi = new GeSHi($data["data"], $data["lang"], null);
$geshi->set_header_type(GESHI_HEADER_NONE);

$out["parsed"] = $geshi->parse_code();
if ($geshi->error()) { $out["error"] = $geshi->error(); }

?>
