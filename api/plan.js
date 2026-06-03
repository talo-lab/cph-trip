// Vercel Serverless: /api/plan
// GET  (auth) → { plan, favs }
// POST (auth) → { plan?, favs? }
import { getRedis, getSession } from '../lib/redis-session.js';

async function getJson(redis, key) {
  const raw = await redis.get(key);
  return raw ? JSON.parse(raw) : null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const session = await getSession(req);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { user } = session;
    const redis = getRedis();

    if (req.method === 'GET') {
      const [planData, favsData, wishData] = await Promise.all([
        getJson(redis, 'plan'),
        getJson(redis, `favs:${user}`),
        getJson(redis, `wishlist:${user}`),
      ]);
      return res.json({
        plan: planData,
        favs: favsData || [],
        wishlist: wishData || [],
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

    return res.status(405).end();
  } catch (e) {
    console.error('[plan] error:', e);
    return res.status(500).json({ error: `server error: ${e.message}` });
  }
}
