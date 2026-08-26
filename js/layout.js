(function () {
  const headerMount = document.getElementById("site-header");
  const footerMount = document.getElementById("site-footer");
  const currentPage = document.body.dataset.page || "";

  function ensureSonic() {
    if (window.YaavsSonic) return Promise.resolve();
    if (document.querySelector("script[data-yaavs-sonic]")) {
      return new Promise((resolve) => {
        const wait = () => {
          if (window.YaavsSonic) resolve();
          else window.requestAnimationFrame(wait);
        };
        wait();
      });
    }
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "js/yaavs-sonic.js?v=2";
      s.dataset.yaavsSonic = "true";
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.body.appendChild(s);
    });
  }

  function setActiveNav() {
    document.querySelectorAll(".main-nav a[data-page]").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.page === currentPage);
    });
  }

  /** Header corporativo blanco → siempre logo a color. */
  function usesLightHeaderLogo() {
    if (document.querySelector(".site-header--corp")) return true;
    return document.body.classList.contains("page-tiendas")
      || document.body.classList.contains("page-tiendas-map")
      || document.body.classList.contains("page-terminos")
      || document.body.classList.contains("page-privacidad")
      || document.body.classList.contains("page-quienes-somos")
      || document.body.classList.contains("page-asi-somos");
  }

  /** Home y subpáginas con hero oscuro: logo blanco. Al scroll en interiores: logo a color. */
  function applyHeaderLogo(forceLight) {
    const img = document.querySelector(".site-header .logo");
    if (!img) return;

    const picture = img.closest("picture");
    picture?.querySelectorAll("source").forEach((source) => source.remove());

    const useLight = document.body.classList.contains("page-postpago")
      ? false
      : forceLight === true
      || (forceLight !== false && usesLightHeaderLogo());

    if (useLight) {
      img.src = "assets/yaavs-logo-on-light.png?v=3";
      img.classList.add("logo--on-light");
      img.classList.remove("logo--white");
    } else {
      img.src = "assets/yaavs-logo-white.png?v=2";
      img.classList.add("logo--white");
      img.classList.remove("logo--on-light");
    }
    img.style.removeProperty("--logo-filter");
    img.style.removeProperty("filter");
  }

  function initHeaderLogo() {
    applyHeaderLogo(true);
  }

  function initNavToggle() {
    const navToggle = document.getElementById("nav-toggle");
    const mainNav = document.getElementById("main-nav");
    if (!navToggle || !mainNav) return;

    const drawerMq = window.matchMedia("(max-width: 900px)");

    function isDrawerMode() {
      return drawerMq.matches;
    }

    function setMenuOpen(open) {
      if (!isDrawerMode()) open = false;
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      mainNav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    }

    function closeMenu() {
      setMenuOpen(false);
    }

    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!isDrawerMode()) return;
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setMenuOpen(open);
    });

    document.addEventListener("click", (e) => {
      if (!document.body.classList.contains("nav-open")) return;
      if (mainNav.contains(e.target) || navToggle.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mainNav.classList.contains("is-open")) closeMenu();
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (isDrawerMode()) closeMenu();
      });
    });

    const onViewportChange = () => {
      if (!isDrawerMode()) closeMenu();
    };
    if (typeof drawerMq.addEventListener === "function") {
      drawerMq.addEventListener("change", onViewportChange);
    } else if (typeof drawerMq.addListener === "function") {
      drawerMq.addListener(onViewportChange);
    }
  }

  function initHeaderScroll() {
    const header = document.getElementById("header");
    if (!header) return;

    const banner =
      document.getElementById("inicio-banner") ||
      document.querySelector(".avisos-hero-banner");
    const hasTallBanner =
      document.body.classList.contains("page-home") || !!banner;
    const mainNav = document.getElementById("main-nav");
    const navToggle = document.getElementById("nav-toggle");

    function getThreshold() {
      /* Responde casi al empezar a scrollear */
      if (!hasTallBanner || !banner) return 24;
      return Math.max(28, Math.min(48, banner.offsetHeight * 0.04));
    }

    const swapLogoOnScroll =
      !document.body.classList.contains("page-home")
      && !document.body.classList.contains("page-postpago")
      && !usesLightHeaderLogo();

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrolled = window.scrollY > getThreshold();
        header.classList.toggle("is-scrolled", scrolled);
        document.body.classList.toggle("header-scrolled", scrolled);
        if (swapLogoOnScroll) applyHeaderLogo(scrolled);
        ticking = false;
      });
    }

    function closeMenu() {
      mainNav?.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      navToggle?.setAttribute("aria-expanded", "false");
      navToggle?.setAttribute("aria-label", "Abrir menú");
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth >= 900 && mainNav?.classList.contains("is-open")) {
          closeMenu();
        }
      },
      { passive: true }
    );
    onScroll();
  }

  const FALLBACK_PARTIALS = {
    "partials/header.html": `<header class="site-header site-header--nav-bar site-header--corp" id="header">
  <div class="header-inner header-inner--corp">
    <a href="index.html" class="logo-link logo-link--corp" aria-label="YAAVS inicio">
      <img src="assets/yaavs-logo-on-light.png?v=3" alt="YAAVS" class="logo logo--corp logo--on-light" width="410" height="95">
    </a>
    <nav class="main-nav main-nav--bar main-nav--corp" id="main-nav" aria-label="Principal">
      <a href="index.html" data-page="inicio">Inicio</a>
      <a href="quienes-somos.html" data-page="quienes-somos">Nosotros</a>
      <a href="servicios.html" data-page="servicios">Servicios</a>
      <a href="tiendas-mapa.html?carrier=bait" data-page="tiendas">Tiendas</a>
      <a href="bolsa-trabajo.html" data-page="bolsa-trabajo">Únete</a>
      <a href="avisos.html" data-page="avisos">Noticias</a>
      <a href="contacto.html" data-page="contacto">Contacto</a>
    </nav>
    <div class="header-menu header-menu--corp">
      <a class="header-cta" href="https://wa.me/525522331210?text=Hola%2C%20quiero%20informaci%C3%B3n%20de%20YAAVS" target="_blank" rel="noopener noreferrer" data-header-wa data-yaavs-track="whatsapp_click" data-yaavs-track-label="header_cta">Cotizar ahora</a>
      <a class="header-wa" href="https://wa.me/525522331210?text=Hola%2C%20quiero%20informaci%C3%B3n%20de%20YAAVS" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp YAAVS" data-header-wa data-yaavs-track="whatsapp_click" data-yaavs-track-label="header_whatsapp">
        <span class="header-wa__icon" aria-hidden="true"></span>
      </a>
      <button type="button" class="nav-bento" id="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Abrir menú" hidden>
        <span class="bento-dot"></span><span class="bento-dot"></span><span class="bento-dot"></span>
        <span class="bento-dot"></span><span class="bento-dot"></span><span class="bento-dot"></span>
        <span class="bento-dot"></span><span class="bento-dot"></span><span class="bento-dot"></span>
      </button>
    </div>
  </div>
</header>`,
    "partials/footer.html": `<div class="site-floats" aria-hidden="true">
  <img class="site-float site-float--sim" src="assets/floats/float-sim.svg" alt="" width="72" height="92" loading="lazy" decoding="async">
  <img class="site-float site-float--chip" src="assets/floats/float-chip.svg" alt="" width="64" height="64" loading="lazy" decoding="async">
  <img class="site-float site-float--phone" src="assets/floats/float-phone.svg" alt="" width="48" height="82" loading="lazy" decoding="async">
  <img class="site-float site-float--signal" src="assets/floats/float-signal.svg" alt="" width="56" height="56" loading="lazy" decoding="async">
  <img class="site-float site-float--esim" src="assets/floats/float-esim.svg" alt="" width="64" height="48" loading="lazy" decoding="async">
  <img class="site-float site-float--phones" src="assets/floats/float-phones.svg" alt="" width="100" height="72" loading="lazy" decoding="async">
  <img class="site-float site-float--sim-r" src="assets/floats/float-sim.svg" alt="" width="64" height="82" loading="lazy" decoding="async">
  <img class="site-float site-float--chip-r" src="assets/floats/float-chip.svg" alt="" width="52" height="52" loading="lazy" decoding="async">
  <img class="site-float site-float--phone-r" src="assets/floats/float-phone.svg" alt="" width="40" height="70" loading="lazy" decoding="async">
  <img class="site-float site-float--signal-r" src="assets/floats/float-signal.svg" alt="" width="48" height="48" loading="lazy" decoding="async">
</div>
<footer class="site-footer">
  <div class="site-footer__glow" aria-hidden="true"></div>
  <div class="site-footer__mesh" aria-hidden="true"></div>
  <div class="container site-footer__inner">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="index.html" class="footer-brand__logo-link" aria-label="YAAVS — Inicio">
          <img src="assets/yaavs-logo.png" alt="YAAVS" class="footer-logo" width="140" height="32">
        </a>
        <p class="footer-tagline">Distribución masiva de telecomunicaciones en México. Red nacional de socios comerciales con respaldo.</p>
        <div class="footer-cta-row">
          <a href="contacto.html" class="footer-cta footer-cta--primary">Escríbenos</a>
          <a href="https://wa.me/525522331210?text=Hola%2C%20quiero%20informaci%C3%B3n%20de%20YAAVS" class="footer-cta footer-cta--ghost" target="_blank" rel="noopener noreferrer" data-yaavs-track="whatsapp_click" data-yaavs-track-label="footer_cta_whatsapp">WhatsApp</a>
        </div>
        <div class="footer-social" aria-label="Redes sociales">
          <a class="footer-social__btn" href="https://www.facebook.com/yaavsmx" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1z"/></svg></a>
          <a class="footer-social__btn" href="https://instagram.com/yaavsmx" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg></a>
          <a class="footer-social__btn" href="https://www.linkedin.com/company/grupocomercialyaavs/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M6.5 9H3v12h3.5V9zM4.8 3C3.5 3 2.5 4 2.5 5.3S3.5 7.6 4.8 7.6 7 6.6 7 5.3 6 3 4.8 3zM21 15.4c0-3.2-1.7-4.7-4-4.7-1.8 0-2.6 1-3.1 1.7V9H10.5v12H14v-6.4c0-1.7.8-2.8 2.3-2.8 1.4 0 2.1 1 2.1 2.8V21H22v-5.6z"/></svg></a>
          <a class="footer-social__btn" href="https://www.tiktok.com/@yaavsmx" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M16.5 3c.5 2.2 1.9 3.8 4 4.2v3c-1.4 0-2.7-.4-4-1.1v5.5A5.9 5.9 0 1 1 10 9.1v3.1a2.9 2.9 0 1 0 2.5 2.9V3h4z"/></svg></a>
        </div>
      </div>
      <div class="footer-cols">
        <nav class="footer-col" aria-label="Explorar">
          <p class="footer-heading">Explorar</p>
          <a href="index.html">Inicio</a>
          <a href="quienes-somos.html">¿Quiénes somos?</a>
          <a href="servicios.html">Nuestros servicios</a>
          <a href="tiendas.html">Conoce nuestras tiendas</a>
          <a href="bolsa-trabajo.html">Únete a nuestro equipo</a>
          <a href="index.html#testimonios-home">Clientes satisfechos</a>
          <a href="avisos.html">Noticias Yaavs</a>
          <a href="contacto.html">Contacto</a>
        </nav>
        <div class="footer-col">
          <p class="footer-heading">Contacto</p>
          <a href="tel:+525522331210">55 22 33 12 10</a>
          <a href="mailto:Hola@yaavs.com.mx">Hola@yaavs.com.mx</a>
          <a href="https://wa.me/525522331210?text=Hola%2C%20quiero%20informaci%C3%B3n%20de%20YAAVS" target="_blank" rel="noopener noreferrer" data-yaavs-track="whatsapp_click" data-yaavs-track-label="footer_link_whatsapp">WhatsApp</a>
          <a href="contacto.html">Formulario</a>
        </div>
        <nav class="footer-col" aria-label="Legal">
          <p class="footer-heading">Legal</p>
          <a href="terminos-condiciones.html">Términos y condiciones</a>
          <a href="aviso-privacidad.html">Aviso de privacidad</a>
          <a href="https://ganayaavs.com" target="_blank" rel="noopener noreferrer">Gana YAAVS</a>
        </nav>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="footer-copy">© <span id="year"></span> Grupo Comercial YAAVS · México</p>
      <details class="footer-legal">
        <summary>Bases del sorteo Gana YAAVS</summary>
        <p class="footer-legal-note">Consulta las bases completas en <a href="https://ganayaavs.com" target="_blank" rel="noopener noreferrer">ganayaavs.com</a>.</p>
      </details>
    </div>
  </div>
</footer>`,
  };

  function fallbackPartial(url) {
    const bare = String(url || "").split("?")[0].replace(/^\.\//, "");
    return FALLBACK_PARTIALS[bare] || "";
  }

  const ALLOWED_PARTIALS = new Set([
    "partials/header.html",
    "partials/footer.html",
    "partials/trust-strip.html",
    "partials/page-cta.html",
    "partials/social-float.html",
    "partials/yaavs-chatbot.html",
    "partials/site-floats.html",
  ]);

  function safePartialUrl(url) {
    const raw = String(url || "").trim();
    if (!raw || raw.includes("..") || /^https?:\/\//i.test(raw) || raw.startsWith("//")) {
      return "";
    }
    const bare = raw.split("?")[0].replace(/^\.\//, "");
    if (!ALLOWED_PARTIALS.has(bare)) return "";
    return raw;
  }

  async function loadPartial(url, mount) {
    if (!mount) return;
    const safeUrl = safePartialUrl(url);
    if (!safeUrl) {
      mount.innerHTML = "";
      return;
    }

    async function fromCache() {
      if (!("caches" in window)) return "";
      const candidates = [safeUrl, safeUrl.split("?")[0], `./${safeUrl.replace(/^\.\//, "")}`];
      for (const key of candidates) {
        let hit = await caches.match(key);
        if (!hit) hit = await caches.match(key, { ignoreSearch: true });
        if (hit) return hit.text();
      }
      return "";
    }

    try {
      const res = await fetch(safeUrl, { cache: "no-cache", credentials: "same-origin" });
      if (!res.ok) throw new Error(res.statusText);
      mount.innerHTML = await res.text();
    } catch {
      try {
        const cachedHtml = await fromCache();
        if (cachedHtml) {
          mount.innerHTML = cachedHtml;
          return;
        }
      } catch (_) {
        /* fall through */
      }

      const embedded = fallbackPartial(safeUrl);
      if (embedded) {
        mount.innerHTML = embedded;
        return;
      }

      mount.innerHTML = "";
    }
  }

  /** Activa layout del header corporativo (también si el partial cacheado es viejo). */
  function ensureHeaderNavBar() {
    const header = document.querySelector(".site-header");
    const mainNav = document.getElementById("main-nav");
    if (!header) return;
    header.classList.add("site-header--nav-bar", "site-header--corp");
    if (mainNav) {
      mainNav.classList.add("main-nav--bar", "main-nav--corp");
      document.querySelector(".header-inner")?.classList.add("header-inner--corp");
      document.querySelector(".header-menu")?.classList.add("header-menu--corp");
      document.querySelector(".logo-link")?.classList.add("logo-link--corp");
    }
  }

  /** Mantener el menú dentro del header (ya no va como overlay en body). */
  function ensureNavInHeader() {
    const mainNav = document.getElementById("main-nav");
    const headerInner = document.querySelector(".site-header .header-inner");
    const headerMenu = document.querySelector(".site-header .header-menu");
    if (!mainNav || !headerInner) return;
    if (headerInner.contains(mainNav)) return;
    if (headerMenu && headerMenu.parentElement === headerInner) {
      headerInner.insertBefore(mainNav, headerMenu);
    } else {
      headerInner.appendChild(mainNav);
    }
    delete mainNav.dataset.mounted;
  }

  function revealFloatingDock() {
    document.querySelectorAll(".social-float, .yaavbot").forEach((el) => {
      el.style.opacity = "1";
      el.style.visibility = "visible";
    });
  }

  async function mountSocialDock() {
    const existingDock = document.querySelector(".social-float[data-mounted='true']");
    if (existingDock) {
      revealFloatingDock();
      return;
    }

    const staticDock = document.querySelector(".social-float");
    if (staticDock) {
      staticDock.dataset.mounted = "true";
      revealFloatingDock();
      return;
    }

    const mount = document.createElement("div");
    mount.id = "social-float-mount";
    mount.hidden = true;
    document.body.appendChild(mount);

    await loadPartial("partials/social-float.html", mount);

    const dock = mount.querySelector(".social-float");
    if (!dock) {
      mount.remove();
      return;
    }

    document.body.appendChild(dock);
    dock.dataset.mounted = "true";
    mount.remove();
    revealFloatingDock();
  }

  function mountSiteFloats() {
    const floats = document.querySelector(".site-floats");
    if (!floats || floats.dataset.mounted === "true") return;
    document.body.insertBefore(floats, document.body.firstChild);
    floats.dataset.mounted = "true";
  }

  function initSocialFloatScroll() {
    if (document.querySelector("script[data-social-float-scroll]")) return;
    const s = document.createElement("script");
    s.src = "js/social-float-scroll.js";
    s.defer = true;
    s.dataset.socialFloatScroll = "true";
    document.body.appendChild(s);
  }

  async function mountChatbot() {
    if (document.querySelector("[data-yaavbot]")) {
      revealFloatingDock();
      return;
    }

    const mount = document.createElement("div");
    mount.id = "yaavbot-mount";
    mount.hidden = true;
    document.body.appendChild(mount);

    await loadPartial("partials/yaavs-chatbot.html?v=3", mount);

    const bot = mount.querySelector("[data-yaavbot]");
    if (!bot) {
      mount.remove();
      return;
    }

    document.body.appendChild(bot);
    mount.remove();

    if (!document.querySelector("script[data-yaavbot-config]")) {
      await new Promise((resolve) => {
        const cfg = document.createElement("script");
        cfg.src = "js/yaavs-chatbot.config.js?v=6";
        cfg.dataset.yaavbotConfig = "true";
        cfg.onload = resolve;
        cfg.onerror = resolve;
        document.body.appendChild(cfg);
      });
    }

    if (!document.querySelector("script[data-yaavbot-main]")) {
      await new Promise((resolve) => {
        const main = document.createElement("script");
        main.src = "js/yaavs-chatbot.js?v=7";
        main.dataset.yaavbotMain = "true";
        main.onload = resolve;
        main.onerror = resolve;
        document.body.appendChild(main);
      });
    }
  }

  function closeNavMenu() {
    const mainNav = document.getElementById("main-nav");
    const navToggle = document.getElementById("nav-toggle");
    mainNav?.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Abrir menú");
  }

  /** Anclas del menú hacia secciones del inicio (sin abrir otra página). */
  function initHomeSectionLinks() {
    document.querySelectorAll('a[href*="#testimonios-home"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = document.getElementById("testimonios-home");
        if (!target || !document.body.classList.contains("page-home")) return;
        e.preventDefault();
        closeNavMenu();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", "#testimonios-home");
      });
    });

    if (
      document.body.classList.contains("page-home") &&
      location.hash === "#testimonios-home"
    ) {
      window.setTimeout(() => {
        document
          .getElementById("testimonios-home")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }

  function initPostpagoNav() {
    if (!document.body.classList.contains("page-postpago")) return;

    document.querySelectorAll('a[href="#planes-pospago"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = document.getElementById("planes-pospago");
        if (!target) return;
        e.preventDefault();
        closeNavMenu();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", "#planes-pospago");
      });
    });

    if (location.hash === "#planes-pospago") {
      window.setTimeout(() => {
        document
          .getElementById("planes-pospago")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 160);
    }
  }

  const trustMount = document.getElementById("trust-strip");
  const ctaMount = document.getElementById("page-cta");

  function ensureFooterStyles() {
    if (document.querySelector('link[data-site-footer-css]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "site-footer.css?v=1";
    link.dataset.siteFooterCss = "true";
    document.head.appendChild(link);
  }

  function ensureYaavserLeadStyles() {
    if (
      document.querySelector('link[data-yaavser-lead-css]') ||
      document.querySelector('link[href*="yaavser-lead.css"]')
    ) {
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "yaavser-lead.css?v=5";
    link.dataset.yaavserLeadCss = "true";
    document.head.appendChild(link);
  }

  function loadScriptOnce(src, datasetKey) {
    const bare = src.split("?")[0];
    if (
      document.querySelector(`script[${datasetKey}]`) ||
      document.querySelector(`script[src^="${bare}"]`)
    ) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = src;
      s.defer = true;
      s.setAttribute(datasetKey, "true");
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.body.appendChild(s);
    });
  }

  async function initYaavserLead() {
    ensureYaavserLeadStyles();
    await loadScriptOnce("js/yaavser-lead.config.js?v=1", "data-yaavser-lead-config");
    await loadScriptOnce("js/yaavser-lead.js?v=8", "data-yaavser-lead-main");
    window.YaavsYaavserLead?.bindForms?.();
  }

  Promise.all([
    loadPartial("partials/header.html?v=32", headerMount),
    loadPartial("partials/footer.html?v=18", footerMount),
    loadPartial("partials/trust-strip.html", trustMount),
    loadPartial("partials/page-cta.html?v=5", ctaMount),
  ]).then(async () => {
    ensureFooterStyles();
    ensureNavInHeader();
    ensureHeaderNavBar();
    applyHeaderLogo(true);
    setActiveNav();
    initHeaderLogo();
    initNavToggle();
    initHeaderScroll();
    initHomeSectionLinks();
    initPostpagoNav();
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    document.dispatchEvent(new CustomEvent("yaavs:layout-ready"));
    initPageEnter();
    void initYaavserLead();

    const scheduleIdle = window.requestIdleCallback
      ? (cb) =>
          window.requestIdleCallback(cb, {
            timeout: window.YAAVS_PERF?.lite ? 4200 : window.YAAVS_PERF?.soft ? 2600 : 1800,
          })
      : (cb) => window.setTimeout(cb, window.YAAVS_PERF?.soft ? 1400 : 900);

    scheduleIdle(async () => {
      if (!window.YAAVS_PERF?.lite) mountSiteFloats();
      /* Redes sociales flotantes desactivadas a petición */
      /* await mountSocialDock(); */
      await mountChatbot();
      /* initSocialFloatScroll(); */
      initCookies();
      initAnalytics();
      initPwa();
      initAlerts();
      if (!window.YAAVS_PERF?.lite) initYaavsGame();
    });

    /* Sonic solo tras interacción o idle tardío */
    const armSonic = () => {
      void ensureSonic();
      window.removeEventListener("pointerdown", armSonic);
      window.removeEventListener("keydown", armSonic);
    };
    window.addEventListener("pointerdown", armSonic, { once: true, passive: true });
    window.addEventListener("keydown", armSonic, { once: true });
    scheduleIdle(() => void ensureSonic());
  });

  /* Arranca page-enter lo antes posible (sin esperar header/footer) */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initPageEnter(), { once: true });
  } else {
    initPageEnter();
  }

  function initPageEnter() {
    const finish = () => {
      if (!document.body.classList.contains("page-enter-done")) {
        window.YaavsPageEnter?.finishInstant?.();
      }
    };
    window.setTimeout(finish, 4000);

    if (document.querySelector("script[data-page-enter]")) {
      window.YaavsPageEnter?.play();
      return;
    }
    const s = document.createElement("script");
    s.src = "js/page-enter.js?v=7";
    s.dataset.pageEnter = "true";
    s.onload = () => window.YaavsPageEnter?.play();
    s.onerror = finish;
    document.body.appendChild(s);
  }

  function initCookies() {
    if (document.querySelector("script[data-yaavs-cookies]")) return;
    const s = document.createElement("script");
    s.src = "js/cookies.js?v=1";
    s.defer = true;
    s.dataset.yaavsCookies = "true";
    document.body.appendChild(s);
  }

  function initAnalytics() {
    if (document.querySelector("script[data-yaavs-analytics]")) return;
    const s = document.createElement("script");
    s.src = "js/yaavs-analytics.js?v=1";
    s.defer = true;
    s.dataset.yaavsAnalytics = "true";
    document.body.appendChild(s);
  }

  function initPwa() {
    if (document.querySelector("script[data-yaavs-pwa]")) return;
    const s = document.createElement("script");
    s.src = "js/pwa.js?v=6";
    s.defer = true;
    s.dataset.yaavsPwa = "true";
    document.body.appendChild(s);
  }

  function initAlerts() {
    if (document.querySelector("script[data-yaavs-alerts]")) return;
    const s = document.createElement("script");
    s.src = "js/yaavs-alerts.js?v=2";
    s.defer = true;
    s.dataset.yaavsAlerts = "true";
    document.body.appendChild(s);
  }

  function initYaavsGame() {
    if (document.querySelector("script[data-yaavs-game]")) return;
    const s = document.createElement("script");
    s.src = "js/yaavs-game.js";
    s.defer = true;
    s.dataset.yaavsGame = "true";
    document.body.appendChild(s);
  }
})();
