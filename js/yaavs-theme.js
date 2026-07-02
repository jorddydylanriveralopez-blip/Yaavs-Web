/**
 * Tema día / noche — automático por horario CDMX (7:00–21:00).
 * Ejecutar en <head> antes de los CSS para evitar parpadeo.
 */
(function () {
  const TZ = "America/Mexico_City";
  const DAY_START = 7;
  const DAY_END = 21;

  function getHourInMexico() {
    return Number(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: TZ,
      }).format(new Date())
    );
  }

  function isDayByClock() {
    const hour = getHourInMexico();
    return hour >= DAY_START && hour < DAY_END;
  }

  function applyTheme() {
    const resolved = isDayByClock() ? "day" : "night";
    document.documentElement.dataset.yaavsTheme = resolved;
    document.documentElement.style.colorScheme = resolved === "day" ? "light" : "dark";

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", resolved === "day" ? "#ffffff" : "#0a0a0a");
    }

    document.dispatchEvent(
      new CustomEvent("yaavs:theme-change", { detail: { theme: resolved } })
    );
    return resolved;
  }

  applyTheme();
  window.setInterval(applyTheme, 60000);

  window.YaavsTheme = {
    apply: applyTheme,
    get: () => document.documentElement.dataset.yaavsTheme || "day",
    getPreference: () => "auto",
  };
})();
