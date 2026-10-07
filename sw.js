// Primero lo guardado, siempre: en la cancha la señal es mala y una red lenta
// dejaría la app colgada. Las versiones nuevas llegan cuando cambia este archivo
// (CACHE_NAME), se instalan por detrás y se activan cuando la persona toca el aviso.
const CACHE_NAME = 'entradas-v4';

const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './fonts/barlow-400.woff2',
  './fonts/barlow-600.woff2',
  './fonts/barlow-700.woff2',
  './fonts/barlow-condensed-700.woff2',
  './fonts/ibm-plex-mono-400.woff2',
  './fonts/ibm-plex-mono-600.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(ARCHIVOS.map((url) => new Request(url, { cache: 'reload' })))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'actualizar') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  // Las pruebas van siempre a la red, para probar lo último que se publicó.
  if (url.pathname.endsWith('/tests.html') || req.cache === 'no-store') return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Abrir la app (con o sin parámetros) siempre responde con index.html guardado.
    if (req.mode === 'navigate') {
      const pagina = await cache.match('./index.html');
      if (pagina) return pagina;
    }
    const guardado = await cache.match(req, { ignoreSearch: true });
    if (guardado) return guardado;
    const resp = await fetch(req);
    if (resp && resp.ok) cache.put(req, resp.clone());
    return resp;
  })());
});
