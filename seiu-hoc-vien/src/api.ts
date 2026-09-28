import type { User } from './types';

const TOKEN_KEY = 'seiu-hv-token';

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;
  constructor(status: number, message: string, data: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

const setToken = (token: string) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* trình duyệt chặn lưu trữ: chỉ giữ phiên trong bộ nhớ */
  }
};

let memoryToken = getToken();
let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

export const api = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(memoryToken ? { authorization: `Bearer ${memoryToken}` } : {}),
  };
  const payload = body === undefined ? undefined : JSON.stringify(body);
  const response = __DEMO__
    ? await (await import('./demo')).demoFetch(method, path, headers, payload)
    : await fetch(`/api/${path}`, { method, headers, body: payload });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== 'login') {
      logout();
      onUnauthorized();
    }
    throw new ApiError(response.status, data.error || 'Không kết nối được máy chủ.', data);
  }
  return data as T;
};

export const login = async (username: string, password: string) => {
  const data = await api<{ token: string; user: User }>('POST', 'login', { username, password });
  memoryToken = data.token;
  setToken(data.token);
  return data.user;
};

export const logout = () => {
  memoryToken = '';
  setToken('');
};
