import React from 'react';
import { ArrowLeft, PhoneCall } from 'lucide-react';
import { StudyAbroadCostPlanner } from './StudyAbroadCostPlanner';
import { getStoredSiteConfig } from '../services/siteConfigService';

interface Props {
  onBackToHome: () => void;
  onOpenConsultation: (topic?: string) => void;
}

export const StudyAbroadSubPageView: React.FC<Props> = ({
  onBackToHome,
  onOpenConsultation,
}) => {
  const config = getStoredSiteConfig();

  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-20 font-sans text-slate-900">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 py-3 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={onBackToHome}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-[#153a70] transition hover:border-[#153a70]"
            >
              <ArrowLeft className="h-4 w-4" /> Trang chủ
            </button>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-[9px] font-black uppercase tracking-[0.18em] text-[#e23b43]">SEIU Study in Korea</p>
              <p className="truncate text-sm font-black text-[#14213d]">Chọn trường & dự toán chi phí du học</p>
            </div>
          </div>
          <a href={`tel:${config.hotline}`} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#e23b43] px-4 py-2.5 text-xs font-black text-white hover:bg-[#c52833]">
            <PhoneCall className="h-4 w-4" /> <span className="hidden sm:inline">{config.hotlineFormatted}</span><span className="sm:hidden">Gọi SEIU</span>
          </a>
        </div>
      </div>

      <main className="mx-auto mt-7 max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <StudyAbroadCostPlanner onOpenConsultation={onOpenConsultation} />
      </main>
    </div>
  );
};

