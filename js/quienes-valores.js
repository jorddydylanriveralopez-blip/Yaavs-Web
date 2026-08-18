(function () {
  if (!document.body.classList.contains("page-asi-somos")) return;

  const dialog = document.getElementById("asi-valores-modal");
  const openers = document.querySelectorAll("[data-valores-open]");
  if (!dialog || !openers.length) return;

  const sheet = dialog.querySelector(".asi-valores__sheet");
  const closeBtn = dialog.querySelector("[data-valores-close]");
  const items = Array.from(dialog.querySelectorAll(".asi-valores__item"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastFocus = null;

  items.forEach((item, index) => {
    item.style.setProperty("--asi-v-delay", `${Math.min(index * 90, 360)}ms`);
  });

  function setExpanded(item, open) {
    const trigger = item.querySelector(".asi-valores__trigger");
    const panel = item.querySelector(".asi-valores__panel");
    if (!trigger || !panel) return;
    item.classList.toggle("is-expanded", open);
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      panel.hidden = false;
    } else {
      panel.hidden = true;
    }
  }

  function collapseAll(except) {
    items.forEach((item) => {
      if (item !== except) setExpanded(item, false);
    });
  }

  function resetReveal() {
    items.forEach((item) => {
      item.classList.remove("is-visible");
      setExpanded(item, false);
    });
  }

  function kickReveal() {
    if (reduceMotion) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    items.forEach((item, i) => {
      window.setTimeout(() => item.classList.add("is-visible"), 100 + i * 80);
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
    collapseAll();
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  items.forEach((item) => {
    const trigger = item.querySelector(".asi-valores__trigger");
    trigger?.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-expanded");
      collapseAll(item);
      setExpanded(item, willOpen);
      if (willOpen && sheet) {
        window.setTimeout(() => {
          item.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
        }, 40);
      }
    });
  });

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
