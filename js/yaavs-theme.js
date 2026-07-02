/**
 * Tema fijo en modo día.
 * Se desactiva el cambio automático día/noche.
 */
(function () {
  const FIXED_THEME = "day";

  function applyTheme() {
    document.documentElement.dataset.yaavsTheme = FIXED_THEME;
    document.documentElement.style.colorScheme = "light";

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", "#ffffff");
    }

    document.dispatchEvent(
      new CustomEvent("yaavs:theme-change", { detail: { theme: FIXED_THEME } })
    );
    return FIXED_THEME;
  }

  applyTheme();

  window.YaavsTheme = {
    apply: applyTheme,
    get: () => FIXED_THEME,
    getPreference: () => "day",
  };
})();
