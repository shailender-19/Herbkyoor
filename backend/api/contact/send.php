<?php
/**
 * POST /api/contact/send.php — { name, email, phone?, message }.
 * Validates server-side and stores the message in the database. The shop reads
 * messages from the `contact_messages` table (no email sending).
 */
require __DIR__ . '/../../includes/bootstrap.php';
require_method('POST');

$body = read_json_body();
$name    = trim((string) ($body['name'] ?? ''));
$email   = trim((string) ($body['email'] ?? ''));
$phone   = trim((string) ($body['phone'] ?? ''));
$message = trim((string) ($body['message'] ?? ''));

$fields = [];
if (mb_strlen($name) < 2)      $fields['name'] = 'Please enter your name.';
if (!is_email($email))         $fields['email'] = 'Enter a valid email.';
if ($phone !== '' && !is_indian_phone($phone)) $fields['phone'] = 'Enter a valid phone number.';
if (mb_strlen($message) < 10)  $fields['message'] = 'Please write a little more (min 10 characters).';
if ($fields) {
    json_error('Please correct the highlighted fields.', 400, ['fields' => $fields]);
}

$stmt = db()->prepare('INSERT INTO contact_messages (name, email, phone, message) VALUES (?,?,?,?)');
$stmt->execute([$name, $email, $phone !== '' ? $phone : null, $message]);

json_ok(['ok' => true]);
