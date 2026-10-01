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
