/**
 * Carrusel del banner (5 imágenes) — sincronizado en page-bg y hero-banner.
 */
(function () {
  const cfg = window.YAAVS_HERO_CAROUSEL;
  if (!cfg) return;

  const hosts = document.querySelectorAll("[data-hero-carousel]");
  if (!hosts.length) return;

  const slides = (cfg.images || [])
    .filter(Boolean)
    .map((item) =>
      typeof item === "string"
        ? { src: item, alt: "" }
        : { src: item.src || item.url, alt: item.alt || "" }
    )
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

  const tracks = [];
  hosts.forEach((host) => {
    host.classList.add("hero-carousel-host");
    host.replaceChildren(buildTrack());
    tracks.push(host.querySelector(".hero-carousel__track"));
  });

  let index = 0;
  let timer = 0;

  const heroHome = document.querySelector(".hero-home");

  function syncSlideUi() {
    const alignRight = index % 2 === 1;
    document.body.dataset.heroSlide = String(index);
    document.body.dataset.heroAlign = alignRight ? "right" : "left";
    if (!heroHome) return;
    heroHome.classList.toggle("hero-home--align-right", alignRight);
    heroHome.classList.toggle("hero-home--align-left", !alignRight);
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
  }

  syncSlideUi();

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
    dots.setAttribute("aria-label", "Cambiar imagen del banner");

    slides.forEach((_, i) => {
      const label = slides[i].alt || `Imagen ${i + 1}`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hero-carousel__dot" + (i === 0 ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", `${label} — ${i + 1} de ${slides.length}`);
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.addEventListener("click", () => {
        goTo(i);
        startTimer();
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
