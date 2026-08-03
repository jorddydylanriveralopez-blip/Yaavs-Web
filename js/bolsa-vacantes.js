(function () {
  if (!document.body.classList.contains("page-bolsa-trabajo")) return;

  const WA_RRHH = "525643873796";
  const WA_EMBAJADOR = "525643129691";

  /** Vacantes activas — flyers RRHH YAAVS (jul 2026) */
  const OPEN_JOBS = [
    {
      id: "soporte-tecnico",
      title: "Soporte técnico",
      pills: ["Tiempo completo", "Por incapacidad", "RRHH"],
      description:
        "Te estamos buscando por incapacidad. Analiza requerimientos, da soporte a usuarios internos y garantiza la operación tecnológica de YAAVS.",
      requirements: [
        "Analizar requerimientos tecnológicos y de negocio para proponer soluciones eficientes.",
        "Dar soporte técnico a usuarios internos y resolver incidencias de hardware, software y redes.",
        "Monitorear el desempeño de sistemas, aplicaciones y equipos tecnológicos.",
        "Gestionar y dar seguimiento a tickets de soporte y solicitudes de servicio.",
        "Apoyar en la administración de bases de datos, servidores y plataformas empresariales.",
        "Identificar riesgos tecnológicos y proponer medidas preventivas y correctivas.",
        "Garantizar el cumplimiento de políticas de seguridad informática y protección de datos.",
      ],
      location: "YAAVS",
      contactName: "RRHH",
      whatsapp: WA_RRHH,
      publishedAt: "2026-07-29",
      closesAt: "2026-12-31",
    },
    {
      id: "coordinador-trade-marketing",
      title: "Coordinador de Trade Marketing",
      pills: ["Tiempo completo", "Marketing", "RRHH"],
      description:
        "Coordina la estrategia de trade marketing con foco en inteligencia comercial, planeación y ejecución en campo.",
      requirements: [
        "Excel avanzado",
        "Power BI",
        "Paquetería Office",
        "ERP",
        "CRM",
        "Simpliroute o GoSpotCheck (plataformas de levantamiento de campo)",
        "Inteligencia comercial",
        "Planeación comercial",
        "Visual merchandising",
        "Administración de proyectos",
        "Monitorear tendencias del mercado, comportamiento del consumidor y actividades de la competencia",
      ],
      location: "YAAVS",
      contactName: "RRHH",
      whatsapp: WA_RRHH,
      publishedAt: "2026-07-29",
      closesAt: "2026-12-31",
    },
    {
      id: "especialista-mineria-datos-bi",
      title: "Especialista en minería de datos / Business Intelligence",
      pills: ["Tiempo completo", "100% oficina", "Tecámac"],
      description:
        "Perfil analítico para extracción, manipulación y visualización de información de negocio. Horario: lun–vie 9:00–18:00 y sáb 9:00–13:00.",
      requirements: [
        "Licenciatura orientada a minería de datos, actuaría o finanzas.",
        "Trabajo 100% oficina · Zona de trabajo: Ojo de Agua, Tecámac, Estado de México.",
        "Capacidad analítica y conocimiento en lenguajes de programación.",
        "Experiencia experta en manejo de bases de datos.",
        "Extracción, manipulación y análisis de información.",
        "Manejo experto de Power BI y manejo de Access.",
        "Python.",
        "Generación de reportes y dashboards a alto nivel.",
        "Creación de presentaciones en PowerPoint.",
        "Entendimiento, manejo y creación de KPIs.",
        "Facilidad de palabra y proyecciones de la información del negocio.",
      ],
      benefits: [
        "Prestaciones de ley",
        "Comedor gratuito",
        "Capacitación constante",
        "Seguro de gastos menores",
        "Póliza de cobertura por defunción",
        "Descuentos en +6,000 establecimientos y +4,000 proveedores médicos",
        "Atención psicológica",
        "Asesoría nutricional",
      ],
      location: "Ojo de Agua, Tecámac, Edo. Méx.",
      contactName: "Recursos Humanos",
      whatsapp: WA_RRHH,
      publishedAt: "2026-07-29",
      closesAt: "2026-12-31",
    },
    {
      id: "analista-planeacion-financiera",
      title: "Analista de planeación financiera",
      pills: ["Tiempo completo", "Finanzas", "Tecámac"],
      description:
        "Elabora reportes financieros, apoya el presupuesto anual y analiza costos, gastos y márgenes. Zona de trabajo: Tecámac Ojo de Agua.",
      requirements: [
        "Elaborar y actualizar reportes financieros mensuales (estado de resultados, flujo de efectivo y análisis de variaciones).",
        "Apoyar en la elaboración y seguimiento del presupuesto anual, identificando desviaciones.",
        "Apoyar en la evaluación financiera de proyectos (rentabilidad, punto de equilibrio y análisis preliminares).",
        "Mantener bases de datos financieras actualizadas y organizadas.",
        "Realizar análisis de costos, gastos y márgenes para detectar áreas de mejora.",
        "Conocimiento en interpretación de estados financieros (Resultados, Balance y Flujo de Efectivo).",
        "Fundamentos de análisis financiero, presupuestación y contabilidad general.",
        "Elaboración de proyecciones financieras básicas.",
        "Excel intermedio-avanzado (fórmulas financieras, tablas dinámicas, bases de datos).",
        "Indicadores financieros (rentabilidad, liquidez y punto de equilibrio).",
        "Principios de planeación financiera.",
        "Conocimiento básico en evaluación de proyectos (VPN, TIR, Payback).",
      ],
      location: "Tecámac Ojo de Agua",
      contactName: "Leesly Rosas",
      whatsapp: WA_RRHH,
      publishedAt: "2026-07-29",
      closesAt: "2026-12-31",
    },
    {
      id: "desarrollador-web",
      title: "Desarrollador web",
      pills: ["Tiempo completo", "Tecnología", "Tecámac"],
      description:
        "Se solicita desarrollador web con 2 años de experiencia comprobable. Zona de trabajo: Tecámac Ojo de Agua.",
      requirements: [
        "2 años de experiencia comprobable.",
        "Dominio de C#",
        "SQL Server",
        "LINQ",
        "Triggers",
        "Manejo de .NET / .NET Core",
        "Procedimientos almacenados",
        "Nociones de ITIL",
        "Familiaridad con metodologías y herramientas de soporte (mesa de ayuda, tickets)",
      ],
      benefits: [
        "Aumentos salariales",
        "Bebidas gratis",
        "Descuentos y precios preferenciales",
        "Estacionamiento de la empresa",
        "Horarios flexibles",
        "Servicio de comedor con descuento",
        "Teléfono de la empresa",
        "Seguro de gastos menores",
        "Póliza de cobertura por defunción",
        "Descuentos en +6,000 establecimientos y +4,000 proveedores médicos",
        "Atención psicológica",
        "Asesoría nutricional",
      ],
      location: "Tecámac Ojo de Agua",
      contactName: "RRHH",
      whatsapp: WA_RRHH,
      publishedAt: "2026-07-29",
      closesAt: "2026-12-31",
    },
    {
      id: "embajador-de-marca",
      title: "Embajador de marca",
      pills: ["Campo / activaciones", "Ojo de Agua", "Lun–Dom"],
      description:
        "Promotor/animador para impulsar la marca y las ventas en zonas estratégicas. Ideal si tienes experiencia como botarguero, animador de eventos, activaciones o perifoneo.",
      requirements: [
        "Representar marcas telecom (Telcel, AT&T, Movistar, BAIT, Unefon, Virgin Mobile).",
        "Conectar con clientes potenciales y crear experiencias memorables.",
        "Experiencia deseable: botarguero, animador de eventos, activaciones de marca, perifoneo y afines.",
        "Disponibilidad para laborar en Ojo de Agua, Tecámac, con actividades en CDMX y Estado de México.",
        "Horario: lunes a domingo con descanso rolado.",
      ],
      benefits: [
        "Sueldo mensual (pagos quincenales)",
        "Prestaciones de ley",
        "Uniformes sin costo",
        "Estabilidad laboral",
        "Oportunidad de crecimiento",
        "Auto utilitario",
      ],
      location: "Ojo de Agua, Tecámac (actividades CDMX / Edo. Méx.)",
      contactName: "Reclutamiento",
      whatsapp: WA_EMBAJADOR,
      publishedAt: "2026-07-29",
      closesAt: "2026-12-31",
    },
    {
      id: "gerente-contabilidad-financiero",
      title: "Gerente de contabilidad financiero",
      pills: ["Tiempo completo", "Finanzas", "Lun–Sáb"],
      description:
        "Liderazgo contable-financiero: estados financieros, conciliaciones, impuestos y controles. Licenciatura en Contabilidad o Finanzas con 5 años de experiencia corporativa.",
      requirements: [
        "Licenciatura en Contabilidad o Finanzas.",
        "5 años de experiencia en contabilidad corporativa.",
        "Conocimiento en elaboración de estados financieros y dominio de Excel.",
        "Disponibilidad de lunes a sábado.",
        "Elaboración de estados financieros (Balance, Resultados, Flujo de Efectivo y cambios en la situación financiera).",
        "Conciliación de cuentas, seguimiento y resolución.",
        "Registro de operaciones diarias.",
        "Revisión y autorización de ajustes contables (provisiones, amortizaciones, depreciaciones y conciliaciones bancarias).",
        "Presentación de declaraciones fiscales mensuales y anuales.",
        "Documentar procedimientos y controles contables.",
      ],
      benefits: [
        "Descuentos en +6,000 establecimientos",
        "Descuentos con +4,000 proveedores médicos",
        "Atención psicológica",
        "Asesoría nutricional",
        "Pago semanal",
        "Prestaciones de ley",
        "Seguro de gastos menores",
        "Póliza de cobertura por defunción",
      ],
      location: "YAAVS",
      contactName: "Leesly Rosas",
      whatsapp: WA_RRHH,
      publishedAt: "2026-07-29",
      closesAt: "2026-12-31",
    },
  ];

  /** Catálogo de puestos agrupados por área */
  const DEPARTMENT_ORDER = [
    "Tecnología",
    "Marketing",
    "Finanzas",
    "Ventas",
    "Operaciones",
    "Administración",
  ];

  const CATALOG = [
    { title: "Soporte técnico", department: "Tecnología", detail: "Por incapacidad", open: true, jobId: "soporte-tecnico" },
    { title: "Desarrollador web", department: "Tecnología", detail: "Tecámac Ojo de Agua", open: true, jobId: "desarrollador-web" },
    { title: "Especialista en minería de datos / BI", department: "Tecnología", detail: "Tecámac", open: true, jobId: "especialista-mineria-datos-bi" },
    { title: "Coordinador de Trade Marketing", department: "Marketing", detail: "Trade / campo", open: true, jobId: "coordinador-trade-marketing" },
    { title: "Embajador de marca", department: "Marketing", detail: "Activaciones", open: true, jobId: "embajador-de-marca" },
    { title: "Analista de planeación financiera", department: "Finanzas", detail: "Tecámac", open: true, jobId: "analista-planeacion-financiera" },
    { title: "Gerente de contabilidad financiero", department: "Finanzas", detail: "Lun–Sáb", open: true, jobId: "gerente-contabilidad-financiero" },
    { title: "Asesor de ventas AT&T", department: "Ventas", detail: "Negocios", open: false },
    { title: "Ejecutivo de ventas a detalle", department: "Ventas", detail: "Nuevo León", open: false },
    { title: "Ejecutivo de ventas campo", department: "Ventas", detail: "Campo", open: false },
    { title: "Coordinador de rotulación", department: "Operaciones", detail: "Imagen en PDV", open: false },
    { title: "Coordinador de operaciones", department: "Operaciones", detail: "Logística", open: false },
    { title: "Auxiliar administrativo", department: "Administración", detail: "Oficina central", open: false },
  ];

  const OPEN_BY_ID = OPEN_JOBS.reduce((acc, job) => {
    acc[job.id] = job;
    return acc;
  }, {});

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

  function safeExternalUrl(url) {
    const raw = String(url || "").trim();
    if (!raw) return "";
    try {
      const parsed = new URL(raw);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
      return parsed.href;
    } catch (_) {
      return "";
    }
  }

  function externalLinkLabel(url) {
    const host = (() => {
      try {
        return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
      } catch (_) {
        return "";
      }
    })();
    if (host.includes("occ")) return "Ver en OCC →";
    if (host.includes("computrabajo")) return "Ver en Computrabajo →";
    if (host.includes("indeed")) return "Ver en Indeed →";
    if (host.includes("linkedin")) return "Ver en LinkedIn →";
    return "Ver publicación →";
  }

  function formatWhatsAppDisplay(digits) {
    const d = String(digits || "").replace(/\D/g, "");
    if (d.length === 12 && d.startsWith("52")) {
      return `${d.slice(2, 4)} ${d.slice(4, 8)} ${d.slice(8)}`;
    }
    return d;
  }

  function whatsappHref(job) {
    const phone = String(job.whatsapp || "").replace(/\D/g, "");
    if (!phone) return "";
    const to = job.contactName ? ` a ${job.contactName}` : "";
    const text = encodeURIComponent(
      `Hola${to}, quiero postularme a la vacante de ${job.title} en YAAVS. Les envío mi CV.`
    );
    return `https://wa.me/${phone}?text=${text}`;
  }

  function renderList(items, className) {
    if (!items?.length) return "";
    return `<ul class="${className}">${items
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("")}</ul>`;
  }

  function renderJobDetail(job) {
    if (!job) return "";
    const wa = whatsappHref(job);
    const waLabel = job.contactName
      ? `WhatsApp ${formatWhatsAppDisplay(job.whatsapp)} · ${job.contactName}`
      : `WhatsApp ${formatWhatsAppDisplay(job.whatsapp)}`;
    const waLink = wa
      ? `<a class="job-whatsapp" href="${escapeHtml(wa)}" target="_blank" rel="noopener noreferrer" data-yaavs-track="whatsapp_click" data-yaavs-track-label="bolsa_${escapeHtml(job.id)}">${escapeHtml(waLabel)}</a>`
      : "";
    const location = job.location
      ? `<p class="jobs-catalog__location"><strong>Zona:</strong> ${escapeHtml(job.location)}</p>`
      : "";
    const reqs = job.requirements?.length
      ? `<div class="jobs-catalog__specs"><h4>Requisitos / perfil</h4>${renderList(job.requirements, "jobs-catalog__specs-list")}</div>`
      : "";
    const benefits = job.benefits?.length
      ? `<div class="jobs-catalog__specs"><h4>Ofrecemos</h4>${renderList(job.benefits, "jobs-catalog__specs-list")}</div>`
      : "";
    const desc = job.description
      ? `<p class="jobs-catalog__desc">${escapeHtml(job.description)}</p>`
      : "";

    return `
      <div class="jobs-catalog__detail" id="vacante-${escapeHtml(job.id)}" hidden>
        ${desc}
        ${location}
        ${reqs}
        ${benefits}
        <div class="jobs-catalog__actions">
          ${waLink}
          <a href="#postular" class="job-apply" data-vacante="${escapeHtml(job.title)}">Postular aquí →</a>
        </div>
      </div>`;
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
            const job = item.jobId ? OPEN_BY_ID[item.jobId] : null;
            const isOpenDetail = Boolean(job && !closed);
            const rowAttrs = isOpenDetail
              ? ` class="jobs-catalog__item is-openable" tabindex="0" role="button" aria-expanded="false" data-job-toggle="${escapeHtml(item.jobId)}"`
              : ` class="jobs-catalog__item${closed ? " is-closed" : ""}"`;
            return `
              <li${rowAttrs}>
                <div class="jobs-catalog__row">
                  <div class="jobs-catalog__main">
                    <span class="jobs-catalog__title">${escapeHtml(item.title)}</span>
                    <span class="jobs-catalog__area">${escapeHtml(item.detail)}</span>
                  </div>
                  <span class="jobs-catalog__status">${item.open ? "Vacante abierta" : "Sin vacante activa"}</span>
                </div>
                ${isOpenDetail ? renderJobDetail(job) : ""}
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

    bindCatalogToggles();
  }

  function bindCatalogToggles() {
    if (!catalogList) return;

    catalogList.querySelectorAll("[data-job-toggle]").forEach((row) => {
      const toggle = () => {
        const detail = row.querySelector(".jobs-catalog__detail");
        if (!detail) return;
        const open = row.classList.toggle("is-expanded");
        detail.hidden = !open;
        row.setAttribute("aria-expanded", open ? "true" : "false");
      };

      row.addEventListener("click", (e) => {
        if (e.target.closest("a")) return;
        toggle();
      });

      row.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        if (e.target.closest("a")) return;
        e.preventDefault();
        toggle();
      });
    });
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
      if (key === "website" || key === "hp_url") continue;
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
      const data = new FormData(applyForm);
      const honey = String(data.get("website") || "").trim();
      const started = Number(applyForm.dataset.formStarted || 0);
      if (honey || (started && Date.now() - started < 1200)) {
        if (statusEl) {
          statusEl.hidden = false;
          statusEl.textContent = "Solicitud recibida. Gracias.";
          statusEl.classList.add("is-success");
        }
        applyForm.reset();
        applyForm.dataset.formStarted = String(Date.now());
        return;
      }
      if (!applyForm.checkValidity()) {
        applyForm.reportValidity();
        return;
      }

      const body = buildMailBody(data);

      window.location.href = `mailto:Hola@yaavs.com.mx?subject=${encodeURIComponent(
        "Postulación — Bolsa de trabajo YAAVS"
      )}&body=${encodeURIComponent(body)}`;

      if (statusEl) {
        statusEl.hidden = false;
        statusEl.textContent =
          "Se abrió tu cliente de correo. Adjunta tu CV y portafolio al mensaje antes de enviarlo.";
        statusEl.classList.add("is-success");
      }

      applyForm.reset();
      applyForm.dataset.formStarted = String(Date.now());
      applyForm.querySelectorAll(".field--file.is-filled").forEach((el) => el.classList.remove("is-filled"));
      applyForm.querySelectorAll("[data-file-label]").forEach((el) => {
        if (el.dataset.fileLabel === "cv") el.textContent = "Selecciona tu CV";
        if (el.dataset.fileLabel === "portafolio") el.textContent = "PDF, ZIP o imágenes";
      });
    });

    if (!applyForm.dataset.formStarted) {
      applyForm.dataset.formStarted = String(Date.now());
    }
  }

  function prefillFromQuery() {
    const vacante = new URLSearchParams(window.location.search).get("vacante");
    if (!vacante) return;
    const field = applyForm?.querySelector('[name="vacante"]');
    if (field) field.value = decodeURIComponent(vacante.replace(/\+/g, " "));
  }

  renderCatalog();
  bindApplyLinks();
  bindFileInputs();
  bindApplyForm();
  prefillFromQuery();

  const catalogScene = document.querySelector(".jobs-catalog-section");
  if (catalogScene) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      catalogScene.classList.add("is-scene-on");
    } else {
      const sceneObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            catalogScene.classList.add("is-scene-on");
            sceneObs.disconnect();
          });
        },
        { threshold: 0.22, rootMargin: "0px 0px -8% 0px" }
      );
      sceneObs.observe(catalogScene);
    }
  }
})();
