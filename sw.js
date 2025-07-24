const CACHE_NAME = 'umak-schedule-cache-v8'; // *** IMPORTANT: Increment the version number again to force update! ***
const urlsToCache = [
    // Explicitly include the repository subpath for all assets.
    '/BSA-Freshmen-Sched/', // The root of your application on GitHub Pages
    '/BSA-Freshmen-Sched/index.html',
    '/BSA-Freshmen-Sched/sw.js',
    '/BSA-Freshmen-Sched/manifest.json', // Ensure this file exists in your repo root
    '/BSA-Freshmen-Sched/icon.png', // Your app's icon
    '/BSA-Freshmen-Sched/umak-logo-top.png', // Your top logo image
    '/BSA-Freshmen-Sched/umak-logo-bottom.png', // Your bottom logo image
    '/BSA-Freshmen-Sched/site_background.png', // Your site background image (confirmed as .png)
    // Add any other specific asset URLs here if you add more files
    // (e.g., external fonts, separate CSS files, other images).
    // Make sure every file your app needs to run offline is listed with its full relative path.
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
                // Log the specific error and re-throw to prevent activation of a broken SW
                console.error('[Service Worker] Failed to cache during install:', error);
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
                    console.error('[Service Worker] Fetch failed, network unavailable for:', event.request.url);
                    // If the primary request fails offline, you could serve a custom offline page
                    // return caches.match('/BSA-Freshmen-Sched/offline.html'); // Example: requires an offline.html to be cached
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