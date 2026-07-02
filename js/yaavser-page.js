/**
 * Ser Yaavser — animaciones al scroll
 */
(function () {
  if (!document.body.classList.contains("page-ser-yaavser")) return;

  const targets = document.querySelectorAll(
    ".yaavser-benefit, .yaavser-step, .yaavser-present, .yaavser-join .contact-form"
  );

  targets.forEach((el) => el.classList.add("reveal"));

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
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
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 0.06, 0.36)}s`;
    observer.observe(el);
  });
})();
