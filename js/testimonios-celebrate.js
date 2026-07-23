/**
 * Popup de logros al llegar a Clientes Satisfechos:
 * fuegos artificiales + cifras + Yaavsers.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "yaavs-celebrate-testimonios-v1";
  var PHOTOS = [
    "assets/testimonios/galeria-01.jpg",
    "assets/testimonios/galeria-06.jpg",
    "assets/testimonios/galeria-07.jpg",
    "assets/testimonios/galeria-12.jpg",
    "assets/testimonios/galeria-14.jpg",
    "assets/testimonios/galeria-15.jpg",
    "assets/testimonios/galeria-18.jpg",
    "assets/testimonios/galeria-20.jpg",
  ];

  var root = null;
  var canvas = null;
  var lastFocus = null;
  var fireworksCtl = null;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function ensureModal() {
    if (root) return root;

    root = document.createElement("div");
    root.className = "tx-celebrate";
    root.id = "tx-celebrate";
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    root.innerHTML =
      '<div class="tx-celebrate__backdrop" data-tx-celebrate-close aria-hidden="true"></div>' +
      '<div class="tx-celebrate__panel" role="dialog" aria-modal="true" aria-labelledby="tx-celebrate-title">' +
      '<canvas class="tx-celebrate__fireworks" data-tx-celebrate-fireworks aria-hidden="true"></canvas>' +
      '<button type="button" class="tx-celebrate__close" data-tx-celebrate-close aria-label="Cerrar">&times;</button>' +
      '<p class="tx-celebrate__kicker">Logros YAAVS</p>' +
      '<h2 class="tx-celebrate__title" id="tx-celebrate-title">¡Esto es lo que <span>hemos logrado</span>!</h2>' +
      '<p class="tx-celebrate__lead">Una red de Yaavsers que crece cada semana con respaldo real en el mostrador.</p>' +
      '<div class="tx-celebrate__stats" role="list">' +
      '<div class="tx-celebrate__stat" role="listitem"><strong>+16k</strong><span>Puntos de venta</span></div>' +
      '<div class="tx-celebrate__stat" role="listitem"><strong>22</strong><span>Estados</span></div>' +
      '<div class="tx-celebrate__stat" role="listitem"><strong>+10</strong><span>Años en el mercado</span></div>' +
      '<div class="tx-celebrate__stat" role="listitem"><strong>Yaavsers</strong><span>Satisfechos</span></div>' +
      "</div>" +
      '<p class="tx-celebrate__faces-label">Nuestros Yaavsers</p>' +
      '<div class="tx-celebrate__faces" data-tx-celebrate-faces></div>' +
      '<button type="button" class="tx-celebrate__cta" data-tx-celebrate-close>Ver sus historias</button>' +
      "</div>";

    document.body.appendChild(root);
    canvas = root.querySelector("[data-tx-celebrate-fireworks]");
    var faces = root.querySelector("[data-tx-celebrate-faces]");
    if (faces) {
      faces.innerHTML = PHOTOS.map(function (src, i) {
        return (
          '<figure class="tx-celebrate__face" style="--i:' +
          i +
          '">' +
          '<img src="' +
          src +
          '" alt="Yaavser ' +
          (i + 1) +
          '" width="160" height="200" loading="eager" decoding="async">' +
          "</figure>"
        );
      }).join("");
    }

    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-tx-celebrate-close]")) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root && root.classList.contains("is-open")) close();
    });

    return root;
  }

  function startFireworks(targetCanvas) {
    if (!targetCanvas || !targetCanvas.getContext || prefersReducedMotion()) return null;

    var ctx = targetCanvas.getContext("2d");
    if (!ctx) return null;

    var particles = [];
    var rafId = 0;
    var lastTime = 0;
    var lastBurst = 0;
    var burstCount = 0;
    var maxBursts = window.matchMedia("(max-width: 720px)").matches ? 8 : 12;
    var colors = ["#00e5ff", "#00bcd4", "#5ce8f7", "#c9a000", "#ffffff", "#7dd3ea"];
    var endAt = performance.now() + 7000;
    var width = 0;
    var height = 0;
    var dpr = 1;
    var running = true;

    function resize() {
      var bounds = targetCanvas.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      targetCanvas.width = Math.max(1, Math.round(width * dpr));
      targetCanvas.height = Math.max(1, Math.round(height * dpr));
      targetCanvas.style.width = width + "px";
      targetCanvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function burst(x, y) {
      var count = 34;
      for (var i = 0; i < count; i += 1) {
        var angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        var speed = 1.6 + Math.random() * 3.2;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.4 + Math.random() * 2.2,
          life: 0,
          ttl: 900 + Math.random() * 700,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    function maybeBurst(now) {
      if (burstCount >= maxBursts) return;
      if (now - lastBurst < 420) return;
      lastBurst = now;
      burstCount += 1;
      burst(width * (0.15 + Math.random() * 0.7), height * (0.12 + Math.random() * 0.35));
    }

    function draw(now) {
      if (!running) return;
      if (!lastTime) lastTime = now;
      var delta = now - lastTime;
      lastTime = now;

      maybeBurst(now);
      ctx.clearRect(0, 0, width, height);

      particles = particles.filter(function (p) {
        p.life += delta;
        if (p.life >= p.ttl) return false;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.035;
        p.vx *= 0.99;
        p.vy *= 0.99;
        var alpha = 1 - p.life / p.ttl;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha * 0.95;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      ctx.globalAlpha = 1;
      if (now < endAt || particles.length) {
        rafId = window.requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, width, height);
        rafId = 0;
      }
    }

    resize();
    window.addEventListener("resize", resize);
    rafId = window.requestAnimationFrame(draw);

    return {
      stop: function () {
        running = false;
        if (rafId) window.cancelAnimationFrame(rafId);
        rafId = 0;
        window.removeEventListener("resize", resize);
        ctx.clearRect(0, 0, width, height);
      },
    };
  }

  function open() {
    ensureModal();
    lastFocus = document.activeElement;
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("tx-celebrate-open");
    requestAnimationFrame(function () {
      root.classList.add("is-open");
    });
    if (fireworksCtl) fireworksCtl.stop();
    fireworksCtl = startFireworks(canvas);
    var closeBtn = root.querySelector(".tx-celebrate__close");
    closeBtn && closeBtn.focus();
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {
      /* ignore */
    }
  }

  function close() {
    if (!root) return;
    root.classList.remove("is-open");
    document.documentElement.classList.remove("tx-celebrate-open");
    if (fireworksCtl) {
      fireworksCtl.stop();
      fireworksCtl = null;
    }
    window.setTimeout(function () {
      if (!root.classList.contains("is-open")) {
        root.hidden = true;
        root.setAttribute("aria-hidden", "true");
      }
    }, 280);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function alreadyShown() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function boot() {
    if (!document.body.classList.contains("page-home")) return;
    var section = document.getElementById("testimonios-home");
    if (!section || alreadyShown()) return;

    var triggered = false;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (triggered || !entry.isIntersecting) return;
          if (entry.intersectionRatio < 0.28) return;
          triggered = true;
          io.disconnect();
          window.setTimeout(open, prefersReducedMotion() ? 0 : 180);
        });
      },
      { threshold: [0.28, 0.4], rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(section);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.YaavsCelebrateTestimonios = { open: open, close: close };
})();
