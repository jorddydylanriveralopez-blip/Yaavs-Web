(function () {
  if (!document.body.classList.contains("page-quienes-somos")) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initReveal() {
    const blocks = document.querySelectorAll(".quienes-reveal");
    if (!blocks.length) return;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      blocks.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    blocks.forEach((el) => observer.observe(el));
  }

  function initStatsPulse() {
    const items = document.querySelectorAll(".quienes-stats__item");
    if (!items.length || prefersReduced || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-pulsed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );

    items.forEach((item, i) => {
      item.style.transitionDelay = `${i * 70}ms`;
      observer.observe(item);
    });
  }

  function initPillarTilt() {
    if (prefersReduced || window.matchMedia("(max-width: 768px)").matches) return;

    document.querySelectorAll(".quienes-pillar").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  initReveal();
  initStatsPulse();
  initPillarTilt();
})();
