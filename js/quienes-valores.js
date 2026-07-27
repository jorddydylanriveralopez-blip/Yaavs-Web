(function () {
  if (!document.body.classList.contains("page-asi-somos")) return;

  const dialog = document.getElementById("asi-valores-modal");
  const openers = document.querySelectorAll("[data-valores-open]");
  if (!dialog || !openers.length) return;

  const sheet = dialog.querySelector(".asi-valores__sheet");
  const closeBtn = dialog.querySelector("[data-valores-close]");
  const cards = Array.from(dialog.querySelectorAll(".asi-valores__card"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastFocus = null;

  cards.forEach((card, index) => {
    card.style.setProperty("--asi-v-delay", `${Math.min(index * 80, 400)}ms`);
  });

  function resetReveal() {
    cards.forEach((card) => card.classList.remove("is-visible"));
  }

  function kickReveal() {
    if (reduceMotion) {
      cards.forEach((card) => card.classList.add("is-visible"));
      return;
    }
    cards.forEach((card, i) => {
      window.setTimeout(() => card.classList.add("is-visible"), 90 + i * 70);
    });
  }

  function openValores() {
    lastFocus = document.activeElement;
    resetReveal();
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.body.classList.add("is-valores-open");
    dialog.classList.add("is-open");
    if (sheet) sheet.scrollTop = 0;
    closeBtn?.focus();
    window.setTimeout(kickReveal, 40);
  }

  function closeValores() {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    document.body.classList.remove("is-valores-open");
    dialog.classList.remove("is-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  openers.forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      openValores();
    });
  });

  closeBtn?.addEventListener("click", closeValores);

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeValores();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeValores();
  });
})();
