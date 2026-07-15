// RiL Developer — Service Worker v5
const CACHE_NAME = 'ril-dev-v5';
const CACHE_VERSION = '5.0.0';

// File-file yang dicache untuk offline
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/favicon-16.png',
  './icons/favicon-32.png',
  './icons/apple-touch-icon.png',
];

// CDN resources yang juga di-cache
const CDN_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/dracula.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/xml/xml.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/javascript/javascript.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/css/css.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/htmlmixed/htmlmixed.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
];

// ════ INSTALL ════
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache static assets (ignore failures)
      return Promise.allSettled([
        ...STATIC_ASSETS.map(url => cache.add(url).catch(() => {})),
        ...CDN_ASSETS.map(url => cache.add(url).catch(() => {})),
      ]);
    }).then(() => self.skipWaiting())
  );
});

// ════ ACTIVATE ════
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ════ FETCH — Cache-first untuk assets, Network-first untuk API ════
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Jangan intercept API calls (Anthropic, OpenAI, Gemini, dll)
  const isApiCall = [
    'api.anthropic.com',
    'api.openai.com',
    'api.groq.com',
    'openrouter.ai',
    'generativelanguage.googleapis.com',
    'image.pollinations.ai',
  ].some(domain => url.hostname.includes(domain));

  if (isApiCall) {
    // Network-only untuk API — tidak di-cache
    event.respondWith(fetch(event.request));
    return;
  }

  // Jangan intercept Chrome Extensions
  if (url.protocol === 'chrome-extension:') return;

  // Cache-first untuk semua asset lainnya
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          // Simpan response valid ke cache
          if (response && response.status === 200 && response.type !== 'opaque') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback — kembalikan index.html untuk navigasi
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// ════ MESSAGE — Handle skip-waiting dari halaman ════
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
