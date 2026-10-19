<?php
/** GET /api/doctors/list.php — public roster for the header consult modal. */
require __DIR__ . '/../../includes/bootstrap.php';
require_method('GET');
json_ok(['doctors' => get_doctors(db())]);
