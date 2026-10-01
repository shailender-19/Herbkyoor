<?php
/**
 * Configuration TEMPLATE. Copy this to `config.local.php` on the server and fill
 * in your real values. `config.local.php` is NEVER committed and is blocked from
 * web access by config/.htaccess.
 *
 *   cp config/config.sample.php config/config.local.php
 *   # then edit config/config.local.php
 */

return [
    'db' => [
        'host'    => 'localhost',        // HostyCare: usually "localhost"
        'name'    => 'your_db_name',      // e.g. cpaneluser_herbkyoor
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
