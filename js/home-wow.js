/**
 * YAAVS — capa "wow": interacciones dinámicas del home
 * Barra de progreso de scroll, auroras de fondo y tilt 3D con glare.
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ── Barra de progreso de scroll ── */
  const progress = document.createElement("div");
  progress.className = "wow-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  let progressTicking = false;
  function updateProgress() {
    progressTicking = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    progress.style.setProperty("--wow-scroll", ratio.toFixed(4));
  }
  window.addEventListener(
    "scroll",
    () => {
      if (progressTicking) return;
      progressTicking = true;
      window.requestAnimationFrame(updateProgress);
    },
    { passive: true }
  );
  updateProgress();

  /* ── Auroras de fondo en secciones clave ── */
  if (!reduceMotion) {
    ["#servicios-preview", "#carriers", "#calendario-sorteos"].forEach((sel) => {
      const section = document.querySelector(sel);
      if (!section || section.querySelector(".wow-aurora")) return;
      const aurora = document.createElement("div");
      aurora.className = "wow-aurora";
      aurora.setAttribute("aria-hidden", "true");
      const position = window.getComputedStyle(section).position;
      if (position === "static") section.style.position = "relative";
      section.prepend(aurora);
    });
  }

  /* ── Glare (destello) en tarjetas de servicios ── */
  if (!reduceMotion && canHover) {
    document.querySelectorAll(".hx-svc-deck__item").forEach((item) => {
      if (item.querySelector(".wow-glare")) return;
      const glare = document.createElement("span");
      glare.className = "wow-glare";
      glare.setAttribute("aria-hidden", "true");
      item.appendChild(glare);

      item.addEventListener("pointerenter", () => item.classList.add("is-wow-active"));
      item.addEventListener("pointerleave", () => item.classList.remove("is-wow-active"));
      item.addEventListener(
        "pointermove",
        (event) => {
          const rect = item.getBoundingClientRect();
          item.style.setProperty("--wow-gx", (((event.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%");
          item.style.setProperty("--wow-gy", (((event.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%");
        },
        { passive: true }
      );
    });
  }

  /* ── Tilt 3D + glare en tarjetas de operadores ── */
  if (!reduceMotion && canHover) {
    const MAX_TILT = 6;
    document.querySelectorAll(".hx-ops__deck .hx-ops__card:not(.hx-ops__card--intro)").forEach((card) => {
      card.setAttribute("data-wow-tilt", "");
      if (window.getComputedStyle(card).position === "static") {
        card.style.position = "relative";
      }
      const glare = document.createElement("span");
      glare.className = "wow-glare";
      glare.setAttribute("aria-hidden", "true");
      card.appendChild(glare);

      let rafId = 0;
      let lastEvent = null;

      function applyTilt() {
        rafId = 0;
        if (!lastEvent) return;
        const rect = card.getBoundingClientRect();
        const px = (lastEvent.clientX - rect.left) / rect.width;
        const py = (lastEvent.clientY - rect.top) / rect.height;
        card.style.setProperty("--wow-ry", ((px - 0.5) * MAX_TILT * 2).toFixed(2) + "deg");
        card.style.setProperty("--wow-rx", ((0.5 - py) * MAX_TILT * 2).toFixed(2) + "deg");
        card.style.setProperty("--wow-gx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--wow-gy", (py * 100).toFixed(1) + "%");
      }

      card.addEventListener("pointerenter", () => {
        card.classList.add("is-wow-active");
        card.style.setProperty("--wow-lift", "-6px");
      });

      card.addEventListener("pointermove", (event) => {
        lastEvent = event;
        if (!rafId) rafId = window.requestAnimationFrame(applyTilt);
      });

      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-wow-active");
        lastEvent = null;
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
        card.style.setProperty("--wow-rx", "0deg");
        card.style.setProperty("--wow-ry", "0deg");
        card.style.setProperty("--wow-lift", "0px");
      });
    });
  }
})();
