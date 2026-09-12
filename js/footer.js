(function () {
  const footer = document.querySelector(".site-footer--pro");
  if (!footer) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCount(el, target, prefix, suffix, duration) {
    const start = performance.now();
    const from = 0;

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(from + (target - from) * easeOutCubic(progress));
      el.textContent = `${prefix}${value.toLocaleString("es-MX")}${suffix}`;
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  function runCounters() {
    footer.querySelectorAll("[data-footer-count]").forEach((el) => {
      if (el.dataset.footerCounted === "1") return;
      el.dataset.footerCounted = "1";
      const target = Number(el.dataset.footerCount || "0");
      const prefix = el.dataset.footerPrefix || "";
      const suffix = el.dataset.footerSuffix || "";
      if (reduced) {
        el.textContent = `${prefix}${target.toLocaleString("es-MX")}${suffix}`;
        return;
      }
      animateCount(el, target, prefix, suffix, 1400);
    });
  }

  function revealFooter() {
    footer.classList.add("is-footer-visible");
    runCounters();
  }

  if (reduced) {
    revealFooter();
    return;
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealFooter();
          io.disconnect();
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(footer);
  } else {
    revealFooter();
  }

  document.addEventListener("yaavs:layout-ready", () => {
    if (footer.classList.contains("is-footer-visible")) return;
    const rect = footer.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) revealFooter();
  });
})();
