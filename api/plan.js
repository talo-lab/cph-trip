// Vercel Serverless: /api/plan
// GET  (auth) → { plan, favs, wishlist }
// POST (auth) → { plan?, favs?, wishlist? }
import { getRedis, getSession } from '../lib/redis-session.js';
import { handleCors, requireMethod, sendError, serverError } from '../lib/http.js';

async function getJson(redis, key) {
  const raw = await redis.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(`[plan] 깨진 JSON: key=${key}`, e.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    const session = await getSession(req);
    if (!session) return sendError(res, 401, 'Unauthorized');

    const { user } = session;
    const redis = getRedis();

    if (req.method === 'GET') {
      const [planData, favsData, wishData] = await Promise.all([
        getJson(redis, 'plan'),
        getJson(redis, `favs:${user}`),
        getJson(redis, `wishlist:${user}`),
      ]);
      return res.json({
        plan:     planData,
        favs:     favsData     || [],
        wishlist: wishData     || [],
      });
    }

    if (req.method === 'POST') {
      const { plan, favs, wishlist } = req.body || {};
      await Promise.all([
        plan     !== undefined ? redis.set('plan',              JSON.stringify(plan))     : Promise.resolve(),
        favs     !== undefined ? redis.set(`favs:${user}`,     JSON.stringify(favs))     : Promise.resolve(),
        wishlist !== undefined ? redis.set(`wishlist:${user}`, JSON.stringify(wishlist)) : Promise.resolve(),
      ]);
      return res.json({ ok: true });
    }

    return requireMethod(req, res, 'GET', 'POST');
  } catch (e) {
    return serverError(res, e, 'plan');
  }
}
