/**
 * Catálogo de planes pospago: familias, selección y precio de portabilidad.
 */
(function () {
  const root = document.querySelector("[data-pospago-catalog]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll("[data-pospago-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-pospago-panel]"));
  const priceBtns = Array.from(root.querySelectorAll("[data-pospago-price]"));

  function setTab(id) {
    tabs.forEach((tab) => {
      const on = tab.getAttribute("data-pospago-tab") === id;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", String(on));
    });
    panels.forEach((panel) => {
      const on = panel.getAttribute("data-pospago-panel") === id;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setTab(tab.getAttribute("data-pospago-tab")));
  });

  priceBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const porta = btn.getAttribute("data-pospago-price") === "porta";
      root.classList.toggle("is-porta", porta);
      priceBtns.forEach((el) => el.classList.toggle("is-active", el === btn));
    });
  });

  root.querySelectorAll("[data-pospago-rate]").forEach((card) => {
    card.tabIndex = 0;
    card.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      card.click();
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
