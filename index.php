<?
session_start();
if($_SESSION['my_access_token']){
	header('Location:index2.php');
	exit;
}
require_once 'general.php';
?>
<!DOCTYPE html>
<html>
<head>
<meta name="title" content="偷偷說愉愉悅" />
<meta name="description" content="到底是誰在偷偷說?" />
<link rel="image_src" href="<?=STATIC_HOST_URL;?>/logo.png" />
<meta property="og:title" content="偷偷說愉愉悅" />
<meta property="og:description" content="到底是誰在偷偷說?" />
<meta property="og:image" content="<?=STATIC_HOST_URL;?>/logo.png" />
<meta charset="utf-8" />
<title>偷偷說愉愉悅</title>
<link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.2/css/bootstrap.min.css" rel="stylesheet">
<link href="<?=STATIC_HOST_URL;?>/style.css" rel="stylesheet">

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>
<script src="//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.2/js/bootstrap.min.js"></script>
<script src="<?=STATIC_HOST_URL;?>/js.js"></script>
</head>

<body>
<div id="body">
<div id="debug" class="well" style="float:right"></div>
<div id="header">
    <img src="http://i.imgur.com/RJup193.jpg" />
    <div>邪王真眼！發動！</div>
</div>
<div class="hero-unit" style="text-align:center; margin:10px;">
<h3>與邪王真眼定下契約，獲得看透匿名噗的能力</h3>
<a href="index2.php" class="btn btn-primary btn-large">讓我們開始吧！</a>
</div>
<div id="footer">
Web Design: Spiderpowa
</div>
</div>
</body>
</html>
