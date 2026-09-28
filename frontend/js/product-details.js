/*
 * Product detail — port of products/[slug]/page.tsx + gallery/actions for the
 * static site. Reads ?slug= (fallback ?id=), renders the full page into
 * #product-root, sets the title, injects Product JSON-LD, and wires the gallery
 * thumbnail switcher + quantity stepper + WhatsApp order link.
 */
(function () {
  "use strict";
  var C = window.Components, I = window.Icons, U = window.Utils, e = function (s) { return U.escapeHtml(s == null ? "" : s); };

  function notFound(rootEl) {
    document.title = "Product not found · " + (window.APP_CONFIG.SITE_NAME || "");
    rootEl.innerHTML = '<div class="mx-auto w-full max-w-7xl container-px py-24 text-center">' +
      '<h1 class="text-3xl font-bold">Product not found</h1>' +
      '<p class="mt-3 text-forest-700/60">The product you’re looking for doesn’t exist or may have been removed.</p>' +
      '<a href="products.html" class="' + C.buttonClasses("primary", "md", "mt-6") + '">Browse Products</a></div>';
  }

  function galleryHtml(p, images, discount) {
    var thumbs = "";
    if (images.length > 1) {
      thumbs = '<div class="grid grid-cols-4 gap-3">' + images.map(function (img, i) {
        return '<button type="button" data-gallery-thumb data-index="' + i + '" data-src="' + e(img) + '" aria-label="View image ' + (i + 1) + '"' + (i === 0 ? ' aria-current="true"' : "") +
          ' class="relative aspect-square overflow-hidden rounded-xl border-2 transition-colors ' + (i === 0 ? "border-forest-500" : "border-cream-300 hover:border-forest-300") + '">' +
          '<img src="' + e(img) + '" alt="" class="absolute inset-0 h-full w-full object-cover"></button>';
      }).join("") + "</div>";
    }
    var badges = (discount > 0 ? C.badge(discount + "% OFF", "discount") : "") + (p.tag ? C.badge(p.tag, "tag") : "");
    return '<div class="flex flex-col gap-4" data-gallery>' +
      '<div class="relative aspect-square overflow-hidden rounded-2xl border border-cream-300 bg-cream-100">' +
      '<img data-gallery-main src="' + e(images[0]) + '" alt="' + e(p.name) + ' — view 1" class="absolute inset-0 h-full w-full object-cover">' +
      '<div class="absolute left-4 top-4 flex flex-col gap-2">' + badges + "</div></div>" + thumbs + "</div>";
  }

  function actionsHtml(p, orderUrl, phones) {
    if (!p.inStock) {
      return '<div class="rounded-2xl border border-cream-300 bg-cream-100 p-5">' +
        '<p class="font-medium text-forest-800">Currently out of stock</p>' +
        '<p class="mt-1 text-sm text-forest-700/60">Message us on WhatsApp to be notified when it’s back.</p>' +
        '<a href="' + e(orderUrl) + '" target="_blank" rel="noopener noreferrer" data-order-link class="' + C.buttonClasses("outline", "md", "mt-4") + '">' + I.brand("whatsapp", 18) + "Enquire on WhatsApp</a></div>";
    }
    var calls = phones.map(function (ph) {
      return '<a href="tel:' + e(String(ph).replace(/[^\d+]/g, "")) + '" class="' + C.buttonClasses("outline", "lg", "w-full") + '">' + I.lucide("phone", 18) + (phones.length > 1 ? "Call " + e(ph) : "Call to Order") + "</a>";
    }).join("");
    return '<div class="space-y-4">' +
      '<div class="flex items-center gap-4"><span class="text-sm font-medium text-forest-800">Quantity</span>' +
      '<div class="inline-flex items-center rounded-full border border-cream-300 bg-cream-50">' +
      '<button type="button" data-qty-dec disabled aria-label="Decrease quantity" class="flex h-10 w-10 items-center justify-center rounded-full text-forest-700 transition-colors hover:bg-cream-200 disabled:opacity-40">' + I.lucide("minus", 16) + "</button>" +
      '<span data-qty-value class="w-11 text-center text-base font-semibold text-forest-800" aria-live="polite">1</span>' +
      '<button type="button" data-qty-inc aria-label="Increase quantity" class="flex h-10 w-10 items-center justify-center rounded-full text-forest-700 transition-colors hover:bg-cream-200 disabled:opacity-40">' + I.lucide("plus", 16) + "</button></div></div>" +
      '<a href="' + e(orderUrl) + '" target="_blank" rel="noopener noreferrer" data-order-link class="' + C.buttonClasses("whatsapp", "lg", "w-full") + '">' + I.brand("whatsapp", 18) + "Order on WhatsApp</a>" +
      calls +
      '<p class="text-center text-xs text-forest-700/50">Share your requirement on WhatsApp or call us — our team will confirm availability, price and delivery.</p></div>';
  }

  function detailsHtml(p) {
    var cards = "";
    if (p.benefits && p.benefits.length) {
      cards += '<div class="rounded-2xl border border-cream-300 bg-cream-50 p-6"><h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-forest-800"><span class="text-forest-500">' + I.lucide("sparkles", 18) + '</span>Key Benefits</h2><ul class="space-y-2.5">' +
        p.benefits.map(function (b) { return '<li class="flex gap-2.5 text-sm text-forest-700/80">' + I.lucide("check", 16, "mt-0.5 shrink-0 text-forest-500") + e(b) + "</li>"; }).join("") + "</ul></div>";
    }
    if (p.ingredients && p.ingredients.length) {
      cards += '<div class="rounded-2xl border border-cream-300 bg-cream-50 p-6"><h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-forest-800"><span class="text-forest-500">' + I.lucide("leaf", 18) + '</span>Ingredients</h2><ul class="space-y-2 text-sm text-forest-700/80">' +
        p.ingredients.map(function (ing) { return '<li class="flex gap-2"><span class="text-forest-400">•</span>' + e(ing) + "</li>"; }).join("") + "</ul></div>";
    }
    var info = "";
    if (p.info) {
      info = '<dl class="mt-4 space-y-2 border-t border-cream-300 pt-4 text-sm">' + Object.keys(p.info).map(function (k) {
        return '<div class="flex justify-between gap-4"><dt class="text-forest-700/60">' + e(k) + '</dt><dd class="font-medium text-forest-800">' + e(p.info[k]) + "</dd></div>";
      }).join("") + "</dl>";
    }
    cards += '<div class="rounded-2xl border border-cream-300 bg-cream-50 p-6"><h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-forest-800"><span class="text-forest-500">' + I.lucide("package-check", 18) + '</span>How to Use</h2>' +
      (p.usage ? '<p class="text-sm leading-relaxed text-forest-700/80">' + e(p.usage) + "</p>" : "") + info + "</div>";
    return '<div class="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">' + cards + "</div>";
  }

  function injectJsonLd(p) {
    var c = window.APP_CONFIG || {};
    var base = (c.SITE_URL || "").replace(/\/$/, "");
    var productUrl = base + "/product-details.html?slug=" + encodeURIComponent(p.slug);
    var imageAbs = /^https?:\/\//i.test(p.image) ? p.image : base + p.image;
    var ld = {
      "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description,
      image: imageAbs, sku: p.id, category: p.categoryName, url: productUrl,
      brand: { "@type": "Brand", name: c.SITE_NAME },
      aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount },
      offers: { "@type": "Offer", url: productUrl, price: p.price, priceCurrency: c.CURRENCY || "INR", itemCondition: "https://schema.org/NewCondition", availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
    };
    var s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.appendChild(s);
  }

  function wire(root, product) {
    // Gallery
    var gal = root.querySelector("[data-gallery]");
    if (gal) {
      var main = gal.querySelector("[data-gallery-main]");
      var thumbs = Array.prototype.slice.call(gal.querySelectorAll("[data-gallery-thumb]"));
      var baseCls = "relative aspect-square overflow-hidden rounded-xl border-2 transition-colors";
      thumbs.forEach(function (thumb, i) {
        thumb.addEventListener("click", function () {
          if (main) { main.setAttribute("src", thumb.getAttribute("data-src")); main.setAttribute("alt", product.name + " — view " + (i + 1)); }
          thumbs.forEach(function (t, j) {
            var a = j === i;
            t.className = baseCls + " " + (a ? "border-forest-500" : "border-cream-300 hover:border-forest-300");
            if (a) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current");
          });
        });
      });
    }
    // Quantity + order link
    var dec = root.querySelector("[data-qty-dec]"), inc = root.querySelector("[data-qty-inc]"), val = root.querySelector("[data-qty-value]");
    var links = Array.prototype.slice.call(root.querySelectorAll("[data-order-link]"));
    var qty = 1;
    function render() {
      if (val) val.textContent = String(qty);
      if (dec) dec.disabled = qty <= 1;
      if (inc) inc.disabled = qty >= 99;
      var href = U.productOrderUrl(product, qty);
      links.forEach(function (a) { a.setAttribute("href", href); });
    }
    if (dec) dec.addEventListener("click", function () { qty = Math.max(1, qty - 1); render(); });
    if (inc) inc.addEventListener("click", function () { qty = Math.min(99, qty + 1); render(); });
    render();
  }

  async function init() {
    var root = document.getElementById("product-root");
    if (!root) return;
    var params = new URLSearchParams(location.search);
    var slug = (params.get("slug") || "").trim();
    var id = (params.get("id") || "").trim();

    var product = null;
    try {
      if (slug) product = await window.Data.getProductBySlug(slug);
      else if (id) product = await window.Data.getProductById(id);
    } catch (err) { /* fall through to not found */ }

    if (!product) { notFound(root); return; }

    document.title = product.name + " · " + (window.APP_CONFIG.SITE_NAME || "");
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", product.shortDescription);

    var related = await window.Data.getRelated(product);
    var discount = product.originalPrice ? U.discountPercent(product.originalPrice, product.price) : 0;
    var images = (product.images && product.images.length) ? product.images : [product.image];
    var phones = (window.APP_CONFIG.CONTACT && window.APP_CONFIG.CONTACT.phones) || [];
    var orderUrl = U.productOrderUrl(product, 1);

    var html = '<div class="mx-auto w-full max-w-7xl container-px py-6 sm:py-8">' +
      '<nav aria-label="Breadcrumb" class="mb-6"><ol class="flex flex-wrap items-center gap-1 text-sm text-forest-700/60">' +
      '<li><a href="index.html" class="hover:text-forest-700">Home</a></li>' + I.lucide("chevron-right", 14) +
      '<li><a href="products.html" class="hover:text-forest-700">Products</a></li>' + I.lucide("chevron-right", 14) +
      '<li><a href="products.html?category=' + encodeURIComponent(product.category) + '" class="hover:text-forest-700">' + e(product.categoryName) + "</a></li>" + I.lucide("chevron-right", 14) +
      '<li class="font-medium text-forest-800">' + e(product.name) + "</li></ol></nav>" +
      '<div class="grid gap-8 lg:grid-cols-2 lg:gap-12">' + galleryHtml(product, images, discount) +
      "<div>" +
      '<span class="text-sm font-medium uppercase tracking-wide text-forest-500">' + e(product.categoryName) + "</span>" +
      '<h1 class="mt-1 text-3xl font-bold sm:text-4xl">' + e(product.name) + "</h1>" +
      '<div class="mt-3 flex flex-wrap items-center gap-4">' + C.rating(product.rating || 0, product.reviewCount || 0, "md") +
      (product.inStock ? '<span class="inline-flex items-center gap-1 text-sm font-medium text-forest-600">' + I.lucide("check", 16) + " In Stock</span>" : C.badge("Out of Stock", "danger")) + "</div>" +
      '<div class="mt-5 flex items-center gap-3">' + C.price(product.price, product.originalPrice, "lg") + (discount > 0 ? C.badge("Save " + discount + "%", "discount") : "") + "</div>" +
      '<p class="mt-1 text-xs text-forest-700/50">Inclusive of all taxes</p>' +
      '<p class="mt-5 leading-relaxed text-forest-700/75">' + e(product.description) + "</p>" +
      '<div class="mt-7">' + actionsHtml(product, orderUrl, phones) + "</div>" +
      '<ul class="mt-7 grid grid-cols-2 gap-3 rounded-2xl border border-cream-300 bg-cream-100/60 p-4 sm:grid-cols-4">' +
      [["leaf", "100% Natural"], ["shield-check", "Quality Assured"], ["truck", "Fast Delivery"], ["package-check", "Easy Returns"]].map(function (b) {
        return '<li class="flex flex-col items-center gap-1.5 text-center text-xs font-medium text-forest-700">' + I.lucide(b[0], 20, "text-forest-500") + e(b[1]) + "</li>";
      }).join("") + "</ul>" +
      "</div></div>" + detailsHtml(product) +
      (related.length ? '<div class="mt-16">' + C.sectionHeading("Related Products", "You may also like", null, "left", "h2", "mx-0") + '<div class="mt-8">' + C.productSlider(related) + "</div></div>" : "") +
      "</div>";

    root.innerHTML = html;
    injectJsonLd(product);
    wire(root, product);
    if (window.Carousel) window.Carousel.init(root);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
