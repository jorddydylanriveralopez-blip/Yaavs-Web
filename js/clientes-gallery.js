(function () {
  "use strict";

  var CACHE = "20260812j";

  var CLIENTS = [
    {
      src: "assets/testimonios/clientes-01.jpg?v=" + CACHE,
      name: "Carlos Mendoza",
      role: "Punto de venta · CDMX",
      quote:
        "Excelente atención y siempre hay stock. Con YAAVS siento respaldo real para mi negocio.",
      stars: 5,
    },
    {
      src: "assets/testimonios/clientes-03.jpg?v=" + CACHE,
      name: "María Elena Soto",
      role: "Cliente YAAVS · Puebla",
      quote:
        "Gané con YAAVS y el trato fue increíble de principio a fin. Se nota la calidad humana.",
      stars: 5,
    },
    {
      src: "assets/testimonios/clientes-04.jpg?v=" + CACHE,
      name: "Luis Hernández",
      role: "Emprendedor · Guadalajara",
      quote:
        "Premios reales y un equipo que sí te acompaña. Recomiendo YAAVS al 100%.",
      stars: 5,
    },
    {
      src: "assets/testimonios/clientes-05.jpg?v=" + CACHE,
      name: "Patricia Gómez",
      role: "Aliada comercial · Monterrey",
      quote:
        "Trabajar con YAAVS se siente profesional y cercano al mismo tiempo. Una gran experiencia.",
      stars: 5,
    },
    {
      src: "assets/testimonios/clientes-06.jpg?v=" + CACHE,
      name: "Javier Navarro",
      role: "Socio destacado · Red YAAVS",
      quote:
        "El reconocimiento habla por sí solo. Estoy orgulloso de crecer dentro de esta red comercial.",
      stars: 5,
    },
  ];

  function starsHtml(count) {
    var n = Math.max(1, Math.min(5, Number(count) || 5));
    var out = "";
    for (var i = 0; i < 5; i += 1) {
      out +=
        '<span class="tx-clients-lb__star' +
        (i < n ? " is-on" : "") +
        '" aria-hidden="true">★</span>';
    }
    return (
      '<div class="tx-clients-lb__stars" role="img" aria-label="' +
      n +
      ' de 5 estrellas">' +
      out +
      "</div>"
    );
  }

  function ensureLightbox() {
    var dialog = document.getElementById("tx-clients-lightbox");
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.id = "tx-clients-lightbox";
    dialog.className = "tx-clients-lb";
    dialog.setAttribute("aria-labelledby", "tx-clients-lb-name");
    dialog.innerHTML =
      '<div class="tx-clients-lb__shell">' +
      '<button type="button" class="tx-clients-lb__close" data-tx-lb-close aria-label="Cerrar">×</button>' +
      '<button type="button" class="tx-clients-lb__nav tx-clients-lb__nav--prev" data-tx-lb-prev aria-label="Anterior">‹</button>' +
      '<button type="button" class="tx-clients-lb__nav tx-clients-lb__nav--next" data-tx-lb-next aria-label="Siguiente">›</button>' +
      '<div class="tx-clients-lb__media">' +
      '<img class="tx-clients-lb__img" src="" alt="" width="941" height="1672">' +
      "</div>" +
      '<div class="tx-clients-lb__info">' +
      '<p class="tx-clients-lb__kicker">Reseña YAAVS</p>' +
      '<div data-tx-lb-stars></div>' +
      '<blockquote class="tx-clients-lb__quote" data-tx-lb-quote></blockquote>' +
      '<p class="tx-clients-lb__name" id="tx-clients-lb-name" data-tx-lb-name></p>' +
      '<p class="tx-clients-lb__role" data-tx-lb-role></p>' +
      '<p class="tx-clients-lb__count" data-tx-lb-count></p>' +
      "</div>" +
      "</div>";

    document.body.appendChild(dialog);
    return dialog;
  }

  function initClients(root) {
    if (!root || root.dataset.txClientsReady === "1") return;
    root.dataset.txClientsReady = "1";

    var track = root.querySelector("[data-tx-clients-track]");
    var viewport = root.querySelector("[data-tx-clients-viewport]");
    var prevBtn = root.querySelector("[data-tx-clients-prev]");
    var nextBtn = root.querySelector("[data-tx-clients-next]");
    if (!track || !viewport) return;

    function makeCard(client, index, duplicate) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "tx-clients__card";
      card.setAttribute("data-tx-client-index", String(index));
      if (duplicate) {
        card.setAttribute("tabindex", "-1");
        card.setAttribute("aria-hidden", "true");
      }
      card.setAttribute(
        "aria-label",
        "Ver reseña de " + client.name + ", " + client.stars + " estrellas"
      );
      card.innerHTML =
        '<img src="' +
        client.src +
        '" alt="' +
        (duplicate ? "" : client.name) +
        '" width="941" height="1672" loading="lazy" decoding="async">' +
        '<span class="tx-clients__card-meta">' +
        '<span class="tx-clients__card-stars" aria-hidden="true">' +
        "★★★★★".slice(0, client.stars) +
        "</span>" +
        '<span class="tx-clients__card-name">' +
        client.name +
        "</span>" +
        "</span>";
      return card;
    }

    CLIENTS.forEach(function (client, index) {
      track.appendChild(makeCard(client, index, false));
    });
    CLIENTS.forEach(function (client, index) {
      track.appendChild(makeCard(client, index, true));
    });

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
    var speed = 42; /* px/s */
    var hovering = false;
    var lbOpen = false;
    var resumeTimer = 0;
    var manualHoldMs = 6500;

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
      track.style.transform = "translate3d(" + offset + "px, 0, 0)";
    }

    function normalizeOffset() {
      if (halfWidth <= 0) return;
      while (offset <= -halfWidth) offset += halfWidth;
      while (offset > 0) offset -= halfWidth;
    }

    function paint() {
      normalizeOffset();
      track.style.transform = "translate3d(" + offset + "px, 0, 0)";
    }

    function canAuto() {
      return (
        !reducedMotion &&
        !hovering &&
        !lbOpen &&
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

    var lbIndex = 0;
    var dialog = ensureLightbox();
    var lbImg = dialog.querySelector(".tx-clients-lb__img");
    var lbQuote = dialog.querySelector("[data-tx-lb-quote]");
    var lbName = dialog.querySelector("[data-tx-lb-name]");
    var lbRole = dialog.querySelector("[data-tx-lb-role]");
    var lbStars = dialog.querySelector("[data-tx-lb-stars]");
    var lbCount = dialog.querySelector("[data-tx-lb-count]");

    function paintLightbox(i) {
      var client = CLIENTS[i];
      if (!client) return;
      lbImg.src = client.src;
      lbImg.alt = client.name;
      lbQuote.textContent = "“" + client.quote + "”";
      lbName.textContent = client.name;
      lbRole.textContent = client.role;
      lbStars.innerHTML = starsHtml(client.stars);
      lbCount.textContent = i + 1 + " / " + CLIENTS.length;
    }

    function openLightbox(i) {
      lbIndex = Math.max(0, Math.min(CLIENTS.length - 1, i));
      paintLightbox(lbIndex);
      lbOpen = true;
      root.classList.add("is-paused");
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      document.documentElement.classList.add("is-tx-clients-lb-open");
    }

    function closeLightbox() {
      lbOpen = false;
      root.classList.remove("is-paused");
      if (dialog.open) dialog.close();
      document.documentElement.classList.remove("is-tx-clients-lb-open");
    }

    function lbPrev() {
      lbIndex = (lbIndex - 1 + CLIENTS.length) % CLIENTS.length;
      paintLightbox(lbIndex);
    }

    function lbNext() {
      lbIndex = (lbIndex + 1) % CLIENTS.length;
      paintLightbox(lbIndex);
    }

    track.addEventListener("click", function (event) {
      var card = event.target.closest("[data-tx-client-index]");
      if (!card || !track.contains(card)) return;
      openLightbox(Number(card.getAttribute("data-tx-client-index")) || 0);
    });

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

    root.addEventListener("mouseenter", function () {
      hovering = true;
    });
    root.addEventListener("mouseleave", function () {
      hovering = false;
    });

    dialog.querySelector("[data-tx-lb-close]").addEventListener("click", closeLightbox);
    dialog.querySelector("[data-tx-lb-prev]").addEventListener("click", lbPrev);
    dialog.querySelector("[data-tx-lb-next]").addEventListener("click", lbNext);

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeLightbox();
    });

    dialog.addEventListener("close", function () {
      lbOpen = false;
      root.classList.remove("is-paused");
      document.documentElement.classList.remove("is-tx-clients-lb-open");
    });

    document.addEventListener("keydown", function (event) {
      if (lbOpen) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          lbPrev();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          lbNext();
        }
        if (event.key === "Escape") closeLightbox();
        return;
      }

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
    viewport.addEventListener(
      "touchstart",
      function (event) {
        touchStartX = event.changedTouches[0].clientX;
        touchDelta = 0;
        hovering = true;
      },
      { passive: true }
    );
    viewport.addEventListener(
      "touchmove",
      function (event) {
        touchDelta = event.changedTouches[0].clientX - touchStartX;
      },
      { passive: true }
    );
    viewport.addEventListener(
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
