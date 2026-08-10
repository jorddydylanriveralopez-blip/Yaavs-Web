/**
 * Promo popup de entrada (home) — BAIT + fuegos artificiales al abrir.
 */
(function () {
  if (!document.body.classList.contains("page-home")) return;

  const dialog = document.getElementById("yaavs-promo-popup");
  if (!dialog) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fxCanvas = dialog.querySelector("[data-promo-fireworks]");

  let opened = false;
  let closing = false;
  let fxRaf = 0;
  let fxCtx = null;
  let fxW = 0;
  let fxH = 0;
  let fxDpr = 1;
  let fxParticles = [];
  let fxRockets = [];
  let fxUntil = 0;
  let fxLast = 0;

  const FX_COLORS = ["#ffe600", "#ff2d95", "#ffffff", "#ffd400", "#00e5ff", "#ff6b00"];

  function lockScroll(lock) {
    document.body.classList.toggle("is-promo-open", lock);
  }

  function sizeFx() {
    if (!fxCanvas) return;
    fxCtx = fxCanvas.getContext("2d");
    if (!fxCtx) return;
    fxDpr = Math.min(window.devicePixelRatio || 1, 2);
    fxW = window.innerWidth;
    fxH = window.innerHeight;
    fxCanvas.width = Math.max(1, Math.round(fxW * fxDpr));
    fxCanvas.height = Math.max(1, Math.round(fxH * fxDpr));
    fxCanvas.style.width = fxW + "px";
    fxCanvas.style.height = fxH + "px";
    fxCtx.setTransform(fxDpr, 0, 0, fxDpr, 0, 0);
  }

  function explode(x, y) {
    const count = 34 + Math.floor(Math.random() * 18);
    const color = FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)];
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.25;
      const speed = 1.6 + Math.random() * 3.8;
      fxParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.4 + Math.random() * 2.2,
        life: 0,
        ttl: 900 + Math.random() * 700,
        color,
        trail: Math.random() > 0.55,
      });
    }
  }

  function launchRocket() {
    const x = fxW * (0.12 + Math.random() * 0.76);
    const targetY = fxH * (0.12 + Math.random() * 0.28);
    fxRockets.push({
      x,
      y: fxH + 10,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(6.2 + Math.random() * 2.4),
      targetY,
      color: FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)],
    });
  }

  function tickFx(now) {
    if (!fxCtx) return;
    if (!fxLast) fxLast = now;
    const delta = Math.min(32, now - fxLast);
    fxLast = now;

    fxCtx.clearRect(0, 0, fxW, fxH);

    fxRockets = fxRockets.filter((rocket) => {
      rocket.x += rocket.vx * (delta / 16);
      rocket.y += rocket.vy * (delta / 16);
      rocket.vy += 0.045 * (delta / 16);

      fxCtx.beginPath();
      fxCtx.strokeStyle = rocket.color;
      fxCtx.globalAlpha = 0.85;
      fxCtx.lineWidth = 2;
      fxCtx.moveTo(rocket.x, rocket.y);
      fxCtx.lineTo(rocket.x - rocket.vx * 3, rocket.y - rocket.vy * 3);
      fxCtx.stroke();

      fxCtx.beginPath();
      fxCtx.fillStyle = "#fff";
      fxCtx.globalAlpha = 1;
      fxCtx.arc(rocket.x, rocket.y, 2.2, 0, Math.PI * 2);
      fxCtx.fill();

      if (rocket.y <= rocket.targetY || rocket.vy >= -0.4) {
        explode(rocket.x, rocket.y);
        return false;
      }
      return true;
    });

    fxParticles = fxParticles.filter((p) => {
      p.life += delta;
      if (p.life >= p.ttl) return false;
      p.x += p.vx * (delta / 16);
      p.y += p.vy * (delta / 16);
      p.vy += 0.045 * (delta / 16);
      p.vx *= 0.99;
      p.vy *= 0.99;
      const alpha = 1 - p.life / p.ttl;

      if (p.trail) {
        fxCtx.beginPath();
        fxCtx.strokeStyle = p.color;
        fxCtx.globalAlpha = alpha * 0.35;
        fxCtx.lineWidth = 1;
        fxCtx.moveTo(p.x, p.y);
        fxCtx.lineTo(p.x - p.vx * 2.5, p.y - p.vy * 2.5);
        fxCtx.stroke();
      }

      fxCtx.beginPath();
      fxCtx.fillStyle = p.color;
      fxCtx.globalAlpha = alpha * 0.95;
      fxCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      fxCtx.fill();
      return true;
    });

    fxCtx.globalAlpha = 1;

    if (now < fxUntil || fxRockets.length || fxParticles.length) {
      fxRaf = window.requestAnimationFrame(tickFx);
    } else {
      fxCtx.clearRect(0, 0, fxW, fxH);
      fxRaf = 0;
      fxLast = 0;
    }
  }

  function startFireworks() {
    if (reducedMotion || !fxCanvas) return;
    sizeFx();
    fxParticles = [];
    fxRockets = [];
    fxLast = 0;
    fxUntil = performance.now() + 4800;
    const bursts = window.matchMedia("(max-width: 720px)").matches ? 6 : 9;
    for (let i = 0; i < bursts; i += 1) {
      window.setTimeout(() => {
        if (!opened || closing) return;
        launchRocket();
      }, 80 + i * 220);
    }
    if (!fxRaf) fxRaf = window.requestAnimationFrame(tickFx);
  }

  function stopFireworks() {
    fxUntil = 0;
    fxRockets = [];
    fxParticles = [];
    if (fxRaf) {
      window.cancelAnimationFrame(fxRaf);
      fxRaf = 0;
    }
    if (fxCtx) fxCtx.clearRect(0, 0, fxW, fxH);
    fxLast = 0;
  }

  function openPromo() {
    if (opened) return;
    opened = true;
    lockScroll(true);
    dialog.classList.add("is-open");
    dialog.setAttribute("aria-hidden", "false");
    if (typeof dialog.showModal === "function" && !dialog.open) {
      try {
        dialog.showModal();
      } catch (_) {
        dialog.setAttribute("open", "");
      }
    } else {
      dialog.setAttribute("open", "");
    }
    startFireworks();
    window.setTimeout(() => {
      dialog.querySelector("[data-promo-enter]")?.focus();
    }, 80);
  }

  function closePromo() {
    if (!opened || closing) return;
    closing = true;
    dialog.classList.add("is-closing");
    dialog.classList.remove("is-open");
    stopFireworks();

    const finish = () => {
      dialog.classList.remove("is-closing");
      dialog.setAttribute("aria-hidden", "true");
      if (typeof dialog.close === "function" && dialog.open) {
        try {
          dialog.close();
        } catch (_) {
          dialog.removeAttribute("open");
        }
      } else {
        dialog.removeAttribute("open");
      }
      lockScroll(false);
      closing = false;
    };

    window.setTimeout(finish, reducedMotion ? 0 : 320);
  }

  function scheduleOpen() {
    const delay = reducedMotion ? 120 : 480;
    window.setTimeout(openPromo, delay);
  }

  dialog.querySelectorAll("[data-promo-close]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      closePromo();
    });
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closePromo();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closePromo();
  });

  window.addEventListener("resize", () => {
    if (opened && !closing) sizeFx();
  });

  if (document.body.classList.contains("page-intro-done")) {
    scheduleOpen();
  } else {
    document.addEventListener("yaavs:intro-done", scheduleOpen, { once: true });
  }
})();
