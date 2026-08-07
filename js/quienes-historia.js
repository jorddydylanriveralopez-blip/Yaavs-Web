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
  let activeIndex = 0;
  let scrollingTo = false;

  items.forEach((item, index) => {
    item.style.setProperty("--asi-delay", `${Math.min(index * 55, 360)}ms`);
    item.dataset.side = index % 2 === 0 ? "left" : "right";
    item.dataset.index = String(index);
    if (!item.dataset.year) {
      const year = item.querySelector(".asi-historia__year")?.textContent?.trim();
      if (year) item.dataset.year = year;
    }
    /* Ya no se muestran pastillas ni años gigantes en la línea */
  });

  function updateProgress() {
    if (!sheet || !progress) return;
    const max = Math.max(sheet.scrollHeight - sheet.clientHeight, 1);
    const ratio = Math.min(Math.max(sheet.scrollTop / max, 0), 1);
    progress.style.transform = `scaleY(${Math.max(ratio, 0.04)})`;
  }

  function setActiveItem(index, { expand = false } = {}) {
    activeIndex = Math.max(0, Math.min(index, items.length - 1));
    items.forEach((item, i) => {
      const on = i === activeIndex;
      item.classList.toggle("is-active", on);
      item.classList.toggle("is-expanded", on && expand);
      item.setAttribute("aria-current", on ? "true" : "false");
    });
  }

  function syncActiveFromScroll() {
    if (!sheet || !items.length || scrollingTo) return;
    const mid = sheet.scrollTop + sheet.clientHeight * 0.36;
    let best = 0;
    let bestDist = Infinity;
    items.forEach((item, i) => {
      const dist = Math.abs(item.offsetTop - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    if (best !== activeIndex) setActiveItem(best);
  }

  function goTo(index, fromUser) {
    const next = Math.max(0, Math.min(index, items.length - 1));
    const item = items[next];
    if (!item || !sheet) return;
    setActiveItem(next, { expand: Boolean(fromUser) });
    item.classList.add("is-visible");
    scrollingTo = true;
    const scrollToItem = () => {
      const top = Math.max(0, item.offsetTop - 72);
      sheet.scrollTo({
        top,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    };
    scrollToItem();
    if (fromUser) {
      window.requestAnimationFrame(() => {
        window.setTimeout(scrollToItem, reduceMotion ? 0 : 80);
      });
    }
    window.setTimeout(() => {
      scrollingTo = false;
    }, reduceMotion ? 40 : 520);
    if (fromUser) item.focus({ preventScroll: true });
  }

  function resetReveal() {
    items.forEach((item) =>
      item.classList.remove("is-visible", "is-active", "is-expanded")
    );
    if (progress) progress.style.transform = "scaleY(0.04)";
    if (track) track.classList.remove("is-drawn");
    activeIndex = 0;
  }

  function kickReveal() {
    if (track) {
      requestAnimationFrame(() => track.classList.add("is-drawn"));
    }
    if (reduceMotion) {
      items.forEach((item) => item.classList.add("is-visible"));
      updateProgress();
      setActiveItem(0);
      return;
    }
    /* Primeros hitos al abrir; el resto aparece al hacer scroll */
    items.slice(0, 1).forEach((item, i) => {
      window.setTimeout(() => item.classList.add("is-visible"), 100 + i * 80);
    });
    updateProgress();
    setActiveItem(0);
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

  dialog.addEventListener("keydown", (event) => {
    if (!dialog.classList.contains("is-open")) return;
    if (event.key === "ArrowDown" || event.key === "PageDown") {
      event.preventDefault();
      goTo(activeIndex + 1, true);
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      goTo(activeIndex - 1, true);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0, true);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(items.length - 1, true);
    }
  });

  items.forEach((item, index) => {
    item.addEventListener("click", () => {
      if (index === activeIndex && item.classList.contains("is-expanded")) {
        setActiveItem(index, { expand: false });
        return;
      }
      goTo(index, true);
    });
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (index === activeIndex && item.classList.contains("is-expanded")) {
          setActiveItem(index, { expand: false });
          return;
        }
        goTo(index, true);
      }
    });
  });

  sheet?.addEventListener(
    "scroll",
    () => {
      updateProgress();
      syncActiveFromScroll();
    },
    { passive: true }
  );

  /* Año + imagen + texto aparecen juntos al llegar con el scroll */
  if ("IntersectionObserver" in window && items.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
        });
      },
      { root: sheet || null, threshold: 0.28, rootMargin: "0px 0px -12% 0px" }
    );
    items.forEach((item) => io.observe(item));
  } else {
    items.forEach((item) => item.classList.add("is-visible"));
  }
})();
