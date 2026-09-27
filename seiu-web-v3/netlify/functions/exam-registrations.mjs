import { getStore } from '@netlify/blobs';
import { isAdminRequest } from '../shared/admin-auth.mjs';

const STORE_NAME = 'seiu-exam-registrations';
const PREFIX = 'registrations/';
const MAX_RECORDS = 5000;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  },
});

const clean = (value, max = 240) => String(value || '').trim().slice(0, max);

const sanitizeRegistration = body => {
  const requestedId = clean(body.registrationId || body.id, 100);
  const id = /^[a-zA-Z0-9_-]{8,100}$/.test(requestedId) ? requestedId : `reg_${crypto.randomUUID()}`;
  return {
    id,
    createdAt: new Date().toISOString(),
    studentName: clean(body.studentName, 120),
    studentPhone: clean(body.studentPhone, 40).replace(/[^0-9+]/g, ''),
    goal: clean(body.goal, 80),
    testId: clean(body.testId, 160),
    testTitle: clean(body.testTitle, 240),
    testKind: clean(body.testKind, 80),
    status: 'started',
  };
};

const readAll = async store => {
  const { blobs } = await store.list({ prefix: PREFIX });
  const records = await Promise.all(
    blobs.slice(-MAX_RECORDS).map(({ key }) => store.get(key, { type: 'json' }).catch(() => null)),
  );
  return records
    .filter(Boolean)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, MAX_RECORDS);
};

export default async request => {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  const url = new URL(request.url);

  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Dữ liệu đăng ký thi không hợp lệ.' }, 400); }

    const registration = sanitizeRegistration(body || {});
    if (registration.studentName.length < 2 || registration.studentPhone.replace(/\D/g, '').length < 8) {
      return json({ error: 'Thiếu tên hoặc số điện thoại học viên.' }, 400);
    }
    if (!registration.testId || !registration.testTitle) {
      return json({ error: 'Thiếu thông tin bài thi.' }, 400);
    }

    const key = `${PREFIX}${registration.id}.json`;
    const write = await store.setJSON(key, registration, { onlyIfNew: true });
    if (!write.modified) {
      const existing = await store.get(key, { type: 'json', consistency: 'strong' });
      return json({ success: true, registration: existing || registration, duplicate: true });
    }
    return json({ success: true, registration }, 201);
  }

  if (request.method === 'GET') {
    if (!(await isAdminRequest(request))) return json({ error: 'Chưa đăng nhập quản trị.' }, 401);
    return json({ registrations: await readAll(store) });
  }

  if (request.method === 'DELETE') {
    if (!(await isAdminRequest(request))) return json({ error: 'Chưa đăng nhập quản trị.' }, 401);
    const marker = '/exam-registrations/';
    const pathname = decodeURIComponent(url.pathname);
    const id = clean(pathname.includes(marker) ? pathname.split(marker).pop() : url.searchParams.get('id'), 100);
    if (!/^[a-zA-Z0-9_-]{8,100}$/.test(id)) return json({ error: 'Mã đăng ký không hợp lệ.' }, 400);
    await store.delete(`${PREFIX}${id}.json`);
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
};
