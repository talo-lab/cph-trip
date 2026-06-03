// lib/http.js — API 공통 유틸리티
// CORS 헤더, 메서드 검사, 오류 응답, 외부 API 타임아웃을 통합합니다.

/**
 * CORS 헤더를 설정하고, OPTIONS preflight 요청이면 200으로 즉시 종료합니다.
 * @returns {boolean} true이면 OPTIONS 처리 완료 → 핸들러를 즉시 return해야 합니다.
 */
export function handleCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * 허용된 HTTP 메서드가 아니면 405를 반환합니다.
 * @returns {boolean} true이면 통과, false이면 이미 405 응답 전송 완료.
 */
export function requireMethod(req, res, ...methods) {
  const allowed = methods.map((m) => m.toUpperCase());
  if (!allowed.includes((req.method || '').toUpperCase())) {
    res.setHeader('Allow', allowed.join(', '));
    res.status(405).json({
      error: `허용되지 않는 메서드: ${req.method}`,
      allowed: allowed.join(', '),
    });
    return false;
  }
  return true;
}

/**
 * 표준 오류 응답을 반환합니다.
 */
export function sendError(res, status, message, detail) {
  const body = { error: message };
  if (detail !== undefined) body.detail = detail;
  return res.status(status).json(body);
}

/**
 * 예상치 못한 서버 오류를 로그 후 500으로 반환합니다.
 * @param {string} context - 로그에 표시할 컨텍스트 이름 (예: 'auth', 'plan')
 */
export function serverError(res, err, context = 'api') {
  console.error(`[${context}] 오류:`, err);
  return res.status(500).json({ error: `서버 오류: ${err.message || String(err)}` });
}

/**
 * AbortController 기반 타임아웃이 적용된 fetch입니다.
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} timeoutMs - 기본값 8000ms
 */
export async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
