<?php header('Access-Control-Allow-Origin: *'); ?>
<?php
	$nSmiley = htmlspecialchars($_GET["nSmiley"]);
	$nChoice = htmlspecialchars($_GET["nChoice"]);
	$machineID = htmlspecialchars($_GET["machineID"]);
	// Assert arguments are correct
	if ($nSmiley < 1 || $nSmiley > 5 || $nChoice < 1 || $nChoice > 3 || !is_numeric($machineID))
		return;
	
	$link = mysql_connect('localhost', 'admin', '');
	if (!$link) {
		die('Could not connect: ' . mysql_error());
	}
	mysql_select_db("test", $link);

	mysql_query("INSERT INTO data (machineid, grade, cause) VALUES (".$machineID.", ".$nSmiley.", ".$nChoice.")");

	mysql_close($link);
?>
