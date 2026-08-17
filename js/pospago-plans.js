/**
 * Catálogo pospago: familias en tabs y detalle en popup.
 */
(function () {
  const root = document.querySelector("[data-pospago-catalog]");
  const modal = document.querySelector("[data-pospago-modal]");
  if (!root || !modal) return;

  const tabs = Array.from(root.querySelectorAll("[data-pospago-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-pospago-panel]"));
  const ids = tabs.map((tab) => tab.getAttribute("data-pospago-tab")).filter(Boolean);
  const familyLabel = {
    premium: "AT&T Premium",
    simple: "AT&T Simple Plus",
    lite: "AT&T Lite",
  };
  let lastCard = null;

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
    modal.hidden = true;
    document.body.classList.remove("pospago-modal-open");
    lastCard?.focus();
    lastCard = null;
  }

  function openModal(card) {
    const family = card.closest("[data-pospago-panel]")?.getAttribute("data-pospago-panel") || "premium";
    const details = card.querySelector(".pospago-rate__details");
    lastCard = card;

    modal.classList.toggle("is-lite", family === "lite");
    modal.querySelector("[data-pospago-modal-kicker]").textContent = familyLabel[family] || "Pospago";
    modal.querySelector("#pospago-modal-title").textContent =
      card.querySelector(".pospago-rate__name")?.textContent.trim() || "";
    modal.querySelector("[data-pospago-modal-data]").textContent =
      card.querySelector(".pospago-rate__data")?.textContent.trim() || "";
    modal.querySelector("[data-pospago-modal-price]").innerHTML =
      card.querySelector(".pospago-rate__price")?.innerHTML || "";
    modal.querySelector("[data-pospago-modal-body]").innerHTML = details ? details.innerHTML : "";

    modal.hidden = false;
    document.body.classList.add("pospago-modal-open");
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

  root.querySelectorAll("[data-pospago-rate]").forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-haspopup", "dialog");
    card.addEventListener("click", () => openModal(card));
    card.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      openModal(card);
    });
  });

  modal.querySelectorAll("[data-pospago-modal-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  setTab(tabFromHash(), { syncHash: false });
})();
