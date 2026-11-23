/* 서비스 워커: 앱 파일을 폰에 저장해 두어 오프라인에서도 열리게 합니다.
   파일을 고쳤다면 아래 VERSION 숫자를 올려야 폰이 새 파일을 받아요. */
const VERSION = 'studylog-v1';
const FILES = [
  './', './index.html', './style.css', './manifest.webmanifest',
  './js/util.js', './js/db.js', './js/books.js', './js/scanner.js', './js/xlsx.js',
  './js/charts.js', './js/core.js', './js/stats.js', './js/views.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 같은 주소의 파일만 캐시에서 먼저 보여주고, 뒤에서 새 파일을 받아 둠
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
