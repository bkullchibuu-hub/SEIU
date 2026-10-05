// Đọc bảng học viên copy từ Excel (các ô cách nhau bằng phím Tab).
// Nhận diện cột theo tên tiêu đề, nên thứ tự cột trong Excel có thể khác.
import type { StudentStatus } from './types';

export interface ImportRow {
  line: number;
  code: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  birthYear: number | '';
  gender: '' | 'nam' | 'nu';
  address: string;
  goal: string;
  className: string;
  status: StudentStatus;
  paid: number;
  owed: number;
  paidDate: string;
  busFee: number;
  topikExam: string;
  note: string;
}

export interface ImportWarning {
  line: number;
  name: string;
  message: string;
}

const norm = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd')
  .toUpperCase().replace(/\s+/g, ' ').trim();

type Field = 'code' | 'fullName' | 'phone' | 'dob' | 'gender' | 'address' | 'note' | 'goal' | 'className' | 'status'
  | 'debt' | 'paidDate' | 'promo' | 'paid' | 'installment' | 'exempt' | 'topik' | 'bus';

const HEADER_RULES: [RegExp, Field][] = [
  [/^(SO BAO DANH|SBD|MA HV|MA HOC VIEN)$/, 'code'],
  [/^(HO VA TEN|HO TEN|TEN HOC VIEN)$/, 'fullName'],
  [/^(SDT|SO DIEN THOAI|DIEN THOAI)$/, 'phone'],
  [/^(NAM SINH|NGAY SINH)$/, 'dob'],
  [/^GIOI TINH$/, 'gender'],
  [/^DIA CHI$/, 'address'],
  [/^GHI CHU$/, 'note'],
  [/^MUC TIEU$/, 'goal'],
  [/^(LOP HOC|LOP|KHOA HOC|KHOA)$/, 'className'],
  [/^TRANG THAI$/, 'status'],
  [/^CONG NO$/, 'debt'],
  [/^NGAY THU/, 'paidDate'],
  [/^KHUYEN MA/, 'promo'],
  [/^TONG HP DA DONG|^DA DONG/, 'paid'],
  [/^HOC PHI LAN/, 'installment'],
  [/^MIEN TRU|^MIEM TRU/, 'exempt'],
  [/^THI TOPIK/, 'topik'],
  [/^TIEN XE/, 'bus'],
];

const parseMoney = (raw: string) => {
  let v = raw.replace(/[\s₫đ]/gi, '');
  if (!v) return 0;
  if (/,\d{1,2}$/.test(v)) v = v.replace(/\./g, '').replace(',', '.');
  else v = v.replace(/[.,]/g, '');
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
};

const pad = (n: number) => String(n).padStart(2, '0');

// Excel hay biến "2009" gõ vào ô định dạng ngày thành 30/06/1905 (ngày thứ 2009 tính từ 1900).
// Đổi ngược lại thành năm sinh.
const parseBirth = (raw: string): { dateOfBirth: string; birthYear: number | ''; problem?: string } => {
  const v = raw.trim();
  if (!v) return { dateOfBirth: '', birthYear: '' };
  if (/^\d{4}$/.test(v)) {
    const y = Number(v);
    return y >= 1940 && y <= 2030 ? { dateOfBirth: '', birthYear: y } : { dateOfBirth: '', birthYear: '', problem: v };
  }
  const m = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{3,4})$/);
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    if (y >= 1940 && y <= 2030 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      return { dateOfBirth: `${y}-${pad(mo)}-${pad(d)}`, birthYear: y };
    }
    if (y >= 1900 && y < 1910) {
      const serial = Math.round((Date.UTC(y, mo - 1, d) - Date.UTC(1899, 11, 30)) / 86400000);
      if (serial >= 1940 && serial <= 2030) return { dateOfBirth: '', birthYear: serial };
    }
  }
  return { dateOfBirth: '', birthYear: '', problem: v };
};

const parseDate = (raw: string) => {
  const m = raw.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  return m && Number(m[3]) >= 2000 ? `${m[3]}-${pad(Number(m[2]))}-${pad(Number(m[1]))}` : '';
};

const parsePhone = (raw: string) => {
  const d = raw.replace(/\D/g, '');
  if (!d) return { phone: '' };
  if (/^0\d{9,10}$/.test(d)) return { phone: d };
  if (/^[1-9]\d{8}$/.test(d)) return { phone: `0${d}`, fixed: true };
  return { phone: '', problem: raw.trim() };
};

const GOAL_MAP: [RegExp, string][] = [
  [/TOPIK DA DONG/, 'TOPIK 1'],
  [/DU HOC/, 'Du học'],
  [/XKLD|XUAT KHAU LAO DONG/, 'XKLĐ'],
  [/KET HON/, 'Kết hôn'],
  [/EPS/, 'EPS-TOPIK'],
  [/TOPIK 2|TOPIK II/, 'TOPIK 2'],
  [/TOPIK/, 'TOPIK 1'],
  [/GIAO TIEP/, 'Giao tiếp'],
];

const parseGoal = (raw: string) => {
  const key = norm(raw);
  if (!key) return '';
  return GOAL_MAP.find(([re]) => re.test(key))?.[1] ?? raw.trim();
};

const parseStatus = (raw: string): StudentStatus => {
  const key = norm(raw);
  if (/BAO LUU/.test(key)) return 'bao_luu';
  if (/NGHI/.test(key)) return 'da_nghi';
  if (/HOAN THANH|TOT NGHIEP|XONG/.test(key)) return 'hoan_thanh';
  return 'dang_hoc';
};

export const parseExcelPaste = (input: string) => {
  const lines = input.replace(/\r/g, '').split('\n');
  const warnings: ImportWarning[] = [];
  const headerIndex = lines.findIndex(l => l.split('\t').some(c => /^(HO VA TEN|HO TEN)$/.test(norm(c))));
  if (headerIndex < 0) {
    return { rows: [] as ImportRow[], warnings, headerFound: false };
  }

  const columns = new Map<Field, number[]>();
  lines[headerIndex].split('\t').forEach((cell, i) => {
    const field = HEADER_RULES.find(([re]) => re.test(norm(cell)))?.[1];
    if (field) columns.set(field, [...(columns.get(field) ?? []), i]);
  });
  const get = (cells: string[], field: Field, which = 0) => {
    const idx = columns.get(field)?.[which];
    return idx === undefined ? '' : (cells[idx] ?? '').trim();
  };
  const all = (cells: string[], field: Field) => (columns.get(field) ?? []).map(i => (cells[i] ?? '').trim());

  const rows: ImportRow[] = [];
  lines.slice(headerIndex + 1).forEach((line, offset) => {
    const cells = line.split('\t');
    const fullName = get(cells, 'fullName');
    if (!fullName) return;
    const lineNo = headerIndex + offset + 2;
    const notes = all(cells, 'note').filter(Boolean);
    const warn = (message: string) => warnings.push({ line: lineNo, name: fullName, message });

    const phone = parsePhone(get(cells, 'phone'));
    let dobRaw = get(cells, 'dob');
    if (phone.fixed) warn(`SĐT thiếu số 0, đã sửa thành ${phone.phone}`);
    if (phone.problem && !dobRaw && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(phone.problem)) {
      // Ngày sinh bị gõ nhầm vào cột SĐT.
      dobRaw = phone.problem;
      warn(`Ngày sinh ${phone.problem} nằm ở cột SĐT, đã chuyển sang ngày sinh`);
    } else if (phone.problem) {
      warn(`SĐT "${phone.problem}" không hợp lệ, đã chuyển vào ghi chú`);
      notes.push(`SĐT ghi trong Excel: ${phone.problem}`);
    }

    const birth = parseBirth(dobRaw);
    if (birth.problem) {
      warn(`Năm sinh "${birth.problem}" không đọc được, đã chuyển vào ghi chú`);
      notes.push(`Năm sinh ghi trong Excel: ${birth.problem}`);
    }

    const debt = parseMoney(get(cells, 'debt'));
    let paid = parseMoney(get(cells, 'paid'));
    const installments = all(cells, 'installment').reduce((sum, v) => sum + Math.max(0, parseMoney(v)), 0);
    if (!paid && installments) paid = installments;
    const promo = get(cells, 'promo');
    if (promo && parseMoney(promo)) notes.push(`Khuyến mãi / vô sau: ${promo}`);
    const exempt = get(cells, 'exempt');
    if (exempt && parseMoney(exempt)) notes.push(`Miễn trừ: ${exempt}`);

    const gender = norm(get(cells, 'gender'));
    const goalRaw = get(cells, 'goal');
    const topikExam = get(cells, 'topik') || (/TOPIK DA DONG/.test(norm(goalRaw)) ? 'Đã đóng phí thi TOPIK' : '');
    rows.push({
      line: lineNo,
      code: get(cells, 'code').replace(/\s/g, ''),
      fullName,
      phone: phone.phone,
      dateOfBirth: birth.dateOfBirth,
      birthYear: birth.birthYear,
      gender: gender === 'NU' ? 'nu' : gender === 'NAM' ? 'nam' : '',
      address: get(cells, 'address'),
      goal: parseGoal(goalRaw),
      className: get(cells, 'className'),
      status: parseStatus(get(cells, 'status')),
      paid: Math.max(0, paid),
      owed: Math.max(0, -debt),
      paidDate: parseDate(get(cells, 'paidDate')),
      busFee: Math.max(0, parseMoney(get(cells, 'bus'))),
      topikExam,
      note: notes.join('\n'),
    });
  });

  // Trùng số báo danh ngay trong bảng dán vào.
  const seen = new Map<string, string>();
  for (const r of rows) {
    if (!r.code) continue;
    if (seen.has(r.code)) {
      warnings.push({ line: r.line, name: r.fullName, message: `Trùng số báo danh ${r.code} với ${seen.get(r.code)} – dòng này sẽ bị bỏ qua` });
    } else seen.set(r.code, r.fullName);
  }
  return { rows, warnings, headerFound: true };
};
