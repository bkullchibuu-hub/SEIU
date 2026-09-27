import { getStore } from '@netlify/blobs';
import { isAdminRequest } from '../shared/admin-auth.mjs';

const STORE_NAME = 'seiu-site-content';
const PREFIX = 'sections/';
const VALID_SECTIONS = ['config', 'articles', 'gallery', 'students', 'partners', 'visas', 'news', 'aiLearning'];

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  },
});

const clean = (value, max = 600) => String(value || '').trim().slice(0, max);

const readAll = async store => {
  const values = await Promise.all(VALID_SECTIONS.map(section => (
    store.get(`${PREFIX}${section}.json`, { type: 'json', consistency: 'strong' }).catch(() => null)
  )));
  return VALID_SECTIONS.reduce((result, section, index) => {
    result[section] = values[index];
    return result;
  }, { serverTime: new Date().toISOString() });
};

export default async request => {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  const url = new URL(request.url);

  if (request.method === 'GET') return json(await readAll(store));
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!(await isAdminRequest(request))) return json({ error: 'Chưa đăng nhập quản trị.' }, 401);

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Dữ liệu nội dung không hợp lệ.' }, 400); }

  if (url.pathname.endsWith('/save-section')) {
    const section = clean(body.section, 80);
    if (!VALID_SECTIONS.includes(section) || body.data === undefined) {
      return json({ error: 'Mục nội dung không hợp lệ.' }, 400);
    }
    await store.setJSON(`${PREFIX}${section}.json`, body.data);
    return json({ success: true, section, updatedCount: Array.isArray(body.data) ? body.data.length : 1 });
  }

  if (url.pathname.endsWith('/sync-all')) {
    for (const section of VALID_SECTIONS) {
      if (body[section] !== undefined) await store.setJSON(`${PREFIX}${section}.json`, body[section]);
    }
    return json({ success: true, message: 'Đã đồng bộ nội dung.' });
  }

  return json({ error: 'Đường dẫn không hợp lệ.' }, 404);
};
