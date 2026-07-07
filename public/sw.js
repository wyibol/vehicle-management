const CACHE_NAME = "vehicle-management-v4";
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
  // These should go directly to the network without SW intervention
  if (isCrossOrigin(event.request.url)) {
    return;
  }

  // For same-origin navigation requests, use cache-first strategy
  // For other same-origin requests, use network-first
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        // Only cache successful HTML page navigations
        if (!response || response.status !== 200) {
          return response;
        }
        if (response.headers.get("content-type")?.includes("text/html")) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
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
