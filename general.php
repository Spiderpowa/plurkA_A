<?
session_start();
error_reporting(E_ALL ^ E_NOTICE);
ini_set('display_errors', 'stderr');
date_default_timezone_set('Asia/Taipei');
require_once 'config.php';
require_once 'http.php';
require_once 'oauth_client.php';

?>