/**
 * Tracking ligero YAAVS — dataLayer (listo para GTM/GA4).
 * Solo dispara si el usuario aceptó cookies de analítica.
 */
(function () {
  window.dataLayer = window.dataLayer || [];

  function allowsAnalytics() {
    if (window.YaavsCookies?.allows) return window.YaavsCookies.allows("analytics");
    try {
      const raw = localStorage.getItem("yaavs_cookie_consent_v1");
      if (!raw) return false;
      return Boolean(JSON.parse(raw).analytics);
    } catch (_) {
      return false;
    }
  }

  function pushEvent(name, payload) {
    if (!allowsAnalytics()) return;
    const entry = {
      event: name,
      page: document.body?.dataset?.page || document.title,
      ...payload,
    };
    window.dataLayer.push(entry);
    document.dispatchEvent(new CustomEvent("yaavs:analytics", { detail: entry }));
  }

  function trackFromEl(el) {
    const name = el.getAttribute("data-yaavs-track");
    if (!name) return;
    pushEvent(name, {
      label: el.getAttribute("data-yaavs-track-label") || el.textContent?.trim()?.slice(0, 80) || "",
      href: el.getAttribute("href") || "",
    });
  }

  function onClick(e) {
    const el = e.target.closest("[data-yaavs-track]");
    if (!el) return;
    trackFromEl(el);
  }

  function onSubmit(e) {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    const marked = form.querySelector("[data-yaavs-track='form_submit']");
    if (marked) {
      trackFromEl(marked);
      return;
    }
    if (form.id === "contact-form" || form.id === "yaavser-form") {
      pushEvent("form_submit", { label: form.id });
    }
  }

  document.addEventListener("click", onClick, true);
  document.addEventListener("submit", onSubmit, true);

  document.addEventListener("yaavs:cookie-consent", (ev) => {
    if (ev.detail?.analytics) {
      pushEvent("analytics_enabled", { label: "consent" });
    }
  });

  window.YaavsAnalytics = {
    push: pushEvent,
    allows: allowsAnalytics,
  };
})();
