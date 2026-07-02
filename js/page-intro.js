/**
 * Intro editorial — cortinas se abren, logo limpio, entrada rápida.
 * Solo la primera visita en el navegador (más rápido al regresar).
 */
(function () {
  if (!document.body.classList.contains("page-home")) return;

  const intro = document.getElementById("page-intro");
  if (!intro) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seenIntro = localStorage.getItem("yaavs-intro-seen") === "1";

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

  localStorage.setItem("yaavs-intro-seen", "1");
  intro.classList.add("is-playing");
  document.dispatchEvent(new CustomEvent("yaavs:intro-start"));

  window.setTimeout(() => {
    intro.classList.add("is-revealing");
    document.body.classList.remove("page-intro-active");
    document.body.classList.add("page-intro-done");
    document.dispatchEvent(new CustomEvent("yaavs:intro-done"));
  }, 800);

  window.setTimeout(() => intro.remove(), 1450);
})();
