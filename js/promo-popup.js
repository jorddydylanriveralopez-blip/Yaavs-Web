/**
 * Promo popup de entrada (home) — se muestra en cada carga/recarga tras el intro.
 */
(function () {
  if (!document.body.classList.contains("page-home")) return;

  const dialog = document.getElementById("yaavs-promo-popup");
  if (!dialog) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let opened = false;
  let closing = false;

  function lockScroll(lock) {
    document.body.classList.toggle("is-promo-open", lock);
  }

  function openPromo() {
    if (opened) return;
    opened = true;
    lockScroll(true);
    dialog.classList.add("is-open");
    dialog.setAttribute("aria-hidden", "false");
    if (typeof dialog.showModal === "function" && !dialog.open) {
      try {
        dialog.showModal();
      } catch (_) {
        dialog.setAttribute("open", "");
      }
    } else {
      dialog.setAttribute("open", "");
    }
    window.setTimeout(() => {
      dialog.querySelector("[data-promo-enter]")?.focus();
    }, 80);
  }

  function closePromo() {
    if (!opened || closing) return;
    closing = true;
    dialog.classList.add("is-closing");
    dialog.classList.remove("is-open");

    const finish = () => {
      dialog.classList.remove("is-closing");
      dialog.setAttribute("aria-hidden", "true");
      if (typeof dialog.close === "function" && dialog.open) {
        try {
          dialog.close();
        } catch (_) {
          dialog.removeAttribute("open");
        }
      } else {
        dialog.removeAttribute("open");
      }
      lockScroll(false);
      closing = false;
    };

    window.setTimeout(finish, reducedMotion ? 0 : 320);
  }

  function scheduleOpen() {
    const delay = reducedMotion ? 120 : 480;
    window.setTimeout(openPromo, delay);
  }

  dialog.querySelectorAll("[data-promo-close]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      closePromo();
    });
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closePromo();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closePromo();
  });

  if (document.body.classList.contains("page-intro-done")) {
    scheduleOpen();
  } else {
    document.addEventListener("yaavs:intro-done", scheduleOpen, { once: true });
  }
})();
