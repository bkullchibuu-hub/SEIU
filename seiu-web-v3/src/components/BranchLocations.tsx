import React from 'react';
import { 
  MapPin, 
  PhoneCall, 
  Clock, 
  Navigation, 
  Mail, 
  Sparkles, 
  Building2,
  CheckCircle2
} from 'lucide-react';
import { getStoredSiteConfig } from '../services/siteConfigService';

interface BranchLocationsProps {
  onOpenConsultation: (topic?: string) => void;
}

export const BranchLocations: React.FC<BranchLocationsProps> = ({
  onOpenConsultation,
}) => {
  const siteConfig = getStoredSiteConfig();

  const branches = [
    {
      id: 'vi-thanh',
      isHQ: true,
      name: 'TRỤ SỞ CHÍNH SEIU – VỊ THANH (HẬU GIANG)',
      address: siteConfig.headquarterAddress,
      city: siteConfig.headquarterCity,
      hotline: siteConfig.hotlineFormatted,
      workingHours: siteConfig.workingHours || '08:00 – 20:00, Thứ 2 đến Thứ 7',
      features: [
        'Văn phòng tiếp đón phụ huynh & thẩm định hồ sơ du học',
        'Các phòng học tiếng Hàn trang bị máy chiếu, máy lạnh, âm thanh chuẩn',
        'Phòng mô phỏng phỏng vấn Visa 1:1 cùng Thầy Lê Trí Bửu',
        'Khu vực tự học & thư viện giáo trình tiếng Hàn độc quyền'
      ],
      mapUrl: siteConfig.googleMapsUrl || 'https://maps.app.goo.gl/nvgAs4G6yGSiesw68'
    },
    {
      id: 'hcm',
      isHQ: false,
      name: 'CƠ SỞ SEIU – TP. HỒ CHÍ MINH',
      address: siteConfig.hcmBranchAddress,
      city: siteConfig.hcmBranchCity,
      hotline: siteConfig.hotlineFormatted,
      workingHours: 'Thứ 2 – Thứ 7: 08:00 - 20:30',
      features: [
        'Tiếp nhận hồ sơ du học khu vực TP.HCM & các tỉnh Đông Nam Bộ',
        'Lớp học tiếng Hàn cấp tốc & luyện phỏng vấn trực tiếp Lãnh sự quán',
        'Điểm tập kết đưa đón học viên đi khám lao & xuất cảnh sân bay Tân Sơn Nhất',
        'Gần các trường đại học Làng Đại Học Quốc Gia TP.HCM'
      ],
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=36%20%C4%90%C6%B0%E1%BB%9Dng%205%20Khu%20T%C4%90C%20Su%E1%BB%91i%20Nhum%20Linh%20Xu%C3%A2n%20TP%20HCM'
    }
  ];

  return (
    <section id="branches" className="py-16 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Hệ Thống Cơ Sở Đào Tạo & Tiếp Nhận Hồ Sơ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 font-heading">
            Cơ Sở SEIU Tại Vị Thanh & TP. Hồ Chí Minh
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Quý phụ huynh và học viên có thể đến trực tiếp văn phòng SEIU để được Thầy Lê Trí Bửu và đội ngũ tư vấn hỗ trợ chi tiết nhất.
          </p>
        </div>

        {/* 2 Branches Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {branches.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl p-6 sm:p-8 bg-white border transition-all flex flex-col justify-between ${
                b.isHQ
                  ? 'border-2 border-red-600 shadow-xl'
                  : 'border-stone-200 shadow-md hover:border-red-300'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    b.isHQ
                      ? 'bg-red-600 text-white'
                      : 'bg-stone-100 text-stone-700 border border-stone-200'
                  }`}>
                    {b.isHQ ? '★ TRỤ SỞ CHÍNH HẬU GIANG' : 'CƠ SỞ TP. HỒ CHÍ MINH'}
                  </span>
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5" />
                    {b.hotline}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 mb-3">
                  {b.name}
                </h3>

                {/* Address & Hours */}
                <div className="space-y-2.5 mb-6 text-xs text-stone-600">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="font-semibold text-stone-800 text-sm">
                      {b.address}, {b.city}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <span>{b.workingHours}</span>
                  </div>
                </div>

                {/* Facilities / Features */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 space-y-2 mb-6">
                  <div className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                    Trang thiết bị & Dịch vụ tại cơ sở:
                  </div>
                  {b.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2 text-xs text-stone-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <a
                  href={b.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-red-600" />
                  <span>Xem Chỉ Đường</span>
                </a>

                <button
                  onClick={() => onOpenConsultation(`Đăng ký tư vấn trực tiếp tại cơ sở: ${b.name}`)}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hẹn Giờ Gặp Thầy Bửu</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
