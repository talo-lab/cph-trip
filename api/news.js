// Vercel Serverless Function: /api/news
// 3daysofdesign.dk/journal 스크래핑 + db/news.json 비상 fallback
import { handleCors, requireMethod, serverError, fetchWithTimeout } from '../lib/http.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const CACHE = { data: null, at: 0 };
const TTL = 15 * 60 * 1000; // 15분

/* ── 3daysofdesign.dk/journal 스크래핑 ──────────────────────────────── */
async function scrapeJournal() {
  const res = await fetchWithTimeout(
    'https://www.3daysofdesign.dk/journal',
    { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; cph-trip-planner/1.0)' } },
    8000
  );
  if (!res.ok) return null;
  const html = await res.text();

  const items = [];
  let pos = 0;
  while (items.length < 6) {
    const linkIdx = html.indexOf('href="/post/', pos);
    if (linkIdx === -1) break;
    const linkEnd = html.indexOf('"', linkIdx + 6);
    if (linkEnd === -1) break;
    const path = html.slice(linkIdx + 6, linkEnd);

    const blockEnd = html.indexOf('</a>', linkIdx);
    if (blockEnd === -1) break;
    const block = html.slice(linkIdx, blockEnd);

    const h3Open = block.indexOf('<h3');
    if (h3Open !== -1) {
      const h3Body  = block.indexOf('>', h3Open) + 1;
      const h3Close = block.indexOf('</h3>', h3Body);
      if (h3Close !== -1) {
        const title = block.slice(h3Body, h3Close).replace(/<[^>]+>/g, '').trim();
        if (title.length > 3 && !items.some(i => i.text === title)) {
          items.push({
            text  : title,
            url   : 'https://www.3daysofdesign.dk' + path,
            source: 'journal',
          });
        }
      }
    }
    pos = blockEnd + 4;
  }
  return items.length ? items : null;
}

/* ── db/news.json 비상 fallback ─────────────────────────────────────── */
function loadFallback() {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'db', 'news.json'), 'utf8'));
  } catch {
    return [{ id: 0, text: '3 Days of Design 2026 · 6월 10–12일 · Copenhagen', url: 'https://www.3daysofdesign.dk' }];
  }
}

/* ── 핸들러 ─────────────────────────────────────────────────────────── */
export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=60');

  const now = Date.now();
  if (CACHE.data && now - CACHE.at < TTL) {
    return res.status(200).json(CACHE.data);
  }

  try {
    const items = await scrapeJournal().catch(() => null);
    const combined = items ?? loadFallback();
    CACHE.data = combined;
    CACHE.at   = now;
    return res.status(200).json(combined);
  } catch (e) {
    return serverError(res, e, 'news');
  }
}
