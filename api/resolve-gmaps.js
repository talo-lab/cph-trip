// Vercel Serverless Function: /api/resolve-gmaps
// 구글맵 단축 URL(maps.app.goo.gl, goo.gl/maps)을 서버에서 리다이렉트 추적 후
// 최종 URL에서 좌표를 추출해 반환합니다.
import { handleCors, sendError, serverError, fetchWithTimeout } from '../lib/http.js';

function parseCoords(url) {
  // /place/NAME/@LAT,LNG,ZOOMz
  const pm = url.match(/\/place\/([^/@+]+)(?:\+([^/@]*))*\/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (pm) {
    return {
      lat: +pm[3],
      lng: +pm[4],
      title: decodeURIComponent(pm[1].replace(/\+/g, ' ')),
    };
  }
  // /@LAT,LNG
  const am = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (am) return { lat: +am[1], lng: +am[2] };
  // ?q=LAT,LNG 또는 ?q=장소명
  const qm = url.match(/[?&](?:q|query)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qm) return { lat: +qm[1], lng: +qm[2] };
  const nm = url.match(/[?&](?:q|query)=([^&]+)/);
  if (nm) return { title: decodeURIComponent(nm[1].replace(/\+/g, ' ')) };
  return null;
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { url } = req.query;
  if (!url) return sendError(res, 400, 'url 파라미터가 필요합니다.');

  try {
    const r = await fetchWithTimeout(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; cph-trip-planner/1.0)',
      },
    }, 8000);

    const finalUrl = r.url || url;
    const coords = parseCoords(finalUrl);

    return res.status(200).json({
      url: finalUrl,
      ...(coords || {}),
    });
  } catch (e) {
    return serverError(res, e, 'resolve-gmaps');
  }
}
