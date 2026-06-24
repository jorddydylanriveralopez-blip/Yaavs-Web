(function () {
  const root = document.querySelector("[data-svc-carousel]");
  if (!root) return;

  const viewport = root.querySelector(".svc-showcase__viewport");
  const track = root.querySelector(".svc-showcase__track");
  const slides = Array.from(root.querySelectorAll(".svc-showcase__slide"));
  const dotsWrap = root.querySelector(".svc-showcase__dots");
  const prevBtn = root.querySelector(".svc-showcase__arrow--prev");
  const nextBtn = root.querySelector(".svc-showcase__arrow--next");
  const counterCurrent = root.querySelector("[data-svc-counter-current]");
  const counterTotal = root.querySelector("[data-svc-counter-total]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!viewport || !track || slides.length < 1) return;

  let index = slides.findIndex((s) => s.classList.contains("is-active"));
  if (index < 0) index = 0;
  let timer = null;
  const intervalMs = 6000;
  const pad = () => parseFloat(getComputedStyle(viewport).paddingLeft) || 0;

  if (counterTotal) {
    counterTotal.textContent = String(slides.length).padStart(2, "0");
  }

  function slideTitle(i) {
    return slides[i]?.querySelector(".svc-showcase__title")?.textContent?.trim() || "";
  }

  function getScrollLeft(i) {
    const slide = slides[i];
    if (!slide) return 0;
    return Math.max(0, slide.offsetLeft - track.offsetLeft - pad());
  }

  function updateCounter(i) {
    if (counterCurrent) {
      counterCurrent.textContent = String(i + 1).padStart(2, "0");
    }
  }

  function setActive(i) {
    slides.forEach((slide, n) => {
      slide.classList.toggle("is-active", n === i);
    });
    root.querySelectorAll(".svc-showcase__dot").forEach((dot, n) => {
      dot.classList.toggle("is-active", n === i);
      dot.setAttribute("aria-selected", n === i ? "true" : "false");
    });
    updateCounter(i);
  }

  function goTo(i, smooth) {
    index = ((i % slides.length) + slides.length) % slides.length;
    viewport.scrollTo({
      left: getScrollLeft(index),
      behavior: smooth && !reducedMotion ? "smooth" : "auto",
    });
    setActive(index);
  }

  function syncIndexFromScroll() {
    const anchor = viewport.scrollLeft + pad() + 8;
    let closest = 0;
    let minDist = Infinity;
    slides.forEach((slide, n) => {
      const dist = Math.abs(slide.offsetLeft - track.offsetLeft - anchor);
      if (dist < minDist) {
        minDist = dist;
        closest = n;
      }
    });
    if (closest !== index) {
      index = closest;
      setActive(index);
    }
  }

  function next() {
    goTo(index + 1, true);
  }

  function prev() {
    goTo(index - 1, true);
  }

  function startAutoplay() {
    stopAutoplay();
    if (reducedMotion || slides.length < 2) return;
    timer = window.setInterval(next, intervalMs);
  }

  function stopAutoplay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (dotsWrap) {
    slides.forEach((slide, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "svc-showcase__dot" + (i === index ? " is-active" : "");
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", slideTitle(i) || `Servicio ${i + 1}`);
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
      dot.addEventListener("click", () => {
        goTo(i, true);
        startAutoplay();
      });
      dotsWrap.appendChild(dot);
    });
  }

  prevBtn?.addEventListener("click", () => {
    prev();
    startAutoplay();
  });

  nextBtn?.addEventListener("click", () => {
    next();
    startAutoplay();
  });

  let scrollEndTimer;
  viewport.addEventListener(
    "scroll",
    () => {
      window.clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(syncIndexFromScroll, 80);
    },
    { passive: true }
  );

  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", (e) => {
    if (!root.contains(e.relatedTarget)) startAutoplay();
  });

  window.addEventListener("resize", () => goTo(index, false));

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  setActive(index);
  goTo(index, false);
  startAutoplay();
})();
