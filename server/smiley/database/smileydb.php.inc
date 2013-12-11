<?php

include_once dirname(__FILE__).'/../utils/conf.php.inc';
include_once dirname(__FILE__).'/pdo_mysql.php.inc';

class SmileyDB {
	// Construct and Destruct
	public function __construct() {
		$this->connection = PDOMysql::getInstance();
	}
	public function __destruct() {
		$this->connection = null;
	}

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
		$macid = substr($contact, 0, 1) . substr($magafd, 0, 1) . substr($forvalt, 0, 1) . substr($place, 0, 1) . substr($name, 0, 1);
		$statement = "SELECT * FROM machine ORDER BY id DESC LIMIT 1";
		$query = $this->connection->execute($statement);
		$id = 1;
		if ($query->rowCount() > 0) {
			$row = $query->fetch();
			$id = $row["id"] + 1;
		}
		$macid = $macid . $id;

		// insert new machine
		$statement = 'INSERT INTO machine (macid, contact, mail, magafd, forvalt, place, name) VALUES (:macid, :contact, :mail, :magafd, :forvalt, :place, :name)';
		$query = $this->connection->execute($statement, array(	'macid' 	=> $macid,
																'contact' 	=> $contact, 
																'mail' 		=> $mail, 
																'magafd' 	=> $magafd, 
																'forvalt' 	=> $forvalt, 
																'place' 	=> $place, 
																'name' 		=> $name));
		
		// return macid
		$result = array('result'=>'ok', 'macid'=>$macid);
		echo json_encode($result);	
	}
  
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
	
	public function getData($macid, $start, $end) {
		$statement = 'SELECT * FROM data WHERE macid = :macid';
		$query = $this->connection->execute($statement, array('macid' => $macid));
		
		echo $query;
	}
}

?>