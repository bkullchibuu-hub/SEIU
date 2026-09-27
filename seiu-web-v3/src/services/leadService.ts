/**
 * Dịch vụ quản lý khách đăng ký (leads).
 *
 * QUAN TRỌNG: dữ liệu nằm trên MÁY CHỦ (server_data/leads.json), không phải
 * trong trình duyệt của người điền form. Nhờ vậy khách điền form ở điện thoại
 * của họ thì admin đăng nhập ở máy khác vẫn nhận được thông tin.
 * localStorage chỉ dùng làm bộ nhớ đệm để hiện ngay khi mạng chậm.
 */

import { getAdminKey } from './authService';

export interface LeadItem {
  id: string;
  createdAt: string;
  fullName: string;
  phone: string;
  email?: string;
  interestedProgram: string;
  city?: string;
  intakeYear?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'appointment' | 'enrolled' | 'cancelled';
  source?: string;
  goal?: string;
  pending?: boolean;
}

export type Lead = LeadItem;

export interface WebhookConfig {
  googleSheetWebhookUrl: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  adminEmail?: string;
  notifyOnSubmit: boolean;
}

const LEADS_CACHE_KEY = 'seiu_leads_cache_v2';
const PENDING_KEY = 'seiu_leads_pending_v1';

const STATUS_LABELS: Record<LeadItem['status'], string> = {
  new: 'Mới',
  contacted: 'Đã liên hệ',
  appointment: 'Đã hẹn tư vấn',
  enrolled: 'Đã nhập học',
  cancelled: 'Hủy / Không phù hợp',
};

export const GOAL_OPTIONS: { value: string; label: string }[] = [
  { value: 'du-hoc', label: 'Du học Hàn Quốc' },
  { value: 'ket-hon', label: 'Kết hôn / Visa F6' },
  { value: 'giao-tiep', label: 'Giao tiếp – công việc' },
];

export const goalLabel = (goal?: string): string =>
  GOAL_OPTIONS.find(g => g.value === goal)?.label || goal || '—';

let cache: LeadItem[] = readCache();

function readCache(): LeadItem[] {
  try {
    const raw = localStorage.getItem(LEADS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCache(list: LeadItem[]) {
  cache = list;
  try {
    localStorage.setItem(LEADS_CACHE_KEY, JSON.stringify(list.slice(0, 500)));
  } catch {
    /* hết dung lượng thì bỏ qua, máy chủ vẫn giữ bản đầy đủ */
  }
  window.dispatchEvent(new Event('seiu_leads_updated'));
}

function adminHeaders(): Record<string, string> {
  return { 'Content-Type': 'application/json', 'x-seiu-admin-key': getAdminKey() };
}

/** Danh sách đang có trong bộ nhớ đệm (dùng để render ngay lập tức). */
export const getStoredLeads = (): LeadItem[] => cache;

/** Tải danh sách mới nhất từ máy chủ. Chỉ chạy được khi đã đăng nhập admin. */
export const refreshLeads = async (): Promise<LeadItem[]> => {
  try {
    const res = await fetch('/api/leads', { headers: adminHeaders() });
    if (!res.ok) throw new Error('Chưa đăng nhập hoặc máy chủ không phản hồi');
    const data = await res.json();
    if (Array.isArray(data.leads)) writeCache(data.leads);
    return cache;
  } catch (e) {
    console.warn('Không tải được danh sách khách từ máy chủ:', e);
    return cache;
  }
};

/** Lưu các form bị lỗi mạng để gửi lại sau. */
function queuePending(lead: any) {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push(lead);
    localStorage.setItem(PENDING_KEY, JSON.stringify(list));
  } catch {}
}

export const flushPendingLeads = async (): Promise<void> => {
  let list: any[] = [];
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    list = raw ? JSON.parse(raw) : [];
  } catch {}
  if (!list.length) return;

  const rest: any[] = [];
  for (const item of list) {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) rest.push(item);
    } catch {
      rest.push(item);
    }
  }
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(rest));
  } catch {}
};

export const saveLead = async (
  leadData: Omit<LeadItem, 'id' | 'createdAt' | 'status'>
): Promise<LeadItem> => {
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
    });
    if (!res.ok) throw new Error('Máy chủ từ chối');
    const data = await res.json();
    if (data.lead) {
      writeCache([data.lead, ...cache.filter(l => l.id !== data.lead.id)]);
      return data.lead as LeadItem;
    }
  } catch (e) {
    console.warn('Gửi lên máy chủ thất bại, xếp hàng gửi lại:', e);
    queuePending(leadData);
  }

  // Bản tạm để giao diện phản hồi ngay cho khách
  const fallback: LeadItem = {
    ...leadData,
    id: 'local_' + Date.now(),
    createdAt: new Date().toISOString(),
    status: 'new',
    pending: true,
  };
  writeCache([fallback, ...cache]);
  return fallback;
};

export const updateLeadStatus = async (
  leadId: string,
  status: LeadItem['status']
): Promise<void> => {
  writeCache(cache.map(l => (l.id === leadId ? { ...l, status } : l)));
  try {
    await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ status }),
    });
  } catch (e) {
    console.warn('Không cập nhật được trạng thái trên máy chủ:', e);
  }
};

export const updateLeadNotes = async (leadId: string, notes: string): Promise<void> => {
  writeCache(cache.map(l => (l.id === leadId ? { ...l, notes } : l)));
  try {
    await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ notes }),
    });
  } catch (e) {
    console.warn('Không lưu được ghi chú:', e);
  }
};

export const deleteLead = async (leadId: string): Promise<void> => {
  writeCache(cache.filter(l => l.id !== leadId));
  try {
    await fetch(`/api/leads/${encodeURIComponent(leadId)}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    });
  } catch (e) {
    console.warn('Không xóa được trên máy chủ:', e);
  }
};

export const clearAllLeads = async (): Promise<void> => {
  const ids = cache.map(l => l.id);
  writeCache([]);
  for (const id of ids) {
    try {
      await fetch(`/api/leads/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });
    } catch {}
  }
};

export const exportLeadsToCsv = (): void => {
  const leads = getStoredLeads();
  if (leads.length === 0) return;

  const headers = [
    'Thời gian', 'Họ tên', 'Số điện thoại', 'Email', 'Chương trình quan tâm',
    'Mục tiêu', 'Khu vực', 'Kỳ nhập học', 'Ghi chú / GPA', 'Nguồn', 'Trạng thái',
  ];

  const rows = leads.map(l => [
    new Date(l.createdAt).toLocaleString('vi-VN'),
    l.fullName || '',
    l.phone || '',
    l.email || '',
    l.interestedProgram || '',
    goalLabel(l.goal),
    l.city || '',
    l.intakeYear || '',
    l.notes || '',
    l.source || '',
    STATUS_LABELS[l.status] || l.status,
  ].map(v => `"${String(v).replace(/"/g, '""')}"`));

  const csv = '﻿' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCsv(csv, `Khach_dang_ky_SEIU_${new Date().toISOString().split('T')[0]}.csv`);
};

export function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// --- Cấu hình Google Sheet / Telegram (lưu trên máy chủ) ---
let webhookCache: WebhookConfig = {
  googleSheetWebhookUrl: '',
  telegramBotToken: '',
  telegramChatId: '',
  adminEmail: 'capseiu@gmail.com',
  notifyOnSubmit: true,
};

export const getWebhookConfig = (): WebhookConfig => webhookCache;

export const refreshWebhookConfig = async (): Promise<WebhookConfig> => {
  try {
    const res = await fetch('/api/integrations', { headers: adminHeaders() });
    if (res.ok) {
      webhookCache = { ...webhookCache, ...(await res.json()) };
      window.dispatchEvent(new Event('seiu_leads_updated'));
    }
  } catch {}
  return webhookCache;
};

export const saveWebhookConfig = async (cfg: WebhookConfig): Promise<void> => {
  webhookCache = cfg;
  try {
    await fetch('/api/integrations', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(cfg),
    });
  } catch (e) {
    console.warn('Không lưu được cấu hình kết nối:', e);
  }
};

// Gửi lại các form bị kẹt khi có mạng trở lại
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { flushPendingLeads(); });
  setTimeout(() => { flushPendingLeads(); }, 3000);
}
