const CACHE_NAME = "ai-stream-cache-v1";

const urlsToCache = [
  "index.html",
  "categories.html",
  "category.html",
  "trending.html",
  "watch-later.html",
  "watch.html",

  "app.js",
  "videos.json",

  "manifest.json",

  "img/icon-192.png",
  "img/icon-512.png"
];

// تثبيت الـ Service Worker وتخزين الملفات
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// جلب الملفات من الكاش أو من الإنترنت
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// تحديث الكاش عند تغيير الإصدار
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

