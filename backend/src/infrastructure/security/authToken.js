import crypto from 'crypto';

const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.ACCESS_TOKEN_TTL_SECONDS ?? 60 * 60);
const TOKEN_COOKIE_NAME = 'cp_access_token';
const TOKEN_SECRET =
  process.env.AUTH_TOKEN_SECRET ??
  'dev-only-change-me-cinematic-pulse-auth-token-secret-32-bytes-min';

const revokedTokens = new Map();

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(value) {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(value).digest('base64url');
}

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) return cookies;
      const key = part.slice(0, separatorIndex);
      const value = part.slice(separatorIndex + 1);
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length);
  }

  return parseCookies(req.headers.cookie)[TOKEN_COOKIE_NAME] ?? null;
}

function cleanupRevokedTokens(nowSeconds) {
  for (const [jti, exp] of revokedTokens.entries()) {
    if (exp <= nowSeconds) revokedTokens.delete(jti);
  }
}

export function createAccessToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SECONDS,
    jti: crypto.randomUUID()
  };
  const encodedPayload = base64url(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAccessToken(token) {
  if (!token || typeof token !== 'string') return null;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSignature = sign(encodedPayload);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    cleanupRevokedTokens(now);

    if (!payload.sub || !payload.jti || typeof payload.exp !== 'number' || payload.exp <= now) {
      return null;
    }

    if (revokedTokens.has(payload.jti)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAuthTokenFromRequest(req) {
  return getTokenFromRequest(req);
}

export function revokeAccessToken(token) {
  const payload = verifyAccessToken(token);
  if (!payload) return;
  revokedTokens.set(payload.jti, payload.exp);
}

export function setAuthCookie(res, token) {
  res.cookie(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api',
    maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api'
  });
}
