// Minimal, deliberately conservative service worker.
//
// This app is an authenticated, live dashboard (session cookies, real-time
// monitoring, file listings) — aggressively caching pages or API responses
// would risk showing stale/wrong data to the wrong user. So this SW only:
//   1. Precaches a handful of static, unauthenticated assets (icons, the
//      offline fallback page) so installability/offline-fallback works.
//   2. Always goes to the network first for everything else, and only falls
//      back to a cached copy (or the offline page for navigations) when the
//      network request fails outright — it never serves stale data over a
//      working connection.
const CACHE_NAME = "homeportal-static-v1";
const PRECACHE_URLS = ["/offline.html", "/icons/icon-192.png", "/icons/icon-512.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // never intercept API calls

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && PRECACHE_URLS.includes(url.pathname)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          return caches.match("/offline.html");
        }
        return Response.error();
      })
  );
});
