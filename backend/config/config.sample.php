<?php
/**
 * LEGACY configuration template (still supported as a fallback).
 *
 * PREFERRED: use a .env file instead — copy backend/.env.example to backend/.env
 * and set your credentials there. The app reads .env first and only falls back to
 * config.local.php if no DB_NAME env var is present.
 *
 * If you still want to use this file:
 *   cp config/config.sample.php config/config.local.php
 *   # then edit config/config.local.php
 * `config.local.php` is NEVER committed and is blocked from web access by
 * config/.htaccess.
 */

return [
    'db' => [
        'host'    => 'localhost',        // HostyCare: usually "localhost"
        'name'    => 'your_db_name',      // e.g. cpaneluser_herbskyoor
        'user'    => 'your_db_user',      // e.g. cpaneluser_herb
        'pass'    => 'your_db_password',
        'charset' => 'utf8mb4',
    ],

    'app' => [
        // 'production' or 'development'. Never leaks details to the client either
        // way — only controls server-side error verbosity in the log.
        'env' => 'production',

        // Filesystem path where uploaded images are written (must be writable).
        'upload_dir' => dirname(__DIR__) . '/uploads/products',

        // Web path (relative to the site web root) used to build image URLs
        // returned by the API. Public pages use it as-is; the admin prefixes "../".
        'upload_url_base' => 'uploads/products',

        'max_upload_bytes' => 5 * 1024 * 1024, // 5 MB
        'session_lifetime' => 8 * 3600,         // 8 hours
        // Set true only when the site is served over HTTPS (recommended in prod).
        'cookie_secure' => false,
    ],
];
