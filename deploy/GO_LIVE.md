# Go Live — HerbsKyoor on cPanel (File Manager)

Your setup: **cPanel shared hosting · upload via File Manager · domain + database already created.**

You have two files in this `deploy/` folder:

| File | What it is |
|------|------------|
| `herbskyoor_public_html.zip` (~18 MB) | Everything that goes into `public_html` — the React build **and** the PHP backend, already merged with the correct `.htaccess`. |
| `herbskyoor_production.sql` | The full database (31 categories, 48 products, admin user) to import. |

Follow the steps in order. Should take ~15 minutes.

---

## Step 1 — Check PHP version (cPanel → "Select PHP Version")
- Set PHP to **8.0 or higher**.
- Make sure the **`pdo_mysql`** extension is ticked (it usually is by default).

## Step 2 — Enable HTTPS / SSL FIRST  ⚠️ important
cPanel → **SSL/TLS Status** → select your domain → **Run AutoSSL**.
Wait until it shows a valid certificate and `https://yourdomain.com` loads.

> Do this **before** Step 3. The site's `.htaccess` forces HTTP→HTTPS; if SSL isn't
> active yet the site would redirect to a broken `https://`. With the cert in place first, you're safe.

## Step 3 — Upload & extract the site files
1. cPanel → **File Manager** → open **`public_html`**.
2. If there's a default `index.html` / placeholder page already there, delete it.
3. Click **Upload**, choose `herbskyoor_public_html.zip`, wait for 100%.
4. Back in File Manager, select the uploaded zip → **Extract** → extract **into `public_html`**.
5. Delete the `.zip` afterwards.
6. Enable **Settings → Show Hidden Files (dotfiles)** so you can see `.htaccess` and `.env`.

After extraction `public_html` should contain: `index.html`, `assets/`, `product_images/`,
`api/`, `includes/`, `config/`, `uploads/`, `database/`, `.htaccess`, `.env`.

## Step 4 — Enter your database credentials
1. In File Manager, open **`public_html/.env`** → **Edit**.
2. Replace the placeholders with your real cPanel MySQL details (from **MySQL Databases**):
   ```env
   DB_HOST=localhost
   DB_NAME=yourcpuser_herbskyoor      # the full DB name (with cPanel prefix)
   DB_USER=yourcpuser_herb           # the DB user you created
   DB_PASS=your-real-db-password
   DB_CHARSET=utf8mb4
   APP_ENV=production
   COOKIE_SECURE=true
   ```
3. **Save.**

> Make sure that DB user is **added to the database** with privileges (MySQL Databases →
> "Add User To Database" → grant ALL, or at least SELECT/INSERT/UPDATE/DELETE).

## Step 5 — Import the database
1. cPanel → **phpMyAdmin** → click your database in the left sidebar (select it first!).
2. Top menu → **Import** → **Choose File** → `herbskyoor_production.sql` → **Go**.
3. You should see the tables created and rows imported (categories, products, images, etc.).

## Step 6 — Set a strong admin password (do NOT skip)
The import includes an admin account, but set a fresh production password.
In phpMyAdmin → **SQL** tab, run:

```sql
UPDATE admin_users
SET password_hash = '$2y$12$aFJfz6D7F3qRzf1/dw9.cOtCt96NiychUfdX4ADgpLcbiI1OHuZ0y'
WHERE username = 'admin';
```

This sets the admin password to:

> **Username:** `admin`
> **Password:** `%TUZh%uoW#*7yThwbjx6`

Save that password in a password manager. (If you prefer your own password, generate a hash
with `php -r "echo password_hash('YourPassword', PASSWORD_DEFAULT);"` and paste that instead.)

## Step 7 — Make the uploads folder writable
In File Manager, select **`public_html/uploads`** and **`public_html/uploads/products`** →
**Permissions** → set to **755** (if admin image upload fails later, try **775**).

---

## Step 8 — Verify it's live  ✅
Open these in your browser:

- [ ] `https://yourdomain.com/` — storefront loads, categories + products show with images
- [ ] Refresh a deep link `https://yourdomain.com/products/omega-3` — **no 404**
- [ ] `https://yourdomain.com/api/products/list.php` — returns product JSON
- [ ] `https://yourdomain.com/.env` — returns **403 Forbidden** (must NOT download)
- [ ] `https://yourdomain.com/config/config.local.php` — **403**
- [ ] `http://yourdomain.com` — redirects to `https://`
- [ ] `https://yourdomain.com/admin` — log in with the credentials above → create / edit / delete
      a test product, upload an image, confirm it appears, then delete it

If all boxes pass — **you're live.** 🎉

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `{"error":"Server not configured."}` or `Database connection failed` | `.env` values wrong, or DB user not added to the DB with privileges (Steps 4–5). |
| Storefront loads but **no images** | Case mismatch or files not extracted. Images live in `public_html/product_images/...` — confirm the folder exists. (Paths were pre-fixed for Linux case-sensitivity.) |
| Refreshing `/products/...` gives 404 | `.htaccess` missing at `public_html/` root — re-check it extracted (enable Show Hidden Files). |
| Admin login fails | Did you run Step 6? Also ensure the site is HTTPS (secure cookie needs it). |
| Site redirects to broken https | SSL not active yet — finish Step 2 (AutoSSL). |

## Updating later
- **Content/products:** just use the `/admin` panel — changes are live instantly (DB-backed).
- **Frontend code changes:** rebuild locally (`npm run build`) and re-upload the new
  `assets/` + `index.html`.
- **Backend code changes:** edit the PHP files directly in File Manager, or re-upload them.
