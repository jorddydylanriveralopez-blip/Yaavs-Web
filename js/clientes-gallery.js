(function () {
  "use strict";

  var CACHE = "20260812j";

  var CLIENTS = [
    { src: "assets/testimonios/clientes-01.jpg?v=" + CACHE },
    { src: "assets/testimonios/clientes-03.jpg?v=" + CACHE },
    { src: "assets/testimonios/clientes-04.jpg?v=" + CACHE },
    { src: "assets/testimonios/clientes-05.jpg?v=" + CACHE },
    { src: "assets/testimonios/clientes-06.jpg?v=" + CACHE },
  ];

  function initClients(root) {
    if (!root || root.dataset.txClientsReady === "1") return;
    root.dataset.txClientsReady = "1";

    var track = root.querySelector("[data-tx-clients-track]");
    var trackB = root.querySelector("[data-tx-clients-track-b]");
    var viewport = root.querySelector("[data-tx-clients-viewport]");
    var viewports = root.querySelectorAll("[data-tx-clients-viewport]");
    var stage = root.querySelector(".tx-clients__stage");
    var leftRail = root.querySelector(".tx-clients__rail--left");
    var feature = root.querySelector(".tx-clients__feature");
    var prevBtn = root.querySelector("[data-tx-clients-prev]");
    var nextBtn = root.querySelector("[data-tx-clients-next]");
    if (!track || !viewport) return;

    function makeCard(client, duplicate) {
      var card = document.createElement("figure");
      card.className = "tx-clients__card";
      if (duplicate) card.setAttribute("aria-hidden", "true");
      card.innerHTML =
        '<img src="' +
        client.src +
        '" alt="" width="941" height="1672" loading="lazy" decoding="async">';
      return card;
    }

    CLIENTS.forEach(function (client) {
      track.appendChild(makeCard(client, false));
    });
    CLIENTS.forEach(function (client) {
      track.appendChild(makeCard(client, true));
    });
    if (trackB) {
      Array.from(track.children).forEach(function (node) {
        trackB.appendChild(node.cloneNode(true));
      });
    }

    root.classList.add("is-marquee", "is-js-marquee");

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      root.classList.add("is-static");
      root.classList.remove("is-js-marquee");
    }

    var offset = 0;
    var halfWidth = 0;
    var step = 0;
    var rafId = 0;
    var lastTs = 0;
    var speed = 42;
    var hovering = false;
    var resumeTimer = 0;
    var manualHoldMs = 6500;

    function holeWidth() {
      if (!leftRail || !feature) return 0;
      var gap = stage ? parseFloat(window.getComputedStyle(stage).columnGap) || 0 : 0;
      return leftRail.getBoundingClientRect().width + feature.getBoundingClientRect().width + gap;
    }

    function paintTracks() {
      track.style.transform = "translate3d(" + offset + "px, 0, 0)";
      if (trackB) {
        trackB.style.transform = "translate3d(" + (offset - holeWidth()) + "px, 0, 0)";
      }
    }

    function measure() {
      var firstCards = track.querySelectorAll(".tx-clients__card");
      if (!firstCards.length) return;
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.gap || style.columnGap) || 0;
      step = firstCards[0].getBoundingClientRect().width + gap;
      halfWidth = track.scrollWidth / 2;
      if (halfWidth > 0) {
        while (offset <= -halfWidth) offset += halfWidth;
        while (offset > 0) offset -= halfWidth;
      }
      paintTracks();
    }

    function normalizeOffset() {
      if (halfWidth <= 0) return;
      while (offset <= -halfWidth) offset += halfWidth;
      while (offset > 0) offset -= halfWidth;
    }

    function paint() {
      normalizeOffset();
      paintTracks();
    }

    function canAuto() {
      return (
        !reducedMotion &&
        !hovering &&
        !root.classList.contains("is-manual") &&
        halfWidth > 0
      );
    }

    function tick(ts) {
      if (!lastTs) lastTs = ts;
      var delta = ts - lastTs;
      lastTs = ts;
      if (canAuto()) {
        offset -= (speed * delta) / 1000;
        paint();
      }
      rafId = window.requestAnimationFrame(tick);
    }

    function startAuto() {
      if (reducedMotion || rafId) return;
      lastTs = 0;
      rafId = window.requestAnimationFrame(tick);
    }

    function holdManual() {
      root.classList.add("is-manual", "is-paused");
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(function () {
        root.classList.remove("is-manual", "is-paused");
      }, manualHoldMs);
    }

    function nudge(direction) {
      if (reducedMotion || step <= 0) return;
      holdManual();
      offset += direction * step;
      paint();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        nudge(1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        nudge(-1);
      });
    }

    viewports.forEach(function (vp) {
      vp.addEventListener("mouseenter", function () {
        hovering = true;
      });
      vp.addEventListener("mouseleave", function () {
        hovering = false;
      });
    });

    document.addEventListener("keydown", function (event) {
      if (!root.matches(":hover") && document.activeElement !== prevBtn && document.activeElement !== nextBtn) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        nudge(1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        nudge(-1);
      }
    });

    var touchStartX = 0;
    var touchDelta = 0;
    var touchTarget = stage || viewport;
    touchTarget.addEventListener(
      "touchstart",
      function (event) {
        touchStartX = event.changedTouches[0].clientX;
        touchDelta = 0;
        hovering = true;
      },
      { passive: true }
    );
    touchTarget.addEventListener(
      "touchmove",
      function (event) {
        touchDelta = event.changedTouches[0].clientX - touchStartX;
      },
      { passive: true }
    );
    touchTarget.addEventListener(
      "touchend",
      function () {
        hovering = false;
        if (Math.abs(touchDelta) > 48) {
          if (touchDelta < 0) nudge(-1);
          else nudge(1);
        }
      },
      { passive: true }
    );

    window.addEventListener("resize", function () {
      measure();
    });

    window.requestAnimationFrame(function () {
      measure();
      startAuto();
    });
  }

  function boot() {
    document.querySelectorAll("[data-tx-clients]").forEach(initClients);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
