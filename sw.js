// Offline support for Calendar.
// App files are served from the cache first and refreshed in the background.
// Bump VERSION whenever you change index.html so phones pick up the new copy.
const VERSION = "v2";
const APP_CACHE = "calendar-app-" + VERSION;
const FONT_CACHE = "calendar-fonts";
const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(APP_CACHE).then((c) => c.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("calendar-app-") && k !== APP_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function staleWhileRevalidate(cacheName, request, fallbackUrl) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request, { ignoreSearch: true }).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone());
          return res;
        })
        .catch(() => cached || (fallbackUrl ? cache.match(fallbackUrl) : undefined));
      return cached || network;
    })
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Google Fonts: keep a copy so the typefaces work offline after the first visit.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(staleWhileRevalidate(FONT_CACHE, req));
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Opening the app (any hash) always gets the cached page, even offline.
  if (req.mode === "navigate") {
    event.respondWith(staleWhileRevalidate(APP_CACHE, new Request("./index.html"), "./index.html"));
    return;
  }
  event.respondWith(staleWhileRevalidate(APP_CACHE, req));
});
