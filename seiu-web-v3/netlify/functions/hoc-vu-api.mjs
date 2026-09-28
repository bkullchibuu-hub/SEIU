// API của trang Học vụ (quản lý học viên) tại /hoc-vu/api/*.
// Mã xử lý nằm ở ../hoc-vu/ (sinh từ seiu-hoc-vien bằng `npm run build:web`).
// Admin đăng nhập bằng chính tài khoản quản trị của website.
import { handleApi } from '../hoc-vu/api.mjs';
import { openStore } from '../hoc-vu/store.mjs';
import { verifyAdminCredentials } from '../shared/admin-auth.mjs';

const env = key => globalThis.Netlify?.env?.get?.(key) || process.env[key] || '';

export default async request => handleApi(request, {
  store: await openStore(),
  env: { AUTH_SECRET: env('HOCVU_AUTH_SECRET') },
  verifyAdmin: verifyAdminCredentials,
});
