/**
 * Tema fijo en modo claro corporativo (blanco + azul).
 */
(function () {
  const FIXED_THEME = "day";

  function applyTheme() {
    document.documentElement.dataset.yaavsTheme = FIXED_THEME;
    document.documentElement.style.colorScheme = "light";

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", "#2563b5");
    }

    document.dispatchEvent(
      new CustomEvent("yaavs:theme-change", { detail: { theme: FIXED_THEME } })
    );
    return FIXED_THEME;
  }

  applyTheme();

  function markPageEnterPending() {
    const body = document.body;
    if (!body || body.classList.contains("page-intro-active")) return;
    /* Evita pantalla blanca si la animación de entrada no arranca */
    body.classList.add("page-enter-pending");
    window.setTimeout(() => {
      if (body.classList.contains("page-enter-pending") && !body.classList.contains("page-enter-active")) {
        body.classList.remove("page-enter-pending");
        body.classList.add("page-enter-done");
      }
    }, 2200);
  }

  if (document.body) markPageEnterPending();
  else document.addEventListener("DOMContentLoaded", markPageEnterPending, { once: true });

  window.YaavsTheme = {
    apply: applyTheme,
    get: () => FIXED_THEME,
    getPreference: () => "day",
  };
})();
