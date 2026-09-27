import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Download, 
  PhoneCall, 
  MessageSquare, 
  Copy, 
  Trash2, 
  Search, 
  Filter, 
  Check, 
  ExternalLink, 
  Settings, 
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { 
  getStoredLeads, 
  updateLeadStatus, 
  deleteLead, 
  clearAllLeads, 
  exportLeadsToCsv, 
  LeadItem,
  getWebhookConfig,
  saveWebhookConfig,
  refreshLeads,
  refreshWebhookConfig,
  WebhookConfig
} from '../services/leadService';

interface LeadManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadManagerModal: React.FC<LeadManagerModalProps> = ({ isOpen, onClose }) => {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'leads' | 'settings'>('leads');
  const [webhookConfig, setWebhookConfigState] = useState<WebhookConfig>(getWebhookConfig());
  const [isSavedWebhook, setIsSavedWebhook] = useState(false);

  const loadData = () => {
    setLeads(getStoredLeads());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Tải danh sách mới nhất từ máy chủ (khách điền form ở máy khác)
      refreshLeads().then(loadData);
      refreshWebhookConfig().then(cfg => setWebhookConfigState(cfg));
    }

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('seiu_leads_updated', handleUpdate);
    return () => window.removeEventListener('seiu_leads_updated', handleUpdate);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (lead: LeadItem) => {
    const text = `Họ tên: ${lead.fullName}\nSĐT: ${lead.phone}\nChương trình: ${lead.interestedProgram}\nKỳ nhập học: ${lead.intakeYear || 'Chưa rõ'}\nKhu vực: ${lead.city || 'Chưa rõ'}\nGhi chú: ${lead.notes || 'Không'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    saveWebhookConfig(webhookConfig);
    setIsSavedWebhook(true);
    setTimeout(() => setIsSavedWebhook(false), 2500);
  };

  const filteredLeads = leads.filter((item) => {
    const matchesSearch = 
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.interestedProgram.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: LeadItem['status']) => {
    switch (status) {
      case 'new':
        return <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Mới Nhận</span>;
      case 'contacted':
        return <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Đã Liên Hệ</span>;
      case 'appointment':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Đã Hẹn Gặp</span>;
      case 'enrolled':
        return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Đã Nhập Học</span>;
      case 'cancelled':
        return <span className="bg-stone-100 text-stone-500 text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Hủy</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-heading">
                  Hộp Thư Quản Lý Khách Hàng (Leads SEIU)
                </h3>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {leads.length} liên hệ
                </span>
              </div>
              <p className="text-xs text-stone-400">Dữ liệu form đăng ký được lưu tự động và đồng bộ ngay lập tức</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView(activeView === 'leads' ? 'settings' : 'leads')}
              className={`p-2 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5 ${
                activeView === 'settings' ? 'bg-red-600 text-white' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
              title="Cấu hình Google Sheets / Email"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Cài Đặt Kết Nối</span>
            </button>

            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-2 rounded-xl hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher: LEADS LIST */}
        {activeView === 'leads' ? (
          <div className="flex-1 flex flex-col min-h-0 bg-stone-50">
            
            {/* Toolbar: Search, Filter, Export */}
            <div className="p-4 sm:p-5 bg-white border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, SĐT, chương trình..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none font-semibold text-stone-700"
                >
                  <option value="all">Tất cả trạng thái ({leads.length})</option>
                  <option value="new">Mới nhận</option>
                  <option value="contacted">Đã liên hệ</option>
                  <option value="appointment">Đã hẹn gặp</option>
                  <option value="enrolled">Đã nhập học</option>
                </select>

                {/* Export Excel Button */}
                <button
                  onClick={exportLeadsToCsv}
                  disabled={leads.length === 0}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                  title="Tải file Excel / CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xuất Excel (CSV)</span>
                </button>
              </div>

            </div>

            {/* Leads List Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-16 text-stone-400 space-y-2">
                  <Users className="w-12 h-12 mx-auto text-stone-300" />
                  <p className="text-sm font-semibold">Chưa có thông tin đăng ký nào phù hợp</p>
                  <p className="text-xs">Khi có học viên điền form ở bất kỳ đâu trên website, thông tin sẽ xuất hiện ngay tại đây!</p>
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-extrabold text-stone-900 text-base font-heading">
                          {lead.fullName}
                        </span>
                        {getStatusBadge(lead.status)}
                        <span className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(lead.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                        <span className="font-bold text-red-600 flex items-center gap-1">
                          <PhoneCall className="w-3.5 h-3.5" />
                          {lead.phone}
                        </span>
                        {lead.email && (
                          <span className="text-stone-500">{lead.email}</span>
                        )}
                        {lead.city && (
                          <span className="flex items-center gap-1 text-stone-500">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            {lead.city}
                          </span>
                        )}
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-xs space-y-1">
                        <div className="font-semibold text-stone-800">
                          🎯 {lead.interestedProgram}
                        </div>
                        {lead.notes && (
                          <div className="text-stone-600 italic">
                            💬 "{lead.notes}"
                          </div>
                        )}
                        {lead.source && (
                          <div className="text-[10px] text-stone-400">
                            Nguồn: {lead.source}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                      
                      {/* Status Dropdown */}
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                        className="text-xs font-semibold py-1.5 px-2.5 bg-stone-100 border border-stone-200 rounded-lg text-stone-800 focus:outline-none"
                      >
                        <option value="new">Mới nhận</option>
                        <option value="contacted">Đã liên hệ</option>
                        <option value="appointment">Đã hẹn gặp</option>
                        <option value="enrolled">Đã nhập học</option>
                        <option value="cancelled">Hủy</option>
                      </select>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {/* Call */}
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                          title="Gọi điện trực tiếp"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </a>

                        {/* Zalo Chat */}
                        <a
                          href={`https://zalo.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors text-xs font-bold"
                          title="Chat Zalo"
                        >
                          Zalo
                        </a>

                        {/* Copy details */}
                        <button
                          onClick={() => handleCopy(lead)}
                          className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                          title="Sao chép nội dung"
                        >
                          {copiedId === lead.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (confirm(`Xóa thông tin của ${lead.fullName}?`)) {
                              deleteLead(lead.id);
                            }
                          }}
                          className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Xóa liên hệ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Footer summary */}
            <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span>Đang lưu trữ an toàn trên thiết bị của bạn ({leads.length} thông tin)</span>
              {leads.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Bạn có chắc muốn xóa toàn bộ danh sách liên hệ?')) {
                      clearAllLeads();
                    }
                  }}
                  className="text-stone-400 hover:text-rose-600 text-xs"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

          </div>
        ) : (
          /* View 2: SETTINGS & WEBHOOK */
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-stone-50">
            
            <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-base font-heading">
                <Sparkles className="w-5 h-5 text-red-600" />
                <span>Kết Nối Tự Động Về Google Sheets / Telegram</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Bạn có thể thiết lập để mỗi khi có khách hàng điền form trên website, thông tin sẽ được tự động bắn thẳng về bảng tính <strong>Google Sheet</strong> hoặc nhận thông báo ngay lập tức.
              </p>

              <form onSubmit={handleSaveWebhook} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                    Google Apps Script Webhook URL (Hoặc Make / Zapier Webhook):
                  </label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={webhookConfig.googleSheetWebhookUrl}
                    onChange={(e) => setWebhookConfigState({ ...webhookConfig, googleSheetWebhookUrl: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Hệ thống sẽ gửi yêu cầu HTTP POST JSON chứa toàn bộ dữ liệu học viên vừa gửi.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                    Email nhận thông báo tuyển sinh:
                  </label>
                  <input
                    type="email"
                    placeholder="tuyensinh@seiu.edu.vn"
                    value={webhookConfig.adminEmail}
                    onChange={(e) => setWebhookConfigState({ ...webhookConfig, adminEmail: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="notifyCheck"
                    checked={webhookConfig.notifyOnSubmit}
                    onChange={(e) => setWebhookConfigState({ ...webhookConfig, notifyOnSubmit: e.target.checked })}
                    className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                  />
                  <label htmlFor="notifyCheck" className="text-xs font-semibold text-stone-700 cursor-pointer">
                    Bật tự động đồng bộ khi có form mới
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5"
                  >
                    <span>Lưu Cấu Hình Kết Nối</span>
                  </button>

                  {isSavedWebhook && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Đã lưu thành công!
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Quick guide box */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Bạn luôn có thể xem trực tiếp và xuất file Excel ngay tại đây:</span>
              </div>
              <p>
                Dù chưa cài Google Sheets, mọi khách hàng điền form luôn được lưu trữ an toàn trong Hộp thư Leads của website. Bạn có thể mở mục <strong>"Quản Lý Leads"</strong> bất kỳ lúc nào để liên hệ trực tiếp hoặc bấm <strong>"Xuất Excel (CSV)"</strong> để tải toàn bộ danh sách về máy tính.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
