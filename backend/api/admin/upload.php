<?php
/**
 * POST /api/admin/upload.php — multipart image upload (field: file, folder).
 * Validates type/size, stores under uploads/products/<folder>/, returns { path }.
 */
require __DIR__ . '/../../includes/bootstrap.php';
require_method('POST');
require_admin();
require_same_origin();

$app = app_config()['app'];
$maxBytes = (int) $app['max_upload_bytes'];

/** Allowed MIME -> canonical extension. */
$EXT_BY_MIME = [
    'image/jpeg'    => 'jpeg',
    'image/png'     => 'png',
    'image/webp'    => 'webp',
    'image/gif'     => 'gif',
    'image/svg+xml' => 'svg',
    'image/avif'    => 'avif',
];

if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
    json_error('No image file was uploaded.', 400);
}
$file = $_FILES['file'];

// Upload-level errors first.
if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    if (in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)) {
        json_error('Image exceeds the 5 MB size limit.', 413);
    }
    if ($file['error'] === UPLOAD_ERR_NO_FILE) {
        json_error('No image file was uploaded.', 400);
    }
    json_error('Upload failed. Please try again.', 400);
}
if (!is_uploaded_file($file['tmp_name'])) {
    json_error('Invalid upload.', 400);
}
$size = (int) ($file['size'] ?? 0);
if ($size <= 0) {
    json_error('Uploaded file is empty.', 400);
}
if ($size > $maxBytes) {
    json_error('Image exceeds the 5 MB size limit.', 413);
}

// Detect the real MIME from the file bytes (never trust the client-sent type).
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = (string) $finfo->file($file['tmp_name']);
if ($mime === 'text/plain' && strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION)) === 'svg') {
    $mime = 'image/svg+xml'; // some libmagic builds report SVG as text/plain
}
if (!isset($EXT_BY_MIME[$mime])) {
    json_error('Unsupported image type: ' . ($mime !== '' ? $mime : 'unknown') . '.', 415);
}
$ext = $EXT_BY_MIME[$mime];

$folder = safe_folder($_POST['folder'] ?? null);
$base = safe_base_name((string) ($file['name'] ?? 'image'));
try {
    $suffix = bin2hex(random_bytes(4));
} catch (Exception $e) {
    $suffix = substr(md5((string) mt_rand()), 0, 8);
}
$filename = "$base-$suffix.$ext";

$targetDir = rtrim($app['upload_dir'], '/') . '/' . $folder;
if (!is_dir($targetDir) && !@mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
    error_log('[upload] cannot create dir: ' . $targetDir);
    json_error('Could not store the image.', 500);
}
$targetPath = $targetDir . '/' . $filename;
if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    error_log('[upload] move_uploaded_file failed to ' . $targetPath);
    json_error('Could not store the image.', 500);
}
@chmod($targetPath, 0644);

// Public web path (relative to web root): uploads/products/<folder>/<file>.
$path = rtrim($app['upload_url_base'], '/') . '/' . $folder . '/' . $filename;
json_ok(['path' => $path]);
