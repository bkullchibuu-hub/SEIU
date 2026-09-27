import { getStore } from '@netlify/blobs';
import { isAdminRequest } from '../shared/admin-auth.mjs';

const STORE_NAME = 'seiu-exam-results';
const RESULT_PREFIX = 'results/';
const REGISTRATION_STORE_NAME = 'seiu-exam-registrations';
const REGISTRATION_PREFIX = 'registrations/';
const MAX_RESULTS = 5000;

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  },
});

const clean = (value, max = 240) => String(value || '').trim().slice(0, max);
const finiteNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const sanitizeResult = body => {
  const correct = Math.max(0, finiteNumber(body.correct));
  const total = Math.max(0, finiteNumber(body.total));
  const score = Math.max(0, finiteNumber(body.score, correct));
  const maxScore = Math.max(0, finiteNumber(body.maxScore, total));
  const calculatedPercent = (maxScore || total)
    ? Math.round((score / (maxScore || total)) * 100)
    : 0;
  const requestedId = clean(body.submissionId || body.id, 100);
  const id = /^[a-zA-Z0-9_-]{8,100}$/.test(requestedId) ? requestedId : `res_${crypto.randomUUID()}`;

  return {
    id,
    createdAt: new Date().toISOString(),
    studentName: clean(body.studentName, 120),
    studentPhone: clean(body.studentPhone, 40).replace(/[^0-9+]/g, ''),
    registrationId: clean(body.registrationId, 100),
    goal: clean(body.goal, 80),
    testId: clean(body.testId, 160),
    testTitle: clean(body.testTitle, 240),
    testKind: clean(body.testKind, 80),
    correct,
    total,
    score,
    maxScore,
    percent: clamp(finiteNumber(body.percent, calculatedPercent), 0, 100),
    durationSec: Math.max(0, finiteNumber(body.durationSec)),
    detail: Array.isArray(body.detail) ? body.detail.slice(0, 200) : [],
  };
};

const completeRegistration = async result => {
  if (!/^[a-zA-Z0-9_-]{8,100}$/.test(result.registrationId || '')) return;
  try {
    const store = getStore({ name: REGISTRATION_STORE_NAME, consistency: 'strong' });
    const key = `${REGISTRATION_PREFIX}${result.registrationId}.json`;
    const registration = await store.get(key, { type: 'json', consistency: 'strong' });
    if (!registration) return;
    await store.setJSON(key, {
      ...registration,
      status: 'completed',
      completedAt: result.createdAt,
      resultId: result.id,
      score: result.score,
      maxScore: result.maxScore,
      percent: result.percent,
    });
  } catch (error) {
    console.warn('Không cập nhật được trạng thái đăng ký thi', error);
  }
};

const readAllResults = async store => {
  const { blobs } = await store.list({ prefix: RESULT_PREFIX });
  const selected = blobs.slice(-MAX_RESULTS);
  const results = await Promise.all(selected.map(({ key }) => store.get(key, { type: 'json' }).catch(() => null)));
  return results
    .filter(Boolean)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, MAX_RESULTS);
};

const buildLeaderboard = results => {
  const bestByStudent = new Map();
  results.forEach(result => {
    const identity = clean(result.studentPhone, 40) || clean(result.studentName, 120).toLowerCase();
    if (!identity) return;
    const current = bestByStudent.get(identity);
    const isBetter = !current
      || finiteNumber(result.percent) > finiteNumber(current.percent)
      || (finiteNumber(result.percent) === finiteNumber(current.percent)
        && finiteNumber(result.score) > finiteNumber(current.score));
    if (isBetter) bestByStudent.set(identity, result);
  });

  const best = Array.from(bestByStudent.values())
    .sort((a, b) => (
      finiteNumber(b.percent) - finiteNumber(a.percent)
      || finiteNumber(b.score) - finiteNumber(a.score)
      || String(a.createdAt).localeCompare(String(b.createdAt))
    ));

  return {
    totalAttempts: results.length,
    uniqueStudents: best.length,
    topScore: best.length ? finiteNumber(best[0].percent) : 0,
    updatedAt: new Date().toISOString(),
    entries: best.slice(0, 15).map((result, index) => ({
      rank: index + 1,
      id: clean(result.id, 100),
      studentName: clean(result.studentName, 120),
      testTitle: clean(result.testTitle, 240),
      score: finiteNumber(result.score, finiteNumber(result.correct)),
      maxScore: finiteNumber(result.maxScore, finiteNumber(result.total)),
      percent: clamp(finiteNumber(result.percent), 0, 100),
      createdAt: clean(result.createdAt, 80),
    })),
  };
};

export default async request => {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  const url = new URL(request.url);

  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); }
    catch { return json({ error: 'Dữ liệu kết quả không hợp lệ.' }, 400); }

    const result = sanitizeResult(body || {});
    if (result.studentName.length < 2 || result.studentPhone.replace(/\D/g, '').length < 8) {
      return json({ error: 'Thiếu tên hoặc số điện thoại học viên.' }, 400);
    }
    if (!result.testTitle || result.total <= 0) {
      return json({ error: 'Thiếu thông tin bài kiểm tra.' }, 400);
    }

    const key = `${RESULT_PREFIX}${result.id}.json`;
    const write = await store.setJSON(key, result, { onlyIfNew: true });
    if (!write.modified) {
      const existing = await store.get(key, { type: 'json', consistency: 'strong' });
      await completeRegistration(existing || result);
      return json({ success: true, result: existing || result, duplicate: true });
    }
    await completeRegistration(result);
    return json({ success: true, result }, 201);
  }

  if (request.method === 'GET') {
    if (url.pathname.endsWith('/leaderboard') || url.searchParams.get('view') === 'leaderboard') {
      const results = await readAllResults(store);
      return json({ leaderboard: buildLeaderboard(results) });
    }
    if (!(await isAdminRequest(request))) return json({ error: 'Chưa đăng nhập quản trị.' }, 401);
    const results = await readAllResults(store);
    return json({ results });
  }

  if (request.method === 'DELETE') {
    if (!(await isAdminRequest(request))) return json({ error: 'Chưa đăng nhập quản trị.' }, 401);
    const marker = '/exam-results/';
    const pathname = decodeURIComponent(url.pathname);
    const id = clean(pathname.includes(marker) ? pathname.split(marker).pop() : url.searchParams.get('id'), 100);
    if (!/^[a-zA-Z0-9_-]{8,100}$/.test(id)) return json({ error: 'Mã kết quả không hợp lệ.' }, 400);
    await store.delete(`${RESULT_PREFIX}${id}.json`);
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
};
