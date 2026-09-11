/**
 * YVS Services Deck v5 — el video ES la tarjeta, reproduciéndose
 * siempre que está visible en pantalla (no depende de hover). Un
 * IntersectionObserver reproduce/pausa cada <video> según entra o
 * sale del viewport, para no tener 10 videos corriendo a la vez sin
 * necesidad (batería/datos en móvil).
 *
 * Nota: nada aquí toca transform en .yvs-tile ni en ningún ancestro
 * del <video> — es justo lo que rompía el pintado en Chrome en
 * versiones anteriores del deck. El hover ahora es solo box-shadow/
 * borde (CSS puro), así que no hay nada que este script necesite
 * coordinar para eso.
 */
(function () {
  "use strict";

  function init() {
    const grid = document.getElementById("yvs-services-grid");
    if (!grid) return;

    const videos = Array.from(grid.querySelectorAll(".yvs-tile__video"));
    if (!videos.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      // Deja el poster estático, no reproduce nada.
      return;
    }

    if (!("IntersectionObserver" in window)) {
      // Sin soporte: reproduce todo de una vez (mejor que nada).
      videos.forEach((v) => {
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            const p = video.play();
            if (p && p.catch) p.catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { root: null, rootMargin: "80px 0px", threshold: 0.15 }
    );

    videos.forEach((v) => observer.observe(v));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
