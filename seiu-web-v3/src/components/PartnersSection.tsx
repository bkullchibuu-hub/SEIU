import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { getStoredPartners, PartnerUniItem } from '../services/siteDataService';

interface Props {
  onOpenConsultation?: (topic?: string) => void;
}

export const PartnersSection: React.FC<Props> = ({ onOpenConsultation }) => {
  const [partners, setPartners] = useState<PartnerUniItem[]>(getStoredPartners());

  useEffect(() => {
    const handleSync = () => setPartners(getStoredPartners());
    window.addEventListener('seiu_site_data_updated', handleSync);
    return () => window.removeEventListener('seiu_site_data_updated', handleSync);
  }, []);

  return (
    <section className="border-t border-stone-200 bg-stone-50 py-20 lg:py-28" id="partners">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 max-w-3xl">
          <div className="k1-eyebrow mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>KOREAN UNIVERSITIES</span><span>대학 안내</span>
          </div>
          <h2 className="k1-display text-3xl font-black tracking-tight text-stone-950 sm:text-5xl">
            Gợi ý trường theo hồ sơ
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Danh sách dùng để tham khảo ban đầu. Tình trạng tuyển sinh, học phí, học bổng và yêu cầu visa sẽ được kiểm tra lại theo kỳ nhập học và hồ sơ cụ thể.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
              <Building2 className="mx-auto h-8 w-8 text-red-500" />
              <p className="mt-3 text-sm font-bold text-stone-800">Danh sách trường đang được rà soát theo kỳ tuyển sinh mới</p>
              <button
                onClick={() => onOpenConsultation?.('Tư vấn chọn trường theo hồ sơ cá nhân')}
                className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
              >
                Nhận danh sách phù hợp với hồ sơ
              </button>
            </div>
          )}
          {partners.map(uni => (
            <div key={uni.id} data-motion-card className="group flex flex-col justify-between border border-stone-200 bg-white p-6 transition-all hover:border-red-700">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden border border-stone-200 bg-stone-50 p-1 transition-transform duration-500 group-hover:scale-110">
                    <img 
                      src={uni.logo} 
                      alt={uni.nameVi} 
                      className="max-w-full max-h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="border-l-2 border-red-700 bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-red-700">
                    {uni.type}
                  </span>
                </div>

                <h3 className="font-extrabold text-stone-900 text-base leading-snug">
                  {uni.nameVi}
                </h3>
                <p className="text-xs font-medium text-stone-500 mt-0.5">
                  {uni.nameKr} • {uni.location}
                </p>

                <p className="mt-3 border-l-2 border-stone-300 bg-stone-50 p-3 text-xs text-stone-600">
                  {uni.highlight || uni.scholarship}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-bold">🎁 {uni.scholarship}</span>
                {onOpenConsultation && (
                  <button
                    onClick={() => onOpenConsultation(`Đăng ký tư vấn chọn trường: ${uni.nameVi}`)}
                    className="font-bold text-red-600 hover:text-red-700 underline"
                  >
                    Xem yêu cầu →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
