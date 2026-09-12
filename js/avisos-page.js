(function () {
  if (!document.body.classList.contains("page-anuncios")) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready() {
    document.body.classList.add("is-anuncios-ready");
  }

  if (reduced) {
    ready();
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.requestAnimationFrame(ready);
    });
  } else {
    window.requestAnimationFrame(ready);
  }
})();
