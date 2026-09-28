/*
 * Global nav behaviour — port of navbar.tsx interactivity.
 * Exposes window.SiteNav.init() (called by layout.js after the header is
 * injected). Handles: scroll shadow, mobile menu toggle, mobile search toggle,
 * search-form redirect to products.html, and [data-year] stamping.
 */
(function (global) {
  "use strict";

  function initNav() {
    var header = document.querySelector("[data-nav]");
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    var searchToggle = document.querySelector("[data-nav-search-toggle]");
    var searchBar = document.querySelector("[data-nav-search]");

    if (header) {
      var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
    if (searchToggle && searchBar) {
      searchToggle.addEventListener("click", function () {
        searchBar.classList.toggle("is-open");
        var input = searchBar.querySelector("input");
        if (searchBar.classList.contains("is-open") && input) input.focus();
      });
    }
  }

  // Search forms redirect to products.html?search= (products.js overrides this
  // on the listing page via a capture-phase handler).
  function initSearch() {
    document.querySelectorAll("form[data-search]").forEach(function (form) {
      if (form.__searchBound) return;
      form.__searchBound = true;
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input");
        var q = (input && input.value.trim()) || "";
        window.location.href = "products.html" + (q ? "?search=" + encodeURIComponent(q) : "");
      });
      var clear = form.querySelector("[data-search-clear]");
      var input = form.querySelector("input");
      if (clear && input) {
        var sync = function () { clear.hidden = !input.value; };
        sync();
        input.addEventListener("input", sync);
        clear.addEventListener("click", function () {
          input.value = "";
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.focus();
          sync();
        });
      }
    });
  }

  function initYear() {
    var y = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = y; });
  }

  function init() { initNav(); initSearch(); initYear(); }

  global.SiteNav = { init: init };
})(window);
