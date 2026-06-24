/**
 * Partículas flotantes en la sección manifiesto.
 */
(function () {
  const section = document.querySelector(".manifesto");
  const canvas = document.querySelector(".manifesto__canvas");
  if (!section || !canvas) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let animationId = 0;
  let visible = false;
  let particles = [];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    const rect = section.getBoundingClientRect();
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function buildParticles() {
    const count = Math.min(90, Math.max(36, Math.floor((w * h) / 12000)));
    particles = Array.from({ length: count }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.22, 0.22),
      vy: rand(-0.22, 0.22),
      r: rand(0.6, 1.8),
      alpha: rand(0.18, 0.72),
      cyan: Math.random() < 0.22,
      twinkle: rand(0, Math.PI * 2),
    }));
  }

  function tick() {
    if (!visible) return;

    ctx.clearRect(0, 0, w, h);
    const linkDist = 95;
    const linkDistSq = linkDist * linkDist;

    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < -8) a.x = w + 8;
      if (a.x > w + 8) a.x = -8;
      if (a.y < -8) a.y = h + 8;
      if (a.y > h + 8) a.y = -8;

      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > linkDistSq) continue;

        const t = 1 - distSq / linkDistSq;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = a.cyan || b.cyan
          ? `rgba(0, 238, 255, ${0.08 * t})`
          : `rgba(255, 255, 255, ${0.05 * t})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }

    const time = performance.now() * 0.001;
    for (const p of particles) {
      const tw = 0.55 + Math.sin(time * 1.4 + p.twinkle) * 0.45;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.cyan
        ? `rgba(0, 238, 255, ${p.alpha * tw})`
        : `rgba(255, 255, 255, ${p.alpha * tw})`;
      ctx.fill();
    }

    animationId = requestAnimationFrame(tick);
  }

  function start() {
    if (visible) return;
    visible = true;
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(tick);
  }

  function stop() {
    visible = false;
    cancelAnimationFrame(animationId);
    animationId = 0;
    ctx.clearRect(0, 0, w, h);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) start();
      else stop();
    },
    { threshold: 0.08, rootMargin: "80px 0px" }
  );

  resize();
  buildParticles();
  observer.observe(section);

  window.addEventListener("resize", () => {
    resize();
    buildParticles();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (section.getBoundingClientRect().bottom > 0 && section.getBoundingClientRect().top < window.innerHeight) {
      start();
    }
  });
})();
