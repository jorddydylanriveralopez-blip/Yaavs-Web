/**
 * Tiendas en la página pospago: sucursales AT&T integradas.
 */
(function () {
  const root = document.querySelector("[data-pospago-stores]");
  if (!root) return;

  const carriers = {
    att: {
      id: "att",
      name: "AT&T",
      title: "Sucursales AT&T",
    },
  };

  const DEFAULT_PDV_IMAGE = "assets/rotulaciones/dili-01.jpg";
  const stage = root.querySelector("[data-store-stage]");
  const listEl = root.querySelector("[data-store-list]");
  const mapHost = root.querySelector("[data-store-map]");
  const queryEl = root.querySelector("[data-store-q]");
  const statusEl = root.querySelector("[data-store-status]");
  const titleEl = root.querySelector("[data-store-title]");
  const countEl = root.querySelector("[data-store-count]");
  let map = null;
  let markers = [];
  let activeId = "";
  let carrierId = "";
  let activePopup = null;
  let mapReady = false;

  function storesFor() {
    return window.YAAVS_ATT_STORES || [];
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text || "";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function mapsSearchUrl(store) {
    if (store.mapsLink) return store.mapsLink;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address || `${store.lat},${store.lng}`)}`;
  }

  function mapsDirUrl(store) {
    return `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}&travelmode=driving`;
  }

  function storeThumbSrc(store) {
    return store.image || store.photo || DEFAULT_PDV_IMAGE;
  }

  function storeThumbHtml(store) {
    const name = escapeHtml(store.name);
    const src = escapeHtml(storeThumbSrc(store));
    return `<div class="pospago-stores__map-pop"><img src="${src}" alt="Punto de venta ${name}" width="132" height="84" loading="lazy" decoding="async"><span>${name}</span></div>`;
  }

  function showMapPopup(store) {
    if (!map || !store || typeof window.L === "undefined") return;

    if (activePopup) {
      map.closePopup(activePopup);
      activePopup = null;
    }

    activePopup = window.L.popup({
      className: "pospago-stores__leaflet-pop",
      offset: [22, -12],
      closeButton: true,
      maxWidth: 152,
      minWidth: 132,
      autoPan: true,
      autoPanPadding: [28, 28],
    })
      .setLatLng([store.lat, store.lng])
      .setContent(storeThumbHtml(store))
      .openOn(map);
  }

  function filteredStores() {
    const all = storesFor();
    const q = (queryEl?.value || "").trim().toLowerCase();
    if (!q) return all;
    return all.filter((s) => `${s.name} ${s.city} ${s.address}`.toLowerCase().includes(q));
  }

  function renderList() {
    const list = filteredStores();
    if (countEl) countEl.textContent = `${list.length} sucursal${list.length === 1 ? "" : "es"}`;
    if (!listEl) return;
    if (!list.length) {
      listEl.innerHTML = `<p class="pospago-stores__empty">No hay sucursales con esa búsqueda.</p>`;
      return;
    }
    listEl.innerHTML = list
      .map((store, i) => {
        const on = store.id === activeId ? " is-active" : "";
        return `<article class="pospago-stores__card${on}" data-store-id="${store.id}" style="--i:${i}">
          <button type="button" class="pospago-stores__card-main" data-store-focus="${store.id}">
            <span class="pospago-stores__card-name">${store.name}</span>
            <span class="pospago-stores__card-city">${store.city}</span>
            <span class="pospago-stores__card-address">${store.address}</span>
            ${store.hours ? `<span class="pospago-stores__card-hours">${store.hours}</span>` : ""}
          </button>
          <div class="pospago-stores__card-actions">
            <a href="${mapsSearchUrl(store)}" target="_blank" rel="noopener noreferrer">Ver en Maps</a>
            <a href="${mapsDirUrl(store)}" target="_blank" rel="noopener noreferrer">Cómo llegar</a>
          </div>
        </article>`;
      })
      .join("");
  }

  function markerIcon(active) {
    return window.L.divIcon({
      className: "pospago-stores__pin" + (active ? " is-active" : ""),
      html: `<span style="background:#d96df2"></span>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  }

  function refreshMapSize() {
    if (!map) return;
    map.invalidateSize({ pan: false });
    const list = filteredStores();
    if (!list.length) return;
    const bounds = list.map((store) => [store.lat, store.lng]);
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 12 });
  }

  function focusStore(store, pan) {
    if (!store) return;
    activeId = store.id;
    renderList();
    markers.forEach((item) => {
      item.marker.setIcon(markerIcon(item.store.id === store.id));
    });
    if (pan !== false && map) {
      map.setView([store.lat, store.lng], Math.max(map.getZoom(), 14), { animate: true });
    }
    setStatus(`${store.name} · ${store.city}`);
    window.setTimeout(() => showMapPopup(store), 80);
  }

  function drawMap() {
    if (!mapHost || typeof window.L === "undefined") {
      setStatus("Cargando mapa…");
      return;
    }

    const list = filteredStores();
    if (!list.length) {
      setStatus("No se encontraron sucursales AT&T.");
      return;
    }

    if (!map) {
      map = window.L.map(mapHost, { scrollWheelZoom: false, zoomControl: true });
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      mapReady = true;
    }

    if (activePopup) {
      map.closePopup(activePopup);
      activePopup = null;
    }

    markers.forEach((item) => map.removeLayer(item.marker));
    markers = [];

    list.forEach((store) => {
      const marker = window.L.marker([store.lat, store.lng], { icon: markerIcon(store.id === activeId) })
        .addTo(map)
        .on("click", () => focusStore(store));
      markers.push({ store, marker });
    });

    refreshMapSize();

    const active = list.find((store) => store.id === activeId) || list[0];
    if (active) {
      activeId = active.id;
      renderList();
      window.setTimeout(() => {
        refreshMapSize();
        showMapPopup(active);
      }, 160);
    }
  }

  function openCarrier(id, { scroll } = { scroll: false }) {
    const carrier = carriers[id];
    if (!carrier) return;
    carrierId = id;
    const list = storesFor();
    activeId = list[0]?.id || "";
    root.dataset.carrier = id;
    root.classList.add("is-open");
    if (stage) {
      stage.hidden = false;
      stage.classList.add("is-revealed");
    }
    if (titleEl) titleEl.textContent = carrier.title;
    renderList();

    if (!list.length) {
      setStatus("No se pudieron cargar las sucursales. Recarga la página.");
      return;
    }

    whenReady(() => {
      drawMap();
      window.setTimeout(refreshMapSize, 120);
      window.setTimeout(refreshMapSize, 480);
      window.setTimeout(refreshMapSize, 1200);
    });

    if (scroll) root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function whenReady(cb) {
    let waits = 0;
    const t = window.setInterval(() => {
      waits += 1;
      const hasLeaflet = typeof window.L !== "undefined";
      const hasStores = storesFor().length > 0;
      if (hasLeaflet && hasStores) {
        window.clearInterval(t);
        cb();
      } else if (waits > 100) {
        window.clearInterval(t);
        if (!hasStores) setStatus("No se pudieron cargar las sucursales. Recarga la página.");
        else setStatus("No se pudo cargar el mapa. Recarga la página.");
      }
    }, 80);
  }

  queryEl?.addEventListener("input", () => {
    const list = filteredStores();
    activeId = list[0]?.id || "";
    renderList();
    if (mapReady) drawMap();
  });

  root.querySelector("[data-store-geo]")?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      setStatus("Tu navegador no permite ubicación.");
      return;
    }
    setStatus("Obteniendo tu ubicación…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const list = storesFor();
        let best = list[0];
        let bestD = Infinity;
        list.forEach((store) => {
          const d =
            (store.lat - latitude) * (store.lat - latitude) +
            (store.lng - longitude) * (store.lng - longitude);
          if (d < bestD) {
            bestD = d;
            best = store;
          }
        });
        if (best) focusStore(best, true);
        setStatus("Mostramos la sucursal más cercana a ti.");
      },
      () => setStatus("No pudimos detectar tu ubicación. Busca por ciudad."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  listEl?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-store-focus]");
    if (!btn) return;
    const store = storesFor().find((s) => s.id === btn.getAttribute("data-store-focus"));
    if (store) focusStore(store, true);
  });

  if (typeof ResizeObserver !== "undefined" && mapHost) {
    const ro = new ResizeObserver(() => {
      if (mapReady) refreshMapSize();
    });
    ro.observe(mapHost);
  }

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || !mapReady) return;
          refreshMapSize();
        });
      },
      { threshold: 0.2 }
    );
    io.observe(root);
  }

  window.addEventListener("load", () => {
    if (mapReady) refreshMapSize();
    else openCarrier("att");
  });

  openCarrier("att");
})();
