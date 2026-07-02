(function () {
  "use strict";

  function initCarousel(root) {
    var track = root.querySelector("[data-hx-testimonials-track]");
    if (!track) return;

    var slides = Array.prototype.slice.call(
      track.querySelectorAll(".hx-testimonials__slide")
    );
    if (!slides.length) return;

    var viewport = root.querySelector(".hx-testimonials__viewport");
    var prevBtn = root.querySelector(".hx-testimonials__arrow--prev");
    var nextBtn = root.querySelector(".hx-testimonials__arrow--next");
    var dots = Array.prototype.slice.call(
      root.querySelectorAll("[data-hx-testimonial-go]")
    );
    var progressFill = root.querySelector(".hx-testimonials__progress span");
    var isCinema = root.classList.contains("hx-testimonials--cinema");

    var focus = 0;
    var perView = 3;
    var autoplayMs = Number(root.getAttribute("data-hx-autoplay")) || 5500;
    var autoplayTimer = null;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function getPerView() {
      if (window.matchMedia("(max-width: 720px)").matches) return 1;
      if (window.matchMedia("(max-width: 1024px)").matches) return 2;
      return 3;
    }

  function visibleStart() {
    var maxStart = Math.max(0, slides.length - perView);
    if (perView === 1) return focus;
    var start = focus - Math.floor(perView / 2);
    if (start < 0) start = 0;
    if (start > maxStart) start = maxStart;
    return start;
  }

  function slideStep() {
    if (perView === 1 && viewport) {
      return viewport.clientWidth;
    }
    var style = window.getComputedStyle(track);
    var gap = parseFloat(style.gap || style.columnGap) || 0;
    var slideWidth = slides[0].getBoundingClientRect().width;
    return slideWidth + gap;
  }

    function updateClasses() {
      var start = visibleStart();
      var center = focus;

      slides.forEach(function (slide, i) {
        slide.classList.remove("is-active", "is-visible", "is-center", "is-near");
        if (i >= start && i < start + perView) {
          slide.classList.add("is-visible");
          if (i === center) {
            slide.classList.add("is-center", "is-active");
          } else {
            slide.classList.add("is-near");
          }
        }
      });

      dots.forEach(function (dot, i) {
        var active = i === focus;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });
    }

    function runProgress() {
      if (!progressFill || reducedMotion) return;
      var duration = autoplayMs / 1000;
      progressFill.style.animation = "none";
      void progressFill.offsetWidth;
      progressFill.style.animation =
        "hx-t-progress " + duration + "s linear forwards";
    }

    function applyTransform() {
      var start = visibleStart();
      var offset = start * slideStep();
      track.style.transform = "translate3d(" + -offset + "px, 0, 0)";
      updateClasses();
    }

    function goTo(index) {
      focus = ((index % slides.length) + slides.length) % slides.length;
      root.classList.add("is-autoplaying");
      applyTransform();
      runProgress();
      window.setTimeout(function () {
        root.classList.remove("is-autoplaying");
      }, isCinema ? 620 : 520);
    }

    function next() {
      goTo(focus + 1);
    }

    function prev() {
      goTo(focus - 1);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
      root.classList.remove("is-playing");
    }

    function startAutoplay() {
      stopAutoplay();
      if (reducedMotion || slides.length < 2) return;
      root.classList.add("is-playing");
      runProgress();
      autoplayTimer = setInterval(next, autoplayMs);
    }

    function onResize() {
      var nextPerView = getPerView();
      if (nextPerView !== perView) {
        perView = nextPerView;
        root.setAttribute("data-hx-per-view", String(perView));
      }
      applyTransform();
      if (root.classList.contains("is-playing")) runProgress();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        prev();
        startAutoplay();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        next();
        startAutoplay();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var idx = Number(dot.getAttribute("data-hx-testimonial-go"));
        if (!Number.isNaN(idx)) {
          goTo(idx);
          startAutoplay();
        }
      });
    });

    if (!isCinema) {
      root.addEventListener("mouseenter", stopAutoplay);
      root.addEventListener("mouseleave", startAutoplay);
    }

    root.addEventListener("focusin", function (e) {
      if (e.target.matches("button, a")) stopAutoplay();
    });
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) startAutoplay();
    });

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
        startAutoplay();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
        startAutoplay();
      }
    });

    var touchStartX = 0;
    var touchDelta = 0;

    if (viewport) {
      viewport.addEventListener(
        "touchstart",
        function (e) {
          touchStartX = e.changedTouches[0].clientX;
          touchDelta = 0;
          stopAutoplay();
        },
        { passive: true }
      );

      viewport.addEventListener(
        "touchmove",
        function (e) {
          touchDelta = e.changedTouches[0].clientX - touchStartX;
        },
        { passive: true }
      );

      viewport.addEventListener(
        "touchend",
        function () {
          if (Math.abs(touchDelta) > 48) {
            if (touchDelta < 0) next();
            else prev();
          }
          startAutoplay();
        },
        { passive: true }
      );
    }

    perView = getPerView();
    root.setAttribute("data-hx-per-view", String(perView));
    goTo(0);
    startAutoplay();

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(onResize, 120);
    });
  }

  function boot() {
    document.querySelectorAll("[data-hx-testimonials]").forEach(initCarousel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
