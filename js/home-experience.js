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

  /* Carril servicios — progreso, tilt y panel flotante */
  const rail = root.querySelector("[data-hx-rail]");
  const progress = root.querySelector(".hx-services__progress span");
  const panel = root.querySelector("[data-hx-svc-panel]");
  const panelSheet = panel?.querySelector(".hx-svc-panel__sheet");
  const panelIcon = panel?.querySelector("[data-hx-svc-panel-icon]");
  const panelKicker = panel?.querySelector("[data-hx-svc-panel-kicker]");
  const panelTitle = panel?.querySelector("[data-hx-svc-panel-title]");
  const panelDesc = panel?.querySelector("[data-hx-svc-panel-desc]");
  const panelSteps = panel?.querySelector("[data-hx-svc-panel-steps]");
  const panelLink = panel?.querySelector("[data-hx-svc-panel-link]");

  const SERVICE_PANELS = {
    portabilidad: {
      theme: "navy",
      icon: "assets/servicios/portabilidad.jpg",
      title: "Portabilidad",
      desc: "Cambia el número de tus clientes de una compañía a otra con el respaldo de la red YAAVS en todo México.",
      steps: [
        "Solicita al cliente su NIP y verifica que la línea esté activa.",
        "Ingresa a RecargaKlic o al portal YAAVS con tus credenciales de Yaavser.",
        "Captura los datos del cliente y el operador de origen y destino.",
        "Confirma la portabilidad y entrega comprobante al cliente.",
      ],
      link: { href: "servicios.html#portabilidad", label: "Ver guía completa" },
    },
    activaciones: {
      theme: "gold",
      kicker: "RecargaKlic",
      icon: "assets/servicios/activaciones.jpg",
      title: "Activaciones",
      desc: "Activa SIM en minutos desde la app RecargaKlic: menos filas, más ventas y comisiones claras.",
      steps: [
        "Abre RecargaKlic en tu celular o tablet del mostrador.",
        "Escanea o ingresa el ICCID de la SIM que vas a activar.",
        "Selecciona operador, plan y datos del cliente según el flujo.",
        "Finaliza la activación y guarda el comprobante para soporte.",
      ],
      link: { href: "activar-chip.html", label: "Cómo activar un chip" },
    },
    esims: {
      theme: "green",
      kicker: "RecargaKlic",
      icon: "assets/servicios/esim.jpg",
      title: "eSIMs",
      desc: "Activa líneas digitales sin chip físico. Ideal para equipos compatibles y ventas más ágiles en tu tienda.",
      steps: [
        "Confirma que el equipo del cliente es compatible con eSIM.",
        "Abre RecargaKlic y selecciona el flujo de activación eSIM.",
        "Escanea el código QR del operador o ingresa los datos de la eSIM.",
        "Completa la activación y verifica señal con el cliente antes de cerrar.",
      ],
      link: { href: "activar-chip.html", label: "Activar eSIM en RecargaKlic" },
    },
    "tiempo-aire": {
      theme: "violet",
      icon: "assets/servicios/tiempo-aire.jpg",
      title: "Tiempo aire",
      desc: "Recargas de Telcel, AT&T, Movistar, Unefon y más desde un solo punto de venta.",
      steps: [
        "Abre RecargaKlic y entra al módulo de tiempo aire o recargas.",
        "Elige la compañía y el monto que solicita el cliente.",
        "Ingresa el número a recargar y confirma la operación.",
        "Entrega ticket o comprobante; el saldo se refleja al instante.",
      ],
      link: { href: "servicios.html#tiempo-aire", label: "Ver catálogo de recargas" },
    },
    vinculaciones: {
      theme: "coral",
      icon: "assets/servicios/vinculaciones.jpg",
      title: "Vinculaciones",
      desc: "Vincula equipos, líneas y cuentas de tus clientes al ecosistema YAAVS con soporte comercial en tu zona.",
      steps: [
        "Solicita IMEI, número de línea y datos del titular al cliente.",
        "Ingresa a RecargaKlic o al portal YAAVS con tu usuario Yaavser.",
        "Registra la vinculación según el operador y tipo de servicio.",
        "Guarda el folio de vinculación y confirma con tu ejecutivo si aplica.",
      ],
      link: { href: "contacto.html", label: "Solicitar vinculación" },
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

  rail?.querySelectorAll("[data-hx-svc]").forEach((card) => {
    card.addEventListener("click", () => {
      openServicePanel(card.dataset.hxSvc);
    });
  });

  if (rail && progress) {
    const updateProgress = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      if (max <= 0) {
        progress.style.width = "100%";
        return;
      }
      const ratio = rail.scrollLeft / max;
      const segment = 100 / Math.max(1, rail.children.length);
      progress.style.width = `${segment + ratio * (100 - segment)}%`;
    };
    rail.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();
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
    const opsBack = opsDeck.querySelector(".hx-ops__back");
    const mobileOps = window.matchMedia("(max-width: 900px)");

    function syncOpsState(card) {
      const isCarrier = card?.dataset?.hxOp !== "intro";
      opsDeck.classList.toggle("has-carrier-active", isCarrier);
      if (opsBack) opsBack.hidden = !isCarrier;
    }

    function activateOp(card) {
      if (card.classList.contains("is-active") && card.dataset.hxOp !== "intro") {
        card = introCard;
      }

      opCards.forEach((c) => {
        const active = c === card;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-selected", String(active));
        c.tabIndex = active ? 0 : -1;
      });

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

    opsBack?.addEventListener("click", () => activateOp(introCard));

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
  }
})();
