(function () {
  if (!document.body.classList.contains("page-asi-somos")) return;

  const dialog = document.getElementById("asi-historia");
  const openers = document.querySelectorAll("[data-historia-open]");
  if (!dialog || !openers.length) return;

  const sheet = dialog.querySelector(".asi-historia__sheet");
  const track = dialog.querySelector(".asi-historia__track");
  const progress = dialog.querySelector(".asi-historia__progress");
  const closeBtn = dialog.querySelector("[data-historia-close]");
  const prevBtn = dialog.querySelector("[data-historia-prev]");
  const nextBtn = dialog.querySelector("[data-historia-next]");
  const statusEl = dialog.querySelector("[data-historia-status]");
  const items = Array.from(dialog.querySelectorAll(".asi-historia__item"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mqMobile = window.matchMedia("(max-width: 720px)");
  const isMobile = () => mqMobile.matches;

  let lastFocus = null;
  let activeIndex = -1;
  let scrollingTo = false;

  items.forEach((item, index) => {
    item.style.setProperty("--asi-delay", "0ms");
    item.dataset.side = index % 2 === 0 ? "left" : "right";
    item.dataset.index = String(index);
    if (!item.dataset.year) {
      const year = item.querySelector(".asi-historia__year")?.textContent?.trim();
      if (year) item.dataset.year = year;
    }
    if (item.dataset.year && !item.querySelector(".asi-historia__year-giant")) {
      const giant = document.createElement("span");
      giant.className = "asi-historia__year-giant";
      giant.setAttribute("aria-hidden", "true");
      giant.textContent = item.dataset.year;
      item.appendChild(giant);
    }
  });

  function offsetInSheet(el) {
    if (!sheet || !el) return 0;
    const sheetRect = sheet.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return elRect.top - sheetRect.top + sheet.scrollTop;
  }

  function updateProgress() {
    if (!sheet || !progress) return;
    const max = Math.max(sheet.scrollHeight - sheet.clientHeight, 1);
    const ratio = Math.min(Math.max(sheet.scrollTop / max, 0), 1);
    progress.style.transform = `scaleY(${Math.max(ratio, 0.04)})`;
  }

  function updatePager() {
    if (statusEl) {
      statusEl.textContent = `${Math.max(activeIndex, 0) + 1} / ${items.length}`;
    }
    if (prevBtn) prevBtn.disabled = activeIndex <= 0;
    if (nextBtn) nextBtn.disabled = activeIndex >= items.length - 1;
  }

  /* Solo el año activo se ve; anterior y siguiente ocultos */
  function setActiveItem(index, { expand = false } = {}) {
    const next = Math.max(0, Math.min(index, items.length - 1));
    const forceExpand = isMobile() || expand;
    if (next === activeIndex) {
      items[next]?.classList.toggle("is-expanded", forceExpand);
      updatePager();
      return;
    }
    activeIndex = next;
    items.forEach((item, i) => {
      const on = i === activeIndex;
      item.classList.toggle("is-active", on);
      item.classList.toggle("is-visible", on);
      item.classList.toggle("is-expanded", on && forceExpand);
      item.classList.toggle("is-away", !on);
      item.setAttribute("aria-current", on ? "true" : "false");
      item.setAttribute("aria-hidden", on ? "false" : "true");
    });
    updatePager();
  }

  function syncActiveFromScroll() {
    if (!sheet || !items.length || scrollingTo) return;
    const sheetRect = sheet.getBoundingClientRect();
    const mid = sheetRect.top + sheet.clientHeight * 0.45;
    let best = 0;
    let bestDist = Infinity;
    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      const center = rect.top + rect.height * 0.5;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    if (best !== activeIndex) setActiveItem(best, { expand: isMobile() });
  }

  function goTo(index, fromUser) {
    const next = Math.max(0, Math.min(index, items.length - 1));
    const item = items[next];
    if (!item || !sheet) return;

    setActiveItem(next, { expand: Boolean(fromUser) || isMobile() });
    scrollingTo = true;
    const scrollToItem = () => {
      const itemTop = offsetInSheet(item);
      const top = Math.max(
        0,
        Math.min(
          itemTop - Math.max(56, (sheet.clientHeight - item.offsetHeight) * 0.32),
          sheet.scrollHeight - sheet.clientHeight
        )
      );
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
      syncActiveFromScroll();
      updateProgress();
    }, reduceMotion ? 40 : 560);
    if (fromUser) item.focus({ preventScroll: true });
  }

  function resetReveal() {
    activeIndex = -1;
    items.forEach((item) => {
      item.classList.remove("is-visible", "is-active", "is-expanded");
      item.classList.add("is-away");
      item.setAttribute("aria-hidden", "true");
      item.removeAttribute("aria-current");
    });
    if (progress) progress.style.transform = "scaleY(0.04)";
    if (track) track.classList.remove("is-drawn");
    updatePager();
  }

  function kickReveal() {
    if (track) {
      requestAnimationFrame(() => track.classList.add("is-drawn"));
    }
    setActiveItem(0, { expand: isMobile() });
    updateProgress();
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
    dialog.classList.remove("is-mobile-pager");
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
    dialog.classList.remove("is-open", "is-mobile-pager");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  openers.forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      openHistoria();
    });
  });

  closeBtn?.addEventListener("click", closeHistoria);
  prevBtn?.addEventListener("click", () => goTo(activeIndex - 1, true));
  nextBtn?.addEventListener("click", () => goTo(activeIndex + 1, true));

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeHistoria();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeHistoria();
  });

  dialog.addEventListener("keydown", (event) => {
    if (!dialog.classList.contains("is-open")) return;
    if (
      event.key === "ArrowDown" ||
      event.key === "PageDown" ||
      event.key === "ArrowRight"
    ) {
      event.preventDefault();
      goTo(activeIndex + 1, true);
    } else if (
      event.key === "ArrowUp" ||
      event.key === "PageUp" ||
      event.key === "ArrowLeft"
    ) {
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
      if (index === activeIndex && item.classList.contains("is-expanded") && !isMobile()) {
        setActiveItem(index, { expand: false });
        return;
      }
      goTo(index, true);
    });
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (index === activeIndex && item.classList.contains("is-expanded") && !isMobile()) {
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

  mqMobile.addEventListener("change", () => {
    if (!dialog.classList.contains("is-open")) return;
    dialog.classList.remove("is-mobile-pager");
    setActiveItem(Math.max(activeIndex, 0), { expand: isMobile() });
  });
})();
