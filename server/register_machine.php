<?php 
	header('Access-Control-Allow-Origin: *');

	// Setup connection to database
	$mysqli = new mysqli("127.0.0.1", "admin", "", "test", 3306);
	if ($mysqli->connect_errno) {
		echo "Failed to connect to MySQL: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error;
	}

	// Get input
	$contact = $_POST["contact"];
	$mail = $_POST["mail"];
	$magAfd = $_POST["magafd"];
	$forvalt = $_POST["forvalt"];
	$placering = $_POST["placering"];
	$navn = $_POST["navn"];

	// Test that all input is provided
	if (is_null($contact) || is_null($mail) || is_null($magAfd) || is_null($forvalt) || is_null($placering) || is_null($navn))
		return 1; 			// error

	// Insert new machine
	// 1. Make prepared statement
	if (!($stmt = $mysqli->prepare("INSERT INTO machine(contact,mail,mag_afd,forvaltning,placering,navn) VALUES (?,?,?,?,?,?)"))) {
		echo "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
	}
	// 2. Bind parameters
	if (!$stmt->bind_param("ssssss", $contact,$mail,$magAfd,$forvalt,$placering,$navn)) {
		echo "Binding parameters failed: (" . $stmt->errno . ") " . $stmt->error;
	}
	// 3. Execute prepared statement
	if (!$stmt->execute()) {
		echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
	}
	
	// Get new entry, return machineid
	
?>
