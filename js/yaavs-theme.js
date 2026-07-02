(function () {
  document.documentElement.dataset.yaavsTheme = "day";
  document.documentElement.style.colorScheme = "light";

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", "#eaf6ff");

  document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("yaavs-theme-toggle");
    if (toggle) toggle.remove();
  });
})();
