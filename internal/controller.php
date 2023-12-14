<?php

date_default_timezone_set('UTC');

class Controller
{
    private string $DB_USER = "tuned_db0";
    private string $DB_PASSWORD = "35Nmpe8MFGyB";
    private string $DB_USER_INTERNAL = "tuned_db0";
    private string $DB_PASSWORD_INTERNAL = "35Nmpe8MFGyB";
    private string $DB_HOST = "db10.ipipe.ru";
    protected string $TOKEN;
    function __construct($indernalID)
    {
        $this->TOKEN = $indernalID;
    }
    public function GIP()
    {
        $client  = $_SERVER['HTTP_CLIENT_IP'];
        $forward = $_SERVER['HTTP_X_FORWARDED_FOR'];
        $remote  = $_SERVER['REMOTE_ADDR'];
        if (filter_var($client, FILTER_VALIDATE_IP)) $ip = $client;
        elseif (filter_var($forward, FILTER_VALIDATE_IP)) $ip = $forward;
        else $ip = $remote;
        return $ip;
    }
    public static function json($data)
    {
        header('Content-type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT);
    }
    public function ifUserCached()
    {
        return file_exists('./cache/' . $this->TOKEN);
    }
    public function isUserExist($login)
    {
        try {
            $PDO_GLOBAL = new PDO("mysql:host=" . $this->DB_HOST . ";dbname=tuned_db0", $this->DB_USER, $this->DB_PASSWORD);
            $request = $PDO_GLOBAL->query("SELECT name FROM users WHERE login = '" . $login . "'");
            return $request->rowCount();
        } catch (PDOException $E) {
            return -1;
        }
    }
    public function AddLogs($logs, $ID)
    {
        $callback = array();
        $today = date('l jS \of F Y h:i:s A');
        try {
            $PDO_INTERNAL = new PDO("mysql:host=" . $this->DB_HOST . ";dbname=tuned_db0", $this->DB_USER_INTERNAL, $this->DB_PASSWORD_INTERNAL);
            $request = $PDO_INTERNAL->query("INSERT INTO logs (`user.internal.id`, `action`, `IP`, `time`) 
            VALUES ('$ID', '$logs', '" . $this->GIP() . "', '$today')");
            $callback['ok'] = true;
        } catch (PDOException $e) {
            file_put_contents('PDOErrors.txt', $e->getMessage() . "\n", FILE_APPEND);
            $callback['ok'] = false;
            $callback['type'] = 'DB error';
        }
        return $callback;
    }
    public function isUserSessionExpired()
    {
        try {
            $PDO_INTERNAL = new PDO("mysql:host=" . $this->DB_HOST . ";dbname=tuned_db0", $this->DB_USER_INTERNAL, $this->DB_PASSWORD_INTERNAL);
            $request = $PDO_INTERNAL->query("SELECT `expiration` FROM tokens WHERE `clid` = '" . $this->TOKEN . "'");
            $request->setFetchMode(PDO::FETCH_ASSOC);
            $request = $request->fetch();
            if (time() < $request['expiration']) return 1;
            else return 0;
        } catch (PDOException $e) {
            file_put_contents('PDOErrors.txt', $e->getMessage() . "\n", FILE_APPEND);
            return -1;
        }
    }
    public function updateUser($wImg, $userAdded, $login)
    {
        $callback = array();
        try {
            if ($wImg == 'p') {
                $target_dir = "./lib/";
                $ext = pathinfo($_FILES["newImg"]["name"])['extension'];
                $newName = $_GET['token'] . '_' . time();
                $target_file = $target_dir . $newName . '.' . $ext;
                $newName_ = $_GET['newName'];
                if (move_uploaded_file($_FILES["newImg"]["tmp_name"], $target_file)) {
                    $PDO_GLOBAL = new PDO("mysql:host=" . $this->DB_HOST . ";dbname=tuned_db0", $this->DB_USER, $this->DB_PASSWORD);
                    $request = $PDO_GLOBAL->query("UPDATE users SET name = '$newName_', avatar = 'https://dreamity.ru/internal/lib/$newName.$ext' WHERE `login` = '$login'");
                    if ($request->rowCount() > 0) {
                        $this->AddLogs('User UPD', $userAdded);
                        $callback['ok'] = true;
                    } else {
                        $callback['ok'] = false;
                        $callback['type'] = 'user updated';
                    }
                } else {
                    $callback['ok'] = false;
                    $callback['type'] = 'cannot upload img to server';
                }
            } else {
                $newName_ = $_GET['newName'];
                echo "UPDATE users SET `name` = '$newName_' WHERE `login` = '$login'";
                $PDO_GLOBAL = new PDO("mysql:host=" . $this->DB_HOST . ";dbname=tuned_db0", $this->DB_USER, $this->DB_PASSWORD);
                $request = $PDO_GLOBAL->query("UPDATE users SET `name` = '$newName_' WHERE `login` = '$login'");
                if ($request->rowCount() > 0) {
                    $this->AddLogs('User UPD', $userAdded);
                    $callback['ok'] = true;
                } else {
                    $callback['ok'] = false;
                    $callback['type'] = 'user updated';
                }
            }
        } catch (PDOException $e) {
            file_put_contents('PDOErrors.txt', $e->getMessage() . "\n", FILE_APPEND);
            $callback['ok'] = false;
            $callback['type'] = 'DB error';
        }
        return $callback;
    }
    public function uploadSong($userAdded)
    {
        $callback = array();
        try {
            $target_dir = "./usersMusic/";
            $ext = pathinfo($_FILES["file"]["name"])['extension'];
            $newName = $_GET['userAdded'] . '_' . time();
            $target_file = $target_dir . $newName . '.' . $ext;
            $songname = $_GET['SN'];
            $songsinger = $_GET['SS'];
            $today = date('l jS \of F Y h:i:s A');
            if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
                $callback['ok'] = true;
                $PDO_GLOBAL = new PDO("mysql:host=" . $this->DB_HOST . ";dbname=tuned_db0", $this->DB_USER, $this->DB_PASSWORD);
                $request = $PDO_GLOBAL->query("INSERT INTO `music.songs` (`song.name`, `song.singer`, `song.adder`, `song.listens`, `song.dateadd`, `song.internal.id`, `song.extension`) 
                VALUES ('$songname', '$songsinger', '$userAdded', '0', '$today', '$newName', '$ext')");
                if ($request) {
                    $this->AddLogs('New song uploaded', $userAdded);
                    $callback['ok'] = true;
                } else {
                    $callback['ok'] = false;
                    $callback['type'] = 'cannot cannot add song to main library';
                }
            } else {
                $callback['ok'] = false;
                $callback['type'] = 'cannot upload song to server';
            }
        } catch (PDOException $e) {
            file_put_contents('PDOErrors.txt', $e->getMessage() . "\n", FILE_APPEND);
            $callback['ok'] = false;
            $callback['type'] = 'DB error';
        }
        return $callback;
    }
    public function getUserAudios($internalID)
    {
        $callback = array(
            'userSongs' => array()
        );
        try {
            $PDO_GLOBAL = new PDO("mysql:host=" . $this->DB_HOST . ";dbname=tuned_db0", $this->DB_USER, $this->DB_PASSWORD);
            $request = $PDO_GLOBAL->query("SELECT * FROM `music.songs` WHERE `song.adder` = '" . $internalID . "' ORDER BY id DESC");
            $request->setFetchMode(PDO::FETCH_ASSOC);
            while ($row = $request->fetch()) array_push($callback['userSongs'], $row);
            if (count($callback['userSongs']) == 0) {
                $callback['ok'] = false;
                $callback['type'] = 'songs not found';
            } else {
                $callback['ok'] = true;
            }
        } catch (PDOException $e) {
            file_put_contents('PDOErrors.txt', $e->getMessage() . "\n", FILE_APPEND);
            $callback['ok'] = false;
            $callback['type'] = 'DB error';
        }
        return $callback;
    }
    public function getUserInternal()
    {
        $callback = array();
        try {
            $PDO_GLOBAL = new PDO("mysql:host=" . $this->DB_HOST . ";dbname=tuned_db0", $this->DB_USER, $this->DB_PASSWORD);
            $PDO_INTERNAL = new PDO("mysql:host=" . $this->DB_HOST . ";dbname=tuned_db0", $this->DB_USER_INTERNAL, $this->DB_PASSWORD_INTERNAL);
            $request = $PDO_INTERNAL->query("SELECT `clid` FROM tokens WHERE `token` = '" . $this->TOKEN . "'");
            $request->setFetchMode(PDO::FETCH_ASSOC);
            $request = $request->fetch();
            $ID = $request['clid'];
            $request_ = $PDO_GLOBAL->query("SELECT COUNT(*) FROM `music.songs` WHERE `song.adder` = '" . $ID . "'");
            $return = $PDO_GLOBAL->query("SELECT * FROM users WHERE `internal.id` = '" . $ID . "'");
            $request_->setFetchMode(PDO::FETCH_ASSOC);
            $request_ = $request_->fetch();
            $return->setFetchMode(PDO::FETCH_ASSOC);
            $return = $return->fetch();
            $return['token'] = $this->TOKEN;
            $return['added'] =  $request_['COUNT(*)'];
            $callback['ok'] = true;
            $callback['user'] = $return;
        } catch (PDOException $e) {
            file_put_contents('PDOErrors.txt', $e->getMessage() . "\n", FILE_APPEND);
            $callback['ok'] = false;
            $callback['type'] = 'DB error';
        }
        return $callback;
    }
    public function getUser($login, $password)
    {
        try {
            $callback = array();
            $today = date('l jS \of F Y h:i:s A');
            $PDO_GLOBAL = new PDO("mysql:host=" . $this->DB_HOST . ";dbname=tuned_db0", $this->DB_USER, $this->DB_PASSWORD);
            $PDO_INTERNAL = new PDO("mysql:host=" . $this->DB_HOST . ";dbname=tuned_db0", $this->DB_USER_INTERNAL, $this->DB_PASSWORD_INTERNAL);
            $request = $PDO_GLOBAL->query("SELECT * FROM users WHERE login = '" . $login . "'");
            $request->setFetchMode(PDO::FETCH_ASSOC);
            $request = $request->fetch();
            $ID = $request['internal.id'];
            $validated = $PDO_INTERNAL->query("SELECT value FROM password WHERE `internal.id` = '" . $ID . "'");
            $validated->setFetchMode(PDO::FETCH_ASSOC);
            $validated = $validated->fetch();
            if ($validated['value'] == $this->password_hasher($password)) {
                $token = $PDO_INTERNAL->query("SELECT token, expiration FROM tokens WHERE `clid` = '" . $ID . "'");
                $token->setFetchMode(PDO::FETCH_ASSOC);
                $token = $token->fetch();
                if ($token['expiration'] < time()) {
                    $new_token = $this->generate_token();
                    $token['token'] = $new_token;
                    $PDO_INTERNAL->query("UPDATE tokens SET token = '" . $new_token . "' AND expiration = '" . time() + 6278000 . "'  WHERE login = '" . $login . "'");
                }
                $PDO_INTERNAL->query("INSERT INTO logs (`user.internal.id`, `action`, `IP`, `time`) VALUES ('" . $ID . "', 'Account Log In', '" . $this->GIP() . "', '" . $today . "')");
                $ID = $request['internal.id'];
                $request_ = $PDO_GLOBAL->query("SELECT COUNT(*) FROM `music.songs` WHERE `song.adder` = '" . $ID . "'");
                $request_->setFetchMode(PDO::FETCH_ASSOC);
                $request_ = $request_->fetch();
                $request['token'] = $token['token'];
                $request['added'] = $request_['COUNT(*)'];
                $callback['ok'] = true;
                $callback['user'] = $request;
            } else {
                $PDO_INTERNAL->query("INSERT INTO logs (`user.internal.id`, `action`, `IP`, `time`) VALUES ('" . $ID . "', 'Attempt to Log In', '" . $this->GIP() . "', '" . $today . "')");
                $callback['ok'] = false;
                $callback['type'] = 'wrong password';
            }
        } catch (PDOException $E) {
            file_put_contents('PDOErrors.txt', $E->getMessage() . "\n", FILE_APPEND);
            $callback['ok'] = false;
            $callback['type'] = 'DB error';
        }
        return $callback;
    }
    public function createAccount($name, $login, $email, $password)
    {
        try {
            $callback = array();
            $today = date('l jS \of F Y h:i:s A');
            if ($this->isUserExist($login)) {
                $callback['ok'] = false;
                $callback['type'] = 'user exists';
            } else {
                $PDO_GLOBAL = new PDO("mysql:host=" . $this->DB_HOST . ";dbname=tuned_db0", $this->DB_USER, $this->DB_PASSWORD);
                $PDO_INTERNAL = new PDO("mysql:host=" . $this->DB_HOST . ";dbname=tuned_db0", $this->DB_USER_INTERNAL, $this->DB_PASSWORD_INTERNAL);
                $ID = time();
                $MID = time() + 21102004;
                $IP = $this->GIP();
                $password_h = $this->password_hasher($password);
                $token = $this->generate_token();
                $create_user = $PDO_GLOBAL->query("INSERT INTO users (`name`, `login`, `email`, `mus.id`, `internal.id`, `avatar`, `cond`) VALUES
                ('" . $name . "', '" . $login . "', '" . $email . "', '" . $MID . "', '" . $ID . "', 'https://dreamity.ru/internal/lib/user_default.png', 'active')");
                if ($create_user) {
                    $create_user_internal = $PDO_INTERNAL->query("INSERT INTO password (`value`, `internal.id`) 
                    VALUES ('" . $password_h . "', '" . $ID . "')");
                    $create_user_internal_1 = $PDO_INTERNAL->query("INSERT INTO tokens (`token`, `clid`, `expiration`) 
                    VALUES ('" . $token . "', '" . $ID . "', '" . time() + 6278000 . "')");
                    $create_user_internal_2 = $PDO_INTERNAL->query("INSERT INTO logs (`user.internal.id`, `action`, `IP`, `time`) 
                    VALUES ('" . $ID . "', '" . 'Account Creation' . "', '" . $IP . "', '" . $today . "')");
                    if (
                        $create_user_internal->rowCount() > 0 &&
                        $create_user_internal_1->rowCount() > 0 &&
                        $create_user_internal_2->rowCount() > 0
                    ) {
                        $callback['ok'] = true;
                        $callback['user'] = array(
                            'name' => $name,
                            'login' => $login,
                            'email' => $email,
                            'token' => $token,
                            'mus.id' => $MID,
                            'internal.id' => $ID,
                            'avatar' => 'https://dreamity.ru/internal/lib/user_default.png',
                            'cond' => 'active',
                        );
                    } else {
                        $callback['ok'] = false;
                        $callback['type'] = 'cannot create internal information';
                    }
                } else {
                    $callback['ok'] = false;
                    $callback['type'] = 'cannot create user';
                }
            }
        } catch (PDOException $E) {
            file_put_contents('PDOErrors.txt', $E->getMessage() . "\n", FILE_APPEND);
            $callback['ok'] = false;
            $callback['type'] = 'DB error';
        }
        return $callback;
    }
    public function password_hasher($password)
    {
        $BP = base_convert($password, 10, 2);
        $BP = ~$BP;
        return hash_hmac('md5', $BP, hash('sha256', '21102004') . '.' . hash('sha256', '629667452'));
    }
    protected function generate_token()
    {
        return hash_hmac('md5', time(), hash('sha256', time()) . '.' . hash('sha256', rand(0, 2110)));
    }
}

class Parser
{
    public static function GET($defaultParam, $route, $function)
    {
        if ($_GET[$defaultParam] == $route) $function();
    }
}
