/**
 * Sonic logo YAAVS � "Yaa � vs" (dos golpes, estilo tun-tun de marca).
 * Sintetizado con Web Audio API; sin archivos externos.
 */
(function () {
  let ctx = null;
  let lastPlay = 0;
  let fallbackBound = false;
  const MIN_GAP_MS = 90;

  function getCtx() {
    if (ctx) return ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    return ctx;
  }

  function ping(audio, opts) {
    const {
      freq,
      start,
      duration = 0.08,
      type = "sine",
      gain = 0.1,
      attack = 0.004,
      release = 0.05,
    } = opts;

    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), start + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration + release);
    osc.connect(amp);
    amp.connect(audio.destination);
    osc.start(start);
    osc.stop(start + duration + release + 0.03);
  }

  function connectBlip(audio, start) {
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(740, start);
    osc.frequency.exponentialRampToValueAtTime(1180, start + 0.07);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(0.045, start + 0.006);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);
    osc.connect(amp);
    amp.connect(audio.destination);
    osc.start(start);
    osc.stop(start + 0.1);
  }

  function synthesize(audio) {
    const t0 = audio.currentTime + 0.015;

    ping(audio, { freq: 311.13, start: t0, duration: 0.075, type: "triangle", gain: 0.13, release: 0.04 });
    ping(audio, { freq: 622.25, start: t0, duration: 0.05, type: "sine", gain: 0.035, release: 0.03 });

    const t1 = t0 + 0.105;
    ping(audio, { freq: 523.25, start: t1, duration: 0.085, type: "sine", gain: 0.11, release: 0.055 });
    ping(audio, { freq: 1046.5, start: t1, duration: 0.065, type: "sine", gain: 0.048, release: 0.04 });
    ping(audio, { freq: 1568, start: t1 + 0.018, duration: 0.04, type: "sine", gain: 0.022, release: 0.03 });

    connectBlip(audio, t1 + 0.13);
  }

  async function playYaavsSonic() {
    const now = performance.now();
    if (now - lastPlay < MIN_GAP_MS) return true;

    const audio = getCtx();
    if (!audio) return false;

    try {
      if (audio.state === "suspended") await audio.resume();
      if (audio.state !== "running") return false;

      synthesize(audio);
      lastPlay = now;
      document.dispatchEvent(new CustomEvent("yaavs:sonic-played"));
      return true;
    } catch {
      return false;
    }
  }

  function bindFallback() {
    if (fallbackBound) return;
    fallbackBound = true;

    const unlock = () => {
      playYaavsSonic();
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("keydown", unlock, true);
    };

    document.addEventListener("pointerdown", unlock, true);
    document.addEventListener("keydown", unlock, true);
  }

  function bindMenuClicks() {
    const mainNav = document.getElementById("main-nav");
    const navToggle = document.getElementById("nav-toggle");

    mainNav?.addEventListener("click", (e) => {
      if (e.target.closest("a")) playYaavsSonic();
    });

    navToggle?.addEventListener("click", () => {
      playYaavsSonic();
    });
  }

  function bindHomeClicks() {
    if (!document.body.classList.contains("page-home")) return;

    const main = document.getElementById("contenido");
    if (!main) return;

    main.addEventListener("click", (e) => {
      const target = e.target.closest("a, button");
      if (!target || target.closest(".social-float")) return;
      playYaavsSonic();
    });
  }

  function onIntroStart() {
    playYaavsSonic().then((ok) => {
      if (!ok) bindFallback();
    });
  }

  function init() {
    document.addEventListener("yaavs:layout-ready", bindMenuClicks, { once: true });

    if (document.body.classList.contains("page-home")) {
      document.addEventListener("yaavs:intro-start", onIntroStart, { once: true });
      bindHomeClicks();

      if (document.body.classList.contains("page-intro-done")) {
        window.setTimeout(onIntroStart, 180);
      }
    }
  }

  window.YaavsSonic = { play: playYaavsSonic };

  init();
})();
