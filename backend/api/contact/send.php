<?php
/**
 * POST /api/contact/send.php — { name, email, phone?, message }.
 * Validates server-side, stores the message, and (best-effort) emails the shop.
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

// Best-effort notification email (shared hosting mail() may or may not be enabled).
$to = 'care@herbkyoor.in';
$subject = 'New contact message from ' . $name;
$mailBody = "Name: $name\nEmail: $email\nPhone: $phone\n\n$message\n";
$headers = 'From: website@' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\r\nReply-To: $email\r\n";
@mail($to, $subject, $mailBody, $headers);

json_ok(['ok' => true]);
