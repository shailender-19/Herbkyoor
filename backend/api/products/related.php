<?php
/** GET /api/products/related.php?slug=<slug>&limit=4 — related products. */
require __DIR__ . '/../../includes/bootstrap.php';
require_method('GET');

$slug = trim((string) ($_GET['slug'] ?? ''));
if ($slug === '') {
    json_error('"slug" is required.', 400);
}
$limit = (int) ($_GET['limit'] ?? 4);
$pdo = db();
$product = get_product_by_slug($pdo, $slug);
if (!$product) {
    json_error('Product not found.', 404);
}
json_ok(['products' => get_related_products($pdo, $product, $limit)]);
