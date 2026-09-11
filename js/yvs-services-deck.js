/**
 * YVS Services Deck v4 — inclinación 3D tipo Apple siguiendo el
 * mouse, brillo que recorre la superficie y sombra dinámica. Sin
 * video (ver nota en assets/yvs-services-deck.css sobre por qué se
 * quitó: un tilt real necesita transform en .yvs-tile, y eso es
 * justo lo que rompía el pintado del <video> en Chrome).
 *
 * Solo se activa con puntero fino (mouse) — en touch no hay hover
 * real, así que el CSS ya desactiva el tilt ahí (@media hover:none)
 * y aquí ni siquiera se enganchan los listeners.
 */
(function () {
  "use strict";

  function init() {
    const grid = document.getElementById("yvs-services-grid");
    if (!grid) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reducedMotion) return;

    const MAX_TILT = 10; // grados

    grid.querySelectorAll(".yvs-tile").forEach((tile) => {
      let rect = null;
      let raf = null;
      let pendingEvent = null;

      function apply() {
        raf = null;
        if (!pendingEvent || !rect) return;
        const x = (pendingEvent.clientX - rect.left) / rect.width; // 0..1
        const y = (pendingEvent.clientY - rect.top) / rect.height; // 0..1
        const rx = (x - 0.5) * 2 * MAX_TILT; // rotateY
        const ry = (0.5 - y) * 2 * MAX_TILT; // rotateX
        tile.style.setProperty("--yvs-rx", rx.toFixed(2) + "deg");
        tile.style.setProperty("--yvs-ry", ry.toFixed(2) + "deg");
        tile.style.setProperty("--yvs-scale", "1.04");
        tile.style.setProperty("--yvs-mx", (x * 100).toFixed(1) + "%");
        tile.style.setProperty("--yvs-my", (y * 100).toFixed(1) + "%");
        // Sombra dinámica: se desplaza en la dirección opuesta al
        // tilt, como si la luz viniera del lado hacia el que se
        // inclina la tarjeta.
        const shadowX = (x - 0.5) * -18;
        const shadowY = (y - 0.5) * -18 + 10;
        tile.style.setProperty(
          "--yvs-shadow",
          `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 30px rgba(1, 17, 66, 0.32)`
        );
      }

      function onMove(e) {
        pendingEvent = e;
        if (raf == null) raf = requestAnimationFrame(apply);
      }

      function onEnter() {
        rect = tile.getBoundingClientRect();
      }

      function onLeave() {
        if (raf != null) {
          cancelAnimationFrame(raf);
          raf = null;
        }
        tile.style.setProperty("--yvs-rx", "0deg");
        tile.style.setProperty("--yvs-ry", "0deg");
        tile.style.setProperty("--yvs-scale", "1");
        tile.style.setProperty("--yvs-shadow", "0 10px 26px rgba(1, 17, 66, 0.22)");
      }

      tile.addEventListener("mouseenter", onEnter);
      tile.addEventListener("mousemove", onMove);
      tile.addEventListener("mouseleave", onLeave);
      tile.addEventListener("blur", onLeave);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
