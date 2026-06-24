/**
 * Tema dùa / noche ù automùtico por hora (CDMX) + toggle manual.
 * Ejecutar en <head> antes de los CSS para evitar parpadeo.
 */
(function () {
  const STORAGE_KEY = "yaavs-theme-pref";
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

  function resolveTheme(pref) {
    if (pref === "day" || pref === "night") return pref;
    return isDayByClock() ? "day" : "night";
  }

  function applyTheme(theme) {
    const resolved = theme === "day" || theme === "night" ? theme : resolveTheme(theme);
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

  const stored = localStorage.getItem(STORAGE_KEY) || "auto";
  applyTheme(stored === "auto" ? resolveTheme("auto") : stored);

  function initToggle() {
    const toggle = document.getElementById("yaavs-theme-toggle");
    if (!toggle || toggle.dataset.bound === "true") return;
    toggle.dataset.bound = "true";

    const updateToggle = () => {
      const pref = localStorage.getItem(STORAGE_KEY) || "auto";
      const active = document.documentElement.dataset.yaavsTheme || "day";
      toggle.dataset.pref = pref;
      toggle.dataset.active = active;
      toggle.setAttribute(
        "aria-label",
        pref === "auto"
          ? `Modo automùtico (${active === "day" ? "dùa" : "noche"}). Toca para cambiar`
          : `Modo ${active === "day" ? "dùa" : "noche"}. Toca para cambiar`
      );
      toggle.setAttribute(
        "title",
        pref === "auto" ? `Automùtico ù ${active === "day" ? "Dùa" : "Noche"}` : active === "day" ? "Modo dùa" : "Modo noche"
      );
    };

    toggle.addEventListener("click", () => {
      const pref = localStorage.getItem(STORAGE_KEY) || "auto";
      const active = document.documentElement.dataset.yaavsTheme || "day";
      let nextPref = "auto";
      let nextTheme = resolveTheme("auto");

      if (pref === "auto") {
        nextPref = "day";
        nextTheme = "day";
      } else if (pref === "day") {
        nextPref = "night";
        nextTheme = "night";
      } else {
        nextPref = "auto";
        nextTheme = resolveTheme("auto");
      }

      localStorage.setItem(STORAGE_KEY, nextPref);
      applyTheme(nextTheme);
      updateToggle();
      window.YaavsSonic?.play?.();
    });

    updateToggle();
    document.addEventListener("yaavs:theme-change", updateToggle);
  }

  function scheduleClockCheck() {
    window.setInterval(() => {
      const pref = localStorage.getItem(STORAGE_KEY) || "auto";
      if (pref !== "auto") return;
      applyTheme("auto");
    }, 60000);
  }

  window.YaavsTheme = {
    apply: applyTheme,
    get: () => document.documentElement.dataset.yaavsTheme || "day",
    getPreference: () => localStorage.getItem(STORAGE_KEY) || "auto",
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initToggle();
      scheduleClockCheck();
    });
  } else {
    initToggle();
    scheduleClockCheck();
  }

  document.addEventListener("yaavs:layout-ready", initToggle);
})();
