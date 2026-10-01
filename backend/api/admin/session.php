<?php
/** GET /api/admin/session.php — is the current visitor an authenticated admin? */
require __DIR__ . '/../../includes/bootstrap.php';
require_method('GET');
json_ok(['authenticated' => is_admin_authenticated()]);
