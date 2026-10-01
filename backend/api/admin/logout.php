<?php
/** POST /api/admin/logout.php — destroy the admin session. */
require __DIR__ . '/../../includes/bootstrap.php';
require_method('POST');
admin_logout();
json_ok(['ok' => true]);
