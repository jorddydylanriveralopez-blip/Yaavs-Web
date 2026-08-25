(function () {
  const headerMount = document.getElementById("site-header");
  const footerMount = document.getElementById("site-footer");

  const HASH_TARGETS = {
    "#planes-pospago": "planes-pospago",
    "#conoce-tiendas": "conoce-tiendas",
    "#promociones-att": "promociones-att",
  };

  async function loadPartial(url, mount) {
    if (!mount) return;
    try {
      const res = await fetch(url, { cache: "no-cache", credentials: "same-origin" });
      if (!res.ok) throw new Error(res.statusText);
      mount.innerHTML = await res.text();
    } catch {
      mount.innerHTML = "";
    }
  }

  function scrollToHash(hash) {
    const id = HASH_TARGETS[hash];
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", hash);
  }

  function initPostpagoNav() {
    Object.keys(HASH_TARGETS).forEach((hash) => {
      document.querySelectorAll(`a[href="${hash}"]`).forEach((link) => {
        link.addEventListener("click", (e) => {
          const target = document.getElementById(HASH_TARGETS[hash]);
          if (!target) return;
          e.preventDefault();
          scrollToHash(hash);
        });
      });
    });

    if (HASH_TARGETS[location.hash]) {
      window.setTimeout(() => scrollToHash(location.hash), 160);
    }
  }

  Promise.all([
    loadPartial("partials/header-pospago.html?v=2", headerMount),
    loadPartial("partials/footer-pospago.html?v=2", footerMount),
  ]).then(() => {
    initPostpagoNav();
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    document.dispatchEvent(new CustomEvent("yaavs:layout-ready"));
  });
})();
