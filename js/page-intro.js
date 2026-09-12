/**
 * Intro YAAVS — logo animado solo la primera vez que entran.
 * Luego se guarda en localStorage y no vuelve a mostrarse.
 */
(function () {
  if (!document.body.classList.contains("page-home")) return;

  const intro = document.getElementById("page-intro");
  if (!intro) return;

  const INTRO_KEY = "yaavs-intro-seen";
  const perf = window.YAAVS_PERF || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const skipEarly = document.documentElement.classList.contains("yaavs-skip-intro");

  function markIntroSeen() {
    try {
      localStorage.setItem(INTRO_KEY, "1");
    } catch (_) {
      /* noop */
    }
  }

  let finished = false;

  function finishIntro() {
    if (finished) return;
    finished = true;
    markIntroSeen();
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
