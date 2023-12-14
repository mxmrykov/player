<?php
class Cacher
{
    public static function createCash($user, $token)
    {
        $file = fopen('./cache/' . $token, 'w');
        fwrite($file, $user);
        fclose($file);
    }
    public static function readCache($token)
    {
        if (file_exists('./cache/' . $token)) return implode('', file('./cache/' . $token));
        return false;
    }
    public static function deleteCache($token)
    {
        return unlink('./cache/' . $token);
    }
    public function cleanCaches()
    {
        $allCaches = scandir('./cache/');
        foreach ($allCaches as $currentCache)
            if (filemtime($currentCache) + 900 < time()) $this::deleteCache($currentCache);
    }
}
// ((time() - $expiry) > filemtime('./cache/' . $internalID))