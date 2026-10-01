<?php
/** POST /api/admin/products/create.php — create a product (raw shape). */
require __DIR__ . '/../../../includes/bootstrap.php';
require_method('POST');
require_admin();
require_same_origin();
$product = create_product(db(), read_json_body());
json_ok(['product' => $product], 201);
