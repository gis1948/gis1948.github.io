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

  // ---------------------------------------------------------- motion layer
  // Everything below is decoration on top of a complete page: it is skipped
  // for reduced-motion visitors and for touch/coarse pointers, so nothing here
  // is required to read, navigate or use the site.

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Reading progress
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  var progressQueued = false;
  function paintProgress() {
    progressQueued = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.setProperty("--p", value.toFixed(4));
  }
  window.addEventListener("scroll", function () {
    if (!progressQueued) {
      progressQueued = true;
      requestAnimationFrame(paintProgress);
    }
  }, { passive: true });
  paintProgress();

  // Deliberately no count-up on the hero figures: an animated number can sit at
  // a wrong value for a frame or a stalled tab, and these figures state facts
  // about the catalogue. They are simply present, and correct, at all times.

  if (finePointer && !reduced) {
    document.documentElement.classList.add("has-pointer");

    // Cards: cursor light plus a small 3D lean
    document.querySelectorAll(".card, .dl-card").forEach(function (el) {
      el.setAttribute("data-glow", "");
      el.addEventListener("pointermove", function (event) {
        var rect = el.getBoundingClientRect();
        var nx = (event.clientX - rect.left) / rect.width;
        var ny = (event.clientY - rect.top) / rect.height;
        el.style.setProperty("--mx", (nx * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (ny * 100).toFixed(1) + "%");
        el.style.setProperty("--ry", ((nx - 0.5) * 6).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((0.5 - ny) * 6).toFixed(2) + "deg");
      });
      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });

    // Hero: the mark drifts against the pointer, a soft light follows it
    var hero = document.querySelector(".hero");
    var art = document.querySelector(".hero__art");
    if (hero && art) {
      hero.addEventListener("pointermove", function (event) {
        var rect = hero.getBoundingClientRect();
        var nx = (event.clientX - rect.left) / rect.width - 0.5;
        var ny = (event.clientY - rect.top) / rect.height - 0.5;
        hero.style.setProperty("--hx", ((nx + 0.5) * 100).toFixed(1) + "%");
        hero.style.setProperty("--hy", ((ny + 0.5) * 100).toFixed(1) + "%");
        art.style.setProperty("--tx", (nx * 22).toFixed(1) + "px");
        art.style.setProperty("--ty", (ny * 18).toFixed(1) + "px");
      });
      hero.addEventListener("pointerleave", function () {
        art.style.setProperty("--tx", "0px");
        art.style.setProperty("--ty", "0px");
      });
    }

    // Buttons lean very slightly toward the cursor
    document.querySelectorAll(".btn").forEach(function (btn) {
      btn.addEventListener("pointermove", function (event) {
        var rect = btn.getBoundingClientRect();
        var dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        var dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        btn.style.setProperty("--bdx", (dx * 4).toFixed(2) + "px");
        btn.style.setProperty("--bdy", (dy * 3).toFixed(2) + "px");
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.setProperty("--bdx", "0px");
        btn.style.setProperty("--bdy", "0px");
      });
    });

    // Press ripple
    document.addEventListener("pointerdown", function (event) {
      var target = event.target.closest(".btn, .card, .dl-card");
      if (!target) return;
      var rect = target.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 1.1;
      var dot = document.createElement("span");
      dot.className = "ripple";
      dot.style.width = dot.style.height = size + "px";
      dot.style.left = (event.clientX - rect.left - size / 2) + "px";
      dot.style.top = (event.clientY - rect.top - size / 2) + "px";
      target.appendChild(dot);
      setTimeout(function () { dot.remove(); }, 700);
    });
  }
})();
