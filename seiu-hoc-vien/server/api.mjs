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
// Tiền VND: nhận số hoặc chuỗi kiểu "5.200.000,00", "-800.000", "3000000".
export const parseMoney = value => {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : 0;
  let v = String(value ?? '').replace(/[\s₫đvndVND]/g, '');
  if (!v) return 0;
  if (/,\d{1,2}$/.test(v)) v = v.replace(/\./g, '').replace(',', '.');
  else v = v.replace(/[.,]/g, '');
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(-1e11, Math.min(1e11, Math.round(n))) : 0;
};
const money = value => Math.max(0, parseMoney(value));
const timeOrEmpty = value => (/^([01]\d|2[0-3]):[0-5]\d$/.test(String(value ?? '')) ? String(value) : '');
export const DAY_LABELS = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 7: 'CN' };
const normKey = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd')
  .toUpperCase().replace(/\s+/g, ' ').trim();

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

const publicTeacher = ({ passwordHash, passwordVersion, ...rest }) => ({ ...rest, role: rest.role ?? 'teacher' });

// ---------- Vai trò & quyền ----------
// Tài khoản lưu ở teachers/<id> (tên cũ), mỗi tài khoản có một vai trò.
export const ACCOUNT_ROLES = ['teacher', 'staff', 'accountant'];
const ROLE_LABELS = { teacher: 'giáo viên', staff: 'nhân viên', accountant: 'kế toán' };
const PERMISSIONS = {
  staff: ['overview', 'students:read', 'students:write', 'classes:read', 'classes:write', 'sessions:read', 'import'],
  accountant: ['overview', 'students:read', 'fees', 'classes:read'],
  teacher: [],
};
const can = (user, perm) => user.role === 'admin' || (PERMISSIONS[user.role] ?? []).includes(perm);
const requirePerm = (user, perm) => {
  if (!can(user, perm)) throw new HttpError(403, 'Tài khoản của bạn không có quyền thực hiện việc này.');
};

// Ẩn học phí / công nợ với tài khoản không có quyền xem tiền.
const FEE_KEYS = ['tuitionFee', 'discount', 'payments', 'busFee'];
const stripFees = student => {
  const out = { ...student };
  for (const key of FEE_KEYS) delete out[key];
  if (out.stats) out.stats = { attended: out.stats.attended, absent: out.stats.absent, late: out.stats.late };
  return out;
};

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
  return { role: teacher.role ?? 'teacher', id: teacher.id, fullName: teacher.fullName };
};

// Tài khoản admin: dùng ctx.verifyAdmin nếu được cung cấp (VD: tài khoản quản trị website SEIU),
// nếu không thì so với biến môi trường ADMIN_USERNAME / ADMIN_PASSWORD.
const isAdminLogin = async (ctx, rawUsername, password) => {
  if (ctx.verifyAdmin) return Boolean(await ctx.verifyAdmin(rawUsername, password));
  const adminUser = text(ctx.env.ADMIN_USERNAME, 80).toLowerCase();
  return Boolean(adminUser && ctx.env.ADMIN_PASSWORD
    && safeEqualText(rawUsername.toLowerCase(), adminUser)
    && safeEqualText(password, ctx.env.ADMIN_PASSWORD));
};

const login = async (request, ctx) => {
  const body = await readBody(request);
  const rawUsername = text(body.username, 80);
  const username = rawUsername.toLowerCase();
  const password = String(body.password ?? '');
  if (!username || !password) throw new HttpError(400, 'Vui lòng nhập tên đăng nhập và mật khẩu.');
  if (await isLockedOut(ctx.store, username)) {
    throw new HttpError(429, 'Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 10 phút.');
  }

  if (await isAdminLogin(ctx, rawUsername, password)) {
    await clearFailedLogins(ctx.store, username);
    const token = await createToken(ctx.store, ctx.env, { sub: 'admin', role: 'admin' });
    return json({ token, user: { role: 'admin', id: 'admin', fullName: 'Quản trị viên' } });
  }

  const teachers = await listAll(ctx.store, 'teachers');
  const teacher = teachers.find(t => t.username === username);
  if (teacher?.active && verifyPassword(password, teacher.passwordHash)) {
    await clearFailedLogins(ctx.store, username);
    const token = await createToken(ctx.store, ctx.env, {
      sub: teacher.id, role: teacher.role ?? 'teacher', pwv: teacher.passwordVersion,
    });
    return json({ token, user: { role: teacher.role ?? 'teacher', id: teacher.id, fullName: teacher.fullName } });
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

  const role = oneOf(body.role, ACCOUNT_ROLES, existing?.role ?? 'teacher');
  if (existing && role !== 'teacher' && (existing.role ?? 'teacher') === 'teacher') {
    const taught = (await listAll(ctx.store, 'classes')).filter(c => c.teacherId === existing.id);
    if (taught.length) {
      throw new HttpError(409, `Tài khoản đang phụ trách lớp ${taught.map(c => c.code).join(', ')}. Hãy đổi giáo viên cho các lớp này trước khi đổi vai trò.`);
    }
  }
  const teacher = {
    ...existing,
    id: existing?.id ?? newId('gv'),
    role,
    fullName: requireText(body.fullName, 'họ tên', 120),
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
  if (teacherId) {
    const t = await getOne(ctx.store, 'teachers', teacherId, 'giáo viên');
    if ((t.role ?? 'teacher') !== 'teacher') throw new HttpError(400, `${t.fullName} là tài khoản ${ROLE_LABELS[t.role]}, không phải giáo viên.`);
  }
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
  const days = [...new Set((Array.isArray(body.days) ? body.days : []).map(Number))]
    .filter(d => d >= 1 && d <= 7).sort((a, b) => a - b);
  const startTime = timeOrEmpty(body.startTime);
  const endTime = timeOrEmpty(body.endTime);
  if (startTime && endTime && endTime <= startTime) throw new HttpError(400, 'Giờ kết thúc phải sau giờ bắt đầu.');
  const autoSchedule = days.length
    ? `${days.map(d => DAY_LABELS[d]).join('-')}${startTime ? `, ${startTime}${endTime ? `–${endTime}` : ''}` : ''}`
    : '';
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
    schedule: text(body.schedule, 200) || autoSchedule,
    days,
    startTime,
    endTime,
    monitor: text(body.monitor, 120),
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
// Mã học viên tự sinh: nếu mã hiện có đều là số (VD số báo danh 370, 371…) thì tiếp tục dạng số,
// nếu không thì dạng HV0001.
const nextStudentCode = students => {
  const codes = students.map(x => String(x.code ?? ''));
  const max = codes.reduce((acc, c) => Math.max(acc, Number.parseInt(c.replace(/\D/g, ''), 10) || 0), 0);
  if (codes.length && codes.every(c => /^\d+$/.test(c))) return String(max + 1);
  return `HV${String(max + 1).padStart(4, '0')}`;
};

const feeFields = body => ({
  tuitionFee: money(body.tuitionFee),
  discount: money(body.discount),
  payments: paymentsFromBody(body.payments),
  busFee: money(body.busFee),
});

const paymentsFromBody = list => (Array.isArray(list) ? list : []).slice(0, 60).map(p => ({
  id: /^[\w-]{1,60}$/.test(String(p?.id ?? '')) ? String(p.id) : newId('tt'),
  date: requireDate(p?.date ?? '', 'Ngày đóng tiền'),
  amount: money(p?.amount),
  note: text(p?.note, 200),
})).filter(p => p.amount > 0);

const studentFromBody = async (body, ctx, existing) => {
  const students = await listAll(ctx.store, 'students');
  const phone = requirePhone(body.phone, { optional: true });
  const code = text(body.code, 20).toUpperCase() || existing?.code || nextStudentCode(students);
  const sameCode = students.find(x => String(x.code).toUpperCase() === code && x.id !== existing?.id);
  if (sameCode) throw new HttpError(409, `Mã học viên ${code} đã được dùng cho ${sameCode.fullName}.`);
  const birthYear = body.birthYear === '' || body.birthYear === undefined ? '' : Number.parseInt(body.birthYear, 10);
  if (birthYear !== '' && !(birthYear >= 1940 && birthYear <= 2030)) throw new HttpError(400, 'Năm sinh không hợp lệ.');
  const duplicate = phone && students.find(s => s.phone === phone && s.id !== existing?.id);
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
    code,
    fullName: requireText(body.fullName, 'họ tên học viên', 120),
    phone,
    email: text(body.email, 160),
    dateOfBirth: requireDate(body.dateOfBirth, 'Ngày sinh'),
    birthYear: birthYear === '' && body.dateOfBirth ? Number(String(body.dateOfBirth).slice(0, 4)) : birthYear,
    goal: text(body.goal, 80),
    ...(can(ctx.user, 'fees') ? feeFields(body) : {
      tuitionFee: existing?.tuitionFee ?? 0,
      discount: existing?.discount ?? 0,
      payments: existing?.payments ?? [],
      busFee: existing?.busFee ?? 0,
    }),
    topikExam: text(body.topikExam, 160),
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
// Không gồm học phí / công nợ: những thông tin này chỉ admin xem được.
const studentForTeacher = s => ({
  id: s.id, code: s.code, fullName: s.fullName, phone: s.phone, email: s.email,
  dateOfBirth: s.dateOfBirth, birthYear: s.birthYear ?? '', goal: s.goal ?? '',
  gender: s.gender, level: s.level, status: s.status,
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
  const method = request.method;
  const canWrite = user.role === 'admin' || (user.role === 'teacher' && klass.teacherId === user.id);
  const canRead = canWrite || can(user, 'sessions:read');
  if (!canRead || (method !== 'GET' && !canWrite)) {
    throw new HttpError(403, user.role === 'teacher'
      ? 'Bạn chỉ được xem và điểm danh lớp mình phụ trách.'
      : 'Tài khoản của bạn chỉ được xem sổ điểm danh, không được sửa.');
  }
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

// ---------- Bảng tổng thể (admin) ----------
const overview = async (ctx, user) => {
  const { store } = ctx;
  const [students, classes, teachers] = await Promise.all([
    listAll(store, 'students'), listAll(store, 'classes'), listAll(store, 'teachers'),
  ]);
  const sessionsByClass = new Map(await Promise.all(
    classes.map(async c => [c.id, (await store.list(`sessions/${c.id}`)).sort((a, b) => a.number - b.number)]),
  ));
  const rows = students.map(st => {
    const classIds = new Set([st.classId, ...(st.classHistory ?? []).map(h => h.classId)].filter(Boolean));
    let attended = 0;
    let absent = 0;
    let late = 0;
    for (const id of classIds) {
      for (const ses of sessionsByClass.get(id) ?? []) {
        const m = ses.marks?.[st.id];
        if (m === 'co_mat') attended += 1;
        else if (m === 'muon') { attended += 1; late += 1; }
        else if (m === 'co_phep' || m === 'khong_phep') absent += 1;
      }
    }
    const payments = st.payments ?? [];
    const paid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const lastPayment = payments.filter(p => p.date).sort((a, b) => b.date.localeCompare(a.date))[0];
    return {
      ...st,
      stats: {
        attended, absent, late, paid,
        owed: (st.tuitionFee || 0) - (st.discount || 0) - paid,
        lastPaymentDate: lastPayment?.date ?? '',
      },
    };
  }).sort((a, b) => String(a.code).localeCompare(String(b.code), 'vi', { numeric: true }));
  const classRows = withCounts(classes, students).map(c => {
    const sessions = sessionsByClass.get(c.id) ?? [];
    const last = sessions[sessions.length - 1];
    return { ...c, sessionsDone: sessions.length, lastSessionDate: last?.date ?? '', lastContent: last?.content ?? '' };
  }).sort((a, b) => a.code.localeCompare(b.code, 'vi', { numeric: true }));
  const showFees = can(user, 'fees');
  return json({
    students: showFees ? rows : rows.map(stripFees),
    classes: classRows,
    teachers: teachers.map(publicTeacher).map(t => ({ id: t.id, fullName: t.fullName, role: t.role, active: t.active })),
  });
};

// Nhập học viên hàng loạt (dán từ Excel). Lớp chưa có sẽ được tạo theo tên.
export const canonicalClassCode = name => {
  const key = normKey(name);
  const m = key.match(/^KHOA\s*(.+)$/);
  return m ? `KHÓA ${m[1].trim()}` : String(name ?? '').trim().toUpperCase().slice(0, 40);
};

const EXCEL_PAYMENT_NOTE = 'Chuyển từ Excel';

const importStudents = async (request, ctx, user) => {
  const withFees = can(user, 'fees');
  const { store } = ctx;
  const body = await readBody(request);
  const rows = Array.isArray(body.rows) ? body.rows.slice(0, 2000) : [];
  if (!rows.length) throw new HttpError(400, 'Không có dòng nào để nhập.');
  const students = await listAll(store, 'students');
  const classes = await listAll(store, 'classes');
  const classByKey = new Map(classes.map(c => [normKey(c.code), c]));
  const updateExisting = Boolean(body.updateExisting);
  const created = [];
  const updated = [];
  const skipped = [];
  const classesCreated = [];
  const feeKept = [];

  for (const [index, row] of rows.entries()) {
    const fullName = text(row.fullName, 120);
    if (!fullName) { skipped.push({ row: index + 1, reason: 'Thiếu họ tên' }); continue; }
    const phoneDigits = digits(row.phone);
    const phone = /^0\d{9,10}$/.test(phoneDigits) ? phoneDigits : '';
    const code = text(row.code, 20).toUpperCase();
    const existing = code ? students.find(x => String(x.code).toUpperCase() === code) : null;
    if (existing && !updateExisting) {
      skipped.push({ row: index + 1, name: fullName, reason: `Số báo danh ${code} đã có` }); continue;
    }
    if (phone && students.some(x => x.phone === phone && x !== existing)) {
      skipped.push({ row: index + 1, name: fullName, reason: `SĐT ${phone} đã có ở học viên khác` }); continue;
    }

    let classId = '';
    if (text(row.className, 60)) {
      const classCode = canonicalClassCode(row.className);
      let klass = classByKey.get(normKey(classCode));
      if (!klass) {
        klass = {
          id: newId('lop'), code: classCode, name: '', level: 'Chưa phân loại', branch: '', schedule: '', days: [],
          startTime: '', endTime: '', monitor: '', room: '', startDate: '', endDate: '', capacity: 40,
          sessionCount: DEFAULT_SESSION_COUNT, teacherId: '', status: 'dang_mo', note: 'Tạo khi nhập từ Excel',
          createdAt: now(), updatedAt: now(),
        };
        await save(store, 'classes', klass);
        classByKey.set(normKey(classCode), klass);
        classesCreated.push(classCode);
      }
      classId = klass.id;
    }

    const paid = money(row.paid);
    const owed = money(row.owed);
    const birthYear = Number.parseInt(row.birthYear, 10);
    const dob = /^\d{4}-\d{2}-\d{2}$/.test(String(row.dateOfBirth ?? '')) ? row.dateOfBirth : '';
    const excelPayments = paid
      ? [{ id: newId('tt'), date: requireDate(row.paidDate ?? '', 'Ngày thu'), amount: paid, note: EXCEL_PAYMENT_NOTE }]
      : [];
    const fields = {
      fullName,
      phone,
      dateOfBirth: dob,
      birthYear: birthYear >= 1940 && birthYear <= 2030 ? birthYear : '',
      gender: oneOf(row.gender, ['nam', 'nu'], ''),
      address: text(row.address, 240),
      goal: text(row.goal, 80),
      ...(withFees ? { busFee: money(row.busFee) } : {}),
      topikExam: text(row.topikExam, 160),
      note: text(row.note, 1600),
    };

    if (existing) {
      // Cập nhật: ô trống trong Excel thì giữ nguyên thông tin đang có trong app.
      const next = { ...existing, updatedAt: now() };
      for (const [key, value] of Object.entries(fields)) {
        if (value !== '' && value !== 0) next[key] = value;
      }
      if (row.status) next.status = oneOf(row.status, STUDENT_STATUSES, existing.status);
      if (classId && classId !== existing.classId) {
        next.classHistory = [...(existing.classHistory ?? [])];
        if (existing.classId) next.classHistory.push({ classId: existing.classId, from: existing.enrolledAt, to: now().slice(0, 10) });
        next.classId = classId;
        next.enrolledAt = '';
      }
      // Học phí chỉ cập nhật theo Excel khi trong app chưa ghi lần đóng tiền nào khác.
      const onlyExcel = (existing.payments ?? []).every(x => x.note === EXCEL_PAYMENT_NOTE);
      if (!withFees) {
        // Tài khoản không có quyền học phí: không đụng tới học phí.
      } else if (onlyExcel) {
        next.payments = excelPayments;
        next.tuitionFee = paid + owed;
      } else if (paid || owed) {
        feeKept.push(`${code} ${fullName}`);
      }
      await save(store, 'students', next);
      Object.assign(existing, next);
      updated.push(code);
      continue;
    }

    const student = {
      id: newId('hv'),
      code: code || nextStudentCode(students),
      email: '',
      level: '',
      classId,
      enrolledAt: '',
      classHistory: [],
      status: oneOf(row.status, STUDENT_STATUSES, 'dang_hoc'),
      tuitionFee: withFees ? paid + owed : 0,
      discount: 0,
      payments: withFees ? excelPayments : [],
      ...fields,
      createdAt: now(),
      updatedAt: now(),
    };
    await save(store, 'students', student);
    students.push(student);
    created.push(student.code);
  }
  return json({ created: created.length, updated: updated.length, skipped, classesCreated, feeKept });
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
  // Hỗ trợ /api/..., /hoc-vu/api/... và /.netlify/functions/<tên>/... (khi đi qua rewrite).
  const match = url.pathname.match(/^\/\.netlify\/functions\/[^/]+\/?(.*)$/) || url.pathname.match(/\/api\/?(.*)$/);
  const parts = (match?.[1] ?? '').split('/').filter(Boolean);
  const [resource, id] = parts;
  const method = request.method;

  if (resource === 'login' && method === 'POST') return login(request, ctx);

  const user = await authenticate(request, ctx);

  if (resource === 'me' && method === 'GET') return json({ user });

  if (resource === 'classes' && id && parts[2] === 'sessions' && parts.length <= 4) {
    return sessionsRoute(request, ctx, user, id, parts[3]);
  }

  if (resource === 'overview' && method === 'GET') {
    requirePerm(user, 'overview');
    return overview(ctx, user);
  }
  if (resource === 'import' && id === 'students' && method === 'POST') {
    requirePerm(user, 'import');
    return importStudents(request, ctx, user);
  }

  // Kế toán: chỉ sửa phần học phí của học viên.
  if (resource === 'students' && id && parts[2] === 'fees' && method === 'PUT') {
    requirePerm(user, 'fees');
    const existing = await getOne(ctx.store, 'students', id, 'học viên');
    const body = await readBody(request);
    const item = { ...existing, ...feeFields(body), topikExam: text(body.topikExam ?? existing.topikExam, 160), updatedAt: now() };
    await save(ctx.store, 'students', item);
    return json({ item });
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
  if (resource === 'teachers') requireAdmin(user);
  else requirePerm(user, `${resource}:${method === 'GET' ? 'read' : 'write'}`);
  const output = resource === 'students' && !can(user, 'fees') ? stripFees : config.output;
  const { store } = ctx;
  ctx = { ...ctx, user };

  if (!id && method === 'GET') {
    const items = await listAll(store, resource);
    if (resource === 'classes') {
      const students = await listAll(store, 'students');
      return json({ items: withCounts(items, students).sort((a, b) => a.code.localeCompare(b.code)) });
    }
    items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return json({ items: items.map(output) });
  }

  if (!id && method === 'POST') {
    const item = await config.build(await readBody(request), ctx, null);
    await save(store, resource, item);
    return json({ item: output(item) }, 201);
  }

  if (!id) throw new HttpError(405, 'Phương thức không được hỗ trợ.');
  const existing = await getOne(store, resource, id, config.label);

  if (method === 'GET') return json({ item: output(existing) });

  if (method === 'PUT') {
    const item = await config.build(await readBody(request), ctx, existing);
    await save(store, resource, item);
    return json({ item: output(item) });
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
