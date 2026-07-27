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
      lead: "Explora el mapa, elige una sucursal y usa GPS para ir hasta allá.",
      title: "Sucursales BAIT YAAVS",
      brandSub: "3 sucursales autorizadas YAAVS · mapa interactivo",
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
  const brandSubEl = document.getElementById("carrier-brand-sub");
  const logoEl = document.getElementById("carrier-logo");
  const frameEl = document.getElementById("carrier-map-frame");
  const mapHostEl = document.getElementById("carrier-map-host");
  const formEl = document.getElementById("carrier-map-form");
  const queryEl = document.getElementById("carrier-map-query");
  const statusEl = document.getElementById("carrier-map-status");
  const geolocateBtn = document.getElementById("carrier-map-geolocate");
  const storesEl = document.getElementById("carrier-stores");
  const navPanelEl = document.getElementById("carrier-nav-panel");
  const navTitleEl = document.getElementById("carrier-nav-title");
  const navAddressEl = document.getElementById("carrier-nav-address");
  const navGoEl = document.getElementById("carrier-nav-go");
  const navOpenEl = document.getElementById("carrier-nav-open");
  const zoomInBtn = document.getElementById("carrier-map-zoom-in");
  const zoomOutBtn = document.getElementById("carrier-map-zoom-out");
  const fitAllBtn = document.getElementById("carrier-map-fit-all");

  if (!formEl || !queryEl) return;

  if (titleEl) titleEl.textContent = carrier.title;
  if (leadEl) leadEl.textContent = carrier.lead;
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
    const z = zoom == null ? 16 : zoom;
    return `https://www.google.com/maps?hl=es&q=${encodeURIComponent(query)}&z=${z}&output=embed`;
  }

  function mapsSearchUrl(query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  function mapsDirectionsUrl(store, origin) {
    const dest = `${store.lat},${store.lng}`;
    const params = new URLSearchParams({
      api: "1",
      destination: dest,
      destination_place_id: "",
      travelmode: "driving",
    });
    /* destination as address helps Google resolve the place name */
    params.set("destination", `${store.name}, ${store.address}`);
    if (origin && Number.isFinite(origin.lat) && Number.isFinite(origin.lng)) {
      params.set("origin", `${origin.lat},${origin.lng}`);
    }
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  /* ─── BAIT: mapa interactivo + GPS ─── */
  if (carrier.stores && carrier.stores.length) {
    document.body.classList.add("is-stores-fixed");
    if (frameEl) frameEl.hidden = false;
    if (mapHostEl) mapHostEl.hidden = false;
    if (navPanelEl) navPanelEl.hidden = false;

    let leafletMap = null;
    let markersById = {};
    let userMarker = null;
    let userAccuracy = null;
    let userOrigin = null;
    let activeId = carrier.stores[0].id;

    function activeStore() {
      return carrier.stores.find((s) => s.id === activeId) || carrier.stores[0];
    }

    function updateNavPanel(store) {
      if (!store) return;
      if (navTitleEl) navTitleEl.textContent = store.name;
      if (navAddressEl) navAddressEl.textContent = `${store.city} · ${store.address}`;
      if (navGoEl) {
        navGoEl.href = mapsDirectionsUrl(store, userOrigin);
        navGoEl.setAttribute("aria-label", `Ir a ${store.name} con GPS`);
      }
      if (navOpenEl) {
        navOpenEl.href = mapsSearchUrl(store.address);
      }
    }

    function syncGoogleStreet(store) {
      if (!frameEl || !store) return;
      frameEl.hidden = false;
      frameEl.src = mapsEmbedUrl(`${store.lat},${store.lng} (${store.name})`, 17);
    }

    function renderStoreList(list) {
      if (!storesEl) return;
      storesEl.hidden = false;
      storesEl.innerHTML = list
        .map((store) => {
          const active = store.id === activeId ? " is-active" : "";
          return `
            <article class="tiendas-map__store${active}" data-store-id="${store.id}">
              <div class="tiendas-map__store-main" role="button" tabindex="0" data-store-focus="${store.id}">
                <span class="tiendas-map__store-name">${store.name}</span>
                <span class="tiendas-map__store-city">${store.city}</span>
                <span class="tiendas-map__store-address">${store.address}</span>
              </div>
              <div class="tiendas-map__store-actions">
                <a class="tiendas-map__store-link" href="${mapsSearchUrl(store.address)}" target="_blank" rel="noopener noreferrer">Ver en Maps</a>
                <a class="tiendas-map__store-go" href="${mapsDirectionsUrl(store, userOrigin)}" target="_blank" rel="noopener noreferrer">Ir allá</a>
              </div>
            </article>
          `;
        })
        .join("");
    }

    function highlightMarker(storeId) {
      Object.keys(markersById).forEach((id) => {
        const marker = markersById[id];
        const el = marker.getElement?.() || marker._icon;
        if (!el) return;
        el.classList.toggle("is-active-marker", id === storeId);
      });
    }

    function focusStore(store, opts) {
      if (!store) return;
      activeId = store.id;
      const filtered = carrier.stores.filter((s) => {
        const q = (queryEl.value || "").trim().toLowerCase();
        if (!q) return true;
        return `${s.name} ${s.city} ${s.address}`.toLowerCase().includes(q);
      });
      renderStoreList(filtered);
      updateNavPanel(store);
      syncGoogleStreet(store);
      highlightMarker(store.id);

      if (leafletMap && markersById[store.id]) {
        const zoom = opts?.zoom == null ? Math.max(leafletMap.getZoom(), 15) : opts.zoom;
        leafletMap.setView([store.lat, store.lng], zoom, { animate: true });
        markersById[store.id].openPopup();
      }

      setStatus(`Seleccionada: ${store.name}. Puedes hacer zoom o tocar Ir allá.`);
    }

    function fitAllStores() {
      if (!leafletMap) return;
      leafletMap.fitBounds(
        carrier.stores.map((s) => [s.lat, s.lng]),
        { padding: [56, 56], maxZoom: 7 }
      );
      setStatus("Vista de las 3 sucursales. Acerca el zoom para ver calles.");
    }

    function waitForLeaflet(cb, tries) {
      if (typeof window.L !== "undefined") {
        cb();
        return;
      }
      if (tries <= 0) {
        cb();
        return;
      }
      window.setTimeout(() => waitForLeaflet(cb, tries - 1), 80);
    }

    function initLeaflet() {
      if (!mapHostEl || typeof window.L === "undefined") {
        if (frameEl) {
          frameEl.hidden = false;
          syncGoogleStreet(carrier.stores[0]);
        }
        if (mapHostEl) mapHostEl.hidden = true;
        focusStore(carrier.stores[0]);
        return;
      }

      leafletMap = window.L.map(mapHostEl, {
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        zoomControl: true,
        zoomSnap: 0.25,
        zoomDelta: 0.75,
        minZoom: 4,
        maxZoom: 19,
      });

      /* Capas estilo calles (tipo Google): calles + etiquetas */
      const streets = window.L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      );
      const satellite = window.L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri",
          maxZoom: 19,
        }
      );
      streets.addTo(leafletMap);
      window.L.control
        .layers(
          {
            Calles: streets,
            Satélite: satellite,
          },
          null,
          { position: "topright", collapsed: true }
        )
        .addTo(leafletMap);

      const bounds = [];
      carrier.stores.forEach((store) => {
        const marker = window.L.marker([store.lat, store.lng], {
          title: store.name,
          riseOnHover: true,
        }).addTo(leafletMap);

        marker.bindPopup(
          `<div class="tiendas-map__popup">
            <strong>${store.name}</strong>
            <p>${store.city}</p>
            <small>${store.address}</small>
            <div class="tiendas-map__popup-actions">
              <a href="${mapsDirectionsUrl(store, userOrigin)}" target="_blank" rel="noopener noreferrer">Ir allá</a>
            </div>
          </div>`
        );
        marker.on("click", () => focusStore(store, { zoom: 16 }));
        markersById[store.id] = marker;
        bounds.push([store.lat, store.lng]);
      });

      leafletMap.fitBounds(bounds, { padding: [48, 48], maxZoom: 7 });
      window.setTimeout(() => leafletMap.invalidateSize(), 120);
      focusStore(carrier.stores[0], { zoom: 7 });
      leafletMap.fitBounds(bounds, { padding: [48, 48], maxZoom: 7 });
    }

    function showUserOnMap(lat, lng, accuracy) {
      userOrigin = { lat, lng };
      updateNavPanel(activeStore());
      renderStoreList(
        carrier.stores.filter((s) => {
          const q = (queryEl.value || "").trim().toLowerCase();
          if (!q) return true;
          return `${s.name} ${s.city} ${s.address}`.toLowerCase().includes(q);
        })
      );

      if (!leafletMap || typeof window.L === "undefined") return;

      if (userMarker) {
        userMarker.setLatLng([lat, lng]);
      } else {
        userMarker = window.L.circleMarker([lat, lng], {
          radius: 8,
          color: "#00bcd4",
          weight: 2,
          fillColor: "#00d4ee",
          fillOpacity: 0.95,
        })
          .addTo(leafletMap)
          .bindPopup("Tu ubicación");
      }

      if (userAccuracy) {
        userAccuracy.setLatLng([lat, lng]);
        userAccuracy.setRadius(accuracy || 40);
      } else {
        userAccuracy = window.L.circle([lat, lng], {
          radius: accuracy || 40,
          color: "#00bcd4",
          weight: 1,
          fillColor: "#00d4ee",
          fillOpacity: 0.12,
        }).addTo(leafletMap);
      }
    }

    renderStoreList(carrier.stores);
    updateNavPanel(carrier.stores[0]);
    waitForLeaflet(initLeaflet, 40);

    storesEl?.addEventListener("click", (event) => {
      const focusBtn = event.target.closest("[data-store-focus]");
      if (!focusBtn) return;
      const store = carrier.stores.find((s) => s.id === focusBtn.dataset.storeFocus);
      focusStore(store, { zoom: 16 });
    });

    storesEl?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const focusBtn = event.target.closest("[data-store-focus]");
      if (!focusBtn) return;
      event.preventDefault();
      const store = carrier.stores.find((s) => s.id === focusBtn.dataset.storeFocus);
      focusStore(store, { zoom: 16 });
    });

    zoomInBtn?.addEventListener("click", () => {
      if (leafletMap) leafletMap.zoomIn();
    });
    zoomOutBtn?.addEventListener("click", () => {
      if (leafletMap) leafletMap.zoomOut();
    });
    fitAllBtn?.addEventListener("click", () => fitAllStores());

    navGoEl?.addEventListener("click", (event) => {
      const store = activeStore();
      if (!store) return;
      /* Si aún no hay GPS, pedirlo y luego abrir ruta */
      if (userOrigin) {
        navGoEl.href = mapsDirectionsUrl(store, userOrigin);
        return;
      }
      if (!navigator.geolocation) return;
      event.preventDefault();
      setStatus("Activando GPS para llevarte a la sucursal...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          showUserOnMap(latitude, longitude, accuracy);
          const url = mapsDirectionsUrl(store, { lat: latitude, lng: longitude });
          window.open(url, "_blank", "noopener,noreferrer");
          setStatus(`Ruta GPS hacia ${store.name}.`);
        },
        () => {
          const url = mapsDirectionsUrl(store, null);
          window.open(url, "_blank", "noopener,noreferrer");
          setStatus("Abrimos la ruta. Activa GPS en tu teléfono para mejor guía.");
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
      );
    });

    formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      const q = queryEl.value.trim().toLowerCase();
      const matches = carrier.stores.filter((s) =>
        `${s.name} ${s.city} ${s.address}`.toLowerCase().includes(q)
      );
      if (!q) {
        renderStoreList(carrier.stores);
        fitAllStores();
        return;
      }
      if (!matches.length) {
        renderStoreList([]);
        setStatus("No hay sucursales YAAVS con ese criterio. Prueba Coacalco, Puebla o Xalapa.");
        return;
      }
      renderStoreList(matches);
      focusStore(matches[0], { zoom: 15 });
      if (leafletMap && matches.length > 1) {
        leafletMap.fitBounds(
          matches.map((s) => [s.lat, s.lng]),
          { padding: [48, 48], maxZoom: 11 }
        );
      }
    });

    geolocateBtn?.addEventListener("click", () => {
      if (!navigator.geolocation) {
        setStatus("Tu navegador no permite geolocalización.");
        return;
      }
      geolocateBtn.disabled = true;
      setStatus("Obteniendo tu GPS...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          showUserOnMap(latitude, longitude, accuracy);
          const nearest = carrier.stores
            .map((s) => ({
              store: s,
              dist: Math.hypot(s.lat - latitude, s.lng - longitude),
            }))
            .sort((a, b) => a.dist - b.dist)[0].store;

          if (leafletMap) {
            leafletMap.setView([latitude, longitude], 12, { animate: true });
          }
          focusStore(nearest, { zoom: 13 });
          setStatus(`GPS listo. Sucursal más cercana: ${nearest.name}. Toca Ir allá.`);
          geolocateBtn.disabled = false;
        },
        () => {
          setStatus("No pudimos detectar tu GPS. Elige una sucursal y toca Ir allá.");
          geolocateBtn.disabled = false;
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
      );
    });

    if (queryEl) queryEl.placeholder = "Ej. Coacalco, Puebla o Xalapa";
    setStatus("Haz zoom, elige un pin o toca Ir allá para GPS.");
    return;
  }

  /* ─── AT&T u otros: búsqueda abierta ─── */
  if (!frameEl) return;
  if (mapHostEl) mapHostEl.hidden = true;
  if (storesEl) storesEl.hidden = true;
  if (navPanelEl) navPanelEl.hidden = true;
  document.querySelector(".tiendas-map__map-tools")?.setAttribute("hidden", "");
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
    updateMap(`${carrier.name} tiendas ${raw}`);
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
        updateMap(
          `${carrier.name} tiendas cerca de ${latitude}, ${longitude}`,
          `Ubicación detectada. Mostrando tiendas ${carrier.name} cercanas.`
        );
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
