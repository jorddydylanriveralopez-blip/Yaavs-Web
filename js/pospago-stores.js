/**
 * Tiendas en la página pospago: elige compañía y ve sucursales sin salir.
 */
(function () {
  const root = document.querySelector("[data-pospago-stores]");
  if (!root) return;

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
    att: {
      id: "att",
      name: "AT&T",
      title: "Sucursales AT&T",
    },
    bait: {
      id: "bait",
      name: "BAIT",
      title: "Sucursales BAIT",
    },
  };

  const picks = root.querySelector("[data-store-picks]");
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

  function storesFor(id) {
    if (id === "att") return window.YAAVS_ATT_STORES || [];
    return baitStores;
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text || "";
  }

  function mapsSearchUrl(store) {
    if (store.mapsLink) return store.mapsLink;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address || `${store.lat},${store.lng}`)}`;
  }

  function mapsDirUrl(store) {
    return `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}&travelmode=driving`;
  }

  function filteredStores() {
    const all = storesFor(carrierId);
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
    const color = carrierId === "att" ? "#d96df2" : "#ffcb05";
    return window.L.divIcon({
      className: "pospago-stores__pin" + (active ? " is-active" : ""),
      html: `<span style="background:${color}"></span>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
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
  }

  function drawMap() {
    if (!mapHost || typeof window.L === "undefined") {
      setStatus("Cargando mapa…");
      return;
    }
    const list = filteredStores();
    if (!map) {
      map = window.L.map(mapHost, { scrollWheelZoom: false, zoomControl: true });
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
    }
    markers.forEach((item) => map.removeLayer(item.marker));
    markers = [];
    const bounds = [];
    list.forEach((store) => {
      const marker = window.L.marker([store.lat, store.lng], { icon: markerIcon(store.id === activeId) })
        .addTo(map)
        .on("click", () => focusStore(store));
      markers.push({ store, marker });
      bounds.push([store.lat, store.lng]);
    });
    if (bounds.length) {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 12 });
      window.setTimeout(() => map.invalidateSize(), 80);
    }
  }

  function openCarrier(id) {
    const carrier = carriers[id];
    if (!carrier) return;
    carrierId = id;
    const list = storesFor(id);
    activeId = list[0]?.id || "";
    root.dataset.carrier = id;
    root.classList.remove("is-opening");
    root.classList.add("is-open");
    if (picks) picks.hidden = true;
    if (stage) {
      stage.hidden = false;
      stage.classList.remove("is-revealed");
      void stage.offsetWidth;
      stage.classList.add("is-revealed");
    }
    if (titleEl) titleEl.textContent = carrier.title;
    renderList();
    whenLeaflet(() => {
      drawMap();
      const first = list[0];
      if (first) focusStore(first, false);
      window.setTimeout(() => map?.invalidateSize(), 120);
      window.setTimeout(() => map?.invalidateSize(), 480);
    });
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeCarrier() {
    carrierId = "";
    root.removeAttribute("data-carrier");
    root.classList.remove("is-open", "is-opening");
    if (picks) picks.hidden = false;
    if (stage) {
      stage.hidden = true;
      stage.classList.remove("is-revealed");
    }
    setStatus("");
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function whenLeaflet(cb) {
    if (window.L) {
      cb();
      return;
    }
    let n = 0;
    const t = window.setInterval(() => {
      n += 1;
      if (window.L) {
        window.clearInterval(t);
        cb();
      } else if (n > 80) {
        window.clearInterval(t);
        setStatus("No se pudo cargar el mapa. Recarga la página.");
      }
    }, 80);
  }

  root.querySelectorAll("[data-store-carrier]").forEach((btn) => {
    btn.addEventListener("click", () => openCarrier(btn.getAttribute("data-store-carrier")));
  });

  root.querySelector("[data-store-back]")?.addEventListener("click", closeCarrier);

  queryEl?.addEventListener("input", () => {
    const list = filteredStores();
    activeId = list[0]?.id || "";
    renderList();
    drawMap();
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
        const list = storesFor(carrierId);
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
    const store = storesFor(carrierId).find((s) => s.id === btn.getAttribute("data-store-focus"));
    if (store) focusStore(store, true);
  });

  if (location.hash === "#conoce-tiendas") {
    window.setTimeout(() => root.scrollIntoView({ behavior: "smooth", block: "start" }), 180);
  }
})();
