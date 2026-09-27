import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  PhoneCall, 
  Send, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Gift,
  Building2,
  Headphones
} from 'lucide-react';
import { saveLead } from '../services/leadService';
import { getStoredSiteConfig } from '../services/siteConfigService';

interface ConsultationSectionProps {
  initialTopic?: string;
}

export const ConsultationSection: React.FC<ConsultationSectionProps> = ({ initialTopic }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [interestedProgram, setInterestedProgram] = useState(initialTopic || 'Du học Hàn Quốc Visa D4-1');
  const [city, setCity] = useState('Vị Thanh, Hậu Giang');
  const [intakeYear, setIntakeYear] = useState('Kỳ Tháng 9/2026');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [siteConfig, setSiteConfig] = useState(getStoredSiteConfig());

  useEffect(() => {
    const handleConfigUpdate = () => setSiteConfig(getStoredSiteConfig());
    window.addEventListener('seiu_site_config_updated', handleConfigUpdate);
    return () => window.removeEventListener('seiu_site_config_updated', handleConfigUpdate);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const savedLead = await saveLead({
        fullName,
        phone,
        email,
        interestedProgram,
        city,
        intakeYear,
        notes,
        source: 'Form Tư Vấn Trang Chủ',
      });

      if (savedLead.pending) throw new Error('Lead is waiting for server sync');

      setIsSubmitted(true);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Safe fallback
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError('Chưa thể gửi thông tin. Bạn vui lòng gọi hoặc nhắn Zalo để được hỗ trợ ngay.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="consultation" className="py-16 sm:py-24 bg-radial from-red-950/20 via-stone-900 to-stone-950 text-white relative overflow-hidden">
      {/* Decorative red glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Value Prop */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="inline-flex items-center gap-2 border-l-2 border-red-500 pl-3 text-xs font-black uppercase tracking-[0.16em] text-red-400">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span>Tư Vấn Miễn Phí 1-1 Cùng Chuyên Gia</span>
            </div>

            <h2 className="k1-display text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              Khởi Đầu Ước Mơ <br />
              <span className="text-red-500">Du Học Hàn Quốc</span> Hôm Nay
            </h2>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Điền thông tin để nhận lộ trình học tiếng Hàn hoặc du học phù hợp với học lực, tài chính và kỳ nhập học dự kiến của bạn.
            </p>

            {/* Benefit Bullets */}
            <div className="space-y-3 pt-2">
              {[
                'Phân tích học bạ và các điểm cần cải thiện trước khi nộp hồ sơ',
                'Tư vấn chọn trường ĐH phù hợp với năng lực tài chính gia đình',
                'Lộ trình tiếng Hàn theo đúng mục tiêu TOPIK hoặc phỏng vấn',
                'Giải thích rõ từng khoản phí và mốc thanh toán trước khi đăng ký'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Direct Hotline Box */}
            <div className="flex flex-col justify-between gap-4 border border-stone-700/80 bg-stone-800/80 p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center bg-red-700 text-white">
                  <Headphones className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-stone-400">Hotline & Zalo tư vấn:</div>
                  <a href={`tel:${siteConfig.hotline}`} className="text-lg font-black text-white hover:text-red-400 transition-colors">
                    {siteConfig.hotlineFormatted}
                  </a>
                </div>
              </div>

              <div className="text-xs text-stone-400 sm:text-right">
                <div>Email tuyển sinh:</div>
                <strong className="text-stone-200">{siteConfig.email}</strong>
              </div>
            </div>

          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-6">
            <div className="relative border-t-4 border-red-700 bg-white p-6 text-stone-900 shadow-2xl sm:p-8">
              
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="border-b border-stone-100 pb-3 mb-2">
                    <h3 className="text-xl font-bold font-heading text-stone-900">
                      Đăng Ký Tư Vấn & Nhận Học Bổng
                    </h3>
                    <p className="text-xs text-stone-500">SEIU sẽ liên hệ lại trong giờ làm việc gần nhất</p>
                  </div>

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                        Họ và tên học viên *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Nguyễn Văn An"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-semibold text-red-700">
                      {submitError}
                    </div>
                  )}

                  {/* Program Selection */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                      Chương trình bạn quan tâm
                    </label>
                    <select
                      value={interestedProgram}
                      onChange={(e) => setInterestedProgram(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Du học Hàn Quốc Visa D4-1">Du học Tiếng Hàn (Visa D4-1)</option>
                      <option value="Du học Đại học D2-2">Du học Đại học Chuyên ngành (Visa D2-2)</option>
                      <option value="Du học Thạc sĩ D2-3">Du học Thạc sĩ / Tiến sĩ</option>
                      <option value="Khóa học tiếng Hàn Sơ Cấp">Khóa học tiếng Hàn Sơ Cấp 1 & 2</option>
                      <option value="Luyện thi TOPIK II">Khóa luyện thi TOPIK II (Cấp 3-6)</option>
                      <option value="Du học Nghề D4-6">Du học Nghề & Chuyển đổi Visa E7 định cư</option>
                    </select>
                  </div>

                  {/* City & Intake */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                        Tỉnh/Thành phố sinh sống
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="Vị Thanh, Hậu Giang">Vị Thanh, Hậu Giang</option>
                        <option value="Hậu Giang lân cận">Khu vực Hậu Giang lân cận</option>
                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Miền Tây">Tỉnh thành khác tại Miền Tây</option>
                        <option value="Khác">Tỉnh thành khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                        Kỳ du học dự kiến
                      </label>
                      <select
                        value={intakeYear}
                        onChange={(e) => setIntakeYear(e.target.value)}
                        className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="Kỳ Tháng 6/2026">Kỳ Tháng 6/2026 (Đang nhận HS)</option>
                        <option value="Kỳ Tháng 9/2026">Kỳ Tháng 9/2026 (Kỳ Thu)</option>
                        <option value="Kỳ Tháng 12/2026">Kỳ Tháng 12/2026 (Kỳ Đông)</option>
                        <option value="Kỳ Tháng 3/2027">Kỳ Tháng 3/2027 (Kỳ Xuân)</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes / GPA */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                      Ghi chú thêm (Điểm GPA, năm sinh, câu hỏi...)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ví dụ: GPA 7.5, sinh năm 2006, muốn tìm trường học phí rẻ tại Busan..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>Gửi Đăng Ký & Nhận Ưu Đãi 500.000đ</span>
                  </button>

                  <p className="text-[11px] text-center text-stone-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                    Thông tin hoàn toàn bảo mật theo chính sách quyền riêng tư SEIU
                  </p>

                </form>
              ) : (
                /* Success screen */
                <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-stone-900 font-heading">
                    Đăng Ký Thành Công!
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                    Cảm ơn bạn <strong>{fullName}</strong>. Chuyên viên tư vấn du học SEIU sẽ liên hệ qua số điện thoại <strong>{phone}</strong> trong ít phút để gửi lộ trình chi tiết.
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-800 space-y-1">
                    <div className="font-bold flex items-center justify-center gap-1.5">
                      <Gift className="w-4 h-4 text-red-600" />
                      <span>Đã kích hoạt Voucher Học Bổng 500.000đ</span>
                    </div>
                    <p>Mã ưu đãi đã được lưu vào hệ thống cùng số điện thoại của bạn.</p>
                  </div>

                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs font-semibold text-stone-500 hover:text-stone-900 underline pt-2"
                  >
                    Đăng ký cho bạn bè hoặc chương trình khác
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
