/**
 * Carrusel del banner — imágenes + promos neón sincronizadas.
 * Desktop: `src` · Móvil (≤768px): `srcMobile` vía <picture>.
 */
(function () {
  const cfg = window.YAAVS_HERO_CAROUSEL;
  if (!cfg) return;

  const hosts = document.querySelectorAll("[data-hero-carousel]");
  if (!hosts.length) return;

  const MOBILE_MQ = window.matchMedia("(max-width: 768px)");
  const slideDefaults = cfg.slideDefaults || {};
  let floatLayer = null;

  const slides = (cfg.images || [])
    .filter(Boolean)
    .map((item) => {
      if (typeof item === "string") {
        return { src: item, alt: "", promo: null, ...slideDefaults };
      }
      return {
        ...slideDefaults,
        src: item.src || item.url || "",
        srcMobile: item.srcMobile || "",
        alt: item.alt || "",
        promo: item.promo || null,
        hidePromo: Boolean(item.hidePromo),
        lightShade: Boolean(item.lightShade),
        lightBg: Boolean(item.lightBg),
        videoSlide: Boolean(item.videoSlide),
        videoBanner: Boolean(item.videoBanner),
        videoLabel: item.videoLabel || "Video empresarial",
        videoHint: item.videoHint || "Próximamente",
        videoSrc: item.videoSrc || "",
        videoSrcMobile: item.videoSrcMobile || "",
        duration: Number(item.duration) || 0,
        objectPosition: item.objectPosition || slideDefaults.objectPosition || "",
        objectPositionMobile: item.objectPositionMobile || slideDefaults.objectPositionMobile || "",
        objectFit: item.objectFit || slideDefaults.objectFit || "",
        objectFitMobile: item.objectFitMobile || slideDefaults.objectFitMobile || "",
        width: item.width || 0,
        height: item.height || 0,
        widthMobile: item.widthMobile || slideDefaults.widthMobile || 0,
        heightMobile: item.heightMobile || slideDefaults.heightMobile || 0,
        href: item.href || "",
      };
    })
    .filter((item) => item.src || item.videoSrc || item.videoSrcMobile);

  if (slides.length < 2) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fallback = cfg.fallback || "assets/hero-bg.svg";
  const interval = Math.max(4000, cfg.interval || 7000);
  const transitionMs = cfg.transitionMs || 1400;
  const mobileBreakpoint = cfg.mobileBreakpoint || "(max-width: 768px)";

  function isMobileViewport() {
    return window.matchMedia(mobileBreakpoint).matches;
  }

  function getSlideDisplaySrc(slide) {
    if (isMobileViewport() && slide.srcMobile) return slide.srcMobile;
    return slide.src;
  }

  function applyImagePresentation(img, slide) {
    const mobile = isMobileViewport();
    const objectPosition = mobile
      ? slide.objectPositionMobile || slide.objectPosition
      : slide.objectPosition;
    const objectFit = mobile ? slide.objectFitMobile || slide.objectFit : slide.objectFit;

    if (objectPosition) img.style.objectPosition = objectPosition;
    else img.style.removeProperty("object-position");

    if (objectFit) img.style.objectFit = objectFit;
    else img.style.removeProperty("object-fit");
  }

  function buildResponsiveImage(slide, i, options) {
    const opts = options || {};
    const { src, srcMobile, alt, width, height, widthMobile, heightMobile, hidePromo } = slide;
    const imgClass = [opts.className, hidePromo ? "hero-carousel__slide-figure" : ""]
      .filter(Boolean)
      .join(" ");
    const desktopW = width || 0;
    const desktopH = height || 0;
    const mobileW = widthMobile || slideDefaults.widthMobile || 1080;
    const mobileH = heightMobile || slideDefaults.heightMobile || 2400;
    const eager = opts.fetchPriority === "high";

    const attachImg = (img) => {
      img.className = imgClass;
      img.alt = alt || "";
      img.decoding = "async";
      if (desktopW) img.width = desktopW;
      if (desktopH) img.height = desktopH;
      img.sizes = "100vw";
      if (eager) img.fetchPriority = "high";
      else if (typeof i === "number" && i > 0) img.loading = "lazy";
      img.src = isMobileViewport() && srcMobile ? srcMobile : src;
      applyImagePresentation(img, slide);
      img.addEventListener("error", () => {
        if (img.src.endsWith(fallback)) return;
        img.src = fallback;
      });
      return img;
    };

    if (srcMobile) {
      const picture = document.createElement("picture");
      picture.className = opts.pictureClass || "hero-carousel__picture";

      const source = document.createElement("source");
      source.media = mobileBreakpoint;
      source.srcset = srcMobile;
      source.width = mobileW;
      source.height = mobileH;
      picture.appendChild(source);
      picture.appendChild(attachImg(document.createElement("img")));
      return picture;
    }

    return attachImg(document.createElement("img"));
  }

  function buildSlideImage(slide, i) {
    return buildResponsiveImage(slide, i, {});
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function wordsToMarkup(text, wordClass, offset) {
    const start = Number.isFinite(offset) ? offset : 0;
    return String(text || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(
        (word, i) =>
          `<span class="hero-word ${wordClass}" style="--word-i:${start + i}">${escapeHtml(word)}</span>`
      )
      .join(" ");
  }

  function getSlideVideoSrc(slide) {
    if (isMobileViewport()) return slide.videoSrcMobile || slide.videoSrc || "";
    return slide.videoSrc || slide.videoSrcMobile || "";
  }

  function buildVideoBannerContent(slide, i) {
    const wrap = document.createElement("div");
    wrap.className = "hero-carousel__video hero-carousel__video--banner is-playing";

    const media = document.createElement("div");
    media.className = "hero-carousel__video-media";

    if (slide.src || slide.srcMobile) {
      media.appendChild(
        buildResponsiveImage(slide, i, { className: "hero-carousel__video-poster-img" })
      );
    }

    const video = document.createElement("video");
    video.className = "hero-carousel__video-el";
    video.muted = true;
    /* No loop: el carrusel avanza cuando el video termina (evento "ended") */
    video.loop = false;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("preload", i === 0 ? "auto" : "metadata");
    if (slide.src || slide.srcMobile) video.poster = getSlideDisplaySrc(slide);
    video.setAttribute("aria-label", slide.alt || "Banner YAAVS");

    const source = document.createElement("source");
    source.src = getSlideVideoSrc(slide);
    source.type = "video/mp4";
    video.appendChild(source);
    media.appendChild(video);

    wrap.appendChild(media);
    return wrap;
  }

  function buildVideoSlideContent(slide, i) {
    const wrap = document.createElement("div");
    wrap.className = "hero-carousel__video";

    const media = document.createElement("div");
    media.className = "hero-carousel__video-media";
    media.appendChild(
      buildResponsiveImage(slide, i, { className: "hero-carousel__video-poster-img" })
    );

    const shade = document.createElement("div");
    shade.className = "hero-carousel__video-shade";
    shade.setAttribute("aria-hidden", "true");

    const overlay = document.createElement("div");
    overlay.className = "hero-carousel__video-overlay";
    overlay.innerHTML = `
      <p class="hero-carousel__video-badge">${slide.videoLabel || "Video empresarial"}</p>
      <button type="button" class="hero-carousel__video-play" aria-label="${slide.videoLabel || "Video empresarial"} YAAVS — ${slide.videoHint || "Próximamente"}" disabled>
        <span class="hero-carousel__video-play-ring" aria-hidden="true"></span>
        <svg viewBox="0 0 88 88" fill="currentColor" aria-hidden="true">
          <circle cx="44" cy="44" r="42" fill="none" stroke="currentColor" stroke-width="2" opacity="0.35"/>
          <path d="M36 28 L36 60 L62 44 Z"/>
        </svg>
      </button>
      <p class="hero-carousel__video-soon">${slide.videoHint || "Próximamente"}</p>
    `;

    const controls = document.createElement("div");
    controls.className = "hero-carousel__video-controls";
    controls.setAttribute("aria-hidden", "true");
    controls.innerHTML = `
      <div class="hero-carousel__video-progress"><span></span></div>
      <span class="hero-carousel__video-time">00:00 / —:——</span>
    `;

    wrap.appendChild(media);
    wrap.appendChild(shade);
    wrap.appendChild(overlay);
    wrap.appendChild(controls);

    const videoSrc = slide.videoSrcMobile || slide.videoSrc
      ? isMobileViewport()
        ? slide.videoSrcMobile || slide.videoSrc
        : slide.videoSrc
      : "";
    if (videoSrc) {
      const video = document.createElement("video");
      video.className = "hero-carousel__video-el";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("preload", "metadata");
      video.poster = getSlideDisplaySrc(slide);
      const source = document.createElement("source");
      source.src = videoSrc;
      source.type = "video/mp4";
      video.appendChild(source);
      media.appendChild(video);
      const playBtn = overlay.querySelector(".hero-carousel__video-play");
      if (playBtn) {
        playBtn.disabled = false;
        playBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          wrap.classList.toggle("is-playing", video.paused);
          if (video.paused) video.play().catch(() => {});
          else video.pause();
        });
        video.addEventListener("play", () => wrap.classList.add("is-playing"));
        video.addEventListener("pause", () => wrap.classList.remove("is-playing"));
      }
    }

    return wrap;
  }

  function buildTrack() {
    const root = document.createElement("div");
    root.className = "hero-carousel";

    const track = document.createElement("div");
    track.className = "hero-carousel__track";
    root.appendChild(track);

    slides.forEach((slide, i) => {
      const slideEl = document.createElement("div");
      slideEl.className = "hero-carousel__slide" + (i === 0 ? " is-active" : "");
      if (slide.hidePromo) slideEl.classList.add("hero-carousel__slide--graphic");
      if (slide.videoSlide || slide.videoBanner) slideEl.classList.add("hero-carousel__slide--video");
      if (slide.videoBanner) slideEl.classList.add("hero-carousel__slide--video-banner");
      slideEl.style.setProperty("--carousel-ms", `${transitionMs}ms`);
      slideEl.appendChild(
        slide.videoBanner
          ? buildVideoBannerContent(slide, i)
          : slide.videoSlide
            ? buildVideoSlideContent(slide, i)
            : buildSlideImage(slide, i)
      );
      track.appendChild(slideEl);
    });

    return root;
  }

  function buildPromoSlide(promo, i) {
    const title = String(promo.title || "").trim();
    const accent = String(promo.accent || "").trim();
    const lead = String(promo.lead || "").trim();
    const logo = String(promo.logo || "").trim();
    const variant = String(promo.variant || "").trim();
    const isBrand = variant === "brand" || Boolean(logo);
    const titleWords = wordsToMarkup(title, "hero-word--title", 0);
    const titleWordCount = title ? title.split(/\s+/).filter(Boolean).length : 0;
    const accentWords = accent
      ? `<span class="hero-promo__accent">${wordsToMarkup(accent, "hero-word--accent", titleWordCount)}</span>`
      : "";
    const fullTitle = [titleWords, accentWords].filter(Boolean).join(" ");
    const titleBlock = logo
      ? `<div class="hero-promo__brand-lockup">
          <span class="hero-promo__brand-glow" aria-hidden="true"></span>
          <span class="hero-promo__brand-ring" aria-hidden="true"></span>
          <img class="hero-promo__brand-logo" src="${logo}" alt="YAAVS" width="346" height="82" decoding="async">
        </div>`
      : `<h2 class="hero-promo__title">${fullTitle}</h2>`;
    const ctaClass = isBrand ? "hero-promo__cta hero-promo__cta--pill" : "hero-promo__cta";
    const innerClass = isBrand
      ? "hero-promo__inner hero-promo__inner--brand"
      : "hero-promo__inner";

    const slide = document.createElement("article");
    slide.className =
      "hero-promo__slide" +
      (i === 0 ? " is-active" : "") +
      (isBrand ? " hero-promo__slide--brand" : "");
    slide.dataset.promoIndex = String(i);

    const box = document.createElement("div");
    box.className = "hero-promo__box";

    box.innerHTML = `
      <span class="hero-promo__scrim" aria-hidden="true"></span>
      <span class="hero-promo__rail" aria-hidden="true"></span>
      <div class="${innerClass}">
        <p class="hero-promo__eyebrow">
          <span class="hero-promo__badge">${promo.badge || "YAAVS"}</span>
          ${promo.kicker ? `<span class="hero-promo__dot" aria-hidden="true">·</span><span class="hero-promo__kicker">${promo.kicker}</span>` : ""}
        </p>
        ${titleBlock}
        <p class="hero-promo__lead">${wordsToMarkup(lead, "hero-word--lead", titleWordCount + (accent ? accent.split(/\s+/).filter(Boolean).length : 0))}</p>
        ${
          promo.cta && promo.href
            ? `<a class="${ctaClass}" href="${promo.href}"><span>${promo.cta}</span></a>`
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
      if (!item.promo || item.videoSlide || item.videoBanner) return;
      root.appendChild(buildPromoSlide(item.promo, i));
    });

    return root.children.length ? root : null;
  }

  const hostList = Array.from(hosts);
  const mainHost =
    hostList.find((host) => host.closest(".hero-banner__visual")) ||
    hostList[hostList.length - 1];
  const bgHost = hostList.find((host) => host.closest(".page-bg__media")) || null;

  const tracks = [];
  let bgSyncRoot = null;

  const carouselRoot = buildTrack();
  mainHost.classList.add("hero-carousel-host");
  mainHost.replaceChildren(carouselRoot);
  tracks.push(carouselRoot.querySelector(".hero-carousel__track"));

  if (bgHost && bgHost !== mainHost) {
    bgHost.classList.add("hero-carousel-host");
    bgSyncRoot = buildResponsiveImage(slides[0], 0, {
      className: "hero-carousel__bg-sync",
      fetchPriority: "high",
    });
    bgHost.replaceChildren(bgSyncRoot);
  }

  hostList.forEach((host) => {
    if (host === mainHost || host === bgHost) return;
    host.classList.add("hero-carousel-host");
    host.replaceChildren(carouselRoot.cloneNode(true));
    tracks.push(host.querySelector(".hero-carousel__track"));
  });

  const heroBanner = document.querySelector(".hero-banner");
  let bannerLink = null;

  function ensureBannerLink() {
    if (!heroBanner || bannerLink) return;
    bannerLink = document.createElement("a");
    bannerLink.className = "hero-banner__slide-link";
    bannerLink.target = "_blank";
    bannerLink.rel = "noopener noreferrer";
    bannerLink.hidden = true;
    bannerLink.tabIndex = -1;
    const anchor = heroBanner.querySelector(".hero-particles");
    if (anchor) heroBanner.insertBefore(bannerLink, anchor);
    else heroBanner.appendChild(bannerLink);
  }

  function syncBannerLink() {
    ensureBannerLink();
    if (!bannerLink) return;
    const current = slides[index];
    const href = current?.href;
    if (current?.hidePromo && href) {
      bannerLink.href = href;
      bannerLink.setAttribute("aria-label", current.alt || "Abrir enlace");
      bannerLink.hidden = false;
      bannerLink.tabIndex = 0;
    } else {
      bannerLink.hidden = true;
      bannerLink.tabIndex = -1;
      bannerLink.removeAttribute("href");
    }
  }

  const promoMount = document.querySelector("[data-hero-promo-mount]");
  const promoRoot = buildPromoRoot();
  if (promoMount && promoRoot) {
    promoMount.replaceChildren(promoRoot);
  }

  let index = 0;
  let timer = 0;
  let autoplayActive = false;
  let autoplayProgress = null;

  function setSlideStates(previousIndex, direction) {
    const dir = direction < 0 ? "prev" : "next";
    tracks.forEach((track) => {
      track.dataset.heroDir = dir;
      track.querySelectorAll(".hero-carousel__slide").forEach((el, i) => {
        const isActive = i === index;
        const isLeaving = previousIndex !== index && i === previousIndex;
        el.classList.toggle("is-active", isActive);
        el.dataset.state = isActive ? "active" : isLeaving ? "leaving" : "idle";
      });
    });
    if (heroBanner) heroBanner.dataset.heroDir = dir;
  }

  function animatePromoWords() {
    if (!promoRoot) return;
    const active = promoRoot.querySelector(`.hero-promo__slide[data-promo-index="${index}"]`);
    promoRoot.querySelectorAll(".hero-promo__slide").forEach((el) => {
      if (el !== active) el.classList.remove("is-revealing");
    });
    if (!active) return;
    active.classList.remove("is-revealing");
    void active.offsetWidth;
    active.classList.add("is-revealing");
  }

  function slideSrcMatches(el, src) {
    if (!el?.src || !src) return false;
    try {
      const wanted = new URL(src, location.href).pathname;
      const current = new URL(el.src).pathname;
      return wanted === current;
    } catch {
      return el.src.endsWith(src);
    }
  }

  function syncBgImage() {
    if (!bgSyncRoot) return;
    const current = slides[index];
    const source = bgSyncRoot.querySelector("source");
    const img = bgSyncRoot.querySelector("img") || bgSyncRoot;
    const displaySrc = getSlideDisplaySrc(current);

    if (source && current.srcMobile) {
      source.srcset = current.srcMobile;
    }
    if (img && displaySrc && !slideSrcMatches(img, displaySrc)) {
      img.src = displaySrc;
    }
    if (img) applyImagePresentation(img, current);
  }

  function syncSlideImagesPresentation() {
    tracks.forEach((track) => {
      track.querySelectorAll(".hero-carousel__slide").forEach((slideEl, i) => {
        const slide = slides[i];
        const img = slideEl.querySelector("img");
        if (!img) return;
        const displaySrc = getSlideDisplaySrc(slide);
        if (displaySrc && !slideSrcMatches(img, displaySrc)) {
          img.src = displaySrc;
        }
        applyImagePresentation(img, slide);
      });
    });
  }

  function syncBannerVideos() {
    tracks.forEach((track) => {
      track.querySelectorAll(".hero-carousel__slide").forEach((slideEl, i) => {
        const slide = slides[i];
        const video = slideEl.querySelector(".hero-carousel__video-el");
        if (!video || !slide) return;

        const desiredSrc = getSlideVideoSrc(slide);
        const source = video.querySelector("source");
        if (desiredSrc && source && source.getAttribute("src") !== desiredSrc) {
          source.src = desiredSrc;
          video.load();
        }

        if (slide.videoBanner && !video.dataset.endedBound) {
          video.dataset.endedBound = "1";
          video.addEventListener("ended", () => handleBannerVideoEnded(i));
        }

        if (i === index && (slide.videoBanner || slide.videoSlide)) {
          video.muted = true;
          const play = video.play();
          if (play && typeof play.catch === "function") play.catch(() => {});
          slideEl.querySelector(".hero-carousel__video")?.classList.add("is-playing");
        } else {
          video.pause();
          try {
            video.currentTime = 0;
          } catch (_) {
            /* noop */
          }
          if (slide.videoBanner) {
            slideEl.querySelector(".hero-carousel__video")?.classList.add("is-playing");
          } else {
            slideEl.querySelector(".hero-carousel__video")?.classList.remove("is-playing");
          }
        }
      });
    });
  }

  function syncSlideUi() {
    const current = slides[index];
    const isVideo = Boolean(current?.videoSlide || current?.videoBanner);
    document.body.dataset.heroSlide = String(index);
    document.body.dataset.heroAlign = "left";
    document.body.classList.toggle("hero-slide--graphic", Boolean(current?.hidePromo || current?.videoBanner));
    document.body.classList.toggle("hero-slide--light-shade", Boolean(current?.lightShade));
    document.body.classList.toggle("hero-slide--light-bg", Boolean(current?.lightBg));
    document.body.classList.toggle("hero-slide--video", isVideo);
    document.body.classList.toggle("hero-slide--video-banner", Boolean(current?.videoBanner));
    if (current?.hidePromo || current?.videoBanner) {
      const mobile = isMobileViewport();
      const w = mobile && current.widthMobile ? current.widthMobile : current.width;
      const h = mobile && current.heightMobile ? current.heightMobile : current.height;
      if (w && h) {
        document.body.style.setProperty("--hero-graphic-ratio", String(h / w));
      } else {
        document.body.style.removeProperty("--hero-graphic-ratio");
      }
    } else {
      document.body.style.removeProperty("--hero-graphic-ratio");
    }
    document.body.classList.toggle(
      "hero-carousel--kenburns",
      !reducedMotion && !current?.hidePromo && !isVideo
    );
    syncBgImage();
    syncSlideImagesPresentation();
    syncBannerVideos();
    if (!heroBanner) return;
    heroBanner.classList.remove("hero-banner--align-right");
    heroBanner.classList.add("hero-banner--align-left");
    syncBannerLink();
    if (floatLayer) {
      const hidden = isVideo;
      floatLayer.hidden = hidden;
      floatLayer.classList.toggle("is-hidden", hidden);
    }
  }

  function syncPromo() {
    if (!promoRoot) return;
    const current = slides[index];
    const hide = Boolean(current?.hidePromo || current?.videoSlide || current?.videoBanner);
    promoRoot.hidden = hide;
    promoRoot.setAttribute("aria-hidden", hide ? "true" : "false");
    if (hide) {
      promoRoot.querySelectorAll(".hero-promo__slide").forEach((el) => {
        el.classList.remove("is-revealing");
      });
      return;
    }
    promoRoot.querySelectorAll(".hero-promo__slide").forEach((el, i) => {
      const match = Number(el.dataset.promoIndex) === index;
      el.classList.toggle("is-active", match);
      el.setAttribute("aria-hidden", match ? "false" : "true");
    });
    animatePromoWords();
  }

  function goTo(next, directionHint) {
    const previousIndex = index;
    const normalizedDirection = directionHint === -1 ? -1 : 1;
    index = (next + slides.length) % slides.length;
    setSlideStates(previousIndex, normalizedDirection);
    document.querySelectorAll(".hero-carousel__dot").forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    syncSlideUi();
    syncPromo();
    kickProgress();
  }

  function getSlideInterval(slideIndex) {
    const slide = slides[slideIndex];
    if (slide?.duration && slide.duration >= 3000) return slide.duration;
    return interval;
  }

  function kickProgress() {
    if (!autoplayProgress || reducedMotion) return;
    const ms = getSlideInterval(index);
    autoplayProgress.style.animation = "none";
    autoplayProgress.style.width = "0%";
    void autoplayProgress.offsetWidth;
    autoplayProgress.style.animation = `hero-autoplay-progress ${ms}ms linear forwards`;
  }

  syncSlideUi();
  syncPromo();
  setSlideStates(0, 1);

  if (!reducedMotion && !slides[0]?.hidePromo && !slides[0]?.videoBanner) {
    document.body.classList.add("hero-carousel--kenburns");
  }

  function getActiveBannerVideo() {
    const slide = slides[index];
    if (!slide?.videoBanner) return null;
    for (const track of tracks) {
      const slideEl = track.querySelectorAll(".hero-carousel__slide")[index];
      const video = slideEl?.querySelector(".hero-carousel__video-el");
      if (video && video.querySelector("source")?.getAttribute("src")) return video;
    }
    return null;
  }

  function handleBannerVideoEnded(slideIndex) {
    if (slideIndex !== index) return;
    if (autoplayActive && !document.hidden) {
      goTo(index + 1);
      startTimer();
      return;
    }
    /* Autoplay pausado (hover / reduced motion): repite el video en lugar de congelarlo */
    tracks.forEach((track) => {
      const slideEl = track.querySelectorAll(".hero-carousel__slide")[slideIndex];
      const video = slideEl?.querySelector(".hero-carousel__video-el");
      if (!video) return;
      try {
        video.currentTime = 0;
      } catch (_) {
        /* noop */
      }
      const play = video.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    });
  }

  function startTimer() {
    clearTimeout(timer);
    autoplayActive = true;
    kickProgress();
    const ms = getSlideInterval(index);
    const video = getActiveBannerVideo();
    if (video && !video.ended) {
      /* El slide avanza cuando el video termina; este timeout es solo de respaldo
         por si el video nunca llega a reproducirse (falla de red/autoplay). */
      const fallbackMs =
        Number.isFinite(video.duration) && video.duration > 0
          ? video.duration * 1000 + 5000
          : Math.max(ms * 3, 30000);
      timer = window.setTimeout(() => {
        goTo(index + 1);
        startTimer();
      }, fallbackMs);
      return;
    }
    timer = window.setTimeout(() => {
      goTo(index + 1);
      startTimer();
    }, ms);
  }

  function stopTimer() {
    autoplayActive = false;
    clearTimeout(timer);
    if (autoplayProgress) {
      autoplayProgress.style.animation = "none";
      autoplayProgress.style.width = "0%";
    }
  }

  const banner = document.querySelector(".hero-banner");
  if (banner) {
    const dots = document.createElement("div");
    dots.className = "hero-carousel__dots";
    dots.setAttribute("role", "tablist");
    dots.setAttribute("aria-label", "Promociones del banner");

    slides.forEach((item, i) => {
      const label = item.videoBanner
        ? item.alt || "Banner"
        : item.videoSlide
          ? item.videoLabel || item.alt || "Video"
          : item.promo?.badge || item.alt || `Promo ${i + 1}`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hero-carousel__dot" + (i === 0 ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", `${label} — ${i + 1} de ${slides.length}`);
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.addEventListener("click", () => {
        if (i === index) return;
        goTo(i, i > index ? 1 : -1);
        startTimer();
        window.YaavsSonic?.play?.();
      });
      dots.appendChild(btn);
    });

    banner.appendChild(dots);

    banner.addEventListener("mouseenter", stopTimer);
    banner.addEventListener("mouseleave", () => {
      if (!reducedMotion) startTimer();
    });

    banner.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(index - 1, -1);
        startTimer();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(index + 1, 1);
        startTimer();
      }
    });
  }

  if (!reducedMotion) startTimer();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopTimer();
    else startTimer();
  });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(syncSlideUi, 120);
  });

  if (typeof MOBILE_MQ.addEventListener === "function") {
    MOBILE_MQ.addEventListener("change", syncSlideUi);
  } else if (typeof MOBILE_MQ.addListener === "function") {
    MOBILE_MQ.addListener(syncSlideUi);
  }

  function initHeroFloatSticker() {
    const stickerCfg = cfg.floatSticker;
    if (!banner || !stickerCfg?.src || reducedMotion) return;

    const layer = document.createElement("div");
    layer.className = "hero-banner__float";
    layer.setAttribute("aria-hidden", "true");
    floatLayer = layer;

    const img = document.createElement("img");
    img.className = "hero-banner__float-img";
    img.src = stickerCfg.src;
    img.alt = stickerCfg.alt || "";
    if (stickerCfg.width) img.width = stickerCfg.width;
    if (stickerCfg.height) img.height = stickerCfg.height;
    img.decoding = "async";
    layer.appendChild(img);

    const shade = banner.querySelector(".hero-banner__shade");
    if (shade?.parentNode) {
      shade.parentNode.insertBefore(layer, shade.nextSibling);
    } else {
      banner.appendChild(layer);
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;
    const cursorOffsetX = 18;
    const cursorOffsetY = 16;

    function clampPosition(x, y) {
      const rect = banner.getBoundingClientRect();
      const layerW = layer.offsetWidth || 180;
      const layerH = layer.offsetHeight || 220;
      const pad = 12;
      return {
        x: Math.min(Math.max(x, pad), rect.width - layerW - pad),
        y: Math.min(Math.max(y, pad), rect.height - layerH - pad),
      };
    }

    function onPointerMove(event) {
      const rect = banner.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const next = clampPosition(
        event.clientX - rect.left + cursorOffsetX,
        event.clientY - rect.top + cursorOffsetY
      );
      targetX = next.x;
      targetY = next.y;
      layer.classList.add("is-active", "is-hover");
    }

    function tick() {
      currentX += (targetX - currentX) * 0.42;
      currentY += (targetY - currentY) * 0.42;
      layer.style.left = `${currentX.toFixed(2)}px`;
      layer.style.top = `${currentY.toFixed(2)}px`;
      rafId = window.requestAnimationFrame(tick);
    }

    banner.addEventListener("pointerenter", (event) => {
      const rect = banner.getBoundingClientRect();
      const next = clampPosition(
        event.clientX - rect.left + cursorOffsetX,
        event.clientY - rect.top + cursorOffsetY
      );
      currentX = targetX = next.x;
      currentY = targetY = next.y;
      layer.style.left = `${currentX}px`;
      layer.style.top = `${currentY}px`;
      layer.classList.add("is-active", "is-hover");
    });

    banner.addEventListener("pointerleave", () => {
      layer.classList.remove("is-hover", "is-active");
    });

    banner.addEventListener("pointermove", onPointerMove, { passive: true });

    const current = slides[index];
    const hidden = Boolean(current?.videoSlide || current?.videoBanner);
    layer.hidden = hidden;
    layer.classList.toggle("is-hidden", hidden);

    rafId = window.requestAnimationFrame(tick);

    window.addEventListener(
      "pagehide",
      () => {
        if (rafId) window.cancelAnimationFrame(rafId);
      },
      { once: true }
    );
  }

  initHeroFloatSticker();
})();
