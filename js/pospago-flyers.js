/**
 * Flyers pospago: inclinación 3D + lightbox para ver el plan completo.
 */
(function () {
  const root = document.querySelector("[data-pospago-flyers]");
  const dialog = document.getElementById("pospago-flyer-lightbox");
  if (!root || !dialog) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const imgEl = dialog.querySelector("#pospago-flyer-lightbox-img");
  const titleEl = dialog.querySelector("#pospago-flyer-lightbox-title");
  const countEl = dialog.querySelector("[data-pospago-flyer-count]");
  const opens = Array.from(document.querySelectorAll("[data-pospago-flyer]"));
  const cards = Array.from(root.querySelectorAll(".pospago-flyer__open"));

  const flyers = cards.map((btn, i) => {
    const img = btn.querySelector("img");
    return {
      full: img?.getAttribute("data-full") || img?.src || "",
      thumb: img?.src || "",
      title: i === 0 ? "AT&T Premium y Simple Plus" : "AT&T Lite y portabilidad",
      alt: img?.alt || "",
    };
  });

  let index = 0;
  let swipe = null;

  function setTilt(btn, x, y, hot) {
    const shot = btn.querySelector(".pospago-flyer__shot");
    if (!shot) return;
    btn.classList.toggle("is-hot", hot);
    if (!hot || reduced) {
      shot.style.setProperty("--tilt-x", "0deg");
      shot.style.setProperty("--tilt-y", "0deg");
      shot.style.setProperty("--tilt-s", "1");
      return;
    }
    shot.style.setProperty("--tilt-x", `${(-y * 10).toFixed(2)}deg`);
    shot.style.setProperty("--tilt-y", `${(x * 14).toFixed(2)}deg`);
    shot.style.setProperty("--tilt-s", "1.03");
    shot.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
    shot.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
  }

  cards.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      setTilt(btn, x, y, true);
    });
    btn.addEventListener("mouseleave", () => setTilt(btn, 0, 0, false));
  });

  function render() {
    const flyer = flyers[index];
    if (!flyer || !imgEl) return;
    imgEl.src = flyer.full;
    imgEl.alt = flyer.alt;
    if (titleEl) titleEl.textContent = flyer.title;
    if (countEl) countEl.textContent = `${index + 1}/${flyers.length}`;
  }

  function openAt(i) {
    index = ((i % flyers.length) + flyers.length) % flyers.length;
    render();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function go(dir) {
    index = (index + dir + flyers.length) % flyers.length;
    render();
  }

  opens.forEach((el) => {
    el.addEventListener("click", () => {
      openAt(Number(el.getAttribute("data-pospago-flyer")) || 0);
    });
  });

  dialog.querySelector("[data-pospago-flyer-prev]")?.addEventListener("click", () => go(-1));
  dialog.querySelector("[data-pospago-flyer-next]")?.addEventListener("click", () => go(1));

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  document.addEventListener("keydown", (e) => {
    if (!dialog.open) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  });

  dialog.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      swipe = { x: e.touches[0].clientX };
    },
    { passive: true }
  );
  dialog.addEventListener(
    "touchend",
    (e) => {
      if (!swipe) return;
      const dx = e.changedTouches[0].clientX - swipe.x;
      swipe = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    },
    { passive: true }
  );
})();
