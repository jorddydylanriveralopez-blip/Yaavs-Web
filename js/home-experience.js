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
    const multiNum = pulse.querySelector(
      ".hx-pulse__stats > .hx-pulse__stat:nth-child(3) .hx-pulse__num"
    );

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
    const baseCards = [...rail.querySelectorAll(".hx-svc")];

    if (!reduced && baseCards.length > 2 && !rail.dataset.hxLoopReady) {
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

    if (!reduced && rail.dataset.hxLoopReady === "true") {
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
    rail.querySelectorAll(".hx-svc").forEach((card) => {
      const glow = card.querySelector(".hx-svc__glow");

      card.addEventListener("mouseenter", () => {
        card.classList.add("is-hover");
      });

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
    const mobileOps = window.matchMedia("(max-width: 900px)");
    const desktopOpsScroll = window.matchMedia("(min-width: 901px)");
    const scrollCards = [introCard, ...carrierCards].filter(Boolean);
    let scrollUserPicked = false;
    let scrollPickProgress = 0;
    let scrollTicking = false;

    function easeOpsScroll(t) {
      return 1 - Math.pow(1 - t, 2.4);
    }

    function getOpsScrollProgress() {
      const range = window.innerHeight * 0.82 * Math.max(1, scrollCards.length - 1);
      opsDeck.style.setProperty("--hx-ops-scroll-range", `${Math.round(range)}px`);
      const scrolled = -opsDeck.getBoundingClientRect().top;
      return Math.min(1, Math.max(0, scrolled / range));
    }

    function clearOpsScrollSequence() {
      opsDeck.classList.remove("hx-ops--scroll-sequence");
      scrollCards.forEach((card) => card.style.removeProperty("--hx-ops-scroll-flex"));
      opsDeck.style.removeProperty("--hx-ops-scroll-range");
      const head = opsDeck.querySelector(".hx-ops__head");
      if (head) {
        head.style.removeProperty("opacity");
        head.style.removeProperty("transform");
      }
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
      syncOpsState(activeCard);

      const head = opsDeck.querySelector(".hx-ops__head");
      if (head) {
        head.style.opacity = String(Math.max(0.1, 1 - progress * 2.4));
        head.style.transform = `translateX(-50%) translateY(${Math.min(14, progress * 32)}px)`;
      }
    }

    function onOpsScroll() {
      if (reduced || !desktopOpsScroll.matches || scrollCards.length < 2) {
        clearOpsScrollSequence();
        scrollUserPicked = false;
        return;
      }

      const rect = opsDeck.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 1.05 && rect.bottom > -window.innerHeight * 0.15;
      if (!inView) {
        clearOpsScrollSequence();
        scrollUserPicked = false;
        return;
      }

      opsDeck.classList.add("hx-ops--scroll-sequence");
      const progress = getOpsScrollProgress();

      if (scrollUserPicked) {
        if (Math.abs(progress - scrollPickProgress) > 0.08) {
          scrollUserPicked = false;
          scrollCards.forEach((card) => card.style.removeProperty("--hx-ops-scroll-flex"));
        } else {
          return;
        }
      }

      applyOpsScrollSequence(progress);
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

    function syncOpsPreview() {
      if (!opsGrid) return;

      const hasCarrierActive = opsDeck.classList.contains("has-carrier-active");
      opsGrid.hidden = mobileOps.matches && !hasCarrierActive;
      if (opsToggle) opsToggle.hidden = true;
    }

    function syncOpsState(card) {
      const isCarrier = card?.dataset?.hxOp !== "intro";
      opsDeck.classList.toggle("has-carrier-active", isCarrier);
      if (opsBack) opsBack.hidden = !isCarrier;
      if (!isCarrier) {
        setOpsPickerOpen(false, { restoreFocus: false });
      }
      syncOpsPreview();
    }

    function activateOp(card) {
      if (card.classList.contains("is-active") && card.dataset.hxOp !== "intro") {
        card = introCard;
      }

      if (desktopOpsScroll.matches && !reduced) {
        scrollUserPicked = true;
        scrollPickProgress = getOpsScrollProgress();
        scrollCards.forEach((c) => c.style.removeProperty("--hx-ops-scroll-flex"));
      }

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
        if (mobileOps.matches) {
          requestAnimationFrame(() => {
            opsDeck.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
      }
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

    opsBack?.addEventListener("click", () => activateOp(introCard));

    const onMobileOpsChange = () => {
      setOpsPickerOpen(false, { restoreFocus: false });
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

      card.addEventListener("click", () => activateOp(card));

      card.addEventListener("keydown", (e) => {
        const idx = Array.from(opCards).indexOf(card);
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          activateOp(opCards[(idx + 1) % opCards.length]);
          opCards[(idx + 1) % opCards.length].focus();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          activateOp(opCards[(idx - 1 + opCards.length) % opCards.length]);
          opCards[(idx - 1 + opCards.length) % opCards.length].focus();
        }
      });
    });

    const initialCard = opsDeck.querySelector(".hx-ops__card.is-active") || introCard || opCards[0];
    if (initialCard) {
      syncOpsState(initialCard);
    } else {
      syncOpsPreview();
    }

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

  /* Al retroceder el navegador restaura la página con clases de animación pegadas */
  window.addEventListener("pageshow", () => {
    resetPlanPicker();
  });
})();
