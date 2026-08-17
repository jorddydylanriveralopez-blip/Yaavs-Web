/**
 * Carrusel coverflow del banner pospago (efecto tipo AT&T México).
 */
(function () {
  const root = document.querySelector("[data-pospago-coverflow]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll(".pospago-card"));
  const prevBtn = document.querySelector("[data-pospago-prev]");
  const nextBtn = document.querySelector("[data-pospago-next]");
  const countEl = document.querySelector("[data-pospago-count]");
  const stage = root.closest(".pospago-hero");
  const n = cards.length;
  if (!n) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AUTO_MS = 2500;
  let index = 0;
  let timer = 0;

  function wrappedOffset(i) {
    let d = i - index;
    const half = n / 2;
    if (d > half) d -= n;
    if (d < -half) d += n;
    return d;
  }

  function layout() {
    const width = cards[0].getBoundingClientRect().width || cards[0].offsetWidth;
    if (width < 48) {
      window.requestAnimationFrame(layout);
      return;
    }
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const rotate = mobile ? 28 : 52;
    const depth = mobile ? 70 : 100;
    const spread = mobile ? 0.72 : 1.14;

    cards.forEach((card, i) => {
      const offset = wrappedOffset(i);
      const abs = Math.abs(offset);
      const tx = offset * width * spread;
      const ry = offset * -rotate;
      const tz = -abs * depth;
      card.style.transform = `translate3d(${tx}px, 0, ${tz}px) rotateY(${ry}deg)`;
      card.style.zIndex = String(20 - abs);
      card.style.opacity = abs > 2 ? "0" : "1";
      card.style.visibility = abs > 2 ? "hidden" : "visible";
      card.classList.toggle("is-active", offset === 0);
      card.classList.toggle("is-peek", abs === 1);
      card.setAttribute("aria-hidden", offset === 0 ? "false" : "true");
    });

    if (countEl) countEl.textContent = `${index + 1}/${n}`;
    root.classList.add("is-ready");
  }

  function goTo(next) {
    if (!n) return;
    index = ((next % n) + n) % n;
    layout();
  }

  function go(dir) {
    goTo(index + dir);
  }

  function startTimer() {
    stopTimer();
    if (reduced || n < 2) return;
    timer = window.setInterval(() => go(1), AUTO_MS);
  }

  function stopTimer() {
    window.clearInterval(timer);
    timer = 0;
  }

  prevBtn?.addEventListener("click", () => {
    go(-1);
    startTimer();
  });
  nextBtn?.addEventListener("click", () => {
    go(1);
    startTimer();
  });

  cards.forEach((card, i) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".pospago-card__cta")) return;
      if (wrappedOffset(i) === 0) return;
      goTo(i);
      startTimer();
    });
  });

  stage?.addEventListener("mouseenter", stopTimer);
  stage?.addEventListener("mouseleave", startTimer);

  document.addEventListener("keydown", (e) => {
    if (!stage) return;
    if (document.querySelector("dialog[open]")) return;
    if (e.target.closest("input, textarea, select, [contenteditable]")) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
      startTimer();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
      startTimer();
    }
  });

  let swipe = null;
  stage?.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      swipe = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      stopTimer();
    },
    { passive: true }
  );
  stage?.addEventListener(
    "touchend",
    (e) => {
      if (!swipe) {
        startTimer();
        return;
      }
      const t = e.changedTouches[0];
      const dx = t.clientX - swipe.x;
      const dy = t.clientY - swipe.y;
      swipe = null;
      if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.1) {
        go(dx < 0 ? 1 : -1);
      }
      startTimer();
    },
    { passive: true }
  );

  window.addEventListener("resize", layout);
  if (typeof ResizeObserver === "function") {
    new ResizeObserver(layout).observe(root);
  }
  window.requestAnimationFrame(layout);
  startTimer();
})();
