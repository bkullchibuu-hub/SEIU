export type Role = 'admin' | 'teacher';

export interface User {
  role: Role;
  id: string;
  fullName: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  username: string;
  active: boolean;
  note: string;
  createdAt: string;
}

export type ClassStatus = 'dang_mo' | 'da_ket_thuc';

export interface ClassRoom {
  id: string;
  code: string;
  name: string;
  level: string;
  branch: string;
  schedule: string;
  room: string;
  startDate: string;
  endDate: string;
  capacity: number;
  sessionCount: number;
  teacherId: string;
  status: ClassStatus;
  note: string;
  studentCount: number;
}

export type StudentStatus = 'dang_hoc' | 'bao_luu' | 'hoan_thanh' | 'da_nghi';

export interface Student {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: '' | 'nam' | 'nu';
  address: string;
  level: string;
  classId: string;
  enrolledAt: string;
  classHistory: { classId: string; from: string; to: string }[];
  status: StudentStatus;
  note: string;
  createdAt: string;
}

export type TeacherClass = ClassRoom & { students: Student[] };

export type AttendanceMark = 'co_mat' | 'muon' | 'co_phep' | 'khong_phep';

export interface ClassSession {
  classId: string;
  number: number;
  date: string;
  content: string;
  homework: string;
  note: string;
  marks: Record<string, AttendanceMark>;
  updatedAt: string;
  updatedBy: string;
}

export type AttendanceStudent = Student & { inClass: boolean };

export const MARKS: { value: AttendanceMark; label: string; short: string }[] = [
  { value: 'co_mat', label: 'Có mặt', short: '✓' },
  { value: 'muon', label: 'Đi muộn', short: 'M' },
  { value: 'co_phep', label: 'Vắng có phép', short: 'P' },
  { value: 'khong_phep', label: 'Vắng không phép', short: 'V' },
];

export const LEVELS = [
  'Nhập môn',
  'Sơ cấp 1',
  'Sơ cấp 2',
  'Trung cấp 1',
  'Trung cấp 2',
  'Cao cấp',
  'Luyện thi TOPIK I',
  'Luyện thi TOPIK II',
  'Giao tiếp',
];

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  dang_hoc: 'Đang học',
  bao_luu: 'Bảo lưu',
  hoan_thanh: 'Hoàn thành',
  da_nghi: 'Đã nghỉ',
};

export const CLASS_STATUS_LABELS: Record<ClassStatus, string> = {
  dang_mo: 'Đang mở',
  da_ket_thuc: 'Đã kết thúc',
};

export const formatDate = (value: string) => {
  if (!value) return '';
  const [y, m, d] = value.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

export const formatPhone = (value: string) =>
  value.length === 10 ? `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7)}` : value;
