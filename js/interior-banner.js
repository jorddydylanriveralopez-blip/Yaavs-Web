(function () {
  const section = document.querySelector(".page-hero-banner");
  const host = document.querySelector("[data-page-banner-media]");
  if (!section || !host) return;

  const page = document.body.dataset.page || "";
  const cfg = (window.YAAVS_PAGE_BANNERS || {})[page] || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const intervalMs = cfg.interval || 6000;

  function showFallback(kind) {
    section.classList.add("avisos-hero-banner--fallback");
    if (kind === "gif" && cfg.gif) {
      const img = document.createElement("img");
      img.className = "avisos-hero-banner__gif";
      img.src = cfg.gif;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.decoding = "async";
      host.appendChild(img);
      return;
    }
    if (cfg.poster) {
      host.style.backgroundImage = `url("${cfg.poster}")`;
    }
  }

  function mountSlideshow() {
    const images = (cfg.images || []).filter(Boolean);
    if (!images.length) {
      showFallback(cfg.gif ? "gif" : "poster");
      return;
    }

    const slides = images.map((src, i) => {
      const img = document.createElement("img");
      img.className = "page-hero-banner__slide";
      img.src = src;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      img.decoding = "async";
      img.loading = i === 0 ? "eager" : "lazy";
      if (i === 0) img.classList.add("is-active");
      host.appendChild(img);
      return img;
    });

    if (slides.length < 2 || reducedMotion) {
      host.style.backgroundImage = `url("${images[0]}")`;
      slides.forEach((img) => img.remove());
      return;
    }

    let index = 0;
    window.setInterval(() => {
      slides[index].classList.remove("is-active");
      index = (index + 1) % slides.length;
      slides[index].classList.add("is-active");
    }, intervalMs);
  }

  function mountVideo() {
    if (!cfg.mp4 && !cfg.webm) {
      mountSlideshow();
      return;
    }

    const video = document.createElement("video");
    video.className = "avisos-hero-banner__video";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = !reducedMotion;
    video.setAttribute("playsinline", "");
    video.setAttribute("preload", "auto");
    if (cfg.poster) video.poster = cfg.poster;

    if (cfg.mp4) {
      const mp4 = document.createElement("source");
      mp4.src = cfg.mp4;
      mp4.type = "video/mp4";
      video.appendChild(mp4);
    }
    if (cfg.webm) {
      const webm = document.createElement("source");
      webm.src = cfg.webm;
      webm.type = "video/webm";
      video.appendChild(webm);
    }

    video.addEventListener("error", () => {
      video.remove();
      if (cfg.gif) {
        showFallback("gif");
      } else if ((cfg.images || []).length) {
        mountSlideshow();
      } else {
        showFallback("poster");
      }
    });

    video.addEventListener("loadeddata", () => {
      section.classList.remove("avisos-hero-banner--fallback");
      if (!reducedMotion) {
        const play = video.play();
        if (play && typeof play.catch === "function") {
          play.catch(() => {
            if (cfg.gif) showFallback("gif");
            else mountSlideshow();
          });
        }
      }
    });

    host.appendChild(video);

    if (!cfg.mp4 && !cfg.webm) {
      video.remove();
      if (cfg.gif) showFallback("gif");
      else mountSlideshow();
      return;
    }

    if (!reducedMotion) {
      const play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(() => {
          if (cfg.gif) showFallback("gif");
          else mountSlideshow();
        });
      }
    }
  }

  if (!cfg.mp4 && !cfg.webm && !cfg.gif && !(cfg.images || []).length) {
    showFallback("poster");
  } else if (!cfg.mp4 && !cfg.webm && !cfg.gif) {
    mountSlideshow();
  } else {
    mountVideo();
  }
})();
