# API Testing

Realistic `curl` tests for every endpoint. These are the exact checks used to
verify the backend (all passing against PHP 8 + MySQL/MariaDB).

## Setup

```bash
# 1. Local DB (once)
mysql -u root -e "CREATE DATABASE herbkyoor_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root herbkyoor_test < database/schema.sql
mysql -u root herbkyoor_test < database/seed.sql
# config/config.local.php already points at herbkyoor_test (root / no password) for local dev.

# 2. Serve the backend (from the backend/ folder)
php -S 127.0.0.1:8200

BASE=http://127.0.0.1:8200/api
ORIGIN='-H Origin:http://127.0.0.1:8200'      # writes require same-origin
JAR=/tmp/cookies.txt                          # admin session cookie jar
```

Response envelope: success → `{"success":true, …}`; error → `{"success":false,
"error":"…","message":"…"}` (both keys carry the same text).

---

## 1. Public reads

```bash
# READ list — expect 200, {"success":true,"products":[… 33 …]}
curl -s "$BASE/products/list.php"

# READ one by slug — 200 {"product":{…}}
curl -s "$BASE/products/get.php?slug=omega-3"

# Invalid ID / slug — 404 {"success":false,"error":"Product not found."}
curl -s -i "$BASE/products/get.php?slug=does-not-exist" | head -1

# Missing param — 400 "\"slug\" or \"id\" is required."
curl -s "$BASE/products/get.php"

# Featured + related
curl -s "$BASE/products/featured.php"
curl -s "$BASE/products/related.php?slug=omega-3&limit=4"

# Categories — 200 {"categories":[… 13 …]}
curl -s "$BASE/categories/list.php"
```

## 2. Admin authentication

```bash
# Not logged in — {"authenticated":false}
curl -s -c $JAR "$BASE/admin/session.php"

# Protected endpoint without auth — 401 {"error":"Unauthorized."}
curl -s -i "$BASE/admin/catalog.php" | head -1

# Wrong password — 401 {"error":"Invalid username or password."}
curl -s -c $JAR $ORIGIN -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"wrong"}' "$BASE/admin/login.php"

# Correct login — 200 {"ok":true}, stores session cookie
curl -s -c $JAR $ORIGIN -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' "$BASE/admin/login.php"

# Now authenticated
curl -s -b $JAR "$BASE/admin/session.php"          # {"authenticated":true}
curl -s -b $JAR "$BASE/admin/catalog.php"          # {"categories":[…],"icons":[…16…]}
```

## 3. Product CRUD (auth)

```bash
# CREATE — 201 {"product":{"product_id":"HEA034",…}}
curl -s -b $JAR $ORIGIN -H 'Content-Type: application/json' -d '{
  "product_name":"Test Tonic","product_category":"heart",
  "product_price":"499","discount":"10","sceme":"Buy 1 Get 1",
  "product_description":"A test product.",
  "product_image_path_list":["uploads/products/heart/x.jpeg"],
  "size_available":["30 Cap","60 Cap"]
}' "$BASE/admin/products/create.php"

# Missing required field — 400 "\"product_name\" is required."
curl -s -b $JAR $ORIGIN -H 'Content-Type: application/json' \
  -d '{"product_category":"heart"}' "$BASE/admin/products/create.php"

# Invalid category — 404 "Category \"nope\" not found."
curl -s -b $JAR $ORIGIN -H 'Content-Type: application/json' \
  -d '{"product_name":"X","product_category":"nope"}' "$BASE/admin/products/create.php"

# UPDATE (also moves category) — 200 {"product":{…"product_category":"blood"…}}
curl -s -b $JAR $ORIGIN -H 'Content-Type: application/json' -d '{
  "category":"heart","id":"HEA034",
  "product":{"product_name":"Test Tonic v2","product_category":"blood",
             "product_price":"550","product_image_path_list":[],"size_available":[]}
}' "$BASE/admin/products/update.php"

# DELETE — 200 {"ok":true}
curl -s -b $JAR $ORIGIN -H 'Content-Type: application/json' \
  -d '{"category":"blood","id":"HEA034"}' "$BASE/admin/products/delete.php"

# Delete missing — 404 "Product \"HEA034\" not found in \"blood\"."
```

## 4. Category CRUD (auth)

```bash
# CREATE (slug auto-derived camelCase) — 201, slug "skinCare"
curl -s -b $JAR $ORIGIN -H 'Content-Type: application/json' \
  -d '{"name":"Skin Care","description":"Herbal skincare.","icon":"Sparkles"}' \
  "$BASE/admin/categories/create.php"

# Duplicate — 409 "Category \"heart\" already exists."
curl -s -b $JAR $ORIGIN -H 'Content-Type: application/json' \
  -d '{"name":"Heart Care","slug":"heart"}' "$BASE/admin/categories/create.php"

# UPDATE — 200
curl -s -b $JAR $ORIGIN -H 'Content-Type: application/json' \
  -d '{"slug":"skinCare","name":"Skin & Beauty","icon":"Flower2"}' \
  "$BASE/admin/categories/update.php"

# DELETE (cascades products/images) — 200 {"ok":true}
curl -s -b $JAR $ORIGIN -H 'Content-Type: application/json' \
  -d '{"slug":"skinCare"}' "$BASE/admin/categories/delete.php"
```

## 5. Image upload (auth)

```bash
# Valid image — 200 {"path":"uploads/products/heart/<name>-<hex>.png"}
curl -s -b $JAR -H 'Origin: http://127.0.0.1:8200' \
  -F "file=@/path/to/photo.png" -F "folder=heart" "$BASE/admin/upload.php"

# Invalid type (a text file renamed .jpeg) — 415 "Unsupported image type: text/plain."
cp notes.txt fake.jpeg
curl -s -b $JAR -H 'Origin: http://127.0.0.1:8200' \
  -F "file=@fake.jpeg" -F "folder=heart" "$BASE/admin/upload.php"

# Too large (> 5 MB) — 413 "Image exceeds the 5 MB size limit."
# No file — 400 "No image file was uploaded."
```

## 6. Public forms

```bash
# Newsletter valid — 200 {"ok":true}; duplicate email — still 200; invalid — 400
curl -s -H 'Content-Type: application/json' -d '{"email":"a@b.com"}' "$BASE/newsletter/subscribe.php"
curl -s -H 'Content-Type: application/json' -d '{"email":"bad"}'     "$BASE/newsletter/subscribe.php"

# Contact valid — 200 {"ok":true}
curl -s -H 'Content-Type: application/json' -d '{
  "name":"Ravi","email":"ravi@example.com","phone":"+91 8750505094",
  "message":"I need help choosing a product please."}' "$BASE/contact/send.php"

# Contact invalid — 400 with a per-field map:
# {"error":"…","fields":{"name":"…","email":"…","phone":"…","message":"…"}}
curl -s -H 'Content-Type: application/json' \
  -d '{"name":"R","email":"bad","phone":"123","message":"short"}' "$BASE/contact/send.php"
```

## 7. Guards & failure modes

```bash
# Method not allowed — 405 (GET on a POST endpoint)
curl -s -i "$BASE/admin/products/create.php" | head -1

# Unauthorized write (no session cookie) — 401 {"error":"Unauthorized."}
curl -s $ORIGIN -H 'Content-Type: application/json' \
  -d '{"product_name":"X","product_category":"heart"}' "$BASE/admin/products/create.php"

# Cross-origin write blocked — 403 (Origin from another host)
curl -s -b $JAR -H 'Origin: http://evil.example' -H 'Content-Type: application/json' \
  -d '{"name":"X"}' "$BASE/admin/categories/create.php"

# Empty database — list endpoints return {"success":true,"products":[]} (no crash).
# Database failure (wrong creds in config.local.php) — 500 {"error":"Database connection failed."}
#   No SQL, stack trace, or path is ever leaked; details go to the server error log.

# Logout — 200 {"ok":true}; afterwards session.php -> {"authenticated":false}
curl -s -b $JAR $ORIGIN -X POST "$BASE/admin/logout.php"
```

## 8. Frontend integration test (browser)

1. Put the frontend + backend under one web root (see `DEPLOYMENT.md`).
2. In `js/config.js` set `USE_STATIC_DATA: false`.
3. Load `/index.html`, `/products.html`, `/product-details.html?slug=omega-3` — the
   pages render from the live API + DB (verified: 13 categories, 33 products, detail
   page, admin login → catalogue CRUD). Watch the browser Network tab: requests hit
   `/api/products/list.php` etc. and return `200`.
