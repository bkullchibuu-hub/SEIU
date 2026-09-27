import React, { useState } from 'react';
import { Calculator, DollarSign, Sparkles, ArrowRight, ShieldCheck, PieChart, Info } from 'lucide-react';

interface CostCalculatorProps {
  onGetQuote: (breakdownText: string) => void;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({ onGetQuote }) => {
  const [program, setProgram] = useState<'d4' | 'd2' | 'd2_master'>('d4');
  const [region, setRegion] = useState<'seoul' | 'outside'>('seoul');
  const [housing, setHousing] = useState<'dorm' | 'gosiwon' | 'oneroom'>('dorm');
  const [scholarshipPercent, setScholarshipPercent] = useState<number>(0);

  // Exchange rate: 1 KRW ≈ 18.5 VND
  const KRW_RATE = 18.5;

  // Base tuition per year (in VND)
  const baseTuitionMap = {
    d4: region === 'seoul' ? 100000000 : 75000000, // 5.5M - 4.2M KRW / year
    d2: region === 'seoul' ? 120000000 : 85000000,
    d2_master: region === 'seoul' ? 140000000 : 95000000,
  };

  // Housing cost per 6 months (in VND)
  const housingMap = {
    dorm: region === 'seoul' ? 26000000 : 16000000,
    gosiwon: region === 'seoul' ? 32000000 : 22000000,
    oneroom: region === 'seoul' ? 45000000 : 30000000,
  };

  // Insurance + Admin + Books + Visa Application + Flight (in VND)
  const fixedServiceCost = 28000000; // Phí xử lý hồ sơ, dịch thuật công chứng, visa, vé máy bay 1 chiều
  const insuranceAndBooks = 12000000; // Bảo hiểm y tế quốc dân Hàn Quốc + giáo trình

  // Living expenses for 6 months
  const livingCost6Months = region === 'seoul' ? 36000000 : 24000000;

  // Calculated values
  const grossTuition = baseTuitionMap[program];
  const scholarshipDiscount = (grossTuition * scholarshipPercent) / 100;
  const netTuition = grossTuition - scholarshipDiscount;
  const housingCost = housingMap[housing];

  // Total Year 1 Initial Preparation Budget (VND)
  const totalCost = netTuition + housingCost + fixedServiceCost + insuranceAndBooks + livingCost6Months;
  const totalKRW = Math.round(totalCost / KRW_RATE);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' VNĐ';
  };

  const handleExportQuote = () => {
    const summary = `Bảng dự toán chi phí (${program.toUpperCase()}, Khu vực: ${region === 'seoul' ? 'Seoul' : 'Ngoài Seoul'}, Học bổng: ${scholarshipPercent}%): Tổng chi phí ước tính ~ ${formatVND(totalCost)}`;
    onGetQuote(summary);
  };

  return (
    <section id="cost-calculator" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>Công Cụ Minh Bạch Tài Chính</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading tracking-tight">
            Bảng Dự Toán Chi Phí Du Học Hàn Quốc <span className="text-red-600">Chuẩn Xác 2026</span>
          </h2>
          <p className="text-base text-stone-600 mt-3">
            Tự động tính toán tổng ngân sách cần chuẩn bị năm đầu tiên gồm học phí, ký túc xá, sinh hoạt phí và khấu trừ học bổng.
          </p>
        </div>

        {/* Interactive Calculator Body */}
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Controls Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Program Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  1. Chọn Hệ Du Học:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'd4', title: 'Du học Tiếng D4-1', sub: '1 năm học phí' },
                    { id: 'd2', title: 'Đại học D2-2', sub: 'Cử nhân 4 năm' },
                    { id: 'd2_master', title: 'Thạc sĩ D2-3', sub: 'Học bổng cao' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProgram(p.id as any)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        program === p.id
                          ? 'border-red-600 bg-white shadow-sm ring-2 ring-red-500/20'
                          : 'border-stone-200 bg-white/70 hover:bg-white text-stone-700'
                      }`}
                    >
                      <div className={`text-xs font-bold ${program === p.id ? 'text-red-600' : 'text-stone-900'}`}>
                        {p.title}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Region Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  2. Khu Vực Du Học:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegion('seoul')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      region === 'seoul'
                        ? 'border-red-600 bg-white shadow-sm ring-2 ring-red-500/20'
                        : 'border-stone-200 bg-white/70 hover:bg-white text-stone-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-stone-900">Thủ Đô Seoul</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">Sầm uất, nhiều việc làm thêm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegion('outside')}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      region === 'outside'
                        ? 'border-red-600 bg-white shadow-sm ring-2 ring-red-500/20'
                        : 'border-stone-200 bg-white/70 hover:bg-white text-stone-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-stone-900">Busan / Daegu / Khác</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">Chi phí rẻ hơn 30% - 40%</div>
                  </button>
                </div>
              </div>

              {/* Housing Option */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  3. Hình Thức Nhà Ở (Ước tính 6 tháng đầu):
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'dorm', title: 'Ký Túc Xá Trường', sub: 'An toàn, tiết kiệm' },
                    { id: 'gosiwon', title: 'Phòng Gosiwon', sub: 'Phòng đơn riêng' },
                    { id: 'oneroom', title: 'One-room Mini', sub: 'Đầy đủ bếp riêng' },
                  ].map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setHousing(h.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        housing === h.id
                          ? 'border-red-600 bg-white shadow-sm ring-2 ring-red-500/20'
                          : 'border-stone-200 bg-white/70 hover:bg-white text-stone-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-stone-900">{h.title}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{h.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scholarship Slider */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Mức Học Bổng Dự Kiến Đạt Được:</span>
                  </label>
                  <span className="text-sm font-extrabold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-lg">
                    Giảm {scholarshipPercent}% Học Phí
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={scholarshipPercent}
                  onChange={(e) => setScholarshipPercent(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer h-2 bg-stone-200 rounded-lg appearance-none"
                />

                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>0% (Chưa có tiếng)</span>
                  <span>30% (TOPIK 3)</span>
                  <span>50% (TOPIK 4)</span>
                  <span>100% (TOPIK 5-6 / GKS)</span>
                </div>
              </div>

            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-md flex flex-col justify-between space-y-6">
              
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-red-600" />
                    Bóc Tách Chi Phí Chi Tiết
                  </h3>
                  <span className="text-[11px] text-stone-400">Tỷ giá: 1 KRW ≈ 18.5 VNĐ</span>
                </div>

                {/* Line items */}
                <div className="space-y-3 text-xs sm:text-sm">
                  
                  <div className="flex justify-between text-stone-700">
                    <span className="text-stone-500">1. Học phí 1 năm gốc:</span>
                    <span>{formatVND(grossTuition)}</span>
                  </div>

                  {scholarshipPercent > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                      <span>🎉 Học bổng giảm ({scholarshipPercent}%):</span>
                      <span>-{formatVND(scholarshipDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-700">
                    <span className="text-stone-500">2. Nhà ở / KTX (6 tháng đầu):</span>
                    <span>{formatVND(housingCost)}</span>
                  </div>

                  <div className="flex justify-between text-stone-700">
                    <span className="text-stone-500">3. Hồ sơ visa, dịch thuật, vé bay:</span>
                    <span>{formatVND(fixedServiceCost)}</span>
                  </div>

                  <div className="flex justify-between text-stone-700">
                    <span className="text-stone-500">4. Bảo hiểm y tế quốc dân + Sách:</span>
                    <span>{formatVND(insuranceAndBooks)}</span>
                  </div>

                  <div className="flex justify-between text-stone-700">
                    <span className="text-stone-500">5. Ăn uống sinh hoạt (6 tháng):</span>
                    <span>{formatVND(livingCost6Months)}</span>
                  </div>

                </div>
              </div>

              {/* Total Box */}
              <div className="bg-stone-900 text-white rounded-2xl p-5 space-y-2">
                <div className="text-xs text-stone-400">Tổng kinh phí trọn gói năm đầu (ước tính):</div>
                <div className="text-2xl sm:text-3xl font-black text-red-400 font-heading">
                  {formatVND(totalCost)}
                </div>
                <div className="text-xs text-stone-300">
                  Tương đương: <strong>~{new Intl.NumberFormat('ko-KR').format(totalKRW)} KRW</strong>
                </div>
                <p className="text-[11px] text-stone-400 pt-2 border-t border-stone-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Thu nhập làm thêm phụ thuộc khu vực, thời gian học, năng lực tiếng Hàn và quy định visa; không nên dùng làm nguồn tài chính duy nhất.
                </p>
              </div>

              {/* CTA button */}
              <button
                onClick={handleExportQuote}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>Nhận Bảng Báo Giá Chi Tiết Theo Hồ Sơ Của Bạn</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
