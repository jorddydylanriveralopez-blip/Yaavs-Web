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
  let lastFocus = null;

  function stateOptions() {
    return STATES.map((s) => `<option value="${s}">${s}</option>`).join("");
  }

  function payloadFromForm(fd) {
    return {
      nombre: String(fd.get("nombre") || "").trim(),
      negocio: String(fd.get("negocio") || "").trim(),
      estado: String(fd.get("estado") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      telefono: String(fd.get("telefono") || "").trim(),
      website: String(fd.get("website") || "").trim(),
    };
  }

  function isBotSubmission(formEl, fd) {
    if (String(fd.get("website") || "").trim()) return true;
    const started = Number(formEl?.dataset.formStarted || 0);
    if (started && Date.now() - started < 1200) return true;
    return false;
  }

  async function sendToSheets(data) {
    const endpoint = String(cfg.endpoint || "").trim();
    if (!endpoint) {
      throw new Error("ENDPOINT_MISSING");
    }

    const res = await fetch(endpoint, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });

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
      "Solicitud socio comercial - " + data.nombre
    )}&body=${encodeURIComponent(body)}`;
  }

  function setStatus(statusEl, msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.classList.toggle("is-success", kind === "success");
    statusEl.classList.toggle("is-error", kind === "error");
  }

  function bindForm(formEl, options) {
    if (!formEl || formEl.dataset.yaavserLeadBound === "1") return;
    formEl.dataset.yaavserLeadBound = "1";
    if (!formEl.dataset.formStarted) {
      formEl.dataset.formStarted = String(Date.now());
    }

    const statusEl =
      formEl.querySelector("[data-yaavser-lead-status]") ||
      options?.statusEl ||
      null;
    const submitBtn =
      formEl.querySelector('[type="submit"]') || options?.submitBtn || null;
    const closeOnSuccess = Boolean(options?.closeOnSuccess);

    formEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(formEl);
      if (isBotSubmission(formEl, fd)) {
        setStatus(statusEl, "¡Listo! Recibimos tu solicitud. Pronto te contactamos.", "success");
        formEl.reset();
        formEl.dataset.formStarted = String(Date.now());
        if (closeOnSuccess) window.setTimeout(close, 1200);
        return;
      }
      if (!formEl.checkValidity()) {
        formEl.reportValidity();
        return;
      }

      const data = payloadFromForm(fd);
      delete data.website;
      setStatus(statusEl, "Enviando…", null);
      if (submitBtn) submitBtn.disabled = true;

      try {
        await sendToSheets(data);
        setStatus(statusEl, "¡Listo! Recibimos tu solicitud. Pronto te contactamos.", "success");
        formEl.reset();
        formEl.dataset.formStarted = String(Date.now());
        if (closeOnSuccess) window.setTimeout(close, 1600);
      } catch (err) {
        if (err && err.message === "ENDPOINT_MISSING") {
          mailtoFallback(data);
          setStatus(
            statusEl,
            "Se abrió tu correo. Completa el envío o escríbenos a Hola@yaavs.com.mx",
            "error"
          );
        } else {
          setStatus(
            statusEl,
            "No pudimos enviar ahora. Intenta de nuevo o escríbenos a Hola@yaavs.com.mx",
            "error"
          );
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  function bindInlineForms() {
    document.querySelectorAll("form[data-yaavser-lead-form]").forEach((formEl) => {
      bindForm(formEl, { closeOnSuccess: false });
    });
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
        <p class="yaavser-lead__kicker">Contestando este formulario</p>
        <h2 class="yaavser-lead__title" id="yaavser-lead-title">Conviértete en <span>socio comercial</span></h2>
        <p class="yaavser-lead__lead">Déjanos tus datos y un ejecutivo te contacta para afiliar tu negocio a la red YAAVS.</p>
        <form class="yaavser-lead__form" id="yaavser-lead-form" data-yaavser-lead-form novalidate data-form-started="">
          <label class="hp-field" aria-hidden="true">
            <span>No completar</span>
            <input type="text" name="website" tabindex="-1" autocomplete="off">
          </label>
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
          <label class="yaavser-lead__check">
            <input type="checkbox" name="privacidad" required value="Aceptado">
            <span>He leído el <a href="aviso-privacidad.html">aviso de privacidad</a> y autorizo el uso de mis datos para atender mi solicitud.</span>
          </label>
          <button type="submit" class="yaavser-lead__submit">Enviar solicitud</button>
          <p class="yaavser-lead__status" data-yaavser-lead-status role="status" aria-live="polite"></p>
        </form>
      </div>
    `;

    document.body.appendChild(root);
    const modalForm = root.querySelector("#yaavser-lead-form");
    bindForm(modalForm, { closeOnSuccess: true });

    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-yaavser-lead-close]")) close();
    });

    return root;
  }

  function open() {
    ensureModal();
    const modalForm = root.querySelector("#yaavser-lead-form");
    if (modalForm) modalForm.dataset.formStarted = String(Date.now());
    lastFocus = document.activeElement;
    root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => root.classList.add("is-open"));
    document.documentElement.classList.add("yaavser-lead-open");
    root.querySelector('input[name="nombre"]')?.focus();
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

  function isLeadTrigger(el) {
    if (!el) return false;
    if (el.matches?.('[href="#yaavser-lead"], [data-yaavser-lead-open]')) return true;
    return Boolean(el.closest?.('[href="#yaavser-lead"], [data-yaavser-lead-open]'));
  }

  document.addEventListener("click", (e) => {
    if (!isLeadTrigger(e.target)) return;
    e.preventDefault();
    if (location.hash === "#yaavser-lead") {
      history.replaceState(null, "", location.pathname + location.search);
    }
    open();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root?.classList.contains("is-open")) close();
  });

  if (location.hash === "#yaavser-lead") {
    history.replaceState(null, "", location.pathname + location.search);
  }

  bindInlineForms();
  document.addEventListener("yaavs:layout-ready", bindInlineForms);

  window.YaavsYaavserLead = { open, close, bindForms: bindInlineForms };
})();
