import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  ShieldCheck, 
  Award, 
  Plane, 
  Users, 
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  BookOpen,
  HelpCircle,
  Clock
} from 'lucide-react';
import { SeiuLogo } from './SeiuLogo';
import { getStoredSiteConfig, SiteConfig } from '../services/siteConfigService';

interface HeroProps {
  onOpenConsultation: (topic?: string) => void;
  onOpenLevelTest: () => void;
  onOpenScholarshipCheck: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenConsultation,
  onOpenLevelTest,
  onOpenScholarshipCheck,
}) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getStoredSiteConfig());

  // Quick evaluation tool in Hero
  const [quickProgram, setQuickProgram] = useState('d4-1');
  const [quickGpa, setQuickGpa] = useState('7.5');
  const [quickTarget, setQuickTarget] = useState('Du học hệ tiếng D4-1');

  useEffect(() => {
    const handleUpdate = () => setSiteConfig(getStoredSiteConfig());
    window.addEventListener('seiu_site_config_updated', handleUpdate);
    return () => window.removeEventListener('seiu_site_config_updated', handleUpdate);
  }, []);

  const handleQuickEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const summary = `Thẩm định hồ sơ nhanh: Mục tiêu ${quickTarget}, GPA ${quickGpa}, Chương trình ${quickProgram.toUpperCase()}`;
    onOpenConsultation(summary);
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-red-50/50 via-white to-stone-50 pt-8 pb-16 md:pt-12 md:pb-20 border-b border-stone-200">
      {/* Subtle decorative background gradients */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-red-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-red-50 blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading & Core Brand Value */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Top Brand Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs sm:text-sm font-bold tracking-wide border border-red-200 shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
                <span>{siteConfig.sloganVi}</span>
              </div>
              <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                {siteConfig.sloganKo}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-stone-900 tracking-tight leading-[1.15] font-heading">
              {siteConfig.heroTitle} <span className="text-red-600 underline decoration-red-300 decoration-wavy underline-offset-8">{siteConfig.heroHighlight}</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl font-normal">
              {siteConfig.heroDescription}
            </p>

            {/* Founder Credentials Badge */}
            <div className="p-3.5 bg-white border border-red-200 rounded-xl shadow-xs flex items-center gap-3.5 max-w-xl">
              {siteConfig.representativeAvatar ? (
                <img 
                  src={siteConfig.representativeAvatar} 
                  alt={siteConfig.representative} 
                  className="w-13 h-13 rounded-xl object-cover border-2 border-red-500 shadow-xs shrink-0" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-lg shrink-0">
                  TB
                </div>
              )}
              <div>
                <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <span>Trực tiếp giảng dạy: {siteConfig.representative}</span>
                  <span className="px-1.5 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded">7+ năm kinh nghiệm</span>
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {siteConfig.representativeBio || 'Tốt nghiệp ĐH chuyên ngành Hàn Quốc học • Trực tiếp giảng dạy & định hướng hồ sơ'}
                </div>
              </div>
            </div>

            {/* Trust metrics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1 pb-1 max-w-2xl" aria-label="Kết quả đào tạo SEIU">
              {[
                { value: '500+', label: 'học viên đạt TOPIK' },
                { value: '100+', label: 'học viên tại Hàn Quốc' },
                { value: '≤ 15', label: 'học viên mỗi lớp' }
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-stone-200 bg-white p-3 shadow-xs">
                  <div className="text-lg sm:text-xl font-black text-red-600">{item.value}</div>
                  <div className="mt-0.5 text-[10px] sm:text-xs leading-tight text-stone-600">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onOpenConsultation('Đăng ký tư vấn lộ trình du học và chính sách thu phí dịch vụ sau Visa')}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-600/20 active:scale-98 transition-all group"
              >
                <span>Nhận lộ trình phù hợp</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onOpenLevelTest}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-red-50 text-stone-800 hover:text-red-700 font-bold text-sm sm:text-base border border-stone-300 hover:border-red-300 shadow-xs transition-all"
              >
                <BookOpen className="w-5 h-5 text-red-600" />
                <span>Kiểm tra trình độ miễn phí</span>
              </button>
            </div>

            {/* Locations Footer Tag */}
            <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span><strong>Trụ sở:</strong> {siteConfig.headquarterAddress}, {siteConfig.headquarterCity}</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline"><strong>Cơ sở TP.HCM:</strong> {siteConfig.hcmBranchAddress}</span>
            </div>

          </div>

          {/* Right Column: Quick Profile Assessment Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xl border border-red-100 relative">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-red-600 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Đánh Giá Hồ Sơ & Lộ Trình</span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                    Thẩm Định Hồ Sơ Miễn Phí
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-black text-xs">
                  0 ĐỒNG
                </div>
              </div>

              <form onSubmit={handleQuickEstimate} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Mục tiêu mong muốn:
                  </label>
                  <select
                    value={quickTarget}
                    onChange={(e) => setQuickTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:bg-white focus:ring-2 focus:ring-red-600 outline-hidden"
                  >
                    <option value="Học tiếng Hàn giao tiếp / Sơ cấp">Học tiếng Hàn giao tiếp / Sơ cấp (3 triệu/2 tháng)</option>
                    <option value="Luyện thi TOPIK lấy chứng chỉ">Luyện thi TOPIK lấy chứng chỉ (Gói 7 triệu)</option>
                    <option value="Du học tiếng Hàn Visa D4-1 (Top 1%)">Du học tiếng Hàn Visa D4-1 (Top 1%)</option>
                    <option value="Du học Cao đẳng nghề KIT Kyungnam (Visa D2-1)">CĐ Nghề KIT Kyungnam (Visa D2-1 & E-7)</option>
                    <option value="Du học Đại học / Thạc sĩ (D2-2, D2-3)">Du học Đại học / Thạc sĩ</option>
                    <option value="Học sinh lớp 12 nhận hỗ trợ 1 năm">Học sinh lớp 12 nhận miễn phí 1 năm</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Điểm GPA cấp 3 / ĐH:
                    </label>
                    <select
                      value={quickGpa}
                      onChange={(e) => setQuickGpa(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:bg-white focus:ring-2 focus:ring-red-600 outline-hidden"
                    >
                      <option value="8.0+ (Săn học bổng 50-100%)">GPA &gt; 8.0 (Săn học bổng cao)</option>
                      <option value="7.0 - 7.9 (Visa thẳng Top 1%)">GPA 7.0 - 7.9 (Visa thẳng Top 1%)</option>
                      <option value="6.5 - 6.9 (Trường chứng nhận)">GPA 6.5 - 6.9 (Trường chứng nhận)</option>
                      <option value="6.0 - 6.4 (Du học nghề D2-1)">GPA 6.0 - 6.4 (Du học nghề D2-1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Trình độ tiếng hiện tại:
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:bg-white focus:ring-2 focus:ring-red-600 outline-hidden"
                    >
                      <option>Chưa biết gì (Từ con số 0)</option>
                      <option>Đã học bảng chữ cái Hangeul</option>
                      <option>Đã có TOPIK 1 / TOPIK 2</option>
                      <option>Đã có TOPIK 3 / TOPIK 4</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    <span>Cam kết bảo vệ phụ huynh & học viên:</span>
                  </div>
                  <p className="text-[11px] text-red-700 leading-relaxed">
                    SEIU không thu phí dịch vụ trước Visa, không ép chọn trường và giải thích minh bạch chi phí trước khi ký hợp đồng.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Gửi Thẩm Định & Nhận Lộ Trình Chi Tiết</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
