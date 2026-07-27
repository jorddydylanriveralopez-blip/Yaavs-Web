(function () {
  if (!document.body.classList.contains("page-asi-somos")) return;

  const dialog = document.getElementById("asi-filosofia-modal");
  const openers = document.querySelectorAll("[data-filosofia-open]");
  if (!dialog || !openers.length) return;

  const sheet = dialog.querySelector(".asi-filosofia__sheet");
  const closeBtn = dialog.querySelector("[data-filosofia-close]");
  let lastFocus = null;

  function openFilosofia() {
    lastFocus = document.activeElement;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.body.classList.add("is-filosofia-open");
    dialog.classList.add("is-open");
    if (sheet) sheet.scrollTop = 0;
    closeBtn?.focus();
  }

  function closeFilosofia() {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    document.body.classList.remove("is-filosofia-open");
    dialog.classList.remove("is-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  openers.forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      openFilosofia();
    });
  });

  closeBtn?.addEventListener("click", closeFilosofia);

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeFilosofia();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeFilosofia();
  });
})();
