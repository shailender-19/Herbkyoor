<?php
/**
 * Local single-origin dev server for the built SPA + PHP API.
 *
 * Why: in production the SPA (dist) and the PHP API share ONE domain, so "/api"
 * is same-origin and there is no CORS. Opening dist/ by itself breaks that —
 * "/api" resolves to file:// or a different port, which the browser blocks.
 * This router serves dist AND /api from one origin, mirroring production.
 *
 * Run from the backend/ directory:
 *   php -S localhost:8000 local-dev-router.php
 * Then open http://localhost:8000
 */

$backend = __DIR__;
$dist    = dirname(__DIR__) . '/react-frontend/dist';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// --- API + backend support paths -> serve from backend/ ---------------------
if (preg_match('#^/(api|uploads)/#', $uri)) {
    $target = $backend . $uri;
    if (is_file($target) && pathinfo($target, PATHINFO_EXTENSION) === 'php') {
        require $target;
        return true;
    }
    if (is_file($target)) {
        return false; // static upload (image, etc.) — let the server stream it
    }
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Not found']);
    return true;
}

// --- Everything else -> the built SPA in dist/ ------------------------------
$path = $dist . $uri;
if ($uri !== '/' && is_file($path)) {
    return false; // real asset — built-in server serves it with correct MIME
}

// SPA client-side routing fallback.
header('Content-Type: text/html; charset=utf-8');
readfile($dist . '/index.html');
return true;
