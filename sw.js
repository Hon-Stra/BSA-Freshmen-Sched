const CACHE_NAME = 'chedule-cache-v2'; // Still increment this!
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'icon.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forces the new service worker to activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache during install');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Takes control of any clients not yet controlled by this service worker
    })
  );
});