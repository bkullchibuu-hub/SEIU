import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Download,
  Trash2,
  RefreshCw,
  Phone,
  MessageSquare,
  Copy,
  Check,
  ClipboardList,
  Award,
  Link2,
  Settings2,
  Save,
  CheckCircle2
} from 'lucide-react';
import {
  getStoredLeads,
  refreshLeads,
  updateLeadStatus,
  updateLeadNotes,
  deleteLead,
  exportLeadsToCsv,
  goalLabel,
  getWebhookConfig,
  refreshWebhookConfig,
  saveWebhookConfig,
  LeadItem,
  WebhookConfig
} from '../services/leadService';
import {
  getCachedResults,
  refreshExamResults,
  deleteExamResult,
  exportResultsToCsv,
  formatDuration,
  ExamResult
} from '../services/examResultService';
import {
  deleteExamRegistration,
  ExamRegistration,
  exportExamRegistrationsToCsv,
  getCachedExamRegistrations,
  refreshExamRegistrations,
} from '../services/examRegistrationService';

const STATUS_OPTIONS: { value: LeadItem['status']; label: string; cls: string }[] = [
  { value: 'new', label: 'Mới nhận', cls: 'bg-red-100 text-red-700' },
  { value: 'contacted', label: 'Đã liên hệ', cls: 'bg-blue-100 text-blue-700' },
  { value: 'appointment', label: 'Đã hẹn tư vấn', cls: 'bg-amber-100 text-amber-800' },
  { value: 'enrolled', label: 'Đã nhập học', cls: 'bg-emerald-100 text-emerald-700' },
  { value: 'cancelled', label: 'Không phù hợp', cls: 'bg-stone-200 text-stone-600' }
];

const fmtTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return iso;
  }
};

/* ============================================================
   KHÁCH ĐĂNG KÝ TƯ VẤN
   ============================================================ */
export const AdminLeadsPanel: React.FC = () => {
  const [leads, setLeads] = useState<LeadItem[]>(getStoredLeads());
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [cfg, setCfg] = useState<WebhookConfig>(getWebhookConfig());
  const [savedCfg, setSavedCfg] = useState(false);

  const load = async () => {
    setLoading(true);
    const list = await refreshLeads();
    setLeads([...list]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    refreshWebhookConfig().then(setCfg);
    const onUpd = () => setLeads([...getStoredLeads()]);
    window.addEventListener('seiu_leads_updated', onUpd);
    return () => window.removeEventListener('seiu_leads_updated', onUpd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    return leads.filter(l => {
      const okStatus = status === 'all' || l.status === status;
      const okSearch =
        !k ||
        (l.fullName || '').toLowerCase().includes(k) ||
        (l.phone || '').includes(k) ||
        (l.interestedProgram || '').toLowerCase().includes(k) ||
        (l.source || '').toLowerCase().includes(k);
      return okStatus && okSearch;
    });
  }, [leads, q, status]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    STATUS_OPTIONS.forEach(s => (c[s.value] = leads.filter(l => l.status === s.value).length));
    return c;
  }, [leads]);

  const copyLead = (l: LeadItem) => {
    const text = `Họ tên: ${l.fullName}\nSĐT: ${l.phone}\nMục tiêu: ${goalLabel(l.goal)}\nQuan tâm: ${l.interestedProgram}\nNguồn: ${l.source || '—'}\nGhi chú: ${l.notes || '—'}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(l.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveCfg = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveWebhookConfig(cfg);
    setSavedCfg(true);
    setTimeout(() => setSavedCfg(false), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-black text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            Khách Đăng Ký Tư Vấn
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Mọi form gửi từ website đều về đây, kể cả khi khách điền trên điện thoại của họ.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={load}
            className="px-3 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-700 inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Tải lại</span>
          </button>
          <button
            onClick={() => setShowSettings(v => !v)}
            className="px-3 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-700 inline-flex items-center gap-1.5"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Kết nối Sheet / Telegram</span>
          </button>
          <button
            onClick={exportLeadsToCsv}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {showSettings && (
        <form onSubmit={handleSaveCfg} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Link Google Sheet Webhook (Apps Script)
            </label>
            <input
              type="url"
              value={cfg.googleSheetWebhookUrl}
              onChange={e => setCfg({ ...cfg, googleSheetWebhookUrl: e.target.value })}
              placeholder="https://script.google.com/macros/s/..../exec"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Mỗi khách đăng ký và mỗi bài thi nộp xong sẽ được đẩy sang Google Sheet của anh.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Telegram Bot Token</label>
              <input
                type="text"
                value={cfg.telegramBotToken || ''}
                onChange={e => setCfg({ ...cfg, telegramBotToken: e.target.value })}
                placeholder="123456:ABC-DEF..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Telegram Chat ID</label>
              <input
                type="text"
                value={cfg.telegramChatId || ''}
                onChange={e => setCfg({ ...cfg, telegramChatId: e.target.value })}
                placeholder="-1001234567890"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700">
            <input
              type="checkbox"
              checked={cfg.notifyOnSubmit}
              onChange={e => setCfg({ ...cfg, notifyOnSubmit: e.target.checked })}
            />
            <span>Báo ngay khi có khách mới</span>
          </label>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            {savedCfg ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedCfg ? 'Đã lưu' : 'Lưu kết nối'}</span>
          </button>
        </form>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-grow min-w-[200px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Tìm theo tên, số điện thoại, chương trình..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStatus('all')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${
              status === 'all' ? 'bg-stone-900 text-white' : 'bg-white border border-stone-300 text-stone-600'
            }`}
          >
            Tất cả ({counts.all})
          </button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${
                status === s.value ? 'bg-stone-900 text-white' : 'bg-white border border-stone-300 text-stone-600'
              }`}
            >
              {s.label} ({counts[s.value] || 0})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-stone-400 text-sm bg-stone-50 rounded-2xl border border-dashed border-stone-300">
          {loading ? 'Đang tải danh sách từ máy chủ…' : 'Chưa có khách nào đăng ký.'}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(l => (
            <div key={l.id} className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-stone-300 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-stone-900 text-sm">{l.fullName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        STATUS_OPTIONS.find(s => s.value === l.status)?.cls || 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {STATUS_OPTIONS.find(s => s.value === l.status)?.label || l.status}
                    </span>
                    {l.source && (
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
                        {l.source}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-600 mt-1 space-y-0.5">
                    <div className="font-mono font-bold text-stone-800">{l.phone}</div>
                    <div>{l.interestedProgram}</div>
                    {l.goal && <div className="text-stone-500">Mục tiêu: {goalLabel(l.goal)}</div>}
                    <div className="text-[11px] text-stone-400">{fmtTime(l.createdAt)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`tel:${l.phone}`}
                    className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    title="Gọi ngay"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://zalo.me/${(l.phone || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100"
                    title="Nhắn Zalo"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => copyLead(l)}
                    className="p-2 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200"
                    title="Sao chép thông tin"
                  >
                    {copiedId === l.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Xóa khách "${l.fullName}"?`)) deleteLead(l.id);
                    }}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  value={l.status}
                  onChange={e => updateLeadStatus(l.id, e.target.value as LeadItem['status'])}
                  className="px-2.5 py-1.5 text-[11px] font-bold border border-stone-300 rounded-lg bg-white"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <input
                  defaultValue={l.notes || ''}
                  onBlur={e => {
                    if (e.target.value !== (l.notes || '')) updateLeadNotes(l.id, e.target.value);
                  }}
                  placeholder="Ghi chú tư vấn..."
                  className="flex-grow min-w-[160px] px-3 py-1.5 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   ĐĂNG KÝ VÀO THI TOPIK
   ============================================================ */
export const AdminExamRegistrationsPanel: React.FC = () => {
  const [registrations, setRegistrations] = useState<ExamRegistration[]>(getCachedExamRegistrations());
  const [results, setResults] = useState<ExamResult[]>(getCachedResults());
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [registrationList, resultList] = await Promise.all([
      refreshExamRegistrations(),
      refreshExamResults(),
    ]);
    setRegistrations([...registrationList]);
    setResults([...resultList]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    const onRegistrations = () => setRegistrations([...getCachedExamRegistrations()]);
    const onResults = () => setResults([...getCachedResults()]);
    window.addEventListener('seiu_exam_registrations_updated', onRegistrations);
    window.addEventListener('seiu_exam_results_updated', onResults);
    return () => {
      window.removeEventListener('seiu_exam_registrations_updated', onRegistrations);
      window.removeEventListener('seiu_exam_results_updated', onResults);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    const resultByRegistration = new Map<string, ExamResult>();
    results.forEach(result => {
      if (!result.registrationId) return;
      const previous = resultByRegistration.get(result.registrationId);
      if (!previous || String(result.createdAt) > String(previous.createdAt)) {
        resultByRegistration.set(result.registrationId, result);
      }
    });

    return registrations.map(registration => {
      const result = resultByRegistration.get(registration.id);
      return {
        ...registration,
        status: result ? 'completed' as const : registration.status,
        completedAt: result?.createdAt || registration.completedAt,
        resultId: result?.id || registration.resultId,
        score: result?.score ?? registration.score,
        maxScore: result?.maxScore ?? registration.maxScore,
        percent: result?.percent ?? registration.percent,
      };
    });
  }, [registrations, results]);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter(item =>
      item.studentName.toLowerCase().includes(keyword) ||
      item.studentPhone.includes(keyword) ||
      item.testTitle.toLowerCase().includes(keyword)
    );
  }, [q, rows]);

  const completed = rows.filter(item => item.status === 'completed').length;
  const uniqueStudents = new Set(rows.map(item => item.studentPhone.replace(/\D/g, ''))).size;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-black text-stone-900">
            <ClipboardList className="h-5 w-5 text-red-600" />
            Đăng Ký Thi TOPIK
          </h3>
          <p className="mt-0.5 text-xs text-stone-500">
            Học viên vừa nhập tên và số điện thoại để mở đề sẽ xuất hiện ngay tại đây.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Tải lại
          </button>
          <button onClick={exportExamRegistrationsToCsv} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
            <Download className="h-3.5 w-3.5" />
            Xuất Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-3.5"><div className="text-[10px] font-bold uppercase text-stone-500">Lượt đăng ký</div><div className="text-2xl font-black text-stone-900">{rows.length}</div></div>
        <div className="rounded-2xl border border-stone-200 bg-white p-3.5"><div className="text-[10px] font-bold uppercase text-stone-500">Học viên</div><div className="text-2xl font-black text-stone-900">{uniqueStudents}</div></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5"><div className="text-[10px] font-bold uppercase text-emerald-700">Đã nộp bài</div><div className="text-2xl font-black text-emerald-700">{completed}</div></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5"><div className="text-[10px] font-bold uppercase text-amber-700">Đang làm / chưa nộp</div><div className="text-2xl font-black text-amber-700">{Math.max(0, rows.length - completed)}</div></div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input value={q} onChange={event => setQ(event.target.value)} placeholder="Tìm theo tên, số điện thoại hoặc tên đề…" className="w-full rounded-xl border border-stone-300 bg-white py-2 pl-9 pr-3 text-xs" />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center text-sm text-stone-400">
          {loading ? 'Đang tải danh sách đăng ký thi…' : 'Chưa có học viên đăng ký thi.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full min-w-[820px] text-xs">
            <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
              <tr><th className="p-3 text-left">Thời gian vào thi</th><th className="p-3 text-left">Học viên</th><th className="p-3 text-left">Mục tiêu</th><th className="p-3 text-left">Bài thi</th><th className="p-3 text-center">Trạng thái</th><th className="p-3 text-center">Kết quả</th><th className="p-3" /></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-stone-50/70">
                  <td className="whitespace-nowrap p-3 text-stone-500">{fmtTime(item.createdAt)}</td>
                  <td className="p-3"><div className="font-black text-stone-900">{item.studentName}</div><a href={`tel:${item.studentPhone}`} className="font-mono text-stone-500 hover:text-red-600">{item.studentPhone}</a></td>
                  <td className="whitespace-nowrap p-3 text-stone-600">{goalLabel(item.goal)}</td>
                  <td className="max-w-[240px] p-3 text-stone-700">{item.testTitle}</td>
                  <td className="p-3 text-center"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>{item.status === 'completed' ? 'Đã nộp bài' : 'Đang làm / chưa nộp'}</span></td>
                  <td className="whitespace-nowrap p-3 text-center">{item.status === 'completed' ? <span className="font-black text-red-600">{item.score ?? 0}/{item.maxScore ?? 0} · {item.percent ?? 0}%</span> : <span className="text-stone-400">Chưa có điểm</span>}</td>
                  <td className="p-3 text-right"><button onClick={() => { if (confirm(`Xóa đăng ký thi của ${item.studentName}?`)) void deleteExamRegistration(item.id); }} className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600" title="Xóa"><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs leading-relaxed text-blue-900">
        Mỗi lượt vào thi có một mã riêng. Khi học viên nộp bài, kết quả được ghép bằng mã này; số điện thoại tiếp tục được dùng để xếp Top 15 theo kết quả tốt nhất của từng người.
      </div>
    </div>
  );
};

/* ============================================================
   KẾT QUẢ BÀI THI CỦA HỌC VIÊN
   ============================================================ */
export const AdminExamResultsPanel: React.FC = () => {
  const [results, setResults] = useState<ExamResult[]>(getCachedResults());
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    const list = await refreshExamResults();
    setResults([...list]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const onUpd = () => setResults([...getCachedResults()]);
    window.addEventListener('seiu_exam_results_updated', onUpd);
    return () => window.removeEventListener('seiu_exam_results_updated', onUpd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return results;
    return results.filter(
      r =>
        r.studentName.toLowerCase().includes(k) ||
        r.studentPhone.includes(k) ||
        r.testTitle.toLowerCase().includes(k)
    );
  }, [results, q]);

  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + r.percent, 0) / results.length)
    : 0;
  const uniqueStudents = new Set(results.map(r => r.studentPhone)).size;
  const topStudents = useMemo(() => {
    const bestByStudent = new Map<string, ExamResult>();
    results.forEach(result => {
      const phoneKey = (result.studentPhone || '').replace(/\D/g, '');
      const key = phoneKey || result.studentName.trim().toLowerCase();
      const previous = bestByStudent.get(key);
      if (
        !previous ||
        result.percent > previous.percent ||
        (result.percent === previous.percent && String(result.createdAt) > String(previous.createdAt))
      ) {
        bestByStudent.set(key, result);
      }
    });
    return Array.from(bestByStudent.values())
      .sort((a, b) => b.percent - a.percent || (b.score ?? b.correct) - (a.score ?? a.correct) || String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 15);
  }, [results]);
  const topResult = topStudents[0];

  const copyMasterLink = () => {
    const link = `${window.location.origin}${window.location.pathname}#topik-master`;
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const scoreColor = (p: number) =>
    p >= 80 ? 'text-emerald-600' : p >= 60 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-black text-stone-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-red-600" />
            Kết Quả Bài Thi Của Học Viên
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Học viên mở link đề thi, nhập tên – số điện thoại – mục tiêu rồi làm bài; điểm về thẳng đây.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={copyMasterLink}
            className="px-3 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-700 inline-flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã chép link' : 'Link phòng thi'}</span>
          </button>
          <button
            onClick={load}
            className="px-3 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-xs font-bold text-stone-700 inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Tải lại</span>
          </button>
          <button
            onClick={exportResultsToCsv}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="p-3.5 bg-white rounded-2xl border border-stone-200">
          <div className="text-[11px] text-stone-500 font-bold uppercase">Lượt thi</div>
          <div className="text-2xl font-black text-stone-900">{results.length}</div>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-stone-200">
          <div className="text-[11px] text-stone-500 font-bold uppercase">Học viên</div>
          <div className="text-2xl font-black text-stone-900">{uniqueStudents}</div>
        </div>
        <div className="p-3.5 bg-stone-900 rounded-2xl border border-stone-900 text-white">
          <div className="text-[11px] text-stone-300 font-bold uppercase">Điểm cao nhất</div>
          <div className="text-2xl font-black text-amber-300">{topResult ? `${topResult.percent}%` : '—'}</div>
          {topResult && <div className="mt-0.5 truncate text-[10px] text-stone-300">{topResult.studentName} · {topResult.score ?? topResult.correct}/{topResult.maxScore ?? topResult.total}</div>}
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-stone-200">
          <div className="text-[11px] text-stone-500 font-bold uppercase">Điểm trung bình</div>
          <div className={`text-2xl font-black ${scoreColor(avg)}`}>{avg}%</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-amber-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-amber-100 bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            <div>
              <h4 className="text-sm font-black text-stone-900">Bảng Thành Tích</h4>
              <p className="text-[10px] text-stone-500">Top 15 học viên có kết quả cao nhất · mỗi người lấy bài tốt nhất</p>
            </div>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-amber-700 shadow-xs">{uniqueStudents} người thi</span>
        </div>
        {topStudents.length === 0 ? (
          <div className="px-4 py-7 text-center text-xs text-stone-400">Chưa có dữ liệu để xếp hạng.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[660px] text-xs">
              <thead className="bg-stone-50 text-[10px] uppercase tracking-wider text-stone-500">
                <tr>
                  <th className="w-14 px-3 py-2 text-center">Hạng</th>
                  <th className="px-3 py-2 text-left">Học viên</th>
                  <th className="px-3 py-2 text-left">Bài tốt nhất</th>
                  <th className="px-3 py-2 text-center">Kết quả</th>
                  <th className="px-3 py-2 text-right">Ngày thi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {topStudents.map((result, index) => (
                  <tr key={`${result.id}-rank`} className={index < 3 ? 'bg-amber-50/40' : ''}>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-black ${index === 0 ? 'bg-amber-400 text-stone-950' : index === 1 ? 'bg-stone-300 text-stone-800' : index === 2 ? 'bg-orange-200 text-orange-900' : 'bg-stone-100 text-stone-600'}`}>{index + 1}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-black text-stone-900">{result.studentName}</div>
                      <div className="font-mono text-[10px] text-stone-400">{result.studentPhone}</div>
                    </td>
                    <td className="max-w-[240px] px-3 py-2.5 text-stone-600">{result.testTitle}</td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <span className={`font-black ${scoreColor(result.percent)}`}>{result.percent}%</span>
                      <span className="ml-1 text-stone-400">({result.score ?? result.correct}/{result.maxScore ?? result.total})</span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-[10px] text-stone-500 whitespace-nowrap">{fmtTime(result.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Tìm theo tên học viên, số điện thoại hoặc tên đề..."
          className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-stone-400 text-sm bg-stone-50 rounded-2xl border border-dashed border-stone-300">
          {loading ? 'Đang tải kết quả từ máy chủ…' : 'Chưa có học viên nào nộp bài.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full text-xs">
            <thead className="bg-stone-50 text-stone-600 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="text-left p-3">Thời gian</th>
                <th className="text-left p-3">Học viên</th>
                <th className="text-left p-3">Mục tiêu</th>
                <th className="text-left p-3">Bài thi</th>
                <th className="text-center p-3">Điểm</th>
                <th className="text-center p-3">Thời gian làm</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-stone-50/70">
                  <td className="p-3 text-stone-500 whitespace-nowrap">{fmtTime(r.createdAt)}</td>
                  <td className="p-3">
                    <div className="font-bold text-stone-900">{r.studentName}</div>
                    <a href={`tel:${r.studentPhone}`} className="font-mono text-stone-500 hover:text-red-600">
                      {r.studentPhone}
                    </a>
                    {r.registrationId && <div className="mt-1 text-[9px] font-black uppercase tracking-wide text-emerald-600">Đã ghép đăng ký thi</div>}
                  </td>
                  <td className="p-3 text-stone-600 whitespace-nowrap">{goalLabel(r.goal)}</td>
                  <td className="p-3 text-stone-700 max-w-[220px]">{r.testTitle}</td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className={`font-black ${scoreColor(r.percent)}`}>
                      {r.score ?? r.correct}/{r.maxScore ?? r.total} điểm
                    </span>
                    <span className="text-stone-400 ml-1">· đúng {r.correct}/{r.total} ({r.percent}%)</span>
                  </td>
                  <td className="p-3 text-center font-mono text-stone-600">{formatDuration(r.durationSec)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Xóa kết quả của ${r.studentName}?`)) deleteExamResult(r.id);
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
        <Award className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Mỗi đề thi đều có nút <strong>Chia sẻ</strong> để lấy link riêng. Gửi link đó cho lớp, học viên
          không cần tài khoản — chỉ nhập tên, số điện thoại và mục tiêu là vào thi được ngay.
        </span>
      </div>
    </div>
  );
};
