const CACHE_NAME = 'alaska-cache-v2';
const ASSETS = [
  '/', '/index.html', '/blog.html', '/contacto.html', '/login.html', '/dashboard.html',
  '/style.css', '/style-adicional.css',
  '/app.js', '/utils/auth.js', '/utils/storage.js', '/utils/chatbot.js',
  '/views/MenuView.js', '/views/ButtonView.js', '/views/FormView.js',
  '/img/logo.jpg', '/img/alaska-ico.ico', '/img/blog1.avif', '/img/blog2.avif', '/img/blog3.avif', '/img/blog4.avif', '/img/blog5.avif', '/img/blog6.avif', '/img/photo.avif', '/img/perro-feliz.avif'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // Solo cachear mismo origen para evitar problemas con CORS/opaque y seguridad
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req, { cache: 'no-store' });
      // Evitar cachear respuestas no válidas
      if (!res || res.status !== 200 || res.type !== 'basic') return res;
      const clone = res.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, clone);
      return res;
    } catch (e) {
      return caches.match('/index.html');
    }
  })());
});
