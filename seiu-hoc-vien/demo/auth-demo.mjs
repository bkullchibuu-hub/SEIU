// Thay cho server/auth.mjs trong bản demo trên trình duyệt.
// CHỈ dùng cho demo: không mã hóa mật khẩu, token không ký. Bản thật dùng server/auth.mjs.
const encode = value => btoa(unescape(encodeURIComponent(JSON.stringify(value))));
const decode = value => JSON.parse(decodeURIComponent(escape(atob(value))));

export const hashPassword = password => `demo:${password}`;
export const verifyPassword = (password, record) => record === `demo:${password}`;
export const safeEqualText = (a, b) => String(a ?? '') === String(b ?? '');
export const createToken = async (_store, _env, claims) => encode({ ...claims, exp: Date.now() + 12 * 3600e3 });
export const readToken = async (_store, _env, token) => {
  try {
    const claims = decode(token);
    return claims.exp > Date.now() ? claims : null;
  } catch {
    return null;
  }
};
export const isLockedOut = async () => false;
export const recordFailedLogin = async () => {};
export const clearFailedLogins = async () => {};
