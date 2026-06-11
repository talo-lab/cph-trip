// Service Worker — CPH Trip Planner
// 전략: Cache First (오프라인/로밍 우선) + 백그라운드 revalidation
const VERSION = 'cph-v8';
const WEATHER_CACHE = 'cph-weather';
// 1시간 — SW 레이어 TTL (app.js localStorage TTL 3시간과 독립)
const WEATHER_TTL = 60 * 60 * 1000;

// 동일 출처 핵심 자산 — 반드시 캐시되어야 함 (install 단계에서 보장)
const CORE = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
];
// 외부 CDN 자산 — best-effort. 로밍 중 일부 CDN이 실패해도 install 자체는 성공시킨다.
// (폰트 URL은 index.html이 실제로 로드하는 Playfair/Inter/Space Mono와 일치시킴)
const EXTERNAL = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap',
];

/* fetch + 타임아웃 헬퍼 */
function fetchWithTimeout(req, ms) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(req, { signal: ctrl.signal }).finally(() => clearTimeout(id));
}

// 설치: 핵심 파일 사전 캐시
// addAll은 원자적(하나라도 실패하면 전체 실패)이라, 로밍 중 CDN 한 곳이 흔들리면
// 동일 출처 핵심 자산까지 캐시되지 않는다. 핵심/외부를 분리해 install 견고성을 확보.
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(CORE); // 실패하면 install 재시도 (핵심 자산은 반드시 필요)
    await Promise.allSettled(EXTERNAL.map(async url => {
      try { const r = await fetch(url, { mode: 'cors' }); if (r.ok) await c.put(url, r); } catch (_) {}
    }));
    await self.skipWaiting();
  })());
});

// 활성화: 이전 캐시 삭제 (날씨 캐시는 버전 무관하게 보존)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== VERSION && k !== 'cph-tiles' && k !== WEATHER_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch 전략
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // ── 지도 타일: Cache First (오프라인 필수, 변경 없음) ──
  if (url.hostname.includes('basemaps.cartocdn.com')) {
    e.respondWith(
      caches.open('cph-tiles').then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => cached || new Response('', { status: 503 }));
      })
    );
    return;
  }

  // ── 날씨 API (open-meteo.com): TTL 기반 캐시 ──
  // 신선(< 1시간): 캐시 즉시 반환
  // 만료 또는 미캐시: 네트워크 시도 → 성공 시 저장, 실패 시 만료 캐시라도 반환
  if (url.hostname.includes('open-meteo.com')) {
    e.respondWith(
      caches.open(WEATHER_CACHE).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) {
          const cachedAt = cached.headers.get('sw-cached-at');
          const age = cachedAt ? Date.now() - Number(cachedAt) : Infinity;
          if (age < WEATHER_TTL) return cached; // 신선 — 즉시 반환
        }
        // 네트워크 시도 (3초 타임아웃 — 로밍 대비)
        return fetchWithTimeout(e.request, 3000).then(async res => {
          if (res.ok) {
            // 캐시 저장 시 타임스탬프 헤더 주입
            const body = await res.arrayBuffer();
            const headers = new Headers(res.headers);
            headers.set('sw-cached-at', String(Date.now()));
            const toStore = new Response(body, { status: res.status, statusText: res.statusText, headers });
            cache.put(e.request, toStore.clone());
            return toStore;
          }
          return res;
        }).catch(() => {
          // 오프라인: 만료된 캐시라도 반환
          if (cached) return cached;
          return new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
    return;
  }

  // ── 외부 폰트/CDN: Cache First (Leaflet, Google Fonts 등) ──
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

  // ── /api/extract (AI): Anthropic API 최대 30초 → SW 타임아웃 35초 ──
  // 8초로 자르면 AI 응답 전에 SW가 연결을 끊어버려 500 오류 발생
  if (url.pathname === '/api/extract') {
    e.respondWith(
      fetchWithTimeout(e.request, 35_000).catch(() =>
        new Response(
          JSON.stringify({ error: 'timeout', message: 'AI 응답 시간이 초과됐습니다. 다시 시도해 주세요.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // ── 나머지 /api/ 엔드포인트: 8초 타임아웃 (plan, auth, geocode 등) ──
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetchWithTimeout(e.request, 8000).catch(() =>
        new Response(
          JSON.stringify({ error: 'offline', message: '오프라인 상태입니다. 로컬 데이터로 계속 사용하세요.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // ── 앱 파일 (index.html, app.js, events-data.js 등):
  //    Stale-While-Revalidate — 캐시 있으면 즉시 서빙, 백그라운드에서 갱신
  //    (로밍에서 네트워크 대기 없이 즉각 로딩)
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const cached = await cache.match(e.request);

      // 백그라운드 갱신 (응답 반환과 별개로 실행)
      const networkUpdate = fetch(e.request).then(res => {
        if (res.ok && e.request.method === 'GET') cache.put(e.request, res.clone());
        return res;
      }).catch(() => null);

      // 캐시 있으면 즉시 반환 (백그라운드 갱신은 계속 진행)
      if (cached) return cached;

      // 캐시 없으면 네트워크 응답 기다림 (첫 방문 시)
      return networkUpdate || caches.match('/index.html');
    })
  );
});
