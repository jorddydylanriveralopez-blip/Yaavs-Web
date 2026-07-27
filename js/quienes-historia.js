(function () {
  if (!document.body.classList.contains("page-asi-somos")) return;

  const dialog = document.getElementById("asi-historia");
  const openers = document.querySelectorAll("[data-historia-open]");
  if (!dialog || !openers.length) return;

  const sheet = dialog.querySelector(".asi-historia__sheet");
  const closeBtn = dialog.querySelector("[data-historia-close]");
  const items = dialog.querySelectorAll(".asi-historia__item");
  let lastFocus = null;

  function openHistoria() {
    lastFocus = document.activeElement;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.body.classList.add("is-historia-open");
    closeBtn?.focus();
  }

  function closeHistoria() {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    document.body.classList.remove("is-historia-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  openers.forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      openHistoria();
    });
  });

  closeBtn?.addEventListener("click", closeHistoria);

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeHistoria();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeHistoria();
  });

  if ("IntersectionObserver" in window && items.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { root: sheet || null, threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    items.forEach((item) => io.observe(item));
  } else {
    items.forEach((item) => item.classList.add("is-visible"));
  }
})();
