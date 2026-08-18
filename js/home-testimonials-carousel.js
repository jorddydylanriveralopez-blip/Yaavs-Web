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

    if (root.classList.contains("hx-testimonials--spectacular")) {
      if ("IntersectionObserver" in window) {
        var revealObs = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                root.classList.add("is-revealed");
                revealObs.disconnect();
              }
            });
          },
          { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
        );
        revealObs.observe(root);
      } else {
        root.classList.add("is-revealed");
      }
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(onResize, 120);
    });
  }

  function initReel(root) {
    var slides = Array.prototype.slice.call(
      root.querySelectorAll("[data-tx-reel-slide]")
    );
    if (!slides.length) return;

    var progress = root.querySelector("[data-tx-reel-progress]");
    var autoplayMs = Number(root.getAttribute("data-tx-reel-autoplay")) || 4800;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var current = 0;
    var timer = null;

    function runProgress() {
      if (!progress || reducedMotion) return;
      progress.style.animation = "none";
      void progress.offsetWidth;
      progress.style.animation =
        "tx-reel-progress " + autoplayMs / 1000 + "s linear forwards";
    }

    function update(index) {
      current = ((index % slides.length) + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === current;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      runProgress();
    }

    function next() {
      update(current + 1);
    }

    function stop() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    }

    function start() {
      stop();
      if (reducedMotion || slides.length < 2) return;
      runProgress();
      timer = setInterval(next, autoplayMs);
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) start();
    });

    update(0);
    start();
  }

  function initFireworks(canvas) {
    if (!canvas || !canvas.getContext) return;

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var particles = [];
    var rafId = 0;
    var lastTime = 0;
    var lastBurst = -1000;
    var burstCount = 0;
    var maxBursts = window.matchMedia("(max-width: 720px)").matches ? 4 : 6;
    var colors = ["#5a9cc4", "#7eb8d9", "#c9a000", "#8fa3b8", "#6a8299"];
    var endAt = performance.now() + 5200;
    var width = 0;
    var height = 0;
    var dpr = 1;

    function resize() {
      var bounds = canvas.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function burst(x, y) {
      for (var i = 0; i < 26; i += 1) {
        var angle = (Math.PI * 2 * i) / 26 + Math.random() * 0.18;
        var speed = 1.2 + Math.random() * 2.4;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 1.2 + Math.random() * 1.8,
          life: 0,
          ttl: 700 + Math.random() * 400,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    function maybeBurst(now) {
      if (burstCount >= maxBursts) return;
      if (now - lastBurst < 520) return;
      lastBurst = now;
      burstCount += 1;
      burst(
        width * (0.18 + Math.random() * 0.64),
        height * (0.18 + Math.random() * 0.3)
      );
    }

    function draw(now) {
      if (!lastTime) lastTime = now;
      var delta = now - lastTime;
      lastTime = now;

      maybeBurst(now);
      ctx.clearRect(0, 0, width, height);

      particles = particles.filter(function (particle) {
        particle.life += delta;
        if (particle.life >= particle.ttl) return false;

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.02;
        particle.vx *= 0.992;
        particle.vy *= 0.992;
        particle.alpha = 1 - particle.life / particle.ttl;

        ctx.beginPath();
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha * 0.9;
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });

      ctx.globalAlpha = 1;

      if (now < endAt || particles.length) {
        rafId = window.requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    rafId = window.requestAnimationFrame(draw);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!document.hidden && !rafId && particles.length) {
        lastTime = 0;
        rafId = window.requestAnimationFrame(draw);
      }
    });
  }

  function boot() {
    document.querySelectorAll("[data-hx-testimonials]").forEach(initCarousel);
    document.querySelectorAll("[data-tx-reel]").forEach(initReel);
    document
      .querySelectorAll("[data-testimonios-fireworks]")
      .forEach(initFireworks);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
