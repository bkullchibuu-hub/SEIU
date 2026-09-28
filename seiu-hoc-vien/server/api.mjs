// Toàn bộ API của app. Nhận Request chuẩn web, trả về Response,
// dùng chung cho Netlify Function và server chạy local.
import crypto from 'node:crypto';
import {
  clearFailedLogins, createToken, hashPassword, isLockedOut, readToken,
  recordFailedLogin, safeEqualText, verifyPassword,
} from './auth.mjs';

export const STUDENT_STATUSES = ['dang_hoc', 'bao_luu', 'hoan_thanh', 'da_nghi'];
export const CLASS_STATUSES = ['dang_mo', 'da_ket_thuc'];
export const ATTENDANCE_MARKS = ['co_mat', 'muon', 'co_phep', 'khong_phep'];
export const DEFAULT_SESSION_COUNT = 55;

class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

const text = (value, max = 240) => String(value ?? '').trim().slice(0, max);
const digits = value => String(value ?? '').replace(/\D/g, '');
const now = () => new Date().toISOString();
const newId = prefix => `${prefix}_${crypto.randomUUID()}`;

const isDate = value => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value);
const requireDate = (value, label) => {
  const v = text(value, 10);
  if (!isDate(v)) throw new HttpError(400, `${label} không hợp lệ.`);
  return v;
};
const requireText = (value, label, max) => {
  const v = text(value, max);
  if (!v) throw new HttpError(400, `Vui lòng nhập ${label}.`);
  return v;
};
const requirePhone = (value, { optional = false } = {}) => {
  const v = digits(value);
  if (!v && optional) return '';
  if (!/^0\d{9,10}$/.test(v)) throw new HttpError(400, 'Số điện thoại phải có 10–11 chữ số và bắt đầu bằng 0.');
  return v;
};
const oneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

const readBody = async request => {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, 'Dữ liệu gửi lên không hợp lệ.');
  }
};

// ---------- Truy cập dữ liệu ----------
const listAll = (store, kind) => store.list(kind);
const getOne = async (store, kind, id, label) => {
  const item = /^[\w-]+$/.test(id) ? await store.get(`${kind}/${id}`) : null;
  if (!item) throw new HttpError(404, `Không tìm thấy ${label}.`);
  return item;
};
const save = (store, kind, item) => store.set(`${kind}/${item.id}`, item);

const publicTeacher = ({ passwordHash, passwordVersion, ...rest }) => rest;

// ---------- Xác thực ----------
const authenticate = async (request, ctx) => {
  const header = request.headers.get('authorization') || '';
  const claims = await readToken(ctx.store, ctx.env, header.replace(/^Bearer\s+/i, ''));
  if (!claims) throw new HttpError(401, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
  if (claims.role === 'admin') return { role: 'admin', id: 'admin', fullName: 'Quản trị viên' };
  const teacher = await ctx.store.get(`teachers/${claims.sub}`);
  if (!teacher || !teacher.active || teacher.passwordVersion !== claims.pwv) {
    throw new HttpError(401, 'Tài khoản không còn hiệu lực, vui lòng đăng nhập lại.');
  }
  return { role: 'teacher', id: teacher.id, fullName: teacher.fullName };
};

const login = async (request, ctx) => {
  const body = await readBody(request);
  const username = text(body.username, 80).toLowerCase();
  const password = String(body.password ?? '');
  if (!username || !password) throw new HttpError(400, 'Vui lòng nhập tên đăng nhập và mật khẩu.');
  if (await isLockedOut(ctx.store, username)) {
    throw new HttpError(429, 'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 10 phút.');
  }

  const adminUser = text(ctx.env.ADMIN_USERNAME, 80).toLowerCase();
  if (adminUser && safeEqualText(username, adminUser)) {
    if (ctx.env.ADMIN_PASSWORD && safeEqualText(password, ctx.env.ADMIN_PASSWORD)) {
      await clearFailedLogins(ctx.store, username);
      const token = await createToken(ctx.store, ctx.env, { sub: 'admin', role: 'admin' });
      return json({ token, user: { role: 'admin', id: 'admin', fullName: 'Quản trị viên' } });
    }
  } else {
    const teachers = await listAll(ctx.store, 'teachers');
    const teacher = teachers.find(t => t.username === username);
    if (teacher?.active && verifyPassword(password, teacher.passwordHash)) {
      await clearFailedLogins(ctx.store, username);
      const token = await createToken(ctx.store, ctx.env, {
        sub: teacher.id, role: 'teacher', pwv: teacher.passwordVersion,
      });
      return json({ token, user: { role: 'teacher', id: teacher.id, fullName: teacher.fullName } });
    }
  }
  await recordFailedLogin(ctx.store, username);
  throw new HttpError(401, 'Sai tên đăng nhập hoặc mật khẩu.');
};

// ---------- Giáo viên ----------
const teacherFromBody = async (body, ctx, existing) => {
  const username = text(body.username, 40).toLowerCase();
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
    throw new HttpError(400, 'Tên đăng nhập chỉ gồm chữ không dấu, số, dấu . _ - (3–40 ký tự).');
  }
  if (safeEqualText(username, text(ctx.env.ADMIN_USERNAME, 80).toLowerCase())) {
    throw new HttpError(409, 'Tên đăng nhập này đã được dùng.');
  }
  const teachers = await listAll(ctx.store, 'teachers');
  if (teachers.some(t => t.username === username && t.id !== existing?.id)) {
    throw new HttpError(409, 'Tên đăng nhập này đã được dùng.');
  }

  const password = String(body.password ?? '');
  if (!existing && password.length < 6) throw new HttpError(400, 'Mật khẩu phải có ít nhất 6 ký tự.');
  if (existing && password && password.length < 6) throw new HttpError(400, 'Mật khẩu mới phải có ít nhất 6 ký tự.');

  const teacher = {
    ...existing,
    id: existing?.id ?? newId('gv'),
    fullName: requireText(body.fullName, 'họ tên giáo viên', 120),
    phone: requirePhone(body.phone, { optional: true }),
    email: text(body.email, 160),
    username,
    active: body.active === undefined ? existing?.active ?? true : Boolean(body.active),
    note: text(body.note, 1000),
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  };
  if (password) {
    teacher.passwordHash = hashPassword(password);
    teacher.passwordVersion = crypto.randomUUID();
  }
  return teacher;
};

// ---------- Lớp học ----------
const classFromBody = async (body, ctx, existing) => {
  const code = requireText(body.code, 'mã lớp', 40).toUpperCase();
  const classes = await listAll(ctx.store, 'classes');
  if (classes.some(c => c.code === code && c.id !== existing?.id)) {
    throw new HttpError(409, `Mã lớp ${code} đã tồn tại.`);
  }
  const teacherId = text(body.teacherId, 80);
  if (teacherId) await getOne(ctx.store, 'teachers', teacherId, 'giáo viên');
  const capacity = Number.parseInt(body.capacity, 10);
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 200) {
    throw new HttpError(400, 'Sĩ số tối đa phải là số từ 1 đến 200.');
  }
  const sessionCount = body.sessionCount === undefined || body.sessionCount === ''
    ? existing?.sessionCount ?? DEFAULT_SESSION_COUNT
    : Number.parseInt(body.sessionCount, 10);
  if (!Number.isInteger(sessionCount) || sessionCount < 1 || sessionCount > 200) {
    throw new HttpError(400, 'Số buổi học phải là số từ 1 đến 200.');
  }
  const startDate = requireDate(body.startDate, 'Ngày khai giảng');
  const endDate = requireDate(body.endDate, 'Ngày kết thúc');
  if (startDate && endDate && endDate < startDate) throw new HttpError(400, 'Ngày kết thúc phải sau ngày khai giảng.');

  return {
    ...existing,
    id: existing?.id ?? newId('lop'),
    code,
    name: text(body.name, 120),
    level: requireText(body.level, 'trình độ', 80),
    branch: text(body.branch, 120),
    schedule: text(body.schedule, 200),
    room: text(body.room, 80),
    startDate,
    endDate,
    capacity,
    sessionCount,
    teacherId,
    status: oneOf(body.status, CLASS_STATUSES, existing?.status ?? 'dang_mo'),
    note: text(body.note, 1000),
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  };
};

const withCounts = (classes, students) => classes.map(c => ({
  ...c,
  studentCount: students.filter(s => s.classId === c.id && s.status === 'dang_hoc').length,
}));

// ---------- Học viên ----------
const nextStudentCode = students => {
  const max = students.reduce((acc, s) => Math.max(acc, Number.parseInt(String(s.code).replace(/\D/g, ''), 10) || 0), 0);
  return `HV${String(max + 1).padStart(4, '0')}`;
};

const studentFromBody = async (body, ctx, existing) => {
  const students = await listAll(ctx.store, 'students');
  const phone = requirePhone(body.phone);
  const duplicate = students.find(s => s.phone === phone && s.id !== existing?.id);
  if (duplicate) {
    throw new HttpError(409, `Số điện thoại này đã có trong hồ sơ học viên ${duplicate.code} – ${duplicate.fullName}.`, {
      duplicate: { id: duplicate.id, code: duplicate.code, fullName: duplicate.fullName },
    });
  }

  const status = oneOf(body.status, STUDENT_STATUSES, existing?.status ?? 'dang_hoc');
  const classId = text(body.classId, 80);
  if (classId) {
    const klass = await getOne(ctx.store, 'classes', classId, 'lớp học');
    const movingIn = classId !== existing?.classId || (status === 'dang_hoc' && existing?.status !== 'dang_hoc');
    if (movingIn && status === 'dang_hoc') {
      const count = students.filter(s => s.classId === classId && s.status === 'dang_hoc' && s.id !== existing?.id).length;
      if (count >= klass.capacity) {
        throw new HttpError(409, `Lớp ${klass.code} đã đủ sĩ số (${count}/${klass.capacity}).`);
      }
    }
  }

  // Khi chuyển lớp thì lưu lại lớp cũ vào lịch sử.
  const classHistory = [...(existing?.classHistory ?? [])];
  if (existing?.classId && existing.classId !== classId) {
    classHistory.push({ classId: existing.classId, from: existing.enrolledAt, to: now().slice(0, 10) });
  }
  const enrolledAt = existing && existing.classId === classId
    ? requireDate(body.enrolledAt ?? existing.enrolledAt, 'Ngày vào lớp')
    : requireDate(body.enrolledAt || (classId ? now().slice(0, 10) : ''), 'Ngày vào lớp');

  return {
    ...existing,
    id: existing?.id ?? newId('hv'),
    code: existing?.code ?? nextStudentCode(students),
    fullName: requireText(body.fullName, 'họ tên học viên', 120),
    phone,
    email: text(body.email, 160),
    dateOfBirth: requireDate(body.dateOfBirth, 'Ngày sinh'),
    gender: oneOf(body.gender, ['nam', 'nu', ''], ''),
    address: text(body.address, 240),
    level: text(body.level, 80),
    classId,
    enrolledAt,
    classHistory,
    status,
    note: text(body.note, 1600),
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  };
};

// Thông tin giáo viên được xem về học viên trong lớp mình.
const studentForTeacher = s => ({
  id: s.id, code: s.code, fullName: s.fullName, phone: s.phone, email: s.email,
  dateOfBirth: s.dateOfBirth, gender: s.gender, level: s.level, status: s.status,
  enrolledAt: s.enrolledAt, note: s.note,
});

// ---------- Điểm danh & nội dung buổi học ----------
// Mỗi buổi lưu ở key sessions/<classId>/<số buổi>.
const sessionKey = (classId, number) => `sessions/${classId}/${number}`;

const studentsOfClass = (students, classId) => students.filter(
  s => s.classId === classId || (s.classHistory ?? []).some(h => h.classId === classId),
);

const sessionsRoute = async (request, ctx, user, classId, numberParam) => {
  const { store } = ctx;
  const klass = await getOne(store, 'classes', classId, 'lớp học');
  if (user.role !== 'admin' && klass.teacherId !== user.id) {
    throw new HttpError(403, 'Bạn chỉ được xem và điểm danh lớp mình phụ trách.');
  }
  const method = request.method;
  const students = studentsOfClass(await listAll(store, 'students'), classId);

  if (numberParam === undefined) {
    if (method !== 'GET') throw new HttpError(405, 'Phương thức không được hỗ trợ.');
    const sessions = await store.list(`sessions/${classId}`);
    return json({
      class: withCounts([klass], students)[0],
      students: students
        .sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'))
        .map(s => ({ ...studentForTeacher(s), inClass: s.classId === classId })),
      sessions: sessions.sort((a, b) => a.number - b.number),
    });
  }

  const number = Number(numberParam);
  const maxSessions = klass.sessionCount ?? DEFAULT_SESSION_COUNT;
  if (!Number.isInteger(number) || number < 1 || number > maxSessions) {
    throw new HttpError(400, `Số buổi phải từ 1 đến ${maxSessions}.`);
  }

  if (method === 'DELETE') {
    await store.delete(sessionKey(classId, number));
    return json({ ok: true });
  }
  if (method !== 'PUT') throw new HttpError(405, 'Phương thức không được hỗ trợ.');

  const body = await readBody(request);
  const allowed = new Set(students.map(s => s.id));
  const marks = {};
  for (const [studentId, mark] of Object.entries(body.marks ?? {})) {
    if (allowed.has(studentId) && ATTENDANCE_MARKS.includes(mark)) marks[studentId] = mark;
  }
  const date = requireDate(body.date, 'Ngày học');
  if (!date) throw new HttpError(400, 'Vui lòng chọn ngày học.');
  const existing = await store.get(sessionKey(classId, number));
  const session = {
    classId,
    number,
    date,
    content: text(body.content, 4000),
    homework: text(body.homework, 2000),
    note: text(body.note, 1000),
    marks,
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
    updatedBy: user.fullName,
  };
  await store.set(sessionKey(classId, number), session);
  return json({ session });
};

// ---------- Router ----------
const requireAdmin = user => {
  if (user.role !== 'admin') throw new HttpError(403, 'Bạn không có quyền thực hiện thao tác này.');
};

const crud = {
  teachers: { label: 'giáo viên', build: teacherFromBody, output: publicTeacher },
  classes: { label: 'lớp học', build: classFromBody, output: x => x },
  students: { label: 'học viên', build: studentFromBody, output: x => x },
};

const route = async (request, ctx) => {
  const url = new URL(request.url);
  const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  const [resource, id] = parts;
  const method = request.method;

  if (resource === 'login' && method === 'POST') return login(request, ctx);

  const user = await authenticate(request, ctx);

  if (resource === 'me' && method === 'GET') return json({ user });

  if (resource === 'classes' && id && parts[2] === 'sessions' && parts.length <= 4) {
    return sessionsRoute(request, ctx, user, id, parts[3]);
  }

  if (resource === 'my-classes' && method === 'GET') {
    if (user.role !== 'teacher') throw new HttpError(403, 'Chỉ dành cho tài khoản giáo viên.');
    const [classes, students] = await Promise.all([listAll(ctx.store, 'classes'), listAll(ctx.store, 'students')]);
    const mine = withCounts(classes.filter(c => c.teacherId === user.id), students)
      .sort((a, b) => a.code.localeCompare(b.code))
      .map(c => ({
        ...c,
        students: students
          .filter(s => s.classId === c.id)
          .sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'))
          .map(studentForTeacher),
      }));
    return json({ classes: mine });
  }

  const config = crud[resource];
  if (!config) throw new HttpError(404, 'Không tìm thấy đường dẫn.');
  requireAdmin(user);
  const { store } = ctx;

  if (!id && method === 'GET') {
    const items = await listAll(store, resource);
    if (resource === 'classes') {
      const students = await listAll(store, 'students');
      return json({ items: withCounts(items, students).sort((a, b) => a.code.localeCompare(b.code)) });
    }
    items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return json({ items: items.map(config.output) });
  }

  if (!id && method === 'POST') {
    const item = await config.build(await readBody(request), ctx, null);
    await save(store, resource, item);
    return json({ item: config.output(item) }, 201);
  }

  if (!id) throw new HttpError(405, 'Phương thức không được hỗ trợ.');
  const existing = await getOne(store, resource, id, config.label);

  if (method === 'GET') return json({ item: config.output(existing) });

  if (method === 'PUT') {
    const item = await config.build(await readBody(request), ctx, existing);
    await save(store, resource, item);
    return json({ item: config.output(item) });
  }

  if (method === 'DELETE') {
    if (resource === 'teachers') {
      const classes = await listAll(store, 'classes');
      const taught = classes.filter(c => c.teacherId === id);
      if (taught.length) {
        throw new HttpError(409, `Giáo viên đang phụ trách lớp ${taught.map(c => c.code).join(', ')}. Hãy đổi giáo viên cho lớp hoặc khóa tài khoản thay vì xóa.`);
      }
    }
    if (resource === 'classes') {
      const students = await listAll(store, 'students');
      const inClass = students.filter(s => s.classId === id);
      if (inClass.length) {
        throw new HttpError(409, `Lớp còn ${inClass.length} học viên. Hãy chuyển học viên sang lớp khác trước khi xóa.`);
      }
      const sessions = await store.list(`sessions/${id}`);
      await Promise.all(sessions.map(x => store.delete(sessionKey(id, x.number))));
    }
    await store.delete(`${resource}/${id}`);
    return json({ ok: true });
  }

  throw new HttpError(405, 'Phương thức không được hỗ trợ.');
};

export const handleApi = async (request, ctx) => {
  try {
    return await route(request, ctx);
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message, ...error.extra }, error.status);
    console.error(error);
    return json({ error: 'Có lỗi xảy ra trên máy chủ, vui lòng thử lại.' }, 500);
  }
};
