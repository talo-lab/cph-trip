// Vercel Serverless Function: /api/transit
// Rejseplanen (덴마크 공식 대중교통) REST API 프록시
// CORS 및 XML→JSON 변환을 서버에서 처리합니다.
import { handleCors, sendError, serverError, fetchWithTimeout } from '../lib/http.js';

const BASE = 'https://xmlopen.rejseplanen.dk/bin/rest.exe';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { type, lat, lng, name, originId, destId, datetime } = req.query;

  try {
    let url = '';

    if (type === 'location') {
      if (lat && lng) {
        url = `${BASE}/coordsToStops?coordX=${Math.round(+lng * 1_000_000)}&coordY=${Math.round(+lat * 1_000_000)}&maxRadius=600&maxResults=3&format=json`;
      } else if (name) {
        url = `${BASE}/location?input=${encodeURIComponent(name)}&format=json`;
      } else {
        return sendError(res, 400, 'lat/lng 또는 name 파라미터가 필요합니다.');
      }
    } else if (type === 'trip') {
      if (!originId || !destId)
        return sendError(res, 400, 'originId, destId 파라미터가 필요합니다.');
      const dt   = datetime ? new Date(datetime) : new Date();
      const date = dt.toLocaleDateString('en-GB').replace(/\//g, '.'); // DD.MM.YYYY
      const time = dt.toTimeString().slice(0, 5);                       // HH:MM
      url = `${BASE}/trip?originId=${originId}&destId=${destId}&date=${date}&time=${time}&format=json`;
    } else {
      return sendError(res, 400, 'type 파라미터는 location 또는 trip이어야 합니다.');
    }

    const r = await fetchWithTimeout(url, {}, 6000);
    if (!r.ok) throw new Error(`Rejseplanen HTTP ${r.status}`);
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return serverError(res, e, 'transit');
  }
}
