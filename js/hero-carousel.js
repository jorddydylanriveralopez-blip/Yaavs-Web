/**
 * Carrusel del banner — imágenes + promos neón sincronizadas.
 */
(function () {
  const cfg = window.YAAVS_HERO_CAROUSEL;
  if (!cfg) return;

  const hosts = document.querySelectorAll("[data-hero-carousel]");
  if (!hosts.length) return;

  const slides = (cfg.images || [])
    .filter(Boolean)
    .map((item) => {
      if (typeof item === "string") {
        return { src: item, alt: "", promo: null };
      }
      return {
        src: item.src || item.url,
        alt: item.alt || "",
        promo: item.promo || null,
      };
    })
    .filter((item) => item.src);

  if (slides.length < 2) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fallback = cfg.fallback || "assets/hero-bg.svg";
  const interval = Math.max(4000, cfg.interval || 7000);
  const transitionMs = cfg.transitionMs || 1400;

  function buildTrack() {
    const root = document.createElement("div");
    root.className = "hero-carousel";

    const track = document.createElement("div");
    track.className = "hero-carousel__track";
    root.appendChild(track);

    slides.forEach(({ src, alt }, i) => {
      const slide = document.createElement("div");
      slide.className = "hero-carousel__slide" + (i === 0 ? " is-active" : "");
      slide.style.setProperty("--carousel-ms", `${transitionMs}ms`);

      const img = document.createElement("img");
      img.src = src;
      img.alt = alt || "";
      img.decoding = "async";
      if (i === 0) img.fetchPriority = "high";
      else img.loading = "lazy";

      img.addEventListener("error", () => {
        if (img.src.endsWith(fallback)) return;
        img.src = fallback;
      });

      slide.appendChild(img);
      track.appendChild(slide);
    });

    return root;
  }

  function buildPromoSlide(promo, i) {
    const slide = document.createElement("article");
    slide.className = "hero-promo__slide" + (i === 0 ? " is-active" : "");
    slide.dataset.promoIndex = String(i);

    const box = document.createElement("div");
    box.className = "hero-promo__box";

    box.innerHTML = `
      <span class="hero-promo__scrim" aria-hidden="true"></span>
      <span class="hero-promo__rail" aria-hidden="true"></span>
      <div class="hero-promo__inner">
        <p class="hero-promo__eyebrow">
          <span class="hero-promo__badge">${promo.badge || "YAAVS"}</span>
          ${promo.kicker ? `<span class="hero-promo__dot" aria-hidden="true">·</span><span class="hero-promo__kicker">${promo.kicker}</span>` : ""}
        </p>
        <h2 class="hero-promo__title">
          ${promo.title || ""}${promo.accent ? ` <span class="hero-promo__accent">${promo.accent}</span>` : ""}
        </h2>
        <p class="hero-promo__lead">${promo.lead || ""}</p>
        ${
          promo.cta && promo.href
            ? `<a class="hero-promo__cta" href="${promo.href}"><span>${promo.cta}</span></a>`
            : ""
        }
      </div>
    `;

    slide.appendChild(box);
    return slide;
  }

  function buildPromoRoot() {
    const root = document.createElement("div");
    root.className = "hero-promo hero-promo--billboard";
    root.setAttribute("data-hero-promo", "");
    root.setAttribute("aria-live", "polite");

    slides.forEach((item, i) => {
      if (!item.promo) return;
      root.appendChild(buildPromoSlide(item.promo, i));
    });

    return root.children.length ? root : null;
  }

  const tracks = [];
  hosts.forEach((host) => {
    host.classList.add("hero-carousel-host");
    host.replaceChildren(buildTrack());
    tracks.push(host.querySelector(".hero-carousel__track"));
  });

  const heroBanner = document.querySelector(".hero-banner");
  const promoMount = document.querySelector("[data-hero-promo-mount]");
  const promoRoot = buildPromoRoot();
  if (promoMount && promoRoot) {
    promoMount.replaceChildren(promoRoot);
  }

  let index = 0;
  let timer = 0;

  function syncSlideUi() {
    document.body.dataset.heroSlide = String(index);
    document.body.dataset.heroAlign = "left";
    if (!heroBanner) return;
    heroBanner.classList.remove("hero-banner--align-right");
    heroBanner.classList.add("hero-banner--align-left");
  }

  function syncPromo() {
    if (!promoRoot) return;
    promoRoot.querySelectorAll(".hero-promo__slide").forEach((el, i) => {
      const match = Number(el.dataset.promoIndex) === index;
      el.classList.toggle("is-active", match);
      el.setAttribute("aria-hidden", match ? "false" : "true");
    });
  }

  function goTo(next) {
    index = (next + slides.length) % slides.length;
    tracks.forEach((track) => {
      track.querySelectorAll(".hero-carousel__slide").forEach((el, i) => {
        el.classList.toggle("is-active", i === index);
      });
    });
    document.querySelectorAll(".hero-carousel__dot").forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    syncSlideUi();
    syncPromo();
  }

  syncSlideUi();
  syncPromo();

  if (reducedMotion) return;

  function startTimer() {
    clearInterval(timer);
    timer = window.setInterval(() => goTo(index + 1), interval);
  }

  const banner = document.querySelector(".hero-banner");
  if (banner) {
    const dots = document.createElement("div");
    dots.className = "hero-carousel__dots";
    dots.setAttribute("role", "tablist");
    dots.setAttribute("aria-label", "Promociones del banner");

    slides.forEach((item, i) => {
      const label = item.promo?.badge || item.alt || `Promo ${i + 1}`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hero-carousel__dot" + (i === 0 ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", `${label} — ${i + 1} de ${slides.length}`);
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.addEventListener("click", () => {
        goTo(i);
        startTimer();
        window.YaavsSonic?.play?.();
      });
      dots.appendChild(btn);
    });

    banner.appendChild(dots);
  }

  document.body.classList.add("hero-carousel--kenburns");
  startTimer();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInterval(timer);
    else startTimer();
  });
})();
