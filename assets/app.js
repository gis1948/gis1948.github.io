/* JusoorAI — minimal progressive enhancement. No dependencies, no tracking. */
(function () {
  "use strict";

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
  }

  // Header elevation after scroll
  var head = document.querySelector(".site-head");
  if (head) {
    var onScroll = function () {
      head.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Current page marker for assistive tech
  var path = location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".site-nav a").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href && href !== "/" && path.indexOf(href) === 0) {
      link.setAttribute("aria-current", "page");
    }
  });

  // Reveal on scroll, skipped entirely when the visitor prefers reduced motion
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { observer.observe(el); });
  }

  // Download platform filter
  var chips = document.querySelectorAll('[data-filter]');
  var dlCards = document.querySelectorAll('[data-platform]');
  var counter = document.querySelector('[data-count]');
  if (chips.length && dlCards.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var key = chip.getAttribute('data-filter');
        chips.forEach(function (other) {
          other.classList.toggle('is-active', other === chip);
          other.setAttribute('aria-pressed', other === chip ? 'true' : 'false');
        });
        var shown = 0;
        dlCards.forEach(function (card) {
          var tags = (card.getAttribute('data-platform') || '').split(/\s+/);
          var match = key === 'all' || tags.indexOf(key) !== -1;
          card.classList.toggle('is-hidden', !match);
          if (match) shown += 1;
        });
        if (counter) counter.textContent = shown + (shown === 1 ? ' entry' : ' entries');
      });
    });
  }

  // Year in the footer
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
