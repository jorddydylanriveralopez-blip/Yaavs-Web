/**
 * Carrusel coverflow del banner pospago (efecto tipo AT&T México).
 * Flechas, teclado, arrastre y swipe de dos dedos en el trackpad.
 */
(function () {
  const root = document.querySelector("[data-pospago-coverflow]");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll(".pospago-card"));
  const prevBtn = document.querySelector("[data-pospago-prev]");
  const nextBtn = document.querySelector("[data-pospago-next]");
  const countEl = document.querySelector("[data-pospago-count]");
  const stage = root.closest(".pospago-hero");
  const stageFrame = root.closest(".pospago-hero__stage");
  const dragSurface = stageFrame || stage || root;
  const n = cards.length;
  if (!n) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AUTO_MS = 2500;
  const DRAG_MIN = 64;
  const NAV_LOCK_MS = 700;
  let index = 0;
  let timer = 0;
  let pointer = null;
  let dragBlockedClick = false;
  let lastLayoutWidth = 0;
  let dragOffset = 0;
  let navLockUntil = 0;

  function wrappedOffset(i) {
    let d = i - index;
    const half = n / 2;
    if (d > half) d -= n;
    if (d < -half) d += n;
    return d;
  }

  function cardLayoutWidth() {
    const card = cards[0];
    return card.offsetWidth || Math.round(parseFloat(getComputedStyle(card).width)) || 0;
  }

  function layout() {
    const width = cardLayoutWidth();
    if (width < 48) {
      window.requestAnimationFrame(layout);
      return;
    }
    lastLayoutWidth = width;
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const rotate = mobile ? 28 : 52;
    const depth = mobile ? 70 : 100;
    const spread = mobile ? 0.72 : 1.14;

    cards.forEach((card, i) => {
      const offset = wrappedOffset(i);
      const abs = Math.abs(offset);
      const tx = offset * width * spread + dragOffset;
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
    dragOffset = 0;
    index = ((next % n) + n) % n;
    layout();
  }

  function go(dir) {
    goTo(index + dir);
  }

  function tryGo(dir) {
    const now = Date.now();
    if (now < navLockUntil) return false;
    navLockUntil = now + NAV_LOCK_MS;
    go(dir);
    return true;
  }

  function startTimer() {
    stopTimer();
    if (reduced || n < 2 || pointer) return;
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
      if (dragBlockedClick || Date.now() < navLockUntil) {
        dragBlockedClick = false;
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (wrappedOffset(i) !== 0) {
        e.preventDefault();
        goTo(i);
        startTimer();
        return;
      }
      if (card.matches("a[href]")) return;
      if (e.target.closest(".pospago-card__cta")) return;
    });
  });

  root.querySelectorAll("img").forEach((img) => {
    img.setAttribute("draggable", "false");
    img.addEventListener("dragstart", (e) => e.preventDefault());
  });

  function ignoreDragTarget(target) {
    return Boolean(
      target.closest(".pospago-card__cta, .pospago-hero__arrow, .pospago-hero__nav, a[href], button")
    );
  }

  function endPointerDrag(e, cancelled) {
    if (!pointer || (e && e.pointerId !== pointer.id)) return;
    const dx = pointer.lastX - pointer.x;
    const dy = pointer.lastY - pointer.y;
    const dragged = pointer.dragged;
    pointer = null;
    stageFrame?.classList.remove("is-dragging");
    document.body.classList.remove("is-pospago-dragging");
    try {
      dragSurface.releasePointerCapture(e.pointerId);
    } catch (_) {
      /* noop */
    }
    const horizontal = Math.abs(dx) > Math.abs(dy) * 1.15;
    const enough = Math.abs(dx) > DRAG_MIN;
    if (!cancelled && dragged && horizontal && enough) {
      dragBlockedClick = true;
      tryGo(dx < 0 ? 1 : -1);
    } else {
      dragOffset = 0;
      layout();
    }
    window.setTimeout(() => {
      dragBlockedClick = false;
    }, 400);
    startTimer();
  }

  dragSurface.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    if (ignoreDragTarget(e.target)) return;
    pointer = {
      x: e.clientX,
      y: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      t: Date.now(),
      dragged: false,
      id: e.pointerId,
    };
    dragOffset = 0;
    stageFrame?.classList.add("is-dragging");
    stopTimer();
    try {
      dragSurface.setPointerCapture(e.pointerId);
    } catch (_) {
      /* noop */
    }
  });

  dragSurface.addEventListener("pointermove", (e) => {
    if (!pointer || e.pointerId !== pointer.id) return;
    pointer.lastX = e.clientX;
    pointer.lastY = e.clientY;
    const dx = e.clientX - pointer.x;
    const dy = e.clientY - pointer.y;
    if (!pointer.dragged && Math.abs(dx) > 16 && Math.abs(dx) > Math.abs(dy) * 1.15) {
      pointer.dragged = true;
      document.body.classList.add("is-pospago-dragging");
    }
    if (!pointer.dragged) return;
    dragOffset = dx;
    layout();
  });

  dragSurface.addEventListener("pointerup", (e) => endPointerDrag(e, false));
  dragSurface.addEventListener("pointercancel", (e) => endPointerDrag(e, true));

  stage?.addEventListener("mouseenter", () => {
    if (!pointer) stopTimer();
  });
  stage?.addEventListener("mouseleave", () => {
    if (!pointer) startTimer();
  });

  let wheelLock = false;
  let wheelAcc = 0;
  let wheelQuiet = 0;
  const WHEEL_STEP = 72;

  function isHorizontalSwipe(e) {
    return Math.abs(e.deltaX) >= 8 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2;
  }

  function isOverCarousel(e) {
    const el = e.target instanceof Element ? e.target : document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return Boolean(stage?.matches(":hover"));
    return Boolean(
      stage?.contains(el) ||
        dragSurface.contains(el) ||
        el.closest(".pospago-hero, .pospago-hero__stage, .pospago-coverflow")
    );
  }

  function releaseWheelLock() {
    wheelLock = false;
    wheelAcc = 0;
  }

  window.addEventListener(
    "wheel",
    (e) => {
      if (!isHorizontalSwipe(e)) return;
      if (e.cancelable) e.preventDefault();
      if (pointer) return;
      if (!isOverCarousel(e)) return;

      window.clearTimeout(wheelQuiet);
      wheelQuiet = window.setTimeout(releaseWheelLock, 480);

      if (wheelLock || Date.now() < navLockUntil) return;
      wheelAcc += e.deltaX;
      if (Math.abs(wheelAcc) < WHEEL_STEP) return;
      wheelLock = true;
      tryGo(wheelAcc > 0 ? 1 : -1);
      wheelAcc = 0;
      startTimer();
    },
    { passive: false, capture: true }
  );

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

  function relayoutIfNeeded() {
    const width = cardLayoutWidth();
    if (width < 48) return;
    if (lastLayoutWidth && Math.abs(width - lastLayoutWidth) < 2) return;
    layout();
  }

  let resizeTick = 0;
  function onViewportChange() {
    window.cancelAnimationFrame(resizeTick);
    resizeTick = window.requestAnimationFrame(relayoutIfNeeded);
  }

  window.addEventListener("resize", onViewportChange);
  const frame = root.parentElement;
  if (typeof ResizeObserver === "function" && frame) {
    new ResizeObserver(onViewportChange).observe(frame);
  }
  window.requestAnimationFrame(layout);
  startTimer();
})();
