/*
 * Reusable UI components — vanilla-JS render functions (return HTML strings).
 * Ports of the React/PHP components; class strings copied verbatim so the design
 * is preserved. Depends on Utils (utils.js) and Icons (icons.js).
 */
(function (global) {
  "use strict";

  var cfg = function () { return global.APP_CONFIG || {}; };
  var e = function (s) { return global.Utils.escapeHtml(s == null ? "" : s); };
  var I = global.Icons;

  // ---- Button recipe (ui/button.tsx) ----
  var BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] whitespace-nowrap";
  var BTN_VARIANTS = {
    primary: "bg-forest-700 text-cream-50 hover:bg-forest-800 shadow-sm hover:shadow-md",
    secondary: "bg-cream-200 text-forest-800 hover:bg-cream-300 border border-cream-300",
    outline: "border border-forest-300 text-forest-700 hover:bg-forest-50 bg-transparent",
    gold: "bg-gold-500 text-forest-950 hover:bg-gold-600 shadow-sm hover:shadow-md",
    whatsapp: "bg-[#25D366] text-white hover:bg-[#1ebe5b] shadow-sm hover:shadow-md",
    ghost: "text-forest-700 hover:bg-forest-50 bg-transparent",
  };
  var BTN_SIZES = { sm: "h-9 px-4 text-sm", md: "h-11 px-6 text-sm", lg: "h-12 px-8 text-base", icon: "h-10 w-10" };
  function buttonClasses(variant, size, extra) {
    return (BTN_BASE + " " + (BTN_VARIANTS[variant] || BTN_VARIANTS.primary) + " " + (BTN_SIZES[size] || BTN_SIZES.md) + " " + (extra || "")).trim();
  }

  // ---- Badge (ui/badge.tsx) ----
  var BADGE_TONES = {
    discount: "bg-gold-500 text-forest-950", tag: "bg-forest-700 text-cream-50",
    new: "bg-forest-500 text-cream-50", muted: "bg-cream-200 text-forest-700",
    success: "bg-forest-100 text-forest-700", danger: "bg-red-100 text-red-700",
  };
  function badge(label, tone, extra) {
    return '<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none ' +
      (BADGE_TONES[tone] || BADGE_TONES.muted) + " " + (extra || "") + '">' + e(label) + "</span>";
  }

  // ---- WhatsApp helpers ----
  function whatsappButton(href, label, size, variant, extra) {
    return '<a href="' + e(href) + '" target="_blank" rel="noopener noreferrer" class="' +
      buttonClasses(variant || "whatsapp", size || "md", extra) + '">' + I.brand("whatsapp", (size === "sm" ? 16 : 18)) + e(label || "Chat on WhatsApp") + "</a>";
  }

  // ---- Search form (search-bar.tsx) ----
  function searchBar(value, autofocus, extra) {
    return '<form role="search" data-search class="relative w-full ' + (extra || "") + '">' +
      I.lucide("search", 18, "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-700/50") +
      '<input type="search" name="search" value="' + e(value || "") + '"' + (autofocus ? " autofocus" : "") +
      ' placeholder="Search Ayurvedic products…" aria-label="Search products" class="h-11 w-full rounded-full border border-cream-300 bg-cream-50 pl-10 pr-10 text-base sm:text-sm text-forest-900 placeholder:text-forest-700/40 focus:border-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-400/30">' +
      '<button type="button" data-search-clear hidden aria-label="Clear search" class="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-forest-700/60 hover:bg-cream-200">' + I.lucide("x", 16) + "</button></form>";
  }

  // ---- Price (ui/price.tsx) ----
  var PRICE_SIZES = { sm: "text-base", md: "text-lg", lg: "text-2xl" };
  function price(p, originalPrice, size, extra) {
    var html = '<div class="flex items-baseline gap-2 ' + (extra || "") + '">' +
      '<span class="font-bold text-forest-800 ' + (PRICE_SIZES[size] || PRICE_SIZES.md) + '">' + e(global.Utils.formatPrice(p)) + "</span>";
    if (originalPrice != null && originalPrice > p) {
      html += '<span class="text-sm text-forest-700/45 line-through">' + e(global.Utils.formatPrice(originalPrice)) + "</span>";
    }
    return html + "</div>";
  }

  // ---- Rating (ui/rating.tsx) ----
  function rating(value, reviewCount, size, extra) {
    var dim = size === "md" ? 18 : 14;
    var rounded = Math.round(value * 2) / 2;
    var valSize = size === "md" ? "text-sm" : "text-xs";
    var aria = "Rated " + value + " out of 5" + (reviewCount ? " from " + reviewCount + " reviews" : "");
    var html = '<div class="flex items-center gap-1.5 ' + (extra || "") + '" aria-label="' + e(aria) + '"><div class="flex" aria-hidden="true">';
    for (var i = 1; i <= 5; i++) {
      var fill = rounded >= i ? 1 : (rounded + 0.5 === i ? 0.5 : 0);
      html += '<span class="relative">' + I.lucide("star", dim, "text-gold-500/30");
      if (fill > 0) html += '<span class="absolute inset-0 overflow-hidden" style="width:' + (fill * 100) + '%">' + I.lucide("star", dim, "fill-gold-500 text-gold-500") + "</span>";
      html += "</span>";
    }
    html += "</div><span class=\"font-medium text-forest-700 " + valSize + "\">" + e(Number(value).toFixed(1));
    if (reviewCount != null) html += '<span class="ml-1 font-normal text-forest-700/50">(' + e(reviewCount) + ")</span>";
    return html + "</span></div>";
  }

  // ---- Section heading (ui/section-heading.tsx) ----
  function sectionHeading(title, eyebrow, description, align, as, extra) {
    as = as || "h2";
    var alignCls = align === "left" ? "text-left" : "mx-auto text-center";
    var html = '<div class="max-w-2xl ' + alignCls + " " + (extra || "") + '">';
    if (eyebrow) html += '<span class="mb-3 inline-flex items-center gap-2 rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest-600"><span class="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true"></span>' + e(eyebrow) + "</span>";
    html += "<" + as + ' class="text-3xl font-bold text-balance sm:text-4xl">' + e(title) + "</" + as + ">";
    if (description) html += '<p class="mt-4 text-base leading-relaxed text-forest-700/70">' + e(description) + "</p>";
    return html + "</div>";
  }

  // ---- Page header (common/page-header.tsx) ----
  function pageHeader(title, eyebrow, description) {
    var html = '<section class="relative overflow-hidden border-b border-cream-300 bg-gradient-to-b from-forest-50 to-cream-50">' +
      '<div class="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-gold-300/20 blur-3xl" aria-hidden="true"></div>' +
      '<div class="mx-auto w-full max-w-7xl container-px relative py-12 text-center sm:py-16">';
    if (eyebrow) html += '<span class="mb-3 inline-flex items-center gap-2 rounded-full bg-cream-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest-600 shadow-sm"><span class="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true"></span>' + e(eyebrow) + "</span>";
    html += '<h1 class="text-4xl font-bold text-balance sm:text-5xl">' + e(title) + "</h1>";
    if (description) html += '<p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-forest-700/70">' + e(description) + "</p>";
    return html + "</div></section>";
  }

  // ---- Category icon map (category-card.tsx) ----
  var CAT_ICON = { Leaf: "leaf", Droplet: "droplet", Droplets: "droplets", Sparkles: "sparkles", Wind: "wind", ShieldPlus: "shield-plus", Flame: "flame", HeartHandshake: "heart-handshake", HeartPulse: "heart-pulse", Pill: "pill", Activity: "activity", Bone: "bone", Brain: "brain", Flower2: "flower-2", Stethoscope: "stethoscope", Waves: "waves" };

  // ---- Category card (products/category-card.tsx) ----
  function categoryCard(c) {
    var href = "products.html?category=" + encodeURIComponent(c.slug);
    return '<a href="' + e(href) + '" class="group relative flex flex-col overflow-hidden rounded-2xl border border-cream-300 bg-cream-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">' +
      '<div class="relative aspect-[4/3] overflow-hidden"><img src="' + e(c.image) + '" alt="' + e(c.name) + '" loading="lazy" class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105">' +
      '<span class="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-cream-50/90 text-forest-700 shadow-sm backdrop-blur">' + I.lucide(CAT_ICON[c.icon] || "leaf", 20) + "</span></div>" +
      '<div class="flex flex-1 flex-col p-4"><h3 class="font-semibold text-forest-900 transition-colors group-hover:text-forest-600">' + e(c.name) + "</h3>" +
      '<p class="mt-1 line-clamp-2 text-sm text-forest-700/60">' + e(c.description) + "</p>" +
      '<span class="mt-3 text-sm font-medium text-forest-600">Shop now →</span></div></a>';
  }

  // ---- Product card (products/product-card.tsx) ----
  function productCard(p) {
    var href = "product-details.html?slug=" + encodeURIComponent(p.slug);
    var discount = p.originalPrice ? global.Utils.discountPercent(p.originalPrice, p.price) : 0;
    var orderUrl = global.Utils.productOrderUrl(p, 1);
    var html = '<article class="group @container flex h-full flex-col overflow-hidden rounded-2xl border border-cream-300 bg-cream-50 transition-all duration-300 hover:-translate-y-1 hover:border-forest-200 hover:shadow-lg">' +
      '<div class="relative"><a href="' + e(href) + '" class="block overflow-hidden" aria-label="' + e(p.name) + '">' +
      '<img src="' + e(p.image) + '" alt="' + e(p.name) + '" loading="lazy" class="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"></a>' +
      '<div class="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">' + (discount > 0 ? badge(discount + "% OFF", "discount") : "") + "</div>" +
      '<div class="pointer-events-none absolute right-3 top-3 flex flex-col items-end gap-1.5">' + (p.tag ? badge(p.tag, "tag") : "") + "</div>";
    if (!p.inStock) html += '<div class="absolute inset-0 flex items-center justify-center bg-cream-50/70 backdrop-blur-[1px]"><span class="rounded-full bg-forest-800 px-4 py-1.5 text-sm font-semibold text-cream-50">Out of Stock</span></div>';
    html += "</div><div class=\"flex flex-1 flex-col p-4\">" +
      '<span class="text-xs font-medium uppercase tracking-wide text-forest-500">' + e(p.categoryName) + "</span>" +
      '<h3 class="mt-1 line-clamp-1 font-semibold text-forest-900"><a href="' + e(href) + '" class="transition-colors hover:text-forest-600">' + e(p.name) + "</a></h3>" +
      '<p class="mt-1 line-clamp-2 text-sm text-forest-700/60">' + e(p.shortDescription) + "</p>" +
      '<div class="mt-auto pt-3">' + rating(p.rating || 0, p.reviewCount || 0) + "</div>" +
      '<div class="mt-3 flex items-center justify-between">' + price(p.price, p.originalPrice) + "</div>" +
      '<div class="mt-4 flex flex-col items-stretch gap-2 @[16rem]:flex-row">' +
      '<a href="' + e(orderUrl) + '" target="_blank" rel="noopener noreferrer" class="' + buttonClasses("whatsapp", "sm", "w-full @[16rem]:flex-1") + '" aria-label="Enquire about ' + e(p.name) + ' on WhatsApp">' + I.brand("whatsapp", 16) + "Enquire</a>" +
      '<a href="' + e(href) + '" class="' + buttonClasses("outline", "sm", "w-full @[16rem]:flex-1") + '">Details ' + I.lucide("arrow-right", 15) + "</a>" +
      "</div></div></article>";
    return html;
  }

  function productGrid(products, extra) {
    return '<div class="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 ' + (extra || "") + '">' +
      products.map(productCard).join("") + "</div>";
  }

  // ---- Product slider (products/product-slider.tsx) ----
  function productSlider(products) {
    var slides = products.map(function (p) {
      return '<div class="w-[78%] shrink-0 snap-start min-[420px]:w-[45%] md:w-[31%] xl:w-[23.5%]">' + productCard(p) + "</div>";
    }).join("");
    return '<div class="relative" data-slider>' +
      '<div data-slider-track class="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2">' + slides + "</div>" +
      '<div class="mt-5 flex justify-center gap-2 md:justify-end">' +
      '<button type="button" data-slider-prev aria-label="Scroll products left" class="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-forest-700 transition-colors hover:bg-cream-200">' + I.lucide("chevron-left", 18) + "</button>" +
      '<button type="button" data-slider-next aria-label="Scroll products right" class="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-forest-700 transition-colors hover:bg-cream-200">' + I.lucide("chevron-right", 18) + "</button>" +
      "</div></div>";
  }

  // ---- Newsletter form (forms/newsletter-form.tsx) ----
  function newsletterForm(extra) {
    return '<form data-newsletter class="w-full ' + (extra || "") + '" novalidate>' +
      '<div class="flex flex-col gap-2 sm:flex-row"><div class="flex-1"><label for="newsletter-email" class="sr-only">Email address</label>' +
      '<input id="newsletter-email" name="email" type="email" placeholder="Enter your email" class="h-12 w-full rounded-full border border-cream-300 bg-cream-50 px-5 text-base sm:text-sm text-forest-900 placeholder:text-forest-700/40 focus:border-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-400/30"></div>' +
      '<button type="submit" class="' + buttonClasses("gold", "lg") + '">' + I.lucide("send", 16) + " Subscribe</button></div>" +
      '<p data-newsletter-error class="mt-2 text-xs font-medium text-red-600" role="alert" hidden></p></form>';
  }

  // ---- Field helpers (ui/input.tsx) ----
  var FIELD = "w-full rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-base sm:text-sm text-forest-900 placeholder:text-forest-700/40 transition-colors focus:border-forest-400 focus:outline-none focus:ring-2 focus:ring-forest-400/30 disabled:opacity-60";
  function inputField(o) {
    var id = o.id || "f-" + o.name;
    var html = '<div class="w-full">';
    if (o.label) html += '<label for="' + e(id) + '" class="mb-1.5 block text-sm font-medium text-forest-800">' + e(o.label) + (o.required ? '<span class="ml-0.5 text-red-500">*</span>' : "") + "</label>";
    html += '<input id="' + e(id) + '" name="' + e(o.name) + '" type="' + e(o.type || "text") + '"' + (o.required ? " required" : "") +
      (o.autocomplete ? ' autocomplete="' + e(o.autocomplete) + '"' : "") + (o.placeholder ? ' placeholder="' + e(o.placeholder) + '"' : "") + ' class="' + FIELD + '">';
    if (o.hint) html += '<p class="mt-1 text-xs text-forest-700/50">' + e(o.hint) + "</p>";
    html += '<p data-error-for="' + e(o.name) + '" class="mt-1 text-xs font-medium text-red-600" role="alert" hidden></p></div>';
    return html;
  }
  function textareaField(o) {
    var id = o.id || "f-" + o.name;
    var html = '<div class="w-full">';
    if (o.label) html += '<label for="' + e(id) + '" class="mb-1.5 block text-sm font-medium text-forest-800">' + e(o.label) + (o.required ? '<span class="ml-0.5 text-red-500">*</span>' : "") + "</label>";
    html += '<textarea id="' + e(id) + '" name="' + e(o.name) + '" rows="' + (o.rows || 5) + '"' + (o.required ? " required" : "") + (o.placeholder ? ' placeholder="' + e(o.placeholder) + '"' : "") + ' class="' + FIELD + ' min-h-28 resize-y"></textarea>';
    html += '<p data-error-for="' + e(o.name) + '" class="mt-1 text-xs font-medium text-red-600" role="alert" hidden></p></div>';
    return html;
  }

  // ---- Legal layout (common/legal-layout.tsx) ----
  function legal(title, updated, intro, sections) {
    var html = pageHeader(title, "Legal") + '<div class="mx-auto w-full max-w-7xl container-px py-14"><div class="mx-auto max-w-3xl">' +
      '<p class="text-sm text-forest-700/50">Last updated: ' + e(updated) + "</p>" +
      '<p class="mt-4 leading-relaxed text-forest-700/80">' + e(intro) + "</p><div class=\"mt-10 space-y-9\">";
    sections.forEach(function (s, i) {
      html += '<section><h2 class="text-xl font-bold text-forest-800">' + (i + 1) + ". " + e(s.heading) + "</h2>";
      s.body.forEach(function (para) { html += '<p class="mt-3 leading-relaxed text-forest-700/75">' + e(para) + "</p>"; });
      html += "</section>";
    });
    return html + "</div></div></div>";
  }

  // ---- Header (layout/navbar.tsx) ----
  function header() {
    var c = cfg();
    var current = location.pathname.split("/").pop() || "index.html";
    function active(href) {
      var f = href.split("/").pop();
      if (f === "index.html") return current === "index.html" || current === "";
      if (f === "products.html") return current === "products.html" || current === "product-details.html";
      return current === f;
    }
    var phones = (c.CONTACT && c.CONTACT.phones) || [];
    var navDesktop = (c.NAV || []).map(function (it) {
      return '<a href="' + e(it.href) + '" class="rounded-full px-4 py-2 text-sm font-medium transition-colors ' + (active(it.href) ? "bg-forest-50 text-forest-800" : "text-forest-700 hover:bg-cream-200") + '">' + e(it.label) + "</a>";
    }).join("");
    var navMobile = (c.NAV || []).map(function (it) {
      return '<a href="' + e(it.href) + '" class="rounded-xl px-4 py-3 text-base font-medium transition-colors ' + (active(it.href) ? "bg-forest-50 text-forest-800" : "text-forest-700 hover:bg-cream-200") + '">' + e(it.label) + "</a>";
    }).join("");
    var announce = phones.map(function (p, i) {
      return '<a href="tel:' + e(telDigits(p)) + '" class="inline-flex items-center gap-1.5 hover:text-gold-300">' + (i === 0 ? I.lucide("phone", 13) : "") + " " + e(p) + "</a>";
    }).join("");

    return '<header class="sticky top-0 z-50" data-nav>' +
      '<div class="hidden bg-forest-800 text-cream-100 md:block"><div class="mx-auto flex h-9 w-full max-w-7xl container-px items-center justify-between text-xs">' +
      "<p>🌿 Free shipping on orders above " + e(c.CURRENCY_SYMBOL || "₹") + e(c.FREE_SHIPPING_THRESHOLD || "") + " · 100% Authentic Ayurveda</p>" +
      '<div class="inline-flex items-center gap-3">' + announce + "</div></div></div>" +
      '<div class="border-b border-cream-300/70 bg-cream-50/90 backdrop-blur-md transition-shadow"><div class="mx-auto w-full max-w-7xl container-px"><div class="flex h-16 items-center gap-4">' +
      '<a href="index.html" class="flex shrink-0 items-center gap-2.5" aria-label="' + e(c.SITE_NAME) + ' home"><img src="assets/images/brand/logo-mark.svg" alt="" width="40" height="40" class="h-10 w-10 rounded-xl">' +
      '<span class="flex flex-col leading-none"><span class="font-display text-lg font-bold text-forest-800">' + e(c.SITE_SHORT_NAME) + '</span><span class="text-[10px] font-medium uppercase tracking-[0.2em] text-forest-500">Ayurveda</span></span></a>' +
      '<nav class="ml-4 hidden items-center gap-1 lg:flex">' + navDesktop + "</nav>" +
      '<div class="ml-auto hidden max-w-xs flex-1 md:block">' + searchBar() + "</div>" +
      '<div class="ml-auto flex items-center gap-1 md:ml-2">' +
      '<button type="button" data-nav-search-toggle aria-label="Toggle search" aria-expanded="false" class="flex h-10 w-10 items-center justify-center rounded-full text-forest-700 hover:bg-cream-200 md:hidden">' + I.lucide("search", 20) + "</button>" +
      '<div class="ml-1 hidden lg:block">' + whatsappButton(global.Utils.whatsAppEnquiryUrl(), "WhatsApp", "sm") + "</div>" +
      '<button type="button" data-nav-toggle aria-label="Toggle menu" aria-expanded="false" class="flex h-10 w-10 items-center justify-center rounded-full text-forest-700 hover:bg-cream-200 lg:hidden">' + I.lucide("menu", 22) + "</button>" +
      "</div></div>" +
      '<div class="pb-3 md:hidden" data-nav-search>' + searchBar() + "</div></div></div>" +
      '<div class="border-b border-cream-300 bg-cream-50 lg:hidden" data-nav-menu><div class="mx-auto w-full max-w-7xl container-px py-3"><nav class="flex flex-col gap-1">' +
      navMobile + '<div class="mt-2">' + whatsappButton(global.Utils.whatsAppEnquiryUrl(), "Chat on WhatsApp", "md", "whatsapp", "w-full") + "</div></nav></div></div></header>";
  }

  function telDigits(phone) { return String(phone).replace(/[^\d+]/g, ""); }

  // ---- Footer (layout/footer.tsx). Categories passed in (fetched). ----
  function footer(categories) {
    var c = cfg();
    var phones = (c.CONTACT && c.CONTACT.phones) || [];
    var nav = (c.NAV || []).map(function (it) { return '<li><a href="' + e(it.href) + '" class="text-cream-100/70 transition-colors hover:text-gold-300">' + e(it.label) + "</a></li>"; }).join("");
    var cats = (categories || []).slice(0, 6).map(function (cat) { return '<li><a href="products.html?category=' + encodeURIComponent(cat.slug) + '" class="text-cream-100/70 transition-colors hover:text-gold-300">' + e(cat.name) + "</a></li>"; }).join("");
    var phoneItems = phones.map(function (p, i) {
      return '<li><a href="tel:' + e(telDigits(p)) + '" class="flex items-center gap-2.5 transition-colors hover:text-gold-300">' + I.lucide("phone", 17, "shrink-0 text-gold-400" + (i > 0 ? " invisible" : "")) + e(p) + "</a></li>";
    }).join("");
    var soc = c.SOCIAL || {};

    return '<footer class="mt-20 bg-forest-900 text-cream-100"><div class="mx-auto w-full max-w-7xl container-px py-14"><div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4">' +
      '<div><a href="index.html" class="flex items-center gap-2.5"><img src="assets/images/brand/logo-mark.svg" alt="" width="44" height="44" class="h-11 w-11 rounded-xl">' +
      '<span class="flex flex-col leading-none"><span class="font-display text-lg font-bold text-cream-50">' + e(c.SITE_SHORT_NAME) + '</span><span class="text-[10px] font-medium uppercase tracking-[0.2em] text-gold-400">Ayurveda</span></span></a>' +
      '<p class="mt-4 text-sm leading-relaxed text-cream-100/70">Authentic Ayurvedic products, carefully selected to support your everyday health and wellness — rooted in ancient wisdom, made for modern life.</p>' +
      '<div class="mt-5 flex gap-2">' +
      '<a href="' + e(soc.instagram) + '" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-cream-100 transition-colors hover:bg-forest-700">' + I.brand("instagram", 17) + "</a>" +
      '<a href="' + e(soc.facebook) + '" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-cream-100 transition-colors hover:bg-forest-700">' + I.brand("facebook", 17) + "</a>" +
      '<a href="' + e(soc.youtube) + '" target="_blank" rel="noopener noreferrer" aria-label="YouTube" class="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-cream-100 transition-colors hover:bg-forest-700">' + I.brand("youtube", 17) + "</a></div></div>" +
      '<nav aria-label="Quick links"><h3 class="text-sm font-semibold uppercase tracking-wider text-gold-400">Quick Links</h3><ul class="mt-4 space-y-2.5 text-sm">' + nav + "</ul></nav>" +
      '<nav aria-label="Product categories"><h3 class="text-sm font-semibold uppercase tracking-wider text-gold-400">Categories</h3><ul class="mt-4 space-y-2.5 text-sm">' + cats + "</ul></nav>" +
      '<div><h3 class="text-sm font-semibold uppercase tracking-wider text-gold-400">Get in Touch</h3><ul class="mt-4 space-y-3 text-sm text-cream-100/70">' +
      '<li class="flex gap-2.5">' + I.lucide("map-pin", 17, "mt-0.5 shrink-0 text-gold-400") + "<span>" + e(c.CONTACT.address) + "</span></li>" + phoneItems +
      '<li><a href="mailto:' + e(c.CONTACT.email) + '" class="flex items-center gap-2.5 transition-colors hover:text-gold-300">' + I.lucide("mail", 17, "shrink-0 text-gold-400") + e(c.CONTACT.email) + "</a></li>" +
      '<li><a href="' + e(global.Utils.whatsAppEnquiryUrl()) + '" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2.5 transition-colors hover:text-gold-300">' + I.brand("whatsapp", 17) + "Chat on WhatsApp</a></li>" +
      "</ul></div></div>" +
      '<div class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-forest-800 pt-6 text-sm text-cream-100/60 sm:flex-row">' +
      "<p>© <span data-year>" + new Date().getFullYear() + "</span> " + e(c.SITE_NAME) + ". All rights reserved.</p>" +
      '<ul class="flex flex-wrap items-center gap-x-5 gap-y-2"><li><a href="privacy-policy.html" class="hover:text-gold-300">Privacy Policy</a></li><li><a href="terms.html" class="hover:text-gold-300">Terms &amp; Conditions</a></li></ul>' +
      "</div></div></footer>";
  }

  // ---- Floating WhatsApp (common/whatsapp-float.tsx) ----
  function whatsappFloat() {
    return '<a href="' + e(global.Utils.whatsAppEnquiryUrl()) + '" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" class="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg transition-all hover:bg-[#1ebe5b] hover:shadow-xl sm:bottom-6 sm:right-6">' +
      I.brand("whatsapp", 24) + '<span class="hidden text-sm font-semibold sm:inline">Need help?</span>' +
      '<span class="absolute -right-1 -top-1 flex h-3 w-3"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span><span class="relative inline-flex h-3 w-3 rounded-full bg-gold-400"></span></span></a>';
  }

  global.Components = {
    buttonClasses: buttonClasses, badge: badge, whatsappButton: whatsappButton, searchBar: searchBar,
    price: price, rating: rating, sectionHeading: sectionHeading, pageHeader: pageHeader,
    categoryCard: categoryCard, productCard: productCard, productGrid: productGrid, productSlider: productSlider,
    newsletterForm: newsletterForm, inputField: inputField, textareaField: textareaField, legal: legal,
    header: header, footer: footer, whatsappFloat: whatsappFloat, catIconName: function (n) { return CAT_ICON[n] || "leaf"; },
  };
})(window);
