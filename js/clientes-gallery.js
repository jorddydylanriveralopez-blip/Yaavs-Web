(function () {
  "use strict";

  var CACHE = "20260812f";

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
      src: "assets/testimonios/clientes-02.jpg?v=" + CACHE,
      name: "Andrea Ruiz",
      role: "Socia comercial · Estado de México",
      quote:
        "Me encanta ser parte de la red. El soporte es rápido, claro y siempre hay alguien para ayudarte.",
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

    CLIENTS.forEach(function (client, index) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "tx-clients__card";
      card.setAttribute("data-tx-client-index", String(index));
      card.setAttribute(
        "aria-label",
        "Ver reseña de " + client.name + ", " + client.stars + " estrellas"
      );
      card.innerHTML =
        '<img src="' +
        client.src +
        '" alt="' +
        client.name +
        '" width="941" height="1672" loading="lazy" decoding="async">' +
        '<span class="tx-clients__card-meta">' +
        '<span class="tx-clients__card-stars" aria-hidden="true">' +
        "★★★★★".slice(0, client.stars) +
        "</span>" +
        '<span class="tx-clients__card-name">' +
        client.name +
        "</span>" +
        "</span>";
      track.appendChild(card);
    });

    var cards = Array.prototype.slice.call(
      track.querySelectorAll("[data-tx-client-index]")
    );
    var carouselIndex = 0;
    var lbIndex = 0;
    var dialog = ensureLightbox();
    var lbImg = dialog.querySelector(".tx-clients-lb__img");
    var lbQuote = dialog.querySelector("[data-tx-lb-quote]");
    var lbName = dialog.querySelector("[data-tx-lb-name]");
    var lbRole = dialog.querySelector("[data-tx-lb-role]");
    var lbStars = dialog.querySelector("[data-tx-lb-stars]");
    var lbCount = dialog.querySelector("[data-tx-lb-count]");
    var lbOpen = false;

    function cardStep() {
      if (!cards.length) return 0;
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.gap || style.columnGap) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    }

    function maxIndex() {
      var visible = Math.max(
        1,
        Math.round(viewport.clientWidth / Math.max(cardStep(), 1))
      );
      return Math.max(0, cards.length - visible);
    }

    function goTo(nextIndex, animate) {
      carouselIndex = Math.max(0, Math.min(maxIndex(), nextIndex));
      track.style.transition = animate === false ? "none" : "";
      track.style.transform =
        "translate3d(" + -carouselIndex * cardStep() + "px, 0, 0)";
      if (prevBtn) prevBtn.disabled = carouselIndex <= 0;
      if (nextBtn) nextBtn.disabled = carouselIndex >= maxIndex();
    }

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
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      document.documentElement.classList.add("is-tx-clients-lb-open");
    }

    function closeLightbox() {
      lbOpen = false;
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

    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        openLightbox(Number(card.getAttribute("data-tx-client-index")) || 0);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goTo(carouselIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goTo(carouselIndex + 1);
      });
    }

    dialog.querySelector("[data-tx-lb-close]").addEventListener("click", closeLightbox);
    dialog.querySelector("[data-tx-lb-prev]").addEventListener("click", lbPrev);
    dialog.querySelector("[data-tx-lb-next]").addEventListener("click", lbNext);

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeLightbox();
    });

    dialog.addEventListener("close", function () {
      lbOpen = false;
      document.documentElement.classList.remove("is-tx-clients-lb-open");
    });

    document.addEventListener("keydown", function (event) {
      if (!lbOpen) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        lbPrev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        lbNext();
      }
      if (event.key === "Escape") closeLightbox();
    });

    var touchStartX = 0;
    var touchDelta = 0;
    viewport.addEventListener(
      "touchstart",
      function (event) {
        touchStartX = event.changedTouches[0].clientX;
        touchDelta = 0;
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
        if (Math.abs(touchDelta) > 48) {
          if (touchDelta < 0) goTo(carouselIndex + 1);
          else goTo(carouselIndex - 1);
        }
      },
      { passive: true }
    );

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        goTo(carouselIndex, false);
      }, 120);
    });

    goTo(0, false);
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
