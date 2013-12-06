<?php
	header('Access-Control-Allow-Origin: *');

	include_once dirname(__FILE__).'/utils/utils.php.inc';
	include_once dirname(__FILE__).'/database/smiley.php.inc';
	
	$action = Utils::getParam("action");
	$smiley = new Smiley();
	
	switch ($action) {
    case "login":
		$id = Utils::getParam("id");
	
		$smiley->login($id);
        break;
    case "register":
		$contact = Utils::getParam("contact");
		$mail    = Utils::getParam("mail");
		$magafd  = Utils::getParam("magafd");
		$forvalt = Utils::getParam("forvalt");
		$place   = Utils::getParam("place");
		$name    = Utils::getParam("name");

		$smiley->register($contact, $mail, $magafd, $forvalt, $place, $name);		
		break;
	case "result":
		$id     = Utils::getParam("id");
		$smiley = Utils::getParam("smiley");
		$what   = Utils::getParam("what");
		$date   = Utils::getParam("date");
	
		$smiley->result($id, $date, $smiley, $what);
        break;
	}
?>