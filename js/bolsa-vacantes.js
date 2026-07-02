(function () {
  if (!document.body.classList.contains("page-bolsa-trabajo")) return;

  /** Vacantes activas — fuente: yaavs.com.mx/trabaja-con-nosotros */
  const OPEN_JOBS = [
    {
      id: "asesor-ventas-att",
      title: "Asesor de ventas AT&T",
      pills: ["Tiempo completo", "Negocios"],
      description:
        "Asesoría y venta de soluciones AT&T con respaldo YAAVS. Acompañas a puntos de venta y cierras oportunidades en el canal retail.",
      publishedAt: "2026-05-12",
      closesAt: "2026-07-15",
    },
    {
      id: "ejecutivo-ventas-detalle",
      title: "Ejecutivo de ventas a detalle",
      pills: ["Tiempo completo", "Nuevo León"],
      description:
        "Desarrollo de clientes y venta en mostrador en la zona de Nuevo León. Experiencia en telecom o retail es un plus.",
      publishedAt: "2026-05-18",
      closesAt: "2026-07-10",
    },
    {
      id: "guardia-seguridad",
      title: "Guardia de seguridad",
      pills: ["Tiempo completo", "Ojo de agua"],
      description:
        "Resguardo de instalaciones YAAVS en la zona de Ojo de agua. Horarios rotativos; se valoran certificaciones vigentes.",
      publishedAt: "2026-05-22",
      closesAt: "2026-06-30",
    },
  ];

  /** Catálogo de puestos agrupados por área */
  const DEPARTMENT_ORDER = [
    "Ventas",
    "Marketing",
    "Compras",
    "Operaciones",
    "Servicio",
    "Administración",
  ];

  const CATALOG = [
    { title: "Asesor de ventas AT&T", department: "Ventas", detail: "Negocios", open: true },
    { title: "Ejecutivo de ventas a detalle", department: "Ventas", detail: "Nuevo León", open: true },
    { title: "Ejecutivo de ventas campo", department: "Ventas", detail: "Campo", open: false },
    { title: "Promotor de marca", department: "Marketing", detail: "Promotoria", open: false },
    { title: "Auxiliar de compras", department: "Compras", detail: "Abastecimiento", open: false },
    { title: "Guardia de seguridad", department: "Operaciones", detail: "Ojo de agua", open: true },
    { title: "Coordinador de rotulación", department: "Operaciones", detail: "Imagen en PDV", open: false },
    { title: "Coordinador de operaciones", department: "Operaciones", detail: "Logística", open: false },
    { title: "Atención a clientes", department: "Servicio", detail: "Call center", open: false },
    { title: "Auxiliar administrativo", department: "Administración", detail: "Oficina central", open: false },
  ];

  const openGrid = document.getElementById("jobs-open-grid");
  const openEmpty = document.getElementById("jobs-open-empty");
  const catalogList = document.getElementById("jobs-catalog-list");
  const applyForm = document.getElementById("jobs-apply-form");

  const MS_DAY = 86400000;

  function parseDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function dayDiff(from, to) {
    return Math.round((startOfDay(to) - startOfDay(from)) / MS_DAY);
  }

  function formatPublishedLabel(publishedAt) {
    const days = dayDiff(parseDate(publishedAt), new Date());
    if (days <= 0) return "Publicada hoy";
    if (days === 1) return "Publicada hace 1 día";
    return `Publicada hace ${days} días`;
  }

  function formatRemainingLabel(closesAt) {
    const days = dayDiff(new Date(), parseDate(closesAt));
    if (days < 0) return "Convocatoria cerrada";
    if (days === 0) return "Cierra hoy";
    if (days === 1) return "Cierra en 1 día";
    return `Cierra en ${days} días`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderOpenJobs() {
    if (!openGrid) return;

    const active = OPEN_JOBS.filter((job) => dayDiff(new Date(), parseDate(job.closesAt)) >= 0);

    if (!active.length) {
      openGrid.innerHTML = "";
      if (openEmpty) openEmpty.hidden = false;
      return;
    }

    if (openEmpty) openEmpty.hidden = true;

    openGrid.innerHTML = active
      .map((job) => {
        const pills = job.pills.map((p) => `<span class="job-pill">${escapeHtml(p)}</span>`).join("");
        const remaining = formatRemainingLabel(job.closesAt);
        const remainingClass =
          dayDiff(new Date(), parseDate(job.closesAt)) <= 7 ? " job-time__remaining" : "";

        return `
          <article class="glass-card job-card">
            <div class="job-meta">${pills}</div>
            <h3>${escapeHtml(job.title)}</h3>
            <p>${escapeHtml(job.description)}</p>
            <div class="job-time">
              <span class="job-time__published">${formatPublishedLabel(job.publishedAt)}</span>
              <span class="job-time__sep" aria-hidden="true">·</span>
              <span class="job-time__remaining${remainingClass}">${remaining}</span>
            </div>
            <a href="#postular" class="job-apply" data-vacante="${escapeHtml(job.title)}">Postular →</a>
          </article>`;
      })
      .join("");
  }

  function deptSlug(dept) {
    return dept
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  }

  function renderCatalog() {
    if (!catalogList) return;

    const grouped = CATALOG.reduce((acc, item) => {
      if (!acc[item.department]) acc[item.department] = [];
      acc[item.department].push(item);
      return acc;
    }, {});

    catalogList.innerHTML = DEPARTMENT_ORDER.filter((dept) => grouped[dept]?.length)
      .map((dept) => {
        const slug = deptSlug(dept);
        const items = grouped[dept]
          .map((item) => {
            const closed = !item.open;
            return `
              <li class="jobs-catalog__item${closed ? " is-closed" : ""}">
                <div class="jobs-catalog__main">
                  <span class="jobs-catalog__title">${escapeHtml(item.title)}</span>
                  <span class="jobs-catalog__area">${escapeHtml(item.detail)}</span>
                </div>
                <span class="jobs-catalog__status">${item.open ? "Vacante abierta" : "Sin vacante activa"}</span>
              </li>`;
          })
          .join("");

        return `
          <section class="jobs-catalog-group" aria-labelledby="jobs-dept-${slug}">
            <h3 class="jobs-catalog-group__title" id="jobs-dept-${slug}">${escapeHtml(dept)}</h3>
            <ul class="jobs-catalog">${items}</ul>
          </section>`;
      })
      .join("");
  }

  function bindApplyLinks() {
    document.querySelectorAll(".job-apply").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const vacante = btn.getAttribute("data-vacante");
        const field = applyForm?.querySelector('[name="vacante"]');
        if (field && vacante) field.value = vacante;
        if (btn.getAttribute("href") === "#postular") {
          e.preventDefault();
          document.getElementById("postular")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  const FIELD_LABELS = {
    nombre: "Nombre",
    contacto: "Correo o teléfono",
    ubicacion: "Ubicación",
    experiencia: "Años de experiencia",
    escuela: "Escuela o formación",
    vacante: "Vacante(s) de interés",
    mensaje: "Mensaje",
    cv: "CV",
    portafolio: "Portafolio",
  };

  function bindFileInputs() {
    if (!applyForm) return;

    applyForm.querySelectorAll("[data-file-input]").forEach((input) => {
      const name = input.getAttribute("name");
      const hint = applyForm.querySelector(`[data-file-label="${name}"]`);
      const field = input.closest(".field--file");
      if (!hint || !field) return;

      const defaultText = hint.textContent;

      input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (file) {
          hint.textContent = file.name;
          field.classList.add("is-filled");
        } else {
          hint.textContent = defaultText;
          field.classList.remove("is-filled");
        }
      });
    });
  }

  function buildMailBody(data) {
    const lines = [];

    for (const [key, value] of data.entries()) {
      if (value instanceof File) {
        if (!value.size) continue;
        lines.push(
          `${FIELD_LABELS[key] || key}: ${value.name} (${Math.max(1, Math.round(value.size / 1024))} KB)`
        );
        continue;
      }
      const text = String(value).trim();
      if (!text) continue;
      lines.push(`${FIELD_LABELS[key] || key}: ${text}`);
    }

    const hasFiles = data.get("cv") instanceof File && data.get("cv").size;
    if (hasFiles) {
      lines.push("");
      lines.push("— Adjunta tu CV y portafolio en este correo antes de enviarlo.");
    }

    return lines.join("\n");
  }

  function bindApplyForm() {
    if (!applyForm) return;

    const statusEl = document.getElementById("jobs-apply-status");

    applyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!applyForm.checkValidity()) {
        applyForm.reportValidity();
        return;
      }

      const data = new FormData(applyForm);
      const body = buildMailBody(data);

      window.location.href = `mailto:Hola@yaavs.com.mx?subject=${encodeURIComponent(
        "Postulación Yaavstar — YAAVS"
      )}&body=${encodeURIComponent(body)}`;

      if (statusEl) {
        statusEl.hidden = false;
        statusEl.textContent =
          "Se abrió tu cliente de correo. Adjunta tu CV y portafolio al mensaje antes de enviarlo.";
        statusEl.classList.add("is-success");
      }

      applyForm.reset();
      applyForm.querySelectorAll(".field--file.is-filled").forEach((el) => el.classList.remove("is-filled"));
      applyForm.querySelectorAll("[data-file-label]").forEach((el) => {
        if (el.dataset.fileLabel === "cv") el.textContent = "Selecciona tu CV";
        if (el.dataset.fileLabel === "portafolio") el.textContent = "PDF, ZIP o imágenes";
      });
    });
  }

  function prefillFromQuery() {
    const vacante = new URLSearchParams(window.location.search).get("vacante");
    if (!vacante) return;
    const field = applyForm?.querySelector('[name="vacante"]');
    if (field) field.value = decodeURIComponent(vacante.replace(/\+/g, " "));
  }

  renderOpenJobs();
  renderCatalog();
  bindApplyLinks();
  bindFileInputs();
  bindApplyForm();
  prefillFromQuery();
})();
