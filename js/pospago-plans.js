/**
 * Catálogo pospago: navegación entre familias y selección de un plan.
 */
(function () {
  const root = document.querySelector("[data-pospago-catalog]");
  if (!root) return;

  const panels = Array.from(root.querySelectorAll("[data-pospago-panel]"));
  const jumps = Array.from(root.querySelectorAll(".pospago-catalog__jump a"));

  root.querySelectorAll("[data-pospago-rate]").forEach((card) => {
    card.tabIndex = 0;
    card.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      card.click();
    });
  });

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
      { threshold: [0.2, 0.4], rootMargin: "-18% 0px -50% 0px" }
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
