// TỰ SINH từ seiu-hoc-vien/server/auth.mjs bởi `npm run build:web`. Đừng sửa trực tiếp file này.
import crypto from 'node:crypto';

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILED_LOGINS = 5;
const SECRET_KEY = 'meta/token-secret';

export const hashPassword = password => {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(String(password), salt, 64);
  return `${salt.toString('base64')}:${hash.toString('base64')}`;
};

export const verifyPassword = (password, record) => {
  const [saltB64, hashB64] = String(record || '').split(':');
  if (!saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = crypto.scryptSync(String(password || ''), Buffer.from(saltB64, 'base64'), expected.length);
  return crypto.timingSafeEqual(expected, actual);
};

export const safeEqualText = (a, b) => {
  const left = Buffer.from(String(a ?? ''));
  const right = Buffer.from(String(b ?? ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const getSecret = async (store, env) => {
  if (env.AUTH_SECRET) return env.AUTH_SECRET;
  const saved = await store.get(SECRET_KEY);
  if (saved?.secret) return saved.secret;
  const secret = crypto.randomBytes(32).toString('base64url');
  await store.set(SECRET_KEY, { secret });
  return secret;
};

const sign = (payload, secret) => crypto.createHmac('sha256', secret).update(payload).digest('base64url');

export const createToken = async (store, env, claims) => {
  const payload = Buffer.from(JSON.stringify({ ...claims, exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload, await getSecret(store, env))}`;
};

export const readToken = async (store, env, token) => {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature) return null;
  if (!safeEqualText(signature, sign(payload, await getSecret(store, env)))) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return claims.exp > Date.now() ? claims : null;
  } catch {
    return null;
  }
};

// Giới hạn đăng nhập sai: tối đa 5 lần / 10 phút cho mỗi tên đăng nhập.
const failKey = username => `auth-fail/${crypto.createHash('sha256').update(username.toLowerCase()).digest('hex')}`;

export const isLockedOut = async (store, username) => {
  const record = await store.get(failKey(username));
  return Boolean(record && Date.now() - record.since < LOGIN_WINDOW_MS && record.count >= MAX_FAILED_LOGINS);
};

export const recordFailedLogin = async (store, username) => {
  const key = failKey(username);
  const record = await store.get(key);
  const fresh = !record || Date.now() - record.since >= LOGIN_WINDOW_MS;
  await store.set(key, fresh ? { count: 1, since: Date.now() } : { ...record, count: record.count + 1 });
};

export const clearFailedLogins = (store, username) => store.delete(failKey(username));
