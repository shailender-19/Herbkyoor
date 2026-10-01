<?php
/** POST/DELETE /api/admin/categories/delete.php — { slug } (body or query). */
require __DIR__ . '/../../../includes/bootstrap.php';
require_method('POST', 'DELETE');
require_admin();
require_same_origin();

$body = read_json_body();
$slug = trim((string) ($body['slug'] ?? $_GET['slug'] ?? ''));
if ($slug === '') {
    json_error('"slug" is required.', 400);
}
delete_category(db(), $slug);
json_ok(['ok' => true]);
