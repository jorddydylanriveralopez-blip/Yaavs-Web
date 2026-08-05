(function () {
  if (!document.body.classList.contains("page-bolsa-trabajo")) return;

  const WA_RRHH = "525643873796";
  const WA_EMBAJADOR = "525643129691";

  /** Vacantes activas — plantilla RRHH + flyers (ago 2026) */
  const OPEN_JOBS = [
    {
      id: "soporte-tecnico",
      title: "Soporte técnico",
      pills: ["Por incapacidad", "TI", "Presencial"],
      description:
        "Analista de soporte TI por incapacidad. Atiende incidencias de hardware, software y redes, da seguimiento a tickets y respalda la operación tecnológica.",
      requirements: [
        "Edad 25 a 35 años · experiencia deseable de 1 año.",
        "Atención y servicio a clientes, excelente actitud y presentación.",
        "Analizar requerimientos tecnológicos y de negocio para proponer soluciones eficientes.",
        "Dar soporte técnico a usuarios internos y resolver incidencias de hardware, software y redes.",
        "Monitorear el desempeño de sistemas, aplicaciones y equipos tecnológicos.",
        "Elaborar documentación técnica, procedimientos y manuales de usuario.",
        "Gestionar y dar seguimiento a tickets de soporte y solicitudes de servicio.",
        "Apoyar en la administración de bases de datos, servidores y plataformas empresariales.",
        "Identificar riesgos tecnológicos y proponer medidas preventivas y correctivas.",
        "Garantizar el cumplimiento de políticas de seguridad informática y protección de datos.",
        "Generar reportes e indicadores relacionados con la operación de TI.",
      ],
      benefits: [
        "Comedor gratuito",
        "Uniformes gratuitos",
        "Prestaciones de ley",
        "Vacaciones adicionales o permisos con goce de sueldo",
        "Seguro de gastos menores",
        "Póliza de cobertura por defunción",
        "Descuentos en +6,000 establecimientos y +4,000 proveedores médicos",
        "Atención psicológica",
        "Asesoría nutricional",
      ],
      salary: "$11,000 – $12,000 mensuales",
      schedule: "Lun–vie 9:00–18:00 · Sáb 10:00–14:00",
      location: "Ojo de Agua, Tecámac, Edo. Méx. C.P. 55770",
      contactName: "RRHH",
      whatsapp: WA_RRHH,
      image: "assets/bolsa/vacantes/soporte-tecnico.jpg",
      link: "https://www.facebook.com/share/p/1D7zSfZd9p/",
      publishedAt: "2026-07-29",
      closesAt: "2026-12-31",
    },
    {
      id: "desarrollador-web",
      title: "Desarrollador web",
      pills: ["Tiempo completo", "TI", "Presencial"],
      description:
        "Desarrollo presencial en Tecámac Ojo de Agua. Experiencia comprobable desde 1 año en software con dominio de C#, SQL Server y ASP.NET.",
      requirements: [
        "Ingeniería en Sistemas, Informática o carrera afín.",
        "Experiencia comprobable a partir de 1 año en desarrollo de software.",
        "Dominio de C#",
        "SQL Server",
        "Procedimientos almacenados",
        "Triggers",
        "ASP.NET Framework",
        "Notación JSON",
        "HTML",
        "jQuery Framework",
      ],
      benefits: [
        "Prestaciones de ley",
        "Aumentos salariales",
        "Bebidas gratis",
        "Descuentos y precios preferenciales",
        "Estacionamiento de la empresa",
        "Horarios flexibles",
        "Servicio de comedor con descuento",
        "Teléfono de la empresa",
        "Uniformes gratuitos",
      ],
      salary: "$12,000 – $18,000 según conocimientos y prueba",
      schedule: "Turno de 8 horas",
      location: "Tecámac Ojo de Agua, Edo. Méx.",
      contactName: "RRHH",
      whatsapp: WA_RRHH,
      image: "assets/bolsa/vacantes/desarrollador-web.jpg",
      link: "https://mx.indeed.com/viewjob?jk=44bbcbc68b38ca20&from=shareddesktop_copy",
      publishedAt: "2026-07-29",
      closesAt: "2026-12-31",
    },
    {
      id: "especialista-mineria-datos-bi",
      title: "Especialista en minería de datos / Business Intelligence",
      pills: ["Tiempo completo", "BI", "100% oficina"],
      description:
        "Análisis de información para dar visibilidad a la operación: tableros y dashboards para ventas, con toma de decisiones basada en datos.",
      requirements: [
        "Licenciatura orientada a minería de datos, actuaría o finanzas.",
        "Disponibilidad de lunes a sábado · trabajo 100% oficina.",
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
      salary: "$30,000 – $35,000 mensuales",
      schedule: "Lun–vie 9:00–18:00 · Sáb 10:00–14:00",
      location: "Ojo de Agua, Tecámac, Edo. Méx. C.P. 55770",
      contactName: "Recursos Humanos",
      whatsapp: WA_RRHH,
      image: "assets/bolsa/vacantes/especialista-mineria-datos-bi.jpg",
      publishedAt: "2026-07-29",
      closesAt: "2026-12-31",
    },
    {
      id: "coordinador-trade-marketing",
      title: "Coordinador de Trade Marketing",
      pills: ["Tiempo completo", "Marketing", "Centro"],
      description:
        "Coordina trade marketing en zona centro: insights, ejecución en PDV, materiales POP y planes de crecimiento con socios comerciales.",
      requirements: [
        "Licenciatura en Mercadotecnia, Comunicación o afín concluida.",
        "30–40 años · experiencia mínima de 4 años en el área.",
        "Excel avanzado, Power BI, Office, ERP y CRM.",
        "Simpliroute o GoSpotCheck (levantamiento de campo).",
        "Inteligencia y planeación comercial, visual merchandising y administración de proyectos.",
        "Monitorear tendencias del mercado, consumidor y competencia.",
        "Levantamiento de información de clientes e insights por región.",
        "Diseñar e implementar estrategias de trade por unidad de negocio.",
        "Coordinar producción, distribución e inventarios de materiales promocionales.",
        "Seguimiento a ejecución en punto de venta y análisis post-mortem.",
        "Gestión de presupuesto y disponibilidad para viajar (auto de empresa).",
      ],
      benefits: [
        "Prestaciones de ley",
        "Comedor gratuito",
        "Seguro de gastos menores",
        "Póliza de cobertura por defunción",
        "Descuentos en +6,000 establecimientos y +4,000 proveedores médicos",
        "Atención psicológica",
        "Asesoría nutricional",
        "Automóvil de la empresa y apoyo de combustible",
      ],
      salary: "$18,500 – $20,000 mensuales",
      schedule: "Lun–vie 9:00–18:00 · Sáb 10:00–14:00",
      location: "Ojo de Agua, Tecámac, Edo. Méx. C.P. 55770",
      contactName: "RRHH",
      whatsapp: WA_RRHH,
      image: "assets/bolsa/vacantes/coordinador-trade-marketing.jpg",
      link: "https://www.occ.com.mx/empleo/oferta/21233080",
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
      image: "assets/bolsa/vacantes/embajador-de-marca.jpg",
      publishedAt: "2026-07-29",
      closesAt: "2026-12-31",
    },
    {
      id: "analista-planeacion-financiera",
      title: "Analista de planeación financiera",
      pills: ["Tiempo completo", "Finanzas", "Presencial"],
      description:
        "Licenciatura en Finanzas, Economía o Administración (indispensable) con 3 años de experiencia. Reportes, presupuesto y análisis de márgenes.",
      requirements: [
        "Lic. en Finanzas, Economía o Administración · 3 años de experiencia.",
        "Elaborar y actualizar reportes financieros mensuales (resultados, flujo y variaciones).",
        "Apoyar el presupuesto anual, identificando desviaciones.",
        "Evaluación financiera de proyectos (rentabilidad, punto de equilibrio).",
        "Mantener bases de datos financieras actualizadas.",
        "Análisis de costos, gastos y márgenes.",
        "Interpretación de estados financieros (Resultados, Balance y Flujo).",
        "Excel intermedio-avanzado (fórmulas financieras, tablas dinámicas).",
        "Indicadores financieros, planeación financiera y evaluación básica (VPN, TIR, Payback).",
      ],
      benefits: [
        "Prestaciones de ley",
        "Teléfono de la empresa",
        "Uniformes gratuitos",
        "Vacaciones adicionales o permisos con goce de sueldo",
        "Seguro de gastos menores",
        "Póliza de cobertura por defunción",
        "Descuentos en +6,000 establecimientos y +4,000 proveedores médicos",
        "Atención psicológica",
        "Asesoría nutricional",
      ],
      salary: "$15,000 – $17,000 libres mensuales",
      schedule: "Lun–vie 9:00–18:00 · Sáb 10:00–14:00",
      location: "Ojo de Agua, Tecámac, Edo. Méx. C.P. 55770",
      contactName: "Leesly Rosas",
      whatsapp: WA_RRHH,
      image: "assets/bolsa/vacantes/analista-planeacion-financiera.jpg",
      link: "https://mx.indeed.com/viewjob?jk=80d4c7eef3bb1c31&from=shareddesktop_copy",
      publishedAt: "2026-07-29",
      closesAt: "2026-12-31",
    },
    {
      id: "gerente-contabilidad-financiero",
      title: "Gerente de contabilidad financiero",
      pills: ["Tiempo completo", "Contabilidad", "Lun–Sáb"],
      description:
        "Liderazgo contable: estados financieros, conciliaciones, cierres mensuales e inventarios. Preferible experiencia en telecom.",
      requirements: [
        "Licenciatura en Contabilidad o Finanzas.",
        "Experiencia en contabilidad de empresas medianas o grandes.",
        "Experiencia en telecomunicaciones (preferible).",
        "Conocimiento en elaboración de estados financieros y Excel.",
        "Disponibilidad de lunes a sábado.",
        "Registro de operaciones diarias y cierres mensuales.",
        "Revisión y aprobación de ajustes contables (provisiones, amortizaciones, depreciaciones y conciliaciones).",
        "Elaboración de estados financieros (Balance, Resultados, Flujo y cambios en la situación financiera).",
        "Documentar procedimientos y controles contables.",
        "Control de inventarios y inventario físico anual.",
      ],
      benefits: [
        "Prestaciones de ley",
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
      salary: "$30,000 – $35,000 mensuales",
      schedule: "Lun–vie 9:00–18:00 · Sáb 10:00–14:00",
      location: "Ojo de Agua, Tecámac, Edo. Méx.",
      contactName: "Leesly Rosas",
      whatsapp: WA_RRHH,
      image: "assets/bolsa/vacantes/gerente-contabilidad-financiero.jpg",
      publishedAt: "2026-07-29",
      closesAt: "2026-12-31",
    },
    {
      id: "asesor-ventas-att",
      title: "Asesor de ventas AT&T",
      pills: ["Tiempo completo", "Ventas", "Negocios"],
      description:
        "Asesoría y venta de soluciones AT&T con respaldo YAAVS. Acompañas a puntos de venta y cierras oportunidades en el canal retail.",
      requirements: [
        "Orientación a resultados y cierre comercial.",
        "Disponibilidad para visitar y acompañar puntos de venta.",
        "Conocimiento deseable del portafolio telecom / AT&T.",
      ],
      location: "Negocios / canal retail",
      contactName: "RRHH",
      whatsapp: WA_RRHH,
      link: "https://www.occ.com.mx/empleo/oferta/ejemplo-asesor-att",
      publishedAt: "2026-05-12",
      closesAt: "2026-08-15",
    },
  ];

  const DEPARTMENT_ORDER = [
    "Tecnología",
    "Marketing",
    "Finanzas",
    "Contabilidad",
    "Ventas",
    "Operaciones",
    "Administración",
  ];

  const CATALOG = [
    { title: "Soporte técnico", department: "Tecnología", detail: "Por incapacidad · Tecámac", open: true, jobId: "soporte-tecnico" },
    { title: "Desarrollador web", department: "Tecnología", detail: "Tecámac Ojo de Agua", open: true, jobId: "desarrollador-web" },
    { title: "Especialista en minería de datos / BI", department: "Tecnología", detail: "100% oficina · Tecámac", open: true, jobId: "especialista-mineria-datos-bi" },
    { title: "Coordinador de Trade Marketing", department: "Marketing", detail: "Zona centro · Tecámac", open: true, jobId: "coordinador-trade-marketing" },
    { title: "Embajador de marca", department: "Marketing", detail: "Activaciones · campo", open: true, jobId: "embajador-de-marca" },
    { title: "Analista de planeación financiera", department: "Finanzas", detail: "Tecámac Ojo de Agua", open: true, jobId: "analista-planeacion-financiera" },
    { title: "Gerente de contabilidad financiero", department: "Contabilidad", detail: "Tecámac · Lun–Sáb", open: true, jobId: "gerente-contabilidad-financiero" },
    { title: "Asesor de ventas AT&T", department: "Ventas", detail: "Negocios / retail", open: true, jobId: "asesor-ventas-att" },
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
  const openCountEl = document.getElementById("jobs-open-count");
  const openCountWrap = document.getElementById("jobs-open-count-wrap");

  const MS_DAY = 86400000;

  function parseDate(iso) {
    const [y, m, d] = String(iso || "").split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function dayDiff(from, to) {
    return Math.round((startOfDay(to) - startOfDay(from)) / MS_DAY);
  }

  function isJobActive(job) {
    if (!job) return false;
    const closes = parseDate(job.closesAt);
    if (!closes) return true;
    return dayDiff(new Date(), closes) >= 0;
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
    if (host.includes("occ")) return "Ver en OCC";
    if (host.includes("computrabajo")) return "Ver en Computrabajo";
    if (host.includes("indeed")) return "Ver en Indeed";
    if (host.includes("linkedin")) return "Ver en LinkedIn";
    if (host.includes("facebook") || host.includes("fb.com")) return "Ver en Facebook";
    return "Ver publicación";
  }

  function externalLinkTone(url) {
    const host = (() => {
      try {
        return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
      } catch (_) {
        return "";
      }
    })();
    if (host.includes("occ")) return "occ";
    if (host.includes("indeed")) return "indeed";
    if (host.includes("facebook") || host.includes("fb.com")) return "facebook";
    if (host.includes("linkedin")) return "linkedin";
    return "external";
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

  function renderMetaChips(job) {
    const chips = [];
    if (job.salary) chips.push(`<span class="jobs-catalog__chip jobs-catalog__chip--salary">${escapeHtml(job.salary)}</span>`);
    if (job.schedule) chips.push(`<span class="jobs-catalog__chip">${escapeHtml(job.schedule)}</span>`);
    if (job.location) chips.push(`<span class="jobs-catalog__chip">${escapeHtml(job.location)}</span>`);
    if (!chips.length) return "";
    return `<div class="jobs-catalog__chips">${chips.join("")}</div>`;
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
    const externalUrl = safeExternalUrl(job.link || job.externalUrl);
    const tone = externalLinkTone(externalUrl);
    const platformLink = externalUrl
      ? `<a class="job-platform job-platform--${tone}" href="${escapeHtml(externalUrl)}" target="_blank" rel="noopener noreferrer" data-yaavs-track="job_platform_click" data-yaavs-track-label="bolsa_${escapeHtml(job.id)}">${escapeHtml(externalLinkLabel(externalUrl))} →</a>`
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
    const photo = job.image
      ? `<figure class="jobs-catalog__photo">
          <button type="button" class="jobs-catalog__photo-btn" data-flyer-src="${escapeHtml(job.image)}?v=2" data-flyer-alt="Flyer vacante ${escapeHtml(job.title)}" aria-label="Ampliar flyer de ${escapeHtml(job.title)}">
            <img src="${escapeHtml(job.image)}?v=2" alt="Flyer vacante ${escapeHtml(job.title)}" width="720" height="900" loading="lazy" decoding="async">
            <span class="jobs-catalog__photo-hint">Clic para ampliar</span>
          </button>
        </figure>`
      : "";

    return `
      <div class="jobs-catalog__detail" id="vacante-${escapeHtml(job.id)}" hidden>
        <div class="jobs-catalog__detail-grid${photo ? " has-photo" : ""}">
          <div class="jobs-catalog__copy">
            ${desc}
            ${renderMetaChips(job)}
            ${reqs}
            ${benefits}
            <div class="jobs-catalog__actions">
              ${waLink}
              ${platformLink}
              <a href="#postular" class="job-apply" data-vacante="${escapeHtml(job.title)}">Postular aquí →</a>
            </div>
          </div>
          ${photo}
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

    const activeOpen = CATALOG.filter((item) => {
      if (!item.open || !item.jobId) return false;
      return isJobActive(OPEN_BY_ID[item.jobId]);
    }).length;

    if (openCountEl) {
      openCountEl.textContent = String(activeOpen);
    }
    if (openCountWrap) {
      openCountWrap.hidden = activeOpen < 1;
    }

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
            const job = item.jobId ? OPEN_BY_ID[item.jobId] : null;
            const stillOpen = Boolean(item.open && job && isJobActive(job));
            const closed = !stillOpen;
            const isOpenDetail = Boolean(job && stillOpen);
            const hasPlatform = Boolean(isOpenDetail && safeExternalUrl(job.link || job.externalUrl));
            const rowAttrs = isOpenDetail
              ? ` class="jobs-catalog__item is-openable${hasPlatform ? " has-platform" : ""}" tabindex="0" role="button" aria-expanded="false" data-job-toggle="${escapeHtml(item.jobId)}"`
              : ` class="jobs-catalog__item${closed ? " is-closed" : ""}"`;
            const platformHint = hasPlatform
              ? `<span class="jobs-catalog__platform-hint">${escapeHtml(externalLinkLabel(job.link))}</span>`
              : "";
            return `
              <li${rowAttrs}>
                <div class="jobs-catalog__row">
                  <div class="jobs-catalog__main">
                    <span class="jobs-catalog__title">${escapeHtml(item.title)}</span>
                    <span class="jobs-catalog__area">${escapeHtml(item.detail)}</span>
                  </div>
                  <div class="jobs-catalog__badges">
                    ${platformHint}
                    <span class="jobs-catalog__status">${stillOpen ? "Vacante abierta" : "Sin vacante activa"}</span>
                    ${isOpenDetail ? `<span class="jobs-catalog__chevron" aria-hidden="true"></span>` : ""}
                  </div>
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
    bindFlyerLightbox();
  }

  function ensureFlyerLightbox() {
    let dialog = document.getElementById("jobs-flyer-lightbox");
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.id = "jobs-flyer-lightbox";
    dialog.className = "jobs-flyer-lightbox";
    dialog.setAttribute("aria-label", "Flyer de vacante ampliado");
    dialog.innerHTML = `
      <form method="dialog" class="jobs-flyer-lightbox__bar">
        <p class="jobs-flyer-lightbox__title" id="jobs-flyer-lightbox-title">Flyer de vacante</p>
        <button type="submit" class="jobs-flyer-lightbox__close" aria-label="Cerrar">Cerrar</button>
      </form>
      <div class="jobs-flyer-lightbox__stage">
        <img id="jobs-flyer-lightbox-img" src="" alt="" width="1080" height="1350">
      </div>`;
    document.body.appendChild(dialog);

    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });

    return dialog;
  }

  function bindFlyerLightbox() {
    if (!catalogList) return;
    const dialog = ensureFlyerLightbox();
    const img = dialog.querySelector("#jobs-flyer-lightbox-img");
    const title = dialog.querySelector("#jobs-flyer-lightbox-title");

    catalogList.querySelectorAll("[data-flyer-src]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const src = btn.getAttribute("data-flyer-src");
        const alt = btn.getAttribute("data-flyer-alt") || "Flyer de vacante";
        if (!src || !img) return;
        img.src = src;
        img.alt = alt;
        if (title) title.textContent = alt;
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      });
    });
  }

  function bindCatalogToggles() {
    if (!catalogList) return;

    catalogList.querySelectorAll("[data-job-toggle]").forEach((row) => {
      const toggle = () => {
        const detail = row.querySelector(".jobs-catalog__detail");
        if (!detail) return;
        const willOpen = !row.classList.contains("is-expanded");

        if (willOpen) {
          catalogList.querySelectorAll(".jobs-catalog__item.is-expanded").forEach((other) => {
            if (other === row) return;
            other.classList.remove("is-expanded");
            other.setAttribute("aria-expanded", "false");
            const otherDetail = other.querySelector(".jobs-catalog__detail");
            if (otherDetail) otherDetail.hidden = true;
          });
        }

        row.classList.toggle("is-expanded", willOpen);
        detail.hidden = !willOpen;
        row.setAttribute("aria-expanded", willOpen ? "true" : "false");
      };

      row.addEventListener("click", (e) => {
        if (e.target.closest("a, button, [data-flyer-src]")) return;
        toggle();
      });

      row.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        if (e.target.closest("a, button, [data-flyer-src]")) return;
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
