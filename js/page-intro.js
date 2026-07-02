/**
 * Intro editorial — cortinas se abren, logo limpio, entrada rápida.
 * Solo la primera visita por sesión (más rápido al regresar).
 */
(function () {
  if (!document.body.classList.contains("page-home")) return;

  const intro = document.getElementById("page-intro");
  if (!intro) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seenIntro = sessionStorage.getItem("yaavs-intro-seen") === "1";

  function finishIntro() {
    document.dispatchEvent(new CustomEvent("yaavs:intro-start"));
    document.body.classList.remove("page-intro-active");
    document.body.classList.add("page-intro-done");
    intro.remove();
    document.dispatchEvent(new CustomEvent("yaavs:intro-done"));
  }

  if (reducedMotion || seenIntro) {
    finishIntro();
    return;
  }

  sessionStorage.setItem("yaavs-intro-seen", "1");
  intro.classList.add("is-playing");
  document.dispatchEvent(new CustomEvent("yaavs:intro-start"));

  window.setTimeout(() => {
    intro.classList.add("is-revealing");
    document.body.classList.remove("page-intro-active");
    document.body.classList.add("page-intro-done");
    document.dispatchEvent(new CustomEvent("yaavs:intro-done"));
  }, 1100);

  window.setTimeout(() => intro.remove(), 1950);
})();
