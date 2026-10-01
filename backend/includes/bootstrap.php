<?php
/**
 * Common bootstrap for every API endpoint: error handling + shared includes.
 * Endpoints do:  require __DIR__ . '/…/includes/bootstrap.php';
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0');   // never show PHP errors to the client
ini_set('log_errors', '1');

/** Domain/validation error carrying an HTTP status (+ optional extra fields). */
class ApiError extends Exception
{
    public int $status;
    public array $extra;
    public function __construct(string $message, int $status = 400, array $extra = [])
    {
        parent::__construct($message);
        $this->status = $status;
        $this->extra = $extra;
    }
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/validation.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/catalog.php';

// Uncaught throwables -> safe JSON. ApiError keeps its message/status; anything
// else is logged and returned as a generic 500 (no leak of SQL/paths/traces).
set_exception_handler(function (Throwable $e): void {
    if ($e instanceof ApiError) {
        json_error($e->getMessage(), $e->status, $e->extra);
    }
    error_log('[api] ' . get_class($e) . ': ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    json_error('Internal server error.', 500);
});

// Catch fatal errors that bypass the exception handler.
register_shutdown_function(function (): void {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        error_log('[api] fatal: ' . $err['message'] . ' @ ' . $err['file'] . ':' . $err['line']);
        if (!headers_sent()) {
            json_error('Internal server error.', 500);
        }
    }
});
