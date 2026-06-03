// lib/redis-session.js — Redis 연결 + Bearer 세션 헬퍼
import Redis from 'ioredis';
import { randomBytes } from 'crypto';

const SESSION_TTL = 60 * 60 * 24 * 30; // 30일

let redis = null;

export function getRedis() {
  if (redis && redis.status !== 'end') return redis;

  const url =
    process.env.REDIS_URL || process.env.STORAGE_URL || process.env.KV_URL;
  if (!url) throw new Error('Redis URL 환경변수가 없습니다 (REDIS_URL)');

  redis = new Redis(url, {
    maxRetriesPerRequest: 2,
    connectTimeout: 8000,
    enableReadyCheck: false,
    tls: url.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  });

  return redis;
}

/**
 * Authorization 헤더에서 Bearer 토큰을 추출합니다.
 * 대소문자와 공백에 안전하게 처리합니다.
 */
export function getBearerToken(req) {
  const auth = (req.headers?.authorization || '').trim();
  const m = auth.match(/^bearer\s+(.+)$/i);
  return m ? m[1].trim() : '';
}

/**
 * 새 세션을 생성하고 토큰을 반환합니다.
 * crypto.randomBytes(24)를 사용해 Node 표준 방식으로 토큰을 생성합니다.
 */
export async function createSession(user) {
  const token = randomBytes(24).toString('hex');

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

/**
 * 세션을 조회합니다.
 * 깨진 JSON이 저장된 경우 로그를 남기고 해당 세션을 삭제합니다.
 */
export async function getSession(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  const key = `session:${token}`;
  const val = await getRedis().get(key);
  if (!val) return null;

  try {
    return JSON.parse(val);
  } catch (e) {
    console.error(`[redis-session] 깨진 세션 JSON 감지, 삭제: ${key}`, e.message);
    await getRedis().del(key).catch(() => {});
    return null;
  }
}
