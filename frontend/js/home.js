/*
 * Home page — fetches and renders the dynamic sections (promo/ad carousel,
 * categories grid, featured products rail, testimonials), then inits carousels
 * and scroll-reveal. Static sections live in index.html.
 */
(function () {
  "use strict";
  var C = window.Components, I = window.Icons, U = window.Utils, e = function (s) { return U.escapeHtml(s == null ? "" : s); };

  function adSlider(ads) {
    var slides = ads.map(function (ad, i) {
      var accent = ad.accent || "#274a37";
      return '<div class="relative w-full shrink-0"' + (i !== 0 ? ' aria-hidden="true"' : "") + ">" +
        '<div class="relative aspect-[3/2] w-full sm:aspect-[21/9] md:aspect-[24/8]">' +
        '<img src="' + e(ad.image) + '" alt="" class="absolute inset-0 h-full w-full object-cover">' +
        '<div class="absolute inset-0" style="background: linear-gradient(90deg, ' + e(accent) + "f2 0%, " + e(accent) + 'b3 45%, transparent 100%)" aria-hidden="true"></div>' +
        '<div class="absolute inset-0 flex items-center"><div class="max-w-lg px-6 sm:px-10 lg:px-14">' +
        (ad.eyebrow ? '<span class="inline-block rounded-full bg-cream-50/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cream-50 backdrop-blur">' + e(ad.eyebrow) + "</span>" : "") +
        '<h3 class="mt-3 text-2xl font-bold text-cream-50 text-balance sm:text-3xl lg:text-4xl">' + e(ad.title) + "</h3>" +
        '<p class="mt-2 max-w-md text-sm text-cream-100/90 sm:text-base">' + e(ad.subtitle) + "</p>" +
        '<a href="' + e(ad.ctaHref) + '" class="' + C.buttonClasses("gold", "md", "mt-5") + '">' + e(ad.ctaLabel) + "</a>" +
        "</div></div></div></div>";
    }).join("");
    var dots = ads.length > 1 ? ads.map(function (ad, i) {
      return '<button type="button" data-carousel-dot aria-label="Go to promotion ' + (i + 1) + '"' + (i === 0 ? ' aria-current="true"' : "") + ' class="carousel-dot carousel-dot--light' + (i === 0 ? " is-active" : "") + '"></button>';
    }).join("") : "";
    var arrows = ads.length > 1 ?
      '<button type="button" data-carousel-prev aria-label="Previous promotion" class="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/80 text-forest-800 opacity-100 shadow transition-opacity hover:bg-cream-50 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100">' + I.lucide("chevron-left", 20) + "</button>" +
      '<button type="button" data-carousel-next aria-label="Next promotion" class="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/80 text-forest-800 opacity-100 shadow transition-opacity hover:bg-cream-50 focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100">' + I.lucide("chevron-right", 20) + "</button>" +
      '<div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">' + dots + "</div>" : "";
    return '<section class="group relative overflow-hidden rounded-3xl border border-cream-300 shadow-sm" data-carousel data-carousel-interval="5500" aria-roledescription="carousel" aria-label="Promotions">' +
      '<div class="flex transition-transform duration-700 ease-out" data-carousel-track>' + slides + "</div>" + arrows + "</section>";
  }

  function testimonials(items) {
    var slides = items.map(function (t, i) {
      var stars = "";
      for (var s = 0; s < 5; s++) stars += I.lucide("star", 18, s < t.rating ? "fill-gold-400 text-gold-400" : "text-forest-600");
      return '<div class="w-full shrink-0"' + (i !== 0 ? ' aria-hidden="true"' : "") + ">" +
        '<div class="rounded-3xl border border-forest-800 bg-forest-800/50 p-8 text-center sm:p-10">' +
        I.lucide("quote", 40, "mx-auto text-gold-400/60") +
        '<div class="mt-4 flex justify-center gap-0.5" aria-label="Rated ' + e(t.rating) + ' out of 5">' + stars + "</div>" +
        '<blockquote class="mt-5 text-lg leading-relaxed text-cream-100 text-balance sm:text-xl">“' + e(t.review) + '”</blockquote>' +
        '<div class="mt-6 flex items-center justify-center gap-3"><img src="' + e(t.avatar) + '" alt="" width="48" height="48" class="h-12 w-12 rounded-full">' +
        '<div class="text-left"><p class="font-semibold text-cream-50">' + e(t.name) + '</p><p class="text-sm text-cream-100/60">' + e(t.location) + "</p></div></div></div></div>";
    }).join("");
    var dots = items.map(function (t, i) {
      return '<button type="button" data-carousel-dot aria-label="Go to testimonial ' + (i + 1) + '"' + (i === 0 ? ' aria-current="true"' : "") + ' class="carousel-dot carousel-dot--gold' + (i === 0 ? " is-active" : "") + '"></button>';
    }).join("");
    return '<section class="relative mx-auto mt-10 max-w-3xl" data-carousel data-carousel-interval="6000" aria-roledescription="carousel" aria-label="Customer testimonials">' +
      '<div class="overflow-hidden"><div class="flex transition-transform duration-700 ease-out" data-carousel-track>' + slides + "</div></div>" +
      '<div class="mt-6 flex items-center justify-center gap-4">' +
      '<button type="button" data-carousel-prev aria-label="Previous testimonial" class="flex h-10 w-10 items-center justify-center rounded-full border border-forest-700 text-cream-100 transition-colors hover:bg-forest-800">' + I.lucide("chevron-left", 18) + "</button>" +
      '<div class="flex gap-2">' + dots + "</div>" +
      '<button type="button" data-carousel-next aria-label="Next testimonial" class="flex h-10 w-10 items-center justify-center rounded-full border border-forest-700 text-cream-100 transition-colors hover:bg-forest-800">' + I.lucide("chevron-right", 18) + "</button>" +
      "</div></section>";
  }

  async function init() {
    var results = await Promise.all([
      window.Data.getAdvertisements(),
      window.Data.getCategories(),
      window.Data.getFeatured(),
      window.Data.getTestimonials(),
    ]);
    var ads = results[0], categories = results[1], featured = results[2], tItems = results[3];

    var promo = document.getElementById("promo-section");
    var adWrap = document.getElementById("ad-slider");
    if (adWrap && ads.length) adWrap.innerHTML = adSlider(ads);
    else if (promo) promo.remove();

    var grid = document.getElementById("categories-grid");
    if (grid) grid.innerHTML = categories.map(function (c, i) {
      return '<div data-reveal data-reveal-delay="' + (i * 60) + '">' + C.categoryCard(c) + "</div>";
    }).join("");

    var feat = document.getElementById("featured-slider");
    if (feat) feat.innerHTML = C.productSlider(featured);

    var test = document.getElementById("testimonials-carousel");
    if (test && tItems.length) test.innerHTML = testimonials(tItems);

    if (window.Carousel) window.Carousel.init(document);
    if (window.Reveal) window.Reveal.init();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
