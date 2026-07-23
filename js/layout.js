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

  /** Home: logo blanco arriba; color al scroll. Interiores: logo a color. */
  function initHeaderLogo() {
    const img = document.querySelector(".site-header .logo");
    if (!img) return;

    const picture = img.closest("picture");
    picture?.querySelectorAll("source").forEach((source) => source.remove());

    const isHome = document.body.classList.contains("page-home");
    const header = document.getElementById("header");
    const scrolled = header?.classList.contains("is-scrolled");

    if (isHome && !scrolled) {
      img.src = "assets/yaavs-logo-white.png?v=2";
      img.classList.add("logo--white");
      img.classList.remove("logo--on-light");
    } else {
      img.src = "assets/yaavs-logo-on-light.png?v=3";
      img.classList.add("logo--on-light");
      img.classList.remove("logo--white");
    }
    img.style.setProperty("--logo-filter", "none");
    img.style.filter = "none";
  }

  function initNavToggle() {
    const navToggle = document.getElementById("nav-toggle");
    const mainNav = document.getElementById("main-nav");
    if (!navToggle || !mainNav) return;

    function setMenuOpen(open) {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      mainNav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    }

    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      setMenuOpen(open);
    });

    /* Clic fuera del panel (backdrop / página) cierra el menú */
    document.addEventListener("click", (e) => {
      if (!document.body.classList.contains("nav-open")) return;
      if (mainNav.contains(e.target) || navToggle.contains(e.target)) return;
      setMenuOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mainNav.classList.contains("is-open")) {
        setMenuOpen(false);
      }
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });
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
      /* Offset tipo RSNL sticky_effects (~160px) para el shrink */
      if (!hasTallBanner || !banner) return 120;
      return Math.max(140, Math.min(200, banner.offsetHeight * 0.14));
    }

    function onScroll() {
      const scrolled = window.scrollY > getThreshold();
      const changed = header.classList.contains("is-scrolled") !== scrolled;
      header.classList.toggle("is-scrolled", scrolled);
      document.body.classList.toggle("header-scrolled", scrolled);
      if (changed) initHeaderLogo();
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

  async function loadPartial(url, mount) {
    if (!mount) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      mount.innerHTML = await res.text();
    } catch {
      mount.innerHTML =
        '<p class="layout-error">No se pudo cargar el menú. Abre el sitio con un servidor local (Live Server).</p>';
    }
  }

  function mountNavOverlay() {
    const mainNav = document.getElementById("main-nav");
    if (!mainNav || mainNav.dataset.mounted === "true") return;
    document.body.appendChild(mainNav);
    mainNav.dataset.mounted = "true";
  }

  function revealFloatingDock() {
    document.querySelectorAll(".social-float, .yaavbot").forEach((el) => {
      el.style.opacity = "1";
      el.style.visibility = "visible";
    });
  }

  async function mountSocialDock() {
    if (document.body.classList.contains("page-home")) return;

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

    await loadPartial("partials/yaavs-chatbot.html", mount);

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
        cfg.src = "js/yaavs-chatbot.config.js";
        cfg.dataset.yaavbotConfig = "true";
        cfg.onload = resolve;
        cfg.onerror = resolve;
        document.body.appendChild(cfg);
      });
    }

    if (!document.querySelector("script[data-yaavbot-main]")) {
      await new Promise((resolve) => {
        const main = document.createElement("script");
        main.src = "js/yaavs-chatbot.js";
        main.dataset.yaavbotMain = "true";
        main.onload = resolve;
        main.onerror = resolve;
        document.body.appendChild(main);
      });
    }
  }

  const trustMount = document.getElementById("trust-strip");
  const ctaMount = document.getElementById("page-cta");

  Promise.all([
    loadPartial("partials/header.html?v=9", headerMount),
    loadPartial("partials/footer.html?v=8", footerMount),
    loadPartial("partials/trust-strip.html", trustMount),
    loadPartial("partials/page-cta.html", ctaMount),
  ]).then(async () => {
    await ensureSonic();
    mountSiteFloats();
    mountNavOverlay();
    await mountSocialDock();
    await mountChatbot();
    initSocialFloatScroll();
    setActiveNav();
    initHeaderLogo();
    initNavToggle();
    initHeaderScroll();
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    document.dispatchEvent(new CustomEvent("yaavs:layout-ready"));
    initPageEnter();
    initYaavsGame();
  });

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
    s.src = "js/page-enter.js?v=3";
    s.dataset.pageEnter = "true";
    s.onload = () => window.YaavsPageEnter?.play();
    s.onerror = finish;
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
