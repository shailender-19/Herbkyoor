<?php
/**
 * Importer: load the react-frontend Product_list.json into the database using
 * the SAME domain layer the admin panel uses, so every row, slug, image and
 * size is created exactly as the app expects.
 *
 * Imports BOTH:
 *   - categoryMeta  -> categories table (name, description, icon, image)
 *   - products      -> products / product_images / product_sizes
 *
 * Usage (from the backend/ directory):
 *   php database/import_product_list.php [path/to/Product_list.json] [--fresh]
 *
 *   --fresh   Wipe ALL products AND categories first, then import from the file
 *             (DB becomes an exact mirror of the JSON). Omit to upsert in place.
 *
 * Image values are stored as-is: external http(s) URLs (e.g. Vercel Blob) pass
 * through; local paths like "/product_images/..." are served from the SPA assets.
 */

declare(strict_types=1);

require __DIR__ . '/../includes/bootstrap.php';

$jsonPath = $argv[1] ?? null;
$fresh = in_array('--fresh', $argv, true);
if ($jsonPath === '--fresh') {
    $jsonPath = null;
    $fresh = true;
}

$candidates = array_filter([
    $jsonPath,
    dirname(__DIR__, 1) . '/../react-frontend/public/ProductDetails/Product_list.json',
    dirname(__DIR__, 2) . '/react-frontend/public/ProductDetails/Product_list.json',
]);
$resolved = null;
foreach ($candidates as $c) {
    if ($c && is_file($c)) {
        $resolved = $c;
        break;
    }
}
if (!$resolved) {
    fwrite(STDERR, "ERROR: Product_list.json not found. Pass its path as the first argument.\n");
    exit(1);
}

$data = json_decode((string) file_get_contents($resolved), true);
if (!is_array($data) || !isset($data['products']) || !is_array($data['products'])) {
    fwrite(STDERR, "ERROR: unexpected JSON shape (expected { products: {...}, categoryMeta?: {...} }).\n");
    exit(1);
}

$products = $data['products'];
$categoryMeta = is_array($data['categoryMeta'] ?? null) ? $data['categoryMeta'] : [];
$pdo = db();

echo "Source : $resolved\n";
echo "Mode   : " . ($fresh ? "FRESH (wipe products + categories first)" : "UPSERT (in place)") . "\n";
echo "Found  : " . count($categoryMeta) . " categoryMeta, "
    . array_sum(array_map('count', $products)) . " products\n\n";

if ($fresh) {
    $pdo->exec('SET FOREIGN_KEY_CHECKS=0');
    $pdo->exec('DELETE FROM product_sizes');
    $pdo->exec('DELETE FROM product_images');
    $pdo->exec('DELETE FROM products');
    $pdo->exec('DELETE FROM categories');
    $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
    echo "Wiped existing categories / products / images / sizes.\n\n";
}

// ---------------------------------------------------------------------------
// 1. Categories (from categoryMeta). Upsert so names/icons/images stay current.
//    Any category that has products but no meta gets a minimal row too.
// ---------------------------------------------------------------------------
$allCatSlugs = array_values(array_unique(array_merge(
    array_keys($categoryMeta),
    array_keys($products)
)));

$catUpsert = $pdo->prepare(
    'INSERT INTO categories (slug, name, description, icon, image, sort_order)
     VALUES (:slug, :name, :description, :icon, :image, :sort_order)
     ON DUPLICATE KEY UPDATE
        name = VALUES(name), description = VALUES(description),
        icon = VALUES(icon), image = VALUES(image), sort_order = VALUES(sort_order)'
);

$catCount = 0;
$sort = 0;
foreach ($allCatSlugs as $slug) {
    $m = $categoryMeta[$slug] ?? [];
    $name = trim((string) ($m['name'] ?? '')) ?: ucfirst($slug);
    $description = trim((string) ($m['description'] ?? '')) ?: 'Authentic Ayurvedic remedies.';
    $icon = trim((string) ($m['icon'] ?? '')) ?: 'Leaf';
    $image = trim((string) ($m['image'] ?? '')) ?: null;
    $catUpsert->execute([
        ':slug' => $slug,
        ':name' => $name,
        ':description' => $description,
        ':icon' => $icon,
        ':image' => $image,
        ':sort_order' => $sort++,
    ]);
    $catCount++;
}
echo "Categories imported/updated: $catCount\n\n";

// ---------------------------------------------------------------------------
// 2. Products (via the domain layer: create or update in place).
// ---------------------------------------------------------------------------
$created = $updated = $skipped = $errors = 0;

foreach ($products as $category => $items) {
    if (!is_array($items)) {
        continue;
    }
    foreach ($items as $pid => $p) {
        if (!is_array($p)) {
            continue;
        }
        $p['product_id'] = $p['product_id'] ?? (string) $pid;
        $p['product_category'] = $p['product_category'] ?? (string) $category;
        try {
            $exists = $pdo->prepare('SELECT 1 FROM products WHERE product_id = ? LIMIT 1');
            $exists->execute([$p['product_id']]);
            if ($exists->fetchColumn()) {
                update_product($pdo, $p['product_category'], $p['product_id'], $p);
                $updated++;
            } else {
                create_product($pdo, $p);
                $created++;
            }
        } catch (Throwable $e) {
            $errors++;
            fwrite(STDERR, "  ! {$p['product_id']}: " . $e->getMessage() . "\n");
        }
    }
}

$totalP = (int) $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
$totalC = (int) $pdo->query('SELECT COUNT(*) FROM categories')->fetchColumn();
echo "Products  -> created: $created  updated: $updated  skipped: $skipped  errors: $errors\n";
echo "----------------------------------------\n";
echo "DB now has: $totalC categories, $totalP products\n";
