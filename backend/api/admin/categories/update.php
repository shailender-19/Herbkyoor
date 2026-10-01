<?php
/** POST/PUT /api/admin/categories/update.php — update a category (slug immutable). */
require __DIR__ . '/../../../includes/bootstrap.php';
require_method('POST', 'PUT');
require_admin();
require_same_origin();
$category = update_category(db(), read_json_body());
json_ok(['category' => $category]);
