<?php
/** POST/DELETE /api/admin/products/delete.php — { category, id } (body or query). */
require __DIR__ . '/../../../includes/bootstrap.php';
require_method('POST', 'DELETE');
require_admin();
require_same_origin();

$body = read_json_body();
$category = trim((string) ($body['category'] ?? $_GET['category'] ?? ''));
$id = trim((string) ($body['id'] ?? $_GET['id'] ?? ''));
if ($category === '' || $id === '') {
    json_error('"category" and "id" are required.', 400);
}
delete_product(db(), $category, $id);
json_ok(['ok' => true]);
