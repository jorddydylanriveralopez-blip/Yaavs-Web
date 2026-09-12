/**
 * YAAVS sonic hook.
 * Kept as a silent compatibility shim so existing loaders can call
 * `window.YaavsSonic.play()` without creating click sounds.
 */
(function () {
  async function playYaavsSonic() {
    return true;
  }

  window.YaavsSonic = { play: playYaavsSonic };
})();
