<?php
/** POST /api/admin/messages/mark.php — { id, read?: bool } mark read/unread (auth). */
require __DIR__ . '/../../../includes/bootstrap.php';
require_method('POST');
require_admin();
require_same_origin();

$body = read_json_body();
$id = (int) ($body['id'] ?? $_GET['id'] ?? 0);
if ($id <= 0) {
    json_error('"id" is required.', 400);
}
// Default to marking as read; pass read:false to mark unread again.
$read = array_key_exists('read', $body) ? (bool) $body['read'] : true;

$stmt = db()->prepare('UPDATE contact_messages SET is_read = ? WHERE id = ?');
$stmt->execute([$read ? 1 : 0, $id]);

if ($stmt->rowCount() === 0) {
    // Row may already be in the requested state, or not exist. Treat "exists but
    // unchanged" as success; only 404 when the row is genuinely absent.
    $exists = db()->prepare('SELECT 1 FROM contact_messages WHERE id = ?');
    $exists->execute([$id]);
    if (!$exists->fetchColumn()) {
        json_error('Message not found.', 404);
    }
}

json_ok(['ok' => true, 'id' => $id, 'is_read' => $read]);
