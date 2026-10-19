<?php
/** POST/DELETE /api/admin/doctors/delete.php — { id } (body or query). */
require __DIR__ . '/../../../includes/bootstrap.php';
require_method('POST', 'DELETE');
require_admin();
require_same_origin();

$body = read_json_body();
$id = (int) ($body['id'] ?? $_GET['id'] ?? 0);
if ($id <= 0) {
    json_error('"id" is required.', 400);
}
delete_doctor(db(), $id);
json_ok(['ok' => true]);
