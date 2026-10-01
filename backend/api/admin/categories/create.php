<?php
/** POST /api/admin/categories/create.php — create a category. */
require __DIR__ . '/../../../includes/bootstrap.php';
require_method('POST');
require_admin();
require_same_origin();
$category = create_category(db(), read_json_body());
json_ok(['category' => $category], 201);
