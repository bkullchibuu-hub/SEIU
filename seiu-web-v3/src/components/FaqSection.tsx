import React, { useState } from 'react';
import { FAQS_DATA } from '../data/mockData';
import { HelpCircle, ChevronDown, PhoneCall, MessageSquare } from 'lucide-react';

interface FaqSectionProps {
  onOpenConsultation: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenConsultation }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="k1-eyebrow mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>QUESTIONS & ANSWERS</span><span>자주 묻는 질문</span>
          </div>
          <h2 className="k1-display text-3xl font-black tracking-tight text-stone-950 sm:text-5xl">
            Câu Hỏi Thường Gặp <span className="text-red-600">(FAQ)</span>
          </h2>
          <p className="text-base text-stone-600 mt-3">
            Tổng hợp những băn khoăn phổ biến nhất của quý phụ huynh và các bạn học sinh khi tìm hiểu về du học Hàn Quốc.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQS_DATA.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`overflow-hidden border transition-all ${
                  isOpen
                    ? 'border-red-300 bg-red-50/20 shadow-sm'
                    : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50'
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className={`text-sm sm:text-base font-bold font-heading ${
                    isOpen ? 'text-red-600' : 'text-stone-900'
                  }`}>
                    {faq.question}
                  </span>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center transition-transform duration-200 ${
                    isOpen ? 'bg-red-600 text-white rotate-180' : 'bg-stone-200 text-stone-600'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-red-100/60 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-l-4 border-red-700 bg-stone-950 p-6 text-center text-white sm:flex-row sm:text-left">
          <div>
            <h4 className="text-base font-bold font-heading">Bạn có câu hỏi riêng cho trường hợp của mình?</h4>
            <p className="text-xs text-stone-400 mt-0.5">Chuyên viên SEIU luôn sẵn sàng tư vấn trực tiếp 1-1 miễn phí.</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:0972249450"
              className="flex items-center gap-1.5 border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs font-bold text-stone-200 transition-colors hover:bg-stone-700"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              <span>Gọi 0972 249 450</span>
            </a>

            <button
              onClick={onOpenConsultation}
              className="bg-red-700 px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white transition-all hover:bg-red-800"
            >
              Hỏi Chuyên Viên
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
