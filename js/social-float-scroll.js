/**
 * Redes flotantes — más transparentes al bajar, visibles al subir o en la parte alta.
 */
(function () {
  const dock = document.querySelector(".social-float");
  if (!dock) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastY = window.scrollY;
  let ticking = false;
  const topThreshold = 72;

  function setFaded(faded) {
    dock.classList.toggle("is-scroll-faded", faded);
  }

  function update() {
    ticking = false;
    const y = window.scrollY;

    if (y <= topThreshold) {
      setFaded(false);
      lastY = y;
      return;
    }

    const delta = y - lastY;
    if (delta > 6) {
      setFaded(true);
    } else if (delta < -6) {
      setFaded(false);
    }

    lastY = y;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  dock.addEventListener("mouseenter", () => setFaded(false));
  dock.addEventListener("focusin", () => setFaded(false));
  dock.addEventListener("mouseleave", () => {
    if (window.scrollY > topThreshold) setFaded(true);
  });
  dock.addEventListener("focusout", (e) => {
    if (!dock.contains(e.relatedTarget) && window.scrollY > topThreshold) {
      setFaded(true);
    }
  });

  if (!reducedMotion) {
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  update();
})();
