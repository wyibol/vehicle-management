const CACHE_NAME = "vehicle-management-v5";
const PRECACHE_URLS = [
  "/",
  "/vehicles/new",
];

// Helper: check if a request is cross-origin
function isCrossOrigin(url) {
  try {
    return new URL(url).origin !== self.location.origin;
  } catch {
    return true; // invalid URLs are treated as cross-origin
  }
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests (Cache API only supports GET)
  if (event.request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests (OSS images, third-party resources)
  if (isCrossOrigin(event.request.url)) {
    return;
  }

  // Network-first strategy: always try server first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails (offline), try cache
        return caches.match(event.request);
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((name) => {
        if (name !== CACHE_NAME) return caches.delete(name);
      }))
    ).then(() => clients.claim())
  );
});
