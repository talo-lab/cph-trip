// Vercel Serverless: /api/auth
import { createSession, deleteSession } from '../lib/redis-session.js';

const USERS = {
  miju:    process.env.PASS_MIJU,
  sanghyo: process.env.PASS_SANGHYO,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      const { user, password } = req.body || {};
      if (!user || !USERS[user])
        return res.status(401).json({ error: 'Invalid user' });
      if (USERS[user] !== password)
        return res.status(401).json({ error: 'Wrong password' });

      const token = await createSession(user);
      return res.json({ token, user });
    }

    if (req.method === 'DELETE') {
      await deleteSession(req);
      return res.json({ ok: true });
    }

    return res.status(405).end();
  } catch (e) {
    console.error('[auth] error:', e);
    return res.status(500).json({ error: `server error: ${e.message}` });
  }
}
