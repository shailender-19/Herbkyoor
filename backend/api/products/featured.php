<?php
/** GET /api/products/featured.php — featured rail (falls back to first 8). */
require __DIR__ . '/../../includes/bootstrap.php';
require_method('GET');
json_ok(['products' => get_featured_products(db())]);
