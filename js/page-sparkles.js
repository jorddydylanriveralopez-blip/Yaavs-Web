(function () {
  function mountSparkles() {
    const layers = document.querySelectorAll(".page-sparkles, .jobs-apply-sparkles");
    if (!layers.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = reduced ? 8 : 22;

    const spots = [
      [6, 14], [14, 28], [22, 8], [31, 42], [38, 18], [48, 55], [55, 32], [63, 12],
      [72, 48], [80, 22], [88, 66], [18, 72], [28, 58], [42, 78], [58, 84], [70, 70],
      [8, 88], [92, 38], [46, 26], [76, 8], [12, 46], [84, 52],
    ];

    layers.forEach((layer) => {
      if (layer.dataset.sparklesReady) return;
      layer.dataset.sparklesReady = "1";

      spots.slice(0, count).forEach(([left, top], i) => {
        const dot = document.createElement("span");
        dot.className = "page-sparkle";
        dot.style.left = `${left}%`;
        dot.style.top = `${top}%`;
        dot.style.setProperty("--delay", `${(i * 0.35) % 4}s`);
        dot.style.setProperty("--dur", `${2.4 + (i % 5) * 0.45}s`);
        dot.style.setProperty("--sz", i % 3 === 0 ? "4px" : "3px");
        layer.appendChild(dot);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountSparkles);
  } else {
    mountSparkles();
  }
})();
