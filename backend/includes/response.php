<?php
/**
 * JSON response helpers — one consistent envelope for every endpoint.
 *
 *   success: { "success": true, ...payload }
 *   error:   { "success": false, "error": "msg", "message": "msg" }
 *
 * `error` matches what the frontend reads; `message` matches the brief's
 * convention (same text). Extra keys (e.g. `fields`) can be added per call.
 */

declare(strict_types=1);

/** Emit a JSON body with an HTTP status and stop. */
function json_out(int $status, array $body): void
{
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
    }
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/** Success: merges the payload at top level alongside `success: true`. */
function json_ok(array $payload = [], int $status = 200): void
{
    json_out($status, array_merge(['success' => true], $payload));
}

/** Error: sets both `error` and `message` (same text) + optional extras. */
function json_error(string $message, int $status = 400, array $extra = []): void
{
    json_out($status, array_merge([
        'success' => false,
        'error'   => $message,
        'message' => $message,
    ], $extra));
}

/** Read and decode a JSON request body (returns [] on empty/invalid). */
function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/** Enforce an allowed HTTP method (case-insensitive). 405 otherwise. */
function require_method(string ...$allowed): void
{
    $m = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    foreach ($allowed as $a) {
        if ($m === strtoupper($a)) {
            return;
        }
    }
    header('Allow: ' . implode(', ', $allowed));
    json_error('Method not allowed.', 405);
}
