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
    if (statusEl) statusEl.textContent = text || "Asistente YAAVS · IA";
  }

  function syncFabUi() {
    const isOpen = state === "open";
    const isMin = state === "minimized";

    fab.setAttribute("aria-expanded", isOpen ? "true" : "false");
    fab.setAttribute("aria-label", isOpen ? "Minimizar YaavBot" : "Abrir YaavBot");

    if (fabLabel) {
      fabLabel.textContent = isMin ? "YaavBot · Minimizado" : "YaavBot";
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

    if (/yaavser|afili|tienda|punto de venta/.test(q)) {
      return "El programa **Yaavser** es la afiliación a la red YAAVS: visita comercial, rotulación, producto y respaldo en tu local. Más de 10,000 tiendas en México ya forman parte. Conoce el proceso en **ser-yaavser.html** o escríbenos por WhatsApp.";
    }
    if (/recargaklic|recarga|activar|chip|sim/.test(q)) {
      return "**RecargaKlic** es la app para activar SIMs, hacer recargas y controlar ventas desde tu celular. Si quieres empezar, entra a **activar-chip.html** o pide apoyo a un ejecutivo en tu zona.";
    }
    if (/telcel|movistar|at&t|unefon|operador|compañ/.test(q)) {
      return "YAAVS es **multi-operador**: puedes vender Telcel, AT&T, Movistar, Unefon y más desde un solo distribuidor. Revisa todos los servicios en **servicios.html**.";
    }
    if (/portabilidad|porta/.test(q)) {
      return "Hacemos **portabilidad** para que tus clientes cambien de compañía conservando su número, con respaldo de ejecutivo en tu zona. Detalle en la sección Servicios del sitio.";
    }
    if (/contact|whatsapp|tel[eé]fono|correo|mail|llamar/.test(q)) {
      return "Contáctanos:\n· Tel. **55 22 33 12 10**\n· **Hola@yaavs.com.mx**\n· WhatsApp: **https://wa.me/525522331210**\nTambién puedes usar el formulario en **contacto.html**.";
    }
    if (/hola|buenas|hey|qué tal/.test(q)) {
      return "¡Hola! Soy YaavBot de YAAVS. ¿Te interesa ser **Yaavser**, usar **RecargaKlic** o conocer nuestros servicios de telecom?";
    }

    return "Gracias por escribir. Para una respuesta más precisa, cuéntame si buscas **Yaavser**, **RecargaKlic**, **servicios** o **contacto**. También puedes escribirnos al **55 22 33 12 10** o por WhatsApp.";
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
