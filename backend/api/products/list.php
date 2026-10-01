<?php
/** GET /api/products/list.php — all products (normalized). */
require __DIR__ . '/../../includes/bootstrap.php';
require_method('GET');
json_ok(['products' => get_all_products(db())]);
