// HTML AI Studio Pro - Service Worker v2
// Updated: force clear old cache for Integrasi update

const CACHE_NAME = 'html-ai-studio-pro-v2';   // <-- NAIK ke v2
const STATIC_CACHE = 'static-v2';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

const CACHE_PATTERNS = [
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  /cdnjs\.cloudflare\.com/
];

// ─── Install: cache fresh files ────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())   // langsung aktif tanpa tunggu tab lain tutup
  );
});

// ─── Activate: hapus SEMUA cache lama ──────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== STATIC_CACHE)
          .map(key => {
            console.log('[SW] Menghapus cache lama:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch: Network-first untuk HTML, cache-first untuk aset statis ─────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  const apiPatterns = [
    'api.anthropic.com', 'firebaseio.com', 'googleapis.com/firebase',
    'api.github.com', 'generativelanguage.googleapis.com',
    'api.openai.com', 'api.groq.com', 'openrouter.ai',
    'firestore.googleapis.com', 'identitytoolkit.googleapis.com'
  ];
  if (apiPatterns.some(p => url.hostname.includes(p))) return;

  // Network-first untuk file HTML utama (supaya update langsung terlihat)
  if (request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first untuk aset statis (gambar, font, dll)
  const isStatic =
    url.origin === self.location.origin ||
    CACHE_PATTERNS.some(p => p.test(request.url));

  if (isStatic) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (!response || response.status !== 200 || response.type === 'opaque') return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        }).catch(() => {
          if (request.mode === 'navigate') return caches.match('./index.html');
        });
      })
    );
  }
});

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
