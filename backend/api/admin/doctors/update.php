<?php
/** POST/PUT /api/admin/doctors/update.php — update a doctor by { id }. */
require __DIR__ . '/../../../includes/bootstrap.php';
require_method('POST', 'PUT');
require_admin();
require_same_origin();
$doctor = update_doctor(db(), read_json_body());
json_ok(['doctor' => $doctor]);
