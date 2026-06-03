// Shared Redis + session helper — cph-trip API
import Redis from 'ioredis';

const SESSION_TTL = 60 * 60 * 24 * 30; // 30일

let redis = null;

export function getRedis() {
  if (redis && redis.status !== 'end') return redis;

  const url = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.KV_URL;
  if (!url) throw new Error('Redis URL 환경변수가 없습니다 (REDIS_URL)');

  redis = new Redis(url, {
    maxRetriesPerRequest: 2,
    connectTimeout: 8000,
    enableReadyCheck: false,
    tls: url.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  });

  return redis;
}

export function getBearerToken(req) {
  return (req.headers.authorization || '').replace('Bearer ', '').trim();
}

export async function createSession(user) {
  const buf = new Uint8Array(24);
  globalThis.crypto.getRandomValues(buf);
  const token = [...buf].map((b) => b.toString(16).padStart(2, '0')).join('');

  await getRedis().set(
    `session:${token}`,
    JSON.stringify({ user, created: Date.now() }),
    'EX',
    SESSION_TTL,
  );

  return token;
}

export async function deleteSession(req) {
  const token = getBearerToken(req);
  if (token) await getRedis().del(`session:${token}`);
}

export async function getSession(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  const val = await getRedis().get(`session:${token}`);
  return val ? JSON.parse(val) : null;
}
