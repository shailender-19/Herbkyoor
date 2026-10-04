<?php
/**
 * Catalogue domain layer — all product/category DB access + normalization.
 * Public reads return the NORMALIZED shape (matches the frontend); admin returns
 * the RAW shape (matches the admin UI). Every query uses prepared statements.
 */

declare(strict_types=1);

const FALLBACK_IMAGE = 'assets/images/categories/herbal-medicines.svg';

const USAGE_TEXT = 'Use as directed by your Ayurvedic physician. Contact us on WhatsApp for detailed usage and dosage guidance.';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive MRP from a % discount (mirrors originalPriceFrom). */
function original_price_from(float $price, float $discount): ?float
{
    if ($price <= 0 || $discount <= 0 || $discount >= 100) {
        return null;
    }
    return round($price / (1 - $discount / 100));
}

/** Fetch images (ordered) for a set of product_ids -> [pid => [paths]]. */
function fetch_images_map(PDO $pdo, array $ids): array
{
    if (empty($ids)) {
        return [];
    }
    $ph = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("SELECT product_id, path FROM product_images WHERE product_id IN ($ph) ORDER BY sort_order, id");
    $stmt->execute(array_values($ids));
    $map = [];
    foreach ($stmt->fetchAll() as $r) {
        $map[$r['product_id']][] = $r['path'];
    }
    return $map;
}

/** Fetch sizes (ordered) for a set of product_ids -> [pid => [labels]]. */
function fetch_sizes_map(PDO $pdo, array $ids): array
{
    if (empty($ids)) {
        return [];
    }
    $ph = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("SELECT product_id, size_label FROM product_sizes WHERE product_id IN ($ph) ORDER BY sort_order, id");
    $stmt->execute(array_values($ids));
    $map = [];
    foreach ($stmt->fetchAll() as $r) {
        $map[$r['product_id']][] = $r['size_label'];
    }
    return $map;
}

/** A DECIMAL column (string|null from PDO) -> number, or "" when null (raw shape). */
function decimal_to_raw($v)
{
    if ($v === null) {
        return '';
    }
    $f = (float) $v;
    return ($f == (int) $f) ? (int) $f : $f;
}

/** Split a comma/newline-separated text column into a clean list of items. */
function split_list(?string $text): array
{
    if ($text === null || trim($text) === '') {
        return [];
    }
    $parts = preg_split('/[\n,]+/', $text);
    $parts = array_map('trim', $parts);
    return array_values(array_filter($parts, fn ($p) => $p !== ''));
}

// ---------------------------------------------------------------------------
// Public (normalized) reads
// ---------------------------------------------------------------------------

/** Build the normalized product shape from a joined row + its images/sizes. */
function normalize_product(array $row, array $images, array $sizes): array
{
    $label = $row['category_name'] ?? $row['category'];
    $price = $row['price'] !== null ? (float) $row['price'] : 0.0;
    $discount = $row['discount'] !== null ? (float) $row['discount'] : 0.0;
    $originalPrice = original_price_from($price, $discount);

    $imgs = count($images) > 0 ? $images : [FALLBACK_IMAGE];
    $scheme = trim((string) ($row['scheme'] ?? '')) ?: null;
    $desc = trim((string) ($row['description'] ?? ''));
    $ingredients = split_list($row['ingredients'] ?? null);
    $benefits = split_list($row['benefits'] ?? null);
    $safety = trim((string) ($row['safety'] ?? '')) ?: null;

    $info = [];
    if (count($sizes) > 0) {
        $info['Available Sizes'] = implode(', ', $sizes);
    }
    if ($scheme) {
        $info['Offer'] = $scheme;
    }

    return [
        'id'               => $row['product_id'],
        'slug'             => $row['slug'],
        'name'             => $row['name'],
        'category'         => $row['category'],
        'categoryName'     => $label,
        'shortDescription' => $desc !== '' ? $desc : ('Authentic Ayurvedic ' . strtolower($label) . ' remedy.'),
        'description'      => $desc !== '' ? $desc
            : ($row['name'] . ' from our ' . $label . ' range. Full product details are coming soon — enquire on WhatsApp for ingredients, dosage and pricing.'),
        'price'            => $price,
        'originalPrice'    => $originalPrice,
        'rating'           => 0,
        'reviewCount'      => 0,
        'image'            => $imgs[0],
        'images'           => $imgs,
        'sizes'            => count($sizes) > 0 ? $sizes : null,
        'scheme'           => $scheme,
        'ingredients'      => count($ingredients) > 0 ? $ingredients : null,
        'benefits'         => count($benefits) > 0 ? $benefits : null,
        'safety'           => $safety,
        'usage'            => USAGE_TEXT,
        'info'             => count($info) > 0 ? $info : null,
        'inStock'          => true,
        'featured'         => (bool) $row['featured'],
        'tag'              => $scheme,
    ];
}

/** All products, normalized. */
function get_all_products(PDO $pdo): array
{
    $rows = $pdo->query(
        'SELECT p.product_id, p.slug, p.name, p.category, p.price, p.discount, p.scheme,
                p.description, p.ingredients, p.benefits, p.safety, p.featured, c.name AS category_name
         FROM products p
         LEFT JOIN categories c ON c.slug = p.category
         ORDER BY p.featured DESC, p.id'
    )->fetchAll();
    if (empty($rows)) {
        return [];
    }
    $ids = array_column($rows, 'product_id');
    $imgMap = fetch_images_map($pdo, $ids);
    $sizeMap = fetch_sizes_map($pdo, $ids);
    return array_map(
        fn ($r) => normalize_product($r, $imgMap[$r['product_id']] ?? [], $sizeMap[$r['product_id']] ?? []),
        $rows
    );
}

function get_product_by_slug(PDO $pdo, string $slug): ?array
{
    foreach (get_all_products($pdo) as $p) {
        if ($p['slug'] === $slug) {
            return $p;
        }
    }
    return null;
}

function get_product_by_id(PDO $pdo, string $id): ?array
{
    foreach (get_all_products($pdo) as $p) {
        if ($p['id'] === $id) {
            return $p;
        }
    }
    return null;
}

function get_featured_products(PDO $pdo): array
{
    $all = get_all_products($pdo);
    $featured = array_values(array_filter($all, fn ($p) => $p['featured']));
    return count($featured) > 0 ? $featured : array_slice($all, 0, 8);
}

function get_related_products(PDO $pdo, array $product, int $limit = 4): array
{
    $rel = array_filter(get_all_products($pdo), fn ($p) => $p['category'] === $product['category'] && $p['id'] !== $product['id']);
    return array_slice(array_values($rel), 0, max(1, $limit));
}

/** Public categories with product counts + cover-image fallback. */
function get_categories_public(PDO $pdo): array
{
    $cats = $pdo->query('SELECT slug, name, description, icon, image FROM categories ORDER BY sort_order, name')->fetchAll();
    $counts = [];
    foreach ($pdo->query('SELECT category, COUNT(*) n FROM products GROUP BY category')->fetchAll() as $r) {
        $counts[$r['category']] = (int) $r['n'];
    }
    $out = [];
    foreach ($cats as $c) {
        $image = $c['image'];
        if (!$image) {
            $stmt = $pdo->prepare(
                'SELECT i.path FROM product_images i JOIN products p ON p.product_id = i.product_id
                 WHERE p.category = ? ORDER BY p.id, i.sort_order LIMIT 1'
            );
            $stmt->execute([$c['slug']]);
            $image = $stmt->fetchColumn() ?: FALLBACK_IMAGE;
        }
        $out[] = [
            'slug'         => $c['slug'],
            'name'         => $c['name'],
            'description'  => $c['description'],
            'icon'         => $c['icon'],
            'image'        => $image,
            'productCount' => $counts[$c['slug']] ?? 0,
        ];
    }
    return $out;
}

// ---------------------------------------------------------------------------
// Admin (raw) reads
// ---------------------------------------------------------------------------

/** Raw product shape for the admin UI. */
function raw_product(array $row, array $images, array $sizes): array
{
    return [
        'product_id'              => $row['product_id'],
        'product_name'            => $row['name'],
        'product_price'           => decimal_to_raw($row['price']),
        'product_category'        => $row['category'],
        'product_image_path_list' => array_values($images),
        'size_available'          => array_values($sizes),
        'product_description'     => (string) ($row['description'] ?? ''),
        'product_ingredients'     => (string) ($row['ingredients'] ?? ''),
        'product_benefits'        => (string) ($row['benefits'] ?? ''),
        'product_safety'          => (string) ($row['safety'] ?? ''),
        'discount'                => decimal_to_raw($row['discount']),
        'sceme'                   => (string) ($row['scheme'] ?? ''),
    ];
}

/** Full catalogue snapshot for the admin dashboard. */
function admin_catalog(PDO $pdo): array
{
    $cats = $pdo->query('SELECT slug, name, description, icon, image FROM categories ORDER BY sort_order, name')->fetchAll();
    $rows = $pdo->query('SELECT product_id, name, price, category, description, ingredients, benefits, safety, discount, scheme FROM products ORDER BY id')->fetchAll();
    $ids = array_column($rows, 'product_id');
    $imgMap = fetch_images_map($pdo, $ids);
    $sizeMap = fetch_sizes_map($pdo, $ids);

    $byCat = [];
    foreach ($rows as $r) {
        $byCat[$r['category']][] = raw_product($r, $imgMap[$r['product_id']] ?? [], $sizeMap[$r['product_id']] ?? []);
    }

    $out = [];
    foreach ($cats as $c) {
        $products = $byCat[$c['slug']] ?? [];
        $out[] = [
            'slug'         => $c['slug'],
            'meta'         => [
                'name'        => $c['name'],
                'description' => $c['description'],
                'icon'        => $c['icon'],
                'image'       => $c['image'] ?? '',
            ],
            'productCount' => count($products),
            'products'     => $products,
        ];
    }
    return $out;
}

/** Fetch one raw product (or null) scoped to a category. */
function fetch_raw_product(PDO $pdo, string $category, string $id): ?array
{
    $stmt = $pdo->prepare('SELECT product_id, name, price, category, description, ingredients, benefits, safety, discount, scheme FROM products WHERE product_id = ? AND category = ? LIMIT 1');
    $stmt->execute([$id, $category]);
    $row = $stmt->fetch();
    if (!$row) {
        return null;
    }
    $imgMap = fetch_images_map($pdo, [$id]);
    $sizeMap = fetch_sizes_map($pdo, [$id]);
    return raw_product($row, $imgMap[$id] ?? [], $sizeMap[$id] ?? []);
}

// ---------------------------------------------------------------------------
// Slug / id generation
// ---------------------------------------------------------------------------

function unique_product_slug(PDO $pdo, string $name, string $productId, ?string $ignoreId = null): string
{
    $base = slugify_product($name) ?: slugify_product($productId);
    if ($base === '') {
        $base = strtolower($productId);
    }
    $slug = $base;
    $stmt = $pdo->prepare('SELECT 1 FROM products WHERE slug = ? AND product_id <> ? LIMIT 1');
    $stmt->execute([$slug, $ignoreId ?? '']);
    if ($stmt->fetchColumn()) {
        $slug = $base . '-' . strtolower($productId);
    }
    // Final guard: append -n until unique.
    $n = 2;
    while (true) {
        $stmt->execute([$slug, $ignoreId ?? '']);
        if (!$stmt->fetchColumn()) {
            return $slug;
        }
        $slug = $base . '-' . $n++;
    }
}

function next_product_id(PDO $pdo, string $category): string
{
    $prefix = strtoupper(preg_replace('/[^a-zA-Z]/', '', $category));
    $prefix = substr($prefix, 0, 3);
    $prefix = str_pad($prefix !== '' ? $prefix : 'PRD', 3, 'X');
    $existing = $pdo->query('SELECT product_id FROM products')->fetchAll(PDO::FETCH_COLUMN);
    $existing = array_flip($existing);
    $catCount = (int) $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
    $n = $catCount + 1;
    do {
        $id = $prefix . str_pad((string) $n, 3, '0', STR_PAD_LEFT);
        $n++;
    } while (isset($existing[$id]));
    return $id;
}

// ---------------------------------------------------------------------------
// Image file cleanup (only removes files we actually uploaded)
// ---------------------------------------------------------------------------

/** Delete an uploaded image file. Bundled assets/ paths are left untouched. */
function delete_image_file(?string $path): void
{
    $p = trim((string) $path);
    $base = app_config()['app']['upload_url_base']; // e.g. "uploads/products"
    // Only touch files under our upload base; ignore http(s) and bundled assets.
    if ($p === '' || preg_match('#^https?://#i', $p)) {
        return;
    }
    $rel = ltrim($p, '/');
    if (strpos($rel, $base . '/') !== 0) {
        return;
    }
    $uploadRoot = realpath(app_config()['app']['upload_dir']);
    // rel is "uploads/products/<folder>/<file>"; strip the base to get "<folder>/<file>".
    $suffix = substr($rel, strlen($base) + 1);
    $full = $uploadRoot . '/' . $suffix;
    $real = realpath($full);
    if ($real && $uploadRoot && strpos($real, $uploadRoot . DIRECTORY_SEPARATOR) === 0 && is_file($real)) {
        @unlink($real);
    }
}

function delete_image_files(array $paths): void
{
    foreach ($paths as $p) {
        delete_image_file($p);
    }
}

// ---------------------------------------------------------------------------
// Category mutations
// ---------------------------------------------------------------------------

function category_exists(PDO $pdo, string $slug): bool
{
    $stmt = $pdo->prepare('SELECT 1 FROM categories WHERE slug = ? LIMIT 1');
    $stmt->execute([$slug]);
    return (bool) $stmt->fetchColumn();
}

function create_category(PDO $pdo, array $input): array
{
    $name = require_string($input['name'] ?? null, 'name');
    $slug = trim((string) ($input['slug'] ?? '')) ?: slugify_category($name);
    if ($slug === '') {
        throw new ApiError('Could not derive a category slug.', 400);
    }
    if (category_exists($pdo, $slug)) {
        throw new ApiError("Category \"$slug\" already exists.", 409);
    }
    $icon = (isset($input['icon']) && in_array($input['icon'], SUPPORTED_ICONS, true)) ? $input['icon'] : 'Leaf';
    $description = trim((string) ($input['description'] ?? '')) ?: 'Authentic Ayurvedic remedies.';
    $image = trim((string) ($input['image'] ?? '')) ?: null;

    $stmt = $pdo->prepare('INSERT INTO categories (slug, name, description, icon, image, sort_order) VALUES (?,?,?,?,?, (SELECT COALESCE(MAX(sort_order)+1,0) FROM categories c))');
    $stmt->execute([$slug, $name, $description, $icon, $image]);

    return admin_category_view($pdo, $slug);
}

function update_category(PDO $pdo, array $input): array
{
    $slug = require_string($input['slug'] ?? null, 'slug');
    $stmt = $pdo->prepare('SELECT name, description, icon, image FROM categories WHERE slug = ? LIMIT 1');
    $stmt->execute([$slug]);
    $cur = $stmt->fetch();
    if (!$cur) {
        throw new ApiError("Category \"$slug\" not found.", 404);
    }
    $name = trim((string) ($input['name'] ?? '')) ?: $cur['name'];
    $description = trim((string) ($input['description'] ?? '')) ?: ($cur['description'] ?: 'Authentic Ayurvedic remedies.');
    $icon = (isset($input['icon']) && in_array($input['icon'], SUPPORTED_ICONS, true)) ? $input['icon'] : ($cur['icon'] ?: 'Leaf');
    // image: provided string replaces/clears; omitted keeps current.
    $nextImage = array_key_exists('image', $input) ? (trim((string) $input['image']) ?: null) : $cur['image'];

    $upd = $pdo->prepare('UPDATE categories SET name = ?, description = ?, icon = ?, image = ? WHERE slug = ?');
    $upd->execute([$name, $description, $icon, $nextImage, $slug]);

    // A replaced/cleared cover image that we uploaded is now orphaned.
    if ($cur['image'] && $cur['image'] !== $nextImage) {
        delete_image_file($cur['image']);
    }
    return admin_category_view($pdo, $slug);
}

function delete_category(PDO $pdo, string $slug): void
{
    $stmt = $pdo->prepare('SELECT image FROM categories WHERE slug = ? LIMIT 1');
    $stmt->execute([$slug]);
    $cur = $stmt->fetch();
    if (!$cur) {
        throw new ApiError("Category \"$slug\" not found.", 404);
    }
    // Collect owned images (product images + cover) for file cleanup.
    $imgStmt = $pdo->prepare('SELECT i.path FROM product_images i JOIN products p ON p.product_id = i.product_id WHERE p.category = ?');
    $imgStmt->execute([$slug]);
    $images = $imgStmt->fetchAll(PDO::FETCH_COLUMN);
    if ($cur['image']) {
        $images[] = $cur['image'];
    }
    // FK ON DELETE CASCADE removes products/images/sizes rows.
    $pdo->prepare('DELETE FROM categories WHERE slug = ?')->execute([$slug]);
    delete_image_files($images);
}

/** Admin view of a single category (meta + product count + raw products). */
function admin_category_view(PDO $pdo, string $slug): array
{
    $stmt = $pdo->prepare('SELECT name, description, icon, image FROM categories WHERE slug = ? LIMIT 1');
    $stmt->execute([$slug]);
    $c = $stmt->fetch();
    $rows = $pdo->prepare('SELECT product_id, name, price, category, description, ingredients, benefits, safety, discount, scheme FROM products WHERE category = ? ORDER BY id');
    $rows->execute([$slug]);
    $rows = $rows->fetchAll();
    $ids = array_column($rows, 'product_id');
    $imgMap = fetch_images_map($pdo, $ids);
    $sizeMap = fetch_sizes_map($pdo, $ids);
    $products = array_map(fn ($r) => raw_product($r, $imgMap[$r['product_id']] ?? [], $sizeMap[$r['product_id']] ?? []), $rows);
    return [
        'slug'         => $slug,
        'meta'         => ['name' => $c['name'], 'description' => $c['description'], 'icon' => $c['icon'], 'image' => $c['image'] ?? ''],
        'productCount' => count($products),
        'products'     => $products,
    ];
}

// ---------------------------------------------------------------------------
// Product mutations
// ---------------------------------------------------------------------------

/** Replace the image + size child rows for a product. */
function replace_children(PDO $pdo, string $id, array $images, array $sizes): void
{
    $pdo->prepare('DELETE FROM product_images WHERE product_id = ?')->execute([$id]);
    $pdo->prepare('DELETE FROM product_sizes WHERE product_id = ?')->execute([$id]);
    $imgIns = $pdo->prepare('INSERT INTO product_images (product_id, path, sort_order) VALUES (?,?,?)');
    foreach ($images as $i => $path) {
        $imgIns->execute([$id, $path, $i]);
    }
    $sizeIns = $pdo->prepare('INSERT INTO product_sizes (product_id, size_label, sort_order) VALUES (?,?,?)');
    foreach ($sizes as $i => $label) {
        $sizeIns->execute([$id, $label, $i]);
    }
}

function create_product(PDO $pdo, array $input): array
{
    $category = require_string($input['product_category'] ?? null, 'product_category');
    if (!category_exists($pdo, $category)) {
        throw new ApiError("Category \"$category\" not found.", 404);
    }
    $name = require_string($input['product_name'] ?? null, 'product_name');
    $id = trim((string) ($input['product_id'] ?? ''));
    if ($id === '') {
        $id = next_product_id($pdo, $category);
    }
    $exists = $pdo->prepare('SELECT 1 FROM products WHERE product_id = ? LIMIT 1');
    $exists->execute([$id]);
    if ($exists->fetchColumn()) {
        throw new ApiError("Product id \"$id\" already exists.", 409);
    }

    $images = string_list($input['product_image_path_list'] ?? []);
    $sizes = string_list($input['size_available'] ?? []);
    $slug = unique_product_slug($pdo, $name, $id);

    $pdo->beginTransaction();
    try {
        $pdo->prepare('INSERT INTO products (product_id, slug, name, category, price, discount, scheme, description, ingredients, benefits, safety) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
            ->execute([
                $id, $slug, $name, $category,
                parse_number_or_null($input['product_price'] ?? null),
                parse_number_or_null($input['discount'] ?? null),
                trim((string) ($input['sceme'] ?? '')) ?: null,
                trim((string) ($input['product_description'] ?? '')) ?: null,
                trim((string) ($input['product_ingredients'] ?? '')) ?: null,
                trim((string) ($input['product_benefits'] ?? '')) ?: null,
                trim((string) ($input['product_safety'] ?? '')) ?: null,
            ]);
        replace_children($pdo, $id, $images, $sizes);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    return fetch_raw_product($pdo, $category, $id);
}

function update_product(PDO $pdo, string $category, string $id, array $input): array
{
    $existing = fetch_raw_product($pdo, $category, $id);
    if (!$existing) {
        throw new ApiError("Product \"$id\" not found in \"$category\".", 404);
    }
    $target = require_string($input['product_category'] ?? $category, 'product_category');
    if (!category_exists($pdo, $target)) {
        throw new ApiError("Category \"$target\" not found.", 404);
    }
    if ($target !== $category) {
        $clash = $pdo->prepare('SELECT 1 FROM products WHERE product_id = ? AND category = ? LIMIT 1');
        $clash->execute([$id, $target]);
        if ($clash->fetchColumn()) {
            throw new ApiError("Product id \"$id\" already exists in \"$target\".", 409);
        }
    }
    $name = require_string($input['product_name'] ?? null, 'product_name');
    $images = string_list($input['product_image_path_list'] ?? []);
    $sizes = string_list($input['size_available'] ?? []);
    // Images present before but not after -> delete their files.
    $removed = array_diff($existing['product_image_path_list'], $images);
    $slug = unique_product_slug($pdo, $name, $id, $id);

    $pdo->beginTransaction();
    try {
        $pdo->prepare('UPDATE products SET slug=?, name=?, category=?, price=?, discount=?, scheme=?, description=?, ingredients=?, benefits=?, safety=? WHERE product_id=?')
            ->execute([
                $slug, $name, $target,
                parse_number_or_null($input['product_price'] ?? null),
                parse_number_or_null($input['discount'] ?? null),
                trim((string) ($input['sceme'] ?? '')) ?: null,
                trim((string) ($input['product_description'] ?? '')) ?: null,
                trim((string) ($input['product_ingredients'] ?? '')) ?: null,
                trim((string) ($input['product_benefits'] ?? '')) ?: null,
                trim((string) ($input['product_safety'] ?? '')) ?: null,
                $id,
            ]);
        replace_children($pdo, $id, $images, $sizes);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    delete_image_files($removed);
    return fetch_raw_product($pdo, $target, $id);
}

function delete_product(PDO $pdo, string $category, string $id): void
{
    $existing = fetch_raw_product($pdo, $category, $id);
    if (!$existing) {
        throw new ApiError("Product \"$id\" not found in \"$category\".", 404);
    }
    $pdo->prepare('DELETE FROM products WHERE product_id = ? AND category = ?')->execute([$id, $category]);
    delete_image_files($existing['product_image_path_list']);
}
