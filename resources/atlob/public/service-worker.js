// public/service-worker.js
const CACHE_NAME = 'atlob-v3'; // ✅ غيرنا الرقم عشان يفرض التحديث

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/favicon.ico',
        '/favicon-96x96.png',
        '/web-app-manifest-192x192.png',
        '/web-app-manifest-512x512.png',
        '/apple-touch-icon.png',
        '/site.webmanifest'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});