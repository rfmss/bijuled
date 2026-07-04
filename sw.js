/**
 * BIJULED · Service Worker
 * Cache-first: o jogo inteiro funciona offline após a primeira visita.
 * Bump CACHE_VERSION a cada release pra invalidar o cache antigo.
 */
var CACHE_VERSION = 'bijuled-v2';

var CORE_ASSETS = [
  '.',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/gems.js',
  'js/levels.js',
  'js/board.js',
  'js/game.js',
  'js/radio.js',
  'js/compliments.js',
  'assets/emojis/angry.png',
  'assets/emojis/nauseated.png',
  'assets/emojis/cold.png',
  'assets/emojis/grinning.png',
  'assets/emojis/devil.png',
  'assets/emojis/ghost.png',
  'assets/emojis/invader.png',
  'assets/emojis/alien.png',
  'assets/emojis/skull.png',
  'assets/emojis/heartfire.png',
  'assets/emojis/robot.png',
  'assets/emojis/anim/angry.webp',
  'assets/emojis/anim/nauseated.webp',
  'assets/emojis/anim/cold.webp',
  'assets/emojis/anim/grinning.webp',
  'assets/emojis/anim/devil.webp',
  'assets/emojis/anim/ghost.webp',
  'assets/emojis/anim/invader.webp',
  'assets/emojis/anim/alien.webp',
  'assets/emojis/anim/skull.webp',
  'assets/emojis/anim/heartfire.webp',
  'assets/emojis/anim/robot.webp',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-maskable-512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/favicon-32.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k !== CACHE_VERSION;
      }).map(function (k) {
        return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);
  // Rádio, analytics e qualquer origem externa vão direto pra rede
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (resp) {
        if (resp && resp.status === 200 && event.request.method === 'GET') {
          var copy = resp.clone();
          caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return resp;
      });
    })
  );
});
