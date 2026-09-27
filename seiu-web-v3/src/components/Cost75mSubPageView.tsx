import React from 'react';
import { ArrowLeft, Sparkles, CheckCircle2, CircleAlert } from 'lucide-react';
import { CostCalculator } from './CostCalculator';

interface Props {
  onBackToHome: () => void;
  onOpenConsultation: (topic?: string) => void;
}

export const Cost75mSubPageView: React.FC<Props> = ({
  onBackToHome,
  onOpenConsultation
}) => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-20">
      {/* Header Breadcrumb */}
      <div className="bg-white border-b border-stone-200 py-4 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-stone-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Trang Chủ</span>
            </button>
            <span className="text-stone-300">/</span>
            <span className="font-extrabold text-sm sm:text-base text-stone-900">
              Chi Tiết Phí Dịch Vụ 75 Triệu & Thời Điểm Thanh Toán
            </span>
          </div>

          <button
            onClick={() => onOpenConsultation('Nhận hợp đồng cam kết trọn gói 75 triệu')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nhận Bảng Báo Giá 75Tr</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid gap-4 lg:grid-cols-2 mb-6">
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="flex items-center gap-2 font-extrabold text-emerald-900">
              <CheckCircle2 className="h-5 w-5" /> Gói phí dịch vụ bao gồm
            </h2>
            <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-emerald-950 sm:grid-cols-2">
              {[
                'Phí dịch vụ đại diện hồ sơ',
                'Lệ phí xin visa tại Việt Nam',
                'Dịch thuật hồ sơ Hàn Quốc',
                'Khám sức khỏe, tem vàng & tem tím',
                'Phí KVAC, apply và lệ phí code',
                'Thư mời và hỗ trợ vé máy bay tối đa 6 triệu'
              ].map(item => <li key={item} className="flex gap-2"><span>✓</span><span>{item}</span></li>)}
            </ul>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="flex items-center gap-2 font-extrabold text-amber-950">
              <CircleAlert className="h-5 w-5" /> Chưa bao gồm
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-amber-950">
              <li>• Học phí, ký túc xá và các khoản trường Hàn Quốc thu trực tiếp.</li>
              <li>• Chi phí chứng minh tài chính hoặc số tiền đóng băng theo yêu cầu từng hồ sơ.</li>
              <li>• Khoản phát sinh ngoài hợp đồng chỉ thực hiện sau khi được học viên hoặc phụ huynh xác nhận.</li>
            </ul>
            <p className="mt-4 rounded-xl bg-white/70 p-3 text-xs font-semibold text-amber-900">
              Phí dịch vụ 75 triệu được thu sau khi học viên đậu Visa, theo đúng phạm vi và điều kiện ghi trong hợp đồng SEIU.
            </p>
          </section>
        </div>
        <CostCalculator onOpenConsultation={onOpenConsultation} />
      </div>
    </div>
  );
};
