<?php
/**
 * PDO database connection + app config loader.
 * Credentials come from config.local.php (never exposed to the browser).
 */

declare(strict_types=1);

/** Load the local configuration array (cached). */
function app_config(): array
{
    static $cfg = null;
    if ($cfg !== null) {
        return $cfg;
    }
    $local = __DIR__ . '/config.local.php';
    if (!is_file($local)) {
        // Fail safe: never reveal paths/details.
        error_log('[config] config.local.php missing — copy config.sample.php and set credentials.');
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Server not configured.', 'message' => 'Server not configured.']);
        exit;
    }
    return $cfg = require $local;
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
