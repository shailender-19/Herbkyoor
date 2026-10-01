<?php
/** GET /api/categories/list.php — all categories with product counts. */
require __DIR__ . '/../../includes/bootstrap.php';
require_method('GET');
json_ok(['categories' => get_categories_public(db())]);
