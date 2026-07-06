/**
 * Tema fijo en modo oscuro corporativo.
 * Se desactiva el cambio automático día/noche.
 */
(function () {
  const FIXED_THEME = "night";

  function applyTheme() {
    document.documentElement.dataset.yaavsTheme = FIXED_THEME;
    document.documentElement.style.colorScheme = "dark";

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", "#0a0f16");
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
    getPreference: () => "night",
  };
})();
