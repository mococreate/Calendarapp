// Offline support for Calendar.
// When online, opening the app always loads the newest index.html from the server.
// When offline, it falls back to the copy saved on the device.
// Bump VERSION whenever you change files so the saved copies are refreshed too.
const VERSION = "v3";
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

function networkFirstPage() {
  const page = new Request("./index.html", { cache: "no-cache" });
  return caches.open(APP_CACHE).then((cache) => {
    const fromNet = fetch(page).then((res) => {
      if (res && res.ok) cache.put("./index.html", res.clone());
      return res;
    });
    const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
    return Promise.race([fromNet, timeout.then(() => cache.match("./index.html"))])
      .then((res) => res || fromNet)
      .catch(() => cache.match("./index.html"));
  });
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

  // Opening the app: newest page when online (3 s limit), saved copy when offline.
  if (req.mode === "navigate") {
    event.respondWith(networkFirstPage());
    return;
  }
  event.respondWith(staleWhileRevalidate(APP_CACHE, req));
});
