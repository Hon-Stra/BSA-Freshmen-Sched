const CACHE_NAME = 'umak-schedule-cache-v5'; // <--- IMPORTANT: Increment the version number!
const urlsToCache = [
    '/', // Caches the root URL (your index.html)
    'index.html',
    'sw.js',
    'manifest.json',
    'icon.png', // <--- Verify this file exists and is named exactly 'icon.png'
    'umak-logo-top.png', // <--- Your top logo image
    'umak-logo-bottom.png', // <--- Your bottom logo image
    'site_background.webp'
    // Add any other specific asset paths here if you add more files (e.g., external fonts, separate CSS files if you move them out of index.html)
];

// Install event: Fires when the Service Worker is first installed. Caches all listed assets.
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install Event: Caching assets...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Cache opened:', CACHE_NAME);
                return cache.addAll(urlsToCache); // Attempt to cache all specified URLs
            })
            .catch((error) => {
                // This will now log the specific error that 'addAll' encountered
                console.error('[Service Worker] Failed to cache during install:', error);
                // You might want to throw the error to prevent activation if caching fails badly
                throw error;
            })
    );
});

// Fetch event: Intercepts network requests. Serves from cache if available, otherwise from network.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return the cached response
                if (response) {
                    console.log('[Service Worker] Serving from cache:', event.request.url);
                    return response;
                }
                // No cache hit - try fetching from the network
                console.log('[Service Worker] Fetching from network:', event.request.url);
                return fetch(event.request).catch(() => {
                    // This catch block handles network failures (e.g., truly offline)
                    // If the main page isn't in cache, and offline, this will lead to the browser's default offline page.
                    // You can serve a custom offline page here if desired.
                    // For example, return caches.match('/offline.html'); if you have one.
                    console.error('[Service Worker] Fetch failed, network unavailable for:', event.request.url);
                });
            })
    );
});

// Activate event: Cleans up old caches to save space and prevent stale content.
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
