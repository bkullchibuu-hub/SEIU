import { getStore } from '@netlify/blobs';
import { isAdminRequest } from '../shared/admin-auth.mjs';

const STORE_NAME = 'seiu-leads';
const PREFIX = 'leads/';
const MAX_RECORDS = 5000;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  },
});

const clean = (value, max = 240) => String(value || '').trim().slice(0, max);

const readAll = async store => {
  const { blobs } = await store.list({ prefix: PREFIX });
  const leads = await Promise.all(
    blobs.slice(-MAX_RECORDS).map(({ key }) => store.get(key, { type: 'json', consistency: 'strong' }).catch(() => null)),
  );
  return leads.filter(Boolean).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
};

const sanitizeLead = body => {
  const phone = clean(body.phone, 40).replace(/\D/g, '');
  return {
    id: `lead_${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    status: 'new',
    fullName: clean(body.fullName, 120),
    phone,
    email: clean(body.email, 160),
    interestedProgram: clean(body.interestedProgram || 'Tư vấn du học & tiếng Hàn', 240),
    city: clean(body.city, 160),
    intakeYear: clean(body.intakeYear, 80),
    notes: clean(body.notes, 1600),
    source: clean(body.source || 'Form website', 160),
    goal: clean(body.goal, 80),
  };
};

export default async request => {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  const url = new URL(request.url);

  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Dữ liệu đăng ký không hợp lệ.' }, 400); }
    const lead = sanitizeLead(body || {});
    if (lead.fullName.length < 2 || lead.phone.length < 9 || lead.phone.length > 12) {
      return json({ error: 'Họ tên hoặc số điện thoại chưa hợp lệ.' }, 400);
    }
    await store.setJSON(`${PREFIX}${lead.id}.json`, lead, { onlyIfNew: true });
    return json({ success: true, lead }, 201);
  }

  if (request.method === 'GET') {
    if (!(await isAdminRequest(request))) return json({ error: 'Chưa đăng nhập quản trị.' }, 401);
    return json({ leads: await readAll(store) });
  }

  const marker = '/leads/';
  const pathname = decodeURIComponent(url.pathname);
  const id = clean(pathname.includes(marker) ? pathname.split(marker).pop() : url.searchParams.get('id'), 120);
  if (!/^[a-zA-Z0-9_-]{8,120}$/.test(id)) return json({ error: 'Mã đăng ký không hợp lệ.' }, 400);
  if (!(await isAdminRequest(request))) return json({ error: 'Chưa đăng nhập quản trị.' }, 401);
  const key = `${PREFIX}${id}.json`;

  if (request.method === 'PATCH') {
    const current = await store.get(key, { type: 'json', consistency: 'strong' });
    if (!current) return json({ error: 'Không tìm thấy đăng ký.' }, 404);
    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Dữ liệu cập nhật không hợp lệ.' }, 400); }
    const allowedStatus = ['new', 'contacted', 'appointment', 'enrolled', 'cancelled'];
    const next = {
      ...current,
      status: allowedStatus.includes(body.status) ? body.status : current.status,
      notes: body.notes === undefined ? current.notes : clean(body.notes, 1600),
    };
    await store.setJSON(key, next);
    return json({ success: true, lead: next });
  }

  if (request.method === 'DELETE') {
    await store.delete(key);
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
};
