/* YAAVS PWA service worker — cache + notificaciones */
try {
  importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
} catch (_) {
  /* OneSignal opcional hasta configurar App ID */
}

const CACHE_VERSION = "yaavs-pwa-v3";
const PRECACHE = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./assets/pwa/icon-192.png",
  "./assets/pwa/icon-512.png",
  "./assets/yaavs-logo-on-light.png",
  "./assets/favicon-yaavs.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
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

  /* Navigations: network first, fallback offline shell */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match("./offline.html") || caches.match("./index.html");
        })
    );
    return;
  }

  /* Alerts feed: always network (no stale badges) */
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
        .catch(() => caches.match(request))
    );
    return;
  }

  /* Static assets: cache first, then network */
  if (
    url.pathname.match(/\.(css|js|png|jpg|jpeg|webp|svg|woff2?|webmanifest)$/i) ||
    url.pathname.includes("/assets/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
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
  const raw = (event.notification && event.notification.data && event.notification.data.url) || "./index.html";
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

/* Fallback push (OneSignal SDK también maneja push vía importScripts) */
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = {};
  try {
    payload = event.data.json();
  } catch (_) {
    payload = { title: "YAAVS", body: event.data.text() };
  }

  /* Si OneSignal ya procesó el evento, no duplicar */
  if (payload.custom || payload.onesignal || payload.os_data) return;

  const title = payload.title || "YAAVS";
  const options = {
    body: payload.body || payload.message || "",
    icon: payload.icon || "./assets/pwa/icon-192.png",
    badge: payload.badge || "./assets/pwa/icon-192.png",
    tag: payload.tag || "yaavs-push",
    data: { url: payload.url || payload.launchURL || "./index.html" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
