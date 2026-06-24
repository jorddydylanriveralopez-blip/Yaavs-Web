(function () {
  const root = document.querySelector("[data-valores-carousel]");
  if (!root) return;

  const slides = Array.from(root.querySelectorAll(".valores-carousel__slide"));
  const railBtns = Array.from(root.querySelectorAll("[data-valores-go]"));
  const prevBtn = root.querySelector(".valores-carousel__arrow--prev");
  const nextBtn = root.querySelector(".valores-carousel__arrow--next");
  const progress = root.querySelector("[data-valores-progress]");
  const counterCurrent = root.querySelector("[data-valores-counter-current]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (slides.length < 1) return;

  const intervalMs = 7000;
  let index = slides.findIndex((s) => s.classList.contains("is-active"));
  if (index < 0) index = 0;
  let timer = null;

  function restartProgress() {
    if (!progress || reducedMotion) {
      progress?.style.setProperty("width", "100%");
      return;
    }
    progress.style.animation = "none";
    progress.offsetHeight;
    progress.style.animation = `valores-progress-fill ${intervalMs}ms linear forwards`;
  }

  function setActive(i) {
    slides.forEach((slide, n) => {
      slide.classList.toggle("is-active", n === i);
    });
    railBtns.forEach((btn) => {
      const n = Number(btn.dataset.valoresGo);
      btn.classList.toggle("is-active", n === i);
      btn.setAttribute("aria-current", n === i ? "true" : "false");
    });
    if (counterCurrent) {
      counterCurrent.textContent = String(i + 1).padStart(2, "0");
    }
    restartProgress();
  }

  function goTo(i) {
    index = ((i % slides.length) + slides.length) % slides.length;
    setActive(index);
  }

  function next() {
    goTo(index + 1);
  }

  function prev() {
    goTo(index - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    if (reducedMotion || slides.length < 2) return;
    timer = window.setInterval(next, intervalMs);
    restartProgress();
  }

  function stopAutoplay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    if (progress && !reducedMotion) {
      progress.style.animationPlayState = "paused";
    }
  }

  function resumeAutoplay() {
    if (progress && !reducedMotion) {
      progress.style.animationPlayState = "running";
    }
    startAutoplay();
  }

  railBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      goTo(Number(btn.dataset.valoresGo));
      startAutoplay();
    });
  });

  prevBtn?.addEventListener("click", () => {
    prev();
    startAutoplay();
  });

  nextBtn?.addEventListener("click", () => {
    next();
    startAutoplay();
  });

  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", (e) => {
    if (!root.contains(e.relatedTarget)) startAutoplay();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  setActive(index);
  startAutoplay();
})();
