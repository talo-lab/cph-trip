// Vercel Serverless Function: /api/news
// 소스 우선순위:
//   1) Bluesky #3daysofdesign 실시간 포스트 (인증 불필요)
//   2) 3daysofdesign.dk/journal 공식 스크래핑
//   3) db/news.json 비상 fallback (두 소스 모두 실패 시)
import { handleCors, requireMethod, serverError, fetchWithTimeout } from '../lib/http.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const CACHE = { data: null, at: 0 };
const TTL = 15 * 60 * 1000; // 15분

/* ── 1. Bluesky 해시태그 검색 ─────────────────────────────────────────────
   public.api.bsky.app — Bearer 토큰 불필요, 공개 포스트만 반환           */
async function fetchBluesky() {
  const queries = ['#3daysofdesign', '#3daysofdesign2026'];
  const seen = new Set();
  const items = [];

  for (const q of queries) {
    if (items.length >= 5) break;
    const url =
      'https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts' +
      `?q=${encodeURIComponent(q)}&limit=10&sort=latest`;

    const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, 7000);
    if (!res.ok) continue;
    const data = await res.json();

    for (const post of data.posts || []) {
      const raw = post.record?.text || '';
      // URL, 불필요한 줄바꿈 제거 → 80자 이내로 정리
      const text = raw
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (text.length < 8 || seen.has(text)) continue;
      seen.add(text);

      // AT URI → Bluesky 웹 링크  (at://did:.../app.bsky.feed.post/rkey)
      const parts = (post.uri || '').split('/');
      const rkey  = parts[parts.length - 1];
      const handle = post.author?.handle || '';
      const webUrl  = rkey && handle
        ? `https://bsky.app/profile/${handle}/post/${rkey}`
        : null;

      items.push({
        text   : text.length > 85 ? text.slice(0, 84) + '…' : text,
        url    : webUrl,
        source : 'bluesky',
        author : post.author?.displayName || handle,
        time   : post.record?.createdAt,
      });
      if (items.length >= 5) break;
    }
  }
  return items.length ? items : null;
}

/* ── 2. 3daysofdesign.dk/journal 스크래핑 ────────────────────────────── */
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
  while (items.length < 3) {
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

/* ── 3. db/news.json 비상 fallback ────────────────────────────────────── */
function loadFallback() {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'db', 'news.json'), 'utf8'));
  } catch {
    return [{ id: 0, text: '3 Days of Design 2026 · 6월 10–12일 · Copenhagen', url: 'https://www.3daysofdesign.dk' }];
  }
}

/* ── 핸들러 ───────────────────────────────────────────────────────────── */
export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=60');

  const now = Date.now();
  if (CACHE.data && now - CACHE.at < TTL) {
    return res.status(200).json(CACHE.data);
  }

  try {
    // 두 소스 병렬 요청
    const [bskyRes, journalRes] = await Promise.allSettled([
      fetchBluesky(),
      scrapeJournal(),
    ]);

    const bsky    = bskyRes.status    === 'fulfilled' ? bskyRes.value    : null;
    const journal = journalRes.status === 'fulfilled' ? journalRes.value : null;

    let combined;
    if (bsky?.length || journal?.length) {
      // Bluesky 최신 4개 + journal 2개 혼합
      combined = [
        ...(bsky    || []).slice(0, 4),
        ...(journal || []).slice(0, 2),
      ];
    } else {
      // 둘 다 실패 → 수동 fallback
      combined = loadFallback();
    }

    CACHE.data = combined;
    CACHE.at   = now;
    return res.status(200).json(combined);
  } catch (e) {
    return serverError(res, e, 'news');
  }
}
