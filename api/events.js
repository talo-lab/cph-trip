// Vercel Serverless Function: /api/events
// 3 Days of Design 공식 사이트에서 이벤트 데이터를 가져와 메모리에 캐시합니다.
import { handleCors, fetchWithTimeout } from '../lib/http.js';

const CACHE_TTL_MS = 3600 * 1000; // 1시간
let _cache = null;
let _cacheAt = 0;

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  // 캐시 유효 시 즉시 반환
  if (_cache && Date.now() - _cacheAt < CACHE_TTL_MS) {
    return res.status(200).json({ source: 'cache', events: _cache });
  }

  try {
    const r = await fetchWithTimeout(
      'https://www.3daysofdesign.dk/events',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CphTripPlanner/1.0)' } },
      8000,
    );
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const html = await r.text();

    // JSON-LD 이벤트 데이터 추출
    const jsonLdMatches = [
      ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi),
    ];
    const events = [];

    for (const match of jsonLdMatches) {
      try {
        const obj = JSON.parse(match[1]);
        const items = Array.isArray(obj) ? obj : [obj];
        for (const item of items) {
          if (item['@type'] === 'Event' || item['@type'] === 'SocialEvent') {
            events.push({
              title:   item.name || '',
              venue:   item.location?.name || '',
              address: item.location?.address?.streetAddress || '',
              date:    item.startDate
                ? new Date(item.startDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day:   'numeric',
                  })
                : '',
              time:
                item.startDate && item.endDate
                  ? `${new Date(item.startDate).toLocaleTimeString('en-US', {
                      hour:   '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}-${new Date(item.endDate).toLocaleTimeString('en-US', {
                      hour:   '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}`
                  : '',
              desc: (item.description || '').slice(0, 120),
              url:  item.url || '',
            });
          }
        }
      } catch {
        // 개별 JSON-LD 파싱 실패는 무시
      }
    }

    if (events.length > 0) {
      _cache   = events;
      _cacheAt = Date.now();
      return res.status(200).json({ source: 'live', count: events.length, events });
    }

    // JSON-LD 없음 → 하드코딩 데이터가 최신임을 클라이언트에 알림
    return res.status(200).json({ source: 'static', events: [] });
  } catch (e) {
    console.error('[events] 외부 API 오류:', e.message);
    return res.status(200).json({ source: 'error', error: String(e), events: [] });
  }
}
