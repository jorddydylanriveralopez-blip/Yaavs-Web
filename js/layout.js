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
      s.src = "js/yaavs-sonic.js";
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

    mainNav.addEventListener("click", (e) => {
      if (e.target === mainNav) setMenuOpen(false);
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
      if (!hasTallBanner || !banner) return 24;
      return Math.max(48, banner.offsetHeight * 0.12);
    }

    function onScroll() {
      const scrolled = window.scrollY > getThreshold();
      header.classList.toggle("is-scrolled", scrolled);
      document.body.classList.toggle("header-scrolled", scrolled);
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
    document.querySelectorAll(".social-float").forEach((el) => {
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

  function initSocialFloatFade() {
    const dock = document.querySelector(".social-float");
    if (!dock) return;

    function onScroll() {
      const fade = Math.max(0.35, 1 - window.scrollY / 1100);
      dock.style.opacity = String(fade.toFixed(3));
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  }

  function mountSiteFloats() {
    const floats = document.querySelector(".site-floats");
    if (!floats || floats.dataset.mounted === "true") return;
    document.body.insertBefore(floats, document.body.firstChild);
    floats.dataset.mounted = "true";
  }

  function initTrustStrip() {
    const strip = document.querySelector(".trust-strip");
    if (!strip) return;

    const runCounters = () => {
      strip.querySelectorAll("[data-count-to]").forEach((el) => {
        const target = parseInt(el.dataset.countTo, 10);
        const prefix = el.dataset.countPrefix || "";
        const suffix = el.dataset.countSuffix || "";
        const duration = 1400;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      strip.classList.add("is-in");
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        strip.classList.add("is-in");
        runCounters();
        io.disconnect();
      });
    }, { threshold: 0.35 });
    io.observe(strip);
  }

  const trustMount = document.getElementById("trust-strip");
  const ctaMount = document.getElementById("page-cta");

  Promise.all([
    loadPartial("partials/header.html", headerMount),
    loadPartial("partials/footer.html", footerMount),
    loadPartial("partials/trust-strip.html", trustMount),
    loadPartial("partials/page-cta.html", ctaMount),
  ]).then(async () => {
    await ensureSonic();
    mountSiteFloats();
    mountNavOverlay();
    await mountSocialDock();
    initSocialFloatFade();
    initTrustStrip();
    setActiveNav();
    initNavToggle();
    initHeaderScroll();
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    document.dispatchEvent(new CustomEvent("yaavs:layout-ready"));
    initYaavsGame();
  });

  function initYaavsGame() {
    if (document.querySelector("script[data-yaavs-game]")) return;
    const s = document.createElement("script");
    s.src = "js/yaavs-game.js";
    s.defer = true;
    s.dataset.yaavsGame = "true";
    document.body.appendChild(s);
  }
})();
