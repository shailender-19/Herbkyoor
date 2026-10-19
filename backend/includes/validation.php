<?php
/**
 * Server-side validation + small domain helpers. Never trust client validation.
 */

declare(strict_types=1);

/** Lucide icons the category card supports (mirrors SUPPORTED_ICONS). */
const SUPPORTED_ICONS = [
    'Leaf', 'Droplet', 'Droplets', 'Sparkles', 'Wind', 'ShieldPlus', 'Flame',
    'HeartHandshake', 'HeartPulse', 'Pill', 'Activity', 'Bone', 'Brain',
    'Flower2', 'Stethoscope', 'Waves',
];

const EMAIL_RE = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';
const INDIAN_PHONE_RE = '/^(\+91[-\s]?)?[6-9]\d{9}$/';

/** Trim + require a non-empty string, or throw ApiError(400). */
function require_string($value, string $field): string
{
    if (!is_string($value) && !is_numeric($value)) {
        throw new ApiError("\"$field\" is required.", 400);
    }
    $v = trim((string) $value);
    if ($v === '') {
        throw new ApiError("\"$field\" is required.", 400);
    }
    return $v;
}

function is_email(string $v): bool
{
    return (bool) preg_match(EMAIL_RE, $v);
}

function is_indian_phone(string $v): bool
{
    return (bool) preg_match(INDIAN_PHONE_RE, preg_replace('/\s/', '', $v));
}

/** Parse "349", 349, "" → float|null (null = unset). */
function parse_number_or_null($value): ?float
{
    if ($value === null) {
        return null;
    }
    if (is_int($value) || is_float($value)) {
        return is_finite((float) $value) ? (float) $value : null;
    }
    $clean = preg_replace('/[^0-9.]/', '', (string) $value);
    return ($clean === '' || !is_numeric($clean)) ? null : (float) $clean;
}

/**
 * Coerce a stock flag from mixed input (bool, 1/0, "true"/"false", "yes"/"no")
 * to a DB tinyint. `null`/unrecognized input falls back to $default — used so
 * a create defaults to in-stock and an update keeps the current value.
 */
function parse_in_stock($value, bool $default = true): int
{
    if ($value === null) {
        return $default ? 1 : 0;
    }
    $b = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    if ($b === null) {
        return $default ? 1 : 0;
    }
    return $b ? 1 : 0;
}

/** URL-safe product slug (matches products.ts slugify). */
function slugify_product(string $value): string
{
    $s = strtolower(trim($value));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    return trim($s, '-');
}

/** camelCase category slug (matches slugifyCategory). "Knee Pain" -> "kneePain". */
function slugify_category(string $value): string
{
    $words = array_values(array_filter(preg_split('/[^a-z0-9]+/', strtolower(trim($value)))));
    if (count($words) === 0) {
        return '';
    }
    $out = $words[0];
    for ($i = 1; $i < count($words); $i++) {
        $out .= ucfirst($words[$i]);
    }
    return $out;
}

/** Sanitize an upload folder segment ([a-zA-Z0-9_-], default "misc"). */
function safe_folder(?string $value): string
{
    $cleaned = preg_replace('/[^a-zA-Z0-9_-]/', '', (string) $value);
    return $cleaned !== '' ? $cleaned : 'misc';
}

/**
 * Detect an image's real MIME from its bytes, resilient to hosts where the
 * `fileinfo` extension is not loaded (common on shared hosting — a missing
 * `finfo` class would otherwise fatal the request).
 *
 * Order: finfo (most accurate) -> getimagesize (core/GD, raster types) ->
 * SVG head sniff. Returns '' when the type can't be determined so the caller
 * can respond with a clean 415 instead of crashing.
 */
function detect_image_mime(string $tmpPath, string $originalName = ''): string
{
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    // 1) fileinfo, when available.
    if (class_exists('finfo')) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = (string) $finfo->file($tmpPath);
        if ($mime === 'text/plain' && $ext === 'svg') {
            $mime = 'image/svg+xml'; // some libmagic builds report SVG as text/plain
        }
        if ($mime !== '' && $mime !== 'application/octet-stream') {
            return $mime;
        }
    }

    // 2) getimagesize — covers jpeg/png/gif/webp/avif (and bmp) from core/GD.
    $info = @getimagesize($tmpPath);
    if (is_array($info) && !empty($info['mime'])) {
        return (string) $info['mime'];
    }

    // 3) SVG is text, not a raster — sniff the head for an <svg> root element.
    $head = (string) @file_get_contents($tmpPath, false, null, 0, 512);
    if ($head !== '' && preg_match('/<svg[\s>]/i', $head) && ($ext === 'svg' || stripos($head, '<svg') !== false)) {
        return 'image/svg+xml';
    }

    return '';
}

/** Short, path-safe base name from an original filename. */
function safe_base_name(string $name): string
{
    $base = preg_replace('/\.[^.]+$/', '', $name);
    $base = strtolower($base);
    $base = preg_replace('/[^a-z0-9]+/', '-', $base);
    $base = trim($base, '-');
    $base = substr($base, 0, 40);
    return $base !== '' ? $base : 'image';
}

/** Coerce a value to a clean array of trimmed non-empty strings. */
function string_list($value): array
{
    if (!is_array($value)) {
        return [];
    }
    $out = [];
    foreach ($value as $v) {
        $s = trim((string) $v);
        if ($s !== '') {
            $out[] = $s;
        }
    }
    return $out;
}
