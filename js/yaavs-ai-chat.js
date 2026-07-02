(function () {
  const root = document.querySelector("[data-ai-chat]");
  if (!root) return;

  const toggle = root.querySelector("[data-ai-chat-toggle]");
  const panel = root.querySelector("[data-ai-chat-panel]");
  const closeBtn = root.querySelector("[data-ai-chat-close]");
  const form = root.querySelector("[data-ai-chat-form]");
  const input = root.querySelector("[data-ai-chat-input]");
  const messages = root.querySelector("[data-ai-chat-messages]");
  const quickButtons = root.querySelectorAll(".ai-chat__quick-btn");

  if (!toggle || !panel || !form || !input || !messages) return;

  function normalize(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function getReply(text) {
    const q = normalize(text);

    if (q.includes("yaavser") || q.includes("distribuidor")) {
      return "Para ser Yaavser entra a 'Ser Yaavser' y deja tus datos. El equipo comercial te contacta para activar tu punto de venta.";
    }
    if (q.includes("chip") || q.includes("sim") || q.includes("activar")) {
      return "Puedes activar chips desde la sección 'Activar chip' y también con apoyo de nuestros asesores para validación y seguimiento.";
    }
    if (q.includes("recarga") || q.includes("tiempo aire") || q.includes("saldo")) {
      return "Manejamos recargas y tiempo aire para múltiples compañías. Si quieres, te explico el flujo rápido para vender más en mostrador.";
    }
    if (q.includes("soporte") || q.includes("ayuda") || q.includes("problema")) {
      return "Te apoyamos por WhatsApp y correo. Usa el botón de WhatsApp flotante para atención más rápida y seguimiento comercial.";
    }
    if (q.includes("hola") || q.includes("buenas")) {
      return "Hola. Soy YAAVS AI, tu asistente de telecom. Dime qué necesitas y te doy una guía rápida.";
    }
    return "Te ayudo con activaciones, recargas, soporte y proceso para ser Yaavser. Cuéntame tu objetivo y te doy el siguiente paso.";
  }

  function appendMessage(role, text) {
    const node = document.createElement("p");
    node.className = "ai-chat__msg ai-chat__msg--" + role;
    node.textContent = text;
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
  }

  function setOpen(open) {
    root.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) input.focus();
  }

  function sendMessage(rawText) {
    const text = rawText.trim();
    if (!text) return;

    appendMessage("user", text);
    window.setTimeout(function () {
      appendMessage("bot", getReply(text));
    }, 340);
  }

  toggle.addEventListener("click", function () {
    setOpen(!root.classList.contains("is-open"));
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      setOpen(false);
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    sendMessage(input.value);
    input.value = "";
  });

  quickButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const question = btn.getAttribute("data-question") || "";
      if (!question) return;
      sendMessage(question);
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
  });
})();
