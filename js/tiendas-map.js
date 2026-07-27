(function () {
  if (!document.body.classList.contains("page-tiendas-map")) return;

  const baitStores = [
    {
      id: "coacalco",
      name: "Plaza Coacalco",
      city: "San Francisco Coacalco, Méx.",
      address:
        "Av. José López Portillo #220, San Lorenzo Tetlixtac, C.P. 55714, San Francisco Coacalco, Méx.",
      lat: 19.6266167,
      lng: -99.0821072,
    },
    {
      id: "puebla",
      name: "Plaza Loreto",
      city: "Puebla, Pue.",
      address:
        "Cal. Ignacio Zaragoza #266, Loc. 10D, dentro de Plaza Loreto, Col. Los Pinos, C.P. 72240, Puebla, Pue.",
      lat: 19.0655554,
      lng: -98.1766463,
    },
    {
      id: "xalapa",
      name: "Xalapa Centro",
      city: "Xalapa, Ver.",
      address: "C. Pípila #88 Loc. D, Col. Francisco Sarabia, C.P. 91048, Xalapa, Ver.",
      lat: 19.5414326,
      lng: -96.912911,
    },
  ];

  const carriers = {
    bait: {
      id: "bait",
      name: "BAIT",
      logo: "assets/operadores/bait-carriers-color.svg",
      lead: "Sucursales BAIT operadas por YAAVS: Coacalco, Puebla y Xalapa.",
      title: "Sucursales BAIT YAAVS",
      brandSub: "3 sucursales autorizadas YAAVS",
      themeColor: "#0a0a0a",
      stores: baitStores,
    },
    att: {
      id: "att",
      name: "AT&T",
      logo: "assets/operadores/att-carriers-color.svg",
      queryTerm: "tiendas AT&T Mexico",
      lead: "Consulta tiendas AT&T disponibles en toda la República.",
      title: "Mapa de tiendas AT&T en tiempo real",
      brandSub: "Puntos de venta en toda la República Mexicana",
      themeColor: "#00a8e0",
      stores: null,
    },
  };

  const params = new URLSearchParams(window.location.search);
  const requested = (params.get("carrier") || "bait").toLowerCase();
  const carrier = carriers[requested] || carriers.bait;

  document.body.dataset.carrier = carrier.id;
  document.title = `${carrier.title} | YAAVS`;

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute("content", carrier.themeColor);

  const titleEl = document.getElementById("carrier-title");
  const leadEl = document.getElementById("carrier-lead");
  const nameEl = document.getElementById("carrier-name");
  const brandSubEl = document.getElementById("carrier-brand-sub");
  const logoEl = document.getElementById("carrier-logo");
  const frameEl = document.getElementById("carrier-map-frame");
  const mapHostEl = document.getElementById("carrier-map-host");
  const formEl = document.getElementById("carrier-map-form");
  const queryEl = document.getElementById("carrier-map-query");
  const statusEl = document.getElementById("carrier-map-status");
  const geolocateBtn = document.getElementById("carrier-map-geolocate");
  const storesEl = document.getElementById("carrier-stores");

  if (!formEl || !queryEl) return;

  if (titleEl) titleEl.textContent = carrier.title;
  if (leadEl) leadEl.textContent = carrier.lead;
  if (nameEl) nameEl.textContent = carrier.name;
  if (brandSubEl) brandSubEl.textContent = carrier.brandSub;
  if (logoEl) {
    logoEl.src = carrier.logo;
    logoEl.alt = carrier.name;
  }

  document
    .querySelectorAll("[data-carrier-link]")
    .forEach((link) => link.classList.toggle("is-active", link.dataset.carrierLink === carrier.id));

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text || "";
  }

  function mapsEmbedUrl(query, zoom) {
    const z = zoom == null ? 14 : zoom;
    return `https://www.google.com/maps?hl=es&q=${encodeURIComponent(query)}&z=${z}&output=embed`;
  }

  function mapsSearchUrl(query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  /* ─── BAIT: solo las 3 sucursales YAAVS ─── */
  if (carrier.stores && carrier.stores.length) {
    document.body.classList.add("is-stores-fixed");
    if (frameEl) frameEl.hidden = true;
    if (mapHostEl) mapHostEl.hidden = false;

    let leafletMap = null;
    let markersById = {};
    let activeId = carrier.stores[0].id;

    function renderStoreList(list) {
      if (!storesEl) return;
      storesEl.hidden = false;
      storesEl.innerHTML = list
        .map((store) => {
          const active = store.id === activeId ? " is-active" : "";
          return `
            <article class="tiendas-map__store${active}" data-store-id="${store.id}">
              <button type="button" class="tiendas-map__store-main" data-store-focus="${store.id}">
                <span class="tiendas-map__store-name">${store.name}</span>
                <span class="tiendas-map__store-city">${store.city}</span>
                <span class="tiendas-map__store-address">${store.address}</span>
              </button>
              <a class="tiendas-map__store-link" href="${mapsSearchUrl(store.address)}" target="_blank" rel="noopener noreferrer">Abrir en Google Maps</a>
            </article>
          `;
        })
        .join("");
    }

    function focusStore(store, opts) {
      if (!store) return;
      activeId = store.id;
      renderStoreList(
        carrier.stores.filter((s) => {
          const q = (queryEl.value || "").trim().toLowerCase();
          if (!q) return true;
          return `${s.name} ${s.city} ${s.address}`.toLowerCase().includes(q);
        })
      );

      if (leafletMap && markersById[store.id]) {
        leafletMap.setView([store.lat, store.lng], opts?.zoom || 15, { animate: true });
        markersById[store.id].openPopup();
      }

      if (frameEl) {
        frameEl.src = mapsEmbedUrl(store.address, 16);
      }

      setStatus(`Mostrando: ${store.name} · ${store.city}`);
    }

    function initLeaflet() {
      if (!mapHostEl || typeof window.L === "undefined") {
        /* Fallback: Google embed + lista */
        if (frameEl) {
          frameEl.hidden = false;
          frameEl.src = mapsEmbedUrl(carrier.stores[0].address, 15);
        }
        if (mapHostEl) mapHostEl.hidden = true;
        focusStore(carrier.stores[0]);
        return;
      }

      leafletMap = window.L.map(mapHostEl, {
        scrollWheelZoom: false,
        zoomControl: true,
      });

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(leafletMap);

      const bounds = [];
      carrier.stores.forEach((store) => {
        const marker = window.L.marker([store.lat, store.lng]).addTo(leafletMap);
        marker.bindPopup(
          `<strong>${store.name}</strong><br>${store.city}<br><small>${store.address}</small>`
        );
        marker.on("click", () => focusStore(store, { zoom: 15 }));
        markersById[store.id] = marker;
        bounds.push([store.lat, store.lng]);
      });

      leafletMap.fitBounds(bounds, { padding: [48, 48], maxZoom: 7 });
      setTimeout(() => leafletMap.invalidateSize(), 80);
      focusStore(carrier.stores[0], { zoom: 7 });
      leafletMap.fitBounds(bounds, { padding: [48, 48], maxZoom: 7 });
    }

    renderStoreList(carrier.stores);
    initLeaflet();

    storesEl?.addEventListener("click", (event) => {
      const link = event.target.closest(".tiendas-map__store-link");
      if (link) {
        event.stopPropagation();
        return;
      }
      const btn = event.target.closest("[data-store-id]");
      if (!btn) return;
      const store = carrier.stores.find((s) => s.id === btn.dataset.storeId);
      focusStore(store, { zoom: 15 });
    });

    formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      const q = queryEl.value.trim().toLowerCase();
      const matches = carrier.stores.filter((s) =>
        `${s.name} ${s.city} ${s.address}`.toLowerCase().includes(q)
      );
      if (!q) {
        renderStoreList(carrier.stores);
        if (leafletMap) {
          leafletMap.fitBounds(
            carrier.stores.map((s) => [s.lat, s.lng]),
            { padding: [48, 48], maxZoom: 7 }
          );
        }
        setStatus("Mostrando las 3 sucursales BAIT YAAVS.");
        return;
      }
      if (!matches.length) {
        renderStoreList([]);
        setStatus("No hay sucursales YAAVS con ese criterio. Prueba Coacalco, Puebla o Xalapa.");
        return;
      }
      renderStoreList(matches);
      focusStore(matches[0], { zoom: 14 });
      if (leafletMap && matches.length > 1) {
        leafletMap.fitBounds(
          matches.map((s) => [s.lat, s.lng]),
          { padding: [48, 48], maxZoom: 10 }
        );
      }
    });

    geolocateBtn?.addEventListener("click", () => {
      if (!navigator.geolocation) {
        setStatus("Tu navegador no permite geolocalización.");
        return;
      }
      geolocateBtn.disabled = true;
      setStatus("Obteniendo tu ubicación...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const nearest = carrier.stores
            .map((s) => ({
              store: s,
              dist: Math.hypot(s.lat - latitude, s.lng - longitude),
            }))
            .sort((a, b) => a.dist - b.dist)[0].store;
          focusStore(nearest, { zoom: 14 });
          setStatus(`Sucursal BAIT YAAVS más cercana: ${nearest.name}.`);
          geolocateBtn.disabled = false;
        },
        () => {
          setStatus("No pudimos detectar tu ubicación. Elige una sucursal de la lista.");
          geolocateBtn.disabled = false;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });

    if (queryEl) {
      queryEl.placeholder = "Ej. Coacalco, Puebla o Xalapa";
    }
    setStatus("Mostrando las 3 sucursales BAIT YAAVS.");
    return;
  }

  /* ─── AT&T u otros: búsqueda abierta ─── */
  if (!frameEl) return;
  if (mapHostEl) mapHostEl.hidden = true;
  if (storesEl) storesEl.hidden = true;
  frameEl.hidden = false;

  function updateMap(query, statusText) {
    frameEl.src = mapsEmbedUrl(query, 6);
    setStatus(statusText || `Mostrando resultados para: ${query}`);
  }

  updateMap(carrier.queryTerm, `Mostrando ${carrier.name} en todo México.`);

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
      setStatus("Tu navegador no permite geolocalización.");
      return;
    }

    geolocateBtn.disabled = true;
    setStatus("Obteniendo tu ubicación...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const query = `${carrier.name} tiendas cerca de ${latitude}, ${longitude}`;
        updateMap(query, `Ubicación detectada. Mostrando tiendas ${carrier.name} cercanas.`);
        geolocateBtn.disabled = false;
      },
      () => {
        setStatus("No pudimos detectar tu ubicación. Intenta buscar por ciudad.");
        geolocateBtn.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
})();
