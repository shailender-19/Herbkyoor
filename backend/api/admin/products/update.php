<?php
/** POST /api/admin/products/update.php — { category, id, product }. */
require __DIR__ . '/../../../includes/bootstrap.php';
require_method('POST', 'PUT');
require_admin();
require_same_origin();

$body = read_json_body();
$category = trim((string) ($body['category'] ?? ''));
$id = trim((string) ($body['id'] ?? ''));
if ($category === '' || $id === '') {
    json_error('"category" and "id" are required.', 400);
}
$product = update_product(db(), $category, $id, is_array($body['product'] ?? null) ? $body['product'] : []);
json_ok(['product' => $product]);
