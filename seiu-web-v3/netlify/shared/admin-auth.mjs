import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

const DEFAULT_USER_RECORD = 'SdFDqZK3oywKXNllHemq/w==:RJyY1ADe1AdWUOubi7KuTdVnfCuhNE+sDMO4b0lTu6t/93lQ+7YVqrSYoX2FB36lEhf8AfJaJ5VLA3Zs6DuCWw==';
const DEFAULT_PASSWORD_RECORD = 'JYAGKS3YxB1T5IJSAA3gaw==:fwNdk2FgcVKz2fQo2fd/U/mr61Bv7wO0FHR6lZ8R7DoHpVQ3KSYJWidCrEpViRbxRQOC4C66cWAFHCsQJlTsZg==';
const TOKEN_STORE_NAME = 'seiu-admin-auth';
const TOKEN_SECRET_KEY = 'security/token-secret.json';
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILED_LOGINS = 5;

const env = key => globalThis.Netlify?.env?.get?.(key) || process.env[key] || '';

const safeEqualText = (leftValue, rightValue) => {
  const left = Buffer.from(String(leftValue || ''));
  const right = Buffer.from(String(rightValue || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const passwordMatchesRecord = (password, record) => {
  const [saltBase64, hashBase64] = String(record || '').split(':');
  if (!saltBase64 || !hashBase64) return false;
  try {
    const expected = Buffer.from(hashBase64, 'base64');
    const actual = crypto.scryptSync(String(password || ''), Buffer.from(saltBase64, 'base64'), expected.length);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
};

export const verifyAdminCredentials = (username, password) => {
  const cleanUsername = String(username || '').trim();
  const configuredUser = env('SEIU_ADMIN_USER');
  const userMatches = configuredUser
    ? safeEqualText(cleanUsername, configuredUser)
    : passwordMatchesRecord(cleanUsername, DEFAULT_USER_RECORD);
  if (!userMatches) return false;

  const configuredPassword = env('SEIU_ADMIN_PASSWORD');
  if (configuredPassword) return safeEqualText(password, configuredPassword);

  const passwordRecord = env('SEIU_ADMIN_PASSWORD_HASH') || DEFAULT_PASSWORD_RECORD;
  return passwordMatchesRecord(password, passwordRecord);
};

const getTokenSecret = async () => {
  const configured = env('SEIU_ADMIN_TOKEN_SECRET');
  if (configured.length >= 32) return configured;

  const store = getStore({ name: TOKEN_STORE_NAME, consistency: 'strong' });
  const existing = await store.get(TOKEN_SECRET_KEY, { type: 'json', consistency: 'strong' }).catch(() => null);
  if (existing?.secret) return existing.secret;

  const generated = crypto.randomBytes(48).toString('base64url');
  await store.setJSON(TOKEN_SECRET_KEY, { secret: generated, createdAt: new Date().toISOString() }, { onlyIfNew: true });
  const stored = await store.get(TOKEN_SECRET_KEY, { type: 'json', consistency: 'strong' }).catch(() => null);
  if (!stored?.secret) throw new Error('Không khởi tạo được khóa phiên đăng nhập.');
  return stored.secret;
};

export const signAdminToken = async () => {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({
    role: 'admin',
    expiresAt,
    sessionId: crypto.randomUUID(),
  })).toString('base64url');
  const secret = await getTokenSecret();
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return { token: `${payload}.${signature}`, expiresAt };
};

export const verifyAdminToken = async token => {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature) return false;
  try {
    const secret = await getTokenSecret();
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    if (!safeEqualText(signature, expected)) return false;
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return parsed.role === 'admin' && Number(parsed.expiresAt) > Date.now();
  } catch {
    return false;
  }
};

export const isAdminRequest = async request => {
  const authorization = String(request.headers.get('authorization') || '');
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : String(request.headers.get('x-seiu-admin-key') || '');
  return verifyAdminToken(token);
};

const loginRateKey = request => {
  const forwarded = String(request.headers.get('x-nf-client-connection-ip') || request.headers.get('x-forwarded-for') || 'unknown');
  const ip = forwarded.split(',')[0].trim();
  return `security/login-${crypto.createHash('sha256').update(ip).digest('hex')}.json`;
};

export const checkLoginAllowance = async request => {
  const store = getStore({ name: TOKEN_STORE_NAME, consistency: 'strong' });
  const key = loginRateKey(request);
  const record = await store.get(key, { type: 'json', consistency: 'strong' }).catch(() => null);
  const now = Date.now();
  if (!record || Number(record.resetAt) <= now) return { allowed: true, key, attempts: 0, resetAt: now + LOGIN_WINDOW_MS };
  return {
    allowed: Number(record.attempts) < MAX_FAILED_LOGINS,
    key,
    attempts: Number(record.attempts) || 0,
    resetAt: Number(record.resetAt) || now + LOGIN_WINDOW_MS,
  };
};

export const recordLoginFailure = async allowance => {
  const store = getStore({ name: TOKEN_STORE_NAME, consistency: 'strong' });
  await store.setJSON(allowance.key, {
    attempts: Number(allowance.attempts) + 1,
    resetAt: allowance.resetAt,
    updatedAt: new Date().toISOString(),
  });
};

export const clearLoginFailures = async allowance => {
  const store = getStore({ name: TOKEN_STORE_NAME, consistency: 'strong' });
  await store.delete(allowance.key).catch(() => {});
};
