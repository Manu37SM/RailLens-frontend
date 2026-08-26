const CACHE_NAME = 'raillens-shell-v1';
const APP_SHELL = ['/', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {
    }));
    self.skipWaiting();
});
self.addEventListener('activate', (event) => {
    event.waitUntil(caches
        .keys()
        .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
        .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
        return;
    }
    event.respondWith(fetch(request)
        .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
    })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/'))));
});
