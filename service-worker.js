// weGogym service worker: offline-capable app shell.
// Strategy:
//  - Navigations: network first, fall back to the cached shell when offline.
//  - Other GETs (same-origin files and CDN scripts/styles/fonts): stale-while-revalidate.
//    Opaque cross-origin responses (no-cors CDN scripts) are cached too, since they cannot be inspected.
const CACHE_NAME = 'wegogym-shell-v9';

// Relative to this file so the app works from any sub-path.
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './styles.tailwind.css',
  './app.js',
  './nutrition.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(SHELL.map(url => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const network = fetch(request)
      .then(response => {
        // Only cache successful or opaque responses; never cache errors.
        if (response && (response.ok || response.type === 'opaque')) {
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      })
      .catch(() => null);

    if (request.mode === 'navigate') {
      const fresh = await network;
      if (fresh) return fresh;
      // Offline: serve the cached shell, never a generic browser error page.
      return (await cache.match(request)) || (await cache.match('./index.html')) || Response.error();
    }

    if (cached) {
      event.waitUntil(network);   // refresh in the background
      return cached;
    }
    const fresh = await network;
    return fresh || Response.error();
  })());
});