/**
 * Catálogo pospago: familias en tabs y detalle desplegable en cada plan.
 */
(function () {
  const root = document.querySelector("[data-pospago-catalog]");
  if (!root) return;

  const svg = (d) =>
    `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="${d}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const ICONS = {
    wifi: svg("M4.5 10.2c4.4-4.2 10.6-4.2 15 0M7.4 13.4c2.7-2.5 6.5-2.5 9.2 0M12 18.4h.01"),
    phone: svg("M7 3.8h3.2l1 3.2-2 1.2a12 12 0 0 0 5.6 5.6l1.2-2 3.2 1V17a1.8 1.8 0 0 1-1.8 1.8A15.2 15.2 0 0 1 5.2 5.6 1.8 1.8 0 0 1 7 3.8Z"),
    sms: svg("M5 6.2h14v9.2H9.2L5 19.2V6.2Z"),
    social: svg("M8.2 10.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM15.8 10.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM12 19.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8ZM9.8 11.6 11 14.2M14.2 11.6 13 14.2"),
    device: svg("M8 3.6h8A1.6 1.6 0 0 1 17.6 5.2v13.6A1.6 1.6 0 0 1 16 20.4H8A1.6 1.6 0 0 1 6.4 18.8V5.2A1.6 1.6 0 0 1 8 3.6ZM10 17.8h4"),
    shield: svg("M12 3.6 19 6.4v5.4c0 4.2-2.8 7.2-7 8.6-4.2-1.4-7-4.4-7-8.6V6.4L12 3.6ZM9.2 12.1l1.9 1.9 3.7-3.8"),
    card: svg("M4.4 7.2h15.2v9.6H4.4V7.2ZM4.4 10.4h15.2"),
    gift: svg("M4.8 11.2h14.4v8.4H4.8V11.2ZM4.8 7.6h14.4v3.6H4.8V7.6ZM12 7.6v12M8.2 7.6c0-1.6 1.2-2.8 2.4-1.4L12 7.6 9.4 5.2C8.2 3.8 8.2 6 8.2 7.6ZM15.8 7.6c0-1.6-1.2-2.8-2.4-1.4L12 7.6l2.6-2.4c1.2-1.4 1.2.8 1.2 2.4Z"),
    percent: svg("M18 6 6 18M8.2 8.2h.01M15.8 15.8h.01"),
  };

  const FACTS = {
    premium: [
      ["wifi", "Navegación libre"],
      ["phone", "Minutos ilimitados"],
      ["sms", "SMS ilimitados"],
      ["device", "Plan con equipo"],
      ["social", "Hasta 6 redes sociales"],
      ["shield", "Add on Control $50"],
      ["card", "Meses sin intereses"],
    ],
    simple: [
      ["wifi", "Navegación libre"],
      ["phone", "Minutos ilimitados"],
      ["sms", "SMS ilimitados"],
      ["social", "Redes sociales ilimitadas"],
      ["gift", "Gigas de promoción incluidos"],
      ["card", "Meses sin intereses"],
    ],
    lite: [
      ["wifi", "Navegación libre"],
      ["phone", "Minutos ilimitados"],
      ["sms", "SMS ilimitados"],
      ["device", "Plan sin equipo"],
      ["social", "Redes sociales a elegir"],
      ["shield", "Add on Control $50"],
      ["percent", "Descuento en portabilidad"],
    ],
  };

  const tabs = Array.from(root.querySelectorAll("[data-pospago-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-pospago-panel]"));
  const ids = tabs.map((tab) => tab.getAttribute("data-pospago-tab")).filter(Boolean);

  function enhanceCard(card) {
    if (card.querySelector(".pospago-rate__details")) return;
    const family = card.closest("[data-pospago-panel]")?.getAttribute("data-pospago-panel") || "premium";
    const facts = FACTS[family] || FACTS.premium;

    const details = document.createElement("div");
    details.className = "pospago-rate__details";
    details.hidden = true;
    details.innerHTML = `<ul class="pospago-rate__facts">${facts
      .map(([key, label]) => `<li>${ICONS[key] || ""}<span>${label}</span></li>`)
      .join("")}</ul>`;

    ["pospago-rate__split", "pospago-rrss", "pospago-rrss__cap", "pospago-rate__porta", "pospago-rate__note"].forEach((cls) => {
      const el = card.querySelector(`.${cls}`);
      if (el) details.appendChild(el);
    });

    details.querySelectorAll(".pospago-rrss img").forEach((img) => {
      if (img.parentElement.querySelector("span")) return;
      const label = document.createElement("span");
      label.textContent = img.getAttribute("alt") || "";
      img.parentElement.appendChild(label);
    });

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "pospago-rate__toggle";
    toggle.tabIndex = -1;
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML =
      '<span>Ver detalle</span><svg viewBox="0 0 24 28" fill="none" aria-hidden="true"><path d="M5 6.5 12 13.5 19 6.5"/><path d="M5 14.5 12 21.5 19 14.5"/></svg>';

    card.append(details, toggle);
    card.tabIndex = 0;
    card.setAttribute("aria-expanded", "false");
    card.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      card.click();
    });
  }

  function setOpen(card, open) {
    const details = card.querySelector(".pospago-rate__details");
    const toggle = card.querySelector(".pospago-rate__toggle");
    const label = toggle?.querySelector("span");
    card.classList.toggle("is-open", open);
    card.setAttribute("aria-expanded", open ? "true" : "false");
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (label) label.textContent = open ? "Cerrar" : "Ver detalle";
    if (details) details.hidden = !open;
  }

  root.querySelectorAll("[data-pospago-rate]").forEach(enhanceCard);

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
      if (!on) {
        panel.querySelectorAll("[data-pospago-rate]").forEach((card) => setOpen(card, false));
      }
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

  root.addEventListener("click", (e) => {
    const card = e.target.closest("[data-pospago-rate]");
    if (!card) return;
    const panel = card.closest("[data-pospago-panel]");
    const open = !card.classList.contains("is-open");
    panel?.querySelectorAll("[data-pospago-rate]").forEach((el) => setOpen(el, el === card && open));
    if (open) {
      requestAnimationFrame(() => {
        card.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
    }
  });

  setTab(tabFromHash(), { syncHash: false });
})();
