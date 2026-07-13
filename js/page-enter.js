/**
 * Transición de entrada suave — todas las páginas.
 */
(function () {
  const body = document.body;
  if (!body) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function finishInstant() {
    body.classList.remove("page-enter-pending", "page-enter-active", "page-enter-stagger");
    body.classList.add("page-enter-done");
  }

  function getStaggerTargets() {
    const main = document.getElementById("contenido");
    if (!main) return [];

    if (body.classList.contains("page-home")) {
      return [...main.querySelectorAll(":scope > section")];
    }

    if (body.classList.contains("page-tiendas-map")) {
      return [...main.querySelectorAll(":scope > section")];
    }

    if (body.classList.contains("page-tiendas")) {
      return [];
    }

    if (main.children.length > 1) {
      return [...main.children];
    }

    return [];
  }

  function play() {
    if (body.classList.contains("page-enter-done")) return;

    if (body.classList.contains("page-intro-active")) {
      document.addEventListener(
        "yaavs:intro-done",
        () => {
          if (!reduced) body.classList.add("page-enter-pending");
          play();
        },
        { once: true }
      );
      return;
    }

    if (reduced) {
      finishInstant();
      return;
    }

    const targets = getStaggerTargets();
    const useStagger = targets.length > 1;

    if (useStagger) {
      targets.forEach((el, i) => {
        el.classList.add("page-enter-block");
        el.style.setProperty("--enter-i", String(i));
      });
      body.classList.add("page-enter-stagger");
    }

    body.classList.remove("page-enter-pending");
    requestAnimationFrame(() => {
      body.classList.add("page-enter-active");
    });

    const duration = useStagger ? 1200 + targets.length * 100 : 1000;
    window.setTimeout(() => {
      body.classList.add("page-enter-done");
      body.classList.remove("page-enter-active");
    }, duration);
  }

  window.YaavsPageEnter = { play, finishInstant };
})();
