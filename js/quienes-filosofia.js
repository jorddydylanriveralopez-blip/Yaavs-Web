(function () {
  if (!document.body.classList.contains("page-asi-somos")) return;

  function bindManifiesto({ modalId, openSelector, closeSelector }) {
    const dialog = document.getElementById(modalId);
    const openers = document.querySelectorAll(openSelector);
    if (!dialog || !openers.length) return;

    const sheet = dialog.querySelector(".asi-manifiesto__sheet");
    const closeBtn = dialog.querySelector(closeSelector);
    let lastFocus = null;

    function openModal() {
      lastFocus = document.activeElement;
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      document.body.classList.add("is-manifiesto-open");
      dialog.classList.add("is-open");
      if (sheet) sheet.scrollTop = 0;
      closeBtn?.focus();
    }

    function closeModal() {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
      dialog.classList.remove("is-open");
      if (!document.querySelector(".asi-manifiesto.is-open")) {
        document.body.classList.remove("is-manifiesto-open");
      }
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    openers.forEach((el) => {
      el.addEventListener("click", (event) => {
        event.preventDefault();
        openModal();
      });
    });

    closeBtn?.addEventListener("click", closeModal);

    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeModal();
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeModal();
    });
  }

  bindManifiesto({
    modalId: "asi-filosofia-modal",
    openSelector: "[data-filosofia-open]",
    closeSelector: "[data-filosofia-close]",
  });

  bindManifiesto({
    modalId: "asi-vision-modal",
    openSelector: "[data-vision-open]",
    closeSelector: "[data-vision-close]",
  });
})();
