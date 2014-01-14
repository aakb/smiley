<?php
header('Access-Control-Allow-Origin: *');

include_once dirname(__FILE__).'/database/smileydb.php';

$smileyDB = new SmileyDB();

$smileyDB->getXMLData();
