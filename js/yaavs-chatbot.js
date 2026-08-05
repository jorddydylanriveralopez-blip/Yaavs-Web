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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatText(text) {
    let safe = escapeHtml(text);
    safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/\n/g, "<br>");
    return safe;
  }

  function appendMessage(role, text) {
    const item = document.createElement("div");
    item.className = `yaavbot__msg yaavbot__msg--${role}`;
    item.innerHTML = `<div class="yaavbot__bubble">${formatText(text)}</div>`;
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
    fab.setAttribute("aria-label", isOpen ? "Minimizar Vaavsti" : "Abrir Vaavsti");

    if (fabLabel) {
      fabLabel.textContent = isMin ? "Vaavsti · Minimizado" : "Vaavsti";
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
      return "Tranqui, te oriento 🧭 ¿Qué buscas?\n· **Socio comercial** → **ser-yaavser.html**\n· **Recargar** → **recargar.html**\n· **Servicios / chip** → **servicios.html** o **activar-chip.html**\n· **Tiendas** → **tiendas.html** / **tiendas-mapa.html**\n· **Vacantes** → **bolsa-trabajo.html**\n· **Quiénes somos** → **quienes-somos.html**\nDime cuál y te detallo el siguiente paso.";
    }
    if (/vacante|empleo|bolsa|trabajo|rrhh|postul/.test(q)) {
      return "Las vacantes abiertas están en **bolsa-trabajo.html**: toca una vacante abierta para ver requisitos y mandar CV por WhatsApp. Si no ves la que buscas, déjanos tu postulación en esa misma página.";
    }
    if (/tienda|mapa|ubicaci[oó]n|cerca/.test(q)) {
      return "Para ubicar puntos YAAVS: **tiendas.html** o el mapa en **tiendas-mapa.html**. Si me dices ciudad o colonia, te indico por dónde empezar.";
    }
    if (/yaavser|afili|socio|punto de venta/.test(q)) {
      return "Si quieres sumarte como **socio comercial (Yaavser)**, el camino es **ser-yaavser.html**: visita comercial, rotulación y respaldo en tu local. ¿Te paso también el WhatsApp para agendar?";
    }
    if (/recargaklic|recarga|tiempo.?aire/.test(q)) {
      return "Para **recargar tiempo aire** en el sitio entra a **recargar.html**. Si hablas de operación en tienda / **RecargaKlic**, también te puedo orientar: ¿lo necesitas para tu negocio o como cliente final?";
    }
    if (/activar|chip|sim/.test(q)) {
      return "Para **activar un chip / SIM**, ve a **activar-chip.html**. YAAVS es **líder distribuidor de SIMs en México** (multi-operador). Si te trabas en el proceso, escríbeme qué pantalla estás viendo.";
    }
    if (/telcel|movistar|at&t|unefon|bait|operador|compañ/.test(q)) {
      return "Trabajamos **multi-operador** (Telcel, AT&T, Movistar, Unefon, BAIT y más). El panorama de servicios está en **servicios.html**; prepago y postpago tienen su propia página si quieres ir directo.";
    }
    if (/portabilidad|porta/.test(q)) {
      return "Sí hacemos **portabilidad** (el cliente cambia de compañía y se queda con su número). Revisa **servicios.html** o **postpago.html**, y si prefieres hablar con alguien: WhatsApp **https://wa.me/525522331210**.";
    }
    if (/qui[eé]nes|somos|empresa|historia/.test(q)) {
      return "Somos **líder distribuidor de SIMs en México**, con conectividad a +16,000 negocios. La historia y el equipo están en **quienes-somos.html**.";
    }
    if (/contact|whatsapp|tel[eé]fono|correo|mail|llamar/.test(q)) {
      return "Con gusto 📲\n· Tel. **55 22 33 12 10**\n· **Hola@yaavs.com.mx**\n· WhatsApp: **https://wa.me/525522331210**\nTambién puedes usar el formulario en **contacto.html**.";
    }
    if (/hola|buenas|hey|qu[eé] tal|buenos d[ií]as|buenas tardes/.test(q)) {
      return "¡Hola! Qué gusto. Soy **Vaavsti**, de YAAVS. ¿Vienes por **socio comercial**, **recargas**, **tiendas**, **vacantes**… o solo estás explorando y quieres que te arme una ruta rápida?";
    }

    return "Gracias por escribir. Para afinar: ¿buscas **socio comercial**, **recarga**, **servicios/chip**, **tiendas**, **vacantes** o **contacto**? Si estás perdido en la web, dime “estoy perdido” y te guío paso a paso.";
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
    setStatus("Asistente YAAVS · IA");
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
