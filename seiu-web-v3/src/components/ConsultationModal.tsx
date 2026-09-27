import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Send, CheckCircle2, ShieldCheck, Gift, PhoneCall, Sparkles } from 'lucide-react';
import { saveLead } from '../services/leadService';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  defaultTopic = '',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState(defaultTopic || 'Tư vấn du học trọn gói');
  const [isDone, setIsDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (defaultTopic) {
      setTopic(defaultTopic);
    }
  }, [defaultTopic]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const savedLead = await saveLead({
        fullName: name,
        phone: phone,
        interestedProgram: topic,
        source: 'Popup Đăng Ký Nhanh',
      });

      if (savedLead.pending) throw new Error('Lead is waiting for server sync');

      setIsDone(true);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    } catch (err) {
      console.error(err);
      setSubmitError('Chưa thể gửi thông tin. Bạn vui lòng gọi 0972 249 450 hoặc nhắn Zalo để được hỗ trợ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsDone(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-base font-heading">
              Đăng Ký Nhận Lộ Trình & Học Bổng
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!isDone ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <p className="text-xs text-stone-600">
                SEIU sẽ liên hệ hỗ trợ bạn trong giờ làm việc gần nhất.
              </p>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Họ và tên của bạn *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Thảo Vy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Số điện thoại / Zalo *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0972249450"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Chương trình quan tâm
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-stone-800"
                />
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2 text-xs text-red-800 font-semibold">
                <Gift className="w-4 h-4 text-red-600 shrink-0" />
                <span>Nhận ngay Voucher học bổng 500k khi hoàn tất đăng ký</span>
              </div>

              {submitError && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-semibold text-red-700">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Gửi Thông Tin Ngay</span>
              </button>

              <div className="text-[11px] text-stone-400 text-center flex items-center justify-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Thông tin chỉ dùng để SEIU liên hệ tư vấn</span>
              </div>

            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 font-heading">
                Đăng Ký Thành Công!
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Cảm ơn <strong>{name}</strong>! SEIU đã tiếp nhận thông tin và sẽ gọi cho bạn qua số <strong>{phone}</strong> trong ít phút.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
