(function () {
  const section = document.querySelector(".avisos-hero-banner");
  const host = document.querySelector("[data-avisos-banner-media]");
  if (!section || !host) return;

  const cfg = window.YAAVS_AVISOS_BANNER || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  function mountVideo() {
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
      showFallback(cfg.gif ? "gif" : "poster");
    });

    video.addEventListener("loadeddata", () => {
      section.classList.remove("avisos-hero-banner--fallback");
      if (!reducedMotion) {
        const play = video.play();
        if (play && typeof play.catch === "function") play.catch(() => {});
      }
    });

    host.appendChild(video);

    if (!cfg.mp4 && !cfg.webm) {
      video.remove();
      showFallback(cfg.gif ? "gif" : "poster");
      return;
    }

    if (!reducedMotion) {
      const play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(() => showFallback(cfg.gif ? "gif" : "poster"));
      }
    }
  }

  mountVideo();
})();
