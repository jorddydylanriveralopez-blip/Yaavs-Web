(function () {
  const INSTALL_DISMISS_KEY = "yaavs_pwa_install_dismissed_v1";

  function injectHeadTags() {
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifest = document.createElement("link");
      manifest.rel = "manifest";
      manifest.href = "manifest.webmanifest?v=2";
      document.head.appendChild(manifest);
    }

    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const apple = document.createElement("link");
      apple.rel = "apple-touch-icon";
      apple.href = "assets/pwa/icon-180.png";
      document.head.appendChild(apple);
    }

    const metas = [
      ["mobile-web-app-capable", "yes"],
      ["apple-mobile-web-app-capable", "yes"],
      ["apple-mobile-web-app-title", "YAAVS"],
      ["application-name", "YAAVS"],
    ];

    metas.forEach(([name, content]) => {
      if (document.querySelector(`meta[name="${name}"]`)) return;
      const meta = document.createElement("meta");
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    });

    if (!document.querySelector('meta[name="theme-color"]')) {
      const theme = document.createElement("meta");
      theme.name = "theme-color";
      theme.content = "#2563b5";
      document.head.appendChild(theme);
    }
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {});
    });
  }

  function ensureInstallCss() {
    if (document.querySelector("style[data-yaavs-pwa-css]")) return;
    const style = document.createElement("style");
    style.dataset.yaavsPwaCss = "true";
    style.textContent = `
      .yaavs-pwa-install {
        position: fixed;
        right: max(12px, env(safe-area-inset-right, 0px));
        bottom: max(70px, calc(env(safe-area-inset-bottom, 0px) + 70px));
        z-index: 11800;
        display: none;
        align-items: center;
        gap: 10px;
        max-width: min(320px, calc(100vw - 24px));
        padding: 12px 12px 12px 14px;
        border-radius: 16px;
        border: 1px solid rgba(0, 151, 178, 0.28);
        background: rgba(255, 255, 255, 0.96);
        box-shadow: 0 16px 40px rgba(4, 16, 31, 0.22);
        color: #0f2440;
      }
      .yaavs-pwa-install.is-open { display: flex; }
      .yaavs-pwa-install__copy { flex: 1; min-width: 0; }
      .yaavs-pwa-install__copy strong {
        display: block;
        font-size: 0.9rem;
        font-weight: 800;
        color: #003087;
        margin-bottom: 2px;
      }
      .yaavs-pwa-install__copy span {
        display: block;
        font-size: 0.78rem;
        line-height: 1.35;
        color: #4a6278;
      }
      .yaavs-pwa-install__actions { display: flex; gap: 6px; flex-shrink: 0; }
      .yaavs-pwa-install__btn {
        appearance: none;
        border: 0;
        min-height: 36px;
        padding: 0 12px;
        border-radius: 999px;
        font: inherit;
        font-size: 0.78rem;
        font-weight: 800;
        cursor: pointer;
      }
      .yaavs-pwa-install__btn--go {
        background: linear-gradient(135deg, #003087, #0097b2);
        color: #fff;
      }
      .yaavs-pwa-install__btn--later {
        background: transparent;
        color: #007a96;
      }
      @media (max-width: 720px) {
        .yaavs-pwa-install {
          left: max(12px, env(safe-area-inset-left, 0px));
          right: max(12px, env(safe-area-inset-right, 0px));
          bottom: max(78px, calc(env(safe-area-inset-bottom, 0px) + 78px));
        }
      }
    `;
    document.head.appendChild(style);
  }

  function setupInstallPrompt() {
    let deferred = null;
    let card = null;

    function dismissed() {
      try {
        return localStorage.getItem(INSTALL_DISMISS_KEY) === "1";
      } catch (_) {
        return false;
      }
    }

    function markDismissed() {
      try {
        localStorage.setItem(INSTALL_DISMISS_KEY, "1");
      } catch (_) {}
    }

    function showCard() {
      if (!card || dismissed()) return;
      if (window.matchMedia("(display-mode: standalone)").matches) return;
      card.classList.add("is-open");
    }

    function hideCard() {
      card?.classList.remove("is-open");
    }

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferred = event;
      ensureInstallCss();
      if (!card) {
        card = document.createElement("div");
        card.className = "yaavs-pwa-install";
        card.innerHTML = `
          <div class="yaavs-pwa-install__copy">
            <strong>Instala YAAVS</strong>
            <span>Ábrela como app en tu celular o computadora.</span>
          </div>
          <div class="yaavs-pwa-install__actions">
            <button type="button" class="yaavs-pwa-install__btn yaavs-pwa-install__btn--go" data-pwa-install>Instalar</button>
            <button type="button" class="yaavs-pwa-install__btn yaavs-pwa-install__btn--later" data-pwa-later>Ahora no</button>
          </div>
        `;
        document.body.appendChild(card);
        card.querySelector("[data-pwa-install]")?.addEventListener("click", async () => {
          if (!deferred) return;
          deferred.prompt();
          try {
            await deferred.userChoice;
          } catch (_) {}
          deferred = null;
          hideCard();
        });
        card.querySelector("[data-pwa-later]")?.addEventListener("click", () => {
          markDismissed();
          hideCard();
        });
      }
      window.setTimeout(showCard, 1800);
    });

    window.addEventListener("appinstalled", () => {
      deferred = null;
      hideCard();
      markDismissed();
    });
  }

  function loadScript(src, attrs) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.defer = true;
      if (attrs) Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(src));
      document.head.appendChild(s);
    });
  }

  function initOneSignal() {
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    const boot = async () => {
      const cfg = window.YAAVS_ONESIGNAL || {};
      if (!cfg.appId) return;

      await loadScript("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js");

      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          await OneSignal.init({
            appId: cfg.appId,
            safari_web_id: cfg.safariWebId || undefined,
            serviceWorkerPath: "sw.js",
            serviceWorkerParam: { scope: "./" },
            allowLocalhostAsSecureOrigin: !!cfg.allowLocalhostAsSecureOrigin,
            notifyButton: { enable: false },
          });
        } catch (_) {
          /* noop */
        }
      });
    };

    loadScript("js/yaavs-onesignal.config.js?v=2")
      .then(boot)
      .catch(() => {});
  }

  injectHeadTags();
  registerServiceWorker();
  setupInstallPrompt();
  initOneSignal();
})();
