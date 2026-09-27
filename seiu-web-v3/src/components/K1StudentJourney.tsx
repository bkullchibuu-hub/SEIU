import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onOpenConsultation: (topic?: string) => void;
}

const steps = [
  ['01', 'Đánh giá đầu vào', 'Xác định nền tảng tiếng Hàn, mục tiêu TOPIK hoặc kỳ nhập học.'],
  ['02', 'Thiết kế lộ trình', 'Chọn chương trình, lịch học và mốc kiểm tra phù hợp với từng học viên.'],
  ['03', 'Học & kiểm tra', 'Giáo viên sửa trực tiếp; hệ thống bài tập hỗ trợ luyện thêm ngoài lớp.'],
  ['04', 'Sẵn sàng mục tiêu', 'Ôn thi, luyện phỏng vấn và rà soát kế hoạch trước các cột mốc quan trọng.'],
];

export const K1StudentJourney: React.FC<Props> = ({ onOpenConsultation }) => (
  <section className="k1-journey k2-journey overflow-hidden bg-[#edf5ff] py-20 lg:py-28" id="k1-journey">
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <div className="k2-label"><span>LEARNING JOURNEY</span><span>학습 여정</span></div>
          <h2 className="k1-display mt-5 text-4xl font-black leading-tight text-[#14213d] sm:text-5xl">Mỗi bước học đều có<br /><span className="text-[#e23b43]">một mục tiêu rõ ràng.</span></h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">Từ kiểm tra đầu vào đến khi sẵn sàng cho TOPIK, phỏng vấn hoặc hành trình du học.</p>
        </div>
        <button type="button" onClick={() => onOpenConsultation('Tư vấn lộ trình SEIU Korea Style')} className="inline-flex items-center gap-2 self-start rounded-full bg-[#153a70] px-6 py-3.5 text-sm font-black text-white hover:bg-[#0f2b55]">
          Nhận lộ trình cá nhân <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <ol className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(([no, title, description], index) => (
            <li key={no} data-motion-card className="k2-step group relative min-h-[270px] overflow-hidden rounded-[24px] border border-blue-100 bg-white p-7 shadow-[0_18px_50px_-34px_rgba(21,58,112,.35)]">
              <span className="absolute -right-3 -top-6 font-mono text-[88px] font-black leading-none text-[#153a70]/[0.05]">{no}</span>
              <span className="font-mono text-[11px] font-black tracking-[0.18em] text-[#e23b43]">STEP {no}</span>
              <div className="mt-12">
                <h3 className="text-xl font-black text-[#14213d] sm:text-2xl">{title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
                <CheckCircle2 className={`mt-6 h-5 w-5 text-[#153a70] transition-transform duration-500 group-hover:rotate-[360deg] ${index === steps.length - 1 ? 'opacity-100' : 'opacity-60'}`} />
              </div>
              {index < steps.length - 1 && <ArrowRight className="absolute bottom-7 right-7 h-5 w-5 text-blue-200 transition-transform group-hover:translate-x-1" />}
            </li>
          ))}
      </ol>
    </div>
  </section>
);
