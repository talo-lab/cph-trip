// Vercel Serverless Function: /api/geocode
// Nominatim (OpenStreetMap) 지오코딩 서버 프록시.
// 클라이언트 직접 호출 대신 서버에서 User-Agent·파라미터를 통일합니다.
import { handleCors, sendError, serverError, fetchWithTimeout } from '../lib/http.js';

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { q } = req.query;
  if (!q || !q.trim()) return sendError(res, 400, 'q 파라미터가 필요합니다.');

  try {
    const query = encodeURIComponent(q.trim() + ' Copenhagen Denmark');
    const url = `${NOMINATIM}?q=${query}&format=json&limit=1&countrycodes=dk&viewbox=12.3,55.55,12.75,55.82&bounded=0`;
    const r = await fetchWithTimeout(url, {
      headers: { 'User-Agent': 'cph-trip-planner/1.0' }
    }, 6000);
    if (!r.ok) throw new Error(`Nominatim HTTP ${r.status}`);
    const data = await r.json();
    if (!data.length) return res.status(200).json(null);
    const { lat, lon } = data[0];
    return res.status(200).json({ lat: +lat, lng: +lon });
  } catch (e) {
    return serverError(res, e, 'geocode');
  }
}
