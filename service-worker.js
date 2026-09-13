const CACHE_NAME = "ai-learning-stream-v3";
const ASSETS = [
  "/myweb/",
  "/myweb/index.html",
  "/myweb/about.html",
  "/myweb/categories.html",
  "/myweb/category.html",
  "/myweb/trending.html",
  "/myweb/watch.html",
  "/myweb/watch-later.html",
  "/myweb/contact.html",
  "/myweb/app.js",
  "/myweb/manifest.json",
  "/myweb/videos.json"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});

