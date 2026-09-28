/*
 * Scroll-reveal — port of common/reveal.tsx. Progressive enhancement.
 * Exposes window.Reveal.init() so it can run again after JS injects content.
 * Elements: <div data-reveal data-reveal-delay="120"> … </div>
 */
(function (global) {
  "use strict";

  var observer = null;

  function ensureObserver() {
    if (observer || !("IntersectionObserver" in window)) return;
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
          window.setTimeout(function () {
            el.classList.remove("reveal-hidden");
            el.classList.add("is-revealed");
          }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  }

  function init() {
    var els = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]:not(.is-revealed):not(.reveal-hidden)"));
    if (!els.length) return;

    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }

    ensureObserver();
    els.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.9) {
        el.classList.add("reveal-hidden");
        observer.observe(el);
      } else {
        el.classList.add("is-revealed");
      }
    });

    // Safety net: force-reveal anything still hidden after 1.6s.
    window.setTimeout(function () {
      document.querySelectorAll("[data-reveal].reveal-hidden").forEach(function (el) {
        el.classList.remove("reveal-hidden");
        el.classList.add("is-revealed");
      });
    }, 1600);
  }

  global.Reveal = { init: init };
})(window);
