(function () {
  if (!document.body.classList.contains("page-home")) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.getElementById("home-experience");
  if (!root) return;

  /* Revelar al scroll */
  const revealEls = root.querySelectorAll("[data-hx-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = reduced ? "0ms" : `${Math.min(i * 80, 400)}ms`;
      revealObs.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Contadores animados */
  function animateCount(el) {
    const target = Number(el.dataset.hxCount);
    if (!Number.isFinite(target)) return;
    const suffix = el.dataset.hxSuffix || "";
    const prefix = el.dataset.hxPrefix || "";
    const duration = reduced ? 0 : 1800;
    const start = performance.now();

    function tick(now) {
      const t = duration ? Math.min(1, (now - start) / duration) : 1;
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      el.textContent = prefix + value.toLocaleString("es-MX") + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  root.querySelectorAll("[data-hx-count]").forEach((el) => {
    if (!("IntersectionObserver" in window)) {
      animateCount(el);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        animateCount(el);
        obs.disconnect();
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
  });

  /* Arena — pilares expandibles con imagen */
  const arena = root.querySelector("[data-hx-arena]");
  if (arena) {
    const cards = arena.querySelectorAll(".hx-arena__card");

    function activateCard(card) {
      cards.forEach((c) => {
        const active = c === card;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-selected", String(active));
        c.tabIndex = active ? 0 : -1;
      });
    }

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        if (card.classList.contains("is-active")) return;
        activateCard(card);
        window.YaavsSonic?.play?.();
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activateCard(card);
          window.YaavsSonic?.play?.();
        }
      });
    });
  }

  /* Pilares legacy (por si quedara en otra página) */
  const pillars = root.querySelector("[data-hx-pillars]");
  if (pillars) {
    const tabs = pillars.querySelectorAll(".hx-pillars__tab");
    const panels = pillars.querySelectorAll(".hx-pillars__panel");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.dataset.pillar;
        tabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
        });
        panels.forEach((p) => {
          const active = p.dataset.pillar === id;
          p.classList.toggle("is-active", active);
          p.hidden = !active;
        });
        window.YaavsSonic?.play?.();
      });
    });
  }

  /* Quiénes somos — modo juego */
  const storyGame = root.querySelector("[data-hx-story-game]");
  if (storyGame) {
    const nodes = storyGame.querySelectorAll("[data-hx-node]");
    const logEl = storyGame.querySelector("[data-hx-story-log]");
    const meterEl = storyGame.querySelector("[data-hx-story-meter]");
    const meterWrap = storyGame.querySelector("[data-hx-story-meter-wrap]");
    const scoreEl = storyGame.querySelector("[data-hx-story-score]");
    const rankEl = storyGame.querySelector("[data-hx-story-rank]");
    const rewardEl = storyGame.querySelector("[data-hx-story-reward]");
    const rewardClose = storyGame.querySelector("[data-hx-story-reward-close]");
    const lootCards = storyGame.querySelectorAll("[data-hx-loot]");
    const arena = storyGame.querySelector("[data-hx-story-arena]");
    let captured = 0;
    const total = nodes.length;

    const RANKS = ["Nivel 1 · Explorador", "Nivel 2 · Conector", "Nivel 3 · Distribuidor", "Nivel 4 · Yaavser", "RED ACTIVADA"];

    const NODE_COPY = {
      sim: "NODO SIM — Más de 10,000 puntos de venta conectados en todo México. Tu tienda nunca vende sola.",
      chip: "NODO CHIP — Portabilidad, activaciones y liberaciones: todo el stack en una sola red.",
      phone: "NODO MVNO — Líneas, tiempo aire y RecargaKlic: tu mostrador se vuelve digital.",
      mx: "NODO RED — 100% mexicana. Líderes en distribución masiva de telecom.",
    };

    function typeLog(text) {
      if (!logEl) return;
      if (reduced) {
        logEl.textContent = `> ${text}`;
        return;
      }
      logEl.classList.add("is-typing");
      const prefix = "> ";
      logEl.textContent = prefix;
      let i = 0;
      const tick = () => {
        if (i < text.length) {
          logEl.textContent = prefix + text.slice(0, i + 1);
          i += 1;
          window.setTimeout(tick, 14);
        } else {
          logEl.classList.remove("is-typing");
        }
      };
      tick();
    }

    function updateHud() {
      const pct = total ? (captured / total) * 100 : 0;
      if (meterEl) meterEl.style.width = `${pct}%`;
      if (meterWrap) meterWrap.setAttribute("aria-valuenow", String(captured));
      if (scoreEl) scoreEl.textContent = `${captured}/${total}`;
      if (rankEl) rankEl.textContent = RANKS[captured] || RANKS[0];
    }

    function unlockLoot(id) {
      const card = storyGame.querySelector(`[data-hx-loot="${id}"]`);
      if (card) card.classList.add("is-unlocked");
    }

    nodes.forEach((node) => {
      node.addEventListener("click", () => {
        if (node.classList.contains("is-captured")) return;
        const id = node.dataset.hxNode;
        node.classList.add("is-captured");
        captured += 1;
        updateHud();
        unlockLoot(id);
        typeLog(NODE_COPY[id] || "Nodo capturado.");
        window.YaavsSonic?.play?.();

        if (captured >= total) {
          storyGame.classList.add("is-complete");
          window.setTimeout(() => {
            if (rewardEl) rewardEl.hidden = false;
            typeLog("MISIÓN COMPLETA — Bienvenido a la red de distribución #1 en México.");
          }, reduced ? 0 : 700);
        }
      });
    });

    if (rewardClose && rewardEl) {
      rewardClose.addEventListener("click", () => {
        rewardEl.hidden = true;
      });
    }

    if (arena && !reduced) {
      arena.addEventListener("mousemove", (e) => {
        const rect = arena.getBoundingClientRect();
        const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
        const my = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
        arena.style.setProperty("--aim-x", `${mx}px`);
        arena.style.setProperty("--aim-y", `${my}px`);
      });
    }
  }

  /* Parallax suave en visual */
  const visual = root.querySelector("[data-hx-parallax]");
  if (visual && !reduced) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const rect = visual.getBoundingClientRect();
          const center = rect.top + rect.height * 0.5 - window.innerHeight * 0.5;
          const shift = Math.max(-40, Math.min(40, center * 0.06));
          visual.style.transform = `translate3d(0, ${shift}px, 0)`;
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* Carril servicios — progreso + tilt */
  const rail = root.querySelector("[data-hx-rail]");
  const progress = root.querySelector(".hx-services__progress span");

  if (rail && progress) {
    const updateProgress = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const ratio = max > 0 ? rail.scrollLeft / max : 0;
      const segment = 100 / Math.max(1, rail.children.length);
      progress.style.width = `${segment + ratio * (100 - segment)}%`;
    };
    rail.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  if (rail && !reduced) {
    rail.querySelectorAll(".hx-svc").forEach((card) => {
      const glow = card.querySelector(".hx-svc__glow");
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const mx = ((e.clientX - rect.left) / rect.width) * 100;
        const my = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", `${mx}%`);
        card.style.setProperty("--my", `${my}%`);
        const tiltX = (my - 50) * -0.12;
        const tiltY = (mx - 50) * 0.12;
        card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
        if (glow) glow.style.opacity = "0.9";
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
        if (glow) glow.style.opacity = "";
      });
    });
  }
})();
