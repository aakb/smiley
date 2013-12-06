<?php
	header('Access-Control-Allow-Origin: *');

	include_once dirname(__FILE__).'/utils/utils.php.inc';
	include_once dirname(__FILE__).'/database/smileydb.php.inc';
	
	$action = Utils::getParam("action");
	$smileyDB = new SmileyDB();
	
	switch ($action) {
		case "login":
			$macid = Utils::getParam("macid");
		
			$smileyDB->login($macid);
			break;
		case "register":
			$contact = Utils::getParam("contact");
			$mail    = Utils::getParam("mail");
			$magafd  = Utils::getParam("magafd");
			$forvalt = Utils::getParam("forvalt");
			$place   = Utils::getParam("place");
			$name    = Utils::getParam("name");

			$smileyDB->register($contact, $mail, $magafd, $forvalt, $place, $name);		
			break;
		case "result":
			$macid    = Utils::getParam("macid");
			$datetime = Utils::getParam("datetime");
			$smiley   = Utils::getParam("smiley");
			$what     = Utils::getParam("what");
		
			$smileyDB->insertResult($macid, $datetime, $smiley, $what);
			break;
		default:
			break;
	}
?>