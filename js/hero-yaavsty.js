(function () {
  const src = window.YAAVS_HERO_YAAVSTY;
  const guide = document.getElementById("hero-guide");
  if (!guide) return;

  const guideImg = guide.querySelector(".hero-guide__img");
  if (src && guideImg) guideImg.src = src;

  const target = document.getElementById("quienes-somos");
  const hero = document.getElementById("inicio-banner");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const waypoints = [];
  let segment = 0;
  let progress = 0;
  let rafId = 0;
  let lastTick = 0;

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

  function layoutPath() {
    if (!hero) return;
    const width = hero.clientWidth;
    const height = hero.clientHeight;
    const size = guide.offsetWidth || 180;
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

  function tick(now) {
    rafId = requestAnimationFrame(tick);

    if (
      !guide.classList.contains("is-visible") ||
      !guide.classList.contains("is-ready") ||
      waypoints.length < 2
    ) {
      lastTick = now;
      return;
    }

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

  function startFlight() {
    layoutPath();
    cancelAnimationFrame(rafId);
    lastTick = 0;
    progress = 0;
    segment = 0;
    if (waypoints.length) setPosition(waypoints[0].x, waypoints[0].y, false);
    if (!reduced) rafId = requestAnimationFrame(tick);
  }

  function revealGuide() {
    guide.classList.add("is-ready");
    startFlight();
  }

  if (hero && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        guide.classList.toggle("is-hidden", !entry.isIntersecting);
        guide.classList.toggle("is-visible", entry.isIntersecting);
        if (entry.isIntersecting && guide.classList.contains("is-ready")) startFlight();
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
    );
    observer.observe(hero);
  } else {
    guide.classList.add("is-visible");
  }

  window.addEventListener(
    "resize",
    () => {
      if (guide.classList.contains("is-ready")) layoutPath();
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
    if (waypoints.length) setPosition(waypoints[0].x, waypoints[0].y, false);
  }
})();
