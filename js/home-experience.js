(function () {
  if (!document.body.classList.contains("page-home")) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.getElementById("home-experience");
  if (!root) return;

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
      link: { href: "activar-chip.html", label: "Abrir RecargaKlic" },
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
      link: { href: "servicios.html#tiempo-aire", label: "Ver catalogo de recargas" },
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
      link: { href: "servicios.html#portabilidad", label: "Ver guia completa" },
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
      link: { href: "activar-chip.html", label: "Como activar un chip" },
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
      link: { href: "contacto.html", label: "Solicitar rotulacion" },
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
      link: { href: "ser-yaavser.html", label: "Ver formacion YAAVS" },
    },
    esims: {
      theme: "green",
      kicker: "RecargaKlic",
      icon: "assets/servicios/esim.jpg",
      title: "eSIMs",
      desc: "Activa lineas digitales sin chip fisico. Ideal para equipos compatibles y ventas agiles.",
      steps: [
        "Confirma que el equipo del cliente sea compatible con eSIM.",
        "Abre RecargaKlic y selecciona el flujo de activacion eSIM.",
        "Escanea el codigo QR del operador o ingresa datos de eSIM.",
        "Completa activacion y verifica señal con el cliente antes de cerrar.",
      ],
      link: { href: "activar-chip.html", label: "Activar eSIM en RecargaKlic" },
    },
    vinculaciones: {
      theme: "coral",
      icon: "assets/servicios/vinculaciones.jpg",
      title: "Vinculaciones",
      desc: "Vincula equipos, lineas y cuentas de clientes al ecosistema YAAVS con soporte comercial.",
      steps: [
        "Solicita IMEI, numero de linea y datos del titular al cliente.",
        "Ingresa a RecargaKlic o al portal YAAVS con tu usuario.",
        "Registra la vinculacion segun operador y tipo de servicio.",
        "Guarda folio de vinculacion y confirma con tu ejecutivo si aplica.",
      ],
      link: { href: "contacto.html", label: "Solicitar vinculacion" },
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
        if (targetCard) activateOp(targetCard);
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

      card.addEventListener("click", () => {
        if (mobileOps.matches && card === introCard) return;
        activateOp(card);
      });

      card.addEventListener("keydown", (e) => {
        const idx = Array.from(opCards).indexOf(card);
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
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

    function distributeMasonryColumns(items, colLeft, colRight) {
      if (!colLeft || !colRight) return;
      colLeft.replaceChildren();
      colRight.replaceChildren();
      items.forEach((item, index) => {
        (index % 2 === 0 ? colLeft : colRight).appendChild(item);
      });
    }

    function layoutMobileMasonry() {
      if (deckDesktopMq.matches || !deckLayout) {
        teardownMobileMasonry();
        return;
      }

      if (!masonryEl) {
        masonryEl = document.createElement("div");
        masonryEl.className = "hx-svc-deck-masonry";
        masonryEl.setAttribute("role", "list");

        const colsWrap = document.createElement("div");
        colsWrap.className = "hx-svc-deck-masonry__cols";

        const colLeft = document.createElement("div");
        const colRight = document.createElement("div");
        colLeft.className = "hx-svc-deck-masonry__col";
        colRight.className = "hx-svc-deck-masonry__col";
        colLeft.dataset.masonryCol = "left";
        colRight.dataset.masonryCol = "right";
        colsWrap.append(colLeft, colRight);
        masonryEl.appendChild(colsWrap);

        deckLayout.insertBefore(masonryEl, deckRoot);
        deckRoot.hidden = true;
        if (deckMorePanel) deckMorePanel.hidden = true;
        deckLayout.classList.add("is-deck-masonry-mob");
        masonryReady = true;
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
      const colLeft = masonryEl.querySelector('[data-masonry-col="left"]');
      const colRight = masonryEl.querySelector('[data-masonry-col="right"]');

      masonryEl.querySelector(":scope > .hx-svc-deck__item[data-masonry=\"hero\"]")?.remove();
      colLeft.replaceChildren();
      colRight.replaceChildren();

      if (heroItem) {
        heroItem.classList.add("is-deck-in");
        masonryEl.insertBefore(heroItem, colsWrap);
      }

      rest.forEach((item) => item.classList.add("is-deck-in"));
      distributeMasonryColumns(rest, colLeft, colRight);

      getDeckItems().forEach((item) => {
        if (item.dataset.masonry === "hero") return;
        if (colLeft.contains(item) || colRight.contains(item)) return;
        (colLeft.children.length <= colRight.children.length ? colLeft : colRight).appendChild(item);
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
        const colLeft = masonryEl?.querySelector('[data-masonry-col="left"]');
        const colRight = masonryEl?.querySelector('[data-masonry-col="right"]');
        if (!colLeft || !colRight) return;
        distributeMasonryColumns(rest, colLeft, colRight);
        getDeckItems().forEach((item) => {
          if (item.dataset.masonry === "hero") return;
          if (colLeft.contains(item) || colRight.contains(item)) return;
          (colLeft.children.length <= colRight.children.length ? colLeft : colRight).appendChild(item);
        });
      });
    }

    function initMobileMasonry() {
      layoutMobileMasonry();
      scheduleMasonryBalance();
      getDeckItems().forEach((item) => {
        item.querySelectorAll("img").forEach((img) => {
          if (img.complete) return;
          img.addEventListener("load", scheduleMasonryBalance, { once: true });
        });
      });
    }

    const staggerDeckCards = () => {
      deckItems = getDeckItems();
      if (reduced) {
        deckItems.forEach((item) => item.classList.add("is-deck-in"));
        return;
      }

      let index = 0;
      const step = () => {
        deckItems = getDeckItems();
        if (index >= deckItems.length) return;
        deckItems[index].classList.add("is-deck-in");
        index += 1;
        if (index < deckItems.length) {
          deckStaggerTimer = window.setTimeout(step, deckDesktopMq.matches ? 42 : 36);
        }
      };
      step();
    };

    const revealDeck = () => {
      if (deckLive) return;
      deckLive = true;
      deckSection.classList.add("is-deck-live");
      deckItems = getDeckItems();
      if (!deckDesktopMq.matches) {
        deckItems.forEach((item) => item.classList.add("is-deck-in"));
        return;
      }
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
        item.classList.remove("is-deck-expanded", "is-deck-video-on", "is-deck-fallback-on");
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
      item.classList.remove("is-deck-expanded", "is-deck-video-on", "is-deck-fallback-on");
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

    function setupDeckItemMedia(item) {
      const id = item.getAttribute("data-deck-svc");
      const cfg = deckMediaCfg[id];
      if (!cfg || item.querySelector(".hx-svc-deck__icon")) return;

      const iconEl = document.createElement("span");
      iconEl.className = "hx-svc-deck__icon";
      iconEl.setAttribute("aria-hidden", "true");
      const iconImg = document.createElement("img");
      const iconSrc = cfg.icon || cfg.thumb || cfg.poster;
      iconImg.src = iconSrc;
      iconImg.alt = "";
      iconImg.loading = "lazy";
      iconImg.decoding = "async";
      /* Solo marcar como foto si no hay icono dedicado (legado) */
      if (!cfg.icon && (cfg.thumb || cfg.poster)) iconImg.classList.add("hx-svc-deck__icon-photo");
      iconEl.appendChild(iconImg);

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

      const bg = item.querySelector(".hx-svc-deck__bg");
      if (bg) {
        item.insertBefore(iconEl, bg);
        item.insertBefore(mediaEl, bg);
      } else {
        item.prepend(mediaEl);
        item.prepend(iconEl);
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

    function syncDeckLayout() {
      if (deckDesktopMq.matches) {
        teardownMobileMasonry();
        initDeckSquare();
      } else {
        teardownDeckSquare();
        initMobileMasonry();
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
      if (!reduced && !deckDesktopMq.matches) {
        let tiltFrame = 0;
        let tiltEvent = null;

        const applyTilt = () => {
          tiltFrame = 0;
          if (!tiltEvent) return;
          const rect = item.getBoundingClientRect();
          const px = (tiltEvent.clientX - rect.left) / rect.width - 0.5;
          const py = (tiltEvent.clientY - rect.top) / rect.height - 0.5;
          item.style.setProperty("--deck-tilt-y", `${(px * 8).toFixed(1)}deg`);
          item.style.setProperty("--deck-tilt-x", `${(py * -6).toFixed(1)}deg`);
        };

        item.addEventListener("mousemove", (event) => {
          tiltEvent = event;
          if (!tiltFrame) tiltFrame = requestAnimationFrame(applyTilt);
        });

        item.addEventListener("mouseleave", () => {
          tiltEvent = null;
          if (tiltFrame) cancelAnimationFrame(tiltFrame);
          tiltFrame = 0;
          item.style.setProperty("--deck-tilt-x", "0deg");
          item.style.setProperty("--deck-tilt-y", "0deg");
        });
      }

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
})();
