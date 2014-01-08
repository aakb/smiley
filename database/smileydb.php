<?php

header('Content-Type: text/json; charset=utf-8');

include_once dirname(__FILE__) . '/../config/conf.php';
include_once dirname(__FILE__).'/pdo_mysql.php';

/**
 * Class SmileyDB
 * Handles all interaction with smiley database
 */
class SmileyDB {
	// Construct and Destruct
	public function __construct() {
		$this->connection = PDOMysql::getInstance();
	}
	public function __destruct() {
		$this->connection = null;
	}

    // Confirms that machine has been registered
	public function login($macid) {
		$statement = 'SELECT * FROM machine WHERE macid = :macid';
		$query = $this->connection->execute($statement, array('macid' => $macid));
	
		$count = $query->rowCount();
		if ($count == 1) {		// machine exists
			$result = array('result'=>'ok');
			echo json_encode($result);
			return;
		} else {
			$result = array('result'=>'error', 'msg'=>'error_wrong_id');
			echo json_encode($result);
			return;
		}
	}

    // Register a new machine
	public function register($contact, $mail, $magafd, $forvalt, $place, $name) {
		// machine already exist?
		$statement = 'SELECT * FROM machine WHERE contact = :contact AND mail = :mail AND magafd = :magafd AND forvalt = :forvalt AND place = :place AND name = :name';
		$query = $this->connection->execute($statement, array(	'contact' 	=> $contact,
																'mail' 		=> $mail,
																'magafd' 	=> $magafd,
																'forvalt' 	=> $forvalt,
																'place' 	=> $place,
																'name' 		=> $name));
		$count = $query->rowCount();
		if ($count > 0) {		// machine already exists
			$result = array('result'=>'error', 'msg'=>'error_machine_already_exists');
			echo json_encode($result);
			return;
		}
	
		// make macid: first letter of "contant", "magafd", "forvalt", "place", "name" and next id
		$macid = mb_substr($contact, 0, 1, "utf-8") . mb_substr($magafd, 0, 1, "utf-8") . mb_substr($forvalt, 0, 1, "utf-8") . mb_substr($place, 0, 1, "utf-8") . mb_substr($name, 0, 1, "utf-8");
		$statement = "SELECT * FROM machine ORDER BY id DESC LIMIT 1";
		$query = $this->connection->execute($statement);
		$id = 1;
		if ($query->rowCount() > 0) {
			$row = $query->fetch();
			$id = $row["id"] + 1;
		}
		$macid = $macid . $id;
		$macid = mb_ereg_replace("Ø","OE",$macid);
		$macid = mb_ereg_replace("ø","oe",$macid);
		$macid = mb_ereg_replace("Å","AA",$macid);
		$macid = mb_ereg_replace("å","aa",$macid);
		$macid = mb_ereg_replace("Æ","AE",$macid);
		$macid = mb_ereg_replace("æ","ae",$macid);

		// insert new machine
		$statement = 'INSERT INTO machine (macid, contact, mail, magafd, forvalt, place, name) VALUES (:macid, :contact, :mail, :magafd, :forvalt, :place, :name)';
		$query = $this->connection->execute($statement, array(	'macid' 	=> $macid,
																'contact' 	=> $contact, 
																'mail' 		=> $mail, 
																'magafd' 	=> $magafd, 
																'forvalt' 	=> $forvalt, 
																'place' 	=> $place, 
																'name' 		=> $name));
		
		// Send mail to contact
		$to  = $mail; 
		$subject = 'b7 oprettelse';
		$message = '
		<html>
		<head>
		  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		  <title>b7 oprettelse</title>
		</head>
		<body>
		  <h2>Følgende maskine er blevet oprettet:</h2>
		  <em>Login</em>: '.$macid.'<br/>
		  <em>Magistratsafdeling</em>: '.$magafd.'<br/>
		  <em>Forvaltning</em>: '.$forvalt.'<br/>
		  <em>Fysisk placering</em>: '.$place.'<br/>
		  <em>Navn på enhed</em>: '.$name.'<br/>
		  <h2>Statistik</h2>
		  Statistikken for den pågældende maskine er tilgængelig fra følgende link:<br/>
		  <a href="http://smiley.aakb.dk/stats/?macid='.$macid.'">http://smiley.aakb.dk/stats/?macid='.$macid.'</a><br/>
		  <br/>
		  Der vil fremover blive sent en ugentlig mail (hver mandag) med et link til den foregående uges statistik.
		</body>
		</html>
		';
		$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
		$headers .= 'From: b7' . "\r\n";		
		mail($to, $subject, $message, $headers);
		
		// return macid
		$result = array('result'=>'ok', 'macid'=>$macid);
		echo json_encode($result);	
	}

    // Inserts the result in db
	public function insertResult($macid, $datetime, $smiley, $what) {
		// test for valid macid
		$statement = 'SELECT * FROM machine WHERE macid = :macid';
		$query = $this->connection->execute($statement, array('macid' => $macid));
		if ($query->rowCount() != 1) {		// machine does not exist
			$result = array('result'=>'error', 'msg'=>'error_machine_already_exists');
			echo json_encode($result);
			return;
		}
		
		// insert new result into db
		$statement = 'INSERT INTO data (macid, datetime, smiley, what) VALUES (:macid, :datetime, :smiley, :what)';
		$query = $this->connection->execute($statement, array(	'macid'  	=> $macid,
																'datetime' 	=> $datetime,
																'smiley' 	=> $smiley,
																'what'   	=> $what));
																
		$result = array('result'=>'ok');
		echo json_encode($result);															
	}

    // Returns all data for $macid grouped by day
	public function getDataPerDay($macid) {
		$statement = 'SELECT avg(smiley) as AvgSmiley, DATE(FROM_UNIXTIME(datetime/1000, "%Y-%m-%d")) as Date FROM data WHERE macid = :macid GROUP BY Date';
		
		$query = $this->connection->execute($statement, array('macid' => $macid));
		
		$rows = $query->fetchAll(PDO::FETCH_ASSOC);
		echo json_encode($rows);
	}

    // Returns data for $macid from the period from $start to $end
    // Not necessarily optimal with 15 queries into db
    private function getWhat($macid, $start, $end) {
		$arr = array();

		for ($k = 1; $k <= 3; $k++) {
			$insidearr = array();
			// Reverse order to get happy smiley first
			for ($i = 5; $i >= 1; $i--) {
				$statement = 'SELECT count(smiley) NumberSmiley FROM data WHERE macid = :macid AND datetime >= :start AND datetime <= :end AND smiley = :smiley AND what = :what';
				$query = $this->connection->execute($statement, array(	'macid' => $macid,
																		'start' => $start,
																		'end'	=> $end,
																		'smiley' => $i,
																		'what'   => $k));
						
				$rows = $query->fetch(PDO::FETCH_ASSOC);
				array_push($insidearr, 0+$rows["NumberSmiley"]);
			}
			array_push($arr, $insidearr);
		}
		
		return $arr;
	}

    // Returns data for $macid from period from one week ago until $today
	public function getWhatThisWeek($macid, $today) {
		$aDay = 1000 * 60 * 60 * 24;
		$oneWeekAgo = $today -  $aDay * 7;
		
		$thisWeek = $this->getWhat($macid, $oneWeekAgo, $today);
		
		echo json_encode($thisWeek);
	}

    // Returns data from the beginning of time (January 1, 1970) until $end
	public function getWhatPast($macid, $end) {
		$past = $this->getWhat($macid, 0, $end);
		
		echo json_encode($past);
	}

    // Send a mail to each registered machine with a link to the statistics from last week
	// Invoke this each monday to send mails about results from last week
	public function sendWeeklyMails() {
		$week = 0 + date("W");
		$year = 0 + date("Y");

		// Count one week back
		$week = $week - 1;
		if ($week < 1) {
			$week = 52;
			$year = $year - 1;
		}
		
		$statement = 'SELECT * FROM machine';
		$query = $this->connection->execute($statement);
	
		$rows = $query->fetchAll(PDO::FETCH_ASSOC);
		foreach ($rows as $row) {
			// Send mail to contact
			$to  = $row["mail"]; 
			$subject = 'b7 statistik uge '.$week.', '.$year;
			$message = '
			<html>
			<head>
			    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
			    <title>b7 ugentlig statistik for uge '.$week.'('.$year.')</title>
			</head>
			<body>
			    <div>
                    <h2>Statistik for uge '.$week.' ('.$year.')</h2>
                    <a href="http://smiley.aakb.dk/stats/?macid='.$row["macid"].'&week='.$week.'&year='.$year.'">http://smiley.aakb.dk/stats/?macid='.$row["macid"].'&week='.$week.'&year='.$year.'</a>
                    <h2>For følgende maskine</h2>
                    <em>Magistratsafdeling</em>: '.$row["magafd"].'<br/>
                    <em>Forvaltning</em>: '.$row["forvalt"].'<br/>
                    <em>Fysisk placering</em>: '.$row["place"].'<br/>
                    <em>Navn på enhed</em>: '.$row["name"].'<br/>
			    </div>
			</body>
			</html>
			';
			$headers  = 'MIME-Version: 1.0' . "\r\n";
			$headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";
			$headers .= 'From: b7' . "\r\n";		
			mail($to, $subject, $message, $headers);
		}
	}

    // Returns an XML document of the data
    public function getXMLData() {
        date_default_timezone_set('Europe/Copenhagen');

        // Get data from database
        $statement = 'SELECT * FROM machine';
        $query = $this->connection->execute($statement);
        $machines = $query->fetchAll(PDO::FETCH_ASSOC);

        // Create XML document
        $xml = new DOMDocument("1.0");
        $root = $xml->createElement("machines");
        $xml->appendChild($root);

        foreach ($machines as $machine) {
            if (isset($machine["test"]) && $machine["test"]) {
                continue;
            }
            $entry = $xml->createElement("machine");
            $entry->setAttribute("magafd", $machine["magafd"]);
            $entry->setAttribute("forvalt", $machine["forvalt"]);
            $entry->setAttribute("place", $machine["place"]);
            $entry->setAttribute("name", $machine["name"]);

            $root->appendChild($entry);

            $statement = 'SELECT * FROM data WHERE macid = :macid';
            $query = $this->connection->execute($statement, array('macid' => $machine["macid"]));
            $dataForMachine = $query->fetchAll(PDO::FETCH_ASSOC);

            foreach ($dataForMachine as $data) {
                $dataEntry = $xml->createElement("data");
                $dataEntry->setAttribute("timestamp", date("c", $data["datetime"] / 1000));
                $dataEntry->setAttribute("smiley", $data["smiley"]);
                $dataEntry->setAttribute("what", $data["what"]);

                $entry->appendChild($dataEntry);
            }
        }

        header('Content-type: application/xml');
        echo $xml->saveXML();
    }
}

?>