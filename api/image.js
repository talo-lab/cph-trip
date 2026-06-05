// Vercel Serverless Function: /api/image?id={eventId}
// 3daysofdesign.dk 개별 행사 페이지에서 첫 번째 CDN 이미지 URL을 추출해 반환
// 캐시 TTL: 24시간 (메모리)
import { handleCors, requireMethod, fetchWithTimeout } from '../lib/http.js';

const CACHE = new Map(); // id → { url: string|null, at: number }
const TTL   = 24 * 60 * 60 * 1000; // 24시간
const CDN   = 'https://cdn.prod.website-files.com/6195025159d3bccd9b338ebb/';
const ID_RE = /^[a-f0-9]{24}$/i;

async function scrapeImage(eventId) {
  const res = await fetchWithTimeout(
    `https://www.3daysofdesign.dk/event/${eventId}`,
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; cph-trip-planner/1.0)' } },
    9000
  );
  if (!res.ok) return null;
  const html = await res.text();

  // 본문 영역의 CDN 이미지 URL 추출 (헤더 nav 이미지 제외, ev-body 이후 첫 이미지)
  // 전략: CDN URL이 등장하는 위치를 순서대로 찾되, svg/logo 제외
  let pos = 0;
  while (pos < html.length) {
    const idx = html.indexOf(CDN, pos);
    if (idx === -1) break;
    const end = html.indexOf('"', idx);
    if (end === -1) break;
    const url = html.slice(idx, end);
    // SVG, 로고, 아이콘 제외 → jpeg/jpg/png/webp 만 허용
    if (/\.(jpe?g|png|webp)(\?|$)/i.test(url) || /\.(jpe?g|png|webp)$/i.test(url.split('?')[0])) {
      return url;
    }
    pos = end;
  }
  return null;
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');

  const id = req.query.id || '';
  if (!ID_RE.test(id)) {
    return res.status(400).json({ error: '유효하지 않은 id' });
  }

  const now    = Date.now();
  const cached = CACHE.get(id);
  if (cached && now - cached.at < TTL) {
    return res.status(200).json({ imageUrl: cached.url });
  }

  try {
    const imageUrl = await scrapeImage(id);
    CACHE.set(id, { url: imageUrl, at: now });
    return res.status(200).json({ imageUrl });
  } catch (_) {
    // 조용히 실패 — 프론트엔드가 fallback 처리
    return res.status(200).json({ imageUrl: null });
  }
}
