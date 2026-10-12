/* Gym Progress Tracker service worker: offline-first app shell. */
const CACHE_VERSION = 'gym-pwa-v2';
const APP_SHELL = [
  './',
  './index.html',
  './workout-plan.html',
  './workout-log.html',
  './exercises.html',
  './calendar.html',
  './progress.html',
  './reports.html',
  './profile.html',
  './offline.html',
  './manifest.json',
  './css/style.css',
  './css/responsive.css',
  './css/premium.css',
  './css/premium2.css',
  './css/premium3.css',
  './js/storage.js',
  './js/data.js',
  './js/app.js',
  './js/dashboard.js',
  './js/workout-plan.js',
  './js/workout-log.js',
  './js/exercises.js',
  './js/calendar.js',
  './js/progress.js',
  './js/reports.js',
  './js/profile.js',
  './js/pwa.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Only handle same-origin requests; let CDNs fall through to network.
  if (url.origin !== self.location.origin) return;
  // HTML navigations: network first, fall back to cache, then offline page.
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match('./offline.html')))
    );
    return;
  }
  // Static assets: cache first, update in background.
  event.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
