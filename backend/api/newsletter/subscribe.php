<?php
/** POST /api/newsletter/subscribe.php — { email }. Upserts (ignores duplicates). */
require __DIR__ . '/../../includes/bootstrap.php';
require_method('POST');

$body = read_json_body();
$email = trim((string) ($body['email'] ?? ''));
if (!is_email($email)) {
    json_error('Please enter a valid email address.', 400);
}
// Insert; ignore duplicate-email (unique) silently — same success either way.
$stmt = db()->prepare('INSERT INTO newsletter_subscribers (email) VALUES (?) ON DUPLICATE KEY UPDATE email = email');
$stmt->execute([$email]);
json_ok(['ok' => true]);
