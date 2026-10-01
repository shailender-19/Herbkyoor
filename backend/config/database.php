<?php
/**
 * PDO database connection + app config loader.
 * Credentials come from config.local.php (never exposed to the browser).
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/env.php';

/**
 * Load the application configuration (cached).
 * Source priority:
 *   1. Environment variables / a .env file at backend/.env  (preferred)
 *   2. Legacy config/config.local.php                        (fallback)
 * Credentials never reach the browser either way.
 */
function app_config(): array
{
    static $cfg = null;
    if ($cfg !== null) {
        return $cfg;
    }

    // Populate env from backend/.env if present (real env vars take precedence).
    load_env(dirname(__DIR__) . '/.env');

    if (env('DB_NAME') !== null) {
        return $cfg = [
            'db' => [
                'host'    => env('DB_HOST', 'localhost'),
                'name'    => env('DB_NAME'),
                'user'    => env('DB_USER', 'root'),
                'pass'    => env('DB_PASS', ''),
                'charset' => env('DB_CHARSET', 'utf8mb4'),
            ],
            'app' => [
                'env'              => env('APP_ENV', 'production'),
                'upload_dir'       => env('UPLOAD_DIR', dirname(__DIR__) . '/uploads/products'),
                'upload_url_base'  => env('UPLOAD_URL_BASE', 'uploads/products'),
                'max_upload_bytes' => (int) env('MAX_UPLOAD_BYTES', 5 * 1024 * 1024),
                'session_lifetime' => (int) env('SESSION_LIFETIME', 8 * 3600),
                'cookie_secure'    => env_bool('COOKIE_SECURE', false),
            ],
        ];
    }

    // Legacy fallback: config/config.local.php
    $local = __DIR__ . '/config.local.php';
    if (is_file($local)) {
        return $cfg = require $local;
    }

    // Fail safe: never reveal paths/details.
    error_log('[config] No .env (DB_NAME) and no config.local.php — set credentials (see .env.example).');
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Server not configured.', 'message' => 'Server not configured.']);
    exit;
}

/** Return a shared PDO connection (lazy, cached). */
function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    $c = app_config()['db'];
    $dsn = "mysql:host={$c['host']};dbname={$c['name']};charset={$c['charset']}";
    try {
        $pdo = new PDO($dsn, $c['user'], $c['pass'], [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        // Log the real reason server-side; return a safe generic message.
        error_log('[db] connection failed: ' . $e->getMessage());
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Database connection failed.', 'message' => 'Database connection failed.']);
        exit;
    }
    return $pdo;
}
