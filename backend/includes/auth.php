<?php
/**
 * Admin authentication via PHP sessions + password_hash/verify.
 * Every admin endpoint must call require_admin().
 */

declare(strict_types=1);

const ADMIN_SESSION_KEY = 'admin_id';

/** True when the current request is served over HTTPS (incl. behind a proxy). */
function request_is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') {
        return true;
    }
    if (($_SERVER['SERVER_PORT'] ?? null) == 443) {
        return true;
    }
    // Common reverse-proxy / load-balancer headers (LiteSpeed, Cloudflare, etc.).
    $xfp = strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''));
    return $xfp === 'https';
}

/** Start the session with hardened cookie params (idempotent). */
function start_admin_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $cfg = app_config()['app'];
    // Secure cookie whenever the connection is HTTPS; the config flag can force it
    // on as well. This prevents the session cookie leaking over plain HTTP in prod.
    $secure = request_is_https() || (bool) ($cfg['cookie_secure'] ?? false);
    session_set_cookie_params([
        'lifetime' => (int) ($cfg['session_lifetime'] ?? 28800),
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure'   => $secure,
    ]);
    session_name('herb_admin');
    session_start();
}

function is_admin_authenticated(): bool
{
    start_admin_session();
    return !empty($_SESSION[ADMIN_SESSION_KEY]);
}

/** 401 + exit unless the current request is an authenticated admin. */
function require_admin(): void
{
    if (!is_admin_authenticated()) {
        json_error('Unauthorized.', 401);
    }
}

/** Verify credentials against admin_users; on success start the session. */
function admin_login(PDO $pdo, $username, $password): bool
{
    if (!is_string($username) || !is_string($password) || $username === '' || $password === '') {
        return false;
    }
    $stmt = $pdo->prepare('SELECT id, password_hash FROM admin_users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $row = $stmt->fetch();
    if (!$row || !password_verify($password, $row['password_hash'])) {
        return false;
    }
    start_admin_session();
    session_regenerate_id(true);
    $_SESSION[ADMIN_SESSION_KEY] = (int) $row['id'];
    $_SESSION['admin_username'] = $username;
    return true;
}

/** Destroy the admin session + cookie. */
function admin_logout(): void
{
    start_admin_session();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

/**
 * Lightweight CSRF defence for cookie-authenticated writes: require the request
 * to originate from our own site. Blocks cross-site form posts that ride the
 * session cookie. (A dedicated CSRF token can be layered on if desired.)
 */
function require_same_origin(): void
{
    // Compare hosts only (ignore scheme/port) — CSRF defence is about the domain.
    $host = preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? ''));
    $check = function (?string $value) use ($host): void {
        if ($value === null || $value === '') {
            return;
        }
        $h = parse_url($value, PHP_URL_HOST);
        if ($h !== null && $h !== false && strcasecmp((string) $h, $host) !== 0) {
            json_error('Cross-origin request blocked.', 403);
        }
    };
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $check($origin);
        return;
    }
    // No Origin header (older browsers) — fall back to Referer.
    $check($_SERVER['HTTP_REFERER'] ?? '');
    // If neither header is present we allow it (same-origin fetch may omit both);
    // the httpOnly SameSite=Lax cookie already prevents most cross-site abuse.
}
