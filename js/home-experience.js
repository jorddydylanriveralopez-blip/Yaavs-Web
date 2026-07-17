(function () {
  if (!document.body.classList.contains("page-home")) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.getElementById("home-experience");
  if (!root) return;

  /* Móvil: 1er tap = video preview, 2º tap = destino (debe registrarse antes que los modales) */
  const deckPreviewDesktopMq = window.matchMedia("(min-width: 769px)");
  let runMobileDeckPreview = null;

  document.addEventListener(
    "click",
    (event) => {
      if (deckPreviewDesktopMq.matches || reduced) return;
      const item = event.target.closest?.(".hx-svc-deck__item");
      if (!item || !root.contains(item)) return;
      if (item.closest('[role="dialog"]')) return;
      if (item.classList.contains("is-deck-preview")) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      if (typeof runMobileDeckPreview === "function") {
        runMobileDeckPreview(item);
      } else {
        item.classList.add("is-deck-preview");
      }
    },
    true
  );

  /* Revelar al scroll (excluye hx-pulse — tiene su propio ciclo) */
  const revealEls = [...root.querySelectorAll("[data-hx-reveal]")].filter(
    (el) => !el.closest(".hx-pulse")
  );
  if ("IntersectionObserver" in window && revealEls.length) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = reduced ? "0ms" : `${Math.min(i * 80, 400)}ms`;
      revealObs.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Contadores animados */
  function resetCount(el) {
    el._hxCountGen = (el._hxCountGen || 0) + 1;
    const suffix = el.dataset.hxSuffix || "";
    const format = el.dataset.hxFormat || "";
    if (format === "k") {
      el.textContent = "+0k";
    } else {
      el.textContent = "0" + suffix;
    }
  }

  function animateCount(el) {
    const target = Number(el.dataset.hxCount);
    if (!Number.isFinite(target)) return;
    const suffix = el.dataset.hxSuffix || "";
    const prefix = el.dataset.hxPrefix || "";
    const format = el.dataset.hxFormat || "";
    const duration = reduced ? 0 : 1800;
    const start = performance.now();
    const gen = (el._hxCountGen = (el._hxCountGen || 0) + 1);

    function tick(now) {
      if (el._hxCountGen !== gen) return;
      const t = duration ? Math.min(1, (now - start) / duration) : 1;
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      if (format === "k") {
        el.textContent = `+${Math.round(value / 1000)}k`;
      } else {
        el.textContent = prefix + value.toLocaleString("es-MX") + suffix;
      }
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const countEls = [...root.querySelectorAll("[data-hx-count]")].filter(
    (el) => !el.closest(".hx-pulse")
  );
  countEls.forEach((el) => {
    if (!("IntersectionObserver" in window)) {
      animateCount(el);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        animateCount(el);
        obs.disconnect();
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
  });

  /* Pulse — animación cada vez que entra o sale del viewport */
  const pulse = root.querySelector("[data-hx-pulse]");
  if (pulse) {
    const pulseItems = [...pulse.querySelectorAll("[data-hx-reveal]")];
    const pulseCounts = [...pulse.querySelectorAll("[data-hx-count]")];
    const multiNum = pulse.querySelector("[data-hx-stat-text]");

    function hidePulse() {
      pulse.classList.remove("is-live");
      pulseItems.forEach((el) => el.classList.remove("is-visible"));
      pulseCounts.forEach(resetCount);
      if (multiNum) multiNum.classList.remove("is-popping");
    }

    function showPulse() {
      pulse.classList.add("is-live");
      pulseItems.forEach((el, i) => {
        el.classList.remove("is-visible");
        el.style.transitionDelay = reduced ? "0ms" : `${Math.min(i * 110, 550)}ms`;
        void el.offsetWidth;
        el.classList.add("is-visible");
      });
      pulseCounts.forEach((el, i) => {
        resetCount(el);
        window.setTimeout(
          () => animateCount(el),
          reduced ? 0 : 180 + i * 120
        );
      });
      if (multiNum) {
        multiNum.classList.remove("is-popping");
        void multiNum.offsetWidth;
        window.setTimeout(
          () => multiNum.classList.add("is-popping"),
          reduced ? 0 : 420
        );
      }
    }

    if ("IntersectionObserver" in window) {
      const pulseObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) showPulse();
            else hidePulse();
          });
        },
        { threshold: 0.32, rootMargin: "0px 0px -8% 0px" }
      );
      pulseObs.observe(pulse);
    } else {
      showPulse();
    }
  }

  /* Pilares legacy (por si quedara en otra página) */
  const pillars = root.querySelector("[data-hx-pillars]");
  if (pillars) {
    const tabs = pillars.querySelectorAll(".hx-pillars__tab");
    const panels = pillars.querySelectorAll(".hx-pillars__panel");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.dataset.pillar;
        tabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
        });
        panels.forEach((p) => {
          const active = p.dataset.pillar === id;
          p.classList.toggle("is-active", active);
          p.hidden = !active;
        });
        window.YaavsSonic?.play?.();
      });
    });
  }

  /* Carril servicios — autoplay, tilt y panel flotante */
  const rail = root.querySelector("[data-hx-rail]");
  const panel = root.querySelector("[data-hx-svc-panel]");
  const panelSheet = panel?.querySelector(".hx-svc-panel__sheet");
  const panelIcon = panel?.querySelector("[data-hx-svc-panel-icon]");
  const panelKicker = panel?.querySelector("[data-hx-svc-panel-kicker]");
  const panelTitle = panel?.querySelector("[data-hx-svc-panel-title]");
  const panelDesc = panel?.querySelector("[data-hx-svc-panel-desc]");
  const panelSteps = panel?.querySelector("[data-hx-svc-panel-steps]");
  const panelLink = panel?.querySelector("[data-hx-svc-panel-link]");

  const SERVICE_PANELS = {
    prepago: {
      theme: "gold",
      kicker: "Alta demanda",
      icon: "assets/operadores/bait.jpg",
      title: "Prepago",
      desc: "Vende chips, paquetes y recargas de alta rotacion para acelerar ventas diarias en tu punto YAAVS.",
      steps: [
        "Valida inventario de SIM prepago disponibles por operador.",
        "Abre RecargaKlic y selecciona activacion prepago.",
        "Captura datos del cliente y completa la activacion de la linea.",
        "Ofrece paquete inicial y confirma que el saldo quede aplicado.",
      ],
      link: { href: "servicios.html", label: "Ver servicios prepago" },
    },
    postpago: {
      theme: "navy",
      kicker: "Plan mensual",
      icon: "assets/operadores/att.jpg",
      title: "Postpago",
      desc: "Gestiona altas y renovaciones postpago con seguimiento comercial y respaldo operativo YAAVS.",
      steps: [
        "Identifica el perfil del cliente y el plan postpago adecuado.",
        "Reune documentacion requerida y valida datos del titular.",
        "Registra la solicitud en la plataforma indicada por el operador.",
        "Da seguimiento al alta y confirma activacion con el cliente.",
      ],
      link: { href: "servicios.html", label: "Ver flujo postpago" },
    },
    recargaklic: {
      theme: "green",
      kicker: "App oficial",
      icon: "assets/servicios/activaciones.jpg",
      title: "RecargaKlic",
      desc: "Controla activaciones, recargas y operacion diaria desde una sola app para tu mostrador.",
      steps: [
        "Inicia sesion en RecargaKlic con tu cuenta de Yaavser.",
        "Selecciona el modulo: activaciones, recargas o consulta.",
        "Ejecuta la operacion y revisa el folio de confirmacion.",
        "Guarda comprobantes para control y soporte posterior.",
      ],
      link: { href: "#recargaklic-modal", label: "Descargar app" },
    },
    "tiempo-aire": {
      theme: "violet",
      icon: "assets/servicios/tiempo-aire.jpg",
      title: "Tiempo aire",
      desc: "Recargas de Telcel, AT&T, Movistar, Unefon y mas desde un solo punto de venta.",
      steps: [
        "Abre RecargaKlic y entra al modulo de tiempo aire o recargas.",
        "Elige la compañia y el monto que solicita el cliente.",
        "Ingresa el numero a recargar y confirma la operacion.",
        "Entrega ticket o comprobante; el saldo se refleja al instante.",
      ],
      link: { href: "recargar.html", label: "Recargar en YAAVS" },
    },
    portabilidad: {
      theme: "navy",
      icon: "assets/servicios/portabilidad.jpg",
      title: "Portabilidad",
      desc: "Cambia el numero de tus clientes de una compañia a otra con respaldo de la red YAAVS.",
      steps: [
        "Solicita al cliente su NIP y verifica que la linea este activa.",
        "Ingresa a RecargaKlic o al portal YAAVS con tus credenciales.",
        "Captura datos del cliente y del operador de origen y destino.",
        "Confirma la portabilidad y entrega comprobante al cliente.",
      ],
      link: { href: "#porta-modal", label: "Elegir compañía" },
    },
    activaciones: {
      theme: "gold",
      kicker: "RecargaKlic",
      icon: "assets/servicios/activaciones.jpg",
      title: "Activaciones",
      desc: "Activa SIM en minutos desde RecargaKlic: menos filas, mas ventas y comisiones claras.",
      steps: [
        "Abre RecargaKlic en tu celular o tablet del mostrador.",
        "Escanea o ingresa el ICCID de la SIM que vas a activar.",
        "Selecciona operador, plan y datos del cliente segun el flujo.",
        "Finaliza la activacion y guarda el comprobante para soporte.",
      ],
      link: { href: "#activaciones-modal", label: "Elegir compañía" },
    },
    "soporte-tecnico": {
      theme: "coral",
      icon: "assets/hero-telecom/hero-telecom-5.jpg",
      title: "Soporte tecnico",
      desc: "Resuelve fallas de operacion y incidencias para mantener tu tienda activa y productiva.",
      steps: [
        "Detecta la incidencia y registra evidencias basicas del caso.",
        "Levanta el folio con datos de linea, equipo o transaccion.",
        "Comparte informacion con soporte YAAVS por el canal oficial.",
        "Da seguimiento hasta el cierre y confirma solucion con cliente.",
      ],
      link: { href: "contacto.html", label: "Solicitar soporte tecnico" },
    },
    rotulaciones: {
      theme: "green",
      icon: "assets/hero-telecom/hero-portada-campeones.jpg",
      title: "Rotulaciones",
      desc: "Mejora la imagen de tu negocio con rotulacion comercial alineada a la identidad YAAVS.",
      steps: [
        "Comparte fotos y medidas actuales de tu punto de venta.",
        "Define con YAAVS el concepto visual y materiales requeridos.",
        "Aprueba propuesta final de imagen y ubicacion de piezas.",
        "Programa instalacion y valida acabado final en sitio.",
      ],
      link: { href: "#rotulaciones-modal", label: "Ver rotulaciones" },
    },
    "academia-yaavs": {
      theme: "violet",
      kicker: "Formacion",
      icon: "assets/quienes-somos-small-1.png",
      title: "Academia YAAVS",
      desc: "Capacitacion practica para ventas, atencion al cliente y ejecucion comercial en tienda.",
      steps: [
        "Revisa calendario de sesiones disponibles en Academia YAAVS.",
        "Inscribe a tu equipo por modulo segun su rol comercial.",
        "Completa entrenamientos y actividades de aplicacion en tienda.",
        "Mide resultados en conversion, ticket y calidad de atencion.",
      ],
      link: { href: "https://academiayaavs.com/", label: "Ir a Academia YAAVS" },
    },
    esims: {
      theme: "green",
      kicker: "RecargaKlic",
      icon: "assets/servicios/esim.jpg",
      title: "eSIMs",
      desc: "Activa lineas digitales sin chip fisico. Confirma compatibilidad eSIM y elige AT&T, Movistar o BAIT.",
      steps: [
        "Confirma que el equipo del cliente sea compatible con eSIM.",
        "Elige la compania: AT&T, Movistar o BAIT.",
        "Abre el portal oficial con el QR o el boton del panel.",
        "Escanea el codigo QR de activacion con Wi-Fi y verifica senal.",
      ],
      link: { href: "#esim-modal", label: "Ver eSIM por compania" },
    },
    vinculaciones: {
      theme: "coral",
      icon: "assets/servicios/vinculaciones.jpg",
      title: "Vinculaciones",
      desc: "Guia a tus clientes a vincular su linea en AT&T, Movistar o BAIT con pasos claros por compania.",
      steps: [
        "Elige la compania del cliente: AT&T, Movistar o BAIT.",
        "Revisa juntos los pasos especificos de esa compania.",
        "Escanea el QR o abre el portal oficial de vinculacion.",
        "Confirma que el cliente complete el tramite y conserve el comprobante.",
      ],
      link: { href: "#vinculaciones-modal", label: "Ver como vincular" },
    },
  };

  let lastFocusedBeforePanel = null;

  function openServicePanel(id) {
    const data = SERVICE_PANELS[id];
    if (!data || !panel || !panelSheet) return;

    panelSheet.classList.remove(
      "hx-svc-panel__sheet--navy",
      "hx-svc-panel__sheet--gold",
      "hx-svc-panel__sheet--green",
      "hx-svc-panel__sheet--violet",
      "hx-svc-panel__sheet--coral"
    );
    panelSheet.classList.add(`hx-svc-panel__sheet--${data.theme}`);

    if (panelIcon) {
      panelIcon.src = data.icon;
      panelIcon.alt = "";
      panelIcon.hidden = false;
    }

    if (panelKicker) {
      if (data.kicker) {
        panelKicker.textContent = data.kicker;
        panelKicker.hidden = false;
      } else {
        panelKicker.hidden = true;
      }
    }

    if (panelTitle) panelTitle.textContent = data.title;
    if (panelDesc) panelDesc.textContent = data.desc;

    if (panelSteps) {
      panelSteps.innerHTML = data.steps.map((step) => `<li>${step}</li>`).join("");
    }

    if (panelLink && data.link) {
      panelLink.href = data.link.href;
      panelLink.textContent = data.link.label;
    }

    lastFocusedBeforePanel = document.activeElement;
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
    panel.classList.add("is-open");
    document.body.classList.add("hx-svc-panel-open");
    window.YaavsSonic?.play?.();

    window.requestAnimationFrame(() => {
      panel.querySelector("[data-hx-svc-panel-close]")?.focus();
    });
  }

  function closeServicePanel() {
    if (!panel?.classList.contains("is-open")) return;
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("hx-svc-panel-open");

    window.setTimeout(() => {
      if (!panel.classList.contains("is-open")) {
        panel.hidden = true;
      }
    }, 320);

    if (lastFocusedBeforePanel && typeof lastFocusedBeforePanel.focus === "function") {
      lastFocusedBeforePanel.focus();
    }
  }

  /* Modal de portabilidad — elige compañía (AT&T / Movistar / BAIT) */
  const portaModal = root.querySelector("[data-hx-porta-modal]");
  if (portaModal) {
    let portaLastFocus = null;

    function openPortaModal() {
      portaLastFocus = document.activeElement;
      portaModal.hidden = false;
      portaModal.removeAttribute("hidden");
      portaModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("hx-svc-panel-open");
      portaModal.classList.add("is-open");
      try {
        window.YaavsSonic?.play?.();
      } catch (_) {
        /* noop */
      }
      window.requestAnimationFrame(() => {
        portaModal.querySelector(".hx-porta-modal__close")?.focus?.();
      });
    }

    function closePortaModal() {
      if (!portaModal.classList.contains("is-open") && portaModal.hidden) return;
      portaModal.classList.remove("is-open");
      portaModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("hx-svc-panel-open");
      window.setTimeout(() => {
        if (!portaModal.classList.contains("is-open")) {
          portaModal.hidden = true;
          portaModal.setAttribute("hidden", "");
        }
      }, 320);
      if (portaLastFocus && typeof portaLastFocus.focus === "function") {
        portaLastFocus.focus();
      }
    }

    portaModal.querySelectorAll("[data-hx-porta-close]").forEach((el) => {
      el.addEventListener("click", closePortaModal);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && portaModal.classList.contains("is-open")) {
        closePortaModal();
      }
    });

    function onPortaOpenIntent(event) {
      const item = event.target.closest?.(
        '[data-hx-porta-open], [data-deck-svc="portabilidad"]'
      );
      if (!item || item.closest(".hx-porta-modal")) return;
      event.preventDefault();
      if (portaModal.classList.contains("is-open")) return;
      openPortaModal();
    }

    document.addEventListener("click", onPortaOpenIntent, true);

    if (window.location.hash === "#porta-modal") {
      window.requestAnimationFrame(openPortaModal);
    }

    window.addEventListener("hashchange", () => {
      if (window.location.hash === "#porta-modal") openPortaModal();
    });
  }

  /* Modal activaciones — elige compañía (AT&T / Movistar / BAIT / Unefon) */
  const actModal = root.querySelector("[data-hx-act-modal]");
  if (actModal) {
    let actLastFocus = null;

    function openActModal() {
      actLastFocus = document.activeElement;
      actModal.hidden = false;
      actModal.removeAttribute("hidden");
      actModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("hx-svc-panel-open");
      actModal.classList.add("is-open");
      try {
        window.YaavsSonic?.play?.();
      } catch (_) {
        /* noop */
      }
      window.requestAnimationFrame(() => {
        actModal.querySelector(".hx-act-modal__close")?.focus?.();
      });
    }

    function closeActModal() {
      if (!actModal.classList.contains("is-open") && actModal.hidden) return;
      actModal.classList.remove("is-open");
      actModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("hx-svc-panel-open");
      window.setTimeout(() => {
        if (!actModal.classList.contains("is-open")) {
          actModal.hidden = true;
          actModal.setAttribute("hidden", "");
        }
      }, 320);
      if (actLastFocus && typeof actLastFocus.focus === "function") {
        actLastFocus.focus();
      }
    }

    actModal.querySelectorAll("[data-hx-act-close]").forEach((el) => {
      el.addEventListener("click", closeActModal);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && actModal.classList.contains("is-open")) {
        closeActModal();
      }
    });

    function onActOpenIntent(event) {
      const item = event.target.closest?.(
        '[data-hx-act-open], [data-deck-svc="activaciones"]'
      );
      if (!item || item.closest(".hx-act-modal")) return;
      event.preventDefault();
      if (actModal.classList.contains("is-open")) return;
      openActModal();
    }

    document.addEventListener("click", onActOpenIntent, true);

    if (window.location.hash === "#activaciones-modal") {
      window.requestAnimationFrame(openActModal);
    }

    window.addEventListener("hashchange", () => {
      if (window.location.hash === "#activaciones-modal") openActModal();
    });
  }

  /* Modal RecargaKlic — Android / iOS store */
  const rkModal = root.querySelector("[data-hx-rk-modal]");
  if (rkModal) {
    const RK_ANDROID =
      "https://play.google.com/store/apps/details?id=mx.com.yaavs.recargaklic";
    const RK_IOS = "https://apps.apple.com/app/id6470101781";
    let rkLastFocus = null;

    const iosLink = rkModal.querySelector('[data-hx-rk-store="ios"]');
    if (RK_IOS && iosLink) {
      iosLink.href = RK_IOS;
      iosLink.target = "_blank";
      iosLink.rel = "noopener noreferrer";
      iosLink.classList.remove("is-soon");
      iosLink.removeAttribute("aria-disabled");
      iosLink.setAttribute("aria-label", "Descargar RecargaKlic en App Store");
      const cta = iosLink.querySelector(".hx-act-modal__option-cta");
      if (cta) cta.textContent = "App Store →";
    }

    function openRkModal() {
      rkLastFocus = document.activeElement;
      rkModal.hidden = false;
      rkModal.removeAttribute("hidden");
      rkModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("hx-svc-panel-open");
      rkModal.classList.add("is-open");
      try {
        window.YaavsSonic?.play?.();
      } catch (_) {
        /* noop */
      }
      window.requestAnimationFrame(() => {
        rkModal.querySelector(".hx-act-modal__close")?.focus?.();
      });
    }

    function closeRkModal() {
      if (!rkModal.classList.contains("is-open") && rkModal.hidden) return;
      rkModal.classList.remove("is-open");
      rkModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("hx-svc-panel-open");
      window.setTimeout(() => {
        if (!rkModal.classList.contains("is-open")) {
          rkModal.hidden = true;
          rkModal.setAttribute("hidden", "");
        }
      }, 320);
      if (rkLastFocus && typeof rkLastFocus.focus === "function") {
        rkLastFocus.focus();
      }
    }

    function isAndroidUa() {
      return /android/i.test(navigator.userAgent || "");
    }

    function isIosUa() {
      return /iPad|iPhone|iPod/i.test(navigator.userAgent || "");
    }

    rkModal.querySelectorAll("[data-hx-rk-close]").forEach((el) => {
      el.addEventListener("click", closeRkModal);
    });

    iosLink?.addEventListener("click", (e) => {
      if (!RK_IOS || iosLink.classList.contains("is-soon")) {
        e.preventDefault();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && rkModal.classList.contains("is-open")) {
        closeRkModal();
      }
    });

    function onRkOpenIntent(event) {
      const item = event.target.closest?.(
        '[data-hx-rk-open], [data-deck-svc="recargaklic"]'
      );
      if (!item || item.closest("[data-hx-rk-modal]")) return;
      event.preventDefault();

      if (isAndroidUa()) {
        window.open(RK_ANDROID, "_blank", "noopener,noreferrer");
        return;
      }
      if (isIosUa() && RK_IOS) {
        window.open(RK_IOS, "_blank", "noopener,noreferrer");
        return;
      }
      if (rkModal.classList.contains("is-open")) return;
      openRkModal();
    }

    document.addEventListener("click", onRkOpenIntent, true);

    if (window.location.hash === "#recargaklic-modal") {
      window.requestAnimationFrame(openRkModal);
    }

    window.addEventListener("hashchange", () => {
      if (window.location.hash === "#recargaklic-modal") openRkModal();
    });
  }

  /* Modal rotulaciones — carrusel de 6 ejemplos */
  const rotulModal = root.querySelector("[data-hx-rotul-modal]");
  if (rotulModal) {
    let rotulLastFocus = null;
    let rotulIndex = 0;
    const slides = [...rotulModal.querySelectorAll("[data-hx-rotul-slide]")];
    const dots = [...rotulModal.querySelectorAll("[data-hx-rotul-dot]")];
    const indexEl = rotulModal.querySelector("[data-hx-rotul-index]");
    const total = slides.length || 6;

    function goRotulSlide(next) {
      if (!slides.length) return;
      rotulIndex = ((next % total) + total) % total;
      slides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === rotulIndex);
      });
      dots.forEach((dot, i) => {
        const on = i === rotulIndex;
        dot.classList.toggle("is-active", on);
        dot.setAttribute("aria-selected", on ? "true" : "false");
      });
      if (indexEl) indexEl.textContent = String(rotulIndex + 1);
    }

    function openRotulModal() {
      rotulLastFocus = document.activeElement;
      goRotulSlide(0);
      rotulModal.hidden = false;
      rotulModal.removeAttribute("hidden");
      rotulModal.setAttribute("aria-hidden", "false");
      window.requestAnimationFrame(() => rotulModal.classList.add("is-open"));
      document.body.classList.add("hx-svc-panel-open");
      window.YaavsSonic?.play?.();
      window.requestAnimationFrame(() => {
        rotulModal.querySelector(".hx-rotul-modal__close")?.focus();
      });
    }

    function closeRotulModal() {
      if (!rotulModal.classList.contains("is-open") && rotulModal.hidden) return;
      rotulModal.classList.remove("is-open");
      rotulModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("hx-svc-panel-open");
      window.setTimeout(() => {
        if (!rotulModal.classList.contains("is-open")) {
          rotulModal.hidden = true;
          rotulModal.setAttribute("hidden", "");
        }
      }, 300);
      if (rotulLastFocus && typeof rotulLastFocus.focus === "function") {
        rotulLastFocus.focus();
      }
    }

    rotulModal.querySelectorAll("[data-hx-rotul-close]").forEach((el) => {
      el.addEventListener("click", closeRotulModal);
    });

    rotulModal.querySelector("[data-hx-rotul-prev]")?.addEventListener("click", () => {
      goRotulSlide(rotulIndex - 1);
    });
    rotulModal.querySelector("[data-hx-rotul-next]")?.addEventListener("click", () => {
      goRotulSlide(rotulIndex + 1);
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const i = Number(dot.getAttribute("data-hx-rotul-dot"));
        if (!Number.isNaN(i)) goRotulSlide(i);
      });
    });

    /* Swipe en el viewport del carrusel */
    const viewport = rotulModal.querySelector(".hx-rotul-carousel__viewport");
    if (viewport) {
      let touchX = null;
      viewport.addEventListener(
        "touchstart",
        (e) => {
          touchX = e.changedTouches?.[0]?.clientX ?? null;
        },
        { passive: true }
      );
      viewport.addEventListener(
        "touchend",
        (e) => {
          if (touchX == null) return;
          const endX = e.changedTouches?.[0]?.clientX ?? touchX;
          const delta = endX - touchX;
          touchX = null;
          if (Math.abs(delta) < 40) return;
          goRotulSlide(rotulIndex + (delta < 0 ? 1 : -1));
        },
        { passive: true }
      );
    }

    document.addEventListener("keydown", (e) => {
      if (!rotulModal.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        closeRotulModal();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goRotulSlide(rotulIndex - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goRotulSlide(rotulIndex + 1);
      }
    });

    document.addEventListener(
      "click",
      (event) => {
        const item = event.target.closest(
          '[data-hx-rotul-open], [data-deck-svc="rotulaciones"]'
        );
        if (!item || item.closest(".hx-rotul-modal")) return;
        event.preventDefault();
        if (!rotulModal.classList.contains("is-open")) openRotulModal();
      },
      true
    );

    if (window.location.hash === "#rotulaciones-modal") {
      window.requestAnimationFrame(openRotulModal);
    }

    window.addEventListener("hashchange", () => {
      if (window.location.hash === "#rotulaciones-modal") openRotulModal();
    });
  }

  /* Modal vinculaciones — pasos + QR por compañía */
  const vincModal = root.querySelector("[data-hx-vinc-modal]");
  if (vincModal) {
    let vincLastFocus = null;
    const carrierTabs = [...vincModal.querySelectorAll("[data-hx-vinc-carrier]")];
    const carrierPanels = [...vincModal.querySelectorAll("[data-hx-vinc-panel]")];

    function setVincCarrier(id) {
      const next = id || "att";
      carrierTabs.forEach((tab) => {
        const on = tab.getAttribute("data-hx-vinc-carrier") === next;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });
      carrierPanels.forEach((panelEl) => {
        const on = panelEl.getAttribute("data-hx-vinc-panel") === next;
        panelEl.classList.toggle("is-active", on);
        if (on) {
          panelEl.removeAttribute("hidden");
        } else {
          panelEl.setAttribute("hidden", "");
        }
      });
    }

    function openVincModal() {
      vincLastFocus = document.activeElement;
      setVincCarrier("att");
      vincModal.hidden = false;
      vincModal.removeAttribute("hidden");
      vincModal.setAttribute("aria-hidden", "false");
      window.requestAnimationFrame(() => vincModal.classList.add("is-open"));
      document.body.classList.add("hx-svc-panel-open");
      window.YaavsSonic?.play?.();
      window.requestAnimationFrame(() => {
        vincModal.querySelector(".hx-vinc-modal__close")?.focus();
      });
    }

    function closeVincModal() {
      if (!vincModal.classList.contains("is-open") && vincModal.hidden) return;
      vincModal.classList.remove("is-open");
      vincModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("hx-svc-panel-open");
      window.setTimeout(() => {
        if (!vincModal.classList.contains("is-open")) {
          vincModal.hidden = true;
          vincModal.setAttribute("hidden", "");
        }
      }, 300);
      if (vincLastFocus && typeof vincLastFocus.focus === "function") {
        vincLastFocus.focus();
      }
    }

    vincModal.querySelectorAll("[data-hx-vinc-close]").forEach((el) => {
      el.addEventListener("click", closeVincModal);
    });

    carrierTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setVincCarrier(tab.getAttribute("data-hx-vinc-carrier"));
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && vincModal.classList.contains("is-open")) {
        closeVincModal();
      }
    });

    document.addEventListener(
      "click",
      (event) => {
        const item = event.target.closest(
          '[data-hx-vinc-open], [data-deck-svc="vinculaciones"]'
        );
        if (!item || item.closest(".hx-vinc-modal")) return;
        event.preventDefault();
        if (!vincModal.classList.contains("is-open")) openVincModal();
      },
      true
    );

    if (window.location.hash === "#vinculaciones-modal") {
      window.requestAnimationFrame(openVincModal);
    }

    window.addEventListener("hashchange", () => {
      if (window.location.hash === "#vinculaciones-modal") openVincModal();
    });
  }

  /* Modal eSIM — portales oficiales por compañía */
  const esimModal = root.querySelector("[data-hx-esim-modal]");
  if (esimModal) {
    let esimLastFocus = null;
    const esimTabs = [...esimModal.querySelectorAll("[data-hx-esim-carrier]")];
    const esimPanels = [...esimModal.querySelectorAll("[data-hx-esim-panel]")];

    function setEsimCarrier(id) {
      const next = id || "att";
      esimTabs.forEach((tab) => {
        const on = tab.getAttribute("data-hx-esim-carrier") === next;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });
      esimPanels.forEach((panelEl) => {
        const on = panelEl.getAttribute("data-hx-esim-panel") === next;
        panelEl.classList.toggle("is-active", on);
        if (on) {
          panelEl.removeAttribute("hidden");
        } else {
          panelEl.setAttribute("hidden", "");
        }
      });
    }

    function openEsimModal() {
      esimLastFocus = document.activeElement;
      setEsimCarrier("att");
      esimModal.hidden = false;
      esimModal.removeAttribute("hidden");
      esimModal.setAttribute("aria-hidden", "false");
      window.requestAnimationFrame(() => esimModal.classList.add("is-open"));
      document.body.classList.add("hx-svc-panel-open");
      window.YaavsSonic?.play?.();
      window.requestAnimationFrame(() => {
        esimModal.querySelector(".hx-esim-modal__close")?.focus();
      });
    }

    function closeEsimModal() {
      if (!esimModal.classList.contains("is-open") && esimModal.hidden) return;
      esimModal.classList.remove("is-open");
      esimModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("hx-svc-panel-open");
      window.setTimeout(() => {
        if (!esimModal.classList.contains("is-open")) {
          esimModal.hidden = true;
          esimModal.setAttribute("hidden", "");
        }
      }, 300);
      if (esimLastFocus && typeof esimLastFocus.focus === "function") {
        esimLastFocus.focus();
      }
    }

    esimModal.querySelectorAll("[data-hx-esim-close]").forEach((el) => {
      el.addEventListener("click", closeEsimModal);
    });

    esimTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setEsimCarrier(tab.getAttribute("data-hx-esim-carrier"));
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && esimModal.classList.contains("is-open")) {
        closeEsimModal();
      }
    });

    document.addEventListener(
      "click",
      (event) => {
        const item = event.target.closest(
          '[data-hx-esim-open], [data-deck-svc="esims"]'
        );
        if (!item || item.closest(".hx-esim-modal")) return;
        event.preventDefault();
        if (!esimModal.classList.contains("is-open")) openEsimModal();
      },
      true
    );

    if (window.location.hash === "#esim-modal") {
      window.requestAnimationFrame(openEsimModal);
    }

    window.addEventListener("hashchange", () => {
      if (window.location.hash === "#esim-modal") openEsimModal();
    });
  }

  if (panel) {
    panel.querySelectorAll("[data-hx-svc-panel-close]").forEach((el) => {
      el.addEventListener("click", closeServicePanel);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && panel.classList.contains("is-open")) {
        closeServicePanel();
      }
    });
  }

  if (rail) {
    const isGridRail =
      rail.dataset.hxRailLayout === "grid" ||
      rail.classList.contains("hx-services__rail--grid") ||
      Boolean(rail.closest(".hx-services--catalog"));
    const baseCards = [...rail.querySelectorAll(".hx-svc:not([data-hx-loop-clone])")];

    if (!reduced && !isGridRail && baseCards.length > 2 && !rail.dataset.hxLoopReady) {
      const fragment = document.createDocumentFragment();
      baseCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.dataset.hxLoopClone = "true";
        clone.tabIndex = -1;
        clone.setAttribute("aria-hidden", "true");
        fragment.appendChild(clone);
      });
      rail.appendChild(fragment);
      rail.dataset.hxLoopReady = "true";
    }

    rail.addEventListener("click", (event) => {
      const card = event.target.closest("[data-hx-svc]");
      if (!card || !rail.contains(card)) return;
      openServicePanel(card.dataset.hxSvc);
    });

    if (!reduced && !isGridRail && rail.dataset.hxLoopReady === "true") {
      let rafId = 0;
      let paused = false;
      let resumeTimeout = 0;

      const getLoopSize = () => rail.scrollWidth / 2;

      const normalizePosition = () => {
        const size = getLoopSize();
        if (size <= 0) return;
        if (rail.scrollLeft <= 0) {
          rail.scrollLeft += size;
        } else if (rail.scrollLeft >= size) {
          rail.scrollLeft -= size;
        }
      };

      const setPaused = (value, delay = 0) => {
        if (resumeTimeout) {
          window.clearTimeout(resumeTimeout);
          resumeTimeout = 0;
        }
        if (!value && delay > 0) {
          resumeTimeout = window.setTimeout(() => {
            paused = false;
            resumeTimeout = 0;
          }, delay);
          return;
        }
        paused = value;
      };

      const tick = () => {
        if (!paused) {
          rail.scrollLeft -= 0.55;
          normalizePosition();
        }
        rafId = window.requestAnimationFrame(tick);
      };

      window.requestAnimationFrame(() => {
        rail.scrollLeft = Math.max(getLoopSize(), 1);
        rafId = window.requestAnimationFrame(tick);
      });

      rail.addEventListener("mouseenter", () => setPaused(true));
      rail.addEventListener("mouseleave", () => setPaused(false));
      rail.addEventListener("focusin", () => setPaused(true));
      rail.addEventListener("focusout", () => setPaused(false, 160));
      rail.addEventListener("pointerdown", () => setPaused(true));
      rail.addEventListener("pointerup", () => setPaused(false, 1200));
      rail.addEventListener("touchstart", () => setPaused(true), { passive: true });
      rail.addEventListener("touchend", () => setPaused(false, 1200), { passive: true });

      window.addEventListener(
        "resize",
        () => {
          const size = getLoopSize();
          if (size > 0 && rail.scrollLeft < size * 0.5) {
            rail.scrollLeft = size;
          }
        },
        { passive: true }
      );

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          setPaused(true);
        } else {
          setPaused(false, 120);
        }
      });

      window.addEventListener("beforeunload", () => {
        if (rafId) window.cancelAnimationFrame(rafId);
      });
    }
  }

  if (rail && !reduced) {
    const isGridRail =
      rail.dataset.hxRailLayout === "grid" ||
      rail.classList.contains("hx-services__rail--grid") ||
      Boolean(rail.closest(".hx-services--catalog"));

    rail.querySelectorAll(".hx-svc:not([data-hx-loop-clone])").forEach((card) => {
      const glow = card.querySelector(".hx-svc__glow");

      card.addEventListener("mouseenter", () => {
        card.classList.add("is-hover");
      });

      if (!isGridRail) {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const mx = ((e.clientX - rect.left) / rect.width) * 100;
          const my = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty("--mx", `${mx}%`);
          card.style.setProperty("--my", `${my}%`);
          const tiltX = (my - 50) * -0.28;
          const tiltY = (mx - 50) * 0.28;
          card.style.setProperty("--rx", `${tiltX}deg`);
          card.style.setProperty("--ry", `${tiltY}deg`);
          if (glow) glow.style.opacity = "1";
        });
      }

      card.addEventListener("mouseleave", () => {
        card.classList.remove("is-hover");
        card.style.removeProperty("--rx");
        card.style.removeProperty("--ry");
        card.style.removeProperty("--mx");
        card.style.removeProperty("--my");
        if (glow) glow.style.opacity = "";
      });

      card.addEventListener("focus", () => card.classList.add("is-hover"));
      card.addEventListener("blur", () => card.classList.remove("is-hover"));
    });
  }

  /* Operadores — acordeón expandible (intro + clic) */
  const opsDeck = root.querySelector("[data-hx-ops]");
  if (opsDeck) {
    const opCards = opsDeck.querySelectorAll(".hx-ops__card");
    const introCard = opsDeck.querySelector('[data-hx-op="intro"]');
    const carrierCards = Array.from(opCards).filter((card) => card.dataset.hxOp !== "intro");
    const opsGrid = opsDeck.querySelector(".hx-ops__grid");
    const opsToggle = opsDeck.querySelector("[data-hx-ops-toggle]");
    const opsBack = opsDeck.querySelector(".hx-ops__back");
    const opsPicker = opsDeck.querySelector("[data-hx-ops-picker]");
    const opsPickerOpen = opsDeck.querySelector("[data-hx-ops-picker-open]");
    const opsPickerClose = opsDeck.querySelectorAll("[data-hx-ops-picker-close]");
    const opsPickerOptions = opsDeck.querySelectorAll("[data-hx-ops-select]");
    const mobDetail = opsDeck.querySelector("[data-hx-ops-mob-detail]");
    const mobGuide = opsDeck.querySelector("[data-hx-ops-mob-guide]");
    const mobileOps = window.matchMedia("(max-width: 900px)");
    const desktopOpsScroll = window.matchMedia("(min-width: 901px)");
    const OPS_PEEK_KEY = "yaavs-hx-ops-peeked";
    const OPS_MOB_GUIDE_KEY = "yaavs-hx-ops-mob-guided";
    const scrollCards = [introCard, ...carrierCards].filter(Boolean);
    let scrollUserPicked = false;
    let scrollPickProgress = 0;
    let scrollTicking = false;
    let lastOpsProgress = 0;
    let opsScrollCompleted = false;

    function easeOpsScroll(t) {
      return 1 - Math.pow(1 - t, 2.4);
    }

    function getOpsScrollRange() {
      return window.innerHeight * 0.82 * Math.max(1, scrollCards.length - 1);
    }

    function getOpsScrollProgress() {
      const range = getOpsScrollRange();
      opsDeck.style.setProperty("--hx-ops-scroll-range", `${Math.round(range)}px`);
      const scrolled = -opsDeck.getBoundingClientRect().top;
      return Math.min(1, Math.max(0, scrolled / range));
    }

    function clearOpsScrollSequence() {
      if (!opsDeck.classList.contains("hx-ops--scroll-sequence")) return;

      const scrollYBefore = window.scrollY;
      const sectionTopBefore = opsDeck.offsetTop;
      const heightBefore = opsDeck.offsetHeight;
      const completed = lastOpsProgress >= 0.96;

      opsDeck.classList.remove("hx-ops--scroll-sequence");
      scrollCards.forEach((card) => card.style.removeProperty("--hx-ops-scroll-flex"));
      opsDeck.style.removeProperty("--hx-ops-scroll-range");
      const head = opsDeck.querySelector(".hx-ops__head");
      if (head) {
        head.style.removeProperty("opacity");
        head.style.removeProperty("transform");
      }

      resetOpsAfterScrollSequence();

      const heightAfter = opsDeck.offsetHeight;
      const delta = heightBefore - heightAfter;
      if (delta <= 1) return;

      const sectionTop = opsDeck.offsetTop;
      const naturalEnd = sectionTop + heightAfter;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      let targetScroll = scrollYBefore;

      if (
        completed &&
        scrollYBefore >= sectionTopBefore &&
        scrollYBefore <= sectionTopBefore + heightBefore - window.innerHeight * 0.12
      ) {
        /* Terminó el recorrido: quedar al inicio de la siguiente sección */
        targetScroll = naturalEnd;
      } else if (scrollYBefore > naturalEnd + 40) {
        /* Ya pasó compañías: conservar posición visual restando el padding eliminado */
        targetScroll = scrollYBefore - delta;
      } else if (scrollYBefore > sectionTopBefore + 40) {
        targetScroll = scrollYBefore - delta;
      }

      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

      if (Math.abs(targetScroll - scrollYBefore) > 2) {
        window.scrollTo(0, targetScroll);
      }
    }

    function resetOpsAfterScrollSequence() {
      if (scrollUserPicked) return;

      opsDeck.classList.remove("has-carrier-active");
      if (opsBack) opsBack.hidden = true;
      setOpsPickerOpen(false, { restoreFocus: false });
      syncOpsPreview();

      if (!introCard) return;
      scrollCards.forEach((card) => {
        const active = card === introCard;
        card.classList.toggle("is-active", active);
        card.setAttribute("aria-selected", String(active));
        card.tabIndex = active ? 0 : -1;
      });
    }

    function applyOpsScrollSequence(progress) {
      const n = scrollCards.length;
      const scaled = progress * (n - 1);
      const focusIndex = Math.min(n - 2, Math.max(0, Math.floor(scaled)));
      const t = scaled - focusIndex;

      scrollCards.forEach((card, i) => {
        let flex = 1;
        if (i === focusIndex) flex = 1 + (1 - easeOpsScroll(t)) * 3.2;
        else if (i === focusIndex + 1) flex = 1 + easeOpsScroll(t) * 3.2;
        card.style.setProperty("--hx-ops-scroll-flex", flex.toFixed(3));
      });

      const activeIndex = t > 0.5 ? Math.min(n - 1, focusIndex + 1) : focusIndex;
      const activeCard = scrollCards[activeIndex];
      scrollCards.forEach((card) => {
        const active = card === activeCard;
        card.classList.toggle("is-active", active);
        card.setAttribute("aria-selected", String(active));
        card.tabIndex = active ? 0 : -1;
      });

      const head = opsDeck.querySelector(".hx-ops__head");
      if (head) {
        head.style.opacity = String(Math.max(0.1, 1 - progress * 2.4));
        head.style.transform = `translateX(-50%) translateY(${Math.min(14, progress * 32)}px)`;
      }

      lastOpsProgress = progress;
    }

    function onOpsScroll() {
      clearOpsScrollSequence();
      opsScrollCompleted = false;
      lastOpsProgress = 0;
      scrollUserPicked = false;
    }

    function setOpsPickerOpen(open, { restoreFocus = true } = {}) {
      if (!opsPicker || !opsPickerOpen) return;

      opsPicker.hidden = !open;
      opsPickerOpen.setAttribute("aria-expanded", String(open));
      document.documentElement.classList.toggle("has-hx-ops-picker", open);
      document.body.classList.toggle("has-hx-ops-picker", open);

      if (open) {
        const firstOption = opsPicker.querySelector("[data-hx-ops-select]");
        requestAnimationFrame(() => firstOption?.focus());
      } else if (restoreFocus) {
        requestAnimationFrame(() => opsPickerOpen.focus());
      }
    }

    function dismissOpsPeek() {
      opsDeck.classList.remove("hx-ops--peek");
      try {
        localStorage.setItem(OPS_PEEK_KEY, "1");
      } catch (_) {
        /* storage optional */
      }
    }

    function initOpsPeek() {
      if (!desktopOpsScroll.matches) return;
      try {
        if (localStorage.getItem(OPS_PEEK_KEY)) return;
      } catch (_) {
        /* storage optional */
      }
      opsDeck.classList.add("hx-ops--peek");
    }

    function dismissOpsMobGuide() {
      opsDeck.classList.remove("hx-ops--mob-guide");
      try {
        localStorage.setItem(OPS_MOB_GUIDE_KEY, "1");
      } catch (_) {
        /* storage optional */
      }
    }

    function initOpsMobGuide() {
      if (!mobileOps.matches) return;
      try {
        if (localStorage.getItem(OPS_MOB_GUIDE_KEY)) return;
      } catch (_) {
        /* storage optional */
      }
      opsDeck.classList.add("hx-ops--mob-guide");
    }

    function clearMobDetail() {
      if (!mobDetail) return;
      mobDetail.hidden = true;
      mobDetail.innerHTML = "";
      mobDetail.removeAttribute("data-hx-op");
    }

    function renderMobDetail(card) {
      const panel = card?.querySelector(".hx-ops__card-panel");
      if (!panel || !mobDetail) return;

      mobDetail.hidden = false;
      mobDetail.dataset.hxOp = card.dataset.hxOp || "";
      mobDetail.innerHTML = `<div class="hx-ops__mob-detail-inner hx-ops__mob-detail-inner--${card.dataset.hxOp || "carrier"}">${panel.outerHTML}</div>`;

      requestAnimationFrame(() => {
        mobDetail.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }

    function clearMobSelection() {
      carrierCards.forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
        c.tabIndex = 0;
      });
      if (introCard) {
        introCard.classList.add("is-active");
        introCard.setAttribute("aria-selected", "true");
      }
      clearMobDetail();
      syncOpsState(introCard);
    }

    function activateOpMobile(card) {
      dismissOpsMobGuide();

      if (!card || card === introCard) {
        clearMobSelection();
        return;
      }

      if (card.classList.contains("is-active")) {
        clearMobSelection();
        return;
      }

      carrierCards.forEach((c) => {
        const active = c === card;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-selected", String(active));
        c.tabIndex = 0;
      });

      if (introCard) {
        introCard.classList.remove("is-active");
        introCard.setAttribute("aria-selected", "false");
      }

      renderMobDetail(card);
      setOpsPickerOpen(false, { restoreFocus: false });
      syncOpsState(card);
      window.YaavsSonic?.play?.();
    }

    function syncOpsPreview() {
      if (opsGrid) opsGrid.hidden = false;
      if (opsToggle) opsToggle.hidden = true;
    }

    function syncOpsState(card) {
      const isCarrier = Boolean(card?.dataset?.hxOp && card.dataset.hxOp !== "intro");
      opsDeck.classList.toggle("has-carrier-active", isCarrier);
      if (opsBack) opsBack.hidden = !(isCarrier && mobileOps.matches);
      if (!isCarrier) {
        setOpsPickerOpen(false, { restoreFocus: false });
      }
      syncOpsPreview();
    }

    function setAllOpsCardsInactive() {
      opCards.forEach((c) => {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
        c.tabIndex = -1;
      });
    }

    function activateOp(card) {
      dismissOpsPeek();

      if (mobileOps.matches) {
        activateOpMobile(card);
        return;
      }

      if (card?.classList.contains("is-active") && card.dataset.hxOp !== "intro") {
        card = introCard;
      }

      if (!card) card = introCard;

      opCards.forEach((c) => {
        const active = c === card;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-selected", String(active));
        c.tabIndex = active ? 0 : -1;
      });

      setOpsPickerOpen(false, { restoreFocus: false });
      syncOpsState(card);

      if (card?.dataset?.hxOp !== "intro") {
        window.YaavsSonic?.play?.();
      }
    }

    function applyInitialOpsState() {
      if (mobileOps.matches) {
        clearMobSelection();
        initOpsMobGuide();
        return;
      }
      activateOp(introCard || opCards[0]);
    }

    const CARRIER_SITE_URLS = {
      att: "https://www.att.com.mx/",
      unefon: "https://www.unefon.com.mx/",
      bait: "https://mibait.com/",
      movistar: "https://www.movistar.com.mx/",
    };

    function openCarrierSite(card) {
      const op = card?.dataset?.hxOp;
      if (!op || op === "intro") return false;
      const url = String(card.dataset.hxOpUrl || CARRIER_SITE_URLS[op] || "").trim();
      if (!url) return false;
      window.open(url, "_blank", "noopener,noreferrer");
      return true;
    }

    opsPickerOpen?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpsPickerOpen(true);
    });

    opsPickerClose.forEach((button) => {
      button.addEventListener("click", () => setOpsPickerOpen(false));
    });

    opsPickerOptions.forEach((button) => {
      button.addEventListener("click", () => {
        const targetCard = carrierCards.find((card) => card.dataset.hxOp === button.dataset.hxOpsSelect);
        if (targetCard) {
          if (openCarrierSite(targetCard)) return;
          activateOp(targetCard);
        }
      });
    });

    opsBack?.addEventListener("click", () => {
      activateOp(introCard);
    });

    const onMobileOpsChange = () => {
      setOpsPickerOpen(false, { restoreFocus: false });
      clearMobDetail();
      if (mobileOps.matches) {
        applyInitialOpsState();
      } else if (introCard) {
        activateOp(introCard);
      }
      initOpsPeek();
      initOpsMobGuide();
      syncOpsPreview();
    };

    if (typeof mobileOps.addEventListener === "function") {
      mobileOps.addEventListener("change", onMobileOpsChange);
    } else if (typeof mobileOps.addListener === "function") {
      mobileOps.addListener(onMobileOpsChange);
    }

    opsPicker?.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpsPickerOpen(false);
      }
    });

    opCards.forEach((card) => {
      const glow = card.querySelector(".hx-ops__card-glow");

      card.addEventListener("mousemove", (e) => {
        if (!glow) return;
        const rect = card.getBoundingClientRect();
        const mx = ((e.clientX - rect.left) / rect.width) * 100;
        const my = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty("--mx", `${mx}%`);
        card.style.setProperty("--my", `${my}%`);
      });

      card.addEventListener("click", (e) => {
        if (e.target.closest("a[href], button")) return;
        if (openCarrierSite(card)) return;
        if (mobileOps.matches && card === introCard) return;
        activateOp(card);
      });

      card.addEventListener("keydown", (e) => {
        const idx = Array.from(opCards).indexOf(card);
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (openCarrierSite(card)) return;
          activateOp(card);
          return;
        }
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          const next = opCards[(idx + 1) % opCards.length];
          activateOp(next);
          next.focus();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          const prev = opCards[(idx - 1 + opCards.length) % opCards.length];
          activateOp(prev);
          prev.focus();
        }
      });
    });

    initOpsPeek();
    initOpsMobGuide();
    applyInitialOpsState();

    window.addEventListener(
      "scroll",
      () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
          onOpsScroll();
          scrollTicking = false;
        });
      },
      { passive: true }
    );
    window.addEventListener("resize", onOpsScroll, { passive: true });
    if (typeof desktopOpsScroll.addEventListener === "function") {
      desktopOpsScroll.addEventListener("change", onOpsScroll);
    } else if (typeof desktopOpsScroll.addListener === "function") {
      desktopOpsScroll.addListener(onOpsScroll);
    }
    onOpsScroll();
  }

  /* Selector prepago / postpago — animación al navegar */
  const planLinks = root.querySelectorAll("[data-hx-plan-link]");
  let planNavTimer = null;

  function resetPlanPicker() {
    if (planNavTimer !== null) {
      window.clearTimeout(planNavTimer);
      planNavTimer = null;
    }
    planLinks.forEach((link, index) => {
      link.classList.remove("is-launching", "is-fading");
      if (!reduced) {
        link.classList.add("is-entered");
        link.style.transitionDelay = `${120 + index * 90}ms`;
      }
    });
  }

  planLinks.forEach((link, index) => {
    if (!reduced) {
      link.style.transitionDelay = `${120 + index * 90}ms`;
      link.classList.add("is-entered");
    }

    link.addEventListener("click", (event) => {
      if (reduced || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const href = link.getAttribute("href");
      if (!href) return;

      if (planNavTimer !== null) {
        window.clearTimeout(planNavTimer);
        planNavTimer = null;
      }

      link.classList.add("is-launching");
      planLinks.forEach((other) => {
        if (other !== link) other.classList.remove("is-launching");
        if (other !== link) other.classList.add("is-fading");
        else other.classList.remove("is-fading");
      });

      window.YaavsSonic?.play?.();

      planNavTimer = window.setTimeout(() => {
        planNavTimer = null;
        window.location.assign(href);
      }, reduced ? 0 : 420);
    });
  });

  /* Deck de servicios — square expand + video (desktop) / masonry (móvil) */
  const deckSection = root.querySelector(".hx-services--deck");
  const deckWrap = root.querySelector("[data-hx-deck-wrap]");
  const deckRoot = root.querySelector("[data-hx-svc-deck]");
  const deckMoreRoot = root.querySelector("[data-hx-svc-deck-more]");
  const deckLayout = deckWrap?.querySelector("[data-hx-deck-layout]");
  const deckMorePanel = deckWrap?.querySelector("[data-hx-deck-more-panel]");
  const deckMoreToggle = deckWrap?.querySelector("[data-hx-deck-more-toggle]");
  const deckMoreLabel = deckWrap?.querySelector("[data-hx-deck-more-label]");
  const deckDesktopMq = window.matchMedia("(min-width: 769px)");
  const deckMediaCfg = window.YAAVS_DECK_MEDIA || {};

  if (deckSection && deckRoot) {
    const getDeckItems = () => [...deckWrap.querySelectorAll(".hx-svc-deck__item")];
    let deckItems = getDeckItems();
    let deckLive = false;
    let deckStaggerTimer = null;
    let squareReady = false;
    const squareHandlers = new WeakMap();

    let masonryReady = false;
    let masonryEl = null;

    function teardownMobileMasonry() {
      if (!masonryReady) return;
      masonryReady = false;
      deckLayout?.classList.remove("is-deck-masonry-mob");

      const sorted = [...getDeckItems()].sort(
        (a, b) => Number(a.style.getPropertyValue("--deck-i") || 0) - Number(b.style.getPropertyValue("--deck-i") || 0)
      );
      sorted.slice(0, 5).forEach((item) => deckRoot.appendChild(item));
      sorted.slice(5).forEach((item) => deckMoreRoot?.appendChild(item));

      masonryEl?.remove();
      masonryEl = null;
      deckRoot.hidden = false;
      if (deckMorePanel) deckMorePanel.hidden = false;
    }

    let masonryBalanceTimer = null;

    function getMasonryCols() {
      if (!masonryEl) return [];
      return [
        masonryEl.querySelector('[data-masonry-col="left"]'),
        masonryEl.querySelector('[data-masonry-col="mid"]'),
        masonryEl.querySelector('[data-masonry-col="right"]'),
      ].filter(Boolean);
    }

    function distributeMasonryColumns(items, cols) {
      if (!cols?.length) return;
      cols.forEach((col) => col.replaceChildren());
      items.forEach((item, index) => {
        cols[index % cols.length].appendChild(item);
      });
    }

    function appendToShortestMasonryCol(item, cols) {
      if (!cols?.length) return;
      let target = cols[0];
      cols.forEach((col) => {
        if (col.children.length < target.children.length) target = col;
      });
      target.appendChild(item);
    }

    function layoutMobileMasonry() {
      if (deckDesktopMq.matches || !deckLayout) {
        teardownMobileMasonry();
        return;
      }

      if (!masonryEl) {
        masonryEl = document.createElement("div");
        masonryEl.className = "hx-svc-deck-masonry";

        const colsWrap = document.createElement("div");
        colsWrap.className = "hx-svc-deck-masonry__cols";

        ["left", "mid", "right"].forEach((name) => {
          const col = document.createElement("div");
          col.className = "hx-svc-deck-masonry__col";
          col.dataset.masonryCol = name;
          col.setAttribute("role", "presentation");
          colsWrap.appendChild(col);
        });
        masonryEl.appendChild(colsWrap);

        deckLayout.insertBefore(masonryEl, deckRoot);
        deckRoot.hidden = true;
        if (deckMorePanel) deckMorePanel.hidden = true;
        deckLayout.classList.add("is-deck-masonry-mob");
        masonryReady = true;
      } else {
        /* Migrar de 2 a 3 columnas si hace falta */
        const colsWrap = masonryEl.querySelector(".hx-svc-deck-masonry__cols");
        if (colsWrap && !masonryEl.querySelector('[data-masonry-col="mid"]')) {
          const mid = document.createElement("div");
          mid.className = "hx-svc-deck-masonry__col";
          mid.dataset.masonryCol = "mid";
          const right = colsWrap.querySelector('[data-masonry-col="right"]');
          colsWrap.insertBefore(mid, right || null);
        }
      }

      if (deckMorePanel) {
        deckMorePanel.hidden = false;
        deckMorePanel.setAttribute("aria-hidden", "false");
      }

      const sorted = [...getDeckItems()].sort(
        (a, b) => Number(a.style.getPropertyValue("--deck-i") || 0) - Number(b.style.getPropertyValue("--deck-i") || 0)
      );
      const heroItem = sorted.find((item) => item.dataset.masonry === "hero");
      const rest = sorted.filter((item) => item !== heroItem);
      const colsWrap = masonryEl.querySelector(".hx-svc-deck-masonry__cols");
      const cols = getMasonryCols();

      masonryEl.querySelector(':scope > .hx-svc-deck__item[data-masonry="hero"]')?.remove();
      cols.forEach((col) => col.replaceChildren());

      if (heroItem) {
        heroItem.removeAttribute("role");
        if (deckLive) heroItem.classList.add("is-deck-in");
        masonryEl.insertBefore(heroItem, colsWrap);
      }

      rest.forEach((item) => {
        item.removeAttribute("role");
        if (deckLive) item.classList.add("is-deck-in");
      });
      distributeMasonryColumns(rest, cols);

      getDeckItems().forEach((item) => {
        if (item.dataset.masonry === "hero") return;
        if (cols.some((col) => col.contains(item))) return;
        appendToShortestMasonryCol(item, cols);
      });
    }

    function scheduleMasonryBalance() {
      if (!masonryReady || deckDesktopMq.matches) return;
      if (masonryBalanceTimer) cancelAnimationFrame(masonryBalanceTimer);
      masonryBalanceTimer = requestAnimationFrame(() => {
        masonryBalanceTimer = null;
        const sorted = [...getDeckItems()].sort(
          (a, b) => Number(a.style.getPropertyValue("--deck-i") || 0) - Number(b.style.getPropertyValue("--deck-i") || 0)
        );
        const rest = sorted.filter((item) => item.dataset.masonry !== "hero");
        const cols = getMasonryCols();
        if (cols.length < 3) return;
        distributeMasonryColumns(rest, cols);
        getDeckItems().forEach((item) => {
          if (item.dataset.masonry === "hero") return;
          if (cols.some((col) => col.contains(item))) return;
          appendToShortestMasonryCol(item, cols);
        });
      });
    }

    function initMobileMasonry() {
      layoutMobileMasonry();
      /* Una sola distribución fija: no rebalancear (evita que se muevan bajo el dedo) */
      getDeckItems().forEach((item) => ensureDeckIcon(item));
    }

    const staggerDeckCards = () => {
      deckItems = [...getDeckItems()].sort(
        (a, b) => Number(a.style.getPropertyValue("--deck-i") || 0) - Number(b.style.getPropertyValue("--deck-i") || 0)
      );
      if (reduced || !deckDesktopMq.matches) {
        /* Móvil: revelar todos de una vez (evita tiles fantasma si el DOM se reordena) */
        deckItems.forEach((item) => item.classList.add("is-deck-in"));
        return;
      }

      let index = 0;
      const gap = 42;
      const step = () => {
        if (index >= deckItems.length) return;
        deckItems[index].classList.add("is-deck-in");
        index += 1;
        if (index < deckItems.length) {
          deckStaggerTimer = window.setTimeout(step, gap);
        }
      };
      step();
    };

    const revealDeck = () => {
      if (deckLive) return;
      deckLive = true;
      deckSection.classList.add("is-deck-live");
      staggerDeckCards();
    };

    function teardownDeckSquare() {
      if (!squareReady) return;
      squareReady = false;
      deckRoot.classList.remove("hx-svc-deck--square");
      deckMoreRoot?.classList.remove("hx-svc-deck--square");
      deckSection.classList.remove("hx-services--deck-square");
      deckLayout?.classList.remove("is-deck-more-open");
      if (deckMorePanel) deckMorePanel.setAttribute("aria-hidden", "false");
      if (deckMoreToggle) deckMoreToggle.setAttribute("aria-expanded", "false");
      if (deckMoreLabel) deckMoreLabel.textContent = "Ver más";

      deckItems.forEach((item) => {
        item.classList.remove(
          "is-deck-expanded",
          "is-deck-video-on",
          "is-deck-fallback-on",
          "is-deck-preview"
        );
        const handlers = squareHandlers.get(item);
        if (handlers) {
          item.removeEventListener("mouseenter", handlers.enter);
          item.removeEventListener("mouseleave", handlers.leave);
          item.removeEventListener("focusin", handlers.enter);
          item.removeEventListener("focusout", handlers.leave);
          squareHandlers.delete(item);
        }
        item.querySelector(".hx-svc-deck__icon")?.remove();
        item.querySelector(".hx-svc-deck__media")?.remove();
      });
    }

    function playDeckMedia(item) {
      const handlers = squareHandlers.get(item);
      if (!handlers) return;

      item.classList.add("is-deck-expanded");
      deckItems.forEach((el) => el.classList.toggle("is-active", el === item));

      const video = handlers.loadVideo();
      if (!video) {
        item.classList.add("is-deck-fallback-on");
        return;
      }

      video
        .play()
        .then(() => {
          item.classList.add("is-deck-video-on");
          item.classList.remove("is-deck-fallback-on");
        })
        .catch(() => {
          item.classList.remove("is-deck-video-on");
          item.classList.add("is-deck-fallback-on");
        });
    }

    function stopDeckMedia(item) {
      item.classList.remove("is-deck-expanded", "is-deck-video-on", "is-deck-fallback-on", "is-deck-preview");
      const video = item.querySelector(".hx-svc-deck__video");
      if (video) {
        video.pause();
        try {
          video.currentTime = 0;
        } catch (_) {
          /* noop */
        }
      }
    }

    runMobileDeckPreview = (item) => {
      deckItems = getDeckItems();
      deckItems.forEach((el) => {
        if (el === item) return;
        if (el.classList.contains("is-deck-preview") || el.classList.contains("is-deck-expanded")) {
          stopDeckMedia(el);
        }
      });
      setupDeckItemMedia(item);
      item.classList.add("is-deck-preview");
      playDeckMedia(item);
    };

    function ensureDeckIcon(item) {
      const id = item.getAttribute("data-deck-svc");
      const cfg = deckMediaCfg[id];
      if (!cfg || item.querySelector(".hx-svc-deck__icon")) return null;

      const iconEl = document.createElement("span");
      iconEl.className = "hx-svc-deck__icon";
      iconEl.setAttribute("aria-hidden", "true");
      const iconImg = document.createElement("img");
      iconImg.src = cfg.icon || cfg.thumb || cfg.poster;
      iconImg.alt = "";
      iconImg.loading = "lazy";
      iconImg.decoding = "async";
      if (!cfg.icon && (cfg.thumb || cfg.poster)) iconImg.classList.add("hx-svc-deck__icon-photo");
      iconEl.appendChild(iconImg);

      const bg = item.querySelector(".hx-svc-deck__bg");
      if (bg) item.insertBefore(iconEl, bg);
      else item.prepend(iconEl);
      return iconEl;
    }

    function setupDeckItemMedia(item) {
      const id = item.getAttribute("data-deck-svc");
      const cfg = deckMediaCfg[id];
      if (!cfg) return;

      ensureDeckIcon(item);
      if (item.querySelector(".hx-svc-deck__media")) return;

      const mediaEl = document.createElement("span");
      mediaEl.className = "hx-svc-deck__media";
      mediaEl.setAttribute("aria-hidden", "true");

      const video = document.createElement("video");
      video.className = "hx-svc-deck__video";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.preload = "none";
      if (cfg.poster) video.poster = cfg.poster;
      if (cfg.mp4) video.dataset.src = cfg.mp4;

      const fallback = document.createElement("img");
      fallback.className = "hx-svc-deck__media-fallback";
      fallback.src = cfg.gif || cfg.poster || cfg.icon;
      fallback.alt = "";
      fallback.loading = "lazy";
      fallback.decoding = "async";

      video.addEventListener("error", () => {
        item.classList.remove("is-deck-video-on");
        item.classList.add("is-deck-fallback-on");
      });

      mediaEl.append(video, fallback);

      const iconEl = item.querySelector(".hx-svc-deck__icon");
      if (iconEl) item.insertBefore(mediaEl, iconEl.nextSibling);
      else {
        const bg = item.querySelector(".hx-svc-deck__bg");
        if (bg) item.insertBefore(mediaEl, bg);
        else item.prepend(mediaEl);
      }

      let loaded = false;
      const handlers = {
        loadVideo() {
          if (cfg.gif || !cfg.mp4) return null;
          if (!loaded) {
            video.src = cfg.mp4;
            loaded = true;
          }
          return video;
        },
        enter() {
          if (!deckDesktopMq.matches) return;
          playDeckMedia(item);
        },
        leave(event) {
          if (event?.type === "focusout" && item.contains(event.relatedTarget)) return;
          stopDeckMedia(item);
        },
      };
      squareHandlers.set(item, handlers);

      item.addEventListener("mouseenter", handlers.enter);
      item.addEventListener("mouseleave", handlers.leave);
      item.addEventListener("focusin", handlers.enter);
      item.addEventListener("focusout", handlers.leave);
    }

    function setMoreOpen(open) {
      if (!deckLayout || !deckMorePanel) return;
      deckLayout.classList.toggle("is-deck-more-open", open);
      deckMorePanel.setAttribute("aria-hidden", String(!open));
      deckMoreToggle?.setAttribute("aria-expanded", String(open));
      if (deckMoreLabel) deckMoreLabel.textContent = open ? "Ver menos" : "Ver más";
    }

    function initDeckSquare() {
      if (!deckDesktopMq.matches || squareReady) return;
      squareReady = true;
      deckRoot.classList.add("hx-svc-deck--square");
      deckMoreRoot?.classList.add("hx-svc-deck--square");
      deckSection.classList.add("hx-services--deck-square");
      deckItems.forEach((item) => setupDeckItemMedia(item));
      setMoreOpen(true);
    }

    function initMobileDeckIcons() {
      getDeckItems().forEach((item) => {
        ensureDeckIcon(item);
        setupDeckItemMedia(item);
      });
    }

    function syncDeckLayout() {
      if (deckDesktopMq.matches) {
        teardownMobileMasonry();
        initDeckSquare();
      } else {
        teardownDeckSquare();
        initMobileMasonry();
        initMobileDeckIcons();
        if (deckLive) {
          getDeckItems().forEach((item) => item.classList.add("is-deck-in"));
        }
      }
    }

    if ("IntersectionObserver" in window) {
      const deckObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            revealDeck();
            deckObs.disconnect();
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px 10% 0px" }
      );
      deckObs.observe(deckSection);
    } else {
      revealDeck();
    }

    setTimeout(revealDeck, 1800);
    if (reduced) revealDeck();

    syncDeckLayout();
    if (!deckDesktopMq.matches) revealDeck();
    deckDesktopMq.addEventListener("change", syncDeckLayout);

    deckMoreToggle?.addEventListener("click", () => {
      const open = !deckLayout?.classList.contains("is-deck-more-open");
      setMoreOpen(open);
    });

    deckItems.forEach((item) => {
      item.addEventListener("focusin", () => {
        if (!deckDesktopMq.matches) {
          deckItems.forEach((el) => el.classList.toggle("is-active", el === item));
        }
      });
    });

    window.addEventListener("pageshow", () => {
      if (deckStaggerTimer) clearTimeout(deckStaggerTimer);
    });
  }
  window.addEventListener("pageshow", () => {
    resetPlanPicker();
  });

  /* Toda la página negra ↔ clara según la sección en vista */
  const bandSections = [...root.querySelectorAll("[data-hx-band]")];
  if (bandSections.length) {
    let activeBand = "light";
    let lastScrollY = window.scrollY || 0;

    function setScrollBand(theme) {
      const next = theme === "dark" ? "dark" : "light";
      if (next === activeBand) return;
      activeBand = next;
      document.body.classList.toggle("hx-band--dark", next === "dark");
      document.documentElement.classList.toggle("hx-band--dark", next === "dark");
      document.body.dataset.hxBand = next;
    }

    function syncScrollBand() {
      const viewH = window.innerHeight || 1;
      const y = window.scrollY || 0;
      const scrollingUp = y < lastScrollY - 2;
      lastScrollY = y;

      /* Arriba del todo (hero / servicios): siempre claro */
      if (y < viewH * 0.35) {
        setScrollBand("light");
        return;
      }

      const focusTop = viewH * 0.2;
      const focusBottom = viewH * 0.72;
      let bestLight = null;
      let bestDark = null;
      let lightScore = 0;
      let darkScore = 0;

      bandSections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const visibleTop = Math.max(rect.top, focusTop);
        const visibleBottom = Math.min(rect.bottom, focusBottom);
        const overlap = Math.max(0, visibleBottom - visibleTop);
        if (overlap <= 0) return;
        const score = overlap / viewH;
        const theme = section.getAttribute("data-hx-band") || "light";
        if (theme === "dark") {
          if (score > darkScore) {
            darkScore = score;
            bestDark = section;
          }
        } else if (score > lightScore) {
          lightScore = score;
          bestLight = section;
        }
      });

      /* Al subir, prioriza volver al claro si hay sección clara visible */
      if (scrollingUp && lightScore >= 0.12 && lightScore + 0.02 >= darkScore) {
        setScrollBand("light");
        return;
      }

      if (darkScore >= 0.16 && darkScore >= lightScore) {
        setScrollBand("dark");
        return;
      }

      if (lightScore > 0 || bestLight) {
        setScrollBand("light");
        return;
      }

      if (bestDark) setScrollBand("dark");
    }

    let bandRaf = 0;
    function onBandScroll() {
      if (bandRaf) return;
      bandRaf = window.requestAnimationFrame(() => {
        bandRaf = 0;
        syncScrollBand();
      });
    }

    if (!reduced) {
      window.addEventListener("scroll", onBandScroll, { passive: true });
      window.addEventListener("resize", onBandScroll, { passive: true });
      syncScrollBand();
    }
  }
})();
