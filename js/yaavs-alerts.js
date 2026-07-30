/**
 * Centro de notificaciones YAAVS — in-app + Notification API local.
 * Push remoto: OneSignal (ver js/yaavs-onesignal.config.js).
 */
(function () {
  const FEED_URL = "data/yaavs-alerts.json?v=1";
  const SEEN_KEY = "yaavs-alerts-seen";
  const PERM_KEY = "yaavs-alerts-perm";
  const PREFS_KEY = "yaavs-alerts-prefs";
  const NOTIFIED_KEY = "yaavs-alerts-notified";

  const TYPE_META = {
    promo: { label: "Oferta", short: "Promo", iconClass: "yaavs-alerts-item__icon--promo" },
    blog: { label: "Noticia", short: "Blog", iconClass: "yaavs-alerts-item__icon--blog" },
    vacante: { label: "Vacante", short: "Job", iconClass: "yaavs-alerts-item__icon--vacante" },
  };

  let items = [];
  let panelOpen = false;

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
      /* noop */
    }
  }

  function getSeen() {
    const seen = readJson(SEEN_KEY, []);
    return new Set(Array.isArray(seen) ? seen : []);
  }

  function setSeen(ids) {
    writeJson(SEEN_KEY, [...ids]);
  }

  function getPrefs() {
    const defaults = { promo: true, blog: true, vacante: true };
    const stored = readJson(PREFS_KEY, null);
    return stored && typeof stored === "object" ? { ...defaults, ...stored } : defaults;
  }

  function setPrefs(prefs) {
    writeJson(PREFS_KEY, prefs);
    syncOneSignalTags(prefs);
  }

  function getNotified() {
    const n = readJson(NOTIFIED_KEY, []);
    return new Set(Array.isArray(n) ? n : []);
  }

  function setNotified(ids) {
    writeJson(NOTIFIED_KEY, [...ids]);
  }

  function unreadItems() {
    const seen = getSeen();
    const prefs = getPrefs();
    return items.filter((item) => prefs[item.type] !== false && !seen.has(item.id));
  }

  function ensureCss() {
    if (document.querySelector('link[data-yaavs-alerts-css]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "yaavs-alerts.css?v=1";
    link.dataset.yaavsAlertsCss = "true";
    document.head.appendChild(link);
  }

  function formatDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    try {
      return new Date(y, m - 1, d).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (_) {
      return iso;
    }
  }

  function mountUi() {
    const menu = document.querySelector(".site-header .header-menu");
    if (!menu || menu.querySelector("[data-yaavs-alerts-bell]")) return;

    const wrap = document.createElement("div");
    wrap.className = "yaavs-alerts-wrap";
    wrap.style.position = "relative";
    wrap.innerHTML = `
      <button type="button" class="yaavs-alerts-bell" data-yaavs-alerts-bell aria-expanded="false" aria-controls="yaavs-alerts-panel" aria-label="Notificaciones YAAVS">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 22a2.2 2.2 0 0 0 2.1-1.6H9.9A2.2 2.2 0 0 0 12 22Zm7-4.5V11a7 7 0 1 0-14 0v6.5L3 19v1h18v-1l-2-1.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
        </svg>
        <span class="yaavs-alerts-bell__badge" data-yaavs-alerts-badge>0</span>
      </button>
      <div class="yaavs-alerts-panel" id="yaavs-alerts-panel" role="dialog" aria-label="Centro de notificaciones" hidden>
        <div class="yaavs-alerts-panel__head">
          <h2>Notificaciones</h2>
          <div class="yaavs-alerts-panel__actions">
            <button type="button" class="yaavs-alerts-panel__btn" data-yaavs-alerts-readall>Marcar leídas</button>
            <button type="button" class="yaavs-alerts-panel__btn" data-yaavs-alerts-close aria-label="Cerrar">Cerrar</button>
          </div>
        </div>
        <div class="yaavs-alerts-panel__prefs">
          <p>Qué quiero recibir</p>
          <div class="yaavs-alerts-panel__prefs-row">
            <label><input type="checkbox" data-pref="promo"> Ofertas</label>
            <label><input type="checkbox" data-pref="blog"> Noticias</label>
            <label><input type="checkbox" data-pref="vacante"> Vacantes</label>
          </div>
        </div>
        <ul class="yaavs-alerts-panel__list" data-yaavs-alerts-list></ul>
      </div>
    `;

    const wa = menu.querySelector(".header-wa");
    if (wa) menu.insertBefore(wrap, wa);
    else menu.insertBefore(wrap, menu.firstChild);

    const bell = wrap.querySelector("[data-yaavs-alerts-bell]");
    const panel = wrap.querySelector("#yaavs-alerts-panel");

    bell.addEventListener("click", (event) => {
      event.stopPropagation();
      togglePanel(!panelOpen);
    });

    wrap.querySelector("[data-yaavs-alerts-close]")?.addEventListener("click", () => togglePanel(false));
    wrap.querySelector("[data-yaavs-alerts-readall]")?.addEventListener("click", () => {
      markAllRead();
      renderList();
      updateBadge();
    });

    const prefs = getPrefs();
    wrap.querySelectorAll("[data-pref]").forEach((input) => {
      const key = input.getAttribute("data-pref");
      input.checked = prefs[key] !== false;
      input.addEventListener("change", () => {
        const next = getPrefs();
        next[key] = input.checked;
        setPrefs(next);
        renderList();
        updateBadge();
        updateJobsBanner();
      });
    });

    document.addEventListener("click", (event) => {
      if (!panelOpen) return;
      if (wrap.contains(event.target)) return;
      togglePanel(false);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && panelOpen) togglePanel(false);
    });

    window.YaavsAlerts = window.YaavsAlerts || {};
    window.YaavsAlerts.open = () => togglePanel(true);
    window.YaavsAlerts.close = () => togglePanel(false);
  }

  function togglePanel(open) {
    const panel = document.getElementById("yaavs-alerts-panel");
    const bell = document.querySelector("[data-yaavs-alerts-bell]");
    if (!panel || !bell) return;
    panelOpen = open;
    panel.hidden = !open;
    panel.classList.toggle("is-open", open);
    bell.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      renderList();
      maybeAskPermission();
    }
  }

  function renderList() {
    const list = document.querySelector("[data-yaavs-alerts-list]");
    if (!list) return;
    const seen = getSeen();
    const prefs = getPrefs();
    const visible = items.filter((item) => prefs[item.type] !== false);

    if (!visible.length) {
      list.innerHTML = `<li><p class="yaavs-alerts-panel__empty">No hay avisos por ahora.</p></li>`;
      return;
    }

    list.innerHTML = visible
      .map((item) => {
        const meta = TYPE_META[item.type] || TYPE_META.blog;
        const unread = !seen.has(item.id);
        return `
          <li>
            <a class="yaavs-alerts-item${unread ? " is-unread" : ""}" href="${escapeAttr(item.url || "#")}" data-alert-id="${escapeAttr(item.id)}">
              <span class="yaavs-alerts-item__icon ${meta.iconClass}" aria-hidden="true">${meta.short}</span>
              <span class="yaavs-alerts-item__body">
                <strong>${escapeHtml(item.title)}</strong>
                <span>${escapeHtml(item.body || "")}</span>
                <span class="yaavs-alerts-item__meta">${escapeHtml(meta.label)} · ${escapeHtml(formatDate(item.createdAt))}</span>
              </span>
            </a>
          </li>
        `;
      })
      .join("");

    list.querySelectorAll("[data-alert-id]").forEach((link) => {
      link.addEventListener("click", () => {
        const id = link.getAttribute("data-alert-id");
        if (!id) return;
        const seenSet = getSeen();
        seenSet.add(id);
        setSeen(seenSet);
        updateBadge();
        updateJobsBanner();
      });
    });
  }

  function updateBadge() {
    const badge = document.querySelector("[data-yaavs-alerts-badge]");
    if (!badge) return;
    const count = unreadItems().length;
    badge.textContent = count > 9 ? "9+" : String(count);
    badge.classList.toggle("is-on", count > 0);
    badge.hidden = count === 0;
  }

  function markAllRead() {
    const seen = getSeen();
    items.forEach((item) => seen.add(item.id));
    setSeen(seen);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, "&#39;");
  }

  function maybeAskPermission() {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    try {
      if (localStorage.getItem(PERM_KEY) === "1") return;
    } catch (_) {
      return;
    }
    showPermPrompt();
  }

  function showPermPrompt() {
    if (document.querySelector("[data-yaavs-alerts-perm]")) return;
    const card = document.createElement("div");
    card.className = "yaavs-alerts-perm";
    card.dataset.yaavsAlertsPerm = "true";
    card.innerHTML = `
      <div class="yaavs-alerts-perm__copy">
        <strong>Activa avisos YAAVS</strong>
        <span>Recibe ofertas, Noticias Yaavs y vacantes nuevas en tu teléfono.</span>
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
        await Notification.requestPermission();
      } catch (_) {}
      if (window.OneSignalDeferred) {
        window.OneSignalDeferred.push(async (OneSignal) => {
          try {
            await OneSignal.Notifications.requestPermission();
          } catch (_) {}
        });
      }
      card.remove();
      void showLocalNotificationsForNew();
    });
  }

  async function showLocalNotificationsForNew() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const prefs = getPrefs();
    const notified = getNotified();
    const fresh = items.filter(
      (item) => prefs[item.type] !== false && !notified.has(item.id)
    );
    if (!fresh.length) return;

    const reg = await navigator.serviceWorker?.ready.catch(() => null);
    const toShow = fresh.slice(0, 3);

    for (const item of toShow) {
      const opts = {
        body: item.body || "",
        icon: "assets/pwa/icon-192.png",
        badge: "assets/pwa/icon-192.png",
        tag: `yaavs-${item.id}`,
        data: { url: item.url || "index.html", id: item.id },
        renotify: true,
      };
      try {
        if (reg?.showNotification) {
          await reg.showNotification(item.title, opts);
        } else {
          new Notification(item.title, opts);
        }
        notified.add(item.id);
      } catch (_) {
        /* noop */
      }
    }
    setNotified(notified);
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

  function updateJobsBanner() {
    if (!document.body.classList.contains("page-bolsa-trabajo")) return;
    let banner = document.querySelector("[data-yaavs-jobs-alert]");
    const unreadJobs = unreadItems().filter((item) => item.type === "vacante");

    if (!unreadJobs.length) {
      banner?.classList.remove("is-on");
      return;
    }

    if (!banner) {
      const host =
        document.querySelector(".jobs-catalog-section__inner") ||
        document.querySelector("#catalogo-vacantes .container") ||
        document.querySelector("#catalogo-vacantes");
      if (!host) return;
      banner = document.createElement("aside");
      banner.className = "yaavs-jobs-alert";
      banner.dataset.yaavsJobsAlert = "true";
      banner.setAttribute("role", "status");
      banner.innerHTML = `
        <span class="yaavs-jobs-alert__icon" aria-hidden="true">Job</span>
        <div class="yaavs-jobs-alert__copy">
          <strong>Hay vacantes nuevas</strong>
          <span>Ve tus notificaciones para cada cambio de vacante y postula desde aquí.</span>
        </div>
        <button type="button" class="yaavs-jobs-alert__open" data-yaavs-jobs-open>Ver notificaciones</button>
      `;
      const head = host.querySelector(".jobs-section-head");
      if (head) head.insertAdjacentElement("afterend", banner);
      else host.prepend(banner);
      banner.querySelector("[data-yaavs-jobs-open]")?.addEventListener("click", () => {
        window.YaavsAlerts?.open?.();
      });
    }

    const count = unreadJobs.length;
    const copy = banner.querySelector(".yaavs-jobs-alert__copy span");
    if (copy) {
      copy.textContent =
        count === 1
          ? "Hay 1 vacante nueva en tus notificaciones. Revísala y postula."
          : `Hay ${count} vacantes nuevas en tus notificaciones. Revísalas y postula.`;
    }
    banner.classList.add("is-on");
  }

  async function loadFeed() {
    try {
      const res = await fetch(FEED_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error("feed");
      const data = await res.json();
      items = Array.isArray(data.items) ? data.items.slice() : [];
      items.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    } catch (_) {
      items = [];
    }
  }

  async function init() {
    ensureCss();
    mountUi();
    await loadFeed();
    renderList();
    updateBadge();
    updateJobsBanner();
    syncOneSignalTags(getPrefs());

    const unread = unreadItems();
    if (unread.length && "Notification" in window) {
      if (Notification.permission === "granted") {
        void showLocalNotificationsForNew();
      } else if (Notification.permission === "default") {
        try {
          if (localStorage.getItem(PERM_KEY) !== "1") {
            window.setTimeout(showPermPrompt, 2200);
          }
        } catch (_) {}
      }
    }

    if (window.location.hash === "#promo" || window.location.hash === "#notificaciones") {
      window.setTimeout(() => window.YaavsAlerts?.open?.(), 600);
    }
  }

  if (document.querySelector(".site-header .header-menu")) {
    void init();
  } else {
    document.addEventListener("yaavs:layout-ready", () => void init(), { once: true });
  }
})();
