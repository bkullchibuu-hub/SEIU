import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, test } from 'node:test';
import { handleApi } from '../server/api.mjs';
import { createFileStore } from '../server/store.mjs';

const env = { ADMIN_USERNAME: 'admin', ADMIN_PASSWORD: 'admin123', AUTH_SECRET: 'test-secret' };
let ctx;

beforeEach(async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'seiu-hv-'));
  ctx = { store: createFileStore(dir), env };
});

const call = async (method, url, { token, body } = {}) => {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await handleApi(new Request(`http://x/api/${url}`, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body),
  }), ctx);
  return { status: res.status, data: await res.json() };
};

const loginAs = async (username, password) => (await call('POST', 'login', { body: { username, password } })).data.token;

const setup = async () => {
  const admin = await loginAs('admin', 'admin123');
  const gvA = (await call('POST', 'teachers', { token: admin, body: { fullName: 'Cô Kim', username: 'kim', password: 'matkhau1' } })).data.item;
  const gvB = (await call('POST', 'teachers', { token: admin, body: { fullName: 'Thầy Park', username: 'park', password: 'matkhau2' } })).data.item;
  const lopA = (await call('POST', 'classes', { token: admin, body: { code: 'sc1-k01', level: 'Sơ cấp 1', capacity: 2, teacherId: gvA.id } })).data.item;
  const lopB = (await call('POST', 'classes', { token: admin, body: { code: 'SC2-K01', level: 'Sơ cấp 2', capacity: 10, teacherId: gvB.id } })).data.item;
  return { admin, gvA, gvB, lopA, lopB };
};

test('đăng nhập sai bị từ chối, không lộ mật khẩu giáo viên', async () => {
  assert.equal((await call('POST', 'login', { body: { username: 'admin', password: 'sai' } })).status, 401);
  const { admin } = await setup();
  const { data } = await call('GET', 'teachers', { token: admin });
  assert.equal(data.items.length, 2);
  assert.ok(data.items.every(t => !('passwordHash' in t)));
});

test('nhập học viên: tự sinh mã, chặn trùng SĐT, chặn lớp đầy', async () => {
  const { admin, lopA } = await setup();
  assert.equal(lopA.code, 'SC1-K01');
  const hv1 = await call('POST', 'students', { token: admin, body: { fullName: 'Nguyễn Văn A', phone: '0901 234 567', classId: lopA.id } });
  assert.equal(hv1.status, 201);
  assert.equal(hv1.data.item.code, 'HV0001');
  assert.equal(hv1.data.item.phone, '0901234567');

  const dup = await call('POST', 'students', { token: admin, body: { fullName: 'Trùng', phone: '0901234567' } });
  assert.equal(dup.status, 409);
  assert.equal(dup.data.duplicate.code, 'HV0001');

  await call('POST', 'students', { token: admin, body: { fullName: 'Trần Thị B', phone: '0901234568', classId: lopA.id } });
  const full = await call('POST', 'students', { token: admin, body: { fullName: 'Lê C', phone: '0901234569', classId: lopA.id } });
  assert.equal(full.status, 409);
  assert.match(full.data.error, /đủ sĩ số/);

  const bad = await call('POST', 'students', { token: admin, body: { fullName: 'X', phone: '123' } });
  assert.equal(bad.status, 400);
});

test('giáo viên chỉ thấy lớp và học viên của mình, không gọi được API admin', async () => {
  const { admin, lopA, lopB } = await setup();
  await call('POST', 'students', { token: admin, body: { fullName: 'HV Lớp A', phone: '0911111111', classId: lopA.id } });
  await call('POST', 'students', { token: admin, body: { fullName: 'HV Lớp B', phone: '0922222222', classId: lopB.id } });

  const kim = await loginAs('kim', 'matkhau1');
  const { data } = await call('GET', 'my-classes', { token: kim });
  assert.deepEqual(data.classes.map(c => c.code), ['SC1-K01']);
  assert.deepEqual(data.classes[0].students.map(s => s.fullName), ['HV Lớp A']);
  assert.equal(data.classes[0].studentCount, 1);

  assert.equal((await call('GET', 'students', { token: kim })).status, 403);
  assert.equal((await call('POST', 'students', { token: kim, body: {} })).status, 403);
});

test('chuyển lớp lưu lịch sử; khóa hoặc đổi mật khẩu giáo viên làm mất phiên cũ', async () => {
  const { admin, gvA, lopA, lopB } = await setup();
  const hv = (await call('POST', 'students', { token: admin, body: { fullName: 'HV', phone: '0933333333', classId: lopA.id } })).data.item;
  const moved = await call('PUT', `students/${hv.id}`, { token: admin, body: { ...hv, classId: lopB.id } });
  assert.equal(moved.data.item.classId, lopB.id);
  assert.equal(moved.data.item.classHistory[0].classId, lopA.id);

  const kim = await loginAs('kim', 'matkhau1');
  assert.equal((await call('GET', 'me', { token: kim })).status, 200);
  await call('PUT', `teachers/${gvA.id}`, { token: admin, body: { ...gvA, password: 'matkhaumoi' } });
  assert.equal((await call('GET', 'me', { token: kim })).status, 401);

  await call('PUT', `teachers/${gvA.id}`, { token: admin, body: { ...gvA, active: false } });
  assert.equal(await loginAs('kim', 'matkhaumoi'), undefined);
});

test('không xóa được lớp còn học viên hoặc giáo viên đang dạy', async () => {
  const { admin, gvA, lopA } = await setup();
  await call('POST', 'students', { token: admin, body: { fullName: 'HV', phone: '0944444444', classId: lopA.id } });
  assert.equal((await call('DELETE', `classes/${lopA.id}`, { token: admin })).status, 409);
  assert.equal((await call('DELETE', `teachers/${gvA.id}`, { token: admin })).status, 409);
});

test('khóa đăng nhập sau 5 lần sai', async () => {
  for (let i = 0; i < 5; i += 1) await call('POST', 'login', { body: { username: 'admin', password: 'sai' } });
  assert.equal((await call('POST', 'login', { body: { username: 'admin', password: 'admin123' } })).status, 429);
});

test('điểm danh: giáo viên lớp mình ghi được buổi học, lớp khác bị chặn', async () => {
  const { admin, lopA, lopB } = await setup();
  assert.equal(lopA.sessionCount, 55);
  const hv = (await call('POST', 'students', { token: admin, body: { fullName: 'HV A', phone: '0955555555', classId: lopA.id } })).data.item;
  const kim = await loginAs('kim', 'matkhau1');

  const saved = await call('PUT', `classes/${lopA.id}/sessions/1`, {
    token: kim,
    body: { date: '2026-09-07', content: 'Bảng chữ cái Hangul: nguyên âm', marks: { [hv.id]: 'co_mat', hv_la: 'co_mat', [hv.id + 'x']: 'muon' } },
  });
  assert.equal(saved.status, 200);
  assert.deepEqual(saved.data.session.marks, { [hv.id]: 'co_mat' });
  assert.equal(saved.data.session.updatedBy, 'Cô Kim');

  const { data } = await call('GET', `classes/${lopA.id}/sessions`, { token: kim });
  assert.equal(data.sessions.length, 1);
  assert.equal(data.sessions[0].content, 'Bảng chữ cái Hangul: nguyên âm');
  assert.deepEqual(data.students.map(s => s.fullName), ['HV A']);

  assert.equal((await call('PUT', `classes/${lopA.id}/sessions/56`, { token: kim, body: { date: '2026-09-07' } })).status, 400);
  assert.equal((await call('PUT', `classes/${lopA.id}/sessions/2`, { token: kim, body: { date: '' } })).status, 400);
  assert.equal((await call('GET', `classes/${lopB.id}/sessions`, { token: kim })).status, 403);
  assert.equal((await call('PUT', `classes/${lopB.id}/sessions/1`, { token: kim, body: { date: '2026-09-07' } })).status, 403);
  assert.equal((await call('GET', `classes/${lopB.id}/sessions`, { token: admin })).status, 200);

  // Học viên chuyển lớp vẫn giữ trong sổ điểm danh lớp cũ.
  await call('PUT', `students/${hv.id}`, { token: admin, body: { ...hv, classId: lopB.id } });
  const after = await call('GET', `classes/${lopA.id}/sessions`, { token: kim });
  assert.equal(after.data.students[0].inClass, false);
});

test('API chạy được dưới /hoc-vu/api và qua đường dẫn Netlify Function; admin dùng tài khoản website', async () => {
  const siteCtx = { ...ctx, env: { AUTH_SECRET: 'x' }, verifyAdmin: (u, p) => u === 'SeiuAdmin' && p === 'web-pass' };
  const post = (url, body) => handleApi(new Request(url, { method: 'POST', body: JSON.stringify(body) }), siteCtx);
  const viaSubpath = await post('https://seiuhanquochoc.com/hoc-vu/api/login', { username: 'SeiuAdmin', password: 'web-pass' });
  assert.equal(viaSubpath.status, 200);
  const { token } = await viaSubpath.json();
  const viaFunction = await handleApi(new Request('https://x/.netlify/functions/hoc-vu-api/me', {
    headers: { authorization: `Bearer ${token}` },
  }), siteCtx);
  assert.equal((await viaFunction.json()).user.role, 'admin');
  assert.equal((await post('https://x/hoc-vu/api/login', { username: 'SeiuAdmin', password: 'sai' })).status, 401);
});

test('bảng tổng thể: tính đã đóng, còn nợ, số buổi vắng; giáo viên không thấy học phí', async () => {
  const { admin, lopA } = await setup();
  const hv = (await call('POST', 'students', { token: admin, body: {
    fullName: 'HV Nợ', phone: '0966666666', classId: lopA.id, goal: 'Du học', tuitionFee: '7.000.000', discount: 500000,
    payments: [{ date: '2026-09-01', amount: '3.000.000' }, { date: '2026-09-20', amount: 1000000, note: 'lần 2' }],
  } })).data.item;
  await call('PUT', `classes/${lopA.id}/sessions/1`, { token: admin, body: { date: '2026-09-07', marks: { [hv.id]: 'khong_phep' } } });
  await call('PUT', `classes/${lopA.id}/sessions/2`, { token: admin, body: { date: '2026-09-09', marks: { [hv.id]: 'muon' } } });

  const { status, data } = await call('GET', 'overview', { token: admin });
  assert.equal(status, 200);
  const row = data.students.find(s => s.id === hv.id);
  assert.deepEqual(row.stats, { attended: 1, absent: 1, late: 1, paid: 4000000, owed: 2500000, lastPaymentDate: '2026-09-20' });
  assert.equal(data.classes.find(c => c.id === lopA.id).sessionsDone, 2);

  const kim = await loginAs('kim', 'matkhau1');
  assert.equal((await call('GET', 'overview', { token: kim })).status, 403);
  const seen = (await call('GET', 'my-classes', { token: kim })).data.classes[0].students[0];
  assert.equal(seen.goal, 'Du học');
  for (const key of ['tuitionFee', 'payments', 'discount', 'busFee']) assert.equal(key in seen, false);
});

test('nhập từ Excel: tạo lớp theo tên, bỏ qua trùng, giữ số báo danh', async () => {
  const { admin } = await setup();
  const res = await call('POST', 'import/students', { token: admin, body: { rows: [
    { code: '370', fullName: 'LÊ TÚ HUYỀN', phone: '0354959822', birthYear: 2009, className: 'KHOÁ 28', paid: '5.200.000,00', owed: '800.000', gender: 'nu' },
    { code: '371', fullName: 'Người Thứ Hai', phone: '', className: 'Khóa 28' },
    { code: '370', fullName: 'Trùng mã', className: 'KHOÁ 29' },
    { fullName: '' },
  ] } });
  assert.equal(res.status, 200);
  assert.equal(res.data.created, 2);
  assert.deepEqual(res.data.classesCreated, ['KHÓA 28']);
  assert.equal(res.data.skipped.length, 2);
  const { data } = await call('GET', 'overview', { token: admin });
  const huyen = data.students.find(s => s.code === '370');
  assert.equal(huyen.stats.paid, 5200000);
  assert.equal(huyen.stats.owed, 800000);
  assert.equal(huyen.birthYear, 2009);
  // Mã hiện có đều là số nên mã tự sinh tiếp tục dạng số.
  const next = await call('POST', 'students', { token: admin, body: { fullName: 'HV mới' } });
  assert.equal(next.data.item.code, '372');
});

test('lớp học: chọn thứ và giờ thì tự tạo lịch học', async () => {
  const { admin } = await setup();
  const { data } = await call('POST', 'classes', { token: admin, body: {
    code: 'K37', level: 'Sơ cấp 1', capacity: 20, days: [1, 3, 5], startTime: '18:00', endTime: '20:00', monitor: 'Hân',
  } });
  assert.equal(data.item.schedule, 'T2-T4-T6, 18:00–20:00');
  assert.equal(data.item.monitor, 'Hân');
  assert.equal((await call('POST', 'classes', { token: admin, body: { code: 'K38', level: 'x', capacity: 5, startTime: '20:00', endTime: '18:00' } })).status, 400);
});

test('nhập lại bảng Excel: cập nhật theo số báo danh, giữ học phí đã ghi trong app', async () => {
  const { admin } = await setup();
  await call('POST', 'import/students', { token: admin, body: { rows: [
    { code: '400', fullName: 'LÊ NGỌC THẢO', phone: '0790977179', className: 'KHOÁ 31', paid: '7.000.000,00', owed: '800.000' },
    { code: '401', fullName: 'LÊ CÔNG TAO', className: 'KHOÁ 31', paid: '7.000.000,00', owed: '800.000' },
  ] } });
  let { data } = await call('GET', 'overview', { token: admin });
  const tao = data.students.find(s => s.code === '401');
  // Trong app đã ghi thêm 1 lần đóng tiền cho Tao.
  await call('PUT', `students/${tao.id}`, { token: admin, body: {
    ...tao, payments: [...tao.payments, { date: '2026-10-01', amount: 800000, note: 'Lần 2' }],
  } });

  const again = await call('POST', 'import/students', { token: admin, body: { updateExisting: true, rows: [
    { code: '400', fullName: 'LÊ NGỌC THẢO', phone: '', address: 'VỊ THANH', className: 'KHOÁ 32', paid: '7.800.000', owed: '0' },
    { code: '401', fullName: 'LÊ CÔNG TAO', className: 'KHOÁ 31', paid: '9.000.000', owed: '0' },
    { code: '', fullName: 'Người mới', className: 'KHOÁ 31' },
  ] } });
  assert.equal(again.data.created, 1);
  assert.equal(again.data.updated, 2);
  assert.deepEqual(again.data.feeKept, ['401 LÊ CÔNG TAO']);

  ({ data } = await call('GET', 'overview', { token: admin }));
  const thao = data.students.find(s => s.code === '400');
  assert.equal(thao.phone, '0790977179'); // ô SĐT trống → giữ số cũ
  assert.equal(thao.address, 'VỊ THANH');
  assert.equal(thao.stats.paid, 7800000);
  assert.equal(thao.stats.owed, 0);
  assert.equal(data.classes.find(c => c.id === thao.classId).code, 'KHÓA 32');
  assert.equal(thao.classHistory.length, 1);
  const tao2 = data.students.find(s => s.code === '401');
  assert.equal(tao2.stats.paid, 7800000); // giữ các lần đóng ghi trong app

  const noUpdate = await call('POST', 'import/students', { token: admin, body: { rows: [{ code: '400', fullName: 'X' }] } });
  assert.equal(noUpdate.data.skipped.length, 1);
});

test('phân quyền: nhân viên, kế toán, giáo viên chỉ làm được việc của mình', async () => {
  const { admin, gvA, lopA } = await setup();
  await call('POST', 'teachers', { token: admin, body: { fullName: 'NV Lan', username: 'lan', password: '123456', role: 'staff' } });
  await call('POST', 'teachers', { token: admin, body: { fullName: 'KT Mai', username: 'mai', password: '123456', role: 'accountant' } });
  const staff = await loginAs('lan', '123456');
  const acct = await loginAs('mai', '123456');
  const kim = await loginAs('kim', 'matkhau1');
  assert.equal((await call('GET', 'me', { token: staff })).data.user.role, 'staff');

  // Nhân viên: thêm học viên được, nhưng không ghi/không thấy học phí.
  const hv = await call('POST', 'students', { token: staff, body: {
    fullName: 'HV Nhân viên nhập', phone: '0977777777', classId: lopA.id, tuitionFee: 5000000,
    payments: [{ date: '2026-10-01', amount: 5000000 }],
  } });
  assert.equal(hv.status, 201);
  assert.equal('tuitionFee' in hv.data.item, false);
  const ovStaff = (await call('GET', 'overview', { token: staff })).data;
  const rowStaff = ovStaff.students.find(s => s.id === hv.data.item.id);
  assert.equal('payments' in rowStaff, false);
  assert.equal('owed' in rowStaff.stats, false);
  assert.equal((await call('POST', 'classes', { token: staff, body: { code: 'NV-1', level: 'Sơ cấp 1', capacity: 10 } })).status, 201);
  assert.equal((await call('GET', `classes/${lopA.id}/sessions`, { token: staff })).status, 200);
  assert.equal((await call('PUT', `classes/${lopA.id}/sessions/1`, { token: staff, body: { date: '2026-10-01' } })).status, 403);
  assert.equal((await call('GET', 'teachers', { token: staff })).status, 403);
  assert.equal((await call('POST', 'teachers', { token: staff, body: {} })).status, 403);
  assert.equal((await call('PUT', `students/${hv.data.item.id}/fees`, { token: staff, body: { tuitionFee: 1 } })).status, 403);

  // Kế toán: ghi học phí được, không sửa hồ sơ, không tạo lớp, không xem sổ điểm danh.
  const fee = await call('PUT', `students/${hv.data.item.id}/fees`, { token: acct, body: {
    tuitionFee: '7.000.000', payments: [{ date: '2026-10-01', amount: '3.000.000', note: 'Lần 1' }],
  } });
  assert.equal(fee.status, 200);
  const rowAcct = (await call('GET', 'overview', { token: acct })).data.students.find(s => s.id === hv.data.item.id);
  assert.equal(rowAcct.stats.owed, 4000000);
  assert.equal(rowAcct.fullName, 'HV Nhân viên nhập');
  assert.equal((await call('PUT', `students/${hv.data.item.id}`, { token: acct, body: { fullName: 'Đổi tên' } })).status, 403);
  assert.equal((await call('POST', 'classes', { token: acct, body: { code: 'KT-1', level: 'x', capacity: 1 } })).status, 403);
  assert.equal((await call('GET', `classes/${lopA.id}/sessions`, { token: acct })).status, 403);

  // Nhân viên sửa hồ sơ không làm mất học phí kế toán đã ghi.
  const full = (await call('GET', 'overview', { token: admin })).data.students.find(s => s.id === hv.data.item.id);
  await call('PUT', `students/${hv.data.item.id}`, { token: staff, body: { ...stripForTest(full), address: 'Vị Thanh', tuitionFee: 0, payments: [] } });
  const after = (await call('GET', 'overview', { token: admin })).data.students.find(s => s.id === hv.data.item.id);
  assert.equal(after.address, 'Vị Thanh');
  assert.equal(after.stats.paid, 3000000);

  // Giáo viên không vào được bảng tổng thể; không gán lớp cho tài khoản không phải giáo viên.
  assert.equal((await call('GET', 'overview', { token: kim })).status, 403);
  const staffAcc = (await call('GET', 'teachers', { token: admin })).data.items.find(t => t.username === 'lan');
  assert.equal((await call('PUT', `classes/${lopA.id}`, { token: admin, body: { ...lopA, teacherId: staffAcc.id } })).status, 400);
  // Đổi vai trò giáo viên đang dạy lớp thì bị chặn.
  assert.equal((await call('PUT', `teachers/${gvA.id}`, { token: admin, body: { ...gvA, role: 'staff' } })).status, 409);
});

const stripForTest = ({ stats, ...rest }) => rest;
