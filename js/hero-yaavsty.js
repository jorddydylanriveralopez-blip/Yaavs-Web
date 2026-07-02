(function () {
  const src = window.YAAVS_HERO_YAAVSTY;
  const guide = document.getElementById("hero-guide");
  if (!guide) return;

  const guideImg = guide.querySelector(".hero-guide__img");
  if (src && guideImg) guideImg.src = src;

  const target = document.getElementById("quienes-somos");
  const hero = document.getElementById("inicio-banner");
  const footer = document.getElementById("site-footer");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const waypoints = [];
  let segment = 0;
  let progress = 0;
  let rafId = 0;
  let lastTick = 0;
  let mode = "idle";
  let followX = 0;
  let followY = 0;
  let followPhase = 0;
  let mounted = false;

  function scrollToContent() {
    if (!target) return;
    target.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
    guide.classList.add("is-engaged");
    window.setTimeout(() => guide.classList.remove("is-engaged"), 900);
  }

  guide.addEventListener("click", scrollToContent);

  guide.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollToContent();
    }
  });

  function getHeaderOffset() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : 72;
  }

  function mountGuideToBody() {
    if (mounted) return;
    document.body.appendChild(guide);
    mounted = true;
  }

  function layoutPath() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const size = guide.offsetWidth || 84;
    const margin = 10;
    const header = getHeaderOffset();
    const socialReserve = Math.min(88, width * 0.12);
    const maxX = Math.max(margin, width - size - margin - socialReserve);
    const minY = header + margin;
    const maxY = Math.max(minY + 40, height - size * 0.82 - margin);

    waypoints.length = 0;
    waypoints.push(
      { x: margin, y: minY + (maxY - minY) * 0.58 },
      { x: maxX * 0.34, y: maxY },
      { x: maxX * 0.58, y: minY + (maxY - minY) * 0.22 },
      { x: maxX, y: minY + (maxY - minY) * 0.48 },
      { x: maxX * 0.72, y: minY + (maxY - minY) * 0.74 },
      { x: maxX * 0.38, y: minY + (maxY - minY) * 0.36 },
      { x: margin + 16, y: minY + (maxY - minY) * 0.14 },
      { x: maxX * 0.18, y: maxY * 0.92 }
    );
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function setPosition(x, y, facingLeft) {
    guide.style.setProperty("--fx", `${x.toFixed(1)}px`);
    guide.style.setProperty("--fy", `${y.toFixed(1)}px`);
    guide.classList.toggle("is-facing-left", facingLeft);
  }

  function readPosition() {
    const x = parseFloat(guide.style.getPropertyValue("--fx")) || 0;
    const y = parseFloat(guide.style.getPropertyValue("--fy")) || 0;
    return { x, y };
  }

  function getFollowTarget() {
    const width = window.innerWidth;
    const size = guide.offsetWidth || 84;
    const header = getHeaderOffset();
    const margin = Math.max(10, width * 0.03);
    const socialReserve = Math.min(88, width * 0.12);
    const x = width < 768 ? margin : Math.min(margin + 4, width - size - socialReserve - margin);
    const y = header + (window.innerHeight - header - size * 0.9) * 0.52;
    return { x, y };
  }

  function isHeroInView() {
    if (!hero) return false;
    const rect = hero.getBoundingClientRect();
    return rect.bottom > window.innerHeight * 0.28;
  }

  function isNearFooter() {
    if (!footer) return false;
    const rect = footer.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.92;
  }

  function isPastHero() {
    if (!hero) return window.scrollY > window.innerHeight * 0.45;
    const rect = hero.getBoundingClientRect();
    return rect.bottom < window.innerHeight * 0.42;
  }

  function setMode(next) {
    if (mode === next) return;
    mode = next;
    guide.classList.toggle("is-following", next === "follow");
    guide.classList.toggle("is-visible", next !== "hidden");

    if (next === "follow") {
      const current = readPosition();
      followX = current.x;
      followY = current.y;
    }
  }

  function updateModeFromScroll() {
    if (!guide.classList.contains("is-ready")) return;

    if (isNearFooter()) {
      setMode("hidden");
      guide.classList.add("is-hidden");
      return;
    }

    guide.classList.remove("is-hidden");

    if (isPastHero() && !isHeroInView()) {
      setMode("follow");
      return;
    }

    setMode("hero");
  }

  function tickHero(now) {
    if (waypoints.length < 2) return;

    const dt = Math.min(48, now - lastTick || 16);
    lastTick = now;
    progress += dt * 0.00022;

    if (progress >= 1) {
      progress = 0;
      segment = (segment + 1) % waypoints.length;
    }

    const from = waypoints[segment];
    const to = waypoints[(segment + 1) % waypoints.length];
    const t = easeInOut(progress);
    const x = lerp(from.x, to.x, t);
    const y = lerp(from.y, to.y, t);
    const dx = to.x - from.x;

    setPosition(x, y, dx < 0);
  }

  function tickFollow(now) {
    const dt = Math.min(48, now - lastTick || 16);
    lastTick = now;
    followPhase += dt * 0.0016;

    const goal = getFollowTarget();
    const ease = reduced ? 1 : 0.08;
    followX = lerp(followX, goal.x, ease);
    followY = lerp(followY, goal.y, ease);

    const drift = reduced ? 0 : Math.sin(followPhase) * 6;
    setPosition(followX + drift, followY, drift < 0);
  }

  function tick(now) {
    rafId = requestAnimationFrame(tick);

    if (!guide.classList.contains("is-ready") || mode === "hidden" || mode === "idle") {
      lastTick = now;
      return;
    }

    if (mode === "hero") {
      tickHero(now);
      return;
    }

    if (mode === "follow") {
      tickFollow(now);
    }
  }

  function startFlight() {
    layoutPath();
    cancelAnimationFrame(rafId);
    lastTick = 0;
    progress = 0;
    segment = 0;
    if (waypoints.length) setPosition(waypoints[0].x, waypoints[0].y, false);
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function revealGuide() {
    mountGuideToBody();
    guide.classList.add("is-ready", "is-visible");
    layoutPath();
    updateModeFromScroll();
    startFlight();
  }

  window.addEventListener(
    "scroll",
    () => {
      updateModeFromScroll();
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      if (!guide.classList.contains("is-ready")) return;
      layoutPath();
      updateModeFromScroll();
    },
    { passive: true }
  );

  if (!reduced) {
    document.addEventListener("yaavs:intro-done", () => window.setTimeout(revealGuide, 320), {
      once: true,
    });
    if (document.body.classList.contains("page-intro-done")) revealGuide();
  } else {
    revealGuide();
    updateModeFromScroll();
    if (mode === "hero" && waypoints.length) setPosition(waypoints[0].x, waypoints[0].y, false);
    if (mode === "follow") {
      const goal = getFollowTarget();
      setPosition(goal.x, goal.y, false);
    }
  }
})();
