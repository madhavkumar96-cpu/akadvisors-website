/* AK Advisors: motion system (smooth scroll, reveals, headline entrances, tilt, header, progress).
   Requires GSAP + ScrollTrigger and Lenis (loaded from CDN before this file).
   Everything is skipped for visitors who prefer reduced motion. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function unhide() { root.classList.remove("motion-pending"); }
  if (reduce || !window.gsap || !window.ScrollTrigger) { unhide(); headerOnly(); return; }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  gsap.defaults({ ease: "power3.out", duration: 0.8 });

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.1, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    lenis.on("scroll", ST.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    // In-page anchors glide with header offset
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href*="#"]');
      if (!a || a.hasAttribute("data-book")) return;
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash || url.hash === "#") return;
      var target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -76, duration: 1.2 });
      history.pushState(null, "", url.hash);
    });
    // Pause smooth scroll while the booking dialog is open
    new MutationObserver(function () {
      if (root.classList.contains("dialog-open")) lenis.stop(); else lenis.start();
    }).observe(root, { attributes: true, attributeFilter: ["class"] });
    if (location.hash) {
      var t0 = document.querySelector(location.hash);
      if (t0) setTimeout(function () { lenis.scrollTo(t0, { offset: -76, immediate: true }); }, 50);
    }
  }

  /* ---------- Headline word entrances ---------- */
  function splitWords(el) {
    if (!el || el.dataset.split) return [];
    el.dataset.split = "1";
    var words = [];
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement("span"); w.className = "w";
            var i = document.createElement("span"); i.className = "wi"; i.textContent = part;
            w.appendChild(i); frag.appendChild(w); words.push(i);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) { walk(n); }
      });
    };
    walk(el);
    return words;
  }

  var isMobile = window.matchMedia("(max-width: 820px)").matches;
  var intro = gsap.timeline({ delay: 0.1 });
  if (isMobile) {
    // Phones: logo, headline and call to action are visible immediately; only the compass eases in
    intro.from(".hero-art", { opacity: 0, y: 14, scale: 0.92, duration: 1.1, ease: "power2.out" }, 0);
  } else {
  var heroTitle = document.querySelector(".hero h1, .page-hero h1");
  var heroWords = splitWords(heroTitle);
  intro.from(".site-header", { y: -24, opacity: 0, duration: 0.7 }, 0);
  if (heroWords.length) intro.from(heroWords, { yPercent: 110, duration: 0.9, stagger: 0.045, ease: "power4.out" }, 0.1);
  intro.from([".hero .eyebrow", ".page-hero .crumbs", ".page-hero .eyebrow"].join(","), { y: 12, opacity: 0, duration: 0.6 }, 0.05);
  intro.from(".hero .lede, .page-hero .lede, .page-hero .asof-line", { y: 18, opacity: 0, duration: 0.8 }, 0.45);
  intro.from(".hero-actions > *, .hero-micro", { y: 16, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.6);
  intro.from(".hero-proof li", { y: 18, opacity: 0, duration: 0.7, stagger: 0.09 }, 0.75);
  intro.from(".subnav li", { y: 10, opacity: 0, duration: 0.5, stagger: 0.04 }, 0.6);
  intro.from(".hero-art", { opacity: 0, scale: 0.94, duration: 1.4, ease: "power2.out" }, 0.2);
  }

  /* ---------- Section headline reveals ---------- */
  gsap.utils.toArray(".section-head h2, .cta-band h2, .contact h2").forEach(function (h) {
    var ws = splitWords(h);
    if (!ws.length) return;
    gsap.from(ws, { yPercent: 110, duration: 0.85, stagger: 0.035, ease: "power4.out",
      scrollTrigger: { trigger: h, start: "top 88%", once: true } });
  });

  /* ---------- Block reveals ---------- */
  var REVEAL = ".section-head .eyebrow, .section-intro, .service, .step, .card, .partner, .hub-card, .snap, .os-item, .other-head, .faq-item, .scheme, .tpl, .news-item, .notice, .mandate-note, .cta-band p, .cta-band-actions, .rate-tile, .tool-intro, .tool-inputs, .tool-results, .contact-copy > *, .contact-action, .check-group, .os-note, .snap-asof, .svc-row, .file-item, .fee-bar, .fee-notes, .rule-line, .gantt, .file-head, .lender-note, .track";
  var items = gsap.utils.toArray(REVEAL).filter(function (el) { return !el.closest("details .os-body"); });

  // Collapsible sections: animate their contents when opened
  gsap.utils.toArray("details").forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) gsap.fromTo(d.querySelectorAll(".os-item, .os-note"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.05, overwrite: true });
      refreshSoon && refreshSoon();
    });
  });
  gsap.set(items, { opacity: 0, y: 28 });
  unhide();
  ST.batch(items, {
    start: "top 90%",
    once: true,
    onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: 0.85, stagger: 0.07, overwrite: true }); }
  });

  /* ---------- Parallax ---------- */
  if (document.querySelector(".hero-art")) {
    gsap.to(".hero-art", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  }
  gsap.utils.toArray(".page-hero, .cta-band, .contact").forEach(function (sec) {
    gsap.fromTo(sec, { "--wm-y": "-30px" }, { "--wm-y": "30px", ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- Charts and bars grow in ---------- */
  function animateBars() {
    gsap.utils.toArray(".ladder .bar, .hbars .hb-bar, .stack-bar span, .g-bar").forEach(function (b) {
      if (b.dataset.anim) return; b.dataset.anim = "1";
      gsap.from(b, { scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: "power2.out",
        scrollTrigger: { trigger: b, start: "top 92%", once: true } });
    });
    var line = document.querySelector("#history-chart .s1");
    if (line && !line.dataset.anim) {
      line.dataset.anim = "1";
      var len = line.getTotalLength();
      gsap.fromTo(line, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2, ease: "power2.inOut",
        scrollTrigger: { trigger: "#history-chart", start: "top 85%", once: true },
        onComplete: function () { line.style.strokeDasharray = ""; line.style.strokeDashoffset = ""; } });
      gsap.from("#history-chart .s2, #history-chart .spread, #history-chart .lbl", { opacity: 0, duration: 1.2, delay: 0.6,
        scrollTrigger: { trigger: "#history-chart", start: "top 85%", once: true } });
    }
  }
  animateBars();

  /* ---------- Tilt with light ---------- */
  if (finePointer) {
    gsap.utils.toArray(".hub-card, .service, .partner, .scheme, .tpl, .os-item, .rate-tile, .card").forEach(function (el) {
      el.classList.add("tilt");
      var rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
      var ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        var max = el.offsetWidth > 520 ? 1.5 : 4;
        ry((x - 0.5) * max * 2); rx((0.5 - y) * max * 2);
        el.style.setProperty("--mx", (x * 100) + "%"); el.style.setProperty("--my", (y * 100) + "%");
      });
      el.addEventListener("pointerleave", function () { rx(0); ry(0); });
    });

    /* Magnetic primary buttons */
    gsap.utils.toArray(".hero .btn, .cta-band .btn-light, .site-nav .btn").forEach(function (b) {
      var bx = gsap.quickTo(b, "x", { duration: 0.5, ease: "power3.out" });
      var by = gsap.quickTo(b, "y", { duration: 0.5, ease: "power3.out" });
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        bx((e.clientX - r.left - r.width / 2) * 0.18); by((e.clientY - r.top - r.height / 2) * 0.25);
      });
      b.addEventListener("pointerleave", function () { bx(0); by(0); });
    });
  }

  /* ---------- Scroll progress ---------- */
  var bar = document.createElement("div");
  bar.className = "scroll-progress"; bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  headerOnly();
  // Re-measure trigger positions whenever layout settles (fonts, 3D hero, data-driven sections)
  var rto;
  function refreshSoon() { clearTimeout(rto); rto = setTimeout(function () { ST.refresh(); }, 150); }
  window.addEventListener("load", refreshSoon);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshSoon);
  if (window.ResizeObserver) new ResizeObserver(refreshSoon).observe(document.body);

  /* ---------- Header: compact on scroll, tuck away going down ---------- */
  function headerOnly() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var last = window.scrollY, ticking = false;
    function update() {
      var y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 12);
      var navOpen = document.querySelector(".site-nav.is-open");
      if (!reduce && !navOpen && y > 420 && y > last + 4) header.classList.add("is-hidden");
      else if (y < last - 4 || y < 420) header.classList.remove("is-hidden");
      last = y; ticking = false;
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }
})();
