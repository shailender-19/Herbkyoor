<?php
/** GET /api/admin/messages/list.php — contact messages, newest first (auth). */
require __DIR__ . '/../../../includes/bootstrap.php';
require_method('GET');
require_admin();

$rows = db()->query(
    'SELECT id, name, email, phone, message, is_read, created_at
       FROM contact_messages
   ORDER BY created_at DESC, id DESC'
)->fetchAll();

// Normalise types for the client (is_read -> bool).
$messages = array_map(static function (array $r): array {
    $r['id']      = (int) $r['id'];
    $r['is_read'] = (bool) $r['is_read'];
    return $r;
}, $rows);

$unread = 0;
foreach ($messages as $m) {
    if (!$m['is_read']) {
        $unread++;
    }
}

json_ok(['messages' => $messages, 'unread' => $unread]);
