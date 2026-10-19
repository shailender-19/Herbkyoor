<?php
/** POST /api/admin/doctors/create.php — create a doctor. */
require __DIR__ . '/../../../includes/bootstrap.php';
require_method('POST');
require_admin();
require_same_origin();
$doctor = create_doctor(db(), read_json_body());
json_ok(['doctor' => $doctor], 201);
