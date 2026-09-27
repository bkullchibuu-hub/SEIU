import { getAdminKey } from './authService';
import { downloadCsv, goalLabel } from './leadService';

export interface ExamRegistration {
  id: string;
  createdAt: string;
  studentName: string;
  studentPhone: string;
  goal: string;
  testId: string;
  testTitle: string;
  testKind: string;
  status: 'started' | 'completed';
  completedAt?: string;
  resultId?: string;
  score?: number;
  maxScore?: number;
  percent?: number;
  syncStatus?: 'pending' | 'synced';
}

export interface RegisterExamPayload {
  studentName: string;
  studentPhone: string;
  goal: string;
  testId: string;
  testTitle: string;
  testKind: string;
}

const CACHE_KEY = 'seiu_exam_registrations_cache_v1';

let cache: ExamRegistration[] = (() => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
})();

const persist = (): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache.slice(0, 500)));
  } catch {}
  window.dispatchEvent(new Event('seiu_exam_registrations_updated'));
};

const upsert = (record: ExamRegistration): void => {
  cache = [record, ...cache.filter(item => item.id !== record.id)]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 500);
  persist();
};

const buildRegistrationId = (): string => {
  try {
    return `reg_${crypto.randomUUID().replace(/-/g, '')}`;
  } catch {
    return `reg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
};

export const registerExamStudent = async (
  payload: RegisterExamPayload,
): Promise<ExamRegistration> => {
  const id = buildRegistrationId();
  const pendingRecord: ExamRegistration = {
    id,
    createdAt: new Date().toISOString(),
    studentName: payload.studentName.trim(),
    studentPhone: payload.studentPhone.replace(/[^0-9+]/g, ''),
    goal: payload.goal,
    testId: payload.testId,
    testTitle: payload.testTitle,
    testKind: payload.testKind,
    status: 'started',
    syncStatus: 'pending',
  };
  upsert(pendingRecord);

  try {
    const response = await fetch('/api/exam-registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, registrationId: id }),
    });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json().catch(() => null) : null;
    if (response.ok && data?.registration) {
      const synced = { ...data.registration, syncStatus: 'synced' as const };
      upsert(synced);
      return synced;
    }
  } catch (error) {
    console.warn('Chưa gửi được đăng ký thi lên máy chủ:', error);
  }

  return pendingRecord;
};

const retryPending = async (): Promise<void> => {
  const pending = cache.filter(item => item.syncStatus === 'pending').slice(0, 20);
  for (const item of pending) {
    try {
      const response = await fetch('/api/exam-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, registrationId: item.id }),
      });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json().catch(() => null) : null;
      if (response.ok && data?.registration) upsert({ ...data.registration, syncStatus: 'synced' });
    } catch {}
  }
};

export const getCachedExamRegistrations = (): ExamRegistration[] => cache;

export const refreshExamRegistrations = async (): Promise<ExamRegistration[]> => {
  try {
    await retryPending();
    const response = await fetch('/api/exam-registrations', {
      headers: { 'x-seiu-admin-key': getAdminKey() },
    });
    if (!response.ok) throw new Error('Không tải được danh sách đăng ký thi');
    const data = await response.json();
    if (Array.isArray(data.registrations)) {
      const pending = cache.filter(item => item.syncStatus === 'pending');
      const serverIds = new Set(data.registrations.map((item: ExamRegistration) => item.id));
      cache = [
        ...data.registrations.map((item: ExamRegistration) => ({ ...item, syncStatus: 'synced' as const })),
        ...pending.filter(item => !serverIds.has(item.id)),
      ].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 500);
      persist();
    }
  } catch (error) {
    console.warn('Không tải được danh sách đăng ký thi:', error);
  }
  return cache;
};

export const deleteExamRegistration = async (id: string): Promise<void> => {
  cache = cache.filter(item => item.id !== id);
  persist();
  try {
    await fetch(`/api/exam-registrations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-seiu-admin-key': getAdminKey() },
    });
  } catch {}
};

export const exportExamRegistrationsToCsv = (): void => {
  if (!cache.length) return;
  const headers = ['Thời gian vào thi', 'Họ tên', 'Số điện thoại', 'Mục tiêu', 'Bài thi', 'Trạng thái', 'Kết quả'];
  const rows = cache.map(item => [
    new Date(item.createdAt).toLocaleString('vi-VN'),
    item.studentName,
    item.studentPhone,
    goalLabel(item.goal),
    item.testTitle,
    item.status === 'completed' ? 'Đã nộp bài' : 'Đang làm / chưa nộp',
    item.status === 'completed' ? `${item.score ?? 0}/${item.maxScore ?? 0} (${item.percent ?? 0}%)` : '',
  ].map(value => `"${String(value).replace(/"/g, '""')}"`));
  const csv = '\ufeff' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadCsv(csv, `Dang_ky_thi_TOPIK_SEIU_${new Date().toISOString().split('T')[0]}.csv`);
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { void retryPending(); });
  setTimeout(() => { void retryPending(); }, 3000);
}
