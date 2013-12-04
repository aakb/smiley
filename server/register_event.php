<?php header('Access-Control-Allow-Origin: *'); ?>
<?php
	$nSmiley = htmlspecialchars($_GET["nSmiley"]);
	$nChoice = htmlspecialchars($_GET["nChoice"]);
	
	$link = mysql_connect('localhost', 'admin', '');
	if (!$link) {
		die('Could not connect: ' . mysql_error());
	}

	mysql_select_db("test", $link);
	mysql_query("INSERT INTO data (machineid, grade, cause) VALUES (0, ".$nSmiley.", ".$nChoice.")");

	mysql_close($link);
?>
