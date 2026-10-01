<?php
/** GET /api/products/get.php?slug=<slug>  (or ?id=<id>) — one product. */
require __DIR__ . '/../../includes/bootstrap.php';
require_method('GET');

$slug = trim((string) ($_GET['slug'] ?? ''));
$id   = trim((string) ($_GET['id'] ?? ''));
if ($slug === '' && $id === '') {
    json_error('"slug" or "id" is required.', 400);
}
$pdo = db();
$product = $slug !== '' ? get_product_by_slug($pdo, $slug) : get_product_by_id($pdo, $id);
if (!$product) {
    json_error('Product not found.', 404);
}
json_ok(['product' => $product]);
