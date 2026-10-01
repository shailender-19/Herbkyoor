-- ============================================================
-- HerbKyoor Ayurveda — Database schema (MariaDB / MySQL)
-- Import once into an empty database. See DEPLOYMENT.md.
--   mysql -u <user> -p <dbname> < database/schema.sql
-- ============================================================

SET NAMES utf8mb4;
SET foreign_key_checks = 0;

-- ---- Categories -------------------------------------------------
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug         VARCHAR(64)  NOT NULL,                 -- business key, e.g. "heart", "kneePain"
    name         VARCHAR(128) NOT NULL,
    description  VARCHAR(255) NOT NULL DEFAULT 'Authentic Ayurvedic remedies.',
    icon         VARCHAR(48)  NOT NULL DEFAULT 'Leaf',  -- Lucide icon name (SUPPORTED_ICONS)
    image        VARCHAR(255) NULL,                     -- cover image path (nullable)
    sort_order   INT          NOT NULL DEFAULT 0,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Products ---------------------------------------------------
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    product_id   VARCHAR(32)   NOT NULL,                -- business id, e.g. "HRT001"
    slug         VARCHAR(200)  NOT NULL,                -- URL slug (unique)
    name         VARCHAR(255)  NOT NULL,
    category     VARCHAR(64)   NOT NULL,                -- FK -> categories.slug
    price        DECIMAL(10,2) NULL,                    -- NULL = "not set" (shown as blank / 0)
    discount     DECIMAL(5,2)  NULL,                    -- percentage; NULL = none
    scheme       VARCHAR(160)  NULL,                    -- legacy "sceme" (promo text)
    description  TEXT          NULL,
    featured     TINYINT(1)    NOT NULL DEFAULT 0,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_products_product_id (product_id),
    UNIQUE KEY uq_products_slug (slug),
    KEY idx_products_category (category),
    KEY idx_products_featured (featured),
    CONSTRAINT fk_products_category
        FOREIGN KEY (category) REFERENCES categories (slug)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Product images (ordered, 1-N) ------------------------------
DROP TABLE IF EXISTS product_images;
CREATE TABLE product_images (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    product_id   VARCHAR(32)  NOT NULL,                 -- FK -> products.product_id
    path         VARCHAR(255) NOT NULL,                 -- web path (relative to web root)
    sort_order   INT          NOT NULL DEFAULT 0,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_product_images_product (product_id),
    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id) REFERENCES products (product_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Product sizes (1-N) ----------------------------------------
DROP TABLE IF EXISTS product_sizes;
CREATE TABLE product_sizes (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    product_id   VARCHAR(32)  NOT NULL,                 -- FK -> products.product_id
    size_label   VARCHAR(64)  NOT NULL,
    sort_order   INT          NOT NULL DEFAULT 0,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_product_sizes_product (product_id),
    CONSTRAINT fk_product_sizes_product
        FOREIGN KEY (product_id) REFERENCES products (product_id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Admin users ------------------------------------------------
DROP TABLE IF EXISTS admin_users;
CREATE TABLE admin_users (
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username      VARCHAR(64)  NOT NULL,
    password_hash VARCHAR(255) NOT NULL,                -- password_hash() output (bcrypt/argon)
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_admin_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Newsletter subscribers -------------------------------------
DROP TABLE IF EXISTS newsletter_subscribers;
CREATE TABLE newsletter_subscribers (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    email        VARCHAR(255) NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_newsletter_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- Contact messages -------------------------------------------
DROP TABLE IF EXISTS contact_messages;
CREATE TABLE contact_messages (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name         VARCHAR(128) NOT NULL,
    email        VARCHAR(255) NOT NULL,
    phone        VARCHAR(32)  NULL,
    message      TEXT         NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_contact_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET foreign_key_checks = 1;
