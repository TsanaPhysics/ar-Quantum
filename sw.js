// Service Worker for RBRU Quantum AR Simulation (Smart Network-First for HTML, Cache-First for Assets)
const CACHE_NAME = 'rbru-quantum-ar-v25';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './ar_universal_tracking.html',
  './ar_blackbody_cavity_tracking.html',
  './target_fig1_blackbody_cavity.png',
  './ar_photoelectric_tracking.html',
  './target_fig2_photoelectric_apparatus.png',
  './target_fig3_davisson_germer.png',
  './target_fig4_tonomura.png',
  './target_fig1_1.png',
  './target_fig1_3.png',
  './target_fig1_4.png',
  './target_fig1_6.png',
  './target_fig1_8.png',
  './target_fig2_1.png',
  './target_fig2_2.png',
  './target_fig2_3.png',
  './target_fig2_4.png',
  './target_fig2_5.png',
  './target_fig2_6.png',
  './target_fig3_1.png',
  './target_fig3_2.png',
  './target_fig3_3.png',
  './target_fig3_4.png',
  './target_fig3_5.png',
  './target_fig3_6.png',
  './target_fig4_1.png',
  './target_fig4_2.png',
  './target_fig4_3.png',
  './target_fig4_4.png',
  './target_fig4_5.png',
  './target_fig4_6.png',
  './target_fig5_1.png',
  './target_fig5_2.png',
  './target_fig5_3.png',
  './target_fig5_4.png',
  './target_fig5_5.png',
  './target_fig5_6.png',
  './target_fig6_1.png',
  './target_fig6_2.png',
  './target_fig6_3.png',
  './target_fig6_4.png',
  './target_fig6_5.png',
  './target_fig6_6.png',
  './target_fig7_1.png',
  './target_fig7_2.png',
  './target_fig7_3.png',
  './target_fig7_4.png',
  './target_fig7_5.png',
  './target_fig7_6.png',
  './target_fig8_1.png',
  './target_fig8_2.png',
  './target_fig8_3.png',
  './target_fig8_4.png',
  './target_fig8_5.png',
  './target_fig8_6.png',
  './target_fig9_1.png',
  './target_fig9_2.png',
  './target_fig9_3.png',
  './target_fig9_4.png',
  './target_fig9_5.png',
  './target_fig9_6.png',
  './ar_markers_all9_A4.png',
  './ar_markers_primary3_A4.png',
  './ar_markers_sheet_page1.png',
  './ar_markers_sheet_page2_ch01.png',
  './ar_markers_sheet_page3_ch02.png',
  './ar_markers_sheet_page4_ch03.png',
  './ar_markers_sheet_page5_ch04.png',
  './ar_markers_sheet_page6_ch05.png',
  './ar_markers_sheet_page7_ch06.png',
  './ar_markers_sheet_page8_ch07.png',
  './ar_markers_sheet_page9_ch08.png',
  './ar_markers_sheet_page10_ch09.png',

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
