/**
 * Bloque de video presentación — mismo tamaño que el banner.
 */
(function () {
  const cfg = window.YAAVS_PRESENTACION;
  const host = document.querySelector("[data-presentacion-video]");
  const section = document.getElementById("presentacion-video");
  if (!cfg || !host || !section) return;

  const title = cfg.title || "Presentación YAAVS";
  const poster = cfg.poster || "";
  const youtube = (cfg.youtube || "").trim();
  const src = (cfg.src || "").trim();

  const playBtn = section.querySelector(".video-banner__play");
  const overlay = section.querySelector(".video-banner__overlay");

  function hideOverlay() {
    section.classList.add("is-playing");
    if (overlay) overlay.setAttribute("hidden", "");
    if (playBtn) playBtn.setAttribute("hidden", "");
  }

  function showOverlay() {
    section.classList.remove("is-playing");
    if (overlay) overlay.removeAttribute("hidden");
    if (playBtn) playBtn.removeAttribute("hidden");
  }

  if (youtube) {
    const id = extractYoutubeId(youtube);
    if (!id) return;

    const iframe = document.createElement("iframe");
    iframe.className = "video-banner__iframe";
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
    iframe.title = title;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    host.appendChild(iframe);

    playBtn?.addEventListener("click", () => {
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
      hideOverlay();
    });
    return;
  }

  if (!src) {
    section.classList.add("video-banner--empty");
    return;
  }

  const video = document.createElement("video");
  video.className = "video-banner__video";
  video.setAttribute("playsinline", "");
  video.setAttribute("controls", "");
  video.setAttribute("preload", "metadata");
  if (poster) video.poster = poster;

  const mp4 = document.createElement("source");
  mp4.src = src;
  mp4.type = "video/mp4";
  video.appendChild(mp4);

  if (cfg.webm) {
    const webm = document.createElement("source");
    webm.src = cfg.webm;
    webm.type = "video/webm";
    video.appendChild(webm);
  }

  host.appendChild(video);

  playBtn?.addEventListener("click", () => {
    hideOverlay();
    const play = video.play();
    if (play && typeof play.catch === "function") play.catch(() => {});
  });

  video.addEventListener("ended", showOverlay);

  video.addEventListener("click", () => {
    if (video.paused) hideOverlay();
  });
})();

function extractYoutubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/");
    const embedIdx = parts.indexOf("embed");
    if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
  } catch {
    return null;
  }
  return null;
}
