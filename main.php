<?
require_once 'general.php';
$client = new oauth_client_class;
$client->oauth_version = '1.0a';
$client->client_id = CLIENT_ID;
$client->client_secret = CLIENT_SECRET;
$client->access_token = $_SESSION['my_access_token'];
$client->access_token_secret = $_SESSION['my_access_token_secret'];

if($_POST['data'])
	$data = $_POST['data'];
else
	$data = array();
$client->CallAPI('http://www.plurk.com'.$_POST['resource'], $_POST['method'], $data, array('ConvertObjects'=>false), $return);
	exit(json_encode($return));
/*
}else{
	exit('{error:1}');
}
*/
?>