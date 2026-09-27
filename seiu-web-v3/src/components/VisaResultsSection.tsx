import React, { useState, useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { getStoredVisas, VisaResultItem } from '../services/siteDataService';

export const VisaResultsSection: React.FC = () => {
  const [visas, setVisas] = useState<VisaResultItem[]>(getStoredVisas());

  useEffect(() => {
    const handleSync = () => setVisas(getStoredVisas());
    window.addEventListener('seiu_site_data_updated', handleSync);
    return () => window.removeEventListener('seiu_site_data_updated', handleSync);
  }, []);

  return (
    <section className="border-t border-stone-200 bg-white py-20 lg:py-28" id="visa-results">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="mb-12 max-w-3xl">
          <div className="k1-eyebrow mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>STUDENT JOURNEY</span><span>유학 이야기</span>
          </div>
          <h2 className="k1-display text-3xl font-black tracking-tight text-stone-950 sm:text-5xl">
            Hành Trình Từ Lớp Học Đến Hàn Quốc
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Kết quả phụ thuộc hồ sơ từng học viên và quyết định của cơ quan xét duyệt. SEIU tập trung chuẩn bị tiếng Hàn, hồ sơ và phỏng vấn thật kỹ ở từng bước.
          </p>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="border border-stone-200 bg-stone-50 p-4 text-center">
            <p className="text-2xl sm:text-3xl font-black text-red-600">100+</p>
            <p className="text-xs font-bold text-stone-700 mt-1">Học viên đang ở Hàn Quốc</p>
          </div>
          <div className="border border-stone-200 bg-stone-50 p-4 text-center">
            <p className="text-2xl sm:text-3xl font-black text-stone-900">0 VNĐ</p>
            <p className="text-xs font-bold text-stone-700 mt-1">Phí dịch vụ trước visa*</p>
          </div>
          <div className="border border-stone-200 bg-stone-50 p-4 text-center">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">Rõ Ràng</p>
            <p className="text-xs font-bold text-stone-700 mt-1">Hạng mục bao gồm / chưa gồm</p>
          </div>
          <div className="border border-stone-200 bg-stone-50 p-4 text-center">
            <p className="text-2xl sm:text-3xl font-black text-amber-600">1:1</p>
            <p className="text-xs font-bold text-stone-700 mt-1">Luyện phỏng vấn theo hồ sơ</p>
          </div>
        </div>
        <p className="-mt-7 mb-10 text-center text-[11px] text-stone-500">
          * Áp dụng theo chương trình và điều kiện ghi trong hợp đồng SEIU.
        </p>

        {/* Visa Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {visas.length === 0 && (
            <div className="md:col-span-2 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-stone-600">
              Album visa thực tế sẽ hiển thị sau khi quản trị viên tải ảnh và thông tin đã được học viên cho phép sử dụng.
            </div>
          )}
          {visas.map(item => (
            <div 
              key={item.id}
              className="flex flex-col justify-between overflow-hidden border border-stone-200 bg-white transition-all hover:border-red-700"
            >
              <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold uppercase text-emerald-400">{item.visaCode}</span>
                </div>
                <span className="text-xs text-stone-400 font-mono">{item.grantDate}</span>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.avatar} 
                      alt={item.studentName} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-red-500 shadow-sm shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="font-extrabold text-stone-900 text-base">{item.studentName}</h3>
                      <p className="text-xs text-stone-500 mt-0.5">{item.hometown} • GPA: <strong className="text-red-600 font-bold">{item.gpa}</strong></p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-red-50/70 rounded-2xl border border-red-100 space-y-1 text-xs">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <span>🎓 Trúng tuyển:</span>
                      <span className="text-red-700 font-extrabold">{item.university}</span>
                    </div>
                    <div className="text-stone-600">
                      Gói: <span className="font-semibold text-stone-800">{item.costPackage}</span>
                    </div>
                    {item.scholarship && (
                      <div className="text-emerald-700 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{item.scholarship}</span>
                      </div>
                    )}
                  </div>

                  <blockquote className="text-xs text-stone-600 italic bg-stone-50 p-3 rounded-xl border border-stone-100 leading-relaxed">
                    "{item.quote}"
                  </blockquote>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>{item.branch || 'Trung tâm SEIU'}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Xác thực ĐSQ Hàn Quốc</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
