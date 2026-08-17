/**
 * Catálogo pospago: revela tarjetas, resalta familia visible y selecciona un plan.
 */
(function () {
  const root = document.querySelector("[data-pospago-catalog]");
  if (!root) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cards = Array.from(root.querySelectorAll("[data-pospago-rate]"));
  const panels = Array.from(root.querySelectorAll("[data-pospago-panel]"));
  const jumps = Array.from(root.querySelectorAll(".pospago-catalog__jump a"));

  cards.forEach((card) => {
    card.tabIndex = 0;
    card.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      card.click();
    });
  });

  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    cards.forEach((card) => io.observe(card));
  } else {
    cards.forEach((card) => card.classList.add("is-in"));
  }

  function setJump(id) {
    jumps.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  }

  if ("IntersectionObserver" in window && panels.length) {
    const navIo = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setJump(visible.target.id);
      },
      { threshold: [0.25, 0.45, 0.7], rootMargin: "-20% 0px -45% 0px" }
    );
    panels.forEach((panel) => navIo.observe(panel));
  }

  jumps.forEach((link) => {
    link.addEventListener("click", () => {
      const id = (link.getAttribute("href") || "").slice(1);
      if (id) setJump(id);
    });
  });

  root.addEventListener("click", (e) => {
    const card = e.target.closest("[data-pospago-rate]");
    if (!card) return;
    const panel = card.closest("[data-pospago-panel]");
    panel?.querySelectorAll("[data-pospago-rate]").forEach((el) => {
      el.classList.toggle("is-on", el === card);
    });
  });
})();
