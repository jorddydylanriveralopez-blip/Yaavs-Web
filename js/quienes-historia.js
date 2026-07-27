(function () {
  if (!document.body.classList.contains("page-asi-somos")) return;

  const dialog = document.getElementById("asi-historia");
  const openers = document.querySelectorAll("[data-historia-open]");
  if (!dialog || !openers.length) return;

  const sheet = dialog.querySelector(".asi-historia__sheet");
  const track = dialog.querySelector(".asi-historia__track");
  const progress = dialog.querySelector(".asi-historia__progress");
  const closeBtn = dialog.querySelector("[data-historia-close]");
  const items = Array.from(dialog.querySelectorAll(".asi-historia__item"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastFocus = null;

  items.forEach((item, index) => {
    item.style.setProperty("--asi-delay", `${Math.min(index * 70, 420)}ms`);
    item.dataset.side = index % 2 === 0 ? "left" : "right";
  });

  function updateProgress() {
    if (!sheet || !progress) return;
    const max = Math.max(sheet.scrollHeight - sheet.clientHeight, 1);
    const ratio = Math.min(Math.max(sheet.scrollTop / max, 0), 1);
    progress.style.transform = `scaleY(${Math.max(ratio, 0.04)})`;
  }

  function setActiveItem() {
    if (!sheet || !items.length) return;
    const mid = sheet.scrollTop + sheet.clientHeight * 0.38;
    let best = null;
    let bestDist = Infinity;
    items.forEach((item) => {
      const top = item.offsetTop;
      const dist = Math.abs(top - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = item;
      }
    });
    items.forEach((item) => item.classList.toggle("is-active", item === best));
  }

  function resetReveal() {
    items.forEach((item) => item.classList.remove("is-visible", "is-active"));
    if (progress) progress.style.transform = "scaleY(0.04)";
    if (track) track.classList.remove("is-drawn");
  }

  function kickReveal() {
    if (track) {
      requestAnimationFrame(() => track.classList.add("is-drawn"));
    }
    if (reduceMotion) {
      items.forEach((item) => item.classList.add("is-visible"));
      updateProgress();
      setActiveItem();
      return;
    }
    // First couple items animate immediately for a punchy open.
    items.slice(0, 2).forEach((item, i) => {
      window.setTimeout(() => item.classList.add("is-visible"), 120 + i * 90);
    });
    updateProgress();
    setActiveItem();
  }

  function openHistoria() {
    lastFocus = document.activeElement;
    resetReveal();
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.body.classList.add("is-historia-open");
    dialog.classList.add("is-open");
    if (sheet) sheet.scrollTop = 0;
    closeBtn?.focus();
    window.setTimeout(kickReveal, 40);
  }

  function closeHistoria() {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    document.body.classList.remove("is-historia-open");
    dialog.classList.remove("is-open");
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

  sheet?.addEventListener(
    "scroll",
    () => {
      updateProgress();
      setActiveItem();
    },
    { passive: true }
  );

  if ("IntersectionObserver" in window && items.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { root: sheet || null, threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((item) => io.observe(item));
  } else {
    items.forEach((item) => item.classList.add("is-visible"));
  }
})();
