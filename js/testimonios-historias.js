/**
 * Popup "Ver más historias" — selector + player de videos Yaavsers + fuegos.
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

  var COLORS = ["#00e5ff", "#5ce8f7", "#ffd166", "#ff6b9d", "#a78bfa", "#7CFC00", "#ffffff"];
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var root = null;
  var stage = null;
  var videoEl = null;
  var fxCanvas = null;
  var fxCtx = null;
  var lastFocus = null;
  var activeId = null;
  var fxRaf = 0;
  var fxBursts = [];
  var fxSparks = [];
  var fxUntil = 0;

  function ensureModal() {
    if (root) return root;

    root = document.createElement("div");
    root.className = "tx-historias";
    root.id = "tx-historias";
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    root.innerHTML =
      '<canvas class="tx-historias__fx" data-tx-historias-fx aria-hidden="true"></canvas>' +
      '<div class="tx-historias__backdrop" data-tx-historias-close aria-hidden="true"></div>' +
      '<div class="tx-historias__panel" role="dialog" aria-modal="true" aria-labelledby="tx-historias-title">' +
      '<div class="tx-historias__glow" aria-hidden="true"></div>' +
      '<button type="button" class="tx-historias__close" data-tx-historias-close aria-label="Cerrar">&times;</button>' +
      '<header class="tx-historias__head">' +
      '<p class="tx-historias__kicker">Clientes satisfechos</p>' +
      '<h2 class="tx-historias__title" id="tx-historias-title">Más <span>historias</span></h2>' +
      '<p class="tx-historias__lead">Toca un video para reproducirlo en pantalla completa del modal.</p>' +
      "</header>" +
      '<div class="tx-historias__picks" data-tx-historias-picks></div>' +
      '<div class="tx-historias__stage is-empty" data-tx-historias-stage hidden>' +
      '<button type="button" class="tx-historias__back" data-tx-historias-back>← Elegir otro</button>' +
      '<video class="tx-historias__video" playsinline controls preload="metadata"></video>' +
      "</div>" +
      "</div>";

    document.body.appendChild(root);
    stage = root.querySelector("[data-tx-historias-stage]");
    videoEl = root.querySelector(".tx-historias__video");
    fxCanvas = root.querySelector("[data-tx-historias-fx]");
    fxCtx = fxCanvas.getContext("2d");
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
        '<span class="tx-historias__pick-shade" aria-hidden="true"></span>' +
        '<span class="tx-historias__pick-play" aria-hidden="true"></span>' +
        '<span class="tx-historias__pick-badge">Ver video</span>' +
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
      if (e.target.closest("[data-tx-historias-back]")) {
        stopVideo();
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

  function sizeFx() {
    if (!fxCanvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth;
    var h = window.innerHeight;
    fxCanvas.width = Math.floor(w * dpr);
    fxCanvas.height = Math.floor(h * dpr);
    fxCanvas.style.width = w + "px";
    fxCanvas.style.height = h + "px";
    fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnBurst(x, y, color) {
    var count = 28 + Math.floor(Math.random() * 18);
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      var speed = 2.2 + Math.random() * 5.5;
      fxSparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.012 + Math.random() * 0.018,
        size: 1.6 + Math.random() * 2.4,
        color: color || COLORS[(Math.random() * COLORS.length) | 0],
        trail: Math.random() > 0.55,
      });
    }
  }

  function launchRocket() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    fxBursts.push({
      x: w * (0.12 + Math.random() * 0.76),
      y: h + 10,
      tx: w * (0.15 + Math.random() * 0.7),
      ty: h * (0.12 + Math.random() * 0.38),
      color: COLORS[(Math.random() * COLORS.length) | 0],
      progress: 0,
      speed: 0.018 + Math.random() * 0.016,
    });
  }

  function tickFx(now) {
    if (!fxCtx || !root || !root.classList.contains("is-open")) {
      fxRaf = 0;
      return;
    }

    var w = window.innerWidth;
    var h = window.innerHeight;
    fxCtx.clearRect(0, 0, w, h);

    if (now < fxUntil && Math.random() < 0.12) launchRocket();

    for (var i = fxBursts.length - 1; i >= 0; i--) {
      var b = fxBursts[i];
      b.progress += b.speed;
      var px = b.x + (b.tx - b.x) * b.progress;
      var py = b.y + (b.ty - b.y) * b.progress;
      fxCtx.beginPath();
      fxCtx.fillStyle = b.color;
      fxCtx.globalAlpha = 0.9;
      fxCtx.arc(px, py, 2.2, 0, Math.PI * 2);
      fxCtx.fill();
      if (b.progress >= 1) {
        spawnBurst(b.tx, b.ty, b.color);
        spawnBurst(b.tx + (Math.random() * 40 - 20), b.ty + (Math.random() * 24 - 12), COLORS[(Math.random() * COLORS.length) | 0]);
        fxBursts.splice(i, 1);
      }
    }

    for (var s = fxSparks.length - 1; s >= 0; s--) {
      var p = fxSparks[s];
      p.vy += 0.045;
      p.vx *= 0.992;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        fxSparks.splice(s, 1);
        continue;
      }
      fxCtx.globalAlpha = Math.max(0, p.life);
      fxCtx.fillStyle = p.color;
      fxCtx.beginPath();
      fxCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      fxCtx.fill();
      if (p.trail) {
        fxCtx.globalAlpha = p.life * 0.35;
        fxCtx.beginPath();
        fxCtx.arc(p.x - p.vx * 2, p.y - p.vy * 2, p.size * 0.55, 0, Math.PI * 2);
        fxCtx.fill();
      }
    }

    fxCtx.globalAlpha = 1;

    if (now < fxUntil || fxBursts.length || fxSparks.length) {
      fxRaf = requestAnimationFrame(tickFx);
    } else {
      fxCtx.clearRect(0, 0, w, h);
      fxRaf = 0;
    }
  }

  function startFireworks() {
    if (reducedMotion || !fxCanvas) return;
    sizeFx();
    fxBursts = [];
    fxSparks = [];
    fxUntil = performance.now() + 3200;
    for (var i = 0; i < 5; i++) {
      (function (delay) {
        window.setTimeout(function () {
          if (root && root.classList.contains("is-open")) launchRocket();
        }, delay);
      })(i * 180);
    }
    if (!fxRaf) fxRaf = requestAnimationFrame(tickFx);
  }

  function stopFireworks() {
    fxUntil = 0;
    fxBursts = [];
    fxSparks = [];
    if (fxRaf) {
      cancelAnimationFrame(fxRaf);
      fxRaf = 0;
    }
    if (fxCtx && fxCanvas) {
      fxCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function playVideo(id) {
    var item = VIDEOS.find(function (v) {
      return v.id === id;
    });
    if (!item || !videoEl) return;

    activeId = id;
    root.classList.add("is-playing");
    root.querySelectorAll(".tx-historias__pick").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-tx-historia") === id);
    });

    stage.hidden = false;
    stage.classList.remove("is-empty");
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
    stage && (stage.hidden = true);
    stage && stage.classList.add("is-empty");
    root && root.classList.remove("is-playing");
    activeId = null;
    root &&
      root.querySelectorAll(".tx-historias__pick").forEach(function (btn) {
        btn.classList.remove("is-active");
      });
  }

  function open() {
    ensureModal();
    lastFocus = document.activeElement;
    stopVideo();
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("tx-historias-open");
    requestAnimationFrame(function () {
      root.classList.add("is-open");
      startFireworks();
    });
    var first = root.querySelector(".tx-historias__pick");
    first && first.focus();
  }

  function close() {
    if (!root) return;
    stopVideo();
    stopFireworks();
    root.classList.remove("is-open", "is-playing");
    document.documentElement.classList.remove("tx-historias-open");
    window.setTimeout(function () {
      if (!root.classList.contains("is-open")) {
        root.hidden = true;
        root.setAttribute("aria-hidden", "true");
      }
    }, 320);
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
    window.addEventListener("resize", function () {
      if (root && root.classList.contains("is-open")) sizeFx();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.YaavsHistorias = { open: open, close: close };
})();
