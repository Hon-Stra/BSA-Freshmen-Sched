const CACHE_NAME = 'umak-schedule-cache-v7'; // *** IMPORTANT: Increment the version number again! ***
const urlsToCache = [
    // Use the explicit root path if '/' gives a 404, or try just '/'
    // If your index.html is directly at the root of the GitHub Pages subpath, '/' should work.
    // If not, explicitly list the full path including your repo name like '/BSA-Freshmen-Sched/index.html'
    // Let's assume '/' works for the main index.html file.
    '/', // Caches the root URL, which serves index.html
    'index.html',
    'sw.js',
    'manifest.json', // Ensure this file exists in your root directory
    'icon.png', // Ensure this file exists and is named exactly 'icon.png'
    'umak-logo-top.png', // Your top logo image
    'umak-logo-bottom.png', // Your bottom logo image
    'site_background.png', // <--- *** CORRECTED: Changed from .webp to .png ***
    // Add any other specific asset URLs here if you add more files (e.g., external fonts, separate CSS files later).
    // Make sure every file your app needs to run offline is listed.
];

// Install event: Fires when the Service Worker is first installed. Caches all listed assets.
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install Event: Caching assets...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Cache opened:', CACHE_NAME);
                // The Promise.all with individual fetches below is a more robust way
                // to identify *which* file is failing, as addAll is "all or nothing."
                // For now, let's stick to addAll as the primary fix is the filename.
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('[Service Worker] Failed to cache during install:', error);
                // Throwing the error prevents the SW from activating if caching fails,
                // which prevents a broken offline experience.
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