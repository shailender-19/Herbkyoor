<?php
/**
 * Minimal .env loader (no external dependency).
 * Reads KEY=VALUE lines into the process environment so config can use env().
 * Existing real environment variables always win over the file (12-factor).
 */

declare(strict_types=1);

/** Parse a .env file once and populate getenv()/$_ENV (only for unset keys). */
function load_env(string $path): void
{
    static $loaded = [];
    if (isset($loaded[$path])) {
        return;
    }
    $loaded[$path] = true;
    if (!is_file($path) || !is_readable($path)) {
        return;
    }
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        // Strip matching surrounding quotes.
        $len = strlen($value);
        if ($len >= 2 && ($value[0] === '"' || $value[0] === "'") && $value[$len - 1] === $value[0]) {
            $value = substr($value, 1, -1);
        }
        // Don't clobber a value already present in the real environment.
        if ($key !== '' && getenv($key) === false) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

/** Read an env var with a default; '' is treated as a real (empty) value. */
function env(string $key, $default = null)
{
    $v = getenv($key);
    return $v === false ? $default : $v;
}

/** Interpret an env string as a boolean (true/1/yes/on). */
function env_bool(string $key, bool $default = false): bool
{
    $v = getenv($key);
    if ($v === false) {
        return $default;
    }
    return in_array(strtolower(trim($v)), ['1', 'true', 'yes', 'on'], true);
}
