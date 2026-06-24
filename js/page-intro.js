/**
 * Intro editorial — cortinas se abren, logo limpio, entrada rápida.
 */
(function () {
  if (!document.body.classList.contains("page-home")) return;

  const intro = document.getElementById("page-intro");
  if (!intro) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    document.dispatchEvent(new CustomEvent("yaavs:intro-start"));
    document.body.classList.remove("page-intro-active");
    document.body.classList.add("page-intro-done");
    intro.remove();
    document.dispatchEvent(new CustomEvent("yaavs:intro-done"));
    return;
  }

  intro.classList.add("is-playing");
  document.dispatchEvent(new CustomEvent("yaavs:intro-start"));

  window.setTimeout(() => {
    intro.classList.add("is-revealing");
    document.body.classList.remove("page-intro-active");
    document.body.classList.add("page-intro-done");
    document.dispatchEvent(new CustomEvent("yaavs:intro-done"));
  }, 880);

  window.setTimeout(() => intro.remove(), 1680);
})();
