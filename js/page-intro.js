/**
 * Intro YAAVS — logo animado de entrada, luego la home normal.
 * Se puede saltar con el botón o clic. Respeta reduced-motion / save-data.
 */
(function () {
  if (!document.body.classList.contains("page-home")) return;

  const intro = document.getElementById("page-intro");
  if (!intro) return;

  const perf = window.YAAVS_PERF || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const skipEarly = document.documentElement.classList.contains("yaavs-skip-intro");

  let finished = false;

  function finishIntro() {
    if (finished) return;
    finished = true;
    document.dispatchEvent(new CustomEvent("yaavs:intro-start"));
    document.body.classList.remove("page-intro-active");
    document.body.classList.add("page-intro-done");
    intro.classList.add("is-revealing");
    document.dispatchEvent(new CustomEvent("yaavs:intro-done"));
    window.setTimeout(() => {
      try {
        intro.remove();
      } catch (_) {
        /* noop */
      }
    }, 720);
  }

  if (skipEarly || reducedMotion) {
    finishIntro();
    return;
  }

  intro.classList.add("is-playing");
  intro.setAttribute("aria-hidden", "false");
  document.dispatchEvent(new CustomEvent("yaavs:intro-start"));

  const holdMs = perf.soft || perf.lite ? 1600 : 2400;
  const revealTimer = window.setTimeout(() => {
    finishIntro();
  }, holdMs);

  function skipNow() {
    window.clearTimeout(revealTimer);
    finishIntro();
  }

  intro.querySelector("[data-intro-skip]")?.addEventListener("click", skipNow);
  intro.addEventListener(
    "click",
    (event) => {
      if (event.target.closest("[data-intro-skip]")) return;
      skipNow();
    },
    { once: true }
  );
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        skipNow();
      }
    },
    { once: true }
  );
})();
