/**
 * YVS Services Deck v6 — vuelve a reproducirse UN SOLO video a la
 * vez: el de la tarjeta en hover/foco. El resto queda en su
 * poster/primer frame (con el tinte de color puesto vía CSS, así no
 * se ven "vacías"). Pedido del usuario: "si se ven [los videos] al
 * mismo tiempo se pierde".
 *
 * Debounce de 220ms al salir (leaveTimers) para tolerar pequeños
 * deslices del mouse/trackpad — mismo patrón que ya se probó y
 * funcionó bien en una iteración anterior de este deck.
 *
 * Nota: nada aquí toca transform en .yvs-tile ni en ningún ancestro
 * del <video> — solo se agrega/quita la clase "is-playing" y se
 * llama play()/pause(). Es justo el patrón que resolvió el bug de
 * compositing de Chrome hace varias iteraciones.
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
