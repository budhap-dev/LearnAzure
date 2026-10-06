/**
 * Offline support. The offlineServiceWorker plugin in vite.config.ts copies this file to
 * dist/sw.js after the build and fills in __PRECACHE__ (every file the site needs, relative to
 * this script) and __VERSION__ (a hash of their contents).
 *
 * The whole course is cached on the first visit and served cache-first, so it opens offline.
 * A deploy that changes anything ships a new worker: it installs in the background and waits
 * while the old one keeps serving the old build intact, and the app offers a reload
 * (src/lib/serviceWorker.ts) that tells it to take over.
 */
const VERSION = __VERSION__;
const PRECACHE = __PRECACHE__;
const CACHE = `learnazure-${VERSION}`;

const toUrl = (path) => new URL(path, self.location).href;
const CACHED = new Set(PRECACHE.map(toUrl));
const INDEX = toUrl('index.html');
const ROOT = toUrl('./');

self.addEventListener('install', (event) => {
  // cache: 'reload' skips the HTTP cache, so index.html and the data files are the new deploy's.
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.map((path) => new Request(path, { cache: 'reload' })))),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('learnazure-') && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  url.hash = '';
  url.search = '';
  // The app routes in the URL hash, so every page is index.html.
  const key = request.mode === 'navigate' && url.href === ROOT ? INDEX : url.href;
  if (!CACHED.has(key)) return;
  event.respondWith(
    caches
      .open(CACHE)
      .then((cache) => cache.match(key))
      .then((hit) => hit || fetch(request)),
  );
});
