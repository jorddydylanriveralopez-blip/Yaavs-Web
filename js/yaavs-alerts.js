/**
 * Avisos YAAVS — solo push (sin campanita in-app).
 * OneSignal: js/yaavs-onesignal.config.js
 */
(function () {
  const PERM_KEY = "yaavs-alerts-perm";
  const PREFS_KEY = "yaavs-alerts-prefs";

  function getPrefs() {
    const defaults = { promo: true, blog: true, vacante: true };
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      const stored = raw ? JSON.parse(raw) : null;
      return stored && typeof stored === "object" ? { ...defaults, ...stored } : defaults;
    } catch (_) {
      return defaults;
    }
  }

  function syncOneSignalTags(prefs) {
    if (!window.OneSignalDeferred) return;
    window.OneSignalDeferred.push(async (OneSignal) => {
      try {
        await OneSignal.User.addTags({
          interest_promo: prefs.promo ? "1" : "0",
          interest_blog: prefs.blog ? "1" : "0",
          interest_vacante: prefs.vacante ? "1" : "0",
        });
      } catch (_) {
        /* noop */
      }
    });
  }

  function ensurePermCss() {
    if (document.querySelector("style[data-yaavs-push-css]")) return;
    const style = document.createElement("style");
    style.dataset.yaavsPushCss = "true";
    style.textContent = `
      .yaavs-alerts-perm {
        position: fixed;
        left: 50%;
        bottom: max(20px, calc(env(safe-area-inset-bottom, 0px) + 20px));
        transform: translateX(-50%);
        z-index: 11900;
        width: min(420px, calc(100vw - 24px));
        display: none;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 14px 14px 16px;
        border-radius: 16px;
        border: 1px solid rgba(0, 151, 178, 0.28);
        background: rgba(255, 255, 255, 0.97);
        box-shadow: 0 18px 48px rgba(4, 16, 31, 0.24);
        color: #0f2440;
      }
      .yaavs-alerts-perm.is-open { display: flex; }
      .yaavs-alerts-perm__copy { flex: 1; min-width: 0; }
      .yaavs-alerts-perm__copy strong {
        display: block; font-size: 0.9rem; font-weight: 800; color: #003087; margin-bottom: 2px;
      }
      .yaavs-alerts-perm__copy span {
        display: block; font-size: 0.78rem; line-height: 1.4; color: #4a6278;
      }
      .yaavs-alerts-perm__actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
      .yaavs-alerts-perm__btn {
        appearance: none; border: 0; min-height: 34px; padding: 0 12px; border-radius: 999px;
        font: inherit; font-size: 0.76rem; font-weight: 800; cursor: pointer;
      }
      .yaavs-alerts-perm__btn--go {
        background: linear-gradient(135deg, #003087, #0097b2); color: #fff;
      }
      .yaavs-alerts-perm__btn--later { background: transparent; color: #007a96; }
    `;
    document.head.appendChild(style);
  }

  function showPermPrompt() {
    if (document.querySelector("[data-yaavs-alerts-perm]")) return;
    ensurePermCss();
    const card = document.createElement("div");
    card.className = "yaavs-alerts-perm";
    card.dataset.yaavsAlertsPerm = "true";
    card.innerHTML = `
      <div class="yaavs-alerts-perm__copy">
        <strong>Activa avisos YAAVS</strong>
        <span>Ofertas, noticias y vacantes llegan a tu teléfono. Sin campanita en el menú.</span>
      </div>
      <div class="yaavs-alerts-perm__actions">
        <button type="button" class="yaavs-alerts-perm__btn yaavs-alerts-perm__btn--go" data-perm-go>Activar</button>
        <button type="button" class="yaavs-alerts-perm__btn yaavs-alerts-perm__btn--later" data-perm-later>Ahora no</button>
      </div>
    `;
    document.body.appendChild(card);
    requestAnimationFrame(() => card.classList.add("is-open"));

    card.querySelector("[data-perm-later]")?.addEventListener("click", () => {
      try {
        localStorage.setItem(PERM_KEY, "1");
      } catch (_) {}
      card.remove();
    });

    card.querySelector("[data-perm-go]")?.addEventListener("click", async () => {
      try {
        localStorage.setItem(PERM_KEY, "1");
      } catch (_) {}
      try {
        if ("Notification" in window) await Notification.requestPermission();
      } catch (_) {}
      if (window.OneSignalDeferred) {
        window.OneSignalDeferred.push(async (OneSignal) => {
          try {
            await OneSignal.Notifications.requestPermission();
          } catch (_) {}
        });
      }
      syncOneSignalTags(getPrefs());
      card.remove();
    });
  }

  function init() {
    syncOneSignalTags(getPrefs());
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    try {
      if (localStorage.getItem(PERM_KEY) === "1") return;
    } catch (_) {
      return;
    }
    window.setTimeout(showPermPrompt, 2800);
  }

  window.YaavsAlerts = {
    getPrefs,
    syncTags: () => syncOneSignalTags(getPrefs()),
    askPush: showPermPrompt,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
