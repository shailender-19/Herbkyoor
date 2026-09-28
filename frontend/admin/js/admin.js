/*
 * Admin catalogue manager — vanilla-JS port of
 * src/components/admin/admin-client.tsx.
 *
 * Phases: loading → login → panel. Full category + product CRUD with image
 * upload, talking to the PHP admin API documented in API_REQUIREMENTS.md.
 *
 * NOTE: the PHP endpoints are built in the backend phase. Until then the panel
 * loads but API calls will return errors (surfaced in the UI) — that is expected.
 */
(function () {
  "use strict";

  const root = document.getElementById("admin-root");
  const API = (p) => "/admin/" + p; // resolved against API_BASE_URL by Api

  // ---- Icons (lucide path data, extracted from lucide-react) ----
  const ICON = {
    "loader-circle": '<path d="M21 12a9 9 0 1 1-6.219-8.56" />',
    "folder-plus": '<path d="M12 10v6" /><path d="M9 13h6" /><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />',
    plus: '<path d="M5 12h14" /><path d="M12 5v14" />',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" />',
    "trash-2": '<path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />',
    "refresh-cw": '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />',
    "log-out": '<path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />',
    package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" /><path d="M12 22V12" /><polyline points="3.29 7 12 12 20.71 7" /><path d="m7.5 4.27 9 5.15" />',
    "image-plus": '<path d="M16 5h6" /><path d="M19 2v6" /><path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /><circle cx="9" cy="9" r="2" />',
    upload: '<path d="M12 3v12" /><path d="m17 8-5-5-5 5" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />',
    x: '<path d="M18 6 6 18" /><path d="m6 6 12 12" />',
  };
  function icon(name, size, cls, spin) {
    size = size || 18;
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' +
      (cls || spin ? ' class="' + (cls || "") + (spin ? " animate-spin" : "") + '"' : "") +
      ' aria-hidden="true">' + (ICON[name] || "") + "</svg>"
    );
  }

  // ---- Shared class recipes (match components.php / ui/button.tsx) ----
  const BTN = {
    primary: "bg-forest-700 text-cream-50 hover:bg-forest-800 shadow-sm hover:shadow-md",
    outline: "border border-forest-300 text-forest-700 hover:bg-forest-50 bg-transparent",
    ghost: "text-forest-700 hover:bg-forest-50 bg-transparent",
    danger: "bg-red-600 hover:bg-red-700 text-cream-50",
  };
  const SIZE = { sm: "h-9 px-4 text-sm", md: "h-11 px-6 text-sm" };
  function btn(variant, size, extra) {
    const base = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] whitespace-nowrap";
    return base + " " + (BTN[variant] || BTN.primary) + " " + (SIZE[size] || SIZE.md) + " " + (extra || "");
  }
  const FIELD = "w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-base sm:text-sm text-forest-900 placeholder:text-forest-700/40 transition-colors focus:border-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-400/30 disabled:opacity-60";
  const esc = (s) => window.Utils.escapeHtml(s == null ? "" : s);

  // ---- State ----
  let state = { categories: [], icons: [], selected: null, error: null };

  // ---- API helper (uniform result) ----
  async function api(path, init) {
    return window.Api.request(window.Api.url(API(path)), init);
  }

  // =====================================================================
  // Boot
  // =====================================================================
  function boot() {
    renderLoading();
    api("session.php")
      .then(({ data }) => {
        if (data && data.authenticated) loadPanel();
        else renderLogin();
      })
      .catch(() => renderLogin());
  }

  function renderLoading() {
    root.innerHTML =
      '<div class="mx-auto w-full max-w-7xl container-px flex min-h-[60vh] items-center justify-center py-20">' +
      icon("loader-circle", 28, "text-forest-600", true) + "</div>";
  }

  // =====================================================================
  // Login
  // =====================================================================
  function renderLogin() {
    root.innerHTML =
      '<div class="mx-auto w-full max-w-7xl container-px flex min-h-[70vh] items-center justify-center py-16">' +
        '<div class="w-full max-w-sm rounded-2xl border border-cream-300 bg-cream-50 p-8 shadow-sm">' +
          '<div class="mb-6 text-center">' +
            '<span class="text-xs font-semibold uppercase tracking-wider text-forest-500">Admin Area</span>' +
            '<h1 class="mt-1 text-2xl font-bold text-forest-900">Sign in</h1>' +
            '<p class="mt-1 text-sm text-forest-700/60">Manage product categories and items.</p>' +
          "</div>" +
          '<form id="login-form" class="space-y-4">' +
            '<div><label class="mb-1.5 block text-sm font-medium text-forest-800" for="l-user">Username</label><input id="l-user" name="username" autocomplete="username" required class="' + FIELD + '"></div>' +
            '<div><label class="mb-1.5 block text-sm font-medium text-forest-800" for="l-pass">Password</label><input id="l-pass" name="password" type="password" autocomplete="current-password" required class="' + FIELD + '"></div>' +
            '<p id="login-error" class="text-sm font-medium text-red-600" role="alert" hidden></p>' +
            '<button type="submit" class="' + btn("primary", "md", "w-full") + '"><span id="login-spin" hidden>' + icon("loader-circle", 16, "", true) + "</span>Sign in</button>" +
          "</form>" +
        "</div>" +
      "</div>";

    const form = document.getElementById("login-form");
    const errEl = document.getElementById("login-error");
    const spin = document.getElementById("login-spin");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errEl.hidden = true;
      spin.hidden = false;
      const { ok, data } = await api("login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username.value, password: form.password.value }),
      });
      spin.hidden = true;
      if (ok) loadPanel();
      else {
        errEl.textContent = (data && data.error) || "Login failed.";
        errEl.hidden = false;
      }
    });
  }

  // =====================================================================
  // Panel
  // =====================================================================
  async function loadPanel() {
    renderLoading();
    const { ok, data } = await api("catalog.php");
    if (!ok) {
      state.error = (data && data.error) || "Failed to load catalogue.";
      state.categories = [];
    } else {
      state.categories = (data.categories) || [];
      state.icons = (data.icons) || [];
      state.error = null;
      if (!state.selected || !state.categories.some((c) => c.slug === state.selected)) {
        state.selected = state.categories[0] ? state.categories[0].slug : null;
      }
    }
    renderPanel();
  }

  function currentCategory() {
    return state.categories.find((c) => c.slug === state.selected) || null;
  }

  function renderPanel() {
    const total = state.categories.reduce((s, c) => s + (c.productCount || 0), 0);
    const current = currentCategory();

    root.innerHTML =
      '<div class="mx-auto w-full max-w-7xl container-px py-8">' +
        // Header
        '<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">' +
          "<div>" +
            '<span class="text-xs font-semibold uppercase tracking-wider text-forest-500">Admin</span>' +
            '<h1 class="mt-1 text-3xl font-bold sm:text-4xl">Catalogue Management</h1>' +
            '<p class="mt-2 text-sm text-forest-700/60">' + state.categories.length + " categories · " + total + " products · changes are saved to <code class=\"rounded bg-cream-200 px-1 py-0.5 text-xs\">Product_list.json</code></p>" +
          "</div>" +
          '<div class="flex items-center gap-2">' +
            '<button id="btn-refresh" class="' + btn("outline", "sm") + '">' + icon("refresh-cw", 16) + "Refresh</button>" +
            '<button id="btn-logout" class="' + btn("ghost", "sm") + '">' + icon("log-out", 16) + "Logout</button>" +
          "</div>" +
        "</div>" +
        (state.error ? '<p class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">' + esc(state.error) + "</p>" : "") +
        '<div class="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">' +
          renderAside() +
          '<section class="min-w-0">' + (current ? renderProducts(current) : renderNoCategory()) + "</section>" +
        "</div>" +
      "</div>";

    bindPanel();
  }

  function renderAside() {
    let items = state.categories
      .map(
        (c) =>
          '<button type="button" data-select="' + esc(c.slug) + '" class="flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors ' +
          (state.selected === c.slug ? "border-forest-300 bg-forest-50" : "border-cream-300 bg-cream-50 hover:bg-cream-100") + '">' +
          '<span class="min-w-0"><span class="block truncate text-sm font-medium text-forest-800">' + esc(c.meta && c.meta.name ? c.meta.name : c.slug) + "</span>" +
          '<span class="block truncate text-xs text-forest-700/50">' + esc(c.slug) + "</span></span>" +
          '<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none bg-cream-200 text-forest-700">' + (c.productCount || 0) + "</span></button>"
      )
      .join("");
    if (state.categories.length === 0) {
      items = '<p class="rounded-xl border border-dashed border-cream-400 bg-cream-100/60 px-3 py-6 text-center text-sm text-forest-700/50">No categories yet.</p>';
    }
    return (
      '<aside class="space-y-3">' +
        '<div class="flex items-center justify-between">' +
          '<h2 class="text-sm font-semibold uppercase tracking-wide text-forest-700/70">Categories</h2>' +
          '<button id="btn-new-category" class="' + btn("primary", "sm") + '">' + icon("folder-plus", 16) + "New</button>" +
        "</div>" +
        '<div class="space-y-1.5">' + items + "</div>" +
      "</aside>"
    );
  }

  function renderNoCategory() {
    return '<p class="rounded-2xl border border-dashed border-cream-400 bg-cream-100/60 px-4 py-16 text-center text-forest-700/60">Select or create a category to manage its products.</p>';
  }

  function renderProducts(cat) {
    let rows;
    if (!cat.products || cat.products.length === 0) {
      rows = '<p class="bg-cream-50 px-4 py-12 text-center text-sm text-forest-700/50">No products in this category yet.</p>';
    } else {
      rows =
        '<ul class="divide-y divide-cream-200">' +
        cat.products
          .map((p) => {
            const img = (p.product_image_path_list && p.product_image_path_list[0]) || "";
            const thumb = img
              ? '<img src="' + esc(assetUrl(img)) + '" alt="" class="h-full w-full object-cover">'
              : '<span class="flex h-full w-full items-center justify-center text-forest-700/30">' + icon("package", 18) + "</span>";
            const sub = esc(p.product_id) + (p.product_price ? " · ₹" + esc(p.product_price) : "") + (p.discount ? " · " + esc(p.discount) + "% off" : "");
            return (
              '<li class="flex items-center gap-3 bg-cream-50 px-3 py-3 hover:bg-cream-100/60">' +
                '<div class="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-cream-300 bg-cream-100">' + thumb + "</div>" +
                '<div class="min-w-0 flex-1"><p class="truncate font-medium text-forest-800">' + esc(p.product_name) + "</p>" +
                '<p class="truncate text-xs text-forest-700/50">' + sub + "</p></div>" +
                '<div class="flex shrink-0 items-center gap-1.5">' +
                  '<button type="button" data-edit-product="' + esc(p.product_id) + '" aria-label="Edit product" class="flex h-9 w-9 items-center justify-center rounded-lg border border-cream-300 text-forest-700 transition-colors hover:bg-cream-200">' + icon("pencil", 16) + "</button>" +
                  '<button type="button" data-del-product="' + esc(p.product_id) + '" aria-label="Delete product" class="flex h-9 w-9 items-center justify-center rounded-lg border border-cream-300 text-forest-700 transition-colors hover:bg-red-50 hover:text-red-600">' + icon("trash-2", 16) + "</button>" +
                "</div>" +
              "</li>"
            );
          })
          .join("") +
        "</ul>";
    }
    const name = cat.meta && cat.meta.name ? cat.meta.name : cat.slug;
    const desc = cat.meta && cat.meta.description ? cat.meta.description : "No description.";
    return (
      '<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">' +
        '<div class="min-w-0"><h2 class="truncate text-xl font-bold text-forest-900">' + esc(name) + "</h2>" +
        '<p class="truncate text-sm text-forest-700/60">' + esc(desc) + "</p></div>" +
        '<div class="flex shrink-0 items-center gap-2">' +
          '<button id="btn-edit-category" class="' + btn("outline", "sm") + '">' + icon("pencil", 16) + "Edit</button>" +
          '<button id="btn-del-category" class="' + btn("ghost", "sm", "text-red-600 hover:bg-red-50") + '">' + icon("trash-2", 16) + "</button>" +
          '<button id="btn-add-product" class="' + btn("primary", "sm") + '">' + icon("plus", 16) + "Add Product</button>" +
        "</div>" +
      "</div>" +
      '<div class="mt-5 overflow-hidden rounded-2xl border border-cream-300">' + rows + "</div>"
    );
  }

  // Resolve a stored path to a web URL (mirror asset_url for legacy paths).
  function assetUrl(p) {
    if (!p) return "";
    if (/^https?:\/\//i.test(p)) return p;
    const roots = ["/product_images/", "/categories/", "/products/", "/banners/", "/avatars/", "/misc/", "/brand/"];
    // admin/ is one level deep, so reference the shared assets via ../
    for (const r of roots) if (p.indexOf(r) === 0) return "../assets/images" + p;
    return p;
  }

  function bindPanel() {
    const byId = (id) => document.getElementById(id);
    byId("btn-refresh").addEventListener("click", loadPanel);
    byId("btn-logout").addEventListener("click", async () => {
      await api("logout.php", { method: "POST" });
      renderLogin();
    });
    byId("btn-new-category").addEventListener("click", () => openCategoryModal(null));
    root.querySelectorAll("[data-select]").forEach((b) =>
      b.addEventListener("click", () => { state.selected = b.getAttribute("data-select"); renderPanel(); })
    );
    const cat = currentCategory();
    if (cat) {
      byId("btn-edit-category").addEventListener("click", () => openCategoryModal(cat));
      byId("btn-del-category").addEventListener("click", () => confirmDelete({ kind: "category", category: cat }));
      byId("btn-add-product").addEventListener("click", () => openProductModal(cat.slug, null));
      root.querySelectorAll("[data-edit-product]").forEach((b) =>
        b.addEventListener("click", () => {
          const p = cat.products.find((x) => x.product_id === b.getAttribute("data-edit-product"));
          openProductModal(cat.slug, p);
        })
      );
      root.querySelectorAll("[data-del-product]").forEach((b) =>
        b.addEventListener("click", () => {
          const p = cat.products.find((x) => x.product_id === b.getAttribute("data-del-product"));
          confirmDelete({ kind: "product", category: cat.slug, product: p });
        })
      );
    }
  }

  // =====================================================================
  // Modal primitive (port of ui/modal.tsx)
  // =====================================================================
  function openModal(title, bodyHtml, maxW) {
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-[100] flex items-center justify-center p-4";
    overlay.innerHTML =
      '<div class="absolute inset-0 bg-forest-950/50 backdrop-blur-sm" data-modal-backdrop></div>' +
      '<div class="relative z-10 max-h-[90vh] w-full ' + (maxW || "max-w-lg") + ' overflow-y-auto rounded-2xl border border-cream-300 bg-cream-50 p-6 shadow-xl" tabindex="-1">' +
        '<div class="mb-5 flex items-center justify-between gap-4">' +
          '<h2 class="text-xl font-bold text-forest-900">' + esc(title) + "</h2>" +
          '<button type="button" data-modal-close aria-label="Close" class="flex h-9 w-9 items-center justify-center rounded-full text-forest-700 hover:bg-cream-200">' + icon("x", 20) + "</button>" +
        "</div>" +
        '<div data-modal-body>' + bodyHtml + "</div>" +
      "</div>";
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    const close = () => {
      document.body.style.overflow = "";
      overlay.remove();
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    overlay.querySelector("[data-modal-backdrop]").addEventListener("click", close);
    overlay.querySelectorAll("[data-modal-close]").forEach((b) => b.addEventListener("click", close));
    overlay.querySelector("[tabindex]").focus();
    return { overlay, close, body: overlay.querySelector("[data-modal-body]") };
  }

  // =====================================================================
  // Image manager (port of ImageManager)
  // =====================================================================
  function imageManager(container, images, folder, single, onChange) {
    function render() {
      const thumbs = images
        .map(
          (src) =>
            '<div class="group relative h-20 w-20 overflow-hidden rounded-lg border border-cream-300 bg-cream-100">' +
            '<img src="' + esc(assetUrl(src)) + '" alt="" class="h-full w-full object-cover">' +
            '<button type="button" data-remove="' + esc(src) + '" aria-label="Remove image" class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-forest-950/70 text-cream-50 opacity-0 transition-opacity group-hover:opacity-100">' + icon("x", 14) + "</button></div>"
        )
        .join("");
      const uploadLabel = single && images.length > 0 ? "Replace" : "Upload";
      const uploadIcon = single && images.length > 0 ? "upload" : "image-plus";
      container.innerHTML =
        '<div class="flex flex-wrap gap-3">' + thumbs +
          '<button type="button" data-upload class="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-cream-400 text-forest-600 transition-colors hover:bg-cream-100 disabled:opacity-60">' +
            '<span data-upload-idle>' + icon(uploadIcon, 18) + '<span class="mt-1 block text-[11px] font-medium">' + uploadLabel + "</span></span>" +
            '<span data-upload-busy hidden>' + icon("loader-circle", 18, "", true) + "</span>" +
          "</button>" +
        "</div>" +
        '<input type="file" accept="image/*"' + (single ? "" : " multiple") + ' hidden data-file>' +
        '<p data-upload-error class="mt-2 text-xs font-medium text-red-600" role="alert" hidden></p>' +
        '<p class="mt-2 text-xs text-forest-700/50">PNG, JPG, WEBP, GIF, SVG or AVIF · up to 5 MB · saved to <code class="rounded bg-cream-200 px-1 py-0.5">/product_images/' + esc(folder || "misc") + "</code></p>";

      const fileInput = container.querySelector("[data-file]");
      container.querySelector("[data-upload]").addEventListener("click", () => fileInput.click());
      container.querySelectorAll("[data-remove]").forEach((b) =>
        b.addEventListener("click", () => { images = images.filter((i) => i !== b.getAttribute("data-remove")); onChange(images); render(); })
      );
      fileInput.addEventListener("change", () => upload(fileInput.files));
    }

    async function upload(files) {
      if (!files || files.length === 0) return;
      const idle = container.querySelector("[data-upload-idle]");
      const busy = container.querySelector("[data-upload-busy]");
      const errEl = container.querySelector("[data-upload-error]");
      idle.hidden = true; busy.hidden = false; errEl.hidden = true;
      const added = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder || "misc");
        const { ok, data } = await api("upload.php", { method: "POST", body: fd });
        if (ok && data && typeof data.path === "string") added.push(data.path);
        else { errEl.textContent = (data && data.error) || "Upload failed."; errEl.hidden = false; break; }
      }
      if (added.length) {
        images = single ? [added[added.length - 1]] : images.concat(added);
        onChange(images);
      }
      render();
    }

    render();
  }

  // =====================================================================
  // Product modal (port of ProductModal)
  // =====================================================================
  function openProductModal(category, product) {
    const isEdit = !!product;
    const p = product || {};
    const catOptions = state.categories
      .map((c) => '<option value="' + esc(c.slug) + '"' + ((p.product_category || category) === c.slug ? " selected" : "") + ">" + esc(c.meta && c.meta.name ? c.meta.name : c.slug) + "</option>")
      .join("");
    let images = (p.product_image_path_list || []).slice();

    const body =
      '<form id="product-form" class="space-y-4">' +
        field("Product name", '<input name="product_name" required value="' + esc(p.product_name) + '" class="' + FIELD + '">') +
        '<div class="grid gap-4 sm:grid-cols-2">' +
          field("Price (₹)", '<input name="product_price" inputmode="numeric" value="' + esc(p.product_price) + '" class="' + FIELD + '">', "Leave blank if not set") +
          field("Discount (%)", '<input name="discount" inputmode="numeric" value="' + esc(p.discount) + '" class="' + FIELD + '">') +
          field("Category", '<select name="product_category" class="' + FIELD + ' cursor-pointer pr-10">' + catOptions + "</select>") +
          field("Scheme / Offer", '<input name="sceme" value="' + esc(p.sceme) + '" class="' + FIELD + '">', 'e.g. "Buy 1 Get 1"') +
        "</div>" +
        field("Sizes available", '<textarea name="sizes" rows="2" class="' + FIELD + ' min-h-16 resize-y">' + esc((p.size_available || []).join(", ")) + "</textarea>", "Comma separated, e.g. 30 Capsule, 60 Capsule") +
        '<div><span class="mb-1.5 block text-sm font-medium text-forest-800">Product images</span><div data-image-manager></div></div>' +
        field("Description", '<textarea name="product_description" rows="3" class="' + FIELD + ' min-h-20 resize-y">' + esc(p.product_description) + "</textarea>") +
        '<p id="product-error" class="text-sm font-medium text-red-600" role="alert" hidden></p>' +
        '<div class="flex justify-end gap-3 pt-1">' +
          '<button type="button" data-modal-close class="' + btn("outline", "md") + '">Cancel</button>' +
          '<button type="submit" class="' + btn("primary", "md") + '"><span id="product-spin" hidden>' + icon("loader-circle", 16, "", true) + "</span>" + (isEdit ? "Save Changes" : "Add Product") + "</button>" +
        "</div>" +
      "</form>";

    const m = openModal(isEdit ? "Edit Product" : "Add Product", body);
    const form = m.body.querySelector("#product-form");
    const errEl = m.body.querySelector("#product-error");
    const spin = m.body.querySelector("#product-spin");
    const imWrap = m.body.querySelector("[data-image-manager]");
    const catSelect = form.product_category;

    imageManager(imWrap, images, catSelect.value, false, (next) => { images = next; });
    catSelect.addEventListener("change", () => imageManager(imWrap, images, catSelect.value, false, (next) => { images = next; }));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errEl.hidden = true; spin.hidden = false;
      const payload = {
        product_name: form.product_name.value,
        product_price: form.product_price.value,
        product_category: form.product_category.value,
        discount: form.discount.value,
        sceme: form.sceme.value,
        product_description: form.product_description.value,
        product_image_path_list: images,
        size_available: toList(form.sizes.value),
      };
      const res = isEdit
        ? await api("products/update.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category: category, id: product.product_id, product: payload }) })
        : await api("products/create.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      spin.hidden = true;
      if (res.ok) { m.close(); loadPanel(); }
      else { errEl.textContent = (res.data && res.data.error) || "Save failed."; errEl.hidden = false; }
    });
  }

  // =====================================================================
  // Category modal (port of CategoryModal)
  // =====================================================================
  function openCategoryModal(category) {
    const isEdit = !!category;
    const meta = (category && category.meta) || {};
    let image = meta.image || "";
    const iconOptions = state.icons.map((n) => '<option value="' + esc(n) + '"' + ((meta.icon || state.icons[0]) === n ? " selected" : "") + ">" + esc(n) + "</option>").join("");

    const body =
      '<form id="category-form" class="space-y-4">' +
        field("Display name", '<input name="name" required value="' + esc(meta.name) + '" class="' + FIELD + '">', 'Shown on the storefront, e.g. "Heart Care"') +
        (isEdit
          ? '<p class="text-xs text-forest-700/50">Slug: <code class="rounded bg-cream-200 px-1 py-0.5">' + esc(category.slug) + "</code> (cannot be changed)</p>"
          : field("Slug (optional)", '<input name="slug" class="' + FIELD + '">', "Auto-derived from the name if left blank")) +
        field("Description", '<textarea name="description" rows="2" class="' + FIELD + ' min-h-16 resize-y">' + esc(meta.description) + "</textarea>") +
        field("Icon", '<select name="icon" class="' + FIELD + ' cursor-pointer pr-10">' + iconOptions + "</select>") +
        '<div><span class="mb-1.5 block text-sm font-medium text-forest-800">Cover image</span><div data-image-manager></div>' +
          '<p class="mt-1 text-xs text-forest-700/50">Optional — falls back to the first product image if left empty.</p></div>' +
        '<p id="category-error" class="text-sm font-medium text-red-600" role="alert" hidden></p>' +
        '<div class="flex justify-end gap-3 pt-1">' +
          '<button type="button" data-modal-close class="' + btn("outline", "md") + '">Cancel</button>' +
          '<button type="submit" class="' + btn("primary", "md") + '"><span id="category-spin" hidden>' + icon("loader-circle", 16, "", true) + "</span>" + (isEdit ? "Save Changes" : "Create Category") + "</button>" +
        "</div>" +
      "</form>";

    const m = openModal(isEdit ? "Edit Category" : "New Category", body);
    const form = m.body.querySelector("#category-form");
    const errEl = m.body.querySelector("#category-error");
    const spin = m.body.querySelector("#category-spin");
    const imWrap = m.body.querySelector("[data-image-manager]");

    function folder() {
      if (isEdit) return category.slug;
      const slug = (form.slug && form.slug.value.trim()) || "";
      return slug || (form.name.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")) || "categories";
    }
    imageManager(imWrap, image ? [image] : [], folder(), true, (imgs) => { image = imgs[0] || ""; });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errEl.hidden = true; spin.hidden = false;
      const payload = {
        name: form.name.value,
        description: form.description.value,
        icon: form.icon.value,
        image: image,
      };
      let res;
      if (isEdit) {
        payload.slug = category.slug;
        res = await api("categories/update.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        payload.slug = (form.slug && form.slug.value) || undefined;
        res = await api("categories/create.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      spin.hidden = true;
      if (res.ok) {
        const saved = res.data && res.data.category;
        state.selected = (saved && saved.slug) || (category && category.slug) || null;
        m.close();
        loadPanel();
      } else { errEl.textContent = (res.data && res.data.error) || "Save failed."; errEl.hidden = false; }
    });
  }

  // =====================================================================
  // Delete confirm
  // =====================================================================
  function confirmDelete(target) {
    const isCat = target.kind === "category";
    const name = isCat ? (target.category.meta && target.category.meta.name ? target.category.meta.name : target.category.slug) : target.product.product_name;
    const msg = isCat
      ? "This permanently removes <strong>" + esc(name) + "</strong> and all " + (target.category.productCount || 0) + " of its products from the catalogue file."
      : "This permanently removes <strong>" + esc(name) + "</strong> from the catalogue file.";
    const body =
      '<p class="text-sm text-forest-700/70">' + msg + "</p>" +
      '<p id="confirm-error" class="mt-3 text-sm font-medium text-red-600" role="alert" hidden></p>' +
      '<div class="mt-6 flex justify-end gap-3">' +
        '<button type="button" data-modal-close class="' + btn("outline", "md") + '">Cancel</button>' +
        '<button type="button" id="confirm-delete" class="' + btn("danger", "md") + '"><span id="confirm-spin" hidden>' + icon("loader-circle", 16, "", true) + "</span>Delete</button>" +
      "</div>";
    const m = openModal(isCat ? "Delete category?" : "Delete product?", body, "max-w-sm");
    const errEl = m.body.querySelector("#confirm-error");
    const spin = m.body.querySelector("#confirm-spin");
    m.body.querySelector("#confirm-delete").addEventListener("click", async () => {
      errEl.hidden = true; spin.hidden = false;
      let res;
      if (isCat) {
        res = await api("categories/delete.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: target.category.slug }) });
      } else {
        res = await api("products/delete.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category: target.category, id: target.product.product_id }) });
      }
      spin.hidden = true;
      if (res.ok) { m.close(); loadPanel(); }
      else { errEl.textContent = (res.data && res.data.error) || "Delete failed."; errEl.hidden = false; }
    });
  }

  // ---- helpers ----
  function field(label, control, hint) {
    return (
      '<div class="w-full"><label class="mb-1.5 block text-sm font-medium text-forest-800">' + esc(label) + "</label>" +
      control + (hint ? '<p class="mt-1 text-xs text-forest-700/50">' + esc(hint) + "</p>" : "") + "</div>"
    );
  }
  function toList(value) {
    return String(value || "").split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  }

  boot();
})();
