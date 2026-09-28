/*
 * Products listing — port of products-explorer.tsx for the static site.
 * Fetches products + categories via the Data layer, renders the sidebar filters
 * and the product grid, and does instant search / filter / sort / pagination
 * with the effective filters mirrored into the URL (no reload).
 */
(function () {
  "use strict";
  var C = window.Components, I = window.Icons, U = window.Utils, e = function (s) { return U.escapeHtml(s == null ? "" : s); };
  var PAGE_SIZE = 8;

  var priceRanges = {
    all: function () { return true; },
    u200: function (p) { return p < 200; },
    "200-400": function (p) { return p >= 200 && p <= 400; },
    "400-600": function (p) { return p > 400 && p <= 600; },
    "600p": function (p) { return p > 600; },
  };
  var priceLabels = [["all", "All Prices"], ["u200", "Under ₹200"], ["200-400", "₹200 – ₹400"], ["400-600", "₹400 – ₹600"], ["600p", "Above ₹600"]];
  var sortOptions = [["featured", "Featured"], ["rating", "Top Rated"], ["price-asc", "Price: Low to High"], ["price-desc", "Price: High to Low"], ["discount", "Biggest Discount"]];

  function filterPanel(categories, counts, total, suffix) {
    var cats = '<li><label class="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm text-forest-700 transition-colors hover:bg-cream-200"><span class="flex items-center gap-2.5"><input type="radio" name="category-' + suffix + '" value="all" data-filter-category class="h-4 w-4 border-cream-400 text-forest-600 focus:ring-forest-400" checked> All Products</span><span class="text-xs text-forest-700/45">' + total + "</span></label></li>";
    cats += categories.map(function (c) {
      return '<li><label class="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm text-forest-700 transition-colors hover:bg-cream-200"><span class="flex items-center gap-2.5"><input type="radio" name="category-' + suffix + '" value="' + e(c.slug) + '" data-filter-category class="h-4 w-4 border-cream-400 text-forest-600 focus:ring-forest-400"> ' + e(c.name) + '</span><span class="text-xs text-forest-700/45">' + (counts[c.slug] || 0) + "</span></label></li>";
    }).join("");
    var prices = priceLabels.map(function (r) {
      return '<li><label class="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm text-forest-700 transition-colors hover:bg-cream-200"><span class="flex items-center gap-2.5"><input type="radio" name="price-' + suffix + '" value="' + r[0] + '" data-filter-price class="h-4 w-4 border-cream-400 text-forest-600 focus:ring-forest-400"' + (r[0] === "all" ? " checked" : "") + "> " + e(r[1]) + "</span></label></li>";
    }).join("");
    return '<div class="space-y-7">' +
      '<div><h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-800">Categories</h3><ul class="space-y-1">' + cats + "</ul></div>" +
      '<div><h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-800">Price</h3><ul class="space-y-1">' + prices + "</ul></div>" +
      '<div><h3 class="mb-3 text-sm font-semibold uppercase tracking-wide text-forest-800">Availability</h3><label class="flex cursor-pointer items-center gap-2.5 text-sm text-forest-700"><input type="checkbox" data-filter-instock class="h-4 w-4 rounded border-cream-400 text-forest-600 focus:ring-forest-400"> In stock only</label></div>' +
      "</div>";
  }

  async function init() {
    var grid = document.querySelector("[data-products-grid]");
    if (!grid) return;
    var results = await Promise.all([window.Data.getProducts(), window.Data.getCategories()]);
    var products = results[0], categories = results[1];

    var counts = {};
    products.forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });

    // Build filter panels (desktop + mobile).
    var deskPanel = document.getElementById("filters-desktop");
    var mobPanel = document.getElementById("filters-mobile");
    if (deskPanel) deskPanel.innerHTML = filterPanel(categories, counts, products.length, "d");
    if (mobPanel) mobPanel.innerHTML = filterPanel(categories, counts, products.length, "m");

    // Sort select options.
    var sortSelect = document.querySelector("[data-sort]");
    if (sortSelect) sortSelect.innerHTML = sortOptions.map(function (o) { return '<option value="' + o[0] + '">Sort: ' + e(o[1]) + "</option>"; }).join("");

    var params = new URLSearchParams(location.search);
    var state = {
      category: params.get("category") || "all",
      search: params.get("search") || "",
      priceId: "all", sort: "featured", inStockOnly: false, page: 1,
    };

    var catRadios = function () { return Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]")); };
    var priceRadios = function () { return Array.prototype.slice.call(document.querySelectorAll("[data-filter-price]")); };
    var stockChecks = function () { return Array.prototype.slice.call(document.querySelectorAll("[data-filter-instock]")); };

    var searchForm = document.querySelector("form[data-search].toolbar-search") || document.querySelector("main form[data-search]");
    var searchInput = searchForm && searchForm.querySelector('input[type="search"]');
    if (searchInput) searchInput.value = state.search;
    catRadios().forEach(function (r) { r.checked = r.value === state.category; });

    var countEls = function () { return Array.prototype.slice.call(document.querySelectorAll("[data-result-count]")); };
    var nounEl = document.querySelector("[data-result-noun]");
    var activeCatEl = document.querySelector("[data-active-category]");
    var emptyState = document.querySelector("[data-empty-state]");
    var pagination = document.querySelector("[data-pagination]");
    var searchTimer = null;

    function pushParam(key, value) {
      var p = new URLSearchParams(location.search);
      if (value && value !== "all") p.set(key, value); else p.delete(key);
      var qs = p.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
    }
    function categoryName(slug) {
      if (slug === "all") return "All Products";
      var c = categories.find(function (x) { return x.slug === slug; });
      return c ? c.name : "Products";
    }

    function apply(resetPage) {
      if (resetPage) state.page = 1;
      var test = priceRanges[state.priceId] || priceRanges.all;
      var q = state.search.trim().toLowerCase();

      var matched = products.filter(function (p) {
        if (state.category !== "all" && p.category !== state.category) return false;
        if (state.inStockOnly && !p.inStock) return false;
        if (p.price > 0 && !test(p.price)) return false;
        if (q) {
          var hay = (p.name + " " + p.categoryName + " " + p.shortDescription).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });

      matched.sort(function (a, b) {
        switch (state.sort) {
          case "rating": return b.rating - a.rating;
          case "price-asc": return a.price - b.price;
          case "price-desc": return b.price - a.price;
          case "discount": return discountOf(b) - discountOf(a);
          default: return (Number(!!b.featured) - Number(!!a.featured)) || (b.rating - a.rating);
        }
      });

      var total = matched.length;
      var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (state.page > totalPages) state.page = totalPages;
      var pageItems = matched.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

      grid.innerHTML = pageItems.map(C.productCard).join("");
      grid.classList.toggle("hidden", total === 0);
      if (emptyState) emptyState.classList.toggle("hidden", total > 0);
      countEls().forEach(function (el) { el.textContent = String(total); });
      if (nounEl) nounEl.textContent = total === 1 ? "product" : "products";
      if (activeCatEl) activeCatEl.textContent = categoryName(state.category);
      renderPagination(totalPages);
    }

    function discountOf(p) { return p.originalPrice ? (p.originalPrice - p.price) / p.originalPrice : 0; }

    var ARROW = "flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 text-forest-700 transition-colors hover:bg-cream-200 disabled:opacity-40";
    function renderPagination(totalPages) {
      if (!pagination) return;
      pagination.innerHTML = "";
      if (totalPages <= 1) return;
      var go = function (p) { state.page = p; apply(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
      var prev = document.createElement("button");
      prev.type = "button"; prev.className = ARROW; prev.setAttribute("aria-label", "Previous page");
      prev.innerHTML = I.lucide("chevron-left", 18); prev.disabled = state.page <= 1;
      prev.addEventListener("click", function () { go(state.page - 1); });
      pagination.appendChild(prev);
      U.pageList(state.page, totalPages).forEach(function (item) {
        if (item === "…") {
          var s = document.createElement("span"); s.textContent = "…"; s.className = "px-2 text-forest-700/50"; s.setAttribute("aria-hidden", "true");
          pagination.appendChild(s);
        } else {
          var b = document.createElement("button"); b.type = "button"; b.textContent = String(item);
          var active = item === state.page;
          b.className = "h-10 min-w-10 rounded-full px-3 text-sm font-medium transition-colors " + (active ? "bg-forest-700 text-cream-50" : "border border-cream-300 text-forest-700 hover:bg-cream-200");
          if (active) b.setAttribute("aria-current", "page");
          b.addEventListener("click", function () { go(item); });
          pagination.appendChild(b);
        }
      });
      var next = document.createElement("button");
      next.type = "button"; next.className = ARROW; next.setAttribute("aria-label", "Next page");
      next.innerHTML = I.lucide("chevron-right", 18); next.disabled = state.page >= totalPages;
      next.addEventListener("click", function () { go(state.page + 1); });
      pagination.appendChild(next);
    }

    // ---- Bind controls (delegated where dynamic) ----
    document.addEventListener("change", function (ev) {
      var t = ev.target;
      if (t.matches("[data-filter-category]") && t.checked) {
        state.category = t.value;
        catRadios().forEach(function (x) { x.checked = x.value === t.value; });
        pushParam("category", t.value); apply(true);
      } else if (t.matches("[data-filter-price]") && t.checked) {
        state.priceId = t.value;
        priceRadios().forEach(function (x) { x.checked = x.value === t.value; });
        apply(true);
      } else if (t.matches("[data-filter-instock]")) {
        state.inStockOnly = t.checked;
        stockChecks().forEach(function (x) { x.checked = t.checked; });
        apply(true);
      } else if (t.matches("[data-sort]")) {
        state.sort = t.value; apply(true);
      }
    });

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        state.search = searchInput.value;
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(function () { pushParam("search", searchInput.value); }, 300);
        apply(true);
      });
    }
    if (searchForm) {
      searchForm.addEventListener("submit", function (ev) {
        ev.preventDefault(); ev.stopImmediatePropagation();
        state.search = searchInput ? searchInput.value : "";
        pushParam("search", state.search); apply(true);
      }, true);
    }

    var drawer = document.querySelector("[data-filter-drawer]");
    var openBtn = document.querySelector("[data-filter-open]");
    if (drawer && openBtn) {
      openBtn.addEventListener("click", function () { drawer.classList.remove("hidden"); });
      drawer.querySelectorAll("[data-filter-close]").forEach(function (b) { b.addEventListener("click", function () { drawer.classList.add("hidden"); }); });
    }

    apply(false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
