// Service Worker for RBRU Quantum AR Simulation (Smart Network-First for HTML, Cache-First for Assets)
const CACHE_NAME = 'rbru-quantum-ar-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './ar_blackbody_cavity_tracking.html',
  './target_fig1_blackbody_cavity.png',
  './lab01_blackbody_photoelectric.html',
  './lab02_double_slit.html',
  './lab03_schrodinger_wavepacket.html',
  './lab04_quantum_tunneling.html',
  './lab05_harmonic_oscillator.html',
  './lab06_hydrogen_orbitals.html',
  './lab07_bec_quantum_statistics.html',
  './lab08_bloch_sphere.html',
  './lab09_quantum_entanglement.html',
  './lab10_grover_hardware.html',
  './lab11_qft_shor_algorithm.html',
  './lab12_quantum_cryptography_qkd.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching offline quantum simulators v2');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const isHtml = event.request.mode === 'navigate' || 
                 (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isHtml) {
    // Network-First strategy for HTML: always fetch freshest UI from GitHub
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request) || caches.match('./index.html'))
    );
  } else {
    // Cache-First strategy for static assets
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (event.request.method === 'GET' && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});
