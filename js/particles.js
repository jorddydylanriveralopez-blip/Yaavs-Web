/**
 * Efecto original YAAVS — "Red de pulso"
 * Ondas de cobertura desde el hub central + paquetes de datos en una malla viva.
 * En reposo: red tranquila. Con el mouse: la red se activa y acelera.
 */
(function () {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFullPage = document.body.classList.contains("page-home");

  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let cx = 0;
  let cy = 0;
  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;
  let mouseActive = false;
  let energy = 0;
  let time = 0;
  let animationId = 0;

  const nodes = [];
  const packets = [];
  const pulses = [];
  let nodeCount = 0;

  const PAD = 40;
  let linkDist = 175;
  let pulseMaxR = 0;
  let packetMax = 36;
  let pulseMaxCount = 5;

  function isCompact() {
    return w < 768 || window.matchMedia("(pointer: coarse)").matches;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = w / 2;
    cy = h / 2;
    pulseMaxR = Math.hypot(cx, cy) * 0.98;
    linkDist = Math.min(210, Math.max(155, Math.min(w, h) * 0.16));
    targetMouseX = cx;
    targetMouseY = cy;
    mouseX = cx;
    mouseY = cy;
  }

  function inLogoZone(x, y) {
    const dx = (x - cx) / (w * 0.22);
    const dy = (y - cy) / (h * 0.18);
    return dx * dx + dy * dy < 1;
  }

  function addNode(x, y) {
    if (inLogoZone(x, y)) return false;
    nodes.push({
      x,
      y,
      ox: x,
      oy: y,
      phase: rand(0, Math.PI * 2),
      size: rand(1.1, 2.1),
    });
    return true;
  }

  function buildNodes() {
    nodes.length = 0;

    const anchors = [
      [PAD, PAD],
      [w - PAD, PAD],
      [PAD, h - PAD],
      [w - PAD, h - PAD],
      [cx, PAD],
      [cx, h - PAD],
      [PAD, cy],
      [w - PAD, cy],
      [PAD * 2, PAD * 2],
      [w - PAD * 2, PAD * 2],
      [PAD * 2, h - PAD * 2],
      [w - PAD * 2, h - PAD * 2],
    ];
    anchors.forEach(([x, y]) => addNode(x, y));

    const compact = isCompact();
    nodeCount = Math.min(
      compact ? 58 : 100,
      Math.floor((w * h) / (compact ? 12000 : 8500)) + (compact ? 28 : 48)
    );
    packetMax = compact ? 20 : 36;
    pulseMaxCount = compact ? 3 : 5;

    let guard = 0;
    while (nodes.length < nodeCount && guard < 500) {
      guard++;
      addNode(rand(PAD, w - PAD), rand(PAD, h - PAD));
    }
  }

  function spawnPacket() {
    if (packets.length >= packetMax || nodes.length < 2) return;
    const a = (Math.random() * nodes.length) | 0;
    let b = (Math.random() * nodes.length) | 0;
    if (a === b) b = (b + 1) % nodes.length;
    packets.push({
      from: a,
      to: b,
      t: 0,
      speed: rand(0.004, 0.009),
    });
  }

  function spawnPulse() {
    if (pulses.length >= pulseMaxCount) return;
    pulses.push({ r: Math.min(w, h) * 0.08, alpha: 0.32 });
  }

  function drawLinks(act) {
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy);
        if (dist > linkDist) continue;

        const strength = 1 - dist / linkDist;
        let alpha = strength * 0.14 * (0.45 + act * 0.55);

        if (mouseActive) {
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const md = Math.hypot(mx - mouseX, my - mouseY);
          if (md < 200) alpha += strength * (1 - md / 200) * 0.25 * act;
        }

        ctx.strokeStyle = `rgba(0, 238, 255, ${Math.min(alpha * 1.4, 0.85)})`;
        ctx.lineWidth = 0.6 + strength * 0.4;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const hubDist = Math.hypot(n.x - cx, n.y - cy);
      const alpha = (1 - Math.min(hubDist / pulseMaxR, 1)) * 0.07 * (0.5 + act * 0.5);
      if (alpha < 0.008) continue;
      ctx.strokeStyle = `rgba(0, 238, 255, ${Math.min(alpha * 1.35, 0.75)})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(n.x, n.y);
      ctx.stroke();
    }
  }

  function drawPulses(act) {
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.r += 1.2 + act * 2.5;
      p.alpha *= 0.985;
      if (p.alpha < 0.02 || p.r > pulseMaxR * 1.05) {
        pulses.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `rgba(0, 238, 255, ${p.alpha * (0.4 + act * 0.45)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawPackets(act) {
    for (let i = packets.length - 1; i >= 0; i--) {
      const pk = packets[i];
      pk.t += pk.speed * (1 + act * 1.8);
      if (pk.t >= 1) {
        packets.splice(i, 1);
        continue;
      }
      const a = nodes[pk.from];
      const b = nodes[pk.to];
      const t = pk.t;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      const glow = 0.5 + act * 0.5;

      ctx.fillStyle = `rgba(100, 250, 255, ${0.95 * glow})`;
      ctx.beginPath();
      ctx.arc(x, y, 2 + act, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(0, 238, 255, ${0.55 * glow * (1 - t)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(a.x + (b.x - a.x) * Math.max(0, t - 0.08), a.y + (b.y - a.y) * Math.max(0, t - 0.08));
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }

  function updateNodes(act) {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const drift = Math.sin(time * 0.0012 + n.phase) * (0.8 + act * 0.6);
      n.x = n.ox + Math.cos(n.phase) * drift;
      n.y = n.oy + Math.sin(n.phase) * drift;

      if (mouseActive) {
        const dx = n.x - mouseX;
        const dy = n.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < 180 && dist > 1) {
          const push = ((180 - dist) / 180) * 0.35 * act;
          n.x += (dx / dist) * push;
          n.y += (dy / dist) * push;
        }
      }

      if (inLogoZone(n.x, n.y)) {
        const dx = n.x - cx;
        const dy = n.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        n.x = cx + (dx / d) * w * 0.24;
        n.y = cy + (dy / d) * h * 0.2;
        n.ox = n.x;
        n.oy = n.y;
      }
    }
  }

  function drawNodes(act) {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const pulse = 0.5 + Math.sin(time * 0.0025 + n.phase) * 0.5;
      const alpha = 0.2 + pulse * 0.35 * (0.5 + act * 0.5);
      ctx.fillStyle = `rgba(0, 238, 255, ${Math.min(alpha * 1.3, 0.9)})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = `rgba(0, 240, 255, ${0.35 + act * 0.25})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStatic() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);
    energy = 0.3;
    drawLinks(0.3);
    drawNodes(0.3);
    drawPulses(0.3);
  }

  function tick() {
    time = performance.now();

    targetMouseX = mouseActive ? targetMouseX : cx;
    targetMouseY = mouseActive ? targetMouseY : cy;
    mouseX += (targetMouseX - mouseX) * 0.1;
    mouseY += (targetMouseY - mouseY) * 0.1;

    const targetEnergy = mouseActive ? 1 : 0;
    energy += (targetEnergy - energy) * 0.04;

    ctx.fillStyle = `rgba(0, 0, 0, ${0.14 + energy * 0.08})`;
    ctx.fillRect(0, 0, w, h);

    updateNodes(energy);
    drawPulses(energy);
    drawLinks(energy);
    drawPackets(energy);
    drawNodes(energy);

    if (Math.random() < 0.04 + energy * 0.06) spawnPacket();
    if (Math.random() < 0.008 + energy * 0.01) spawnPulse();

    animationId = requestAnimationFrame(tick);
  }

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    targetMouseX = e.clientX - rect.left;
    targetMouseY = e.clientY - rect.top;
    mouseActive = true;
  }

  function onPointerLeave() {
    mouseActive = false;
  }

  resize();
  buildNodes();
  for (let i = 0; i < 12; i++) spawnPacket();
  spawnPulse();

  if (reducedMotion) {
    drawStatic();
    window.addEventListener("resize", () => {
      resize();
      buildNodes();
      drawStatic();
    });
    return;
  }

  tick();

  window.addEventListener("resize", () => {
    resize();
    buildNodes();
    packets.length = 0;
    pulses.length = 0;
    for (let i = 0; i < 8; i++) spawnPacket();
  });

  if (isFullPage) {
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
  } else {
    const zone = canvas.closest(".hero-particles") || canvas;
    zone.addEventListener("pointermove", onPointerMove, { passive: true });
    zone.addEventListener("pointerleave", onPointerLeave);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(animationId);
    else tick();
  });
})();
