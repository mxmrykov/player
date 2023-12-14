<?php


include './cache.php';
include './controller.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Credentials: true');


$Parser = new Parser();
$Cache = new Cacher();


//Clean "Fast" Caches
if (json_decode($Cache::readCache('cachefile'))->LC + 900 < time()) {
    $LC = array();
    $LC['LC'] = time();
    $Cache->cleanCaches();
    $Cache::createCash(json_encode($LC), 'cachefile');
}


$Parser::GET('type', 'login', function () {
    $Controller = new Controller(0);
    $response = array();
    if ($Controller->isUserExist($_GET['login']) > 0) {
        $Cache = new Cacher();
        $getUserCallback = $Controller->getUser($_GET['login'], $_GET['password']);
        if ($getUserCallback['ok']) {
            $Cache::createCash(json_encode($getUserCallback['user']), $getUserCallback['user']['token']);
            $response['ok'] = true;
            $response['token'] = $getUserCallback['user']['token'];
            $Controller::json($response);
        } else {
            $Controller::json($getUserCallback);
        }
    } else if ($Controller->isUserExist($_GET['login']) == 0) {
        $response['ok'] = false;
        $response['type'] = 'user do not exist';
        $Controller::json($response);
    } else {
        $response['ok'] = false;
        $response['type'] = 'DB error';
        $Controller::json($response);
    }
    exit();
});


$Parser::GET('type', 'signup', function () {
    $Controller = new Controller(0);
    $Cache = new Cacher();
    $response = array();
    $getUserCallback = $Controller->createAccount($_GET['name'], $_GET['login'], $_GET['email'], $_GET['password']);
    if ($getUserCallback['ok']) {
        $Cache::createCash(json_encode($getUserCallback['user']), $getUserCallback['user']['token']);
        $response['ok'] = true;
        $response['token'] = $getUserCallback['user']['token'];
        $Controller::json($response);
    } else {
        $Controller::json($getUserCallback);
    }
    exit();
});


$Parser::GET('type', 'getuser', function () {
    $Cache = new Cacher();
    $Controller = new Controller($_GET['token']);
    $response = array();
    if ($Controller->isUserSessionExpired() == 1) {
        $response['ok'] = false;
        $response['type'] = 'sesseion expired';
    } else if ($Controller->isUserSessionExpired() == -1) {
        $response['ok'] = false;
        $response['type'] = 'cannot get session';
    } else if ($Controller->isUserSessionExpired() == 0) {
        if (!$Controller->ifUserCached() || ((time() - 900) > filemtime('./cache/' . $_GET['token']))) {
            if ($Controller->getUserInternal()['ok'])  $Cache::createCash(json_encode($Controller->getUserInternal()['user']), $_GET['token']);
            else {
                $response['ok'] = false;
                $response['type'] = $Controller->getUserInternal()['type'];
            }
        }
        $response['user'] = json_decode($Cache::readCache($_GET['token']));
        $response['ok'] = true;
    } else {
        $response['ok'] = false;
        $response['type'] = 'internal server error';
    }
    $Controller::json($response);
    exit();
});


$Parser::GET('type', 'exit', function () {
    $Controller = new Controller($_GET['token']);
    $Cache = new Cacher();
    $response = array();
    $n = 'internal.id';
    $Controller->AddLogs('Account exit', json_decode($Cache::readCache($_GET['token']))->$n);
    if ($Cache::deleteCache($_GET['token'])) {
        $response['ok'] = true;
        $response['type'] = 'session aborted';
    } else {
        $response['ok'] = false;
        $response['type'] = 'error at session aborting';
    }
    $Controller::json($response);
    exit();
});

$Parser::GET('type', 'uploadSong', function () {
    $Controller = new Controller(0);
    $Cache = new Cacher();
    $n = 'internal.id';
    $Controller::json($Controller->uploadSong(json_decode($Cache::readCache($_GET['token']))->$n));
    $Cache::deleteCache($_GET['token']);
    exit();
});


$Parser::GET('type', 'getUserSongs', function () {
    $Controller = new Controller($_GET['token']);
    $Cache = new Cacher();
    $n = 'internal.id';
    $ID = json_decode($Cache::readCache($_GET['token']))->$n;
    $Controller::json($Controller->getUserAudios($ID));
    exit();
});


$Parser::GET('type', 'updUser', function () {
    $Cache = new Cacher();
    $n = 'internal.id';
    $name = json_decode($Cache::readCache($_GET['token']))->login;
    $ID = json_decode($Cache::readCache($_GET['token']))->$n;
    $Controller = new Controller($ID);
    $response = $Controller->updateUser($_GET['wi'], $ID, $name);
    $Controller::json($response);
    if ($response['ok']) $Cache::deleteCache($_GET['token']);
    exit();
});

$Parser::GET('type', 'loginUsed', function() {
  $Controller = new Controller(0);
  $Controller::json($Controller->isUserExist($_GET['login']) > 0);
});
