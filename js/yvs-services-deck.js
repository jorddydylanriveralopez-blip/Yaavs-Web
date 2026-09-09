/**
 * YVS Services Deck v1 — lógica de hover/video aislada y simplificada.
 * Un solo estado por tarjeta (clase "is-playing"), sin depender de
 * home-experience.js ni de sus 5+ clases combinadas (is-deck-expanded,
 * is-active, is-deck-video-on, is-wow-visible, is-deck-in). Videos con
 * preload="auto" desde el HTML, así ya están listos para el primer hover.
 */
(function () {
  "use strict";

  function init() {
    const grid = document.getElementById("yvs-services-grid");
    if (!grid) return;

    const cards = grid.querySelectorAll(".yvs-tile");
    const leaveTimers = new WeakMap();

    cards.forEach((card) => {
      const video = card.querySelector(".yvs-tile__video");
      if (!video) return;

      function play() {
        const pending = leaveTimers.get(card);
        if (pending) {
          clearTimeout(pending);
          leaveTimers.delete(card);
        }
        if (card.classList.contains("is-playing")) return;
        video.currentTime = 0;
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
        card.classList.add("is-playing");
      }

      function stop() {
        const existing = leaveTimers.get(card);
        if (existing) clearTimeout(existing);
        const timer = window.setTimeout(() => {
          leaveTimers.delete(card);
          card.classList.remove("is-playing");
          video.pause();
          try {
            video.currentTime = 0;
          } catch (_) {
            /* noop */
          }
        }, 220);
        leaveTimers.set(card, timer);
      }

      card.addEventListener("mouseenter", play);
      card.addEventListener("mouseleave", stop);
      card.addEventListener("focusin", play);
      card.addEventListener("focusout", (e) => {
        if (card.contains(e.relatedTarget)) return;
        stop();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
