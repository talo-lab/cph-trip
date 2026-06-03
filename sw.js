// Service Worker — CPH Trip Planner
// 전략: Network First (배포 즉시 반영) + 오프라인 폴백
const VERSION = 'cph-v6';
// events-data.js, exhibitions-data.js: 지연 로드 방식으로 변경.
// 탭 진입 시 네트워크에서 받아 SW가 자동 캐시 → 이후 오프라인 동작.
// install pre-cache에서 제외해 SW 설치 속도 개선 (588KB 절감).
const STATIC = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,400&family=Space+Mono:wght@400;700&family=Archivo:wght@400;500;600;700;800&display=swap',
];

// 설치: 핵심 파일 사전 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

// 활성화: 이전 캐시 전부 삭제
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION && k !== 'cph-tiles').map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch 전략
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // 지도 타일: Cache First (타일은 변경 없음, 오프라인 필수)
  if (url.hostname.includes('basemaps.cartocdn.com')) {
    e.respondWith(
      caches.open('cph-tiles').then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  // 외부 폰트/CDN: Cache First (변경 없음)
  if (url.hostname !== self.location.hostname) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) caches.open(VERSION).then(c => c.put(e.request, res.clone()));
          return res;
        });
      })
    );
    return;
  }

  // API: 항상 네트워크 (캐시 안 함)
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // 앱 파일 (index.html, events-data.js 등): Network First
  // → 온라인: 항상 최신 버전 / 오프라인: 캐시 폴백
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && e.request.method === 'GET') {
        caches.open(VERSION).then(c => c.put(e.request, res.clone()));
      }
      return res;
    }).catch(() =>
      caches.match(e.request).then(cached => cached || caches.match('/index.html'))
    )
  );
});
