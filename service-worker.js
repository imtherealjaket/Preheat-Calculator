const CACHE_NAME =
  "preheat-calculator-v7-percent-blank";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        const responseCopy =
          networkResponse.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(
            event.request,
            responseCopy
          );
        });

        return networkResponse;
      })
      .catch(() => {
        return caches
          .match(event.request)
          .then(cachedResponse => {
            return (
              cachedResponse ||
              caches.match("./index.html")
            );
          });
      })
  );
});
