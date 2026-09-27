import React, { useState } from 'react';
import { STUDY_ABROAD_PROGRAMS } from '../data/mockData';
import { StudyAbroadProgram } from '../types';
import { 
  Plane, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  Award, 
  ChevronRight, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface StudyAbroadSectionProps {
  onOpenConsultation: (programName: string) => void;
  onOpenScholarshipCheck: () => void;
}

export const StudyAbroadSection: React.FC<StudyAbroadSectionProps> = ({
  onOpenConsultation,
  onOpenScholarshipCheck,
}) => {
  const [activeTab, setActiveTab] = useState<string>(STUDY_ABROAD_PROGRAMS[0].id);

  const currentProgram = STUDY_ABROAD_PROGRAMS.find((p) => p.id === activeTab) || STUDY_ABROAD_PROGRAMS[0];

  return (
    <section id="study-abroad" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Plane className="w-3.5 h-3.5" />
            <span>Lộ Trình Du Học Hàn Quốc 2026</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading tracking-tight">
            Chương Trình Du Học Toàn Diện Cùng <span className="text-red-600">SEIU</span>
          </h2>
          <p className="text-base text-stone-600 mt-3">
            Lựa chọn hệ du học phù hợp nhất với năng lực và mục tiêu tương lai của bạn. SEIU hỗ trợ hồ sơ visa thẳng, săn học bổng và đưa đón tận nơi.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {STUDY_ABROAD_PROGRAMS.map((program) => {
            const isSelected = program.id === activeTab;
            return (
              <button
                key={program.id}
                onClick={() => setActiveTab(program.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-red-600 bg-red-50/50 shadow-md shadow-red-600/10'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-0 right-0 w-2 h-full bg-red-600" />
                )}
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                    isSelected ? 'text-red-600' : 'text-stone-500'
                  }`}>
                    {program.visaCode}
                  </span>
                  <h3 className={`text-sm sm:text-base font-bold font-heading line-clamp-1 ${
                    isSelected ? 'text-stone-900' : 'text-stone-700'
                  }`}>
                    {program.title.split('(')[0]}
                  </h3>
                </div>
                <span className={`text-[11px] mt-2 inline-block font-semibold ${
                  isSelected ? 'text-red-700 font-bold' : 'text-stone-500'
                }`}>
                  {program.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Detailed View */}
        <div className="bg-stone-50/70 border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left Col: Info & Requirements */}
            <div className="lg:col-span-7 space-y-6">
              
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider mb-2">
                  <span>Visa {currentProgram.visaCode}</span>
                  <span>•</span>
                  <span>{currentProgram.badge}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
                  {currentProgram.title}
                </h3>
                <p className="text-stone-600 text-sm sm:text-base mt-2 leading-relaxed">
                  {currentProgram.shortDesc}
                </p>
              </div>

              {/* Requirements Box */}
              <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-600" />
                  Điều Kiện Ứng Tuyển Cơ Bản
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
                  <div className="p-2.5 bg-stone-50 rounded-xl">
                    <span className="text-stone-500 block">Học lực (GPA):</span>
                    <strong className="text-stone-900 text-sm">{currentProgram.requirements.gpa}</strong>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl">
                    <span className="text-stone-500 block">Độ tuổi:</span>
                    <strong className="text-stone-900 text-sm">{currentProgram.requirements.age}</strong>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl">
                    <span className="text-stone-500 block">Trình độ tiếng:</span>
                    <strong className="text-stone-900 text-sm">{currentProgram.requirements.koreanLevel}</strong>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl">
                    <span className="text-stone-500 block">Tài chính:</span>
                    <strong className="text-stone-900 text-sm">{currentProgram.requirements.finance}</strong>
                  </div>
                </div>
              </div>

              {/* Program Benefits */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Quyền Lợi & Cơ Hội Nổi Bật
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {currentProgram.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 bg-white p-3 rounded-xl border border-stone-100">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Col: Timeline & Estimated Budget */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              
              {/* Process Step Timeline */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  Quy Trình 4 Bước Tại SEIU
                </h4>

                <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-red-100">
                  {currentProgram.timeline.map((item) => (
                    <div key={item.step} className="flex items-start gap-3 relative z-10">
                      <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {item.step}
                      </div>
                      <div className="text-xs">
                        <div className="font-bold text-stone-900 text-sm">{item.title}</div>
                        <p className="text-stone-500 leading-snug mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimated Budget Card */}
              <div className="bg-stone-900 text-white rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
                    <DollarSign className="w-4 h-4" />
                    <span>Dự Toán Chi Phí & Học Bổng</span>
                  </div>
                  <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                    Trọn Gói
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-stone-400">Chi phí dự tính trung bình:</div>
                  <div className="text-lg font-bold text-white leading-snug">
                    {currentProgram.averageCost}
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 pt-1">
                    <Award className="w-4 h-4" />
                    <span>Học bổng: {currentProgram.scholarshipRate}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => onOpenConsultation(currentProgram.title)}
                    className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-2"
                  >
                    <span>Nhận Lộ Trình Visa {currentProgram.visaCode} Miễn Phí</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onOpenScholarshipCheck}
                    className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kiểm Tra Điều Kiện Học Bổng 100%</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
