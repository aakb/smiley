<?php

class Conf {

  // Database configuration
  private $database = NULL;
  private $server   = NULL;
  private $user     = NULL;
  private $passwd   = NULL;

  // Load configuration
  public function __construct() {
    include_once dirname(__FILE__).'/settings.php';    
    $this->database = $settings['database'];
    $this->server = $settings['server'];
    $this->user = $settings['user'];
    $this->passwd = $settings['passwd'];
  }

  public function getDB() {
    return $this->database;
  }

  public function getServer() {
    return $this->server;
  }

  public function getUser() {
    return $this->user;
  }

  public function getPassword() {
    return $this->passwd;
  }
  // End database configuration

  // File paths

  // End file paths

  // Define the system locations
  private $webroot = null;
  public function getWebroot() {
    if ($this->webroot == null) {
      $path = substr(dirname(__FILE__), 0, strlen(dirname(__FILE__)) - 5);
      $this->webroot = substr($path, strlen($_SERVER['DOCUMENT_ROOT']));

      // Correction of webroot
      if ($this->webroot == '/') {
        $this->webroot = '';
      }
    }
    return $this->webroot;
  }
  // End define the system locations
}

$conf = new Conf();

?>