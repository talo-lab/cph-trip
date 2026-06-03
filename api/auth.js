// Vercel Serverless: /api/auth
import { createSession, deleteSession } from '../lib/redis-session.js';
import { handleCors, requireMethod, sendError, serverError } from '../lib/http.js';

const USERS = {
  miju:    process.env.PASS_MIJU,
  sanghyo: process.env.PASS_SANGHYO,
};

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    if (req.method === 'POST') {
      const { user, password } = req.body || {};
      if (!user || !USERS[user])
        return sendError(res, 401, 'Invalid user');
      if (USERS[user] !== password)
        return sendError(res, 401, 'Wrong password');

      const token = await createSession(user);
      return res.json({ token, user });
    }

    if (req.method === 'DELETE') {
      await deleteSession(req);
      return res.json({ ok: true });
    }

    return requireMethod(req, res, 'POST', 'DELETE');
  } catch (e) {
    return serverError(res, e, 'auth');
  }
}
