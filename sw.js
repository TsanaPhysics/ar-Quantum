// Service Worker for RBRU Quantum AR Simulation (Cache-First Offline Engine)
const CACHE_NAME = 'rbru-quantum-ar-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
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
      console.log('[SW] Pre-caching offline quantum simulators');
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
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache dynamic third-party resources (fonts, cdn js)
        if (event.request.method === 'GET' && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for offline if not found
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
