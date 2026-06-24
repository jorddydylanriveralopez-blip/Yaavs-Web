/**
 * Easter egg: escribe "yaavs" (en cualquier pagina) para abrir el mini-juego.
 */
(function () {
  const CODE = "yaavs";

  let buffer = "";
  let overlay = null;
  let running = false;
  let raf = 0;

  function isTypingContext(el) {
    if (!el || !(el instanceof Element)) return false;
    const tag = el.tagName;
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      el.isContentEditable
    );
  }

  function flashHint() {
    const el = document.createElement("div");
    el.className = "yaavs-game-toast";
    el.setAttribute("role", "status");
    el.textContent = "Modo juego YAAVS";
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("is-visible"));
    window.setTimeout(() => {
      el.classList.remove("is-visible");
      window.setTimeout(() => el.remove(), 400);
    }, 1400);
  }

  function buildOverlay() {
    const root = document.createElement("div");
    root.className = "yaavs-game";
    root.id = "yaavs-game";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "YAAVS Atrapa el SIM");
    root.hidden = true;
    root.innerHTML = `
      <div class="yaavs-game__backdrop" data-yaavs-game-close tabindex="-1"></div>
      <div class="yaavs-game__panel">
        <header class="yaavs-game__head">
          <span class="yaavs-game__badge">YAAVS ARCADE</span>
          <button type="button" class="yaavs-game__close" data-yaavs-game-close aria-label="Cerrar juego">&times;</button>
        </header>
        <p class="yaavs-game__title">Atrapa el SIM</p>
        <p class="yaavs-game__score" data-yaavs-score>Puntos: 0</p>
        <canvas class="yaavs-game__canvas" width="360" height="480" aria-label="Area de juego"></canvas>
        <p class="yaavs-game__help" data-yaavs-help>Flechas o A D para mover. Esc para salir.</p>
        <p class="yaavs-game__status" data-yaavs-status></p>
        <button type="button" class="yaavs-game__restart btn btn--primary" data-yaavs-restart hidden>Jugar de nuevo</button>
      </div>
    `;
    document.body.appendChild(root);
    return root;
  }

  function openGame() {
    if (running) return;
    if (!overlay) overlay = buildOverlay();

    running = true;
    overlay.hidden = false;
    document.body.classList.add("yaavs-game-open");
    flashHint();

    const canvas = overlay.querySelector(".yaavs-game__canvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = overlay.querySelector("[data-yaavs-score]");
    const statusEl = overlay.querySelector("[data-yaavs-status]");
    const restartBtn = overlay.querySelector("[data-yaavs-restart]");
    const helpEl = overlay.querySelector("[data-yaavs-help]");

    const W = canvas.width;
    const H = canvas.height;
    const player = { x: W / 2, w: 72, h: 14, speed: 5.2 };
    const keys = new Set();
    let items = [];
    let score = 0;
    let lives = 3;
    let spawnIn = 28;
    let over = false;
    let last = 0;

    function setScore() {
      scoreEl.textContent = "Puntos: " + score + " | Vidas: " + lives;
    }

    function spawnItem() {
      const bad = Math.random() < 0.22;
      items.push({
        x: 24 + Math.random() * (W - 48),
        y: -20,
        vy: 2.2 + Math.random() * 2.4,
        r: bad ? 14 : 12,
        bad: bad,
      });
    }

    function drawRoundedRect(x, y, w, h, rad, fill) {
      ctx.beginPath();
      ctx.moveTo(x + rad, y);
      ctx.arcTo(x + w, y, x + w, y + h, rad);
      ctx.arcTo(x + w, y + h, x, y + h, rad);
      ctx.arcTo(x, y + h, x, y, rad);
      ctx.arcTo(x, y, x + w, y, rad);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }

    function drawSim(x, y, size) {
      drawRoundedRect(x - size * 0.55, y - size * 0.7, size * 1.1, size * 1.35, 4, "#00d4ff");
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(x - size * 0.35, y - size * 0.45, size * 0.7, size * 0.55);
      ctx.fillStyle = "#fff";
      ctx.font = "bold " + Math.floor(size * 0.45) + "px Montserrat, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SIM", x, y + size * 0.08);
    }

    function drawBomb(x, y, r) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "#ff4466";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold " + r + "px Montserrat, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("X", x, y + 1);
    }

    function drawPlayer() {
      const px = player.x - player.w / 2;
      const py = H - 36;
      drawRoundedRect(px, py, player.w, player.h, 6, "#00d4ff");
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(px + 8, py + 3, player.w - 16, 4);
    }

    function collide(item) {
      const py = H - 36;
      return (
        Math.abs(item.x - player.x) < player.w / 2 + item.r &&
        item.y + item.r > py &&
        item.y - item.r < py + player.h
      );
    }

    function endGame(won) {
      over = true;
      statusEl.textContent = won
        ? "Eres un Yaavser legendario."
        : "Se acabaron las vidas. Intenta otra vez.";
      restartBtn.hidden = false;
      helpEl.hidden = true;
    }

    function resetGame() {
      score = 0;
      lives = 3;
      items = [];
      spawnIn = 20;
      over = false;
      player.x = W / 2;
      restartBtn.hidden = true;
      helpEl.hidden = false;
      statusEl.textContent = "";
      setScore();
      last = performance.now();
    }

    function tick(now) {
      if (!running || overlay.hidden) return;
      const dt = Math.min(32, now - last);
      last = now;

      if (!over) {
        if (keys.has("ArrowLeft") || keys.has("a")) player.x -= player.speed * (dt / 16);
        if (keys.has("ArrowRight") || keys.has("d")) player.x += player.speed * (dt / 16);
        player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, player.x));

        spawnIn -= 1;
        if (spawnIn <= 0) {
          spawnItem();
          spawnIn = Math.max(12, 34 - Math.floor(score / 40));
        }

        items.forEach(function (it) {
          it.y += it.vy * (dt / 16);
        });

        items = items.filter(function (it) {
          if (it.y > H + 30) {
            if (!it.bad) {
              lives -= 1;
              setScore();
              if (lives <= 0) endGame(false);
            }
            return false;
          }
          if (collide(it)) {
            if (it.bad) {
              lives -= 1;
              setScore();
              if (lives <= 0) endGame(false);
            } else {
              score += 10;
              setScore();
              if (score >= 200) endGame(true);
            }
            return false;
          }
          return true;
        });
      }

      ctx.fillStyle = "#06080c";
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(0,212,255,0.08)";
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 24) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }

      items.forEach(function (it) {
        if (it.bad) drawBomb(it.x, it.y, it.r);
        else drawSim(it.x, it.y, it.r);
      });

      drawPlayer();
      raf = requestAnimationFrame(tick);
    }

    function onKeyDown(e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "a" || e.key === "d") {
        e.preventDefault();
        keys.add(e.key);
      }
    }

    function onKeyUp(e) {
      keys.delete(e.key);
    }

    function onPointerMove(e) {
      if (over) return;
      const rect = canvas.getBoundingClientRect();
      player.x = ((e.clientX - rect.left) / rect.width) * W;
    }

    function onTouchMove(e) {
      e.preventDefault();
      if (over || !e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      player.x = ((e.touches[0].clientX - rect.left) / rect.width) * W;
    }

    function closeGame() {
      running = false;
      overlay.hidden = true;
      document.body.classList.remove("yaavs-game-open");
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("touchmove", onTouchMove);
      buffer = "";
    }

    overlay.querySelectorAll("[data-yaavs-game-close]").forEach(function (el) {
      el.onclick = closeGame;
    });

    restartBtn.onclick = function () {
      resetGame();
      last = performance.now();
    };

    var escHandler = function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeGame();
        window.removeEventListener("keydown", escHandler);
      }
    };

    window.addEventListener("keydown", escHandler);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });

    resetGame();
    raf = requestAnimationFrame(tick);
    overlay.querySelector(".yaavs-game__close").focus();
  }

  document.addEventListener("keydown", function (e) {
    if (running || isTypingContext(e.target)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length !== 1) return;

    buffer += e.key.toLowerCase();
    if (buffer.length > CODE.length) buffer = buffer.slice(-CODE.length);

    if (buffer === CODE) {
      buffer = "";
      openGame();
    }
  });

  window.YAAVS_OPEN_GAME = openGame;
})();
