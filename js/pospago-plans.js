/**
 * Catálogo pospago: familias en tabs y detalle en modal.
 */
(function () {
  const root = document.querySelector("[data-pospago-catalog]");
  const modal = document.querySelector("[data-pospago-modal]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll("[data-pospago-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-pospago-panel]"));
  const ids = tabs.map((tab) => tab.getAttribute("data-pospago-tab")).filter(Boolean);
  const familyLabel = {
    premium: "AT&T Premium",
    simple: "AT&T Simple Plus",
    lite: "AT&T Lite",
  };

  function tabFromHash() {
    const hash = (location.hash || "").replace("#", "");
    if (hash === "pospago-panel-simple" || hash === "simple") return "simple";
    if (hash === "pospago-panel-lite" || hash === "lite") return "lite";
    if (hash === "pospago-panel-premium" || hash === "premium") return "premium";
    return "premium";
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
    });

    if (syncHash && history.replaceState) {
      history.replaceState(null, "", `#pospago-panel-${id}`);
    }
  }

  function closeModal() {
    if (!modal) return;
    if (typeof modal.close === "function" && modal.open) modal.close();
    else modal.removeAttribute("open");
  }

  function openModal(card) {
    if (!modal) return;
    const family = card.closest("[data-pospago-panel]")?.getAttribute("data-pospago-panel") || "premium";
    const name = card.querySelector(".pospago-rate__name")?.textContent.trim() || "";
    const data = card.querySelector(".pospago-rate__data")?.textContent.trim() || "";
    const price = card.querySelector(".pospago-rate__price")?.innerHTML || "";
    const details = card.querySelector(".pospago-rate__details");

    modal.classList.toggle("is-lite", family === "lite");
    modal.querySelector("[data-pospago-modal-kicker]").textContent = familyLabel[family] || "Pospago";
    modal.querySelector("#pospago-modal-title").textContent = name;
    modal.querySelector("[data-pospago-modal-data]").textContent = data;
    modal.querySelector("[data-pospago-modal-price]").innerHTML = price;
    modal.querySelector("[data-pospago-modal-body]").innerHTML = details ? details.innerHTML : "";

    if (typeof modal.showModal === "function") {
      if (!modal.open) modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
    modal.querySelector("[data-pospago-modal-close]")?.focus();
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

  root.addEventListener(
    "click",
    (e) => {
      const card = e.target.closest("[data-pospago-rate]");
      if (!card) return;
      e.preventDefault();
      if (typeof card.open !== "undefined") card.open = false;
      openModal(card);
    },
    true
  );

  if (modal) {
    modal.querySelector("[data-pospago-modal-close]")?.addEventListener("click", closeModal);
    modal.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeModal();
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  setTab(tabFromHash(), { syncHash: false });
})();
