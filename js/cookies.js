(function () {
  const STORAGE_KEY = "yaavs_cookie_consent_v1";
  const EVENT = "yaavs:cookie-consent";

  function readConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") return null;
      return {
        necessary: true,
        preferences: Boolean(data.preferences),
        analytics: Boolean(data.analytics),
        ts: data.ts || null,
      };
    } catch (_) {
      return null;
    }
  }

  function writeConsent(partial) {
    const next = {
      necessary: true,
      preferences: Boolean(partial.preferences),
      analytics: Boolean(partial.analytics),
      ts: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.YaavsCookies = window.YaavsCookies || {};
    window.YaavsCookies.consent = next;
    document.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
    return next;
  }

  function ensureCss() {
    if (document.querySelector('link[data-yaavs-cookies-css]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "cookies.css?v=1";
    link.dataset.yaavsCookiesCss = "true";
    document.head.appendChild(link);
  }

  function buildBanner() {
    const root = document.createElement("div");
    root.className = "yaavs-cookies";
    root.id = "yaavs-cookies";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "false");
    root.setAttribute("aria-labelledby", "yaavs-cookies-title");
    root.innerHTML = `
      <p class="yaavs-cookies__kicker">Privacidad</p>
      <h2 class="yaavs-cookies__title" id="yaavs-cookies-title">Usamos cookies</h2>
      <p class="yaavs-cookies__text">
        Utilizamos cookies necesarias para que el sitio funcione y, si lo permites,
        cookies de preferencias y medición para mejorar tu experiencia.
        Consulta nuestro <a href="aviso-privacidad.html">Aviso de privacidad</a>.
      </p>
      <div class="yaavs-cookies__options" hidden data-cookie-options>
        <label class="yaavs-cookies__option">
          <input type="checkbox" checked disabled>
          <span>
            <strong>Necesarias</strong>
            <span>Imprescindibles para navegar y seguridad básica.</span>
          </span>
        </label>
        <label class="yaavs-cookies__option">
          <input type="checkbox" data-cookie-pref checked>
          <span>
            <strong>Preferencias</strong>
            <span>Recuerdan ajustes como tema o app instalada.</span>
          </span>
        </label>
        <label class="yaavs-cookies__option">
          <input type="checkbox" data-cookie-analytics>
          <span>
            <strong>Analítica</strong>
            <span>Nos ayudan a entender el uso del sitio de forma agregada.</span>
          </span>
        </label>
      </div>
      <div class="yaavs-cookies__actions">
        <button type="button" class="yaavs-cookies__btn yaavs-cookies__btn--primary" data-cookie-accept>
          Aceptar todas
        </button>
        <button type="button" class="yaavs-cookies__btn yaavs-cookies__btn--ghost" data-cookie-reject>
          Solo necesarias
        </button>
        <button type="button" class="yaavs-cookies__btn yaavs-cookies__btn--link" data-cookie-configure>
          Configurar
        </button>
        <button type="button" class="yaavs-cookies__btn yaavs-cookies__btn--primary" data-cookie-save hidden>
          Guardar elección
        </button>
      </div>
    `;
    return root;
  }

  function buildManageButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "yaavs-cookies__manage";
    btn.hidden = true;
    btn.textContent = "Cookies";
    btn.setAttribute("aria-label", "Administrar cookies");
    return btn;
  }

  function mount() {
    if (document.getElementById("yaavs-cookies")) return;
    ensureCss();

    const banner = buildBanner();
    const manage = buildManageButton();
    document.body.appendChild(banner);
    document.body.appendChild(manage);

    const options = banner.querySelector("[data-cookie-options]");
    const prefInput = banner.querySelector("[data-cookie-pref]");
    const analyticsInput = banner.querySelector("[data-cookie-analytics]");
    const acceptBtn = banner.querySelector("[data-cookie-accept]");
    const rejectBtn = banner.querySelector("[data-cookie-reject]");
    const configureBtn = banner.querySelector("[data-cookie-configure]");
    const saveBtn = banner.querySelector("[data-cookie-save]");

    function openBanner(editing) {
      const current = readConsent();
      if (current) {
        prefInput.checked = current.preferences;
        analyticsInput.checked = current.analytics;
      }
      options.hidden = !editing;
      saveBtn.hidden = !editing;
      configureBtn.hidden = editing;
      banner.classList.add("is-open");
      manage.hidden = true;
    }

    function closeBanner() {
      banner.classList.remove("is-open");
      manage.hidden = false;
    }

    function applyAndClose(partial) {
      writeConsent(partial);
      closeBanner();
    }

    acceptBtn.addEventListener("click", () => {
      applyAndClose({ preferences: true, analytics: true });
    });

    rejectBtn.addEventListener("click", () => {
      applyAndClose({ preferences: false, analytics: false });
    });

    configureBtn.addEventListener("click", () => {
      openBanner(true);
    });

    saveBtn.addEventListener("click", () => {
      applyAndClose({
        preferences: prefInput.checked,
        analytics: analyticsInput.checked,
      });
    });

    manage.addEventListener("click", () => openBanner(true));

    const existing = readConsent();
    window.YaavsCookies = {
      consent: existing,
      get: readConsent,
      set: writeConsent,
      open: () => openBanner(true),
      allows(type) {
        const c = readConsent();
        if (!c) return type === "necessary";
        if (type === "necessary") return true;
        return Boolean(c[type]);
      },
    };

    if (!existing) {
      window.setTimeout(() => openBanner(false), 700);
    } else {
      manage.hidden = false;
      document.dispatchEvent(new CustomEvent(EVENT, { detail: existing }));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
