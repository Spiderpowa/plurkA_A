<?
require_once 'general.php';
//unset($_SESSION);
/* Create the OAuth authentication client class */ 
$client = new oauth_client_class;

/*
 * Set to true if you want to make the class dump
 * debug information to PHP error log
 */
$client->debug = false;

/*
 * Set to true if you want to make the class also dump
 * debug output of the HTTP requests it sends.
 */
$client->debug_http = false;

/* OAuth server type name
 * Setting this variable to one of the built-in supported OAuth servers
 * will make the class automatically set all parameters specific of that
 * type of server.
 * 
 * Currently, built-in supported types are: Facebook, github, Google,
 * Microsoft, Foursquare, Twitter and Yahoo.
 * 
 * Send e-mail to mlemos at acm.org if you would like the class to have
 * built-in support to access other OAuth servers.
 * 
 * Set to an empty string to use another type of OAuth server. Check the
 * documentation to learn how to set other parameters to configure the
 * class to access that server
 */
$client->server = '';
$client->oauth_version = '1.0a';
$client->request_token_url = 'http://www.plurk.com/OAuth/request_token';
$client->dialog_url = 'http://www.plurk.com/OAuth/authorize';
$client->append_state_to_redirect_uri = '';
$client->access_token_url = 'http://www.plurk.com/OAuth/access_token';
//$client->authorization_header = false;
//$client->url_parameters = false;

/* OAuth authentication URL identifier
 * This should be the current page URL without any request parameters
 * used by OAuth, like state and code, error, denied, etc..
 */
$client->redirect_uri = $_SERVER["HTTP_X_FORWARDED_PROTO"].'://'.$_SERVER['HTTP_HOST'].'/index2.php';

/* OAuth client identifier
 * Set this to values defined by the OAuth server for your application
 */
$client->client_id = CLIENT_ID;

/* OAuth client secret
 * Set this to values defined by the OAuth server for your application
 */
$client->client_secret = CLIENT_SECRET;

/* OAuth client permissions
 * Set this to the name of the permissions you need to access the
 * application API
 */
$client->scope = '';

/* Process the OAuth server interactions */
if(($success = $client->Initialize()))
{
	/*
	 * Call the Process function to make the class dialog with the OAuth
	 * server. If you previously have retrieved the access token and set
	 * the respective class variables manually, you may skip this call and
	 * use the CallAPI function directly.
	 */
	$success = $client->Process();
	// Make sure the access token was successfully obtained before making
	// API calls
	if(strlen($client->access_token))
	{
		$success = $client->CallAPI('http://www.plurk.com/APP/checkToken', 'POST', array(), array('ConvertObjects'=>true), $return);
		if(!$return['user_id']){
			if($_GET['retry'])
				exit('Error Getting Token');
			unset($_SESSION['my_access_token'], $_SESSION['my_access_token_secret']);
			$client->ResetAccessToken();
			header('Location: index2.php?retry=1');
		}
	}
	
	/* Internal cleanup call
	 */
	$success = $client->Finalize($success);
}
/*
 * If the exit variable is true, the script must not output anything
 * else and exit immediately
 */
if($client->exit)
	exit;

if($success)
{
	/*
	 * The Output function call is here just for debugging purposes
	 * It is not necessary to call it in real applications
	 */
	 $_SESSION['my_access_token'] = $client->access_token;
	 $_SESSION['my_access_token_secret'] = $client->access_token_secret;
	 echo str_replace('style.css', 'styled.css', str_replace('js.js', 'jsd.js', file_get_contents(STATIC_HOST_URL.'/A_Ad.html')));
	 echo '<style>#debug{display:block;}</style>';
}
?>