const AUTH_STORAGE_KEY = 'seiu_admin_auth_session';

export interface AdminSession {
  isAuthenticated: boolean;
  username: string;
  loginTime: number;
  expiresAt: number;
  token: string;
}

export interface LoginResult {
  success: boolean;
  username?: string;
  token?: string;
  expiresAt?: number;
  error?: string;
}

export const checkAdminCredentials = async (username: string, password: string): Promise<LoginResult> => {
  const cleanUsername = username.trim();
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUsername, password }),
    });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json().catch(() => null) : null;
    if (response.ok && data?.success && data?.token) return data as LoginResult;
    return {
      success: false,
      error: data?.error || 'Sai tài khoản hoặc mật khẩu quản trị.',
    };
  } catch {
    return {
      success: false,
      error: 'Không kết nối được máy chủ đăng nhập. Vui lòng kiểm tra bản deploy Netlify Functions.',
    };
  }
};

export const getAdminSession = (): AdminSession | null => {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    if (session?.isAuthenticated && session.token && session.expiresAt > Date.now()) return session;
    clearAdminSession();
    return null;
  } catch {
    return null;
  }
};

export const setAdminSession = (
  username: string,
  token: string,
  expiresAt: number,
  remember: boolean = false,
): void => {
  const session: AdminSession = { isAuthenticated: true, username, loginTime: Date.now(), expiresAt, token };
  const serialized = JSON.stringify(session);
  sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
  if (remember) localStorage.setItem(AUTH_STORAGE_KEY, serialized);
};

export const getAdminKey = (): string => getAdminSession()?.token || '';

export const clearAdminSession = (): void => {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('seiu_admin_logout'));
};
