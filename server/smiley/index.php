<?php
	header('Access-Control-Allow-Origin: *');

	include_once dirname(__FILE__).'/database/smileydb.php.inc';

	$smileyDB = new SmileyDB();
	
	if (!isset($_POST["action"])) return;
	$action = $_POST["action"];
	switch ($action) {
		case "login":
			if (!isset($_POST["macid"])) {
				break;
			}
			$macid = $_POST["macid"];
		
			$smileyDB->login($macid);
			break;
		case "register":
			if (!isset($_POST["contact"]) ||
				!isset($_POST["mail"]) ||
				!isset($_POST["magafd"]) ||
				!isset($_POST["forvalt"]) ||
				!isset($_POST["place"]) ||
				!isset($_POST["name"])) {
				break;
			}
			$contact = $_POST["contact"];
			$mail    = $_POST["mail"];
			$magafd  = $_POST["magafd"];
			$forvalt = $_POST["forvalt"];
			$place   = $_POST["place"];
			$name    = $_POST["name"];

			$smileyDB->register($contact, $mail, $magafd, $forvalt, $place, $name);		
			break;
		case "result":
			if (!isset($_POST["macid"]) ||
				!isset($_POST["datetime"]) ||
				!isset($_POST["smiley"]) ||
				!isset($_POST["what"])) {
				break;
			}
			$macid    = $_POST["macid"];
			$datetime = $_POST["datetime"];
			$smiley   = $_POST["smiley"];
			$what     = $_POST["what"];
		
			$smileyDB->insertResult($macid, $datetime, $smiley, $what);
			break;
		default:
			break;
	}
?>