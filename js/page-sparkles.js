/**
 * Destellos / partículas en capas .page-sparkles
 */
(function () {
  function mountSparkles() {
    const layers = document.querySelectorAll(".page-sparkles, .jobs-apply-sparkles");
    if (!layers.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = reduced ? 14 : 64;

    const baseSpots = [
      [6, 14], [14, 28], [22, 8], [31, 42], [38, 18], [48, 55], [55, 32], [63, 12],
      [72, 48], [80, 22], [88, 66], [18, 72], [28, 58], [42, 78], [58, 84], [70, 70],
      [8, 88], [92, 38], [46, 26], [76, 8], [12, 46], [84, 52],
      [25, 35], [65, 40], [40, 60], [85, 15], [15, 55], [50, 10], [33, 88], [77, 78],
      [5, 40], [95, 70], [60, 5], [45, 92], [10, 62], [68, 28], [82, 82], [36, 16],
      [52, 70], [20, 20], [90, 48], [74, 58], [30, 80], [58, 48], [44, 38], [16, 34],
    ];

    /* Relleno extra para más densidad */
    while (baseSpots.length < count) {
      const i = baseSpots.length;
      baseSpots.push([
        (7 + ((i * 37) % 86)) % 96,
        (5 + ((i * 53) % 90)) % 94,
      ]);
    }

    layers.forEach((layer) => {
      if (layer.dataset.sparklesReady) return;
      layer.dataset.sparklesReady = "1";
      layer.classList.add("page-sparkles--boost");

      baseSpots.slice(0, count).forEach(([left, top], i) => {
        const dot = document.createElement("span");
        const kind = i % 5 === 0 ? "star" : i % 4 === 0 ? "glow" : "dot";
        dot.className = `page-sparkle page-sparkle--${kind}`;
        dot.style.left = `${left}%`;
        dot.style.top = `${top}%`;
        dot.style.setProperty("--delay", `${((i * 0.22) % 5.5).toFixed(2)}s`);
        dot.style.setProperty("--dur", `${1.8 + (i % 6) * 0.38}s`);
        const size = kind === "glow" ? 7 : kind === "star" ? 6 : i % 3 === 0 ? 4 : 3;
        dot.style.setProperty("--sz", `${size}px`);
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
