<?php
	header('Access-Control-Allow-Origin: *');
	
	include_once dirname(__FILE__).'/database/smileydb.php';

	$smileyDB = new SmileyDB();
	
	// Cron: Weekly mails
	if (isset($_SERVER['argv'])) {
		if (isset($_SERVER['argv'][1])) {
			if ($_SERVER['argv'][1] == "weeklyMails") {
				// Only allow cli
				if (php_sapi_name() == 'cli') {   
					$smileyDB->sendWeeklyMails();
					return;
				}
			}
		}
	}
	
	$action = "";
	if (isset($_POST["action"])) {
		$action = $_POST["action"];
	} else if (isset($_GET["action"])) {
		$action = $_GET["action"];
	}
	
	if ($action == "") {
		return;
	}
	
	switch ($action) {
		case "login":
			if (!isset($_POST["macid"])) {
				return;
			}
			
			$macid = $_POST["macid"];
		
			if ($macid == "") {
				return;
			}
		
			$smileyDB->login($macid);
			break;
		case "register":
			if (!isset($_POST["contact"]) ||
				!isset($_POST["mail"]) ||
				!isset($_POST["magafd"]) ||
				!isset($_POST["forvalt"]) ||
				!isset($_POST["place"]) ||
				!isset($_POST["name"])) {
				return;
			}
			
			$contact = $_POST["contact"];
			$mail    = $_POST["mail"];
			$magafd  = $_POST["magafd"];
			$forvalt = $_POST["forvalt"];
			$place   = $_POST["place"];
			$name    = $_POST["name"];

			if ($contact == "" ||
				$mail    == "" ||
				$magafd  == "" ||
				$forvalt == "" ||
				$place   == "" ||
				$name    == "") {
				return;
			}
			
			$smileyDB->register($contact, $mail, $magafd, $forvalt, $place, $name);		
			break;
		case "result":
			if (!isset($_POST["macid"]) ||
				!isset($_POST["datetime"]) ||
				!isset($_POST["smiley"]) ||
				!isset($_POST["what"])) {
				return;
			}
			
			$macid    = $_POST["macid"];
			$datetime = $_POST["datetime"];
			$smiley   = $_POST["smiley"];
			$what     = $_POST["what"];
			
			if ($macid == "" ||
				$datetime == "" ||
				$smiley == "" ||
				$what == "") {
				return;
			}
	
			$smileyDB->insertResult($macid, $datetime, $smiley, $what);
			break;
		case "dataPerDay":
			if (!isset($_GET["macid"])) {
				return;
			}

			$macid = $_GET["macid"];

			if ($macid == "") {
				return;
			}
		
			$smileyDB->getDataPerDay($macid);
			break;
		case "dataWhat":
			if (!isset($_GET["macid"]) ||
				!isset($_GET["today"])) {
				return;
			}

			$macid = $_GET["macid"];
			$today = $_GET["today"];

			if ($macid == "" || $today == "") {
				return;
			}
		
			$smileyDB->getWhatThisWeekComparePreviously($macid, $today);
			break;
		default:
			break;
	}
?>