// HTML AI Studio Pro - Service Worker
// Cache-first strategy for offline support

const CACHE_NAME = 'html-ai-studio-pro-v1';
const STATIC_CACHE = 'static-v1';

// Core assets to cache on install
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// External resources to cache on first fetch
const CACHE_PATTERNS = [
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  /cdnjs\.cloudflare\.com/
];

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== STATIC_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET & chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // Skip API calls (Anthropic, Firebase, GitHub, etc.)
  const apiPatterns = [
    'api.anthropic.com',
    'firebaseio.com',
    'googleapis.com/firebase',
    'api.github.com',
    'generativelanguage.googleapis.com',
    'api.openai.com',
    'api.groq.com',
    'openrouter.ai'
  ];
  if (apiPatterns.some(p => url.hostname.includes(p))) return;

  // Cache-first for same-origin & known static CDNs
  const isStatic =
    url.origin === self.location.origin ||
    CACHE_PATTERNS.some(p => p.test(request.url));

  if (isStatic) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        }).catch(() => {
          // Offline fallback for navigation
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
    );
  }
});

// ─── Push Notifications (placeholder) ────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() ?? { title: 'AI Studio Pro', body: 'Update tersedia!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icons/icon-192x192.png',
      badge: './icons/icon-72x72.png'
    })
  );
});
