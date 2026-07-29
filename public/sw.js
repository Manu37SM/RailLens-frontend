// Minimal service worker: exists mainly to satisfy PWA installability
// criteria and give a graceful offline fallback for pages already visited.
// Deliberately NOT trying to cache API responses (train/station/journey
// data changes and must stay live) - this only caches the static app
// shell (the pages/assets Next.js already serves) on a network-first
// basis, falling back to cache when there's no connection.
const CACHE_NAME = 'raillens-shell-v1';
const APP_SHELL = ['/', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {
      // Best-effort - a failed precache (e.g. offline install) shouldn't
      // block activation.
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GET navigations/static assets - API calls to
  // the Spring Boot backend (a different origin in production) and any
  // non-GET request pass straight through untouched.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  );
});
