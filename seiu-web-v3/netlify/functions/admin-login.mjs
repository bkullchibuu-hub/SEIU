import {
  checkLoginAllowance,
  clearLoginFailures,
  recordLoginFailure,
  signAdminToken,
  verifyAdminCredentials,
} from '../shared/admin-auth.mjs';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  },
});

export default async request => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const allowance = await checkLoginAllowance(request);
  if (!allowance.allowed) {
    return json({ error: 'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 10 phút.' }, 429);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Dữ liệu đăng nhập không hợp lệ.' }, 400); }

  const username = String(body?.username || '').trim();
  const password = String(body?.password || '');
  if (!verifyAdminCredentials(username, password)) {
    await recordLoginFailure(allowance);
    return json({ error: 'Sai tài khoản hoặc mật khẩu quản trị.' }, 401);
  }

  await clearLoginFailures(allowance);
  return json({ success: true, username, ...await signAdminToken() });
};
