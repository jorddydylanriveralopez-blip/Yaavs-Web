/* OneSignal v16 Service Worker + YAAVS PWA cache */
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE_VERSION = "yaavs-pwa-v7";
const PRECACHE = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./assets/pwa/icon-192.png",
  "./assets/pwa/icon-512.png",
  "./assets/yaavs-logo-header-color.png?v=1",
  "./assets/yaavs-logo-white.png?v=2",
  "./assets/favicon-yaavs.png",
  "./styles.css?v=266",
  "./yaavs-brand.css?v=22",
  "./js/layout.js?v=74",
  "./js/pwa.js?v=7",
  /* Shell partials — menu/footer must work offline */
  "./partials/header.html?v=35",
  "./partials/footer.html?v=18",
  "./partials/trust-strip.html",
  "./partials/page-cta.html?v=5",
  "./partials/social-float.html",
  "./partials/whatsapp-float.html?v=1",
  /* Main nav destinations */
  "./quienes-somos.html",
  "./tiendas.html",
  "./bolsa-trabajo.html",
  "./avisos.html",
  "./contacto.html",
];

function precacheAll(cache) {
  return Promise.all(
    PRECACHE.map((url) =>
      cache.add(url).catch(() => {
        /* skip missing / opaque failures so install still succeeds */
      })
    )
  );
}

function matchCached(request) {
  return caches.match(request).then((hit) => {
    if (hit) return hit;
    return caches.match(request, { ignoreSearch: true });
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => precacheAll(cache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await matchCached(request);
          return cached || caches.match("./offline.html") || caches.match("./index.html");
        })
    );
    return;
  }

  if (url.pathname.includes("/data/yaavs-alerts.json")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => matchCached(request))
    );
    return;
  }

  /* Header/menu + other layout partials — network first (avoid stale white logo) */
  if (url.pathname.includes("/partials/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => matchCached(request))
    );
    return;
  }

  if (
    url.pathname.match(/\.(css|js|png|jpg|jpeg|webp|svg|woff2?|webmanifest|html)$/i) ||
    url.pathname.includes("/assets/")
  ) {
    /* Logos: always prefer network so white/blue never get stuck in cache */
    if (/yaavs-logo/i.test(url.pathname)) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => matchCached(request))
      );
      return;
    }

    event.respondWith(
      matchCached(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw =
    (event.notification && event.notification.data && event.notification.data.url) || "./index.html";
  const target = new URL(raw, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const all = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of all) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(target);
            } catch (_) {
              /* noop */
            }
          }
          return;
        }
      }
      if (clients.openWindow) {
        await clients.openWindow(target);
      }
    })()
  );
});
