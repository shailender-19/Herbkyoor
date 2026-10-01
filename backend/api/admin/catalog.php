<?php
/** GET /api/admin/catalog.php — full catalogue + supported icons (auth). */
require __DIR__ . '/../../includes/bootstrap.php';
require_method('GET');
require_admin();
json_ok(['categories' => admin_catalog(db()), 'icons' => SUPPORTED_ICONS]);
