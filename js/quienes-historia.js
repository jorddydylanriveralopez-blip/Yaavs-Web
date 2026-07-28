(function () {
  if (!document.body.classList.contains("page-asi-somos")) return;

  const dialog = document.getElementById("asi-historia");
  const openers = document.querySelectorAll("[data-historia-open]");
  if (!dialog || !openers.length) return;

  const sheet = dialog.querySelector(".asi-historia__sheet");
  const track = dialog.querySelector(".asi-historia__track");
  const progress = dialog.querySelector(".asi-historia__progress");
  const closeBtn = dialog.querySelector("[data-historia-close]");
  const yearsNav = dialog.querySelector("[data-historia-years]");
  const statusEl = dialog.querySelector("[data-historia-status]");
  const prevBtn = dialog.querySelector("[data-historia-prev]");
  const nextBtn = dialog.querySelector("[data-historia-next]");
  const items = Array.from(dialog.querySelectorAll(".asi-historia__item"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastFocus = null;
  let activeIndex = 0;
  let scrollingTo = false;
  let yearButtons = [];

  items.forEach((item, index) => {
    item.style.setProperty("--asi-delay", `${Math.min(index * 70, 420)}ms`);
    item.dataset.side = index % 2 === 0 ? "left" : "right";
    item.dataset.index = String(index);
    if (!item.dataset.year) {
      const year = item.querySelector(".asi-historia__year")?.textContent?.trim();
      if (year) item.dataset.year = year;
    }
  });

  function buildYearNav() {
    if (!yearsNav || !items.length) return;
    yearsNav.innerHTML = "";
    yearButtons = items.map((item, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "asi-historia__year-btn";
      btn.textContent = item.dataset.year || String(2014 + index);
      btn.setAttribute("aria-label", `Ir a ${btn.textContent}`);
      btn.addEventListener("click", () => goTo(index, true));
      yearsNav.appendChild(btn);
      return btn;
    });
  }

  function updateStatus(index) {
    const item = items[index];
    if (!statusEl || !item) return;
    const year = item.dataset.year || "";
    statusEl.textContent = `${index + 1} / ${items.length}${year ? ` · ${year}` : ""}`;
  }

  function updateYearButtons(index) {
    yearButtons.forEach((btn, i) => {
      btn.classList.toggle("is-active", i === index);
      btn.setAttribute("aria-current", i === index ? "true" : "false");
    });
    const activeBtn = yearButtons[index];
    if (activeBtn && yearsNav) {
      const left =
        activeBtn.offsetLeft - yearsNav.clientWidth / 2 + activeBtn.offsetWidth / 2;
      yearsNav.scrollTo({
        left: Math.max(0, left),
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }

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
    updateStatus(activeIndex);
    updateYearButtons(activeIndex);
    if (prevBtn) prevBtn.disabled = activeIndex <= 0;
    if (nextBtn) nextBtn.disabled = activeIndex >= items.length - 1;
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
    const top = Math.max(0, item.offsetTop - 88);
    sheet.scrollTo({
      top,
      behavior: reduceMotion ? "auto" : "smooth",
    });
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
    updateStatus(0);
    updateYearButtons(0);
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
    items.slice(0, 2).forEach((item, i) => {
      window.setTimeout(() => item.classList.add("is-visible"), 120 + i * 90);
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

  buildYearNav();

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
    item.addEventListener("click", () => goTo(index, true));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
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

  if ("IntersectionObserver" in window && items.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { root: sheet || null, threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((item) => io.observe(item));
  } else {
    items.forEach((item) => item.classList.add("is-visible"));
  }
})();
