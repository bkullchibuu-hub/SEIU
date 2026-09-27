/**
 * Kết quả bài thi của học viên (nộp từ link chia sẻ).
 * Lưu trên Netlify Blobs khi triển khai và server_data/exam_results.json khi chạy máy chủ Node.
 */

import { getAdminKey } from './authService';
import { downloadCsv, goalLabel } from './leadService';

export interface ExamResult {
  id: string;
  createdAt: string;
  studentName: string;
  studentPhone: string;
  registrationId?: string;
  goal: string;
  testId: string;
  testTitle: string;
  testKind: string;
  correct: number;
  total: number;
  score?: number;
  maxScore?: number;
  percent: number;
  durationSec: number;
  detail?: { no: number; picked: number; ans: number }[];
  syncStatus?: 'pending' | 'synced';
}

export interface StudentIdentity {
  name: string;
  phone: string;
  goal: string;
  registrationId?: string;
}

export interface PublicLeaderboardEntry {
  rank: number;
  id: string;
  studentName: string;
  testTitle: string;
  score: number;
  maxScore: number;
  percent: number;
  createdAt: string;
}

export interface PublicLeaderboard {
  totalAttempts: number;
  uniqueStudents: number;
  topScore: number;
  updatedAt: string;
  entries: PublicLeaderboardEntry[];
}

const EMPTY_LEADERBOARD: PublicLeaderboard = {
  totalAttempts: 0,
  uniqueStudents: 0,
  topScore: 0,
  updatedAt: '',
  entries: [],
};

const IDENTITY_KEY = 'seiu_student_identity_v1';
const RESULTS_CACHE_KEY = 'seiu_exam_results_cache_v1';

let cache: ExamResult[] = (() => {
  try {
    const raw = localStorage.getItem(RESULTS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
})();

const persistCache = (): void => {
  try {
    localStorage.setItem(RESULTS_CACHE_KEY, JSON.stringify(cache.slice(0, 500)));
  } catch {}
  window.dispatchEvent(new Event('seiu_exam_results_updated'));
};

const upsertCache = (record: ExamResult): void => {
  cache = [record, ...cache.filter(item => item.id !== record.id)]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 500);
  persistCache();
};

const buildSubmissionId = (): string => {
  try {
    return `res_${crypto.randomUUID().replace(/-/g, '')}`;
  } catch {
    return `res_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
};

export const getStudentIdentity = (): StudentIdentity | null => {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return v && v.name && v.phone ? v : null;
  } catch {
    return null;
  }
};

export const saveStudentIdentity = (id: StudentIdentity): void => {
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(id));
  } catch {}
  window.dispatchEvent(new Event('seiu_student_identity_updated'));
};

export const clearStudentIdentity = (): void => {
  try {
    localStorage.removeItem(IDENTITY_KEY);
  } catch {}
  window.dispatchEvent(new Event('seiu_student_identity_updated'));
};

export interface SubmitPayload {
  testId: string;
  testTitle: string;
  testKind: string;
  correct: number;
  total: number;
  score?: number;
  maxScore?: number;
  durationSec: number;
  detail?: { no: number; picked: number; ans: number }[];
}

export const submitExamResult = async (
  student: StudentIdentity,
  payload: SubmitPayload
): Promise<boolean> => {
  const submissionId = buildSubmissionId();
  const createdAt = new Date().toISOString();
  const percent = (payload.maxScore || payload.total)
    ? Math.round(((payload.score ?? payload.correct) / (payload.maxScore || payload.total)) * 100)
    : 0;
  const body = {
    submissionId,
    studentName: student.name,
    studentPhone: student.phone.replace(/[^0-9+]/g, ''),
    registrationId: student.registrationId || '',
    goal: student.goal,
    ...payload,
    percent,
  };

  upsertCache({
    id: submissionId,
    createdAt,
    studentName: body.studentName,
    studentPhone: body.studentPhone,
    registrationId: body.registrationId,
    goal: body.goal,
    testId: body.testId,
    testTitle: body.testTitle,
    testKind: body.testKind,
    correct: body.correct,
    total: body.total,
    score: body.score,
    maxScore: body.maxScore,
    percent,
    durationSec: body.durationSec,
    detail: body.detail,
    syncStatus: 'pending',
  });

  try {
    const res = await fetch('/api/exam-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json().catch(() => null) : null;
    if (!res.ok || !data?.result) return false;
    upsertCache({ ...data.result, syncStatus: 'synced' });
    return true;
  } catch (e) {
    console.warn('Không gửi được kết quả thi lên máy chủ:', e);
    return false;
  }
};

export const getCachedResults = (): ExamResult[] => cache;

const retryPendingResults = async (): Promise<void> => {
  const pending = cache.filter(item => item.syncStatus === 'pending').slice(0, 20);
  for (const item of pending) {
    try {
      const res = await fetch('/api/exam-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, submissionId: item.id }),
      });
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json().catch(() => null) : null;
      if (res.ok && data?.result) upsertCache({ ...data.result, syncStatus: 'synced' });
    } catch {}
  }
};

export const refreshExamResults = async (): Promise<ExamResult[]> => {
  try {
    await retryPendingResults();
    const res = await fetch('/api/exam-results', {
      headers: { 'x-seiu-admin-key': getAdminKey() },
    });
    if (!res.ok) throw new Error('Chưa đăng nhập quản trị');
    const data = await res.json();
    if (Array.isArray(data.results)) {
      const pending = cache.filter(item => item.syncStatus === 'pending');
      const serverIds = new Set(data.results.map((item: ExamResult) => item.id));
      cache = [
        ...data.results.map((item: ExamResult) => ({ ...item, syncStatus: 'synced' as const })),
        ...pending.filter(item => !serverIds.has(item.id)),
      ].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 500);
      persistCache();
    }
  } catch (e) {
    console.warn('Không tải được kết quả thi:', e);
  }
  return cache;
};

/** Dữ liệu công khai đã bỏ số điện thoại, chỉ dùng cho bảng thành tích trang chủ. */
export const refreshPublicLeaderboard = async (): Promise<PublicLeaderboard> => {
  try {
    const res = await fetch('/api/exam-results/leaderboard');
    if (!res.ok) throw new Error('Không tải được bảng thành tích');
    const data = await res.json();
    if (data?.leaderboard && Array.isArray(data.leaderboard.entries)) {
      return data.leaderboard as PublicLeaderboard;
    }
  } catch (error) {
    console.warn('Không tải được bảng thành tích công khai:', error);
  }
  return EMPTY_LEADERBOARD;
};

export const deleteExamResult = async (id: string): Promise<void> => {
  cache = cache.filter(r => r.id !== id);
  persistCache();
  try {
    await fetch(`/api/exam-results/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-seiu-admin-key': getAdminKey() },
    });
  } catch {}
};

export const exportResultsToCsv = (): void => {
  if (!cache.length) return;
  const headers = [
    'Thời gian nộp', 'Mã đăng ký thi', 'Họ tên', 'Số điện thoại', 'Mục tiêu',
    'Bài thi', 'Số câu đúng', 'Tổng câu', 'Điểm', 'Điểm tối đa', 'Phần trăm', 'Thời gian làm',
  ];
  const rows = cache.map(r => [
    new Date(r.createdAt).toLocaleString('vi-VN'),
    r.registrationId || '',
    r.studentName,
    r.studentPhone,
    goalLabel(r.goal),
    r.testTitle,
    r.correct,
    r.total,
    r.score ?? r.correct,
    r.maxScore ?? r.total,
    r.percent + '%',
    formatDuration(r.durationSec),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`));
  const csv = '﻿' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCsv(csv, `Ket_qua_thi_SEIU_${new Date().toISOString().split('T')[0]}.csv`);
};

export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}
