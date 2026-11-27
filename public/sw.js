// PERSIB TRACKER - PWA Service Worker v104 (Zero Stutter & Smooth Navigation)
const CACHE_NAME = 'persib-tracker-pwa-v104';
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-apple.png',
  '/new_persib_logo.jpeg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Completely bypass Service Worker for video streams, byte-range requests, and Next.js RSC router chunks
  if (
    event.request.url.includes('.mp4') ||
    event.request.headers.get('range') ||
    event.request.headers.get('RSC') ||
    event.request.headers.get('Next-Router-State-Tree') ||
    event.request.headers.get('Next-Router-Prefetch') ||
    event.request.url.includes('_next/')
  ) {
    return;
  }

  // Network-First Strategy for HTML document navigation
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Stale-While-Revalidate for lightweight static images & assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (
          response.status === 200 &&
          (event.request.url.includes('.png') ||
            event.request.url.includes('.jpg') ||
            event.request.url.includes('.jpeg') ||
            event.request.url.includes('.svg') ||
            event.request.url.includes('.json'))
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('/'));
    })
  );
});
