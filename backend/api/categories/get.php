<?php
/** GET /api/categories/get.php?slug=<slug> — one category (public shape). */
require __DIR__ . '/../../includes/bootstrap.php';
require_method('GET');

$slug = trim((string) ($_GET['slug'] ?? ''));
if ($slug === '') {
    json_error('"slug" is required.', 400);
}
foreach (get_categories_public(db()) as $c) {
    if ($c['slug'] === $slug) {
        json_ok(['category' => $c]);
    }
}
json_error('Category not found.', 404);
