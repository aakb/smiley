<?php

// Set the default content type to json.
header('Content-Type: text/json; charset=utf-8');

include_once dirname(__FILE__) . '/../config/conf.php';
include_once dirname(__FILE__).'/pdo_mysql.php';

/**
 * Handles all interaction with the smiley database
 */
class SmileyDB {

  /**
   * Constructor
   */
  public function __construct() {
		$this->connection = PDOMysql::getInstance();
	}

  /**
   * Destructor
   */
  public function __destruct() {
		$this->connection = null;
	}

  /**
   * Check that the machine has been registered. Outputs the result as json.
   * @param $macid id of the machine.
   */
  public function login($macid) {
    // Get machines with macid = $macid.
		$statement = 'SELECT * FROM machine WHERE macid = :macid';
		$query = $this->connection->execute($statement, array('macid' => $macid));

    // Count the number of hits. If one then success, else error.
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

  /**
   * Register a new machine with the given parameters. Outputs the macid as json.
   * @param $contact name of the contact.
   * @param $mail email of the contact.
   * @param $magafd magistratsafdelingen.
   * @param $forvalt forvaltningen.
   * @param $place placement of the machine.
   * @param $name device name.
   */
  public function register($contact, $mail, $magafd, $forvalt, $place, $name) {
		// Does the machine already exist in the database?
		$statement = 'SELECT * FROM machine WHERE contact = :contact AND mail = :mail AND magafd = :magafd AND forvalt = :forvalt AND place = :place AND name = :name';
		$query = $this->connection->execute($statement, array(	'contact' 	=> $contact,
																'mail' 		=> $mail,
																'magafd' 	=> $magafd,
																'forvalt' 	=> $forvalt,
																'place' 	=> $place,
																'name' 		=> $name));
		$count = $query->rowCount();
		if ($count > 0) {
		  // The machine already exists.
			$result = array('result'=>'error', 'msg'=>'error_machine_already_exists');
			echo json_encode($result);
			return;
		}
	
		// Make the macid from the first letter of "contant", "magafd", "forvalt", "place", "name" and next id in the machine table.
		$macid = mb_substr($contact, 0, 1, "utf-8") . mb_substr($magafd, 0, 1, "utf-8") . mb_substr($forvalt, 0, 1, "utf-8") . mb_substr($place, 0, 1, "utf-8") . mb_substr($name, 0, 1, "utf-8");
		$statement = "SELECT * FROM machine ORDER BY id DESC LIMIT 1";
		$query = $this->connection->execute($statement);
		$id = 1;
		if ($query->rowCount() > 0) {
			$row = $query->fetch();
			$id = $row["id"] + 1;
		}
		$macid = $macid . $id;

    // Replace the danish characters with english substitutes.
		$macid = mb_ereg_replace("Ø","OE",$macid);
		$macid = mb_ereg_replace("ø","oe",$macid);
		$macid = mb_ereg_replace("Å","AA",$macid);
		$macid = mb_ereg_replace("å","aa",$macid);
		$macid = mb_ereg_replace("Æ","AE",$macid);
		$macid = mb_ereg_replace("æ","ae",$macid);

		// Insert the new machine.
		$statement = 'INSERT INTO machine (macid, contact, mail, magafd, forvalt, place, name) VALUES (:macid, :contact, :mail, :magafd, :forvalt, :place, :name)';
		$query = $this->connection->execute($statement, array(	'macid' 	=> $macid,
																'contact' 	=> $contact, 
																'mail' 		=> $mail, 
																'magafd' 	=> $magafd, 
																'forvalt' 	=> $forvalt, 
																'place' 	=> $place, 
																'name' 		=> $name));
		
		// Send email to the contact.
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
		  <em>Login (macid)</em>: '.$macid.'<br/>
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
		
		// Return the macid to the client
		$result = array('result'=>'ok', 'macid'=>$macid);
		echo json_encode($result);	
	}

  /**
   * Insert a result in the database.
   * @param $macid id of the machine.
   * @param $datetime the client registered time of the result.
   * @param $smiley the selected smiley.
   * @param $what the reason for the smiley.
   */
  public function insertResult($macid, $datetime, $smiley, $what) {
		// Test for existing macid.
		$statement = 'SELECT * FROM machine WHERE macid = :macid';
		$query = $this->connection->execute($statement, array('macid' => $macid));
		if ($query->rowCount() != 1) {		// machine does not exist
			$result = array('result'=>'error', 'msg'=>'error_machine_already_exists');
			echo json_encode($result);
			return;
		}
		
		// Insert the new result into the database.
		$statement = 'INSERT INTO data (macid, datetime, smiley, what) VALUES (:macid, :datetime, :smiley, :what)';
		$query = $this->connection->execute($statement, array(	'macid'  	=> $macid,
																'datetime' 	=> $datetime,
																'smiley' 	=> $smiley,
																'what'   	=> $what));
																
		$result = array('result'=>'ok');
		echo json_encode($result);															
	}

  /**
   * Returns all data for $macid, grouped by day.
   * @param $macid the macid of the machine to get data for.
   */
  public function getDataPerDay($macid) {
		$statement = 'SELECT avg(smiley) as AvgSmiley, DATE(FROM_UNIXTIME(datetime/1000, "%Y-%m-%d")) as Date FROM data WHERE macid = :macid GROUP BY Date';
		
		$query = $this->connection->execute($statement, array('macid' => $macid));
		
		$rows = $query->fetchAll(PDO::FETCH_ASSOC);
		echo json_encode($rows);
	}

  /**
   * Return data for $macid from the period from $start to $end. The data is number of the different smileys (1-5) for each what (1-3).
   * @param $macid the macid of the machine to get data for.
   * @param $start the timestamp (milliseconds since Jan. 1, 1970) of the period start.
   * @param $end the timestamp (milliseconds since Jan. 1, 1970) of the period end.
   * @return array with the data for the period. Structure:  {what1(smiley5,smiley4,smiley3,smiley2,smiley1), what2(smiley5,smiley4,smiley3,smiley2,smiley1), what3(smiley5,smiley4,smiley3,smiley2,smiley1)}
   */
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

  /**
   * Outputs the data for $macid from the period of one week ago until $today.
   * @param $macid the id of the machine to get data for.
   * @param $today the latest timestamp (milliseconds since Jan. 1, 1970) to include in the result.
   */
  public function getWhatThisWeek($macid, $today) {
		$aDay = 1000 * 60 * 60 * 24;
		$oneWeekAgo = $today -  $aDay * 7;
		
		$thisWeek = $this->getWhat($macid, $oneWeekAgo, $today);
		
		echo json_encode($thisWeek);
	}

  /**
   * Outputs the data from the beginning of time (January 1, 1970) until $end
   * @param $macid id of the machine to get data for.
   * @param $end the latest timestamp (milliseconds since Jan. 1, 1970) to include in the result.
   */
  public function getWhatPast($macid, $end) {
		$past = $this->getWhat($macid, 0, $end);
		
		echo json_encode($past);
	}

  /**
   * Send a mail to each registered machine with a link to the statistics from last week.
   */
  public function sendWeeklyMails() {
    // Get week and year of now.
		$week = 0 + date("W");
		$year = 0 + date("Y");

		// Count time one week back.
		$week = $week - 1;
		if ($week < 1) {
			$week = 52;
			$year = $year - 1;
		}

    // Get all the machines from the database.
		$statement = 'SELECT * FROM machine';
		$query = $this->connection->execute($statement);
		$rows = $query->fetchAll(PDO::FETCH_ASSOC);

    // Send a mail with last weeks statistics to each machine's contact.
    foreach ($rows as $row) {
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

  /**
   * Outputs an XML document of all the data.
   */
  public function getXMLData() {
    // Set the timezone.
    date_default_timezone_set('Europe/Copenhagen');

    // Get the machines from the database.
    $statement = 'SELECT * FROM machine';
    $query = $this->connection->execute($statement);
    $machines = $query->fetchAll(PDO::FETCH_ASSOC);

    // Create an XML document with a <machines> root.
    $xml = new DOMDocument("1.0");
    $root = $xml->createElement("machines");
    $xml->appendChild($root);

    foreach ($machines as $machine) {
      // If the machines is registered as a test machine, leave out of the results.
      if (isset($machine["test"]) && $machine["test"]) {
        continue;
      }

      // Create new <machine> element.
      $entry = $xml->createElement("machine");
      $entry->setAttribute("magafd", $machine["magafd"]);
      $entry->setAttribute("forvalt", $machine["forvalt"]);
      $entry->setAttribute("place", $machine["place"]);
      $entry->setAttribute("name", $machine["name"]);
      $root->appendChild($entry);

      // Get all the data for $machine.
      $statement = 'SELECT * FROM data WHERE macid = :macid';
      $query = $this->connection->execute($statement, array('macid' => $machine["macid"]));
      $dataForMachine = $query->fetchAll(PDO::FETCH_ASSOC);

      // Add each <data> element to the <machine> element.
      foreach ($dataForMachine as $data) {
        $dataEntry = $xml->createElement("data");

        // Convert from timestamp (milliseconds since Jan. 1, 1970) to ISO 8601 date: 2004-02-12T15:19:21+00:00.
        $dataEntry->setAttribute("timestamp", date("c", $data["datetime"] / 1000));
        $dataEntry->setAttribute("smiley", $data["smiley"]);
        $dataEntry->setAttribute("what", $data["what"]);

        $entry->appendChild($dataEntry);
      }
    }

    // Set content type to XML.
    header('Content-type: application/xml');

    // Output XML document.
    echo $xml->saveXML();
  }
}
