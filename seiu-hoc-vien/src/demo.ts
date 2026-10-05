// Chế độ demo: chạy API ngay trong trình duyệt, dữ liệu lưu ở localStorage.
import { handleApi } from '../server/api.mjs';

const DB_KEY = 'seiu-hv-demo-db-v3';
type Db = Record<string, unknown>;

let memory: Db | null = null;

const load = (): Db => {
  if (memory) return memory;
  try {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) memory = JSON.parse(saved) as Db;
  } catch {
    /* không đọc được bộ nhớ trình duyệt: dùng dữ liệu mẫu trong phiên */
  }
  if (!memory) memory = seed();
  return memory;
};

const persist = () => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(memory));
  } catch {
    /* chỉ giữ trong phiên hiện tại */
  }
};

const store = {
  get: async (key: string) => structuredClone(load()[key] ?? null),
  set: async (key: string, value: unknown) => {
    load()[key] = structuredClone(value);
    persist();
  },
  delete: async (key: string) => {
    delete load()[key];
    persist();
  },
  list: async (prefix: string) =>
    Object.entries(load()).filter(([k]) => k.startsWith(`${prefix}/`)).map(([, v]) => structuredClone(v)),
};

const env = { ADMIN_USERNAME: 'admin', ADMIN_PASSWORD: 'admin123', AUTH_SECRET: '' };

export const demoFetch = (method: string, path: string, headers: Record<string, string>, body?: string) =>
  handleApi(new Request(`https://demo.local/api/${path}`, { method, headers, body }), { store, env });

export const resetDemo = () => {
  memory = seed();
  persist();
};

export const DEMO_ACCOUNTS = [
  { label: 'Quản trị viên', username: 'admin', password: 'admin123' },
  { label: 'GV Kim Min-ji', username: 'kimminji', password: '123456' },
  { label: 'GV Nguyễn Thu Hà', username: 'thuha', password: '123456' },
];

// ---------- Dữ liệu mẫu ----------
function seed(): Db {
  const db: Db = {};
  const stamp = '2026-09-01T08:00:00.000Z';
  const teachers = [
    { id: 'gv_kim', fullName: 'Kim Min-ji', phone: '0938112233', username: 'kimminji', note: 'Giáo viên bản ngữ' },
    { id: 'gv_ha', fullName: 'Nguyễn Thu Hà', phone: '0907445566', username: 'thuha', note: '' },
    { id: 'gv_park', fullName: 'Park Ji-hoon', phone: '0966778899', username: 'parkjh', note: 'Phụ trách luyện thi TOPIK' },
  ];
  for (const t of teachers) {
    db[`teachers/${t.id}`] = {
      ...t, email: '', active: true, passwordHash: 'demo:123456', passwordVersion: 'v1', createdAt: stamp, updatedAt: stamp,
    };
  }

  const classes = [
    { id: 'lop_sc1', code: 'SC1-K05', name: 'Sơ cấp 1 – tối 246', level: 'Sơ cấp 1', schedule: 'T2-T4-T6, 18:00–20:00', days: [1, 3, 5], startTime: '18:00', endTime: '20:00', monitor: 'Lê Hoàng Nam', room: 'P201', capacity: 15, teacherId: 'gv_kim', startDate: '2026-09-07', endDate: '2026-12-04' },
    { id: 'lop_sc2', code: 'SC2-K03', name: 'Sơ cấp 2 – tối 357', level: 'Sơ cấp 2', schedule: 'T3-T5-T7, 18:00–20:00', days: [2, 4, 6], startTime: '18:00', endTime: '20:00', monitor: 'Bùi Thanh Trúc', room: 'P202', capacity: 15, teacherId: 'gv_ha', startDate: '2026-08-18', endDate: '2026-11-14' },
    { id: 'lop_topik', code: 'TOPIK2-K02', name: 'Luyện đề TOPIK II cuối tuần', level: 'Luyện thi TOPIK II', schedule: 'T7-CN, 08:30–11:30', days: [6, 7], startTime: '08:30', endTime: '11:30', monitor: 'Ngô Khánh Linh', room: 'P301', capacity: 12, teacherId: 'gv_park', startDate: '2026-09-12', endDate: '2026-11-08' },
    { id: 'lop_nm', code: 'NM-K08', name: 'Nhập môn – sáng', level: 'Nhập môn', schedule: 'T2-T4-T6, 09:00–11:00', days: [1, 3, 5], startTime: '09:00', endTime: '11:00', monitor: '', room: 'P101', capacity: 20, teacherId: 'gv_kim', startDate: '2026-10-05', endDate: '2026-11-13' },
  ];
  for (const c of classes) {
    db[`classes/${c.id}`] = {
      ...c, sessionCount: 55, branch: 'Cơ sở chính', status: 'dang_mo', note: '', createdAt: stamp, updatedAt: stamp,
    };
  }

  const students: [string, string, string, string, string, string?][] = [
    ['Trần Minh Anh', '0901234567', '2004-03-12', 'nu', 'lop_sc1'],
    ['Lê Hoàng Nam', '0912345678', '2003-11-02', 'nam', 'lop_sc1', 'Định hướng du học kỳ tháng 3'],
    ['Phạm Thị Lan', '0987654321', '2005-07-21', 'nu', 'lop_sc1'],
    ['Võ Quốc Bảo', '0934567812', '2002-01-30', 'nam', 'lop_sc1'],
    ['Đỗ Ngọc Hân', '0978123456', '2006-05-09', 'nu', 'lop_sc1', 'Học sinh lớp 12, chỉ học được buổi tối'],
    ['Nguyễn Gia Huy', '0923456781', '2004-09-17', 'nam', 'lop_sc2'],
    ['Bùi Thanh Trúc', '0945678123', '2003-12-25', 'nu', 'lop_sc2'],
    ['Hoàng Đức Minh', '0967812345', '2001-06-14', 'nam', 'lop_sc2'],
    ['Đặng Thu Trang', '0356781234', '2004-02-08', 'nu', 'lop_sc2'],
    ['Ngô Khánh Linh', '0389123456', '2002-10-03', 'nu', 'lop_topik', 'Mục tiêu TOPIK 4, thi tháng 11'],
    ['Trịnh Văn Tài', '0398765432', '2000-04-19', 'nam', 'lop_topik'],
    ['Lý Mỹ Duyên', '0701234987', '2003-08-27', 'nu', 'lop_topik'],
    ['Phan Anh Khoa', '0776543210', '2005-01-11', 'nam', 'lop_nm'],
    ['Mai Phương Thảo', '0792345678', '2006-11-29', 'nu', ''],
  ];
  const levelOf = (id: string) => classes.find(c => c.id === id)?.level ?? '';
  const startOf = (id: string) => classes.find(c => c.id === id)?.startDate ?? '';
  const goals = ['Du học', 'Du học', 'TOPIK 1', 'Giao tiếp', 'Du học', 'XKLĐ', 'Du học', 'Kết hôn', 'TOPIK 1', 'TOPIK 2', 'TOPIK 2', 'Du học', 'Giao tiếp', 'Du học'];
  const fees = [7000000, 7000000, 6200000, 5300000, 7000000, 9500000, 7000000, 5200000, 6200000, 8050000, 8050000, 7000000, 3000000, 7000000];
  const paidPlan = [[3000000, 4000000], [7000000], [3000000], [5300000], [3000000], [5000000, 4500000], [7000000], [3000000], [6200000], [8050000], [4000000], [3000000], [3000000], []];
  students.forEach(([fullName, phone, dateOfBirth, gender, classId, note = ''], i) => {
    const id = `hv_demo${i + 1}`;
    db[`students/${id}`] = {
      id, code: `HV${String(i + 1).padStart(4, '0')}`, fullName, phone, email: '', dateOfBirth, gender, address: '',
      level: levelOf(classId) || 'Nhập môn', classId, enrolledAt: startOf(classId), classHistory: [],
      birthYear: Number(dateOfBirth.slice(0, 4)), goal: goals[i], tuitionFee: fees[i], discount: 0, busFee: i === 4 ? 300000 : 0,
      topikExam: i === 9 ? 'TOPIK 105 – đã đóng phí' : '',
      payments: paidPlan[i].map((amount, k) => ({
        id: `tt_demo${i}_${k}`, date: k === 0 ? startOf(classId) || '2026-09-01' : '2026-10-02', amount, note: `Lần ${k + 1}`,
      })),
      status: i === 7 ? 'bao_luu' : 'dang_hoc', note: note || (classId ? '' : 'Chờ lớp Nhập môn khai giảng tháng 10'),
      createdAt: stamp, updatedAt: stamp,
    };
  });

  // Sổ điểm danh mẫu: lớp SC1-K05 đã học 10 buổi (T2-T4-T6 từ 07/09), SC2-K03 đã học 6 buổi.
  const lessons: Record<string, { teacher: string; days: string[]; topics: [string, string][]; absences: Record<number, Record<number, string>> }> = {
    lop_sc1: {
      teacher: 'Kim Min-ji',
      days: ['2026-09-07', '2026-09-09', '2026-09-11', '2026-09-14', '2026-09-16', '2026-09-18', '2026-09-21', '2026-09-23', '2026-09-25', '2026-09-28'],
      topics: [
        ['Bảng chữ cái Hangul: 10 nguyên âm cơ bản (ㅏ ㅑ ㅓ ㅕ ㅗ ㅛ ㅜ ㅠ ㅡ ㅣ)', 'Viết mỗi nguyên âm 2 dòng'],
        ['Hangul: 14 phụ âm cơ bản, cách ghép âm tiết', 'Luyện đọc bảng ghép âm trang 12'],
        ['Hangul: phụ âm bật hơi và phụ âm căng', 'Nghe và chép chính tả 20 từ'],
        ['Hangul: nguyên âm ghép, patchim (phụ âm cuối)', 'Bài tập patchim trang 18–19'],
        ['Kiểm tra Hangul + quy tắc nối âm', ''],
        ['Bài 1 – 소개 (Giới thiệu): 입니다/입니까, từ vựng quốc tịch, nghề nghiệp', 'Viết đoạn giới thiệu bản thân 5 câu'],
        ['Bài 1 (tiếp): 은/는, luyện hội thoại chào hỏi', 'Học thuộc hội thoại trang 30'],
        ['Bài 2 – 학교 (Trường học): 이/가 있어요/없어요, đồ vật trong lớp', 'Từ vựng bài 2'],
        ['Bài 2 (tiếp): 이것/그것/저것, số Hán Hàn 1–100', 'Bài tập số đếm trang 41'],
        ['Bài 3 – 일상생활 (Sinh hoạt hằng ngày): đuôi -아요/어요', 'Chia 15 động từ sang -아요/어요'],
      ],
      absences: { 2: { 3: 'co_phep' }, 4: { 1: 'muon' }, 6: { 4: 'khong_phep', 3: 'muon' }, 8: { 2: 'co_phep' }, 9: { 4: 'khong_phep' } },
    },
    lop_sc2: {
      teacher: 'Nguyễn Thu Hà',
      days: ['2026-09-15', '2026-09-17', '2026-09-19', '2026-09-22', '2026-09-24', '2026-09-26'],
      topics: [
        ['Bài 11 – 날씨 (Thời tiết): -겠-, từ vựng mùa', 'Viết về thời tiết hôm nay'],
        ['Bài 11 (tiếp): -(으)ㄹ 거예요 dự đoán', ''],
        ['Bài 12 – 전화 (Gọi điện): -(으)ㄹ게요, -아/어 주세요', 'Hội thoại gọi điện đặt lịch'],
        ['Bài 12 (tiếp): luyện nghe hội thoại điện thoại', 'Nghe file 12-3, trả lời câu hỏi'],
        ['Bài 13 – 선물 (Quà tặng): -(으)ㄴ/는데, -고 싶다', ''],
        ['Ôn tập bài 11–13, kiểm tra 15 phút', 'Chuẩn bị bài 14'],
      ],
      absences: { 1: { 2: 'co_phep' }, 3: { 3: 'muon' }, 5: { 1: 'khong_phep' } },
    },
  };
  for (const [classId, plan] of Object.entries(lessons)) {
    const roster = Object.values(db).filter((x): x is { id: string; classId: string; status: string } =>
      typeof x === 'object' && x !== null && (x as { classId?: string }).classId === classId && 'code' in x);
    plan.days.forEach((date, i) => {
      const number = i + 1;
      const marks: Record<string, string> = {};
      roster.forEach((st, idx) => {
        if (st.status === 'bao_luu' && number > 3) return;
        marks[st.id] = plan.absences[number]?.[idx] ?? 'co_mat';
      });
      db[`sessions/${classId}/${number}`] = {
        classId, number, date, content: plan.topics[i][0], homework: plan.topics[i][1], note: '', marks,
        createdAt: `${date}T13:00:00.000Z`, updatedAt: `${date}T13:00:00.000Z`, updatedBy: plan.teacher,
      };
    });
  }
  return db;
}
