/**
 * YaavBot — abrir · minimizar · cerrar + IA vía /api/chat.
 */
(function () {
  const cfg = window.YAAVS_CHATBOT || {};
  const root = document.querySelector("[data-yaavbot]");
  if (!root) return;

  const panel = root.querySelector("[data-yaavbot-panel]");
  const fab = root.querySelector("[data-yaavbot-fab]");
  const fabLabel = root.querySelector("[data-yaavbot-fab-label]");
  const fabIconOpen = root.querySelector(".yaavbot__fab-icon-open");
  const fabIconMin = root.querySelector(".yaavbot__fab-icon-min");
  const head = root.querySelector("[data-yaavbot-head]");
  const closeBtn = root.querySelector("[data-yaavbot-close]");
  const minimizeBtn = root.querySelector("[data-yaavbot-minimize]");
  const messagesEl = root.querySelector("[data-yaavbot-messages]");
  const form = root.querySelector("[data-yaavbot-form]");
  const input = root.querySelector("[data-yaavbot-input]");
  const quickEl = root.querySelector("[data-yaavbot-quick]");
  const statusEl = root.querySelector("[data-yaavbot-status]");

  if (!panel || !fab || !messagesEl || !form || !input) return;

  const history = [];
  let busy = false;
  let state = "closed";

  const PAGE_LABELS = {
    "index.html": "Ir al inicio",
    "quienes-somos.html": "¿Quiénes somos?",
    "servicios.html": "Ver servicios",
    "prepago.html": "Ver prepago",
    "postpago.html": "Ver pospago (sitio aparte)",
    "activar-chip.html": "Activar chip",
    "recargar.html": "Recargar tiempo aire",
    "ser-yaavser.html": "Ser socio comercial",
    "tiendas.html": "Ver tiendas",
    "tiendas-mapa.html": "Abrir mapa de tiendas",
    "bolsa-trabajo.html": "Ver vacantes",
    "contacto.html": "Ir a contacto",
    "avisos.html": "Ver avisos",
    "avisos-privacidad.html": "Aviso de privacidad",
    "aviso-de-privacidad.html": "Aviso de privacidad",
    "terminos-condiciones.html": "Términos y condiciones",
    "testimonios.html": "Ver testimonios",
  };

  const SAFE_PAGES = new Set(Object.keys(PAGE_LABELS));

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalizeHref(raw) {
    const href = String(raw || "").trim();
    if (!href) return "";
    if (/^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return href;
    }
    const path = href.replace(/^\.\//, "").split(/[?#]/)[0];
    if (SAFE_PAGES.has(path)) return path;
    if (/^[a-z0-9][\w./-]*\.html$/i.test(path) && !path.includes("..")) return path;
    if (href.startsWith("#")) return href;
    return "";
  }

  function collectPageActions(text) {
    const found = [];
    const seen = new Set();
    const re = /(?:\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s)<]+)|((?:[\w./-]+\.html)(?:#[\w-]*)?))/gi;
    let match;
    while ((match = re.exec(text))) {
      const mdLabel = match[1];
      const raw = match[2] || match[3] || match[4] || "";
      const href = normalizeHref(raw);
      if (!href || seen.has(href)) continue;
      if (!SAFE_PAGES.has(href.split("#")[0]) && !/^https?:\/\//i.test(href)) continue;
      seen.add(href);
      const page = href.split("#")[0];
      const label =
        (mdLabel && mdLabel.trim()) ||
        PAGE_LABELS[page] ||
        (/^https?:\/\/wa\.me\//i.test(href) ? "Abrir WhatsApp" : "Abrir enlace");
      found.push({ href, label });
    }
    return found.slice(0, 4);
  }

  function formatText(text) {
    let safe = escapeHtml(text);

    // Markdown links [label](url)
    safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
      const href = normalizeHref(url);
      if (!href) return escapeHtml(label);
      const external = /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
      const attrs = external
        ? ` target="_blank" rel="noopener noreferrer"`
        : "";
      return `<a class="yaavbot__link" href="${escapeHtml(href)}"${attrs}>${escapeHtml(label)}</a>`;
    });

    // Bare URLs
    safe = safe.replace(/(^|[\s>])(https?:\/\/[^\s<]+)/g, (_, lead, url) => {
      const clean = url.replace(/[.,;:!?)]+$/, "");
      const trail = url.slice(clean.length);
      return `${lead}<a class="yaavbot__link" href="${escapeHtml(clean)}" target="_blank" rel="noopener noreferrer">${escapeHtml(clean)}</a>${trail}`;
    });

    // Bare site pages like ser-yaavser.html
    safe = safe.replace(/(^|[\s>(])((?:[\w./-]+\.html)(?:#[\w-]*)?)/gi, (_, lead, page) => {
      const href = normalizeHref(page);
      if (!href || !SAFE_PAGES.has(href.split("#")[0])) return `${lead}${page}`;
      const label = PAGE_LABELS[href.split("#")[0]] || page;
      return `${lead}<a class="yaavbot__link" href="${escapeHtml(href)}" title="${escapeHtml(label)}">${escapeHtml(page)}</a>`;
    });

    safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/\n/g, "<br>");
    return safe;
  }

  function appendMessage(role, text) {
    const item = document.createElement("div");
    item.className = `yaavbot__msg yaavbot__msg--${role}`;

    const bubble = document.createElement("div");
    bubble.className = "yaavbot__bubble";
    bubble.innerHTML = formatText(text);
    item.appendChild(bubble);

    if (role === "bot") {
      const actions = collectPageActions(text);
      if (actions.length) {
        const row = document.createElement("div");
        row.className = "yaavbot__actions";
        actions.forEach(({ href, label }) => {
          const btn = document.createElement("a");
          btn.className = "yaavbot__action";
          btn.href = href;
          btn.textContent = label;
          if (/^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) {
            btn.target = "_blank";
            btn.rel = "noopener noreferrer";
          }
          row.appendChild(btn);
        });
        item.appendChild(row);
      }
    }

    messagesEl.appendChild(item);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text || cfg.subtitle || "Tu guía en YAAVS";
  }

  function syncFabUi() {
    const isOpen = state === "open";
    const isMin = state === "minimized";

    fab.setAttribute("aria-expanded", isOpen ? "true" : "false");
    fab.setAttribute("aria-label", isOpen ? "Minimizar Yaavsti" : "Abrir Yaavsti");

    if (fabLabel) {
      fabLabel.textContent = isMin ? "Yaavsti · Minimizado" : "Yaavsti";
    }

    if (fabIconOpen) fabIconOpen.hidden = isOpen;
    if (fabIconMin) fabIconMin.hidden = !isOpen;
  }

  function setState(next) {
    state = next;
    root.classList.remove("is-open", "is-minimized", "is-closed");
    root.dataset.state = state;
    document.body.classList.remove("yaavbot-open");

    if (state === "open") {
      root.classList.add("is-open");
      panel.hidden = false;
      panel.removeAttribute("aria-hidden");
      document.body.classList.add("yaavbot-open");
      window.setTimeout(() => input.focus(), 120);
    } else if (state === "minimized") {
      root.classList.add("is-minimized");
      panel.hidden = false;
      panel.removeAttribute("aria-hidden");
    } else {
      root.classList.add("is-closed");
      panel.hidden = true;
      panel.setAttribute("aria-hidden", "true");
    }

    syncFabUi();
  }

  function localReply(text) {
    const q = text.toLowerCase();

    if (/perd|no encuentro|dónde|donde|orient|mapa del sitio|ayuda|naveg/.test(q)) {
      return "Tranqui, te oriento 🧭 ¿Qué buscas?\n· Socio comercial → [Ser socio](ser-yaavser.html)\n· Recargar → [Recargar tiempo aire](recargar.html)\n· Servicios / chip → [Servicios](servicios.html) o [Activar chip](activar-chip.html)\n· Tiendas → [Tiendas](tiendas.html) / [Mapa](tiendas-mapa.html)\n· Vacantes → [Bolsa de trabajo](bolsa-trabajo.html)\n· Quiénes somos → [Quiénes somos](quienes-somos.html)\nDime cuál y te detallo el siguiente paso.";
    }
    if (/vacante|empleo|bolsa|trabajo|rrhh|postul/.test(q)) {
      return "Las vacantes abiertas están aquí: [Ver vacantes](bolsa-trabajo.html). Toca una vacante abierta para ver requisitos y mandar CV por WhatsApp.";
    }
    if (/tienda|mapa|ubicaci[oó]n|cerca/.test(q)) {
      return "Para ubicar puntos YAAVS entra a [Tiendas](tiendas.html) o al [mapa de tiendas](tiendas-mapa.html). Si me dices ciudad o colonia, te indico por dónde empezar.";
    }
    if (/yaavser|afili|socio|punto de venta/.test(q)) {
      return "Si quieres sumarte como socio comercial (Yaavser), ve directo aquí: [Ser socio comercial](ser-yaavser.html). ¿Te paso también el [WhatsApp](https://wa.me/525522331210) para agendar?";
    }
    if (/recargaklic|recarga|tiempo.?aire/.test(q)) {
      return "Para recargar tiempo aire en el sitio: [Recargar ahora](recargar.html). Si es para tu negocio / RecargaKlic, dime y te oriento.";
    }
    if (/activar|chip|sim/.test(q)) {
      return "Para activar un chip / SIM: [Activar chip](activar-chip.html). YAAVS es líder distribuidor de SIMs en México (multi-operador).";
    }
    if (/telcel|movistar|at&t|unefon|bait|operador|compañ/.test(q)) {
      return "Trabajamos multi-operador (Telcel, AT&T, Movistar, Unefon, BAIT y más). Mira el panorama en [Servicios](servicios.html), o ve a [Prepago](prepago.html) / [Pospago](https://pospago-yaavs-site.hostingersite.com/).";
    }
    if (/portabilidad|porta/.test(q)) {
      return "Sí hacemos portabilidad. Revisa [Servicios](servicios.html) o [Pospago](https://pospago-yaavs-site.hostingersite.com/), o escríbenos por [WhatsApp](https://wa.me/525522331210).";
    }
    if (/qui[eé]nes|somos|empresa|historia/.test(q)) {
      return "Somos líder distribuidor de SIMs en México, con conectividad a +16,000 negocios. Conócenos aquí: [Quiénes somos](quienes-somos.html).";
    }
    if (/contact|whatsapp|tel[eé]fono|correo|mail|llamar/.test(q)) {
      return "Con gusto 📲\n· Tel. **55 22 33 12 10**\n· **Hola@yaavs.com.mx**\n· [WhatsApp](https://wa.me/525522331210)\n· Formulario: [Contacto](contacto.html)";
    }
    if (/hola|buenas|hey|qu[eé] tal|buenos d[ií]as|buenas tardes/.test(q)) {
      return "¡Hola! Qué gusto. Soy **Yaavsti**, de YAAVS. ¿Vienes por socio comercial, recargas, tiendas, vacantes… o solo estás explorando?\nPuedes empezar en [Ser socio](ser-yaavser.html), [Recargar](recargar.html) o [Vacantes](bolsa-trabajo.html).";
    }

    return "Gracias por escribir. ¿Buscas socio comercial, recarga, servicios/chip, tiendas, vacantes o contacto?\nAtajos: [Ser socio](ser-yaavser.html) · [Recargar](recargar.html) · [Tiendas](tiendas.html) · [Vacantes](bolsa-trabajo.html) · [Contacto](contacto.html)";
  }

  async function askAI(text) {
    history.push({ role: "user", content: text });

    try {
      const res = await fetch(cfg.apiUrl || "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.reply) {
        history.push({ role: "assistant", content: data.reply });
        return data.reply;
      }
    } catch {
      /* fallback local */
    }

    const fallback = localReply(text);
    history.push({ role: "assistant", content: fallback });
    return fallback;
  }

  async function submitMessage(text) {
    const msg = text.trim();
    if (!msg || busy) return;

    if (state !== "open") setState("open");

    busy = true;
    form.querySelector("button[type=submit]")?.setAttribute("disabled", "true");
    appendMessage("user", msg);
    input.value = "";
    setStatus("Pensando…");

    const typing = document.createElement("div");
    typing.className = "yaavbot__msg yaavbot__msg--bot yaavbot__msg--typing";
    typing.innerHTML = '<div class="yaavbot__bubble"><span class="yaavbot__dots"><i></i><i></i><i></i></span></div>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    const reply = await askAI(msg);
    typing.remove();
    appendMessage("bot", reply);
    setStatus(cfg.subtitle || "Tu guía en YAAVS");
    busy = false;
    form.querySelector("button[type=submit]")?.removeAttribute("disabled");
    if (state === "open") input.focus();
  }

  function buildQuickReplies() {
    if (!quickEl) return;
    (cfg.quickReplies || []).forEach((label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "yaavbot__chip";
      btn.textContent = label;
      btn.addEventListener("click", () => submitMessage(label));
      quickEl.appendChild(btn);
    });
  }

  fab.addEventListener("click", () => {
    if (state === "open") setState("minimized");
    else setState("open");
  });

  function onMinimize(e) {
    e.preventDefault();
    e.stopPropagation();
    setState("minimized");
  }

  function onClose(e) {
    e.preventDefault();
    e.stopPropagation();
    setState("closed");
  }

  minimizeBtn?.addEventListener("click", onMinimize);
  closeBtn?.addEventListener("click", onClose);

  head?.addEventListener("click", (e) => {
    if (e.target.closest("[data-yaavbot-close], [data-yaavbot-minimize], .yaavbot__head-actions")) {
      return;
    }
    if (state === "minimized") setState("open");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (state === "open") setState("closed");
    else if (state === "minimized") setState("closed");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submitMessage(input.value);
  });

  appendMessage("bot", cfg.welcome || "Hola, ¿en qué te ayudo?");
  buildQuickReplies();
  setState("closed");
})();
