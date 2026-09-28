/*
 * Layout bootstrap — injects the shared header, footer and floating WhatsApp
 * button into every page, then wires nav + reveal. Footer categories are
 * fetched via the Data layer. Also injects site-wide JSON-LD for SEO.
 *
 * Each page has:  <div id="site-header"></div> … <main id="main">…</main> …
 *                 <div id="site-footer"></div>
 */
(function () {
  "use strict";

  function injectSiteJsonLd() {
    var c = window.APP_CONFIG || {};
    var base = (c.SITE_URL || "").replace(/\/$/, "");
    var store = {
      "@context": "https://schema.org", "@type": "Store", "@id": base + "/#store",
      name: c.SITE_NAME, description: c.SITE_TAGLINE, url: base,
      image: base + "/assets/images/misc/og.svg", logo: base + "/assets/images/brand/logo-mark.svg",
      telephone: (c.CONTACT && c.CONTACT.phones) || [], email: c.CONTACT && c.CONTACT.email,
      priceRange: "₹₹",
      address: { "@type": "PostalAddress", streetAddress: c.CONTACT && c.CONTACT.address, addressCountry: "IN" },
      sameAs: c.SOCIAL ? Object.keys(c.SOCIAL).map(function (k) { return c.SOCIAL[k]; }) : [],
    };
    var website = {
      "@context": "https://schema.org", "@type": "WebSite", "@id": base + "/#website",
      name: c.SITE_NAME, url: base,
      potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: base + "/products.html?search={search_term_string}" }, "query-input": "required name=search_term_string" },
    };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify([store, website]);
    document.head.appendChild(s);
  }

  async function boot() {
    // Fill any static icon placeholders first.
    if (window.Icons && window.Icons.render) window.Icons.render(document);

    var headerSlot = document.getElementById("site-header");
    var footerSlot = document.getElementById("site-footer");

    if (headerSlot) headerSlot.innerHTML = window.Components.header();

    // Footer needs the category list — fetch, then render (degrade gracefully).
    var categories = [];
    try { categories = await window.Data.getCategories(); } catch (e) {}
    if (footerSlot) footerSlot.innerHTML = window.Components.footer(categories);

    // Floating WhatsApp button.
    var floatWrap = document.createElement("div");
    floatWrap.innerHTML = window.Components.whatsappFloat();
    document.body.appendChild(floatWrap.firstChild);

    // Static WhatsApp CTAs: build their href from the centralized helper.
    document.querySelectorAll("[data-wa]").forEach(function (a) {
      var kind = a.getAttribute("data-wa");
      a.href = kind === "recommend"
        ? window.Utils.whatsAppEnquiryUrl("I'd like a product recommendation from your Ayurvedic experts.")
        : window.Utils.whatsAppEnquiryUrl();
    });

    injectSiteJsonLd();
    if (window.SiteNav) window.SiteNav.init();
    if (window.Reveal) window.Reveal.init();

    document.dispatchEvent(new CustomEvent("layout:ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
