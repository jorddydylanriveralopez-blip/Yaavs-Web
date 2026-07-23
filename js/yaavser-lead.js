(function () {
  const STATES = [
    "Aguascalientes",
    "Baja California",
    "Baja California Sur",
    "Campeche",
    "Chiapas",
    "Chihuahua",
    "Ciudad de México",
    "Coahuila",
    "Colima",
    "Durango",
    "Estado de México",
    "Guanajuato",
    "Guerrero",
    "Hidalgo",
    "Jalisco",
    "Michoacán",
    "Morelos",
    "Nayarit",
    "Nuevo León",
    "Oaxaca",
    "Puebla",
    "Querétaro",
    "Quintana Roo",
    "San Luis Potosí",
    "Sinaloa",
    "Sonora",
    "Tabasco",
    "Tamaulipas",
    "Tlaxcala",
    "Veracruz",
    "Yucatán",
    "Zacatecas",
  ];

  const cfg = window.YAAVS_YAAVSER_LEAD || {};
  let root = null;
  let form = null;
  let statusEl = null;
  let submitBtn = null;
  let lastFocus = null;

  function stateOptions() {
    return STATES.map(
      (s) => `<option value="${s}">${s}</option>`
    ).join("");
  }

  function ensureModal() {
    if (root) return root;

    root = document.createElement("div");
    root.className = "yaavser-lead";
    root.id = "yaavser-lead";
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = `
      <div class="yaavser-lead__backdrop" data-yaavser-lead-close aria-hidden="true"></div>
      <div class="yaavser-lead__panel" role="dialog" aria-modal="true" aria-labelledby="yaavser-lead-title">
        <span class="yaavser-lead__glow" aria-hidden="true"></span>
        <button type="button" class="yaavser-lead__close" data-yaavser-lead-close aria-label="Cerrar">&times;</button>
        <p class="yaavser-lead__kicker">Socio comercial</p>
        <h2 class="yaavser-lead__title" id="yaavser-lead-title">Conviértete en <span>Yaavser</span></h2>
        <p class="yaavser-lead__lead">Déjanos tus datos y un ejecutivo te contacta para afiliar tu negocio a la red YAAVS.</p>
        <form class="yaavser-lead__form" id="yaavser-lead-form" novalidate>
          <label class="yaavser-lead__field">
            <span>Nombre</span>
            <input type="text" name="nombre" required autocomplete="name" placeholder="Tu nombre completo">
          </label>
          <label class="yaavser-lead__field">
            <span>Nombre del negocio</span>
            <input type="text" name="negocio" required autocomplete="organization" placeholder="Nombre de tu tienda o negocio">
          </label>
          <label class="yaavser-lead__field">
            <span>Estado</span>
            <select name="estado" required>
              <option value="" disabled selected>Selecciona tu estado</option>
              ${stateOptions()}
            </select>
          </label>
          <label class="yaavser-lead__field">
            <span>Correo electrónico</span>
            <input type="email" name="email" required autocomplete="email" placeholder="correo@ejemplo.com">
          </label>
          <label class="yaavser-lead__field">
            <span>Teléfono</span>
            <input type="tel" name="telefono" required autocomplete="tel" inputmode="tel" placeholder="10 dígitos">
          </label>
          <button type="submit" class="yaavser-lead__submit">Enviar solicitud</button>
          <p class="yaavser-lead__status" id="yaavser-lead-status" role="status" aria-live="polite"></p>
        </form>
      </div>
    `;

    document.body.appendChild(root);
    form = root.querySelector("#yaavser-lead-form");
    statusEl = root.querySelector("#yaavser-lead-status");
    submitBtn = root.querySelector(".yaavser-lead__submit");

    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-yaavser-lead-close]")) close();
    });

    form.addEventListener("submit", onSubmit);
    return root;
  }

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.classList.toggle("is-success", kind === "success");
    statusEl.classList.toggle("is-error", kind === "error");
  }

  function open() {
    ensureModal();
    lastFocus = document.activeElement;
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => root.classList.add("is-open"));
    document.documentElement.classList.add("yaavser-lead-open");
    const first = root.querySelector('input[name="nombre"]');
    first?.focus();
  }

  function close() {
    if (!root) return;
    root.classList.remove("is-open");
    document.documentElement.classList.remove("yaavser-lead-open");
    window.setTimeout(() => {
      if (!root.classList.contains("is-open")) {
        root.hidden = true;
        root.setAttribute("aria-hidden", "true");
      }
    }, 280);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function payloadFromForm(fd) {
    return {
      nombre: String(fd.get("nombre") || "").trim(),
      negocio: String(fd.get("negocio") || "").trim(),
      estado: String(fd.get("estado") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      telefono: String(fd.get("telefono") || "").trim(),
    };
  }

  async function sendToSheets(data) {
    const endpoint = String(cfg.endpoint || "").trim();
    if (!endpoint) {
      throw new Error("ENDPOINT_MISSING");
    }

    /* Apps Script no soporta preflight CORS: text/plain + redirect follow. */
    const res = await fetch(endpoint, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });

    /* Tras el redirect de Google a menudo no hay JSON legible; si hay red OK, asumimos éxito. */
    if (!res.ok && res.type !== "opaque") {
      let message = "No se pudo guardar en Sheets";
      try {
        const json = await res.json();
        if (json && json.error) message = json.error;
      } catch (_) {
        /* ignore */
      }
      throw new Error(message);
    }
  }

  function mailtoFallback(data) {
    const body = [
      `Nombre: ${data.nombre}`,
      `Negocio: ${data.negocio}`,
      `Estado: ${data.estado}`,
      `Email: ${data.email}`,
      `Teléfono: ${data.telefono}`,
    ].join("\n");
    window.location.href = `mailto:Hola@yaavs.com.mx?subject=${encodeURIComponent(
      "Solicitud Yaavser - " + data.nombre
    )}&body=${encodeURIComponent(body)}`;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = payloadFromForm(new FormData(form));
    setStatus("Enviando…", null);
    if (submitBtn) submitBtn.disabled = true;

    try {
      await sendToSheets(data);
      setStatus("¡Listo! Recibimos tu solicitud. Pronto te contactamos.", "success");
      form.reset();
      window.setTimeout(close, 1600);
    } catch (err) {
      if (err && err.message === "ENDPOINT_MISSING") {
        mailtoFallback(data);
        setStatus(
          "Se abrió tu correo. Para guardar directo en Sheets, configura el endpoint de Apps Script.",
          "error"
        );
      } else {
        setStatus(
          "No pudimos enviar ahora. Intenta de nuevo o escríbenos a Hola@yaavs.com.mx",
          "error"
        );
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function isLeadTrigger(el) {
    if (!el) return false;
    if (el.matches?.('[href="#yaavser-lead"], [data-yaavser-lead-open]')) return true;
    return Boolean(el.closest?.('[href="#yaavser-lead"], [data-yaavser-lead-open]'));
  }

  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!isLeadTrigger(t)) return;
    e.preventDefault();
    open();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root?.classList.contains("is-open")) close();
  });

  if (location.hash === "#yaavser-lead") {
    window.setTimeout(open, 200);
  }

  window.YaavsYaavserLead = { open, close };
})();
