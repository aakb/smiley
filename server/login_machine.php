<?php 
	header('Access-Control-Allow-Origin: *');

	// Setup connection to database
	$mysqli = new mysqli("127.0.0.1", "admin", "", "test", 3306);
	if ($mysqli->connect_errno) {
		echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
	}

	// If uniqueid provided
	$uniqueid = $_POST["uniqueid"];
	$mail = $_POST["mail"];
	
	if (is_null($uniqueid) || $uniqueid == "" || is_null($mail) || $mail == "") {
		echo "error: id or mail not set";
	} else {
		// Query db for machine
		if (!($stmt = $mysqli->prepare("SELECT * FROM machine WHERE id = (?) AND mail = (?)"))) {
			echo "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
		}
		// 2. Bind parameters
		if (!$stmt->bind_param("ss", $uniqueid,$mail)) {
			echo "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
		}
		// 3. Execute prepared statement
		if (!$stmt->execute()) {
			echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
		}

		$res = $stmt->get_result();
		if (count($res) != 1) {
			echo "Error";
			return;
		}
	}
?>
