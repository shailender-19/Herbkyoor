/*
 * Carousels & sliders — ports of ad-slider.tsx, testimonials.tsx and
 * product-slider.tsx. Markup-driven; exposes window.Carousel.init(root) so it
 * can run after JS injects carousels/sliders.
 *
 * Autoplay carousel:  [data-carousel] > [data-carousel-track] > slides
 *                     + [data-carousel-prev/next] + [data-carousel-dot]*
 * Scroll rail:        [data-slider] > [data-slider-track] + [data-slider-prev/next]
 */
(function (global) {
  "use strict";

  var reduced = function () {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  function initCarousel(root) {
    if (root.__carouselBound) return;
    root.__carouselBound = true;
    var track = root.querySelector("[data-carousel-track]");
    if (!track) return;
    var slides = Array.prototype.slice.call(track.children);
    var count = slides.length;
    if (!count) return;

    var prevBtn = root.querySelector("[data-carousel-prev]");
    var nextBtn = root.querySelector("[data-carousel-next]");
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-carousel-dot]"));
    var interval = parseInt(root.getAttribute("data-carousel-interval") || "0", 10);
    var index = 0, paused = false, timer = null;

    function render() {
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach(function (d, i) {
        var a = i === index;
        d.classList.toggle("is-active", a);
        d.setAttribute("aria-current", String(a));
      });
      slides.forEach(function (s, i) { s.setAttribute("aria-hidden", String(i !== index)); });
    }
    function go(i) { index = (i % count + count) % count; render(); }
    var next = function () { go(index + 1); };
    var prev = function () { go(index - 1); };

    if (nextBtn) nextBtn.addEventListener("click", next);
    if (prevBtn) prevBtn.addEventListener("click", prev);
    dots.forEach(function (d, i) { d.addEventListener("click", function () { go(i); }); });

    function start() {
      if (!interval || reduced() || count < 2) return;
      stop();
      timer = window.setInterval(function () { if (!paused) next(); }, interval);
    }
    function stop() { if (timer) window.clearInterval(timer); timer = null; }

    root.addEventListener("mouseenter", function () { paused = true; });
    root.addEventListener("mouseleave", function () { paused = false; });
    root.addEventListener("focusin", function () { paused = true; });
    root.addEventListener("focusout", function () { paused = false; });

    render();
    start();
  }

  function initSlider(root) {
    if (root.__sliderBound) return;
    root.__sliderBound = true;
    var track = root.querySelector("[data-slider-track]");
    if (!track) return;
    var prevBtn = root.querySelector("[data-slider-prev]");
    var nextBtn = root.querySelector("[data-slider-next]");
    var scroll = function (dir) { track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: "smooth" }); };
    if (nextBtn) nextBtn.addEventListener("click", function () { scroll(1); });
    if (prevBtn) prevBtn.addEventListener("click", function () { scroll(-1); });
  }

  function init(root) {
    root = root || document;
    root.querySelectorAll("[data-carousel]").forEach(initCarousel);
    root.querySelectorAll("[data-slider]").forEach(initSlider);
  }

  global.Carousel = { init: init };
})(window);
