# Deployment — HostyCare (or any cPanel / shared PHP hosting)

This guide assumes you are **not** a PHP expert. Follow the steps in order.

**Result:** the static frontend and the PHP API run together under one domain, e.g.
`https://yourdomain.com/` (frontend) and `https://yourdomain.com/api/...` (backend),
same origin — no CORS needed.

> Requirements on the host: **PHP 8.0+** with `pdo_mysql` (standard on HostyCare)
> and a **MariaDB/MySQL** database. No Node.js is required.

---

## Overview of the final layout on the server

Upload everything into your site's web root (usually **`public_html`**) so it looks
like this:

```
public_html/
├── index.html  products.html  product-details.html  about.html …   ← from frontend/
├── css/  js/  assets/  data/                                        ← from frontend/
├── admin/                                                           ← from frontend/
├── api/            products/ categories/ admin/ contact/ newsletter/← from backend/
├── includes/       (protected)                                      ← from backend/
├── config/         (protected — holds DB credentials)              ← from backend/
├── uploads/        products/ (writable, no code execution)         ← from backend/
└── database/       schema.sql seed.sql (optional to upload)        ← from backend/
```

In short: **upload the contents of `frontend/` AND the contents of `backend/` into
the same `public_html`.** They don't overlap.

---

## Step 1 — Create the MariaDB database (cPanel → "MySQL® Databases")

1. Under **Create New Database**, enter a name, e.g. `herbkyoor`. cPanel prefixes it
   with your account, so the real name becomes something like `cpuser_herbkyoor`.
   Click **Create Database**. Note the full name.

## Step 2 — Create a database user

1. Under **MySQL Users → Add New User**, create a user, e.g. `herb`.
   Real name becomes `cpuser_herb`. Use a **strong password** and note it.
2. Click **Create User**.

## Step 3 — Give the user permission on the database

1. Under **Add User To Database**, pick the user and the database, click **Add**.
2. On the privileges page, tick **ALL PRIVILEGES**, then **Make Changes**.

## Step 4 — Import the schema and seed data (cPanel → phpMyAdmin)

1. Open **phpMyAdmin**, select your database (`cpuser_herbkyoor`) in the left list.
2. Click the **Import** tab → **Choose File** → select `database/schema.sql` → **Go**.
   You should see the 7 tables created.
3. Import again with `database/seed.sql` (categories, products, images, sizes, and the
   default admin user). *(Skip the seed if you want to start empty — but then create
   an admin user, see Step 8.)*

*Command-line alternative (if you have SSH):*
```bash
mysql -u cpuser_herb -p cpuser_herbkyoor < database/schema.sql
mysql -u cpuser_herb -p cpuser_herbkyoor < database/seed.sql
```

## Step 5 — Configure the database credentials

1. Copy the template and edit it:
   `config/config.sample.php` → **`config/config.local.php`**.
2. Fill in your real values:
   ```php
   'db' => [
       'host'    => 'localhost',          // HostyCare: almost always "localhost"
       'name'    => 'cpuser_herbkyoor',
       'user'    => 'cpuser_herb',
       'pass'    => 'your-strong-password',
       'charset' => 'utf8mb4',
   ],
   'app' => [
       'env'           => 'production',
       'cookie_secure' => true,           // set true because the site is HTTPS
       // upload_dir / upload_url_base can stay as-is
   ],
   ```
3. `config/config.local.php` is **never** web-accessible (blocked by `config/.htaccess`)
   and holds the only copy of your DB password. Never put it in any JS file.

## Step 6 — Upload the files by FTP

1. Connect with FileZilla (host, FTP user, password from cPanel).
2. Upload the **contents of `frontend/`** into `public_html/`.
3. Upload the **contents of `backend/`** into `public_html/` (adds `api/`,
   `includes/`, `config/`, `uploads/`, `database/`). They merge cleanly.
4. Make sure the hidden `.htaccess` files uploaded too (FileZilla → Server → *Force
   showing hidden files*). They protect `config/`, `includes/`, `database/` and stop
   code execution in `uploads/`.

## Step 7 — Create the upload directory and set permissions

1. `uploads/` and `uploads/products/` must exist and be **writable by PHP**.
   In cPanel **File Manager**, right-click each → **Change Permissions** → `755`
   (some hosts need `775`). The `.htaccess` inside `uploads/` already disables PHP
   execution there.
2. `config/`, `includes/`, `database/` can stay `755`; their files `644`.

## Step 8 — (If you skipped the seed) create an admin user

The seed creates `admin` / `admin123`. **Change it immediately** (Step 10). If you
imported only the schema, insert an admin: run this once in phpMyAdmin **SQL** tab
after generating a hash. Easiest: temporarily create `public_html/hash.php` with
`<?php echo password_hash('YourNewPassword', PASSWORD_DEFAULT);` , open it in the
browser, copy the output, then:
```sql
INSERT INTO admin_users (username, password_hash) VALUES ('admin', 'PASTE_HASH_HERE');
```
Then **delete `hash.php`**.

## Step 9 — Test the APIs

Open these in your browser (should return JSON):
- `https://yourdomain.com/api/products/list.php` → `{"success":true,"products":[…]}`
- `https://yourdomain.com/api/categories/list.php` → `{"success":true,"categories":[…]}`

Open the site:
- `https://yourdomain.com/` → the storefront. By default it reads the bundled JSON
  snapshot. **To serve live data from the database, edit `js/config.js` and set
  `USE_STATIC_DATA: false`.** Re-upload `js/config.js`. Reload — products/categories
  now come from MySQL.

## Step 10 — Test CRUD (admin) and change the password

1. Go to `https://yourdomain.com/admin/` → sign in (`admin` / `admin123` if seeded).
2. Add/edit/delete a category and a product, upload an image — confirm it saves.
3. **Change the admin password**: use the `hash.php` trick from Step 8 to generate a
   new hash, then in phpMyAdmin:
   ```sql
   UPDATE admin_users SET password_hash = 'NEW_HASH' WHERE username = 'admin';
   ```

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Site looks **unstyled / empty** | You opened it as a file or from the wrong folder. Load it via `https://yourdomain.com/`. All asset paths are relative and resolve from the web root. |
| `{"error":"Server not configured."}` | `config/config.local.php` is missing. Create it from `config.sample.php` (Step 5). |
| `{"error":"Database connection failed."}` | Wrong DB name/user/password/host in `config.local.php`, or the user lacks privileges (Steps 1–3, 5). On HostyCare host is usually `localhost`. |
| `500` on every API call | Check the host's PHP **error log** (cPanel → Errors). Confirm PHP 8.0+ and `pdo_mysql` enabled. |
| Products page shows a spinner / empty | If `USE_STATIC_DATA:false`, the API isn't reachable — verify `https://yourdomain.com/api/products/list.php` returns JSON. |
| Image upload fails | `uploads/products/` not writable → set `755`/`775` (Step 7). Files > 5 MB are rejected by design; also check PHP `upload_max_filesize`/`post_max_size` in cPanel → *Select PHP Version → Options*. |
| Admin login always fails | Password hash mismatch. Re-set it (Step 10). Ensure cookies aren't blocked; on HTTPS keep `cookie_secure => true`. |
| Uploaded images 404 | Confirm the file exists under `public_html/uploads/products/<folder>/` and the site is at the web root so `/uploads/...` resolves. |
| `403` on write endpoints | Cross-origin blocked. Call the API from the same domain as the site (it is, by default). |

## Security checklist (do before going live)
- [ ] Changed the admin password from `admin123`.
- [ ] `config/config.local.php` present, correct, and **not** downloadable
      (`https://yourdomain.com/config/config.local.php` should be **403/Forbidden**).
- [ ] `https://yourdomain.com/includes/catalog.php` is **403**.
- [ ] `uploads/` cannot execute PHP (uploading a `.php` there must not run).
- [ ] Site served over **HTTPS**, `cookie_secure => true`.
- [ ] Removed any temporary `hash.php`.
