import React, { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, GraduationCap, MapPin, Users } from 'lucide-react';
import { getStoredSiteConfig, SiteConfig } from '../services/siteConfigService';

interface Props {
  onOpenConsultation: (topic?: string) => void;
}

export const AdmissionBoard: React.FC<Props> = ({ onOpenConsultation }) => {
  const [config, setConfig] = useState<SiteConfig>(getStoredSiteConfig());

  useEffect(() => {
    const refresh = () => setConfig(getStoredSiteConfig());
    window.addEventListener('seiu_site_config_updated', refresh);
    return () => window.removeEventListener('seiu_site_config_updated', refresh);
  }, []);

  if (config.admissionEnabled === false) return null;

  return (
    <div className="my-14 overflow-hidden border border-stone-300 bg-stone-950 text-white" id="admission-board">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative min-h-[430px] overflow-hidden bg-[#edf5ff]">
          {config.admissionImage ? <img src={config.admissionImage} alt={config.admissionImageAlt || config.admissionTitle} className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-rose-100" />}
          <div className="absolute inset-x-5 bottom-5 bg-white/95 p-5 text-[#14213d] shadow-xl backdrop-blur-sm sm:inset-x-7 sm:bottom-7 sm:p-6">
            <span className="inline-flex rounded-full bg-[#e23b43] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-white">{config.admissionBadge}</span>
            <h3 className="mt-3 text-xl font-black leading-tight sm:text-2xl">{config.admissionTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{config.admissionDescription}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center bg-white p-6 text-stone-900 sm:p-9">
          <div className="mb-6 flex items-center gap-2 border-b border-stone-200 pb-4 text-xs font-black uppercase tracking-[0.16em] text-[#153a70]"><GraduationCap className="h-4 w-4" /> Admissions / Thông tin chiêu sinh</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border-l-2 border-red-700 bg-stone-50 p-4"><CalendarDays className="h-5 w-5 text-red-700" /><div className="mt-2 text-[11px] font-bold uppercase text-stone-400">Khai giảng</div><div className="mt-0.5 text-sm font-black">{config.admissionOpeningDate}</div></div>
            <div className="border-l-2 border-red-700 bg-stone-50 p-4"><Clock3 className="h-5 w-5 text-red-700" /><div className="mt-2 text-[11px] font-bold uppercase text-stone-400">Lịch học</div><div className="mt-0.5 text-sm font-black">{config.admissionSchedule}</div></div>
            <div className="border-l-2 border-red-700 bg-stone-50 p-4"><Users className="h-5 w-5 text-red-700" /><div className="mt-2 text-[11px] font-bold uppercase text-stone-400">Đối tượng</div><div className="mt-0.5 text-sm font-black">{config.admissionAudience}</div></div>
            <div className="border-l-2 border-red-700 bg-stone-50 p-4"><MapPin className="h-5 w-5 text-red-700" /><div className="mt-2 text-[11px] font-bold uppercase text-stone-400">Địa điểm</div><div className="mt-0.5 text-sm font-black">{config.admissionLocation}</div></div>
          </div>
          <div className="mt-4 flex flex-col gap-3 border border-red-100 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="text-xs font-bold text-red-700">{config.admissionSeats}</div><div className="mt-0.5 text-xl font-black text-stone-950">{config.admissionTuition}</div></div>
            <button type="button" onClick={() => onOpenConsultation(`Đăng ký chiêu sinh: ${config.admissionTitle}`)} className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#e23b43] px-5 py-3 text-sm font-black text-white hover:bg-[#c52833]">Đăng ký tư vấn <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};
