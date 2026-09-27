import React, { useState, useEffect } from 'react';
import { SeiuLogo } from './SeiuLogo';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  Heart, 
  ArrowUp,
  Settings,
  Sparkles,
  Award,
  Lock,
  Clock
} from 'lucide-react';
import { getStoredSiteConfig, SiteConfig } from '../services/siteConfigService';
import { SocialLinks } from './SocialLinks';

interface FooterProps {
  onOpenConsultation: (topic?: string) => void;
  onOpenLeadManager?: () => void;
  onOpenLogoManager?: () => void;
  onOpenAdminPanel?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenConsultation,
  onOpenLeadManager,
  onOpenLogoManager,
  onOpenAdminPanel,
}) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getStoredSiteConfig());

  useEffect(() => {
    const handleUpdate = () => setSiteConfig(getStoredSiteConfig());
    window.addEventListener('seiu_site_config_updated', handleUpdate);
    return () => window.removeEventListener('seiu_site_config_updated', handleUpdate);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-stone-200 text-stone-700 text-xs">
      {/* Top Banner Bar */}
      <div className="bg-red-600 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="text-red-100 font-bold uppercase tracking-wider text-xs mb-1 flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{siteConfig.sloganVi} – {siteConfig.sloganKo}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
              Sẵn Sàng Chinh Phục Tiếng Hàn & Du Học Cùng SEIU?
            </h3>
            <p className="text-red-100 text-xs sm:text-sm mt-1">
              Phí dịch vụ {siteConfig.serviceFeePackage} chỉ thu khi đậu Visa; không phát sinh phí dịch vụ ngoài hợp đồng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenConsultation('Đăng ký tư vấn trực tiếp từ Footer')}
              className="px-6 py-3 bg-white text-red-600 hover:bg-stone-100 font-bold rounded-xl shadow-lg transition-all text-xs"
            >
              Nhận Tư Vấn Miễn Phí 1:1
            </button>
            <a
              href={`tel:${siteConfig.hotline}`}
              className="px-5 py-3 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl border border-red-500 transition-all text-xs flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Hotline: {siteConfig.hotlineFormatted}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Company Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Brand Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <SeiuLogo size="md" variant="horizontal" />
            
            <p className="text-stone-600 leading-relaxed text-xs">
              <strong>{siteConfig.companyName}</strong> – Đào tạo tiếng Hàn, luyện TOPIK và đồng hành chuẩn bị hồ sơ du học Hàn Quốc với lộ trình rõ ràng, minh bạch.
            </p>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5 text-[11px] text-stone-600">
              <div>
                <span className="font-bold text-stone-800">Người đại diện:</span> {siteConfig.representative} ({siteConfig.representativeTitle})
              </div>
              <div>
                <span className="font-bold text-stone-800">Ngày cấp phép hoạt động:</span> {siteConfig.licenseDate}
              </div>
              <div>
                <span className="font-bold text-stone-800">Khẩu hiệu:</span> {siteConfig.sloganVi} ({siteConfig.sloganKo})
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold rounded-md border border-red-200 text-[10px]">
                Thu phí dịch vụ sau Visa
              </span>
              <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold rounded-md border border-red-200 text-[10px]">
                Phí Dịch Vụ Minh Bạch
              </span>
              <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold rounded-md border border-red-200 text-[10px]">
                Lớp mới mỗi tháng
              </span>
            </div>

            <SocialLinks config={siteConfig} />
          </div>

          {/* Contact Details & Addresses (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wider text-red-600">
              Hệ Thống Cơ Sở SEIU
            </h4>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                <span className="font-bold text-stone-900 block">1. Trụ sở khu vực Vị Thanh:</span>
                  <a href={siteConfig.googleMapsUrl || '#'} target="_blank" rel="noreferrer" className="text-stone-600 hover:text-red-600 hover:underline">{siteConfig.headquarterAddress}, {siteConfig.headquarterCity}</a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-900 block">2. Cơ sở TP. Hồ Chí Minh:</span>
                  <span className="text-stone-600">{siteConfig.hcmBranchAddress}, {siteConfig.hcmBranchCity}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <PhoneCall className="w-4 h-4 text-red-600 shrink-0" />
                <span className="text-stone-600">Hotline: <strong>{siteConfig.hotlineFormatted}</strong></span>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-stone-400 shrink-0" />
                <a href={`mailto:${siteConfig.email}`} className="text-stone-600 hover:text-red-600">Email: {siteConfig.email}</a>
              </div>

              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-stone-400 shrink-0" />
                <a href={`https://zalo.me/${siteConfig.zalo || siteConfig.hotline}`} target="_blank" rel="noreferrer" className="text-stone-600 hover:text-red-600">Zalo: {siteConfig.zalo || siteConfig.hotline}</a>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="text-stone-600">{siteConfig.workingHours}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="text-stone-600">Website: {siteConfig.website}</span>
              </div>
            </div>
          </div>

          {/* Quick Links & Programs (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wider text-red-600">
              Liên Kết Nhanh
            </h4>

            <ul className="space-y-2 text-stone-600">
              <li>
                <a href="#topik-master" className="hover:text-red-600 transition-colors">
                  • TOPIK Master – ôn thi miễn phí
                </a>
              </li>
              <li>
                <a href="#study-abroad" className="hover:text-red-600 transition-colors">
                  • Chọn trường & dự toán du học Hàn
                </a>
              </li>
              <li>
                <a href="#study-abroad" className="hover:text-red-600 transition-colors">
                  • Du học D4-1 & CĐ Nghề KIT Masan (D2-1)
                </a>
              </li>
              <li>
                <a href="#universities" className="hover:text-red-600 transition-colors">
                  • Danh bạ các trường Đại học Hàn Quốc
                </a>
              </li>
              <li>
                <a href="#cost-calculator" className="hover:text-red-600 transition-colors">
                  • Bảng tính phí trọn gói 75 triệu
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-red-600 transition-colors">
                  • Góc Thầy Bửu & Cẩm nang du học
                </a>
              </li>
            </ul>

            <div className="pt-3 border-t border-stone-200">
              <button
                onClick={() => onOpenConsultation('Đăng ký kiểm tra học bổng')}
                className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-colors text-center border border-red-200"
              >
                Nhận Đánh Giá Hồ Sơ Du Học 1:1 &rarr;
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright with discreet admin lock trigger */}
      <div className="bg-stone-50 border-t border-stone-200 py-4 px-4 text-center text-[11px] text-stone-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <span>© 2024 - 2026 {siteConfig.companyName}. Bảo lưu mọi quyền.</span>
          {onOpenAdminPanel && (
            <button
              onClick={onOpenAdminPanel}
              className="text-stone-300 hover:text-stone-500 opacity-40 hover:opacity-100 transition-all p-1 rounded"
              title="Cổng nội bộ SEIU (Yêu cầu xác thực)"
            >
              <Lock className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span>Minh bạch – Uy tín – Trách nhiệm – Đồng hành</span>
          <button
            onClick={scrollToTop}
            className="p-1.5 bg-white border border-stone-200 rounded-md hover:text-red-600 shadow-xs"
            title="Lên đầu trang"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
