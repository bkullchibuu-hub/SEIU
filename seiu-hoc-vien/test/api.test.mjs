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
