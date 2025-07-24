const CACHE_NAME = 'umak-schedule-cache-v10'; // *** IMPORTANT: Increment the version number again! ***
const urlsToCache = [
    // Ensure all paths are relative to the Service Worker's scope, which is /BSA-Freshmen-Sched/
    '/BSA-Freshmen-Sched/', // The root of your application
    '/BSA-Freshmen-Sched/index.html',
    '/BSA-Freshmen-Sched/sw.js',
    '/BSA-Freshmen-Sched/manifest.json',
    '/BSA-Freshmen-Sched/icon.png',
    '/BSA-Freshmen-Sched/umak-logo-top.png', //
    '/BSA-Freshmen-Sched/umak-logo-bottom.png', //
    '/BSA-Freshmen-Sched/site_background.png', //
    // Add any external fonts if you are using them (e.g., from Google Fonts)
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap', // Add external fonts if used
];

// Install event: Caches all listed assets.
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install Event: Caching assets...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Cache opened:', CACHE_NAME);
                // Attempt to cache all specified URLs. Catch any single failure.
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('[Service Worker] Failed to cache during install:', error);
                throw error; // Re-throw to prevent activation of a broken SW
            })
    );
});

// Fetch event: Intercepts network requests.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    console.log('[Service Worker] Serving from cache:', event.request.url);
                    return response; // Serve from cache if found
                }
                console.log('[Service Worker] Fetching from network:', event.request.url);
                return fetch(event.request).catch(() => {
                    // This block executes if both cache and network fail (i.e., truly offline)
                    console.error('[Service Worker] Fetch failed, network unavailable for:', event.request.url);
                    // If the request is for a navigation (like the main page), you could serve a custom offline page
                    if (event.request.mode === 'navigate') {
                        // You would need to add '/BSA-Freshmen-Sched/offline.html' to urlsToCache
                        // return caches.match('/BSA-Freshmen-Sched/offline.html');
                    }
                    // Otherwise, the browser will display its default offline page (what you're seeing now).
                });
            })
    );
});

// Activate event: Cleans up old caches.
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate Event: Cleaning old caches...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});