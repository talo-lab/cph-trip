// Vercel Serverless Function: /api/news
// db/news.json 수동 관리 공지 + 3daysofdesign.dk Journal 스크래핑
// 캐시 TTL: 15분 (메모리, Vercel 재시작 시 초기화)
import { handleCors, requireMethod, serverError, fetchWithTimeout } from '../lib/http.js';
import { readFileSync } from 'fs';
import { join } from 'path';

// db/news.json 로드 (배포 번들에 포함)
function loadStaticItems() {
  try {
    const p = join(process.cwd(), 'db', 'news.json');
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    // 파일 없으면 최소 fallback
    return [{ id: 0, text: '3 Days of Design 2026 · JUN 10–12 · COPENHAGEN', url: 'https://www.3daysofdesign.dk' }];
  }
}

const CACHE = { data: null, at: 0 };
const TTL = 15 * 60 * 1000; // 15분

/**
 * 3daysofdesign.dk/journal HTML에서 최신 포스트 제목 추출
 * 구조: <a href="/post/slug"> ... <h3>제목</h3> ... </a>
 */
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
  while (items.length < 4) {
    const linkIdx = html.indexOf('href="/post/', pos);
    if (linkIdx === -1) break;

    const linkEnd = html.indexOf('"', linkIdx + 6);
    if (linkEnd === -1) break;
    const path = html.slice(linkIdx + 6, linkEnd); // "/post/slug"

    const blockEnd = html.indexOf('</a>', linkIdx);
    if (blockEnd === -1) break;
    const block = html.slice(linkIdx, blockEnd);

    const h3Open = block.indexOf('<h3');
    if (h3Open !== -1) {
      const h3Body = block.indexOf('>', h3Open) + 1;
      const h3Close = block.indexOf('</h3>', h3Body);
      if (h3Close !== -1) {
        const title = block.slice(h3Body, h3Close).replace(/<[^>]+>/g, '').trim();
        if (title.length > 3 && !items.some(i => i.text === title)) {
          items.push({ text: title, url: 'https://www.3daysofdesign.dk' + path, source: 'journal' });
        }
      }
    }
    pos = blockEnd + 4;
  }
  return items.length >= 2 ? items : null;
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  // Cache-Control 헤더: 브라우저 15분 캐시
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=60');

  const now = Date.now();
  if (CACHE.data && now - CACHE.at < TTL) {
    return res.status(200).json(CACHE.data);
  }

  try {
    const staticItems = loadStaticItems();
    const journal = await scrapeJournal().catch(() => null);

    // 고정 공지 1개 + journal 최신 3개(있을 때) + 나머지 고정 공지
    const combined = journal
      ? [staticItems[0], ...journal.slice(0, 3), ...staticItems.slice(1, 3)]
      : staticItems;

    CACHE.data = combined;
    CACHE.at = now;
    return res.status(200).json(combined);
  } catch (e) {
    return serverError(res, e, 'news');
  }
}
