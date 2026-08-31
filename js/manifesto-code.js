/**
 * Manifiesto — máquina de escribir: 3 frases en el mismo lugar.
 */
(function () {
  const stage = document.querySelector("[data-manifesto-typewriter]");
  const output = document.querySelector("[data-manifesto-output]");
  const citeEl = document.querySelector("[data-manifesto-cite]");
  const idxEl = document.querySelector("[data-manifesto-idx]");
  if (!stage || !output) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const PHRASES = [
    {
      cite: "Carlos Slim",
      segments: [
        { text: "Todos los tiempos son buenos para quienes ", accent: false },
        { text: "saben trabajar", accent: true },
        { text: " y tienen con qué hacerlo.", accent: false },
      ],
    },
    {
      cite: "Mentalidad empresarial",
      segments: [
        { text: "No se trata de tener las mejores ideas, sino de ", accent: false },
        { text: "ejecutarlas con determinación", accent: true },
        { text: ".", accent: false },
      ],
    },
    {
      cite: "Liderazgo en negocios",
      segments: [
        { text: "Los grandes empresarios ven ", accent: false },
        { text: "oportunidades", accent: true },
        { text: " donde otros solo ven problemas.", accent: false },
      ],
    },
  ];

  const TYPE_MS = 42;
  const DELETE_MS = 20;
  const HOLD_MS = 2800;
  const BETWEEN_MS = 420;

  let charsCache = [];
  let phraseIndex = 0;
  let running = false;
  let abortToken = 0;

  function buildChars(phrase) {
    const chars = [];
    phrase.segments.forEach((seg) => {
      [...seg.text].forEach((ch) => chars.push({ ch, accent: seg.accent }));
    });
    return chars;
  }

  PHRASES.forEach((p) => {
    charsCache.push(buildChars(p));
  });

  function escapeHtml(ch) {
    if (ch === "&") return "&amp;";
    if (ch === "<") return "&lt;";
    if (ch === ">") return "&gt;";
    return ch;
  }

  function render(count, chars, withCursor) {
    let html = "";
    let inAccent = false;

    for (let i = 0; i < count; i += 1) {
      const { ch, accent } = chars[i];
      if (accent && !inAccent) {
        html += '<span class="manifesto__accent">';
        inAccent = true;
      }
      if (!accent && inAccent) {
        html += "</span>";
        inAccent = false;
      }
      html += escapeHtml(ch);
    }
    if (inAccent) html += "</span>";
    if (withCursor) {
      html += '<span class="manifesto__cursor" aria-hidden="true"></span>';
    }
    return html;
  }

  function wait(ms, token) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if (token !== abortToken) reject(new Error("aborted"));
        else resolve();
      }, ms);
    });
  }

  function setMeta(index) {
    const phrase = PHRASES[index];
    if (idxEl) idxEl.textContent = String(index + 1).padStart(2, "0");
    if (citeEl) citeEl.textContent = phrase.cite;
    stage.setAttribute("data-phrase", String(index + 1));
  }

  async function typeChars(chars, token) {
    output.classList.add("is-typing");
    for (let i = 1; i <= chars.length; i += 1) {
      output.innerHTML = render(i, chars, i < chars.length);
      await wait(TYPE_MS, token);
    }
    output.innerHTML = render(chars.length, chars, true);
    output.classList.remove("is-typing");
  }

  async function deleteChars(chars, token) {
    output.classList.add("is-deleting");
    for (let i = chars.length - 1; i >= 0; i -= 1) {
      output.innerHTML = render(i, chars, true);
      await wait(DELETE_MS, token);
    }
    output.innerHTML = "";
    output.classList.remove("is-deleting");
    await wait(BETWEEN_MS, token);
  }

  async function loop(token) {
    while (running && token === abortToken) {
      const chars = charsCache[phraseIndex];
      setMeta(phraseIndex);
      await typeChars(chars, token);
      await wait(HOLD_MS, token);
      await deleteChars(chars, token);
      phraseIndex = (phraseIndex + 1) % PHRASES.length;
    }
  }

  function showStatic() {
    const chars = charsCache[0];
    setMeta(0);
    output.innerHTML = render(chars.length, chars, false);
  }

  function start() {
    if (running) return;
    running = true;
    abortToken += 1;
    const token = abortToken;
    loop(token).catch(() => {});
  }

  function stop() {
    running = false;
    abortToken += 1;
  }

  if (reducedMotion) {
    showStatic();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) start();
      else stop();
    },
    { threshold: 0.28, rootMargin: "0px 0px -8% 0px" }
  );

  observer.observe(stage.closest(".manifesto") || stage);
})();
