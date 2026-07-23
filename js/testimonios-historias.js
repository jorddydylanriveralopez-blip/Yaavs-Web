/**
 * Popup "Ver más historias" — elige y reproduce videos de Yaavsers.
 */
(function () {
  "use strict";

  var VIDEOS = [
    {
      id: "historia-1",
      title: "Historia Yaavser 1",
      lead: "Resultados reales en el mostrador.",
      src: "assets/testimonios/historias-01.mp4",
      poster: "assets/testimonios/historias-01-poster.jpg",
    },
    {
      id: "historia-2",
      title: "Historia Yaavser 2",
      lead: "La red que se nota en cada venta.",
      src: "assets/testimonios/historias-02.mp4",
      poster: "assets/testimonios/historias-02-poster.jpg",
    },
  ];

  var root = null;
  var stage = null;
  var videoEl = null;
  var lastFocus = null;
  var activeId = null;

  function ensureModal() {
    if (root) return root;

    root = document.createElement("div");
    root.className = "tx-historias";
    root.id = "tx-historias";
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    root.innerHTML =
      '<div class="tx-historias__backdrop" data-tx-historias-close aria-hidden="true"></div>' +
      '<div class="tx-historias__panel" role="dialog" aria-modal="true" aria-labelledby="tx-historias-title">' +
      '<button type="button" class="tx-historias__close" data-tx-historias-close aria-label="Cerrar">&times;</button>' +
      '<p class="tx-historias__kicker">Clientes satisfechos</p>' +
      '<h2 class="tx-historias__title" id="tx-historias-title">Más <span>historias</span></h2>' +
      '<p class="tx-historias__lead">Elige un video y dale play para ver a nuestros Yaavsers en acción.</p>' +
      '<div class="tx-historias__picks" data-tx-historias-picks></div>' +
      '<div class="tx-historias__stage is-empty" data-tx-historias-stage>' +
      '<div class="tx-historias__stage-empty">Selecciona un video para reproducirlo</div>' +
      '<video class="tx-historias__video" playsinline controls preload="metadata" hidden></video>' +
      "</div>" +
      "</div>";

    document.body.appendChild(root);
    stage = root.querySelector("[data-tx-historias-stage]");
    videoEl = root.querySelector(".tx-historias__video");
    var picks = root.querySelector("[data-tx-historias-picks]");

    picks.innerHTML = VIDEOS.map(function (item, i) {
      return (
        '<button type="button" class="tx-historias__pick" data-tx-historia="' +
        item.id +
        '" style="--i:' +
        i +
        '">' +
        '<span class="tx-historias__pick-media">' +
        '<img src="' +
        item.poster +
        '" alt="" width="720" height="1280" loading="lazy" decoding="async">' +
        '<span class="tx-historias__pick-play" aria-hidden="true"></span>' +
        "</span>" +
        '<span class="tx-historias__pick-copy">' +
        "<strong>" +
        item.title +
        "</strong>" +
        "<span>" +
        item.lead +
        "</span>" +
        "</span>" +
        "</button>"
      );
    }).join("");

    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-tx-historias-close]")) {
        close();
        return;
      }
      var pick = e.target.closest("[data-tx-historia]");
      if (pick) playVideo(pick.getAttribute("data-tx-historia"));
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root && root.classList.contains("is-open")) close();
    });

    return root;
  }

  function playVideo(id) {
    var item = VIDEOS.find(function (v) {
      return v.id === id;
    });
    if (!item || !videoEl) return;

    activeId = id;
    root.querySelectorAll(".tx-historias__pick").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-tx-historia") === id);
    });

    stage.classList.remove("is-empty");
    videoEl.hidden = false;
    if (videoEl.getAttribute("src") !== item.src) {
      videoEl.setAttribute("poster", item.poster);
      videoEl.src = item.src;
    }
    videoEl.play().catch(function () {
      /* user gesture may still unlock controls */
    });
  }

  function stopVideo() {
    if (!videoEl) return;
    try {
      videoEl.pause();
      videoEl.removeAttribute("src");
      videoEl.load();
    } catch (e) {
      /* ignore */
    }
    videoEl.hidden = true;
    stage && stage.classList.add("is-empty");
    activeId = null;
    root &&
      root.querySelectorAll(".tx-historias__pick").forEach(function (btn) {
        btn.classList.remove("is-active");
      });
  }

  function open() {
    ensureModal();
    lastFocus = document.activeElement;
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("tx-historias-open");
    requestAnimationFrame(function () {
      root.classList.add("is-open");
    });
    var first = root.querySelector(".tx-historias__pick");
    first && first.focus();
  }

  function close() {
    if (!root) return;
    stopVideo();
    root.classList.remove("is-open");
    document.documentElement.classList.remove("tx-historias-open");
    window.setTimeout(function () {
      if (!root.classList.contains("is-open")) {
        root.hidden = true;
        root.setAttribute("aria-hidden", "true");
      }
    }, 280);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function boot() {
    document.addEventListener(
      "click",
      function (e) {
        var trigger = e.target.closest("[data-tx-historias-open]");
        if (!trigger) return;
        e.preventDefault();
        e.stopPropagation();
        open();
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.YaavsHistorias = { open: open, close: close };
})();
