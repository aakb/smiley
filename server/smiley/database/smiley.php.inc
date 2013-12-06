<?php

include_once dirname(__FILE__).'/../utils/conf.php.inc';
include_once dirname(__FILE__).'/pdo_mysql.php.inc';

class Smiley {
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
	} else {
	    $result = array('result'=>'error_does_not_exist');
		echo json_encode($result);		
	}
  }

  public function register($contact, $mail, $magafd, $forvalt, $place, $name) {
	// machine already exist?
	$statement = 'SELECT * FROM machine WHERE contact = :contact AND mail = :mail AND magafd = :magafd AND forvalt = :forvalt AND place = :place AND name = :name';
	$query = $this->connection->execute($statement, array('id' => $id));
	if ($count > 0) {		// machine already exists
	    $result = array('result'=>'error_machine_already_exist');
		echo json_encode($result);
	}
	
	// make macid: first letter of "contant", "magafd", "forvalt", "place", "name" + next id
	$macid = substr($contact, 0, 1);
	echo $macid;

	// insert new machine
	$statement = 'INSERT INTO machine (macid, contact, mail, magafd, forvalt, place, name) VALUES (:macid, :contact, :mail, :magafd, :forvalt, :place, :name)';
	$query = $this->connection->execute($statement, array(	'macid' => $macid,
															'contact' => $contact, 
															'mail' => $mail, 
															'magafd' => $magafd, 
															'forvalt' => $forvalt, 
															'place' => $place, 
															'name' => $name));
	
	// return macid
	$result = array('result'=>'ok', 'macid'=>$macid);
	echo json_encode($result);	
  }
  
  public function result() {
	echo "result";
/*    if ($this->loaded) {
      $statement = 'UPDATE regions 
                    SET selected = :selected,
                      interested = :interested,
                  not_interested = :not_interested,
                           color = :color
                    WHERE id = :id';
      $query = $this->connection->execute($statement, array('id' => $this->id, 
                                                            'selected' => $this->selected,
                                                            'interested' => $this->interested,
                                                            'not_interested' => $this->not_interested,
                                                            'color' => $this->color));
    }
    else {
      throw new Exception('Can\'t save region that have not been loaded! (line: '. __LINE__ .')');
    }*/
  }
}

?>