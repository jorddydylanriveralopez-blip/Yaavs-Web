/**
 * Catálogo pospago: tabs, popup flotante y detalles del plan.
 */
(function () {
  const root = document.querySelector("[data-pospago-catalog]");
  const modal = document.querySelector("[data-pospago-modal]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll("[data-pospago-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-pospago-panel]"));
  const ids = tabs.map((tab) => tab.getAttribute("data-pospago-tab")).filter(Boolean);

  function tabFromHash() {
    const hash = (location.hash || "").replace("#", "");
    if (hash === "pospago-panel-premium" || hash === "premium") return "premium";
    if (hash === "pospago-panel-simple" || hash === "simple") return "simple";
    if (hash === "pospago-panel-lite" || hash === "lite") return "lite";
    return "lite";
  }

  function setTab(id, { syncHash } = { syncHash: true }) {
    if (!ids.includes(id)) id = "lite";

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

    const active = panels.find((panel) => panel.getAttribute("data-pospago-panel") === id);
    if (active) window.requestAnimationFrame(() => scrollFeaturedIntoView(active));
  }

  function scrollFeaturedIntoView(panel) {
    if (!window.matchMedia("(max-width: 720px)").matches) return;
    const grid = panel.querySelector(".pospago-rate-grid");
    const star = panel.querySelector(".pospago-rate.is-star") || panel.querySelector(".pospago-rate");
    if (!grid || !star) return;
    const left = star.offsetLeft - 12;
    grid.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
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

  if (modal && !window.__yaavsPospagoModal) {
    window.__yaavsPospagoModal = true;
    const familyLabel = {
      premium: "AT&T Premium",
      simple: "AT&T Simple Plus",
      lite: "AT&T Lite",
    };
    let lastCard = null;

    if (modal.parentElement !== document.body) document.body.appendChild(modal);

    function closeModal() {
      modal.classList.remove("is-open");
      modal.hidden = true;
      modal.setAttribute("hidden", "");
      modal.setAttribute("aria-hidden", "true");
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
      const wa = modal.querySelector(".pospago-modal__wa");
      if (wa) {
        const plan =
          card.querySelector(".pospago-rate__name")?.textContent.trim() || "pospago";
        wa.href =
          "https://wa.me/525522331210?text=" +
          encodeURIComponent("Hola, quiero cotizar el plan " + plan + " pospago YAAVS");
      }
      modal.hidden = false;
      modal.removeAttribute("hidden");
      modal.setAttribute("aria-hidden", "false");
      modal.classList.add("is-open");
      document.body.classList.add("pospago-modal-open");
      modal.querySelector("[data-pospago-modal-close]")?.focus();
    }

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-pospago-modal-close]")) {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.target.closest("a[href]")) return;
      const card = e.target.closest("[data-pospago-rate]");
      if (!card || modal.contains(card)) return;
      e.preventDefault();
      openModal(card);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });

    root.querySelectorAll("[data-pospago-rate]").forEach((card) => {
      if (!card.querySelector(".pospago-rate__wa")) {
        const name = card.querySelector(".pospago-rate__name")?.textContent.trim() || "pospago";
        const wa = document.createElement("a");
        wa.className = "pospago-rate__wa";
        wa.target = "_blank";
        wa.rel = "noopener noreferrer";
        wa.href =
          "https://wa.me/525522331210?text=" +
          encodeURIComponent("Hola, quiero cotizar el plan " + name + " pospago YAAVS");
        wa.innerHTML =
          '<img src="assets/pospago/rrss/whatsapp.svg?v=2" alt="" width="18" height="18"><span>Cotiza</span>';
        card.appendChild(wa);
      }
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-haspopup", "dialog");
      card.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        openModal(card);
      });
    });
  }

  setTab(tabFromHash(), { syncHash: false });
})();
