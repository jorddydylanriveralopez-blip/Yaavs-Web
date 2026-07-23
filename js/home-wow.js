/**
 * YAAVS — capa "wow": interacciones dinámicas del home
 * Barra de progreso, auroras, tilt, reveals orgánicos al scroll (solo transform/opacity).
 */
(function () {
  "use strict";

  if (!document.body.classList.contains("page-home")) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ── Barra de progreso de scroll ── */
  var progress = document.createElement("div");
  progress.className = "wow-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  var progressTicking = false;
  function updateProgress() {
    progressTicking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progress.style.setProperty("--wow-scroll", ratio.toFixed(4));
  }
  window.addEventListener(
    "scroll",
    function () {
      if (progressTicking) return;
      progressTicking = true;
      window.requestAnimationFrame(updateProgress);
    },
    { passive: true }
  );
  updateProgress();

  /* ── Auroras de fondo en secciones clave ── */
  if (!reduceMotion) {
    ["#servicios-preview", "#carriers", "#calendario-sorteos"].forEach(function (sel) {
      var section = document.querySelector(sel);
      if (!section || section.querySelector(".wow-aurora")) return;
      var aurora = document.createElement("div");
      aurora.className = "wow-aurora";
      aurora.setAttribute("aria-hidden", "true");
      var position = window.getComputedStyle(section).position;
      if (position === "static") section.style.position = "relative";
      section.prepend(aurora);
    });
  }

  /* ── Glare (destello) en tarjetas de servicios ── */
  if (!reduceMotion && canHover) {
    document.querySelectorAll(".hx-svc-deck__item").forEach(function (item) {
      if (item.querySelector(".wow-glare")) return;
      var glare = document.createElement("span");
      glare.className = "wow-glare";
      glare.setAttribute("aria-hidden", "true");
      item.appendChild(glare);

      item.addEventListener("pointerenter", function () {
        item.classList.add("is-wow-active");
      });
      item.addEventListener("pointerleave", function () {
        item.classList.remove("is-wow-active");
      });
      item.addEventListener(
        "pointermove",
        function (event) {
          var rect = item.getBoundingClientRect();
          item.style.setProperty("--wow-gx", (((event.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%");
          item.style.setProperty("--wow-gy", (((event.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%");
        },
        { passive: true }
      );
    });
  }

  /* ── Tilt 3D + glare en tarjetas de operadores ── */
  if (!reduceMotion && canHover) {
    var MAX_TILT = 6;
    document.querySelectorAll(".hx-ops__deck .hx-ops__card:not(.hx-ops__card--intro)").forEach(function (card) {
      card.setAttribute("data-wow-tilt", "");
      if (window.getComputedStyle(card).position === "static") {
        card.style.position = "relative";
      }
      var glare = document.createElement("span");
      glare.className = "wow-glare";
      glare.setAttribute("aria-hidden", "true");
      card.appendChild(glare);

      var rafId = 0;
      var lastEvent = null;

      function applyTilt() {
        rafId = 0;
        if (!lastEvent) return;
        var rect = card.getBoundingClientRect();
        var px = (lastEvent.clientX - rect.left) / rect.width;
        var py = (lastEvent.clientY - rect.top) / rect.height;
        card.style.setProperty("--wow-ry", ((px - 0.5) * MAX_TILT * 2).toFixed(2) + "deg");
        card.style.setProperty("--wow-rx", ((0.5 - py) * MAX_TILT * 2).toFixed(2) + "deg");
        card.style.setProperty("--wow-gx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--wow-gy", (py * 100).toFixed(1) + "%");
      }

      card.addEventListener("pointerenter", function () {
        card.classList.add("is-wow-active");
        card.style.setProperty("--wow-lift", "-6px");
      });

      card.addEventListener("pointermove", function (event) {
        lastEvent = event;
        if (!rafId) rafId = window.requestAnimationFrame(applyTilt);
      });

      card.addEventListener("pointerleave", function () {
        card.classList.remove("is-wow-active");
        lastEvent = null;
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
        card.style.setProperty("--wow-rx", "0deg");
        card.style.setProperty("--wow-ry", "0deg");
        card.style.setProperty("--wow-lift", "0px");
      });
    });
  }

  /* ── Scroll reveals orgánicos (IntersectionObserver, unobserve al entrar) ── */
  if (!reduceMotion && "IntersectionObserver" in window) {
    var root = document.getElementById("home-experience") || document.body;

    var autoTargets = [
      { sel: ".hx-ops__head", dir: "up" },
      { sel: ".hx-ops__deck", dir: "up" },
      { sel: ".hx-svc-deck__item", dir: "up", stagger: true },
      { sel: ".hx-plan-picker__card", dir: "up", stagger: true },
      { sel: ".hx-plan-picker__or", dir: "fade" },
      { sel: ".hx-raffle__head", dir: "up" },
      { sel: ".hx-raffle__table tbody tr", dir: "left", stagger: true },
      { sel: ".tx-gallery__more", dir: "up" },
      { sel: ".hx-yaavser-band__inner .btn", dir: "up" },
    ];

    var revealNodes = [];
    autoTargets.forEach(function (cfg) {
      root.querySelectorAll(cfg.sel).forEach(function (el, i) {
        if (el.hasAttribute("data-hx-reveal") || el.hasAttribute("data-wow-reveal")) return;
        if (el.closest("[hidden], [aria-hidden='true'][hidden]")) return;
        el.setAttribute("data-wow-reveal", cfg.dir || "up");
        if (cfg.stagger) {
          el.style.setProperty("--wow-stagger", Math.min(i * 55, 420) + "ms");
        }
        revealNodes.push(el);
      });
    });

    /* Secciones: clase is-wow-inview para acentos hijos */
    var sectionNodes = [
      ...root.querySelectorAll(
        ".hx-services, .hx-pulse, .hx-plan-picker, .hx-ops, .tx-gallery--home, .hx-yaavser-band, .hx-raffle"
      ),
    ];
    sectionNodes.forEach(function (sec) {
      sec.classList.add("wow-section");
    });

    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-wow-visible");
          revealObs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealNodes.forEach(function (el) {
      revealObs.observe(el);
    });

    var sectionObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-wow-inview");
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );
    sectionNodes.forEach(function (sec) {
      sectionObs.observe(sec);
    });

    /* Parallax muy ligero solo en 2–3 capas decorativas */
    var parallaxEls = [
      ...root.querySelectorAll(
        ".hx-plan-picker__aurora, .hx-raffle__bg-glow--left, .hx-raffle__bg-glow--right, .wow-aurora"
      ),
    ].slice(0, 4);

    if (parallaxEls.length) {
      parallaxEls.forEach(function (el) {
        el.setAttribute("data-wow-parallax", "");
      });

      var paraTicking = false;
      function updateParallax() {
        paraTicking = false;
        var vh = window.innerHeight || 1;
        parallaxEls.forEach(function (el) {
          var rect = el.getBoundingClientRect();
          if (rect.bottom < -80 || rect.top > vh + 80) return;
          var mid = rect.top + rect.height * 0.5;
          var p = ((mid / vh) - 0.5) * -18;
          el.style.setProperty("--wow-py", p.toFixed(2) + "px");
        });
      }

      window.addEventListener(
        "scroll",
        function () {
          if (paraTicking) return;
          paraTicking = true;
          window.requestAnimationFrame(updateParallax);
        },
        { passive: true }
      );
      updateParallax();
    }
  } else if (reduceMotion) {
    document.querySelectorAll("[data-wow-reveal]").forEach(function (el) {
      el.classList.add("is-wow-visible");
    });
  }
})();
