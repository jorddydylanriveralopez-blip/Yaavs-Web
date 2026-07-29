/**
 * Intro editorial — cortinas se abren, logo limpio, entrada rápida.
 * Solo la primera visita en el navegador (más rápido al regresar).
 * Lite/soft: salta o acorta para no competir con el hero.
 */
(function () {
  if (!document.body.classList.contains("page-home")) return;

  const intro = document.getElementById("page-intro");
  if (!intro) return;

  const perf = window.YAAVS_PERF || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seenIntro = localStorage.getItem("yaavs-intro-seen") === "1";
  const skipEarly = document.documentElement.classList.contains("yaavs-skip-intro");

  function finishIntro() {
    document.dispatchEvent(new CustomEvent("yaavs:intro-start"));
    document.body.classList.remove("page-intro-active");
    document.body.classList.add("page-intro-done");
    intro.remove();
    document.dispatchEvent(new CustomEvent("yaavs:intro-done"));
  }

  /* Ya decidido en <head> o visitas siguientes: sin flash */
  if (skipEarly || reducedMotion || seenIntro || perf.lite) {
    finishIntro();
    return;
  }

  localStorage.setItem("yaavs-intro-seen", "1");

  const photo = intro.querySelector(".page-intro__photo");
  if (photo && photo.dataset.src && !photo.getAttribute("src")) {
    photo.src = photo.dataset.src;
  }

  intro.classList.add("is-playing");
  document.dispatchEvent(new CustomEvent("yaavs:intro-start"));

  const revealMs = perf.soft ? 320 : 520;
  const removeMs = perf.soft ? 720 : 980;

  window.setTimeout(() => {
    intro.classList.add("is-revealing");
    document.body.classList.remove("page-intro-active");
    document.body.classList.add("page-intro-done");
    document.dispatchEvent(new CustomEvent("yaavs:intro-done"));
  }, revealMs);

  window.setTimeout(() => intro.remove(), removeMs);
})();
