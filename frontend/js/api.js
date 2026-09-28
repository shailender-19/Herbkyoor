/*
 * Data access + centralized fetch helper.
 *
 * Public reads go through Data.* which either read the bundled JSON snapshot
 * (USE_STATIC_DATA) or the PHP API (API_REQUIREMENTS.md). Writes (admin, forms)
 * always go to the PHP API via Api.post / Api.upload.
 *
 *   const products = await Data.getProducts();
 *   const product  = await Data.getProductBySlug("omega-3");
 *   const { ok, data } = await Api.post("/contact/send.php", {...});
 */
(function (global) {
  "use strict";

  var cfg = function () { return global.APP_CONFIG || {}; };
  var apiBase = function () { return (cfg().API_BASE_URL || "/api").replace(/\/$/, ""); };
  var staticBase = function () { return (cfg().STATIC_DATA_BASE || "data").replace(/\/$/, ""); };

  function url(path) {
    if (/^https?:\/\//i.test(path)) return path;
    return apiBase() + (path.charAt(0) === "/" ? path : "/" + path);
  }

  // ---- Core request: never throws on HTTP errors -> {ok,status,data} ----
  async function request(path, init) {
    var opts = Object.assign({ credentials: "same-origin" }, init || {});
    if (opts.body && !(opts.body instanceof FormData)) {
      opts.headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    }
    try {
      var res = await fetch(url(path), opts);
      var data = {};
      try { data = await res.json(); } catch (e) { /* empty/non-JSON */ }
      return { ok: res.ok, status: res.status, data: data };
    } catch (e) {
      return { ok: false, status: 0, data: { error: "Network error. Please check your connection and try again." } };
    }
  }

  var get = function (p) { return request(p, { method: "GET" }); };
  var post = function (p, body) { return request(p, { method: "POST", body: JSON.stringify(body || {}) }); };
  var put = function (p, body) { return request(p, { method: "PUT", body: JSON.stringify(body || {}) }); };
  var del = function (p) { return request(p, { method: "DELETE" }); };
  var upload = function (p, formData) { return request(p, { method: "POST", body: formData }); };

  global.Api = { request: request, get: get, post: post, put: put, del: del, upload: upload, url: url };

  // -------------------------------------------------------------------
  // Data layer — cached per page load.
  // -------------------------------------------------------------------
  var cache = {};

  async function fetchJson(u) {
    var res = await fetch(u, { credentials: "same-origin" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  async function getProducts() {
    if (cache.products) return cache.products;
    var list;
    if (cfg().USE_STATIC_DATA) {
      list = (await fetchJson(staticBase() + "/products.json")).products || [];
    } else {
      list = ((await get("/products/list.php")).data || {}).products || [];
    }
    cache.products = list;
    return list;
  }

  async function getCategories() {
    if (cache.categories) return cache.categories;
    var list;
    if (cfg().USE_STATIC_DATA) {
      list = (await fetchJson(staticBase() + "/categories.json")).categories || [];
    } else {
      list = ((await get("/categories/list.php")).data || {}).categories || [];
    }
    cache.categories = list;
    return list;
  }

  async function getTestimonials() {
    if (cache.testimonials) return cache.testimonials;
    var list = [];
    try { list = (await fetchJson(staticBase() + "/testimonials.json")).testimonials || []; } catch (e) {}
    cache.testimonials = list;
    return list;
  }

  async function getAdvertisements() {
    if (cache.ads) return cache.ads;
    var list = [];
    try { list = (await fetchJson(staticBase() + "/advertisements.json")).advertisements || []; } catch (e) {}
    cache.ads = list;
    return list;
  }

  async function getProductBySlug(slug) {
    var all = await getProducts();
    return all.find(function (p) { return p.slug === slug; }) || null;
  }
  async function getProductById(id) {
    var all = await getProducts();
    return all.find(function (p) { return p.id === id; }) || null;
  }
  async function getFeatured() {
    var all = await getProducts();
    var f = all.filter(function (p) { return p.featured; });
    return f.length ? f : all.slice(0, 8);
  }
  async function getRelated(product, limit) {
    var all = await getProducts();
    return all.filter(function (p) { return p.category === product.category && p.id !== product.id; }).slice(0, limit || 4);
  }

  global.Data = {
    getProducts: getProducts,
    getCategories: getCategories,
    getTestimonials: getTestimonials,
    getAdvertisements: getAdvertisements,
    getProductBySlug: getProductBySlug,
    getProductById: getProductById,
    getFeatured: getFeatured,
    getRelated: getRelated,
  };
})(window);
