/**
 * Catálogo pospago: familias en tabs y un plan abierto a la vez.
 */
(function () {
  const root = document.querySelector("[data-pospago-catalog]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll("[data-pospago-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-pospago-panel]"));
  const ids = tabs.map((tab) => tab.getAttribute("data-pospago-tab")).filter(Boolean);

  function tabFromHash() {
    const hash = (location.hash || "").replace("#", "");
    if (hash === "pospago-panel-simple" || hash === "simple") return "simple";
    if (hash === "pospago-panel-lite" || hash === "lite") return "lite";
    if (hash === "pospago-panel-premium" || hash === "premium") return "premium";
    return "premium";
  }

  function closeRates(scope) {
    (scope || root).querySelectorAll("[data-pospago-rate][open]").forEach((card) => {
      card.open = false;
    });
  }

  function setTab(id, { syncHash } = { syncHash: true }) {
    if (!ids.includes(id)) id = "premium";

    tabs.forEach((tab) => {
      const on = tab.getAttribute("data-pospago-tab") === id;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });

    panels.forEach((panel) => {
      const on = panel.getAttribute("data-pospago-panel") === id;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
      if (!on) closeRates(panel);
    });

    if (syncHash && history.replaceState) {
      history.replaceState(null, "", `#pospago-panel-${id}`);
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setTab(tab.getAttribute("data-pospago-tab"));
    });
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const i = ids.indexOf(tab.getAttribute("data-pospago-tab"));
      const next = e.key === "ArrowRight" ? (i + 1) % ids.length : (i - 1 + ids.length) % ids.length;
      tabs[next].focus();
      setTab(ids[next]);
    });
  });

  root.addEventListener("toggle", (e) => {
    const card = e.target;
    if (!card.matches || !card.matches("[data-pospago-rate]") || !card.open) return;
    const panel = card.closest("[data-pospago-panel]");
    panel?.querySelectorAll("[data-pospago-rate][open]").forEach((el) => {
      if (el !== card) el.open = false;
    });
  }, true);

  setTab(tabFromHash(), { syncHash: false });
})();
