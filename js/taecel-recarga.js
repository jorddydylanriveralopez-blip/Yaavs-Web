/**
 * Formulario de recarga TAECEL (front).
 * Habla solo con /api/taecel/* — nunca con claves en el cliente.
 */
(function () {
  const form = document.getElementById("taecel-form");
  if (!form) return;

  const carrierSelect = form.querySelector("[data-taecel-carrier]");
  const productSelect = form.querySelector("[data-taecel-product]");
  const phoneInput = form.querySelector("[data-taecel-phone]");
  const statusEl = form.querySelector("[data-taecel-status]");
  const modeEl = form.querySelector("[data-taecel-mode]");
  const submitBtn = form.querySelector("[data-taecel-submit]");

  let carriers = [];

  function setStatus(type, message) {
    if (!statusEl) return;
    if (!message) {
      statusEl.hidden = true;
      statusEl.textContent = "";
      statusEl.className = "recargar-status";
      return;
    }
    statusEl.hidden = false;
    statusEl.className = `recargar-status is-${type}`;
    statusEl.textContent = message;
  }

  function fillCarriers(list) {
    carriers = Array.isArray(list) ? list : [];
    carrierSelect.innerHTML = "";
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "Selecciona compañía";
    carrierSelect.appendChild(empty);
    carriers.forEach((group) => {
      const opt = document.createElement("option");
      opt.value = group.carrier;
      opt.textContent = group.label;
      carrierSelect.appendChild(opt);
    });
    productSelect.disabled = true;
    productSelect.innerHTML = `<option value="">Elige compañía primero</option>`;
  }

  function fillProducts(carrierId) {
    const group = carriers.find((c) => c.carrier === carrierId);
    productSelect.innerHTML = "";
    if (!group || !group.products?.length) {
      productSelect.disabled = true;
      productSelect.innerHTML = `<option value="">Sin productos</option>`;
      return;
    }
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "Selecciona monto";
    productSelect.appendChild(empty);
    group.products.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name || `$${p.amount}`;
      productSelect.appendChild(opt);
    });
    productSelect.disabled = false;
  }

  async function loadCatalog() {
    setStatus("info", "Cargando catálogo…");
    try {
      const res = await fetch("/api/taecel/productos", { headers: { Accept: "application/json" } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "No se pudo cargar el catálogo.");
      }
      fillCarriers(data.carriers || []);
      if (modeEl) {
        const demo = data.mode === "demo" || data.demo;
        modeEl.hidden = false;
        modeEl.textContent = demo ? "Modo demo (sin saldo real)" : "Modo producción TAECEL";
        modeEl.classList.toggle("is-live", !demo);
      }
      setStatus("", "");
    } catch (err) {
      fillCarriers([]);
      setStatus(
        "error",
        err.message || "No se pudo cargar el catálogo. Revisa el despliegue de /api/taecel/productos."
      );
    }
  }

  carrierSelect.addEventListener("change", () => {
    fillProducts(carrierSelect.value);
    setStatus("", "");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("", "");

    const productId = productSelect.value;
    const phone = phoneInput.value.trim();
    if (!carrierSelect.value) {
      setStatus("error", "Selecciona una compañía.");
      return;
    }
    if (!productId) {
      setStatus("error", "Selecciona un monto.");
      return;
    }
    if (!phone) {
      setStatus("error", "Escribe el número a recargar.");
      return;
    }

    form.classList.add("is-busy");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Procesando…";
    }
    setStatus("info", "Enviando recarga…");

    try {
      const res = await fetch("/api/taecel/recarga", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ productId, phone }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setStatus("error", data.message || "No se pudo completar la recarga.");
        return;
      }

      const demoTag = data.demo ? " (DEMO)" : "";
      setStatus(
        "ok",
        `${data.message || "Recarga OK."} Folio: ${data.folio}${demoTag}. ${data.carrier || ""} ${data.product || ""} → ${data.phone || phone}.`
      );
      phoneInput.value = "";
    } catch {
      setStatus("error", "Error de red. Intenta de nuevo o escribe por WhatsApp.");
    } finally {
      form.classList.remove("is-busy");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Recargar ahora";
      }
    }
  });

  loadCatalog();
})();
