<?php
/** POST /api/admin/login.php — { username, password }. Starts a session on success. */
require __DIR__ . '/../../includes/bootstrap.php';
require_method('POST');
require_same_origin();

$body = read_json_body();
if (!array_key_exists('username', $body) || !array_key_exists('password', $body)) {
    json_error('Invalid request body.', 400);
}
if (!admin_login(db(), $body['username'], $body['password'])) {
    json_error('Invalid username or password.', 401);
}
json_ok(['ok' => true]);
