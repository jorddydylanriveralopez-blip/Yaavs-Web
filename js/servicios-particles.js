/**
 * Partículas cyan en la sección catálogo de servicios.
 */
(function () {
  const section = document.querySelector(".svc-showcase-section");
  const canvas = document.querySelector(".svc-showcase__canvas");
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
    const count = Math.min(110, Math.max(48, Math.floor((w * h) / 9000)));
    particles = Array.from({ length: count }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.35, 0.35),
      vy: rand(-0.35, 0.35),
      r: rand(0.8, 2.4),
      alpha: rand(0.2, 0.85),
      cyan: Math.random() < 0.45,
      twinkle: rand(0, Math.PI * 2),
    }));
  }

  function tick() {
    if (!visible) return;

    ctx.clearRect(0, 0, w, h);
    const linkDist = 110;
    const linkDistSq = linkDist * linkDist;

    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < -10) a.x = w + 10;
      if (a.x > w + 10) a.x = -10;
      if (a.y < -10) a.y = h + 10;
      if (a.y > h + 10) a.y = -10;

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
          ? `rgba(0, 238, 255, ${0.14 * t})`
          : `rgba(255, 255, 255, ${0.06 * t})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }
    }

    const time = performance.now() * 0.001;
    for (const p of particles) {
      const tw = 0.5 + Math.sin(time * 1.6 + p.twinkle) * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * tw, 0, Math.PI * 2);
      if (p.cyan) {
        ctx.fillStyle = `rgba(0, 238, 255, ${p.alpha * 0.9})`;
        ctx.shadowColor = "rgba(0, 238, 255, 0.8)";
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.5})`;
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
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
    { threshold: 0.05, rootMargin: "60px 0px" }
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
    else {
      const r = section.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) start();
    }
  });
})();
