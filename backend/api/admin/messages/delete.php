<?php
/** POST/DELETE /api/admin/messages/delete.php — { id } (body or query) (auth). */
require __DIR__ . '/../../../includes/bootstrap.php';
require_method('POST', 'DELETE');
require_admin();
require_same_origin();

$body = read_json_body();
$id = (int) ($body['id'] ?? $_GET['id'] ?? 0);
if ($id <= 0) {
    json_error('"id" is required.', 400);
}

$stmt = db()->prepare('DELETE FROM contact_messages WHERE id = ?');
$stmt->execute([$id]);

if ($stmt->rowCount() === 0) {
    json_error('Message not found.', 404);
}

json_ok(['ok' => true, 'id' => $id]);
