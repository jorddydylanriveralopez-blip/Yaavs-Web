(function () {
  if (!document.body.classList.contains("page-tiendas-map")) return;

  const carriers = {
    bait: {
      id: "bait",
      name: "BAIT",
      logo: "assets/operadores/bait-carriers.svg",
      queryTerm: "tiendas BAIT Mexico",
      lead: "Ubica tiendas BAIT por ciudad, colonia o punto comercial.",
      title: "Mapa de tiendas BAIT en tiempo real",
    },
    att: {
      id: "att",
      name: "AT&T",
      logo: "assets/operadores/att-carriers.svg",
      queryTerm: "tiendas AT&T Mexico",
      lead: "Consulta tiendas AT&T disponibles en toda la Republica.",
      title: "Mapa de tiendas AT&T en tiempo real",
    },
    movistar: {
      id: "movistar",
      name: "Movistar",
      logo: "assets/operadores/movistar-carriers.svg",
      queryTerm: "tiendas Movistar Mexico",
      lead: "Encuentra sucursales Movistar por region y ciudad.",
      title: "Mapa de tiendas Movistar en tiempo real",
    },
    unefon: {
      id: "unefon",
      name: "Unefon",
      logo: "assets/operadores/unefon-carriers.png",
      queryTerm: "tiendas Unefon Mexico",
      lead: "Revisa ubicaciones Unefon para activaciones y recargas.",
      title: "Mapa de tiendas Unefon en tiempo real",
    },
  };

  const params = new URLSearchParams(window.location.search);
  const requested = (params.get("carrier") || "bait").toLowerCase();
  const carrier = carriers[requested] || carriers.bait;

  document.body.dataset.carrier = carrier.id;

  const titleEl = document.getElementById("carrier-title");
  const leadEl = document.getElementById("carrier-lead");
  const nameEl = document.getElementById("carrier-name");
  const logoEl = document.getElementById("carrier-logo");
  const frameEl = document.getElementById("carrier-map-frame");
  const formEl = document.getElementById("carrier-map-form");
  const queryEl = document.getElementById("carrier-map-query");
  const statusEl = document.getElementById("carrier-map-status");
  const geolocateBtn = document.getElementById("carrier-map-geolocate");

  if (!frameEl || !formEl || !queryEl) return;

  if (titleEl) titleEl.textContent = carrier.title;
  if (leadEl) leadEl.textContent = carrier.lead;
  if (nameEl) nameEl.textContent = carrier.name;
  if (logoEl) {
    logoEl.src = carrier.logo;
    logoEl.alt = carrier.name;
  }

  document
    .querySelectorAll("[data-carrier-link]")
    .forEach((link) => link.classList.toggle("is-active", link.dataset.carrierLink === carrier.id));

  function mapSrcFromQuery(query) {
    return `https://www.google.com/maps?hl=es&q=${encodeURIComponent(query)}&z=6&output=embed`;
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text || "";
  }

  function updateMap(query, statusText) {
    frameEl.src = mapSrcFromQuery(query);
    setStatus(statusText || `Mostrando resultados para: ${query}`);
  }

  updateMap(carrier.queryTerm, `Mostrando ${carrier.name} en todo Mexico.`);

  formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    const raw = queryEl.value.trim();
    if (!raw) {
      setStatus("Escribe una ciudad, estado o zona para buscar.");
      queryEl.focus();
      return;
    }
    const query = `${carrier.name} tiendas ${raw}`;
    updateMap(query);
  });

  geolocateBtn?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      setStatus("Tu navegador no permite geolocalizacion.");
      return;
    }

    geolocateBtn.disabled = true;
    setStatus("Obteniendo tu ubicacion...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const query = `${carrier.name} tiendas cerca de ${latitude}, ${longitude}`;
        updateMap(query, `Ubicacion detectada. Mostrando tiendas ${carrier.name} cercanas.`);
        geolocateBtn.disabled = false;
      },
      () => {
        setStatus("No pudimos detectar tu ubicacion. Intenta buscar por ciudad.");
        geolocateBtn.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
})();
